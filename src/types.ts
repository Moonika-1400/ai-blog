export type PostStatus = "draft" | "published";
export type ContentType = "blog" | "journal";

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  status: PostStatus;
  contentType: ContentType;
  mood?: string; // Standard journal moods like "😊 Happy", "✍️ Reflective", "🎯 Focused", "🧠 Learning"
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  promptUsed?: string;
  featuredImageSeed?: string; // Seed for displaying beautiful abstract featured illustration
}

export type WritingTone = "creative" | "academic" | "casual" | "reflective";

export interface GenerationConfig {
  prompt: string;
  tone: WritingTone;
  length: "short" | "medium" | "long";
  keywords: string[];
}
