import { apiClient } from "../../lib/apiClient";

export async function loginRequest(credentials) {
  const { data } = await apiClient.post("/token/", credentials);
  return data;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get("/me/");
  return data;
}

