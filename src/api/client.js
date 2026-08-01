// api/client.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function apiClient(endpoint, { body, headers: customHeaders, ...customConfig } = {}) {
  const token = localStorage.getItem('token');
  const isFormData = body instanceof FormData;

  // 1. Build initial headers
  const headers = {
    // Only set default Content-Type if it's NOT FormData
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders,
  };

  // 2. If customHeaders explicitly provided 'Content-Type', check if we need to clean it up
  // (Prevents edge cases if a caller manually passed Content-Type for FormData)
  if (isFormData && headers['Content-Type']) {
    delete headers['Content-Type'];
  }

  // 3. Prepare config and handle body transformation
  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers,
  };

  if (body) {
    // Send FormData raw; JSON stringify everything else
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Something went wrong');
  }

  return response.json();
}