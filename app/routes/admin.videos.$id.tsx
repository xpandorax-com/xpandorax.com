import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useActionData, Form, useNavigation, Link } from "@remix-run/react";
import { createDatabase } from "~/db";
import { videos, categories, actresses, videoCategories } from "~/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "~/lib/auth/session.server";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";

function generateId(): string {
  return crypto.randomUUID();
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function loader({ params, context }: LoaderFunctionArgs) {
  const db = createDatabase(context.cloudflare.env.DB);
  const { id } = params;

  let video = null;
  let selectedCategories: string[] = [];

  if (id && id !== "new") {
    video = await db.query.videos.findFirst({
      where: eq(videos.id, id),
    });
    
    if (!video) {
      throw new Response("Video not found", { status: 404 });
    }

    const videoCats = await db
      .select({ categoryId: videoCategories.categoryId })
      .from(videoCategories)
      .where(eq(videoCategories.videoId, id));
    
    selectedCategories = videoCats.map((vc) => vc.categoryId);
  }

  const allCategories = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });

  const allActresses = await db.query.actresses.findMany({
    orderBy: (actresses, { asc }) => [asc(actresses.name)],
  });

  return json({ video, categories: allCategories, actresses: allActresses, selectedCategories });
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  await requireAdmin(request, context);
  const db = createDatabase(context.cloudflare.env.DB);
  const { id } = params;
  const formData = await request.formData();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const abyssEmbed = formData.get("abyssEmbed") as string;
  const thumbnail = formData.get("thumbnail") as string;
  const duration = parseInt(formData.get("duration") as string) || 0;
  const actressId = formData.get("actressId") as string || null;
  const isPremium = formData.get("isPremium") === "on";
  const isPublished = formData.get("isPublished") === "on";
  const categoryIds = formData.getAll("categories") as string[];

  // Validation
  const errors: Record<string, string> = {};
  if (!title) errors.title = "Title is required";
  if (!abyssEmbed) errors.abyssEmbed = "Embed URL is required";

  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  const slug = generateSlug(title);
  const now = new Date();

  if (id && id !== "new") {
    // Update existing video
    await db
      .update(videos)
      .set({
        title,
        slug,
        description,
        abyssEmbed,
        thumbnail: thumbnail || null,
        duration,
        actressId: actressId || null,
        isPremium,
        isPublished,
        publishedAt: isPublished ? now : null,
        updatedAt: now,
      })
      .where(eq(videos.id, id));

    // Update categories
    await db.delete(videoCategories).where(eq(videoCategories.videoId, id));
    if (categoryIds.length > 0) {
      await db.insert(videoCategories).values(
        categoryIds.map((categoryId) => ({
          videoId: id,
          categoryId,
        }))
      );
    }

    return redirect("/admin/videos");
  } else {
    // Create new video
    const newId = generateId();
    
    await db.insert(videos).values({
      id: newId,
      title,
      slug,
      description,
      abyssEmbed,
      thumbnail: thumbnail || null,
      duration,
      actressId: actressId || null,
      isPremium,
      isPublished,
      views: 0,
      likes: 0,
      publishedAt: isPublished ? now : null,
      createdAt: now,
      updatedAt: now,
    });

    // Add categories
    if (categoryIds.length > 0) {
      await db.insert(videoCategories).values(
        categoryIds.map((categoryId) => ({
          videoId: newId,
          categoryId,
        }))
      );
    }

    return redirect("/admin/videos");
  }
}

export default function AdminVideoEdit() {
  const { video, categories, actresses, selectedCategories } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isNew = !video;

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Link to="/admin/videos">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white">
          {isNew ? "Add New Video" : "Edit Video"}
        </h1>
      </div>

      <Form method="post" className="space-y-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Video Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-gray-300">Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={video?.title || ""}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                placeholder="Enter video title"
              />
              {actionData?.errors?.title && (
                <p className="text-red-400 text-sm mt-1">{actionData.errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-300">Description</Label>
              <textarea
                id="description"
                name="description"
                defaultValue={video?.description || ""}
                rows={4}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter video description"
              />
            </div>

            <div>
              <Label htmlFor="abyssEmbed" className="text-gray-300">Abyss Embed URL *</Label>
              <Input
                id="abyssEmbed"
                name="abyssEmbed"
                defaultValue={video?.abyssEmbed || ""}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                placeholder="https://abyss.to/embed/..."
              />
              {actionData?.errors?.abyssEmbed && (
                <p className="text-red-400 text-sm mt-1">{actionData.errors.abyssEmbed}</p>
              )}
            </div>

            <div>
              <Label htmlFor="thumbnail" className="text-gray-300">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                name="thumbnail"
                defaultValue={video?.thumbnail || ""}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration" className="text-gray-300">Duration (seconds)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  defaultValue={video?.duration || ""}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                  placeholder="e.g., 600"
                />
              </div>

              <div>
                <Label htmlFor="actressId" className="text-gray-300">Model</Label>
                <select
                  id="actressId"
                  name="actressId"
                  defaultValue={video?.actressId || ""}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a model...</option>
                  {actresses.map((actress) => (
                    <option key={actress.id} value={actress.id}>
                      {actress.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-gray-400">
                No categories yet.{" "}
                <Link to="/admin/categories/new" className="text-purple-400 hover:underline">
                  Create one
                </Link>
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2 p-2 rounded bg-gray-800 hover:bg-gray-750 cursor-pointer"
                  >
                    <Checkbox
                      name="categories"
                      value={category.id}
                      defaultChecked={selectedCategories.includes(category.id)}
                    />
                    <span className="text-gray-300">{category.name}</span>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                name="isPremium"
                defaultChecked={video?.isPremium || false}
              />
              <div>
                <span className="text-gray-300">Premium Only</span>
                <p className="text-xs text-gray-500">Only premium subscribers can watch this video</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                name="isPublished"
                defaultChecked={video?.isPublished || false}
              />
              <div>
                <span className="text-gray-300">Published</span>
                <p className="text-xs text-gray-500">Make this video visible to users</p>
              </div>
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button asChild variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <Link to="/admin/videos">Cancel</Link>
          </Button>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isNew ? "Create Video" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}
