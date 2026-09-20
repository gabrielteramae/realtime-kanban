import { useEffect, useMemo, useState } from "react";
import { Board } from "./components/Board";
import { JoinGate } from "./components/JoinGate";
import { PresenceBar } from "./components/PresenceBar";
import { socket } from "./socket";
import type { BoardState, Card, User } from "./types";

export default function App() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activity, setActivity] = useState<string | null>(null);
  const me = useMemo(() => users.find((user) => user.id === socket.id), [users]);

  useEffect(() => {
    if (!joined) return;

    const flash = (message: string) => {
      setActivity(message);
      window.setTimeout(() => setActivity(null), 2800);
    };

    const onSync = (state: BoardState) => {
      setCards(state.cards);
      setUsers(state.users);
    };
    const onCreated = ({ card, actor }: { card: Card; actor?: string }) => {
      setCards((current) => (current.some((item) => item.id === card.id) ? current : [...current, card]));
      if (actor && actor !== name) flash(`${actor} criou “${card.title}”`);
    };
    const onUpdated = ({ card, actor }: { card: Card; actor?: string }) => {
      setCards((current) => current.map((item) => (item.id === card.id ? card : item)));
      if (actor && actor !== name) flash(`${actor} editou “${card.title}”`);
    };
    const onDeleted = ({ id, actor }: { id: string; actor?: string }) => {
      setCards((current) => {
        const removed = current.find((card) => card.id === id);
        if (actor && actor !== name && removed) flash(`${actor} removeu “${removed.title}”`);
        return current.filter((card) => card.id !== id);
      });
    };
    const onActivity = ({ card, actor }: { card: Card; actor?: string }) => {
      if (actor && actor !== name) flash(`${actor} moveu “${card.title}”`);
    };
    const onPresenceJoin = (user: User) => {
      setUsers((current) => (current.some((item) => item.id === user.id) ? current : [...current, user]));
      if (user.name !== name) flash(`${user.name} entrou no quadro`);
    };
    const onPresenceLeave = ({ id, name: leftName }: { id: string; name: string }) => {
      setUsers((current) => current.filter((user) => user.id !== id));
      flash(`${leftName} saiu`);
    };
    const onConnect = () => {
      socket.emit("join", { name });
    };

    socket.on("board:sync", onSync);
    socket.on("card:created", onCreated);
    socket.on("card:updated", onUpdated);
    socket.on("card:deleted", onDeleted);
    socket.on("activity", onActivity);
    socket.on("presence:join", onPresenceJoin);
    socket.on("presence:leave", onPresenceLeave);
    socket.on("connect", onConnect);

    if (socket.connected) onConnect();
    else socket.connect();

    return () => {
      socket.off("board:sync", onSync);
      socket.off("card:created", onCreated);
      socket.off("card:updated", onUpdated);
      socket.off("card:deleted", onDeleted);
      socket.off("activity", onActivity);
      socket.off("presence:join", onPresenceJoin);
      socket.off("presence:leave", onPresenceLeave);
      socket.off("connect", onConnect);
    };
  }, [joined, name]);

  const join = (nextName: string) => {
    setName(nextName);
    setJoined(true);
  };

  if (!joined) {
    return <JoinGate onJoin={join} />;
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8">
      <header className="mx-auto mb-6 flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">Tempo real</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Quadro colaborativo</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Vários usuários no mesmo quadro, atualizando ao vivo com WebSocket. Abra outra aba para ver as mudanças
            aparecerem na hora.
          </p>
        </div>
        <PresenceBar users={users} meId={me?.id} />
      </header>

      {activity ? (
        <div className="mx-auto mb-4 max-w-7xl rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {activity}
        </div>
      ) : null}

      <Board cards={cards} actorName={name} />
    </div>
  );
}
