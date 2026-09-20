import type { User } from "../types";

export function PresenceBar({ users, meId }: { users: User[]; meId?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs text-slate-400">{users.length} online agora</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {users.map((user) => (
          <span
            key={user.id}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-sm"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: user.color }} />
            {user.name}
            {user.id === meId ? <span className="text-xs text-slate-500">você</span> : null}
          </span>
        ))}
      </div>
    </div>
  );
}
