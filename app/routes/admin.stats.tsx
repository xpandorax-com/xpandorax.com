import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { createDatabase } from "~/db";
import { videos, users } from "~/db/schema";
import { sql, gte, and, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { BarChart3, TrendingUp, Eye, Users, Video, Calendar } from "lucide-react";

export async function loader({ context }: LoaderFunctionArgs) {
  const db = createDatabase(context.cloudflare.env.DB);

  // Get total views
  const [totalViews] = await db.select({ total: sql<number>`sum(views)` }).from(videos);
  const [totalLikes] = await db.select({ total: sql<number>`sum(likes)` }).from(videos);

  // Get video count by publish status
  const [publishedCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(videos)
    .where(eq(videos.isPublished, true));
  
  const [draftCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(videos)
    .where(eq(videos.isPublished, false));

  // Get premium vs free video count
  const [premiumVideoCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(videos)
    .where(eq(videos.isPremium, true));
  
  const [freeVideoCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(videos)
    .where(eq(videos.isPremium, false));

  // Get user stats
  const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [premiumUsers] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.isPremium, true));
  const [adminUsers] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "admin"));

  // Get new users in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const [newUsers] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, sevenDaysAgo));

  // Top 10 most viewed videos
  const topVideos = await db.query.videos.findMany({
    orderBy: (videos, { desc }) => [desc(videos.views)],
    limit: 10,
    with: { actress: true },
  });

  return json({
    stats: {
      totalViews: totalViews?.total || 0,
      totalLikes: totalLikes?.total || 0,
      publishedVideos: publishedCount?.count || 0,
      draftVideos: draftCount?.count || 0,
      premiumVideos: premiumVideoCount?.count || 0,
      freeVideos: freeVideoCount?.count || 0,
      totalUsers: totalUsers?.count || 0,
      premiumUsers: premiumUsers?.count || 0,
      adminUsers: adminUsers?.count || 0,
      newUsersLast7Days: newUsers?.count || 0,
    },
    topVideos,
  });
}

export default function AdminStats() {
  const { stats, topVideos } = useLoaderData<typeof loader>();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Statistics</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Views</CardTitle>
            <Eye className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Likes</CardTitle>
            <TrendingUp className="w-5 h-5 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalLikes.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
            <Users className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500">{stats.premiumUsers} premium</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">New Users (7 days)</CardTitle>
            <Calendar className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.newUsersLast7Days}</div>
          </CardContent>
        </Card>
      </div>

      {/* Video Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Published</span>
              <span className="text-green-400 font-medium">{stats.publishedVideos}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${(stats.publishedVideos / (stats.publishedVideos + stats.draftVideos)) * 100 || 0}%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Drafts</span>
              <span className="text-yellow-400 font-medium">{stats.draftVideos}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Content Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Premium Videos</span>
              <span className="text-purple-400 font-medium">{stats.premiumVideos}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{
                  width: `${(stats.premiumVideos / (stats.premiumVideos + stats.freeVideos)) * 100 || 0}%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Free Videos</span>
              <span className="text-blue-400 font-medium">{stats.freeVideos}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Videos */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Top 10 Most Viewed Videos</CardTitle>
        </CardHeader>
        <CardContent>
          {topVideos.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No videos yet</p>
          ) : (
            <div className="space-y-3">
              {topVideos.map((video, index) => (
                <div
                  key={video.id}
                  className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg"
                >
                  <span className="text-2xl font-bold text-gray-600 w-8">
                    #{index + 1}
                  </span>
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
                      {video.actress?.name || "No model"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{video.views.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">views</p>
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
