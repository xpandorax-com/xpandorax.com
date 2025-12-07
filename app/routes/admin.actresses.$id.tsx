import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useActionData, Form, useNavigation, Link } from "@remix-run/react";
import { createDatabase } from "~/db";
import { actresses } from "~/db/schema";
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

  let actress = null;

  if (id && id !== "new") {
    actress = await db.query.actresses.findFirst({
      where: eq(actresses.id, id),
    });
    
    if (!actress) {
      throw new Response("Model not found", { status: 404 });
    }
  }

  return json({ actress });
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  await requireAdmin(request, context);
  const db = createDatabase(context.cloudflare.env.DB);
  const { id } = params;
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  const image = formData.get("image") as string;

  // Validation
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Name is required";

  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  const slug = generateSlug(name);
  const now = new Date();

  if (id && id !== "new") {
    // Update existing actress
    await db
      .update(actresses)
      .set({
        name,
        slug,
        bio: bio || null,
        image: image || null,
        updatedAt: now,
      })
      .where(eq(actresses.id, id));

    return redirect("/admin/actresses");
  } else {
    // Create new actress
    const newId = generateId();
    
    await db.insert(actresses).values({
      id: newId,
      name,
      slug,
      bio: bio || null,
      image: image || null,
      videoCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return redirect("/admin/actresses");
  }
}

export default function AdminActressEdit() {
  const { actress } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isNew = !actress;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Link to="/admin/actresses">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white">
          {isNew ? "Add New Model" : "Edit Model"}
        </h1>
      </div>

      <Form method="post" className="space-y-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Model Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={actress?.name || ""}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                placeholder="Enter model name"
              />
              {actionData?.errors?.name && (
                <p className="text-red-400 text-sm mt-1">{actionData.errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bio" className="text-gray-300">Biography</Label>
              <textarea
                id="bio"
                name="bio"
                defaultValue={actress?.bio || ""}
                rows={5}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter model biography"
              />
            </div>

            <div>
              <Label htmlFor="image" className="text-gray-300">Profile Image URL</Label>
              <Input
                id="image"
                name="image"
                defaultValue={actress?.image || ""}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: Square image (1:1 ratio)</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button asChild variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <Link to="/admin/actresses">Cancel</Link>
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
                {isNew ? "Create Model" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}
