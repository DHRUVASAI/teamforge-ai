export const saveAuth = (token: string, user: { user_id: string; name: string; email: string; team_id?: string }) => {
  localStorage.setItem("tf_token", token);
  localStorage.setItem("tf_user", JSON.stringify(user));
};

export const getAuth = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("tf_token");
  const userStr = localStorage.getItem("tf_user");
  if (!token || !userStr) return null;
  try {
    return { token, user: JSON.parse(userStr) };
  } catch (e) {
    clearAuth();
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem("tf_token");
  localStorage.removeItem("tf_user");
};

export const isLoggedIn = () => !!getAuth();
