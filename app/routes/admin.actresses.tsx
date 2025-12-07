import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { createDatabase } from "~/db";
import { actresses } from "~/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "~/lib/auth/session.server";
import { Plus, Edit, Trash2, Users, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useState } from "react";

export async function loader({ context }: LoaderFunctionArgs) {
  const db = createDatabase(context.cloudflare.env.DB);

  const allActresses = await db.query.actresses.findMany({
    orderBy: [desc(actresses.createdAt)],
  });

  return json({ actresses: allActresses });
}

export async function action({ request, context }: ActionFunctionArgs) {
  await requireAdmin(request, context);
  const db = createDatabase(context.cloudflare.env.DB);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = formData.get("id") as string;
    await db.delete(actresses).where(eq(actresses.id, id));
    return json({ success: true });
  }

  return json({ error: "Invalid intent" }, { status: 400 });
}

export default function AdminActresses() {
  const { actresses: allActresses } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [search, setSearch] = useState("");

  const filteredActresses = allActresses.filter((actress) =>
    actress.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Models</h1>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link to="/admin/actresses/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Model
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search models..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-gray-900 border-gray-700 text-white"
        />
      </div>

      {/* Actresses Grid */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">
            All Models ({filteredActresses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActresses.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No models found</p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link to="/admin/actresses/new">Add Your First Model</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredActresses.map((actress) => (
                <div
                  key={actress.id}
                  className="bg-gray-800 rounded-lg overflow-hidden"
                >
                  <div className="aspect-square bg-gray-700 relative">
                    {actress.image ? (
                      <img
                        src={actress.image}
                        alt={actress.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {actress.videoCount} videos
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-1">{actress.name}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {actress.bio || "No bio"}
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        <Link to={`/admin/actresses/${actress.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <fetcher.Form
                        method="post"
                        onSubmit={(e) => {
                          if (!confirm("Are you sure you want to delete this model?")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="id" value={actress.id} />
                        <Button
                          type="submit"
                          name="intent"
                          value="delete"
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </fetcher.Form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
