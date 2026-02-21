import { fetchAuthSession } from "aws-amplify/auth";
import config from "../config";

const API_URL = config.apiUrl;

async function getAuthHeaders() {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    return {
      "Content-Type": "application/json",
      Authorization: token || "",
    };
  } catch {
    return { "Content-Type": "application/json" };
  }
}

async function apiRequest(method, path, body = null) {
  const headers = await getAuthHeaders();
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }
  return data;
}

export const api = {
  createSession: (data) => apiRequest("POST", "/sessions", data),

  listSessions: () => apiRequest("GET", "/sessions"),

  getSession: (sessionId) => apiRequest("GET", `/sessions/${sessionId}`),

  sendPacket: (sessionId, data) =>
    apiRequest("POST", `/sessions/${sessionId}/send-packet`, data),

  submitCorrections: async (sessionId, data) => {
    const response = await fetch(
      `${API_URL}/sessions/${sessionId}/corrections`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  },

  updateBrief: (sessionId) =>
    apiRequest("POST", `/sessions/${sessionId}/update-brief`),

  submitSynthesis: (sessionId, data) =>
    apiRequest("POST", `/sessions/${sessionId}/synthesis`, data),
};

export default api;
