export const toAuthPassword = (pwd: string): string => pwd.length >= 6 ? pwd : `${pwd}${'0'.repeat(6 - pwd.length)}`;
export const cleanDigits = (val?: string) => (val || '').replace(/\D/g, '');
export const cleanStr = (val?: string) => (val || '').trim().toLowerCase();
export const cleanApt = (val?: string) => (val || '').trim().toLowerCase().replace(/^apt\s*/i, '');
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
