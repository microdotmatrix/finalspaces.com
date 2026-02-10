"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { Flag, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  createMediaComment,
  deleteMediaComment,
  flagMediaCommentByModerator,
  getMediaComments,
  type MediaCommentView,
  reportMediaComment,
  updateMediaComment,
} from "@/lib/actions/media-comment-actions";
import { features } from "@/lib/config";

interface MediaCommentsPanelProps {
  mediaId: string;
}

const MAX_COMMENT_LENGTH = 1000;

export function MediaCommentsPanel({ mediaId }: MediaCommentsPanelProps) {
  const { isSignedIn } = useAuth();
  const [comments, setComments] = useState<MediaCommentView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isCancelled = false;

    const loadComments = async () => {
      setIsLoading(true);
      try {
        const result = await getMediaComments({ mediaId });

        if (isCancelled) {
          return;
        }

        if (result.success) {
          setComments(result.data);
        } else {
          toast.error(result.error);
        }
      } catch {
        if (!isCancelled) {
          toast.error("Failed to load comments");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadComments();

    return () => {
      isCancelled = true;
    };
  }, [mediaId]);

  const hasComments = comments.length > 0;

  function handleCreateComment() {
    const commentText = draft.trim();
    if (!commentText) {
      toast.error("Please enter a comment before submitting.");
      return;
    }

    startTransition(async () => {
      const result = await createMediaComment({
        mediaId,
        commentText,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setDraft("");
      setComments((previous) => [result.data, ...previous]);
      toast.success("Comment posted.");
    });
  }

  function startEditing(comment: MediaCommentView) {
    setEditingId(comment.id);
    setEditingDraft(comment.commentText ?? "");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingDraft("");
  }

  function handleUpdateComment(commentId: string) {
    const commentText = editingDraft.trim();
    if (!commentText) {
      toast.error("Comment cannot be empty.");
      return;
    }

    startTransition(async () => {
      const result = await updateMediaComment({ commentId, commentText });
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setComments((previous) =>
        previous.map((comment) =>
          comment.id === commentId ? { ...comment, ...result.data } : comment
        )
      );
      cancelEditing();
      toast.success("Comment updated.");
    });
  }

  function handleDeleteComment(commentId: string) {
    startTransition(async () => {
      const result = await deleteMediaComment({ commentId });
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setComments((previous) =>
        previous.filter((comment) => comment.id !== commentId)
      );
      toast.success("Comment deleted.");
    });
  }

  function handleFlagComment(commentId: string) {
    startTransition(async () => {
      const result = await flagMediaCommentByModerator({ commentId });
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setComments((previous) =>
        previous.filter((comment) => comment.id !== commentId)
      );
      toast.success("Comment flagged.");
    });
  }

  function handleReportComment(commentId: string) {
    startTransition(async () => {
      const result = await reportMediaComment({ commentId });
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setComments((previous) =>
        previous.filter((comment) => comment.id !== commentId)
      );
      toast.success("Comment reported.");
    });
  }

  return (
    <section className="space-y-4 rounded-xl bg-black/35 p-4 text-white/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-semibold text-sm">
          <MessageSquare className="size-4" />
          Comments
        </h3>
        <span className="text-white/60 text-xs">{comments.length}</span>
      </div>

      {isLoading && (
        <p className="text-white/60 text-xs">Loading comments...</p>
      )}
      {!isLoading && hasComments && (
        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const isEditing = editingId === comment.id;
            const createdAt = comment.createdAt
              ? formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })
              : "";

            return (
              <article
                className="space-y-2 rounded-lg border border-white/10 bg-black/25 p-3"
                key={comment.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-sm">{comment.authorName}</p>
                  <div className="flex items-center gap-2">
                    {comment.moderationStatus !== "ok" && (
                      <Badge
                        className="border-amber-400/40 bg-amber-500/20 text-amber-100"
                        variant="outline"
                      >
                        Flagged
                      </Badge>
                    )}
                    {createdAt && (
                      <span className="text-white/50 text-xs">{createdAt}</span>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      disabled={isPending}
                      maxLength={MAX_COMMENT_LENGTH}
                      onChange={(event) => setEditingDraft(event.target.value)}
                      value={editingDraft}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        disabled={isPending}
                        onClick={() => handleUpdateComment(comment.id)}
                        size="sm"
                        type="button"
                      >
                        Save
                      </Button>
                      <Button
                        disabled={isPending}
                        onClick={cancelEditing}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-white/90">
                    {comment.commentText}
                  </p>
                )}

                {!isEditing && (
                  <div className="flex flex-wrap gap-2">
                    {comment.canEdit && (
                      <Button
                        className="h-7 px-2 text-xs"
                        disabled={isPending}
                        onClick={() => startEditing(comment)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <Pencil className="mr-1 size-3" />
                        Edit
                      </Button>
                    )}

                    {comment.canDelete && (
                      <Button
                        className="h-7 px-2 text-xs"
                        disabled={isPending}
                        onClick={() => handleDeleteComment(comment.id)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="mr-1 size-3" />
                        Delete
                      </Button>
                    )}

                    {comment.canFlag && (
                      <Button
                        className="h-7 px-2 text-xs"
                        disabled={isPending}
                        onClick={() => handleFlagComment(comment.id)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <Flag className="mr-1 size-3" />
                        Flag
                      </Button>
                    )}

                    {features.mediaCommentReportingEnabled &&
                      comment.canReport && (
                        <Button
                          className="h-7 px-2 text-xs"
                          disabled={isPending}
                          onClick={() => handleReportComment(comment.id)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Report
                        </Button>
                      )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      {!(isLoading || hasComments) && (
        <p className="text-white/60 text-xs">No comments yet.</p>
      )}

      {isSignedIn ? (
        <div className="space-y-2 border-white/10 border-t pt-3">
          <Textarea
            disabled={isPending}
            maxLength={MAX_COMMENT_LENGTH}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Share a memory about this moment"
            value={draft}
          />
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-xs">
              {draft.trim().length}/{MAX_COMMENT_LENGTH}
            </span>
            <Button
              disabled={isPending || !draft.trim()}
              onClick={handleCreateComment}
              size="sm"
              type="button"
            >
              Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-white/10 border-t pt-3">
          <p className="mb-2 text-white/70 text-xs">
            Sign in to leave a comment.
          </p>
          <SignInButton mode="modal">
            <Button size="sm" type="button" variant="secondary">
              Sign In to Comment
            </Button>
          </SignInButton>
        </div>
      )}
    </section>
  );
}
