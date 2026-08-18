import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import VideoCard from "../components/video/VideoCard";
import ArticleCard from "../components/article/ArticleCard";
import { getPlaylist, removeVideo, removeArticle } from "../services/playlist";

export default function Playlist() {
  const { id } = useParams();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingRemove, setLoadingRemove] = useState(null);

  const fetchPlaylist = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await getPlaylist(id);
      setPlaylist(response.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  if (loading) return <LoadingState message="Loading collection..." />;
  if (error) return <ErrorState onRetry={fetchPlaylist} message="Failed to load this collection." />;
  if (!playlist) return <EmptyState message="Collection not found." />;

  const handleRemove = async (item) => {
    setLoadingRemove(item._id);
    try {
      if (item.contentType === "article") {
        await removeArticle(id, item._id);
        setPlaylist((previous) => ({
          ...previous,
          articles: previous.articles.filter((article) => article._id !== item._id),
        }));
      } else {
        await removeVideo(id, item._id);
        setPlaylist((previous) => ({
          ...previous,
          videos: previous.videos.filter((video) => video._id !== item._id),
        }));
      }
      toast.success("Removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove");
    } finally {
      setLoadingRemove(null);
    }
  };
  
  const combinedItems = [
    ...(playlist.videos || []).map(v => ({ ...v, contentType: "video" })),
    ...(playlist.articles || []).map(a => ({ ...a, contentType: "article" }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="odyssey-enter mx-auto max-w-6xl pb-16">
      {/* Header */}
      <div className="mb-12 border-b border-[var(--odyssey-border)] pb-8 text-center max-w-2xl mx-auto">
        <p className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-[var(--odyssey-warm)] mb-4">
          Collection
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-[var(--odyssey-text)] mb-4">
          {playlist.name}
        </h1>
        {playlist.description && (
          <p className="mx-auto max-w-lg font-serif italic text-lg text-[var(--odyssey-text-secondary)] mb-4">
            {playlist.description}
          </p>
        )}
        <p className="font-sans text-[11px] uppercase tracking-widest text-[var(--odyssey-text-muted)] font-medium">
          {combinedItems.length} items
        </p>
      </div>

      {combinedItems.length === 0 ? (
        <EmptyState message="This collection is empty." />
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {combinedItems.map((item) => (
            <div key={`${item.contentType}-${item._id}`} className="group relative">
              {item.contentType === "article" ? <ArticleCard article={item} hideOwner /> : <VideoCard video={item} hideOwner />}
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:!text-[var(--odyssey-danger)]"
                  isLoading={loadingRemove === item._id}
                  onClick={() => handleRemove(item)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
