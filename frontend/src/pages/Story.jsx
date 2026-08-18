import { Bookmark, Heart, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Input from "../components/ui/Input";
import LoadingState from "../components/ui/LoadingState";
import { createComment, deleteComment, getComments, updateComment } from "../services/comment";
import { getVideoLikes, toggleCommentLike, toggleVideoLike } from "../services/like";
import { addVideo, getPlaylists, removeVideo } from "../services/playlist";
import { getSubscribers, toggleSubscription } from "../services/subscription";
import { getVideo } from "../services/video";

function CommentItem({ item, currentUser, onDelete, onUpdate, onLike, loadingDelete, loadingLike }) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);
  const isOwner = currentUser && currentUser._id === item.owner._id;

  const handleSave = async () => {
    if (!editContent.trim()) return;
    await onUpdate(item._id, editContent);
    setEditing(false);
  };

  return (
    <article className="py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar src={item.owner?.avatar} name={item.owner?.fullname} size="md" />
          <div className="min-w-0">
            <p className="truncate text-base font-serif text-[var(--odyssey-text)]">{item.owner.fullname}</p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--odyssey-text-muted)] font-sans">Response</p>
          </div>
        </div>

        {isOwner && (
          <div className="flex shrink-0 items-center gap-1">
            <Button iconOnly variant="ghost" size="sm" aria-label={editing ? "Cancel edit" : "Edit comment"} onClick={() => setEditing((value) => !value)}>
              <Pencil size={14} />
            </Button>
            <Button iconOnly variant="ghost" size="sm" aria-label="Delete comment" isLoading={loadingDelete === item._id} onClick={() => onDelete(item._id)}>
              <Trash2 size={13} />
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-3 space-y-2 pl-11">
          <Input value={editContent} onChange={(event) => setEditContent(event.target.value)} />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <p className="mt-2 max-w-3xl pl-11 text-sm leading-7 text-[var(--odyssey-text-secondary)]">{item.content}</p>
      )}

      <div className="mt-2 pl-11">
        <button
          className="inline-flex items-center gap-1 text-xs text-[var(--odyssey-text-muted)] hover:text-[var(--odyssey-text)] transition-colors"
          disabled={loadingLike === item._id}
          onClick={() => onLike(item._id)}
        >
          <Heart size={12} />
          {loadingLike === item._id ? "..." : `${item.likeCount || 0}`}
        </button>
      </div>
    </article>
  );
}

