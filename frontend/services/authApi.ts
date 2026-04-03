import api from './api';

export const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const register = async (email: string, password: string) => {
  const { data } = await api.post('/auth/signup', { email, password });
  return data;
};

// OAuth and recovery
export const signInWithOAuth = async (provider: 'google' | 'github') => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
};

export const resetPassword = async (email: string) => {
  const { data } = await api.post('/auth/reset-password-request', { email });
  return data;
};

export const updateEmail = async (newEmail: string) => {
  const { data } = await api.post('/users/profile', { email: newEmail });
  return data;
};

export const updatePassword = async (newPassword: string) => {
  const { data } = await api.post('/auth/update-password', { password: newPassword });
  return data;
};
