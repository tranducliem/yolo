// DB-mapped types
export interface Post {
  id: string;
  userId: string;
  petId: string | null;
  photoUrl: string;
  caption: string;
  tags: string[];
  visibility: "public" | "followers" | "private";
  isDonationTagged: boolean;
  dareId: string | null;
  isBoosted: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  emotions: { happy: number; funny: number; touched: number; crying: number };
  createdAt: string;
  // JOINed fields:
  petName?: string;
  ownerName?: string;
  ownerAvatarUrl?: string;
  ambassadorLevel?: number;
  didLike?: boolean;
  didEmotion?: string[];
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  // JOINed:
  userName?: string;
  userAvatarUrl?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | "like"
    | "follow"
    | "crown"
    | "battle"
    | "dare"
    | "letter"
    | "song"
    | "order"
    | "system"
    | "donation"
    | "ambassador";
  title: string;
  body: string;
  icon: string | null;
  link: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface CrownHistory {
  id: string;
  petId: string;
  date: string;
  voteCount: number;
  views: number;
  likes: number;
  shares: number;
  mode: "auto" | "manual";
  createdAt: string;
}

// Mock types (kept for backward compat)
export interface MockBattle {
  id: string;
  pet1: {
    id: string;
    name: string;
    breed: string;
    imageUrl: string;
    votes: number;
    ambassadorLevel?: number;
  };
  pet2: {
    id: string;
    name: string;
    breed: string;
    imageUrl: string;
    votes: number;
    ambassadorLevel?: number;
  };
  round: string;
}

export interface MockCrownHistory {
  date: string;
  petId: string;
  petName: string;
  ownerName: string;
  imageUrl: string;
  views: number;
  likes: number;
  shares: number;
  mode: "auto" | "manual";
}

export interface MockDare {
  id: string;
  theme: string;
  hashtag: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: number;
  posts: number;
  status: "scheduled" | "active" | "ended" | "draft";
  rewards: { first: number; second: number; third: number; participation: number };
  isDonationChallenge?: boolean;
}

export interface MockNotification {
  id: string;
  type:
    | "like"
    | "follow"
    | "crown"
    | "battle"
    | "dare"
    | "letter"
    | "song"
    | "order"
    | "system"
    | "donation";
  icon: string;
  text: string;
  time: string;
  read: boolean;
  link: string;
}
