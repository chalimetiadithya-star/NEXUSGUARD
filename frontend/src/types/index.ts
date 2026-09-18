export type ClearanceLevel = 'Public' | 'Internal' | 'Confidential' | 'Restricted';

export interface UserProfile {
  employee_id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  clearance: ClearanceLevel;
  is_active: boolean;
}

export interface Citation {
  document_id: string;
  title: string;
  version: string;
  effective_date: string;
  classification: string;
  department: string;
  excerpt?: string;
}

export type QueryStatus = 
  | 'SUCCESS' 
  | 'NO_AUTHORIZED_EVIDENCE' 
  | 'CONFLICT' 
  | 'INSUFFICIENT_EVIDENCE' 
  | 'LLM_UNAVAILABLE' 
  | 'ERROR';

export interface ResearchResponse {
  request_id: string;
  status: QueryStatus;
  answer: string;
  citations: Citation[];
  conversation_id?: number;
  duration_ms?: number;
}

export interface DocumentItem {
  id: number;
  document_id: string;
  title: string;
  owner: string;
  department: string;
  classification: ClearanceLevel;
  allowed_departments: string[];
  allowed_roles: string[];
  allowed_users: string[];
  denied_users: string[];
  lineage_id: string;
  version: string;
  effective_date: string;
  status: string;
  content?: string;
  created_at: string;
  updated_at?: string;
}

export interface PolicyDecision {
  document_id: string;
  allowed: boolean;
  reason: string;
  title?: string;
  classification?: string;
}

export interface RequestTrace {
  request_id: string;
  user_id: string;
  user_name: string;
  user_department: string;
  user_role: string;
  user_clearance: string;
  question: string;
  candidate_ids: string[];
  authorization_decisions: PolicyDecision[];
  authorized_ids: string[];
  selected_ids: string[];
  llm_evidence_ids: string[];
  status: QueryStatus;
  duration_ms: number;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_documents: number;
  total_queries: number;
  allowed_decisions: number;
  blocked_decisions: number;
  recent_activity: {
    request_id: string;
    user_id: string;
    user_name: string;
    question: string;
    status: string;
    duration_ms: number;
    created_at: string;
  }[];
}

export interface DemoUserCard {
  employee_id: string;
  name: string;
  department: string;
  role: string;
  clearance: ClearanceLevel;
  description: string;
}

export interface ConversationItem {
  id: number;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface MessageItem {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  request_id?: string;
  citations: Citation[];
  status?: string;
  created_at: string;
}