export default function Story() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loadingVideoLike, setLoadingVideoLike] = useState(false);

  const [subscribers, setSubscribers] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingSubscribe, setLoadingSubscribe] = useState(false);

  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [loadingPostComment, setLoadingPostComment] = useState(false);
  const [commentPage, setCommentPage] = useState(1);
  const [hasNextComments, setHasNextComments] = useState(false);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [loadingDeleteComment, setLoadingDeleteComment] = useState(null);
  const [loadingCommentLike, setLoadingCommentLike] = useState(null);
  const [totalComments, setTotalComments] = useState(0);

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingAddToPlaylist, setLoadingAddToPlaylist] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const [videoRes, likeRes, commentRes] = await Promise.all([
          getVideo(id),
          getVideoLikes(id),
          getComments(id, 1, 10),
        ]);

        setVideo(videoRes.data);
        setLikes(likeRes.data.totalLikes);
        setIsLiked(likeRes.data.isLiked);
        setComments(commentRes.data);
        setHasNextComments(commentRes.meta?.hasNextPage || false);
        setCommentPage(1);
        setTotalComments(commentRes.meta?.totalDocs || 0);

        const subRes = await getSubscribers(videoRes.data.owner._id);
        setSubscribers(subRes.data.totalSubscribers);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const handleComment = async () => {
    if (!comment.trim()) {
      toast.error("Write a comment first");
      return;
    }

    setLoadingPostComment(true);
    try {
      const response = await createComment(id, comment);
      setComments((previous) => [response.data, ...previous]);
      setTotalComments((previous) => previous + 1);
      setComment("");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Failed to post comment");
    } finally {
      setLoadingPostComment(false);
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    try {
      const response = await updateComment(commentId, content);
      setComments((previous) => previous.map((entry) => (
        entry._id === commentId ? { ...entry, content: response.data.content } : entry
      )));
    } catch {
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    setLoadingDeleteComment(commentId);
    try {
      await deleteComment(commentId);
      setComments((previous) => previous.filter((entry) => entry._id !== commentId));
      setTotalComments((previous) => Math.max(0, previous - 1));
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setLoadingDeleteComment(null);
    }
  };

  const handleCommentLike = async (commentId) => {
    setLoadingCommentLike(commentId);
    try {
      const response = await toggleCommentLike(commentId);
      setComments((previous) => previous.map((entry) => (
        entry._id === commentId ? { ...entry, likeCount: response.data.likeCount } : entry
      )));
    } catch {
      toast.error("Failed to like comment");
    } finally {
      setLoadingCommentLike(null);
    }
  };

  const loadMoreComments = async () => {
    if (!hasNextComments || loadingMoreComments) return;

    setLoadingMoreComments(true);
    try {
      const nextPage = commentPage + 1;
      const response = await getComments(id, nextPage, 10);
      setComments((previous) => {
        const ids = new Set(previous.map((entry) => entry._id));
        return [...previous, ...response.data.filter((entry) => !ids.has(entry._id))];
      });
      setCommentPage(nextPage);
      setHasNextComments(response.meta?.hasNextPage || false);
    } catch {
      toast.error("Failed to load more comments");
    } finally {
      setLoadingMoreComments(false);
    }
  };

  if (loading) return <LoadingState message="Loading story..." />;

  if (error || !video) {
    return (
      <div className="mx-auto max-w-5xl pt-10">
        <ErrorState title="Story Unavailable" message="This story may have been deleted or you do not have permission to view it." />
      </div>
    );
  }

  return (
    <div className="odyssey-enter pb-16">
      {/* ── Video — full-bleed cinematic ── */}
      <section className="-mx-5 -mt-6 sm:-mx-6 lg:-mx-8 lg:-mt-8 bg-black">
        <div className="mx-auto max-w-[90rem]">
          <video
            controls
            src={video.videoFile}
            className="aspect-video w-full bg-black object-contain"
            preload="metadata"
          />
        </div>
      </section>

      {/* ── Content ── */}
      <div className="mx-auto max-w-4xl pt-8">
        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-[var(--odyssey-text)]">
          {video.title}
        </h1>

        {/* Creator + Actions */}
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--odyssey-border)] pb-8">
          <button
            className="flex items-center gap-4 text-left group"
            onClick={() => navigate(`/profile/${video.owner.username}`)}
          >
            <Avatar src={video.owner.avatar} name={video.owner.fullname} size="lg" />
            <div>
              <p className="text-lg font-serif text-[var(--odyssey-text)] group-hover:text-[var(--odyssey-accent)] transition-colors">{video.owner.fullname}</p>
              <p className="mt-0.5 text-[11px] font-sans font-medium uppercase tracking-wider text-[var(--odyssey-text-muted)]">{subscribers} subscribers</p>
            </div>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={isSubscribed ? "secondary" : "primary"}
              size="sm"
              isLoading={loadingSubscribe}
              onClick={async () => {
                setLoadingSubscribe(true);
                try {
                  await toggleSubscription(video.owner._id);
                  const updated = await getSubscribers(video.owner._id);
                  setSubscribers(updated.data.totalSubscribers);
                  setIsSubscribed((value) => !value);
                } catch (requestError) {
                  toast.error(requestError.response?.data?.message || "Failed to subscribe");
                } finally {
                  setLoadingSubscribe(false);
                }
              }}
            >
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </Button>
            <Button
              variant={isLiked ? "primary" : "ghost"}
              size="sm"
              isLoading={loadingVideoLike}
              onClick={async () => {
                const previousLiked = isLiked;
                const previousLikes = likes;
                setIsLiked(!previousLiked);
                setLikes((value) => (previousLiked ? Math.max(0, value - 1) : value + 1));
                setLoadingVideoLike(true);
                try {
                  const response = await toggleVideoLike(id);
                  setIsLiked(response.data.liked);
                  setLikes(response.data.likeCount);
                } catch {
                  toast.error("Failed to like video");
                  setIsLiked(previousLiked);
                  setLikes(previousLikes);
                } finally {
                  setLoadingVideoLike(false);
                }
              }}
            >
              <Heart size={14} />
              {likes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const response = await getPlaylists(user._id);
                setPlaylists(response.data);
                setShowPlaylistModal(true);
              }}
            >
              <Bookmark size={14} />
              Save
            </Button>
          </div>
        </div>

        {/* Description */}
        {video.description && (
          <div className="mt-10">
            <p className="max-w-3xl whitespace-pre-line text-lg leading-relaxed font-serif text-[var(--odyssey-text-secondary)]">
              {video.description}
            </p>
          </div>
        )}

        {/* ── Comments ── */}
        <section className="mt-16 pt-8 border-t border-[var(--odyssey-border)]">
          <div className="flex items-center gap-3 mb-8">
            <MessageCircle size={18} className="text-[var(--odyssey-text-muted)]" strokeWidth={1.5} />
            <h2 className="font-serif text-2xl text-[var(--odyssey-text)]">
              Responses {totalComments > 0 && <span className="font-sans text-sm tracking-wide text-[var(--odyssey-accent)]">({totalComments})</span>}
            </h2>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Write a comment..."
              onKeyDown={(event) => event.key === "Enter" && !event.shiftKey && handleComment()}
            />
            <Button className="sm:self-start shrink-0" size="md" isLoading={loadingPostComment} onClick={handleComment}>
              Post
            </Button>
          </div>

          <div className="mt-6 divide-y divide-[var(--odyssey-border)]">
            {comments.length === 0 ? (
              <EmptyState message="No comments yet. Be the first to respond." minHeight="120px" />
            ) : (
              comments.map((item) => (
                <CommentItem
                  key={item._id}
                  item={item}
                  currentUser={user}
                  onDelete={handleDeleteComment}
                  onUpdate={handleUpdateComment}
                  onLike={handleCommentLike}
                  loadingDelete={loadingDeleteComment}
                  loadingLike={loadingCommentLike}
                />
              ))
            )}
          </div>

          {hasNextComments && (
            <div className="mt-4">
              <Button variant="ghost" size="sm" isLoading={loadingMoreComments} onClick={loadMoreComments}>
                Load more
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* ── Playlist Modal ── */}
      {showPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-lg border border-[var(--odyssey-border)] bg-[var(--odyssey-surface)] p-5 shadow-[var(--odyssey-shadow-lg)]">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[var(--odyssey-text)]">Save to Collection</h2>
              <p className="text-sm text-[var(--odyssey-text-muted)]">Add this story to a collection.</p>
            </div>

            <div className="mt-4 max-h-64 space-y-1 overflow-y-auto pr-1">
              {playlists.length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--odyssey-text-muted)]">No collections yet.</p>
              ) : playlists.map((playlist) => {
                const isSaved = (playlist.videos || []).some((playlistVideo) => (
                  typeof playlistVideo === "string" ? playlistVideo === id : playlistVideo?._id === id
                ));

                return (
                  <div key={playlist._id} className="flex items-center justify-between gap-3 rounded-md px-2 py-2.5 hover:bg-[var(--odyssey-surface-soft)]">
                    <span className="min-w-0 flex-1 truncate text-sm text-[var(--odyssey-text)]" title={playlist.name}>
                      {playlist.name}
                    </span>
                    <Button
                      size="sm"
                      variant={isSaved ? "ghost" : "primary"}
                      isLoading={loadingAddToPlaylist === playlist._id}
                      onClick={async () => {
                        setLoadingAddToPlaylist(playlist._id);
                        try {
                          if (isSaved) {
                            await removeVideo(playlist._id, id);
                            toast.success("Removed from collection");
                            setPlaylists((previous) => previous.map((entry) => (
                              entry._id === playlist._id
                                ? { ...entry, videos: entry.videos.filter((videoId) => (typeof videoId === "string" ? videoId : videoId?._id) !== id) }
                                : entry
                            )));
                          } else {
                            await addVideo(playlist._id, id);
                            toast.success("Added to collection");
                            setPlaylists((previous) => previous.map((entry) => (
                              entry._id === playlist._id
                                ? { ...entry, videos: [...(entry.videos || []), id] }
                                : entry
                            )));
                          }
                        } catch (requestError) {
                          toast.error(requestError.response?.data?.message || `Failed to ${isSaved ? "remove" : "add"}`);
                        } finally {
                          setLoadingAddToPlaylist(null);
                        }
                      }}
                    >
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowPlaylistModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
