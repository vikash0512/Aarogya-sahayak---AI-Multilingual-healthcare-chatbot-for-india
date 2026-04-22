/**
 * Centralized API helper for Arogya Sahayak backend.
 * Base URL, JWT token injection, error handling.
 */

import { supabase } from './supabaseClient';

const API_BASE = '/api';

let cachedAccessToken: string | null = null;
let authListenerInitialized = false;

async function ensureAuthListener() {
  if (authListenerInitialized) return;
  authListenerInitialized = true;

  const { data: { session } } = await supabase.auth.getSession();
  cachedAccessToken = session?.access_token ?? null;

  supabase.auth.onAuthStateChange((_event, session) => {
    cachedAccessToken = session?.access_token ?? null;
  });
}

// Fetch wrapper with auth
export async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  await ensureAuthListener();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (cachedAccessToken) {
    headers['Authorization'] = `Bearer ${cachedAccessToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await supabase.auth.signOut();
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || err.detail || JSON.stringify(err));
  }

  return response.json();
}

// Token refresh is handled automatically by Supabase client

// ==================== AUTH ====================

// Auth logic is now mostly handled in AuthContext using Supabase Client

// ==================== CHAT ====================

export async function sendMessage(message: string, language: string, sessionId?: number) {
  return apiFetch('/chat/', {
    method: 'POST',
    body: JSON.stringify({ message, language, session_id: sessionId }),
  });
}

export async function getChatSessions() {
  return apiFetch('/chat/sessions/');
}

export async function getSessionMessages(sessionId: number) {
  return apiFetch(`/chat/sessions/${sessionId}/messages/`);
}

// ==================== ADMIN CONFIG ====================

export async function getLLMConfig() {
  return apiFetch('/admin/llm-config/');
}

export async function saveLLMConfig(config: any) {
  return apiFetch('/admin/llm-config/', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export async function getVectorConfig() {
  return apiFetch('/admin/vector-config/');
}

export async function saveVectorConfig(config: any) {
  return apiFetch('/admin/vector-config/', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export async function getSettings() {
  return apiFetch('/admin/settings/');
}

export async function saveSettings(settings: any) {
  return apiFetch('/admin/settings/', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export async function getGuardrails() {
  return apiFetch('/admin/guardrails/');
}

export async function saveGuardrails(config: any) {
  return apiFetch('/admin/guardrails/', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export async function getSupabaseConfig() {
  return apiFetch('/admin/supabase-config/');
}

export async function saveSupabaseConfig(config: any) {
  return apiFetch('/admin/supabase-config/', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export async function testSupabaseConnection() {
  return apiFetch('/admin/supabase-config/test/', { method: 'POST' });
}

export async function getPublicConfig() {
  return await fetch(`${API_BASE}/admin/public/`).then(res => res.json());
}

// ==================== DOCUMENTS ====================

export async function getDocuments() {
  return apiFetch('/admin/documents/');
}

export async function uploadDocument(file: File, chunkSize: number, sourceLanguage: string, sourceAuthority: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('chunk_size', chunkSize.toString());
  formData.append('source_language', sourceLanguage);
  formData.append('source_authority', sourceAuthority);

  return apiFetch('/admin/documents/upload/', {
    method: 'POST',
    body: formData,
  });
}

export async function processDocument(docId: number) {
  return apiFetch(`/admin/documents/${docId}/process/`, { method: 'POST' });
}

export async function deleteDocument(docId: number) {
  return apiFetch(`/admin/documents/${docId}/delete/`, { method: 'DELETE' });
}

export async function reindexDocument(docId: number) {
  return apiFetch(`/admin/documents/${docId}/reindex/`, { method: 'POST' });
}

export async function getDocumentStatus(docId: number) {
  return apiFetch(`/admin/documents/${docId}/status/`);
}

// ==================== USERS ====================

export async function getUsers() {
  return apiFetch('/users/');
}

export async function updateUser(userId: number, data: any) {
  return apiFetch(`/users/${userId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ==================== AUDIT & DASHBOARD ====================

export async function getAuditLogs(search?: string) {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiFetch(`/admin/audit-logs/${params}`);
}

export async function getDashboardStats() {
  return apiFetch('/admin/dashboard/stats/');
}

// ==================== USER PROFILE ====================

export async function getUserProfile() {
  return apiFetch('/auth/profile/');
}

export async function updateUserProfile(data: any) {
  return apiFetch('/auth/profile/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ==================== USER DOCUMENTS ====================

export async function getUserDocuments() {
  return apiFetch('/knowledge/user-documents/');
}

export async function uploadUserDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch('/knowledge/user-documents/', {
    method: 'POST',
    body: formData,
  });
}

export async function deleteUserDocument(docId: number) {
  return apiFetch(`/knowledge/user-documents/${docId}/`, {
    method: 'DELETE',
  });
}



export async function getChatSessionMessages(sessionId: number) {
  return apiFetch(`/chat/sessions/${sessionId}/messages/`);
}

export async function deleteChatSession(sessionId: number) {
  return apiFetch(`/chat/sessions/${sessionId}/delete/`, {
    method: 'DELETE',
  });
}

