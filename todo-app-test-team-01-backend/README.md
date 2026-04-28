# Todo App — Live Coding Exercise

A starter template with a React frontend and Express backend. Your task is to complete the implementation so the app supports creating, editing, deleting, and marking todos as complete.

## Quick Start

You need **two terminals** — one for the backend, one for the frontend.

### Terminal 1 — Backend

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:3001`. You should see "✅ Backend running…" when it starts.

Test it works:

```bash
curl http://localhost:3001/todos
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser. You should see two sample todos already rendered.

## Requirements (Definition of Done)

The app should support:

1. **Create** — A form to add a new todo. Title must be 1–200 characters.
2. **Edit** — Click Edit on a todo to change its title. Same validation rules.
3. **Delete** — Click Delete to remove a todo.
4. **Complete** — Click Complete to toggle the completed state.

When a todo is **complete**:

- The row should display with the completed style (green background, strikethrough — already styled, just apply the `completed` class)
- The Complete button should still work (to un-complete)

Validation must be enforced on **both** the frontend and the backend. Empty titles or titles over 200 characters should not be accepted.

## What's Already Done

- Backend: `GET /todos` and the in-memory store
- Frontend: list rendering, loading/error states, all CSS (including the `.completed` style)
- An API client pattern for you to follow

## Auth Endpoints Added

The backend also now exposes:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

Both endpoints accept JSON bodies with `email` and `password`, returning a user object plus a session token on success.

## What We're Looking For

We're not just looking for "does it work" — we're looking at:

- **Code quality** — clean, readable, idiomatic
- **Pattern following** — the template has patterns (look at `GET /todos` and `fetchTodos`); follow them
- **Validation** — applied on both ends, with sensible error handling
- **Edge cases** — empty input, network failures, double-click protection
- **Communication** — think aloud as you work

## Notes

- In-memory storage on the backend is fine — no database needed

Good luck!
