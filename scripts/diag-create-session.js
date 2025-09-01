const BASE = 'https://pho-chat-by7v3tw38-thaohienhomes-gmailcoms-projects.vercel.app';
const TOKEN = 'eHAj5rateRnkDjbtdxG6Pn9iAk7qugmD';

async function main() {
  const headers = {
    'x-vercel-protection-bypass': TOKEN,
    'x-vercel-bypass-token': TOKEN,
  };
  const hjson = { ...headers, 'content-type': 'application/json' };

  const r1 = await fetch(`${BASE}/api/createChatSessionDiag`, { headers });
  const t1 = await r1.text();
  console.log('GET /api/createChatSessionDiag', r1.status, t1);

  const r2 = await fetch(`${BASE}/api/createChatSessionDiag`, {
    method: 'POST',
    headers: hjson,
    body: JSON.stringify({ userId: 'verify-user', model: 'gpt-4o-mini' }),
  });
  const t2 = await r2.text();
  console.log('POST /api/createChatSessionDiag', r2.status, t2);
}

main().catch((e) => { console.error('error', e); process.exit(1); });

