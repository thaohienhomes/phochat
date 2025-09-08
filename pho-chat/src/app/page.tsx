"use client";

import * as React from 'react';
import { ChatRoot } from './_chat-root';

export default function Home() {
  return (
    <React.Suspense fallback={<div />}>
      <ChatRoot />
    </React.Suspense>
  );
}