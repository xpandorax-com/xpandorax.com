import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { createDatabase } from "~/db";
import { categories } from "~/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "~/lib/auth/session.server";
import { Plus, Edit, Trash2, FolderOpen, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useState } from "react";

export async function loader({ context }: LoaderFunctionArgs) {
  const db = createDatabase(context.cloudflare.env.DB);

  const allCategories = await db.query.categories.findMany({
    orderBy: [desc(categories.createdAt)],
  });

  return json({ categories: allCategories });
}

export async function action({ request, context }: ActionFunctionArgs) {
  await requireAdmin(request, context);
  const db = createDatabase(context.cloudflare.env.DB);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = formData.get("id") as string;
    await db.delete(categories).where(eq(categories.id, id));
    return json({ success: true });
  }

  return json({ error: "Invalid intent" }, { status: 400 });
}

export default function AdminCategories() {
  const { categories: allCategories } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [search, setSearch] = useState("");

  const filteredCategories = allCategories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link to="/admin/categories/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-gray-900 border-gray-700 text-white"
        />
      </div>

      {/* Categories Grid */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">
            All Categories ({filteredCategories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No categories found</p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link to="/admin/categories/new">Add Your First Category</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-gray-800 rounded-lg overflow-hidden"
                >
                  <div className="aspect-video bg-gray-700 relative">
                    {category.thumbnail ? (
                      <img
                        src={category.thumbnail}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderOpen className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {category.videoCount} videos
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-1">{category.name}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {category.description || "No description"}
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        <Link to={`/admin/categories/${category.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <fetcher.Form
                        method="post"
                        onSubmit={(e) => {
                          if (!confirm("Are you sure you want to delete this category?")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="id" value={category.id} />
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
