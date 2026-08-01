import { apiClient } from './client';

export function getSessions() {
  return apiClient('/api/sessions/manage-sessions');
}

export function updateSessionStatus(sessionId, newStatus) {
  return apiClient(`/api/sessions/manage-sessions`, {
    method: 'PATCH',
    body: {
      "session-id":sessionId,
      "status":newStatus
    }
  });
}