import Link from "next/link";
import type { PropsWithChildren } from "react";

export function PublicPolicyPage({
  children,
  description,
  title,
}: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/" className="font-semibold">Family Life Admin</Link>
          <nav aria-label="Policy pages" className="flex gap-4 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link href="/support" className="text-muted-foreground hover:text-foreground">Support</Link>
          </nav>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p>
        <div className="mt-10 space-y-8 text-sm leading-7">{children}</div>
      </article>
    </main>
  );
}

export function PolicySection({
  children,
  title,
}: PropsWithChildren<{ title: string }>) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-2 space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}
