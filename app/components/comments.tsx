import { useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { MessageCircle, Reply, Edit2, Trash2, Send, X } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  videoId: string;
  userId: string;
  parentId: string | null;
  isEdited: number;
  createdAt: string;
  updatedAt: string;
  username: string | null;
  replies?: Comment[];
}

interface CommentsResponse {
  comments?: Comment[];
  error?: string;
}

interface ActionResponse {
  success?: boolean;
  error?: string;
  comment?: Comment;
}

interface CommentsProps {
  videoId: string;
  currentUserId?: string;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
}: {
  comment: Comment;
  currentUserId?: string;
  onReply: (commentId: string) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  depth?: number;
}) {
  const isOwner = currentUserId === comment.userId;
  const maxDepth = 3;

  return (
    <div className={`${depth > 0 ? "ml-8 border-l-2 border-gray-700 pl-4" : ""}`}>
      <div className="flex gap-3 py-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-pink-600 text-white text-xs">
            {comment.username?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white text-sm">
              {comment.username || "Anonymous"}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
            {comment.isEdited === 1 && (
              <span className="text-xs text-gray-500">(edited)</span>
            )}
          </div>
          <p className="text-gray-300 text-sm mt-1 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          <div className="flex items-center gap-4 mt-2">
            {depth < maxDepth && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-xs text-gray-500 hover:text-pink-500 flex items-center gap-1 transition-colors"
              >
                <Reply className="h-3 w-3" />
                Reply
              </button>
            )}
            {isOwner && (
              <>
                <button
                  onClick={() => onEdit(comment)}
                  className="text-xs text-gray-500 hover:text-blue-500 flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-1">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Comments({ videoId, currentUserId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetcher = useFetcher<ActionResponse>();

  // Fetch comments on mount
  useEffect(() => {
    fetch(`/api/comments?videoId=${videoId}`)
      .then((res) => res.json() as Promise<CommentsResponse>)
      .then((data) => {
        if (data.comments) {
          setComments(data.comments);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch comments:", err);
        setIsLoading(false);
      });
  }, [videoId]);

  // Refetch after successful action
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      fetch(`/api/comments?videoId=${videoId}`)
        .then((res) => res.json() as Promise<CommentsResponse>)
        .then((data) => {
          if (data.comments) {
            setComments(data.comments);
          }
        });
      setNewComment("");
      setReplyingTo(null);
      setEditingComment(null);
      setEditContent("");
    }
  }, [fetcher.state, fetcher.data, videoId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    fetcher.submit(
      {
        _action: "create",
        videoId,
        content: newComment,
        ...(replyingTo ? { parentId: replyingTo } : {}),
      },
      { method: "POST", action: "/api/comments" }
    );
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComment || !editContent.trim()) return;

    fetcher.submit(
      {
        _action: "update",
        commentId: editingComment.id,
        content: editContent,
      },
      { method: "POST", action: "/api/comments" }
    );
  };

  const handleDelete = (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    fetcher.submit(
      {
        _action: "delete",
        commentId,
      },
      { method: "POST", action: "/api/comments" }
    );
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
    setReplyingTo(null);
  };

  const startReply = (commentId: string) => {
    setReplyingTo(commentId);
    setEditingComment(null);
  };

  const cancelAction = () => {
    setReplyingTo(null);
    setEditingComment(null);
    setEditContent("");
  };

  const isSubmitting = fetcher.state === "submitting";

  return (
    <div className="bg-gray-900 rounded-lg p-4 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-pink-500" />
        <h3 className="text-lg font-semibold text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* New comment form */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-pink-600 text-white text-xs">
                U
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {replyingTo && (
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                  <Reply className="h-4 w-4" />
                  <span>Replying to a comment</span>
                  <button
                    type="button"
                    onClick={cancelAction}
                    className="text-gray-500 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pink-500 resize-none"
                rows={3}
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {newComment.length}/2000
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim() || isSubmitting}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <Send className="h-4 w-4 mr-1" />
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-400 text-sm">
            <a href="/login" className="text-pink-500 hover:underline">
              Sign in
            </a>{" "}
            to leave a comment
          </p>
        </div>
      )}

      {/* Edit comment modal */}
      {editingComment && (
        <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
            <Edit2 className="h-4 w-4" />
            <span>Editing comment</span>
            <button
              type="button"
              onClick={cancelAction}
              className="ml-auto text-gray-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleEdit}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pink-500 resize-none"
              rows={3}
              maxLength={2000}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancelAction}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!editContent.trim() || isSubmitting}
                className="bg-pink-600 hover:bg-pink-700"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-700 mx-auto mb-2" />
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={startReply}
              onEdit={startEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Error display */}
      {fetcher.data?.error && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
          {fetcher.data.error}
        </div>
      )}
    </div>
  );
}
