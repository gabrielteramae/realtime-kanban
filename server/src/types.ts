export const COLUMN_IDS = ["todo", "doing", "done"] as const;
export type ColumnId = (typeof COLUMN_IDS)[number];

export interface Card {
  id: string;
  title: string;
  description: string;
  columnId: ColumnId;
  order: number;
  updatedBy?: string;
  updatedAt: number;
}

export interface User {
  id: string;
  name: string;
  color: string;
}

export interface BoardState {
  cards: Card[];
  users: User[];
}

export interface CreateCardPayload {
  title: string;
  description?: string;
  columnId?: ColumnId;
}

export interface UpdateCardPayload {
  id: string;
  title?: string;
  description?: string;
}

export interface MoveCardPayload {
  id: string;
  columnId: ColumnId;
  order: number;
}
