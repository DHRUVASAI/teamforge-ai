import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("tf_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("tf_token");
        localStorage.removeItem("tf_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const register = (data: { name: string; email: string; password: string }) => api.post("/auth/register", data);
export const login = (data: { email: string; password: string }) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");
export const getTeam = () => api.get("/auth/team");
export const joinTeam = (data: { team_code: string }) => api.post("/auth/join-team", data);
export const getProjects = () => api.get(`/projects`);
export const createProject = (data: object) => api.post("/projects/", data);
export const getProject = (id: string) => api.get(`/projects/${id}`);
export const generatePlaybook = (projectId: string) => api.post(`/projects/${projectId}/playbook/generate`, { capabilities: [] });
export const getPlaybook = (projectId: string) => api.get(`/projects/${projectId}/playbook`);
export const analyzeProject = (projectId: string) => api.post(`/projects/${projectId}/analyze`);
export const evaluatePS = (data: object) => api.post("/ps/evaluate", data);
export const askMentor = (projectId: string, data: { question: string; member_id: string }) => api.post(`/projects/${projectId}/mentor/ask`, data);
export const updateProject = (id: string, data: object) => api.patch("/projects/" + id, data);

export default api;
