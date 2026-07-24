import { apiClient } from './client';

export function getReaders() {
  return apiClient(`/reader/manage-readers`);
}

export function getReader(readerId) {
  return apiClient(`/reader/manage-readers?reader_id=${readerId}`)
}

export function editReader(readerId, readerData) {
  return apiClient('/reader/manage-readers', {
    method: 'PATCH',
    body: {
      "reader-id": readerId,
      ...readerData
    }
  })
}

export function deleteReader(readerId) {
  return apiClient('/reader/manage-readers', {
    method: 'DELETE',
    body: {
      "reader-id": readerId,
    }
  })
}

export function createReader(readerData) {
  return apiClient('/reader/manage-readers', {
    method: 'POST',
    body: {
      ...readerData
    }
  })
}

export function getReaderDashboard(readerId) {
  return apiClient(`/reader?reader-id=${readerId}`)
}