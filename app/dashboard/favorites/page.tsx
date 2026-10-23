import { MemoryBrowser } from "@/components/memories/MemoryBrowser";

export default function FavoritesPage() {
  return (
    <div>
      <h1 className="mx-auto mb-8 max-w-6xl font-display text-3xl font-semibold tracking-tight">Favorites</h1>
      <MemoryBrowser favoritesOnly />
    </div>
  );
}