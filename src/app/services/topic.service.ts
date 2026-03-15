import { request } from "@/app/lib/api";
import {
  TopicNode,
  CreateTopicPayload,
  CreateTopicResponse,
} from "@/app/types/topic.types";

export const topicsService = {
  /**
   * GET TOPIC TREE
   */
  getTree(): Promise<TopicNode[]> {
    return request<TopicNode[]>("/topics", {
      method: "GET",
    });
  },

  /**
   * CREATE TOPIC
   */
  create(payload: CreateTopicPayload): Promise<CreateTopicResponse> {
    return request<CreateTopicResponse>("/topics", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * GET TOPIC BY ID
   */
  getById(id: string): Promise<TopicNode> {
    return request<TopicNode>(`/topics/${id}`, {
      method: "GET",
    });
  },

  /**
   * SOFT DELETE TOPIC
   */
  remove(id: string): Promise<{ count: number }> {
    return request<{ count: number }>(`/topics/${id}`, {
      method: "DELETE",
    });
  },
};
