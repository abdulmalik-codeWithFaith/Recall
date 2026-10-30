# RecallAI

**Stop solving the same bug twice.**

RecallAI is a personal memory for developers. Save the problems you've solved, the code that fixed them and the lessons behind them. Later, find them by describing the problem in your own words, with no need to remember the original keywords.

**Live:** https://recall-steel-pi.vercel.app

## Features

- **Passkey sign-in.** No email, password or phone number. Create an account with your name and a passkey (fingerprint, face or device PIN).
- **Semantic search.** Describe a problem in different words and RecallAI finds the memory by meaning.
- **Memory library.** Save problems, solutions, code snippets, a language, tags and a source link. Edit, delete and favorite them.
- **Filters.** Grid and list views, title search, language and tag filters, sorting and pagination.
- **Code display.** Syntax highlighting with one-click copy.
- **Dashboard.** Real stats from your own data: memories, favorites, searches and technologies.
- **Settings.** Profile name, light, dark or system theme, and passkey management (add, rename, remove).
- **Private by design.** Every memory belongs to one user and is checked on the server for every request.

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js 16 (App Router), React, TypeScript |
| UI | Tailwind CSS, Framer Motion, Lucide React, Sonner |
| Forms and validation | React Hook Form, Zod |
| Content | Shiki (syntax highlighting), React Markdown |
| Backend | Next.js route handlers, Appwrite Server SDK |
| Auth | Appwrite Authentication (native passkeys), `@simplewebauthn/browser` |
| Database | Appwrite TablesDB |
| Embeddings | Appwrite Embeddings (`nomic-embed-text`, 768 dimensions) |
| Hosting | Vercel |

## How it works

```
Browser ──► Next.js route handlers (secrets stay here) ──► Appwrite Auth / TablesDB / Embeddings
```

**Passkey auth**

- **Sign up:** the server creates a name-only account with an internal unique ID. The browser registers a passkey with Appwrite, and the server issues an HTTP-only session cookie only after it confirms a passkey was saved. If sign-up fails or is cancelled, the half-made account is deleted.
- **Sign in:** the browser gets a challenge from Appwrite and you verify with your passkey. Appwrite returns a one-time token, which the server exchanges for the session cookie.
- **Sessions:** the cookie (`recall_session`) is HTTP-only. Every API route validates it with Appwrite, and `proxy.ts` only does a fast redirect.

**Semantic search**

1. When you save a memory, the server builds text from its title, problem, solution, language and tags, and asks Appwrite Embeddings for a 768-dimension vector.
2. The vector is stored in the memory's row, as base64-encoded float32 in a text column.
3. When you search, the query is embedded with the same model, then compared by cosine similarity against your own rows only. Results are returned closest first.
4. Editing re-embeds a memory only when its searchable content changes. Favoriting never does.

Ranking happens in server code, which is fast at personal scale (hundreds to a few thousand memories per user).

## Getting started

### 1. Install

```bash
git clone https://github.com/abdulmalik-codeWithFaith/Recall.git
cd Recall
npm install --legacy-peer-deps
```

### 2. Set up Appwrite

