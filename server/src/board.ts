import { randomUUID } from "node:crypto";
import type { Card, ColumnId, CreateCardPayload, MoveCardPayload, UpdateCardPayload } from "./types.js";

const USER_COLORS = ["#22c55e", "#38bdf8", "#a78bfa", "#f472b6", "#fbbf24", "#fb7185", "#34d399"];

export function pickColor(index: number): string {
  return USER_COLORS[index % USER_COLORS.length];
}

export function createInitialCards(): Card[] {
  const now = Date.now();
  return [
    {
      id: randomUUID(),
      title: "Definir colunas do quadro",
      description: "A fazer, em andamento e concluído.",
      columnId: "todo",
      order: 0,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      title: "Convidar o time",
      description: "Abra o mesmo link em outra aba e entre com outro nome.",
      columnId: "todo",
      order: 1,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      title: "Arrastar cartões ao vivo",
      description: "Mova uma tarefa e veja o outro usuário atualizar na hora.",
      columnId: "doing",
      order: 0,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      title: "WebSocket conectado",
      description: "Socket.IO sincroniza o quadro entre todos os clientes.",
      columnId: "done",
      order: 0,
      updatedAt: now,
    },
  ];
}

export class BoardStore {
  private cards: Card[];

  constructor(cards: Card[] = createInitialCards()) {
    this.cards = cards;
  }

  snapshot(): Card[] {
    return [...this.cards].sort((a, b) => a.order - b.order);
  }

  create(payload: CreateCardPayload, actor?: string): Card {
    const columnId: ColumnId = payload.columnId ?? "todo";
    const order = this.cards.filter((card) => card.columnId === columnId).length;
    const card: Card = {
      id: randomUUID(),
      title: payload.title.trim() || "Nova tarefa",
      description: payload.description?.trim() ?? "",
      columnId,
      order,
      updatedBy: actor,
      updatedAt: Date.now(),
    };
    this.cards.push(card);
    return card;
  }

  update(payload: UpdateCardPayload, actor?: string): Card | null {
    const card = this.cards.find((item) => item.id === payload.id);
    if (!card) return null;
    if (typeof payload.title === "string") card.title = payload.title.trim() || card.title;
    if (typeof payload.description === "string") card.description = payload.description.trim();
    card.updatedBy = actor;
    card.updatedAt = Date.now();
    return card;
  }

  move(payload: MoveCardPayload, actor?: string): Card | null {
    const card = this.cards.find((item) => item.id === payload.id);
    if (!card) return null;

    const fromColumn = card.columnId;
    const toColumn = payload.columnId;
    const targetOrder = Math.max(0, payload.order);

    const source = this.cards
      .filter((item) => item.columnId === fromColumn && item.id !== card.id)
      .sort((a, b) => a.order - b.order);
    source.forEach((item, index) => {
      item.order = index;
    });

    const destination = this.cards
      .filter((item) => item.columnId === toColumn && item.id !== card.id)
      .sort((a, b) => a.order - b.order);

    const clamped = Math.min(targetOrder, destination.length);
    destination.splice(clamped, 0, card);
    destination.forEach((item, index) => {
      item.order = index;
    });

    card.columnId = toColumn;
    card.updatedBy = actor;
    card.updatedAt = Date.now();
    return card;
  }

  delete(id: string): Card | null {
    const index = this.cards.findIndex((card) => card.id === id);
    if (index === -1) return null;
    const [removed] = this.cards.splice(index, 1);
    this.cards
      .filter((card) => card.columnId === removed.columnId)
      .sort((a, b) => a.order - b.order)
      .forEach((card, order) => {
        card.order = order;
      });
    return removed;
  }
}
