# Realtime Kanban

Quadro Kanban colaborativo em tempo real. Vários usuários entram no mesmo board e veem cartões serem criados, editados, movidos e apagados **ao vivo**, via WebSocket.

Feito para portfólio: a parte que mais impressiona é a sincronização instantânea — abra duas janelas e arraste um cartão.

## Stack

- **React 19 + Vite + TypeScript + Tailwind CSS 4** — interface do quadro
- **Express + Socket.IO** — servidor HTTP e canal em tempo real
- **@dnd-kit** — arrastar e soltar entre colunas

## O que o app faz

- Entrada com nome (sem cadastro)
- Presença: quem está online no quadro
- Colunas *A fazer / Em andamento / Concluído*
- Criar, editar, apagar e reordenar cartões
- Broadcast imediato para todos os clientes conectados
- Toasts de atividade (“Maria moveu …”)

O estado do quadro fica **em memória** no servidor (reiniciar o processo zera o board). É proposital para o demo ficar simples de rodar.

## Como rodar

```bash
npm install
npm run dev
```

- Front: [http://localhost:5173](http://localhost:5173)
- API / Socket.IO: [http://localhost:3001](http://localhost:3001)

Abra o front em duas abas, entre com nomes diferentes e mova um cartão.

## Produção local

```bash
npm run build
npm start
```

O servidor entrega o `client/dist` na porta `3001`.

Variáveis opcionais:

| Variável | Padrão | Uso |
| --- | --- | --- |
| `PORT` | `3001` | Porta do servidor |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS do Socket.IO em desenvolvimento |
| `VITE_SOCKET_URL` | (mesmo origin) | URL do socket se o front e o server estiverem separados |
