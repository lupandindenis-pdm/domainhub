export type FolderAccessType = 'public' | 'private';

export interface Folder {
  id: string;
  name: string;
  color: string;
  accessType: FolderAccessType;
  domainIds: string[];
  createdAt: string;
  updatedAt: string;
}

export const FOLDER_COLORS = [
  { value: "#3b82f6", label: "Синий" },
  { value: "#10b981", label: "Зелёный" },
  { value: "#f59e0b", label: "Жёлтый" },
  { value: "#ef4444", label: "Красный" },
  { value: "#8b5cf6", label: "Фиолетовый" },
  { value: "#ec4899", label: "Розовый" },
  { value: "#06b6d4", label: "Голубой" },
  { value: "#f97316", label: "Оранжевый" },
  { value: "#6b7280", label: "Серый" },
];
