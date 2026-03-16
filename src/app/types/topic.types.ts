export interface TopicNode {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  children: TopicNode[];
}

export interface CreateTopicPayload {
  title: string;
  parent_id?: string | null;
}

export interface RenameTopicPayload {
  title: string;
}

export interface CreateTopicResponse {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
