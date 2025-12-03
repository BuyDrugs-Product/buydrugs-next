import React from "react";
import { Header } from "@/components/ui/header-3";

export default function HeaderDemoPage() {
  return (
    <div className="w-full">
      <Header />

      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-12 gap-8">
        <section className="space-y-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-(--text-tertiary)">
            Navigation Example
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-6 w-4/6 rounded-md border border-[var(--border-subtle)] bg-(--surface-muted)" />
            <div className="h-6 w-1/2 rounded-md border border-[var(--border-subtle)] bg-(--surface-muted)" />
          </div>
          <div className="mb-8 flex gap-2">
            <div className="h-3 w-14 rounded-md border border-[var(--border-subtle)] bg-(--surface-muted)" />
            <div className="h-3 w-12 rounded-md border border-[var(--border-subtle)] bg-(--surface-muted)" />
          </div>
        </section>

        {Array.from({ length: 7 }).map((_, i) => (
          <section key={i} className="space-y-2 mb-4">
            <div className="h-4 w-full rounded-md border border-[var(--border-subtle)] bg-(--surface-muted)" />
            <div className="h-4 w-full rounded-md border border-[var(--border-subtle)] bg-(--surface-muted)" />
            <div className="h-4 w-full rounded-md border border-[var(--border-subtle)] bg-(--surface-muted)" />
            <div className="h-4 w-1/2 rounded-md border border-[var(--border-subtle)] bg-(--surface-muted)" />
          </section>
        ))}
      </main>
    </div>
  );
}








