import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { createDatabase } from "~/db";
import { videos, categories, actresses, users } from "~/db/schema";
import { eq, sql } from "drizzle-orm";
import { Video, FolderOpen, Users, Eye, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export async function loader({ context }: LoaderFunctionArgs) {
  const db = createDatabase(context.cloudflare.env.DB);

  // Get counts
  const [videoCount] = await db.select({ count: sql<number>`count(*)` }).from(videos);
  const [categoryCount] = await db.select({ count: sql<number>`count(*)` }).from(categories);
  const [actressCount] = await db.select({ count: sql<number>`count(*)` }).from(actresses);
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [premiumUserCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.isPremium, true));

  // Get total views
  const [totalViews] = await db.select({ total: sql<number>`sum(views)` }).from(videos);

  // Get recent videos
  const recentVideos = await db.query.videos.findMany({
    orderBy: (videos, { desc }) => [desc(videos.createdAt)],
    limit: 5,
    with: { actress: true },
  });

  return json({
    stats: {
      videos: videoCount?.count || 0,
      categories: categoryCount?.count || 0,
      actresses: actressCount?.count || 0,
      users: userCount?.count || 0,
      premiumUsers: premiumUserCount?.count || 0,
      totalViews: totalViews?.total || 0,
    },
    recentVideos,
  });
}

export default function AdminDashboard() {
  const { stats, recentVideos } = useLoaderData<typeof loader>();

  const statCards = [
    { title: "Total Videos", value: stats.videos, icon: Video, color: "text-purple-500" },
    { title: "Categories", value: stats.categories, icon: FolderOpen, color: "text-blue-500" },
    { title: "Models", value: stats.actresses, icon: Users, color: "text-pink-500" },
    { title: "Total Views", value: stats.totalViews.toLocaleString(), icon: Eye, color: "text-green-500" },
    { title: "Total Users", value: stats.users, icon: TrendingUp, color: "text-yellow-500" },
    { title: "Premium Users", value: stats.premiumUsers, icon: DollarSign, color: "text-emerald-500" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Videos */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Videos</CardTitle>
        </CardHeader>
        <CardContent>
          {recentVideos.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No videos yet. Add your first video to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {recentVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg"
                >
                  <div className="w-16 h-10 bg-gray-700 rounded overflow-hidden flex-shrink-0">
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{video.title}</p>
                    <p className="text-xs text-gray-500">
                      {video.actress?.name || "No model"} • {video.views} views
                    </p>
                  </div>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
