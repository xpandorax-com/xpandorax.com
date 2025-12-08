import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { createDatabase } from "~/db";
import { comments, users } from "~/db/schema";
import { eq, desc, isNull, and } from "drizzle-orm";
import { getSession } from "~/lib/auth/session.server";

// GET: Fetch comments for a video
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const videoId = url.searchParams.get("videoId");

  if (!videoId) {
    return json({ error: "Video ID is required" }, { status: 400 });
  }

  try {
    const db = createDatabase(context.cloudflare.env.DB);

    // Fetch top-level comments with user info
    const topLevelComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        videoId: comments.videoId,
        userId: comments.userId,
        parentId: comments.parentId,
        isEdited: comments.isEdited,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        username: users.username,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(and(eq(comments.videoId, videoId), isNull(comments.parentId)))
      .orderBy(desc(comments.createdAt));

    // Fetch all replies
    const allReplies = await db
      .select({
        id: comments.id,
        content: comments.content,
        videoId: comments.videoId,
        userId: comments.userId,
        parentId: comments.parentId,
        isEdited: comments.isEdited,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        username: users.username,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.videoId, videoId))
      .orderBy(comments.createdAt);

    // Build nested comment structure
    const commentsWithReplies = topLevelComments.map((comment) => ({
      ...comment,
      replies: allReplies.filter((reply) => reply.parentId === comment.id),
    }));

    return json({ comments: commentsWithReplies });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST: Create, update, or delete a comment
export async function action({ request, context }: ActionFunctionArgs) {
  const { user } = await getSession(request, context);

  if (!user) {
    return json({ error: "You must be logged in to comment" }, { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get("_action") as string;

  const db = createDatabase(context.cloudflare.env.DB);

  try {
    switch (action) {
      case "create": {
        const videoId = formData.get("videoId") as string;
        const content = formData.get("content") as string;
        const parentId = formData.get("parentId") as string | null;

        if (!videoId || !content?.trim()) {
          return json({ error: "Video ID and content are required" }, { status: 400 });
        }

        if (content.length > 2000) {
          return json({ error: "Comment is too long (max 2000 characters)" }, { status: 400 });
        }

        const newComment = await db
          .insert(comments)
          .values({
            videoId,
            userId: user.id,
            content: content.trim(),
            parentId: parentId || null,
          })
          .returning();

        return json({ success: true, comment: newComment[0] });
      }

      case "update": {
        const commentId = formData.get("commentId") as string;
        const content = formData.get("content") as string;

        if (!commentId || !content?.trim()) {
          return json({ error: "Comment ID and content are required" }, { status: 400 });
        }

        // Check if user owns the comment
        const existingComment = await db
          .select()
          .from(comments)
          .where(eq(comments.id, commentId))
          .limit(1);

        if (!existingComment.length || existingComment[0].userId !== user.id) {
          return json({ error: "Unauthorized to edit this comment" }, { status: 403 });
        }

        const updatedComment = await db
          .update(comments)
          .set({
            content: content.trim(),
            isEdited: true,
            updatedAt: new Date(),
          })
          .where(eq(comments.id, commentId))
          .returning();

        return json({ success: true, comment: updatedComment[0] });
      }

      case "delete": {
        const commentId = formData.get("commentId") as string;

        if (!commentId) {
          return json({ error: "Comment ID is required" }, { status: 400 });
        }

        // Check if user owns the comment
        const existingComment = await db
          .select()
          .from(comments)
          .where(eq(comments.id, commentId))
          .limit(1);

        if (!existingComment.length || existingComment[0].userId !== user.id) {
          return json({ error: "Unauthorized to delete this comment" }, { status: 403 });
        }

        await db.delete(comments).where(eq(comments.id, commentId));

        return json({ success: true });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing comment action:", error);
    return json({ error: "Failed to process request" }, { status: 500 });
  }
}
