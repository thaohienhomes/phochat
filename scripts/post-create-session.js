const BASE = 'https://pho-chat-by7v3tw38-thaohienhomes-gmailcoms-projects.vercel.app';
const TOKEN = 'eHAj5rateRnkDjbtdxG6Pn9iAk7qugmD';

async function main() {
  const res = await fetch(`${BASE}/api/createChatSession`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-vercel-protection-bypass': TOKEN,
      'x-vercel-bypass-token': TOKEN,
    },
    body: JSON.stringify({ userId: 'verify-user', model: 'gpt-4o-mini' }),
  });
  const contentType = res.headers.get('content-type');
  const text = await res.text();
  console.log('status', res.status);
  console.log('content-type', contentType);
  console.log('body', text);
}

main().catch((e) => { console.error('error', e); process.exit(1); });

