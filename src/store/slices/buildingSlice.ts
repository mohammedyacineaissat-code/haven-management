import { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import { Incident, ResidentReport, BuildingNotice, Building } from '../../types/building';
import { StoreState } from '../storeTypes';
import { playAlertSound } from '../../utils/audio';

export type BuildingSlice = Pick<StoreState, 
  'addBuilding' |
  'removeBuilding' |
  'broadcastIncident' |
  'updateIncidentStatus' |
  'addTimelineNote' |
  'confirmRestoration' |
  'submitResidentReport' |
  'updateTicketStatus' |
  'addNotice' |
  'deleteNotice'
>;

export const createBuildingSlice: StateCreator<StoreState, [], [], BuildingSlice> = (set, get, api) => ({
  addBuilding: async (buildingData: Omit<Building, "id">) => {
    const newId = `bldg-${Date.now()}`;
    const newBuilding: Building = {
      id: newId,
      ...buildingData,
      status: 'operational'
    };

    set((state: any) => ({
      buildings: [...state.buildings, newBuilding],
      activeBuildingId: newId
    }));

    try {
      await supabase.from('buildings').insert({
        id: newId,
        name: buildingData.name,
        address: buildingData.address,
        total_units: buildingData.totalUnits,
        towers: buildingData.towers,
        status: 'operational'
      });
    } catch (err) {
      console.debug('DB insert error:', err);
    }
  },

  removeBuilding: async (buildingId: string) => {
    set((state: any) => {
      const remainingBuildings = state.buildings.filter((b: any) => b.id !== buildingId);
      const nextActiveId = state.activeBuildingId === buildingId 
        ? (remainingBuildings[0]?.id || '') 
        : state.activeBuildingId;
        
      return {
        buildings: remainingBuildings,
        activeBuildingId: nextActiveId
      };
    });

    try {
      await supabase.from('buildings').delete().eq('id', buildingId);
    } catch (err) {
      console.debug('DB delete error:', err);
    }
  },

  broadcastIncident: async (incidentData) => {
    const newId = `inc-${Date.now()}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newIncident: Incident = {
      id: newId,
      buildingId: incidentData.buildingId || get().activeBuildingId || get().buildings[0]?.id,
      category: incidentData.category,
      severity: incidentData.severity,
      title: incidentData.title,
      description: incidentData.description,
      location: incidentData.location,
      affectedUnits: incidentData.affectedUnits,
      status: 'reported',
      reportedAt: currentTime,
      estimatedRestorationTime: incidentData.estimatedRestorationTime,
      etaCountdownMinutes: incidentData.etaCountdownMinutes,
      requiresResidentConfirmation: incidentData.requiresResidentConfirmation ?? (incidentData.category === 'water'),
      timeline: [
        {
          id: `t-${Date.now()}`,
          status: 'reported',
          label: 'Incident Déclaré',
          timestamp: currentTime,
          note: incidentData.description,
          author: 'Bureau du Syndic'
        }
      ],
      confirmations: []
    };

    set((state: any) => ({
      activeIncidents: [newIncident, ...state.activeIncidents],
      unreadAlertCount: state.unreadAlertCount + 1
    }));

    if (get().soundEnabled) {
      playAlertSound(incidentData.severity);
    }

    try {
      await supabase.from('incidents').insert({
        id: newId,
        building_id: newIncident.buildingId,
        category: newIncident.category,
        severity: newIncident.severity,
        title: newIncident.title,
        description: newIncident.description,
        location: newIncident.location,
        affected_units: newIncident.affectedUnits,
        status: newIncident.status,
        estimated_restoration_time: newIncident.estimatedRestorationTime,
        eta_countdown_minutes: newIncident.etaCountdownMinutes,
        requires_resident_confirmation: newIncident.requiresResidentConfirmation
      });

      await supabase.from('incident_timelines').insert({
        incident_id: newId,
        status: 'reported',
        label: 'Incident Déclaré',
        note: incidentData.description,
        author: 'Bureau du Syndic'
      });
    } catch (err) {
      console.debug('DB incident insert error:', err);
    }
  },

  updateIncidentStatus: async (incidentId: string, status: any, note?: string) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isResolved = status === 'resolved';

    set((state: any) => {
      const target = state.activeIncidents.find((i: any) => i.id === incidentId);
      if (!target) return state;

      const updatedTimeline = [
        ...target.timeline,
        {
          id: `t-${Date.now()}`,
          status,
          label: status.toUpperCase(),
          timestamp: currentTime,
          note: note || `Statut mis à jour: ${status}`,
          author: 'Bureau du Syndic'
        }
      ];

      const updatedIncident: Incident = {
        ...target,
        status,
        timeline: updatedTimeline,
        estimatedRestorationTime: isResolved ? 'Rétabli' : target.estimatedRestorationTime,
        etaCountdownMinutes: isResolved ? 0 : target.etaCountdownMinutes
      };

      if (isResolved) {
        return {
          activeIncidents: state.activeIncidents.filter((i: any) => i.id !== incidentId),
          resolvedIncidents: [updatedIncident, ...state.resolvedIncidents]
        };
      } else {
        return {
          activeIncidents: state.activeIncidents.map((i: any) => i.id === incidentId ? updatedIncident : i)
        };
      }
    });

    try {
      await supabase.from('incidents').update({ status }).eq('id', incidentId);
      await supabase.from('incident_timelines').insert({
        incident_id: incidentId,
        status,
        label: status.toUpperCase(),
        note: note || `Statut mis à jour: ${status}`,
        author: 'Bureau du Syndic'
      });
    } catch (err) {
      console.debug('DB incident update error:', err);
    }
  },

  addTimelineNote: async (incidentId: string, note: string) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const authorName = get().currentRole === 'manager' 
      ? 'Bureau du Syndic' 
      : (get().residentProfile?.lastName || 'Résident');

    set((state: any) => {
      const active = state.activeIncidents.map((inc: any) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            timeline: [
              ...inc.timeline,
              {
                id: `t-${Date.now()}`,
                status: inc.status,
                label: 'Note Technique',
                timestamp: currentTime,
                note,
                author: authorName
              }
            ]
          };
        }
        return inc;
      });
      return { activeIncidents: active };
    });

    try {
      await supabase.from('incident_timelines').insert({
        incident_id: incidentId,
        status: 'in_progress',
        label: 'Note Technique',
        note,
        author: authorName
      });
    } catch (err) {
      console.debug('DB timeline note error:', err);
    }
  },

  confirmRestoration: async (incidentId: string, isRestored: boolean) => {
    const apt = get().userApartment || 'Mon Appartement';

    set((state: any) => {
      const active = state.activeIncidents.map((inc: any) => {
        if (inc.id === incidentId) {
          const existingFiltered = (inc.confirmations || []).filter((c: any) => c.apartment !== apt);
          return {
            ...inc,
            confirmations: [
              ...existingFiltered,
              {
                apartment: apt,
                isRestored,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return inc;
      });
      return { activeIncidents: active };
    });

    try {
      await supabase.from('incident_confirmations').upsert({
        incident_id: incidentId,
        unit_id: apt,
        is_restored: isRestored
      });
    } catch (err) {
      console.debug('DB confirmation error:', err);
    }
  },

  submitResidentReport: async (report: any) => {
    const bId = get().residentHomeBuildingId || get().buildings[0]?.id;
    const author = get().residentProfile 
      ? `${get().residentProfile?.lastName} (${get().userApartment})`
      : 'Résident';

    const newReport: ResidentReport = {
      id: `rep-${Date.now()}`,
      buildingId: bId,
      category: report.category,
      location: report.location,
      description: report.description,
      photoUrl: report.photoUrl,
      status: 'pending',
      submittedBy: author,
      submittedAt: 'À l\'instant'
    };

    set((state: any) => ({
      residentReports: [newReport, ...state.residentReports]
    }));

    try {
      await supabase.from('tickets').insert({
        building_id: bId,
        category: report.category,
        location: report.location,
        description: report.description,
        photo_url: report.photoUrl,
        status: 'pending',
        submitted_by: author
      });
    } catch (err) {
      console.debug('DB ticket insert error:', err);
    }
  },

  updateTicketStatus: async (ticketId: string, status: any) => {
    set((state: any) => ({
      residentReports: state.residentReports.map((r: any) => r.id === ticketId ? { ...r, status } : r)
    }));

    try {
      await supabase.from('tickets').update({ status }).eq('id', ticketId);
    } catch (err) {
      console.debug('DB ticket status error:', err);
    }
  },

  addNotice: async (notice: any) => {
    const bId = notice.buildingId || get().activeBuildingId || get().buildings[0]?.id;
    const newNotice: BuildingNotice = {
      id: `not-${Date.now()}`,
      buildingId: bId,
      title: notice.title,
      content: notice.content,
      category: notice.category || 'info',
      author: notice.author || 'Bureau du Syndic',
      date: 'Aujourd\'hui',
      isPinned: notice.isPinned ?? true,
      expenseDetails: notice.expenseDetails
    };

    set((state: any) => ({
      notices: [newNotice, ...state.notices]
    }));

    try {
      await supabase.from('notices').insert({
        id: newNotice.id,
        building_id: bId,
        title: notice.title,
        content: notice.content,
        category: notice.category,
        author: notice.author,
        is_pinned: notice.isPinned,
        total_amount: notice.expenseDetails?.totalAmount,
        per_resident_amount: notice.expenseDetails?.perResidentAmount
      });
    } catch (err) {
      console.debug('DB notice insert error:', err);
    }
  },

  deleteNotice: async (noticeId: string) => {
    set((state: any) => ({
      notices: state.notices.filter((n: any) => n.id !== noticeId)
    }));
    try {
      await supabase.from('notices').delete().eq('id', noticeId);
    } catch (err) {
      console.debug('DB notice delete error:', err);
    }
  },

});
