export interface Category {
  id: string;
  userId: string | null;
  name: string;
  color: string;
  icon: string;
  isSystem: boolean;
  parentId: string | null;
  subCategories?: Category[];
  createdAt: string;
}

