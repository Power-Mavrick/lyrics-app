import { requireAuth } from "@/lib/requireAuth";
import AddForm from "./_components/AddForm";

interface AddPageProps {
  searchParams: Promise<{ title?: string; artist?: string }>;
}

export default async function AddPage({ searchParams }: AddPageProps) {
  await requireAuth();
  const { title = "", artist = "" } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Add Lyrics</h1>
        <p className="text-gray-500 text-sm">
          Contribute lyrics to the Lyrics Finder library.
        </p>
      </div>
      <AddForm initialTitle={title} initialArtist={artist} />
    </div>
  );
}
