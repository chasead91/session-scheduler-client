import { apiClient } from './client';

export function createSitter(name, reader_list) {
  return apiClient(`/api/sitter/manage-sitters`, {
    method: 'POST',
    body: {"name":name, "reader-list":reader_list}
  });
}

export function getSitterData() {
  return apiClient('/api/sitter/manage-sitters')
}

export function deleteSitter(sitterId) {
  return apiClient('/api/sitter/manage-sitters', {
    method: 'DELETE',
    body: {"sitter-id":sitterId}
  })
}