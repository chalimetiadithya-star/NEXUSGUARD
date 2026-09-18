import {
  UserProfile,
  ResearchResponse,
  DocumentItem,
  AdminStats,
  RequestTrace,
  DemoUserCard,
  ConversationItem,
  MessageItem
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('accesslens_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'Request failed';
    try {
      const data = await res.json();
      errorDetail = data.detail || JSON.stringify(data);
    } catch {
      errorDetail = res.statusText;
    }
    throw new Error(errorDetail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Authentication
  async login(username: string, password: string):Promise<{ access_token: string; user: UserProfile }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await handleResponse<{ access_token: string; user: UserProfile }>(res);
    localStorage.setItem('accesslens_token', data.access_token);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
    } finally {
      localStorage.removeItem('accesslens_token');
    }
  },

  async getMe(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<UserProfile>(res);
  },

  async getDemoUsers(): Promise<DemoUserCard[]> {
    const res = await fetch(`${API_BASE_URL}/auth/demo-users`);
    return handleResponse<DemoUserCard[]>(res);
  },

  // Research Query
  async researchQuery(question: string, conversation_id?: number): Promise<ResearchResponse> {
    const res = await fetch(`${API_BASE_URL}/research/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ question, conversation_id })
    });
    return handleResponse<ResearchResponse>(res);
  },

  async getConversations(): Promise<ConversationItem[]> {
    const res = await fetch(`${API_BASE_URL}/conversations`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<ConversationItem[]>(res);
  },

  async createConversation(): Promise<ConversationItem> {
    const res = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    return handleResponse<ConversationItem>(res);
  },

  async getConversationMessages(id: number): Promise<MessageItem[]> {
    const res = await fetch(`${API_BASE_URL}/conversations/${id}/messages`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<MessageItem[]>(res);
  },

  // Documents
  async getDocuments(params?: { search?: string; department?: string; classification?: string }): Promise<DocumentItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.department) query.append('department', params.department);
    if (params?.classification) query.append('classification', params.classification);

    const res = await fetch(`${API_BASE_URL}/documents?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<DocumentItem[]>(res);
  },

  async getDocument(id: string): Promise<DocumentItem> {
    const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<DocumentItem>(res);
  },

  // Admin Portal
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<AdminStats>(res);
  },

  async getAdminUsers(): Promise<UserProfile[]> {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<UserProfile[]>(res);
  },

  async updateAdminUser(employee_id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE_URL}/admin/users/${employee_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse<UserProfile>(res);
  },

  async getAdminDocuments(): Promise<DocumentItem[]> {
    const res = await fetch(`${API_BASE_URL}/admin/documents`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<DocumentItem[]>(res);
  },

  async createAdminDocument(data: Partial<DocumentItem>): Promise<DocumentItem> {
    const res = await fetch(`${API_BASE_URL}/admin/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse<DocumentItem>(res);
  },

  async uploadAdminDocument(formData: FormData): Promise<DocumentItem> {
    const res = await fetch(`${API_BASE_URL}/admin/documents/upload`, {
      method: 'POST',
      headers: {
        ...getAuthHeader()
      },
      body: formData
    });
    return handleResponse<DocumentItem>(res);
  },

  async getAdminAudit(params?: { status?: string; user?: string }): Promise<RequestTrace[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status_filter', params.status);
    if (params?.user) query.append('user_filter', params.user);

    const res = await fetch(`${API_BASE_URL}/admin/audit?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<RequestTrace[]>(res);
  },

  async getRequestTrace(requestId: string): Promise<RequestTrace> {
    const res = await fetch(`${API_BASE_URL}/admin/requests/${requestId}/trace`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<RequestTrace>(res);
  }
};
