import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Phoenix Flight Training" },
      { name: "description", content: "Phoenix Flight Training — coming soon." },
    ],
  }),
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <h1 className="text-3xl font-semibold text-foreground">Phoenix Flight Training</h1>
    </main>
  );
}
