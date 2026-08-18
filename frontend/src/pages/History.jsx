import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { getWatchHistory } from "../services/user";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await getWatchHistory();
      setHistory(response.data?.watchHistory || []);
    } catch {
      setError(true);
      toast.error("Failed to load watch history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <LoadingState message="Loading history..." />;
  if (error) return <ErrorState onRetry={fetchHistory} message="Could not load watch history." />;

  return (
    <div className="odyssey-enter mx-auto max-w-4xl pb-16">
      <div className="mb-10 text-center border-b border-[var(--odyssey-border)] pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-wide text-[var(--odyssey-text)] mb-2">
          History
        </h1>
        <p className="font-serif italic text-lg text-[var(--odyssey-text-muted)]">
          Recently viewed archives
        </p>
      </div>

      {history.length === 0 ? (
        <EmptyState message="The reading room history is empty." />
      ) : (
        <div className="divide-y divide-[var(--odyssey-border)]">
          {history.map((video) => (
            <Link
              key={video._id}
              to={`/story/${video._id}`}
              className="group flex flex-col sm:flex-row gap-5 py-5 sm:items-center hover:bg-[var(--odyssey-surface-soft)] -mx-3 px-3 rounded transition-colors duration-150"
            >
              <div className="odyssey-thumb aspect-video w-full shrink-0 sm:w-48">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[var(--odyssey-text-muted)] bg-[var(--odyssey-surface)]">[ No thumb ]</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-[19px] leading-snug text-[var(--odyssey-text)] group-hover:text-[var(--odyssey-accent)] transition-colors">
                  {video.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[11px] font-medium uppercase tracking-wider text-[var(--odyssey-text-muted)]">
                  <span className="text-[var(--odyssey-text-secondary)]">{video.owner?.fullname || video.owner?.username}</span>
                  <span>·</span>
                  <span>{video.views ?? 0} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
