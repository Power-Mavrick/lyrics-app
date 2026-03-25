interface SongPageProps {
  params: Promise<{ id: string }>;
}

export default async function SongPage({ params }: SongPageProps) {
  const { id } = await params;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Song Details</h1>
      <p className="text-gray-500">
        Viewing lyrics and details for song{" "}
        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-sm text-indigo-600">
          #{id}
        </span>
        .
      </p>
    </div>
  );
}
