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

export const COLUMNS: { id: ColumnId; title: string; hint: string }[] = [
  { id: "todo", title: "A fazer", hint: "Backlog do time" },
  { id: "doing", title: "Em andamento", hint: "Quem está mexendo agora" },
  { id: "done", title: "Concluído", hint: "Pronto para mostrar" },
];
