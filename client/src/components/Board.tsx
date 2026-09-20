import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormEvent, useMemo, useState } from "react";
import { socket } from "../socket";
import { COLUMNS, type Card, type ColumnId } from "../types";

export function Board({ cards, actorName }: { cards: Card[]; actorName: string }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const grouped = useMemo(() => {
    return COLUMNS.reduce(
      (acc, column) => {
        acc[column.id] = cards.filter((card) => card.columnId === column.id).sort((a, b) => a.order - b.order);
        return acc;
      },
      {} as Record<ColumnId, Card[]>,
    );
  }, [cards]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const card = cards.find((item) => item.id === active.id);
    if (!card) return;

    const overId = String(over.id);
    const overCard = cards.find((item) => item.id === overId);
    const targetColumn = (over.data.current?.columnId as ColumnId | undefined) ?? overCard?.columnId;
    if (!targetColumn) return;

    const columnCards = grouped[targetColumn].filter((item) => item.id !== card.id);
    let order = columnCards.length;
    if (overCard) {
      const overIndex = grouped[targetColumn].findIndex((item) => item.id === overCard.id);
      order = Math.max(0, overIndex);
      if (card.columnId === targetColumn) {
        const fromIndex = grouped[targetColumn].findIndex((item) => item.id === card.id);
        const moved = arrayMove(grouped[targetColumn], fromIndex, overIndex);
        order = moved.findIndex((item) => item.id === card.id);
      }
    }

    socket.emit("card:move", { id: card.id, columnId: targetColumn, order });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => (
          <Column key={column.id} id={column.id} title={column.title} hint={column.hint} cards={grouped[column.id]} />
        ))}
      </div>
      <p className="mx-auto mt-6 max-w-7xl text-xs text-slate-500">Conectado como {actorName}. Arraste os cartões entre as colunas.</p>
    </DndContext>
  );
}

function Column({ id, title, hint, cards }: { id: ColumnId; title: string; hint: string; cards: Card[] }) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { columnId: id } });
  const [open, setOpen] = useState(false);

  return (
    <section
      ref={setNodeRef}
      className={`rounded-3xl border bg-white/5 p-4 transition ${
        isOver ? "border-emerald-400/50 bg-emerald-400/5" : "border-white/10"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-xs text-slate-400">{hint}</p>
        </div>
        <span className="rounded-full bg-black/30 px-2 py-1 text-xs text-slate-300">{cards.length}</span>
      </div>

      <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-40 flex-col gap-3">
          {cards.map((card) => (
            <TaskCard key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>

      {open ? (
        <CreateCardForm
          columnId={id}
          onClose={() => setOpen(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 w-full rounded-xl border border-dashed border-white/15 px-3 py-2 text-sm text-slate-300 hover:border-emerald-400/40 hover:text-white"
        >
          + Nova tarefa
        </button>
      )}
    </section>
  );
}

function TaskCard({ card }: { card: Card }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { columnId: card.columnId },
  });
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const save = () => {
    socket.emit("card:update", { id: card.id, title, description });
    setEditing(false);
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border border-white/10 bg-[#121821] p-4 shadow-lg shadow-black/20 ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      {editing ? (
        <div className="space-y-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
          />
          <div className="flex gap-2">
            <button type="button" onClick={save} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-emerald-950">
              Salvar
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-sm text-slate-400">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <h3 {...attributes} {...listeners} className="cursor-grab text-sm font-semibold text-white active:cursor-grabbing">
              {card.title}
            </h3>
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={() => setEditing(true)} className="text-slate-400 hover:text-white">
                editar
              </button>
              <button
                type="button"
                onClick={() => socket.emit("card:delete", { id: card.id })}
                className="text-rose-300 hover:text-rose-200"
              >
                apagar
              </button>
            </div>
          </div>
          {card.description ? <p className="mt-2 text-sm leading-6 text-slate-400">{card.description}</p> : null}
          {card.updatedBy ? <p className="mt-3 text-[11px] text-slate-500">Atualizado por {card.updatedBy}</p> : null}
        </>
      )}
    </article>
  );
}

function CreateCardForm({ columnId, onClose }: { columnId: ColumnId; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    socket.emit("card:create", { title, description, columnId });
    onClose();
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-black/30 p-3">
      <input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Título da tarefa"
        className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none"
      />
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Descrição (opcional)"
        rows={2}
        className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none"
      />
      <div className="flex gap-2">
        <button type="submit" className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-emerald-950">
          Criar
        </button>
        <button type="button" onClick={onClose} className="text-sm text-slate-400">
          Cancelar
        </button>
      </div>
    </form>
  );
}
