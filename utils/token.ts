export const getTokenFromCookie = (type = 'auth-token') => {
  if (typeof document === 'undefined') return ''; // Kiểm tra trên client
  const cookies = document.cookie.split('; ');
  let tokenCookie = null;
  if (type === 'auth-token') {
    tokenCookie = cookies.find(row => row.startsWith('auth-token='));
  } else {
    tokenCookie = cookies.find(row => row.startsWith('auth-refresh-token='));
  }

  return tokenCookie ? tokenCookie.split('=')[1] : '';
};

export const clearCookies = (tokens: string[]) => {
  tokens.forEach(token => {
    document.cookie = `${token}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  });
};
