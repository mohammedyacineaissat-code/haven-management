import { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import { ResidentProfile, ManagerProfile } from '../../types/building';
import { StoreState } from '../storeTypes';
import { toAuthPassword, cleanDigits, cleanStr, cleanApt, generateUUID } from './helpers';

export type AuthSlice = Pick<StoreState, 
  'registerResident' | 
  'loginResidentWithCredentials' | 
  'loginResident' | 
  'logoutResident' | 
  'registerManager' | 
  'loginManager' | 
  'logoutManager'
>;

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set, get, api) => ({
  registerResident: async (accountData: ResidentProfile) => {
    const cleanAptNum = accountData.aptNumber.trim();
    const cleanPhone = accountData.phone.trim();
    const cleanPwd = accountData.password?.trim() || cleanPhone;
    const joinedStr = new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

    try {
      // 1. Check if an account already exists for this building & apartment
      const { data: existing, error: errCheck } = await supabase
        .from('residents')
        .select('id')
        .eq('building_id', accountData.buildingId)
        .eq('apt_number', cleanAptNum);

      if (existing && existing.length > 0) {
        return {
          success: false,
          message: `Un compte existe déjà pour l'appartement ${cleanAptNum} dans cette résidence.`
        };
      }

      // 2. Register with Supabase Auth to ensure user is saved in Supabase Authentication -> Users
      let authUserId: string | null = null;
      try {
        const authEmail = `${cleanDigits(cleanPhone) || cleanPhone}@haven.dz`;
        const authPassword = toAuthPassword(cleanPwd);
        const { data: authData } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              first_name: accountData.firstName?.trim() || '',
              last_name: accountData.lastName.trim(),
              phone: cleanPhone,
              building_id: accountData.buildingId,
              floor: accountData.floor.trim(),
              apt_number: cleanAptNum,
              role: 'resident'
            }
          }
        });

        if (authData?.user?.id) {
          authUserId = authData.user.id;
          // Also save into public.profiles
          await supabase.from('profiles').upsert({
            id: authUserId,
            role: 'resident',
            first_name: accountData.firstName?.trim() || '',
            last_name: accountData.lastName.trim(),
            phone: cleanPhone
          });
        }
      } catch (authErr) {
        console.warn('Supabase Auth resident signUp note:', authErr);
      }

      // 3. Insert into Supabase residents table
      const insertPayload: any = {
        last_name: accountData.lastName.trim(),
        first_name: accountData.firstName?.trim() || '',
        building_id: accountData.buildingId,
        floor: accountData.floor.trim(),
        apt_number: cleanAptNum,
        phone: cleanPhone,
        joined_at: joinedStr
      };
      if (authUserId) {
        insertPayload.id = authUserId;
      }

      const { data: newRes, error: errInsert } = await supabase
        .from('residents')
        .insert(insertPayload)
        .select()
        .single();

      if (errInsert || !newRes) {
        console.error('Supabase insert error:', errInsert);
        return {
          success: false,
          message: 'Erreur lors de la création du compte sur le serveur.'
        };
      }

      // 4. Update local state
      const registeredProfile: ResidentProfile = {
        id: newRes.id,
        lastName: newRes.last_name,
        firstName: newRes.first_name,
        buildingId: newRes.building_id,
        floor: newRes.floor,
        aptNumber: newRes.apt_number,
        phone: newRes.phone,
        joinedAt: newRes.joined_at || joinedStr
      };

      const updatedAccounts = [registeredProfile, ...get().registeredAccounts];

      set({
        currentRole: 'resident',
        registeredAccounts: updatedAccounts,
        residentProfile: registeredProfile,
        userApartment: `Apt ${registeredProfile.aptNumber} (Étage ${registeredProfile.floor})`,
        residentHomeBuildingId: registeredProfile.buildingId,
        activeBuildingId: registeredProfile.buildingId
      });

      localStorage.setItem('haven_saved_resident_profile', JSON.stringify(registeredProfile));

      return { success: true };
    } catch (err: any) {
      console.error('Registration failed:', err);
      return { success: false, message: 'Erreur de connexion au serveur.' };
    }
  },
  loginResidentWithCredentials: async (buildingId: string, aptNumber: string, passwordOrPhone: string) => {
    try {
      const targetApt = cleanStr(aptNumber);
      
      const { data: residents, error } = await supabase
        .from('residents')
        .select('*')
        .eq('building_id', buildingId);

      if (error || !residents || residents.length === 0) {
        return {
          success: false,
          message: 'Aucun compte trouvé pour cette résidence.'
        };
      }

      // Find by apt number (flexible match like the local fallback)
      const account = residents.find(a => 
        cleanStr(a.apt_number) === targetApt ||
        cleanStr(`apt ${a.apt_number}`) === targetApt ||
        targetApt.endsWith(cleanStr(a.apt_number))
      );

      if (!account) {
        return {
          success: false,
          message: `Aucun compte trouvé pour l'appartement "${aptNumber}" dans cette résidence.`
        };
      }

      let isMatch = false;

      // 1. Check if it's a phone match (local fallback / fast login)
      const enteredSecretDigits = cleanDigits(passwordOrPhone);
      const enteredSecretRaw = cleanStr(passwordOrPhone);
      const accountPhoneDigits = cleanDigits(account.phone);
      
      if (
        (enteredSecretDigits.length >= 4 && accountPhoneDigits.endsWith(enteredSecretDigits)) ||
        (enteredSecretRaw === cleanStr(account.phone))
      ) {
        isMatch = true;
      }

      // 2. If not phone, try Supabase Auth (Password Login)
      if (!isMatch) {
        const authEmail = `${accountPhoneDigits || cleanStr(account.phone)}@haven.dz`;
        const { data: authData } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: toAuthPassword(passwordOrPhone.trim())
        });
        
        if (authData?.user) {
          isMatch = true;
        } else {
          // Backward compatibility for un-migrated accounts with plaintext passwords in DB
          const accountPwdRaw = account.password ? cleanStr(account.password) : null;
          if (accountPwdRaw && accountPwdRaw === enteredSecretRaw) {
            isMatch = true;
          }
        }
      }

      if (!isMatch) {
        return {
          success: false,
          message: `Mot de passe ou numéro de téléphone incorrect pour l'appartement ${account.apt_number}.`
        };
      }

      const profile: ResidentProfile = {
        id: account.id,
        lastName: account.last_name,
        firstName: account.first_name || '',
        buildingId: account.building_id,
        floor: account.floor,
        aptNumber: account.apt_number,
        phone: account.phone,
        joinedAt: account.joined_at || 'Récemment'
      };

      const currentAccounts = get().registeredAccounts.filter(
        a => !(a.buildingId === profile.buildingId && cleanApt(a.aptNumber) === cleanApt(profile.aptNumber))
      );
      const updatedAccounts = [profile, ...currentAccounts];

      set({
        currentRole: 'resident',
        residentProfile: profile,
        registeredAccounts: updatedAccounts,
        userApartment: `Apt ${profile.aptNumber} (Étage ${profile.floor})`,
        residentHomeBuildingId: profile.buildingId,
        activeBuildingId: profile.buildingId
      });

      localStorage.setItem('haven_saved_resident_profile', JSON.stringify(profile));

      return { success: true };
    } catch (err: any) {
      console.error('Login failed:', err);
      return { success: false, message: 'Erreur de connexion au serveur.' };
    }
  },

  loginResident: async (profile: ResidentProfile) => {
    set({
      currentRole: 'resident',
      residentProfile: profile,
      userApartment: `Apt ${profile.aptNumber} (Étage ${profile.floor})`,
      residentHomeBuildingId: profile.buildingId,
      activeBuildingId: profile.buildingId
    });
    try {
      localStorage.setItem('haven_saved_resident_profile', JSON.stringify(profile));
    } catch {
      // Ignore
    }
  },

  logoutResident: () => {
    supabase.auth.signOut().catch(() => {});
    const token = typeof window !== 'undefined' ? localStorage.getItem('haven_session_token') : null;
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
      localStorage.removeItem('haven_session_token');
    }
    set({ currentRole: 'resident', residentProfile: null, userApartment: '' });
    try {
      localStorage.removeItem('haven_saved_resident_profile');
    } catch {
      // Ignore
    }
  },

  registerManager: async (data: { name: string; emailOrPhone: string; password: string; agencyName?: string }) => {
    const cleanIdentifier = data.emailOrPhone.trim().toLowerCase();
    const cleanPwd = data.password.trim();
    const currentManagers = get().registeredManagers;

    // 1. Check local & existing
    const existing = currentManagers.find(m => m.emailOrPhone.trim().toLowerCase() === cleanIdentifier);
    if (existing) {
      return { success: false, message: 'Un compte avec cet identifiant existe déjà.' };
    }

    let authUserId: string | null = null;
    const authEmail = cleanIdentifier.includes('@') 
      ? cleanIdentifier 
      : `${cleanDigits(cleanIdentifier) || cleanIdentifier}@haven.dz`;
    const authPassword = toAuthPassword(cleanPwd);

    // 2. Register in Supabase Auth to ensure user is saved in Supabase Authentication -> Users
    try {
      const { data: authData } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: {
            name: data.name.trim(),
            agency_name: data.agencyName?.trim() || '',
            phone: cleanIdentifier,
            role: 'manager'
          }
        }
      });

      if (authData?.user?.id) {
        authUserId = authData.user.id;
        const nameParts = data.name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || data.name.trim();

        // Save into public.profiles
        await supabase.from('profiles').upsert({
          id: authUserId,
          role: 'manager',
          first_name: firstName,
          last_name: lastName,
          phone: cleanIdentifier
        });
      }
    } catch (authErr) {
      console.warn('Supabase Auth manager signUp note:', authErr);
    }

    const newId = authUserId || generateUUID();

    const newManager: ManagerProfile = {
      id: newId,
      name: data.name.trim(),
      emailOrPhone: cleanIdentifier,
      password: '', // Stop storing plaintext password locally
      agencyName: data.agencyName?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    const updated = [newManager, ...currentManagers.filter(m => m.emailOrPhone.trim().toLowerCase() !== cleanIdentifier)];
    set({
      currentRole: 'manager',
      registeredManagers: updated,
      managerProfile: newManager,
    });

    try {
      localStorage.setItem('haven_registered_managers', JSON.stringify(updated));
      localStorage.setItem('haven_saved_manager_profile', JSON.stringify(newManager));
    } catch {
      // Safe fallback
    }

    return { success: true };
  },

  loginManager: async (emailOrPhone: string, password: string) => {
    const cleanIdentifier = emailOrPhone.trim().toLowerCase();
    const cleanPwd = password.trim();

    // 2. Try Supabase Auth signInWithPassword
    try {
      const authEmail = cleanIdentifier.includes('@') 
        ? cleanIdentifier 
        : `${cleanDigits(cleanIdentifier) || cleanIdentifier}@haven.dz`;
      const authPassword = toAuthPassword(cleanPwd);

      const { data: authIn, error: authInErr } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });

      if (!authInErr && authIn?.user) {
        const userMeta = authIn.user.user_metadata || {};
        const profile: ManagerProfile = {
          id: authIn.user.id,
          name: userMeta.name || 'Gestionnaire Syndic',
          emailOrPhone: cleanIdentifier,
          password: '', // Don't store password locally
          agencyName: userMeta.agency_name || '',
          createdAt: authIn.user.created_at || new Date().toISOString()
        };
        set({ currentRole: 'manager', managerProfile: profile });
        try {
          localStorage.setItem('haven_saved_manager_profile', JSON.stringify(profile));
        } catch {}
        return { success: true };
      }
    } catch {
      // Continue to local check
    }

    // 3. Fallback to local managers
    const currentManagers = get().registeredManagers;
    const manager = currentManagers.find(
      m => m.emailOrPhone.trim().toLowerCase() === cleanIdentifier && m.password === cleanPwd
    );

    if (!manager) {
      return { success: false, message: 'Email/Téléphone ou mot de passe incorrect.' };
    }

    set({ currentRole: 'manager', managerProfile: manager });
    try {
      localStorage.setItem('haven_saved_manager_profile', JSON.stringify(manager));
    } catch {
      // Safe fallback
    }

    return { success: true };
  },

  logoutManager: () => {
    supabase.auth.signOut().catch(() => {});
    set({ currentRole: 'resident', managerProfile: null });
    try {
      localStorage.removeItem('haven_saved_manager_profile');
    } catch {
      // Safe fallback
    }
  },

  toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),

  clearUnreadAlerts: () => set({ unreadAlertCount: 0 }),

});
