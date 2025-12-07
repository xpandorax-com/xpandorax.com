import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { createDatabase } from "~/db";
import { videos, videoCategories, videoActresses } from "~/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "~/lib/auth/session.server";
import { Plus, Edit, Trash2, Eye, EyeOff, Video, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useState } from "react";

export async function loader({ context }: LoaderFunctionArgs) {
  const db = createDatabase(context.cloudflare.env.DB);

  const allVideos = await db.query.videos.findMany({
    orderBy: [desc(videos.createdAt)],
    with: {
      actress: true,
    },
  });

  return json({ videos: allVideos });
}

export async function action({ request, context }: ActionFunctionArgs) {
  await requireAdmin(request, context);
  const db = createDatabase(context.cloudflare.env.DB);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = formData.get("id") as string;
    
    // Delete related records first
    await db.delete(videoCategories).where(eq(videoCategories.videoId, id));
    await db.delete(videoActresses).where(eq(videoActresses.videoId, id));
    await db.delete(videos).where(eq(videos.id, id));
    
    return json({ success: true });
  }

  if (intent === "toggle-publish") {
    const id = formData.get("id") as string;
    const isPublished = formData.get("isPublished") === "true";
    
    await db
      .update(videos)
      .set({
        isPublished: !isPublished,
        publishedAt: !isPublished ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(videos.id, id));
    
    return json({ success: true });
  }

  return json({ error: "Invalid intent" }, { status: 400 });
}

export default function AdminVideos() {
  const { videos: allVideos } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [search, setSearch] = useState("");

  const filteredVideos = allVideos.filter((video) =>
    video.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Videos</h1>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link to="/admin/videos/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Video
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search videos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-gray-900 border-gray-700 text-white"
        />
      </div>

      {/* Videos Grid */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">
            All Videos ({filteredVideos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No videos found</p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link to="/admin/videos/new">Add Your First Video</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Video</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Model</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Views</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVideos.map((video) => (
                    <tr key={video.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                            {video.thumbnail ? (
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium truncate max-w-[200px]">
                              {video.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {video.actress?.name || "-"}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {video.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              video.isPublished
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {video.isPublished ? "Published" : "Draft"}
                          </span>
                          {video.isPremium && (
                            <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                              Premium
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <fetcher.Form method="post">
                            <input type="hidden" name="id" value={video.id} />
                            <input type="hidden" name="isPublished" value={video.isPublished.toString()} />
                            <Button
                              type="submit"
                              name="intent"
                              value="toggle-publish"
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white"
                              title={video.isPublished ? "Unpublish" : "Publish"}
                            >
                              {video.isPublished ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </fetcher.Form>
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                          >
                            <Link to={`/admin/videos/${video.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <fetcher.Form
                            method="post"
                            onSubmit={(e) => {
                              if (!confirm("Are you sure you want to delete this video?")) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <input type="hidden" name="id" value={video.id} />
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
