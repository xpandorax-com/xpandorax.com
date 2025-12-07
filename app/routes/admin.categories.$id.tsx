import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useActionData, Form, useNavigation, Link } from "@remix-run/react";
import { createDatabase } from "~/db";
import { categories } from "~/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "~/lib/auth/session.server";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

function generateId(): string {
  return crypto.randomUUID();
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function loader({ params, context }: LoaderFunctionArgs) {
  const db = createDatabase(context.cloudflare.env.DB);
  const { id } = params;

  let category = null;

  if (id && id !== "new") {
    category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });
    
    if (!category) {
      throw new Response("Category not found", { status: 404 });
    }
  }

  return json({ category });
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  await requireAdmin(request, context);
  const db = createDatabase(context.cloudflare.env.DB);
  const { id } = params;
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const thumbnail = formData.get("thumbnail") as string;
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

  // Validation
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Name is required";

  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  const slug = generateSlug(name);
  const now = new Date();

  if (id && id !== "new") {
    // Update existing category
    await db
      .update(categories)
      .set({
        name,
        slug,
        description: description || null,
        thumbnail: thumbnail || null,
        sortOrder,
        updatedAt: now,
      })
      .where(eq(categories.id, id));

    return redirect("/admin/categories");
  } else {
    // Create new category
    const newId = generateId();
    
    await db.insert(categories).values({
      id: newId,
      name,
      slug,
      description: description || null,
      thumbnail: thumbnail || null,
      videoCount: 0,
      sortOrder,
      createdAt: now,
      updatedAt: now,
    });

    return redirect("/admin/categories");
  }
}

export default function AdminCategoryEdit() {
  const { category } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isNew = !category;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Link to="/admin/categories">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white">
          {isNew ? "Add New Category" : "Edit Category"}
        </h1>
      </div>

      <Form method="post" className="space-y-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Category Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={category?.name || ""}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                placeholder="Enter category name"
              />
              {actionData?.errors?.name && (
                <p className="text-red-400 text-sm mt-1">{actionData.errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-300">Description</Label>
              <textarea
                id="description"
                name="description"
                defaultValue={category?.description || ""}
                rows={3}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter category description"
              />
            </div>

            <div>
              <Label htmlFor="thumbnail" className="text-gray-300">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                name="thumbnail"
                defaultValue={category?.thumbnail || ""}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="sortOrder" className="text-gray-300">Sort Order</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                defaultValue={category?.sortOrder || 0}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button asChild variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <Link to="/admin/categories">Cancel</Link>
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
                {isNew ? "Create Category" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}
