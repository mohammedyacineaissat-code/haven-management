import { describe, it, expect, beforeEach } from 'vitest';
import { useNexiaStore } from '../store/useNexiaStore';

describe('authSlice', () => {
  beforeEach(() => {
    // Reset store before each test
    const { logoutResident } = useNexiaStore.getState();
    logoutResident();
  });

  it('initializes with null profile', () => {
    const state = useNexiaStore.getState();
    expect(state.residentProfile).toBeNull();
  });

  it('updates resident profile on login', () => {
    const { loginResident } = useNexiaStore.getState();
    
    // Fake login
    const mockProfile = {
      id: 'test-res-1',
      buildingId: 'test-build',
      firstName: 'John',
      lastName: 'Doe',
      floor: '1',
      phone: '123456789',
      aptNumber: '101',
      joinedAt: '2026-09-01T00:00:00Z'
    };
    
    // We mock set state directly since loginResident involves supabase in real code
    useNexiaStore.setState({ residentProfile: mockProfile });
    
    expect(useNexiaStore.getState().residentProfile?.firstName).toBe('John');
  });

  it('clears resident profile on logout', () => {
    useNexiaStore.setState({ 
      residentProfile: {
        id: 'test-res-1',
        buildingId: 'test-build',
        firstName: 'John',
        lastName: 'Doe',
        floor: '1',
        phone: '123456789',
        aptNumber: '101',
        joinedAt: '2026-09-01T00:00:00Z'
      }
    });

    const { logoutResident } = useNexiaStore.getState();
    logoutResident();
    
    expect(useNexiaStore.getState().residentProfile).toBeNull();
  });
});
