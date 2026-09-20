import { FormEvent, useState } from "react";

export function JoinGate({ onJoin }: { onJoin: (name: string) => void }) {
  const [name, setName] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onJoin(name.trim() || "Visitante");
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur"
      >
        <p className="text-xs font-semibold tracking-[0.22em] text-emerald-400 uppercase">Realtime Kanban</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Entre no quadro</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Escolha um nome. Qualquer pessoa com o mesmo link vê os cartões se moverem ao vivo.
        </p>
        <label className="mt-6 block text-sm text-slate-300">
          Seu nome
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="ex: Gabriel"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-emerald-400/40 placeholder:text-slate-500 focus:ring-2"
          />
        </label>
        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-emerald-950 transition hover:bg-emerald-400"
        >
          Entrar no quadro
        </button>
      </form>
    </div>
  );
}
