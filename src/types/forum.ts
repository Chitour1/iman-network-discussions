
export interface Topic {
  id: string;
  title: string;
  content: string;
  view_count: number;
  reply_count: number;
  like_count: number;
  is_pinned: boolean;
  created_at: string;
  author_id: string;
  category_id: string;
  slug: string;
  profiles: {
    display_name: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
  } | null;
  categories: {
    name: string;
    color: string;
  } | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  topic_count: number;
  comment_count: number;
  view_count: number;
  recent_topics_count: number;
}

export interface ForumStatsData {
  totalTopics: number;
  totalUsers: number;
  onlineUsers: number;
}

export interface TopMember {
  id: string;
  username: string;
  display_name: string;
  post_count: number;
  reputation_score: number;
}

export interface LatestMember {
  id: string;
  username: string;
  display_name: string;
}

