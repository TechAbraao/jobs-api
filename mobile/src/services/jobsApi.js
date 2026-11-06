import { Platform } from 'react-native';

const DEFAULT_API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000'
    : 'http://localhost:5000';

const API_BASE_URL =
  (process.env.EXPO_PUBLIC_JOBS_API_URL || DEFAULT_API_URL).replace(/\/$/, '');

async function request(path, options = {}) {
  const { method = 'GET', body, params = {} } = options;
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });

  const url = `${API_BASE_URL}${path}${query.toString() ? `?${query.toString()}` : ''}`;

  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      payload = null;
    }
  }

  if (!response.ok) {
    const message = payload?.error || payload?.message || 'Erro ao comunicar com a API.';
    throw new Error(message);
  }

  return payload;
}

export async function listJobs(params = {}) {
  const response = await request('/jobs', { params });
  return response || { jobs: [], pagination: { total: 0, page: 1, per_page: 20, pages: 0 } };
}

export async function getJob(jobId) {
  const response = await request(`/jobs/${jobId}`);
  return response?.job ?? null;
}

export async function createJob(payload) {
  const response = await request('/jobs', {
    method: 'POST',
    body: payload,
  });
  return response?.job ?? null;
}

export async function updateJob(jobId, payload) {
  const response = await request(`/jobs/${jobId}`, {
    method: 'PATCH',
    body: payload,
  });
  return response?.job ?? null;
}

export async function replaceJob(jobId, payload) {
  const response = await request(`/jobs/${jobId}`, {
    method: 'PUT',
    body: payload,
  });
  return response?.job ?? null;
}

export async function deleteJob(jobId) {
  await request(`/jobs/${jobId}`, { method: 'DELETE' });
}
