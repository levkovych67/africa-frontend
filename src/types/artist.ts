export interface Artist {
  id: string;
  slug: string;
  name: string;
  bio: string;
  image: string | null;
  socialLinks: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
