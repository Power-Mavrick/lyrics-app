import { requireAuth } from "@/lib/requireAuth";
import SearchUI from "./_components/SearchUI";

export default async function SearchPage() {
  const user = await requireAuth();
  return <SearchUI username={user.username} />;
}
