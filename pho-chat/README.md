This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Routes for Convex testing

Create a chat session:

```bash
curl -X POST http://localhost:3000/api/createChatSession \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-123","model":"gpt-4o-mini"}'
```

Send a message to a session:

```bash
curl -X POST http://localhost:3000/api/test-sendMessage \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"<CONVEX_DOC_ID>","content":"Hello from test"}'
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) and ensure environment variables are set in Vercel.
