const BASE = process.env.BASE;
const TOKEN = process.env.VERCEL_BYPASS_TOKEN;

async function main() {
  const res = await fetch(`${BASE}/api/createChatSession`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-vercel-protection-bypass': TOKEN,
      'x-vercel-bypass-token': TOKEN,
    },
    body: JSON.stringify({ model: 'gpt-4o-mini' }),
  });
  const text = await res.text();
  console.log('status', res.status);
  console.log('body', text.slice(0, 300));
}

main().catch((e) => { console.error('error', e); process.exit(1); });

