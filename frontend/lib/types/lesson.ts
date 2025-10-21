export interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration: number;
  type: "video" | "article";
  isPreviewable: boolean;
  videoUrl?: string;
  thumbnail?: string;
  resources?: Array<{
    id: string;
    title: string;
    url: string;
    type: string;
  }>;
  order: number;
  course: string;
}
