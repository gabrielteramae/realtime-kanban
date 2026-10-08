# Realtime Kanban — quadro ao vivo com Socket.IO

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socketdotio&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)

Quadro com as colunas A fazer, Em andamento e Concluído. Quem entra manda um nome; criar, editar, mover e apagar cartão replica para os outros sockets. Presença entra e sai com a conexão.

| Escolha | Motivo |
| --- | --- |
| `BoardStore` em memória | Sobe com um processo só. Reiniciar o servidor zera os cartões |

## Stack

- React 19, TypeScript, Vite 6, Tailwind CSS 4 e `@dnd-kit` no `client`
- Express 4 e Socket.IO 4 no `server`
- Workspaces npm (`client` e `server`) e `concurrently` na raiz
- Node.js 20 ou mais novo (`engines` do `package.json`)

Eventos em `server/src/index.ts`: `join`, `board:sync`, `card:create`, `card:update`, `card:move`, `card:delete`, `presence:join`, `presence:leave`. `GET /health` responde `{ ok: true }`.

## Estrutura

```
package.json
client/index.html
client/vite.config.ts
client/src/main.tsx
client/src/App.tsx
client/src/socket.ts
client/src/components/Board.tsx
client/src/components/JoinGate.tsx
client/src/components/PresenceBar.tsx
server/src/index.ts
server/src/board.ts
server/src/types.ts
```

## Como rodar

```bash
git clone https://github.com/gabrielteramae/realtime-kanban.git
cd realtime-kanban
npm install
npm run dev
```

Front em http://localhost:5173. Socket e `GET /health` em http://localhost:3001.

`npm run build` e depois `npm start` fazem o Express servir `client/dist` na porta `PORT` (padrão 3001). `CLIENT_ORIGIN` ajusta o CORS (padrão `http://localhost:5173`). No client, `VITE_SOCKET_URL` aponta o socket quando front e servidor não estão juntos; em dev o fallback é `http://localhost:3001`.

---

© 2026 Gabriel Teramae Chan
