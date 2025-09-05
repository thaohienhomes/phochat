'use client';
import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';

export default function SentryClientTest() {
  const [clientSent, setClientSent] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
      <div>
        <button
          onClick={() => {
            Sentry.captureException(new Error('Client test error'));
            setClientSent(true);
          }}
          style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6 }}
        >
          Send client error to Sentry
        </button>
        {clientSent ? <span style={{ marginLeft: 8 }}>Sent!</span> : null}
      </div>
      <div>
        <button
          onClick={async () => {
            setLoading(true);
            setServerMsg(null);
            try {
              const res = await fetch('/api/sentry-capture');
              setServerMsg(res.ok ? 'Server event sent!' : `Failed (${res.status})`);
            } catch (e) {
              setServerMsg('Request failed');
            } finally {
              setLoading(false);
            }
          }}
          style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6 }}
        >
          {loading ? 'Sending…' : 'Send server error to Sentry'}
        </button>
        {serverMsg ? <span style={{ marginLeft: 8 }}>{serverMsg}</span> : null}
      </div>
    </div>
  );
}

