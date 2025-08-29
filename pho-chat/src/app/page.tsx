import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen p-8 font-sans">
      <main className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-semibold">pho-chat</h1>
        <Card className="space-y-4 p-6">
          <p className="text-muted-foreground">
            shadcn/ui + Tailwind styles working if this button looks styled:
          </p>
          <div className="flex items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </Card>
        <div className="pt-8">
          <a
            className="inline-flex items-center gap-2 text-sm underline underline-offset-4"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={18}
              height={18}
            />
            Next.js Docs
          </a>
        </div>
      </main>
    </div>
  );
}
