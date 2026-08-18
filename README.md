# BLAXE AI — 3-Hour Challenge MVP

A mobile-first personal AI web platform using the OpenAI Responses API.

## Included
- Chat with an OpenAI model
- Conversation history during the current browser session
- Web research toggle
- Image upload + image analysis
- Starter tools for ideas, writing, coding, learning and business
- Responsive phone-friendly UI
- BLAXE AI branding

## Run locally

1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run:

```bash
npm install
```

4. Copy `.env.example` to `.env`.
5. Put your API key in `.env`:

```text
OPENAI_API_KEY=your_key_here
```

6. Start:

```bash
npm start
```

7. Open `http://localhost:3000`.

## Important security note

Keep the API key on the server in `.env`. Do NOT put the key inside `public/app.js` or `index.html`, and do not share the `.env` file with friends.

## Sharing with friends

For the challenge, deploy this Node app to a server host that supports environment variables. Set `OPENAI_API_KEY` in the host's environment settings and share the resulting HTTPS URL.

## Next upgrades

- User accounts and invite-only access
- Saved conversations
- File/PDF uploads
- Voice input/output
- Image generation
- Usage limits per friend
- Admin dashboard
- Custom BLAXE AI system instructions
