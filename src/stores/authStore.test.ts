import { useAuthStore } from './authStore';

// The supabase module is already mocked in jest.setup.js via @supabase/supabase-js.
// We get the mock instance from there and add our test-specific behaviors.
// Since authStore imports { supabase } from '../lib/supabase', and supabase.ts
// creates a client via the mocked createClient, the auth methods come from jest.setup.js.

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      session: null,
      user: null,
      loading: true,
      initialized: false,
      guestMode: false,
    });
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.loading).toBe(true);
    expect(state.initialized).toBe(false);
    expect(state.guestMode).toBe(false);
  });

  it('setSession updates session, user, and clears guestMode', () => {
    const mockUser = { id: '123', email: 'test@test.com' } as any;
    const mockSession = { access_token: 'token', user: mockUser } as any;

    useAuthStore.getState().setGuestMode(true);
    expect(useAuthStore.getState().guestMode).toBe(true);

    useAuthStore.getState().setSession(mockSession);
    expect(useAuthStore.getState().session).toBe(mockSession);
    expect(useAuthStore.getState().user).toBe(mockUser);
    expect(useAuthStore.getState().guestMode).toBe(false);
    expect(useAuthStore.getState().loading).toBe(false);
  });

  it('setSession with null clears session and user', () => {
    const mockUser = { id: '123', email: 'test@test.com' } as any;
    const mockSession = { access_token: 'token', user: mockUser } as any;

    useAuthStore.getState().setSession(mockSession);
    expect(useAuthStore.getState().session).toBe(mockSession);

    useAuthStore.getState().setSession(null);
    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setGuestMode sets guestMode flag', () => {
    useAuthStore.getState().setGuestMode(true);
    expect(useAuthStore.getState().guestMode).toBe(true);

    useAuthStore.getState().setGuestMode(false);
    expect(useAuthStore.getState().guestMode).toBe(false);
  });

  it('signOut clears session and sets guestMode to true', async () => {
    const mockUser = { id: '123', email: 'test@test.com' } as any;
    const mockSession = { access_token: 'token', user: mockUser } as any;

    useAuthStore.getState().setSession(mockSession);
    expect(useAuthStore.getState().session).toBe(mockSession);

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().guestMode).toBe(true);
  });
});