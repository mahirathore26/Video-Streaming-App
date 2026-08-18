import { useCallback, useEffect, useState } from "react";
import VideoCard from "../components/video/VideoCard";
import ArticleCard from "../components/article/ArticleCard";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { getSubscriptionFeed } from "../services/feed";

export default function Subscriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await getSubscriptionFeed();
      const feedList = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      setItems(feedList);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  if (loading) return <LoadingState message="Loading latest from your subscriptions..." />;
  if (error) return <ErrorState onRetry={fetchSubscriptions} message="Could not load your feed. Please try again." />;

  return (
    <div className="odyssey-page odyssey-enter pb-16 pt-4">
      {/* Header */}
      <section className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[var(--odyssey-text)] tracking-wide mb-4">
          Subscriptions
        </h1>
        <p className="font-serif italic text-lg text-[var(--odyssey-text-muted)]">
          The latest from creators you follow
        </p>
      </section>

      <div className="odyssey-rule mb-12" />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 opacity-80 mix-blend-multiply w-24 h-24 flex items-center justify-center rounded-full bg-[var(--odyssey-surface-soft)] text-[var(--odyssey-warm)]">
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-12 h-12" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
          <h3 className="font-serif text-2xl text-[var(--odyssey-text)] mb-3">Nothing here yet</h3>
          <p className="font-sans text-sm text-[var(--odyssey-text-muted)] max-w-sm mx-auto">
            You haven't subscribed to any creators yet, or they haven't posted any content.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            item.contentType === "article" ? (
              <ArticleCard key={`article-${item._id}`} article={item} />
            ) : (
              <VideoCard key={`video-${item._id}`} video={item} />
            )
          ))}
        </div>
      )}
    </div>
  );
}
