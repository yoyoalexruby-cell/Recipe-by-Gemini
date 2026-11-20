import { describe, it, expect, beforeEach } from 'vitest';
import {
  CURRENT_USER_KEY,
  OPERATOR_TOKEN_SESSION_KEY,
  OFFICIAL_SESSION_USER_KEY,
  getCurrentUser,
  registerWithPassword,
  loginWithPassword,
  logoutUser,
  isOfficialUser,
} from '../authService';
import { OFFICIAL_ACCOUNT_UID, OFFICIAL_EDITORIAL_USER } from '../../data/officialSquareSeed';

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('registers with PBKDF2 hash, persists session, and verifies login credentials', async () => {
    const registered = await registerWithPassword('chef_alice', 'SecretPass2026!', 'alice@example.com');
    expect(registered.uid).toMatch(/^usr_/);
    expect(getCurrentUser()?.uid).toBe(registered.uid);

    logoutUser();
    expect(getCurrentUser()).toBeNull();

    await expect(loginWithPassword('chef_alice', 'wrong_pass')).rejects.toThrow();

    const loggedIn = await loginWithPassword('chef_alice', 'SecretPass2026!');
    expect(loggedIn.uid).toBe(registered.uid);
    expect(loggedIn.email).toBe('alice@example.com');
  });

  it('rejects and scrubs spoofed Official Editorial identity stored in localStorage', () => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(OFFICIAL_EDITORIAL_USER));

    const user = getCurrentUser();
    expect(user).toBeNull();
    expect(localStorage.getItem(CURRENT_USER_KEY)).toBeNull();
  });

  it('rejects expired or malformed operator tokens stored in sessionStorage', () => {
    sessionStorage.setItem(OFFICIAL_SESSION_USER_KEY, JSON.stringify(OFFICIAL_EDITORIAL_USER));
    sessionStorage.setItem(OPERATOR_TOKEN_SESSION_KEY, 'not-a-valid-token');

    expect(getCurrentUser()).toBeNull();
    expect(sessionStorage.getItem(OFFICIAL_SESSION_USER_KEY)).toBeNull();
    expect(sessionStorage.getItem(OPERATOR_TOKEN_SESSION_KEY)).toBeNull();

    const expiredTs = Date.now() - 10_000;
    const validNonce = 'a'.repeat(24);
    const validSig = 'b'.repeat(64);
    sessionStorage.setItem(OFFICIAL_SESSION_USER_KEY, JSON.stringify(OFFICIAL_EDITORIAL_USER));
    sessionStorage.setItem(OPERATOR_TOKEN_SESSION_KEY, `${expiredTs}.${validNonce}.${validSig}`);

    expect(getCurrentUser()).toBeNull();
  });

  it('recognizes official identity strictly by UID and clears sessionStorage on logout', () => {
    expect(isOfficialUser(OFFICIAL_EDITORIAL_USER)).toBe(true);
    expect(isOfficialUser({ ...OFFICIAL_EDITORIAL_USER, uid: 'usr_123' })).toBe(false);

    const futureTs = Date.now() + 60_000;
    const validToken = `${futureTs}.${'n'.repeat(24)}.${'s'.repeat(64)}`;
    sessionStorage.setItem(OFFICIAL_SESSION_USER_KEY, JSON.stringify(OFFICIAL_EDITORIAL_USER));
    sessionStorage.setItem(OPERATOR_TOKEN_SESSION_KEY, validToken);

    const restored = getCurrentUser();
    expect(restored?.uid).toBe(OFFICIAL_ACCOUNT_UID);

    logoutUser();
    expect(getCurrentUser()).toBeNull();
    expect(sessionStorage.getItem(OPERATOR_TOKEN_SESSION_KEY)).toBeNull();
  });
});