In the [Appwrite Console](https://cloud.appwrite.io/console):

1. **Create a project.** Note the Project ID and API endpoint.
2. **Platforms.** Under Overview → Integrations → Platforms, add a **Web** platform for `localhost` and another for your deployed domain (hostname only, no `https://`).
3. **Passkeys.** Under Auth → Settings, enable **Passkey** and set the relying party domain to your deployed domain. This is locked once any passkey exists.
4. **Database.** Create a **TablesDB** database and note its ID.
5. **Table.** Create a table and note its ID, then add these columns (keys are case-sensitive):

   | Column | Type | Notes |
   |---|---|---|
   | `userId` | String (36) | required |
   | `title` | String (255) | required |
   | `problem` | Text | required |
   | `solution` | Text | required |
   | `code` | Text | optional |
   | `language` | String (30) | required |
   | `tags` | String (40) | array, optional |
   | `sourceUrl` | String (2048) | optional |
   | `isFavorite` | Boolean | optional, default `false` |
   | `embedding` | Text | required |
   | `embeddingModel` | String (40) | optional |

   If your Console only offers String for large fields, use size 20000 for `problem`, `solution` and `embedding`, and 50000 for `code`.
6. **Index.** Add a `key` index on `userId`.
7. **Row security.** Turn it on, and leave table-level permissions empty.
8. **API key.** Under Overview → Integrations → API keys, create a key with these scopes: `users.read`, `users.write`, `sessions.write`, `rows.read`, `rows.write`, `tables.read`, `databases.read`, `embeddings.write`.

### 3. Environment variables

Create `.env.local` in the project root:

```bash
# Server only. Never prefix these with NEXT_PUBLIC_.
APPWRITE_ENDPOINT=https://<REGION>.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
APPWRITE_DB_ID=            # the database ID, not the table ID
APPWRITE_TABLE_ID=         # the table ID
SEARCH_MIN_SCORE=0.35      # optional cosine cutoff, tune for your data

# Public values (safe in the browser)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://<REGION>.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
```

### 4. Run

```bash
npm run dev
```

Open **http://localhost:3000** (use `localhost`, not `127.0.0.1`, because passkeys don't work on the IP address). To check your Appwrite connection, open `/api/health`. It only runs in development and tests the API key, the database and the embeddings service.

## Deploying to Vercel

1. Import the repository in Vercel.
2. Add every variable from `.env.local` under Settings → Environment Variables.
3. Deploy, and **redeploy after any variable change**, because Vercel applies changes only to new builds.
4. Make sure the live domain is an Appwrite Web platform and matches the passkey relying party domain.

Passkeys only work on the domains configured in Appwrite, so Vercel preview URLs won't work. Test on the main domain.

## Project structure

```
app/
  page.tsx                      Landing page
  (auth)/login, register        Passkey sign-in and sign-up
  dashboard/                    Overview, memories, search, favorites, settings
  api/auth/…                    Sign-up, session, logout, profile, passkey management
  api/memories, search, stats   Core API
components/                     auth, dashboard, layout, memories, search, settings, ui
hooks/                          useTheme, useUser
lib/                            api client, passkey client, embeddings, memory data layer
  appwrite/                     browser.ts (public), server.ts (secrets)
  validation/                   Zod schemas
types/                          Shared types
proxy.ts                        Redirects signed-out visitors away from /dashboard
```

## API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup/start`, `finish`, `abort` | Passkey sign-up steps |
| POST | `/api/auth/session` | Finish sign-in, set the session cookie |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/logout` | End the session |
| PATCH | `/api/auth/profile` | Update the display name |
| GET, POST | `/api/auth/passkeys`, `options`, `verify` | List and add passkeys |
| PATCH, DELETE | `/api/auth/passkeys/[id]` | Rename or remove a passkey (the last one can't be removed) |
| GET, POST | `/api/memories` | List and create memories |
| GET, PATCH, DELETE | `/api/memories/[id]` | Read, update and delete one memory |
| POST | `/api/search` | Semantic search |
| GET | `/api/stats` | Dashboard statistics |

All routes except sign-up and session creation require a valid session, and every memory query is scoped to the signed-in user's ID taken from that session.

## Security notes

- The Appwrite API key stays on the server and is never exposed to the browser.
- Passkeys store public keys only, and no biometric data ever leaves your device.
- Memories are written with owner-only row permissions, and the server also checks ownership on every read, update and delete. Another user's memory returns a 404.
- Markdown content is rendered without raw HTML.

## Known limitations

- **No account recovery.** There's no email, so losing every passkey locks the account. Add a passkey on more than one device, or use a synced passkey (iCloud Keychain, Google Password Manager).
- **No rate limiting** on sign-up or search yet. Search spends embedding tokens on every call.
- **Abandoned sign-ups** (a browser closed mid-way) can leave an account with no passkey, with no cleanup job yet.
- **Search ranking** happens in server code over your own rows, so it suits personal-scale data.

## Troubleshooting

| Message | Likely cause |
|---|---|
| "Passkeys are not configured" | Relying party not set in Auth → Settings, or the domain isn't a Web platform |
| `user_passkey_invalid` | Opened on an address that isn't configured (such as `127.0.0.1` or a preview URL) |
| "Database with the requested ID could not be found" | `APPWRITE_DB_ID` is wrong, or you used the table ID by mistake |
| "Couldn't reach Appwrite" | Network problem, VPN or wrong endpoint |
| Missing scope error | Add the named scope to the API key |
| Search finds too little or too much | Tune `SEARCH_MIN_SCORE` |

## License

MIT