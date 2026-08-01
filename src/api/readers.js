import { apiClient } from './client';

export function getReaders() {
  return apiClient(`/api/reader/manage-readers`);
}

export function getReader(readerId) {
  return apiClient(`/api/reader/manage-readers?reader_id=${readerId}`)
}

export function editReader(readerId, readerData) {
  return apiClient('/api/reader/manage-readers', {
    method: 'PATCH',
    body: {
      "reader-id": readerId,
      ...readerData
    }
  })
}

export function deleteReader(readerId) {
  return apiClient('/api/reader/manage-readers', {
    method: 'DELETE',
    body: {
      "reader-id": readerId,
    }
  })
}

export function createReader(readerData) {
  return apiClient('/api/reader/manage-readers', {
    method: 'POST',
    body: {
      ...readerData
    }
  })
}

export function getReaderDashboard(readerId) {
  return apiClient(`/api/reader?reader-id=${readerId}`)
}

export function uploadReaderData(fileData) {
  return apiClient('/api/reader/upload-readers', {
    method: 'POST',
    body: fileData
  })
}