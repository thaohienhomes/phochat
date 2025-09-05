import { notFound } from 'next/navigation';
import SentryClientTest from './SentryClientTest';

export const dynamic = 'force-dynamic';

export default function Page() {
  const enabled = process.env.NODE_ENV === 'development' && process.env.ENABLE_SENTRY_DEV_TOOLS === '1';
  if (!enabled) {
    notFound();
  }
  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>Sentry dev tools</h1>
      <p>Quick helpers to validate Sentry wiring in development.</p>
      <SentryClientTest />
      <div style={{ marginTop: 12 }}>
        <a href="/api/sentry-check" target="_blank" rel="noreferrer">Check server init</a>
        <span> · </span>
        <a href="/api/sentry-capture" target="_blank" rel="noreferrer">Send server event</a>
      </div>
    </div>
  );
}

