import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Eye, Globe, Lock, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Input from "../components/ui/Input";
import LoadingState from "../components/ui/LoadingState";
import Card from "../components/ui/Card";
import { getStats } from "../services/dashboard";
import { getMyVideos } from "../services/video";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];



const FILTERS = ["all", "public", "private"];

export default function Journey() {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const [statsResponse, videosResponse] = await Promise.all([getStats(), getMyVideos()]);
      setStats(statsResponse.data);
      setVideos(videosResponse.data);
    } catch {
      setError(true);
      toast.error("Failed to load journey");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);



  const filteredVideos = useMemo(() => {
    return videos.filter((video) => (
      filter === "all" ? true :
      filter === "public" ? video.isPublished :
      !video.isPublished
    ));
  }, [videos, filter]);

  /* Group videos by year → month */
  const timeline = useMemo(() => {
    const sorted = [...filteredVideos].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    const groups = {};
    for (const video of sorted) {
      const date = new Date(video.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month}`;
      if (!groups[key]) groups[key] = { year, month, videos: [] };
      groups[key].videos.push(video);
    }

    return Object.values(groups);
  }, [filteredVideos]);

  if (loading) return <LoadingState message="Loading your journey..." />;
  if (error) return <ErrorState onRetry={fetchDashboard} message="Could not load your journey." />;

  return (
    <div className="odyssey-enter mx-auto max-w-5xl pb-16">
      {/* ── Header ── */}
      <div className="mb-12 text-center max-w-2xl mx-auto py-4 border-b border-[var(--odyssey-border)]">
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[var(--odyssey-text)] tracking-wide mb-2">
          Your Journey
        </h1>
        <p className="font-serif italic text-lg text-[var(--odyssey-text-muted)]">
          The Chronicle
        </p>

        {stats && (
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-[var(--odyssey-text-muted)]">
            <span><strong className="text-[var(--odyssey-text)]">{stats.totalVideos ?? 0}</strong> stories</span>
            <span><strong className="text-[var(--odyssey-text)]">{stats.totalViews ?? 0}</strong> views</span>
            <span><strong className="text-[var(--odyssey-text)]">{stats.totalSubscribers ?? 0}</strong> subscribers</span>
            <span><strong className="text-[var(--odyssey-text)]">{stats.totalLikes ?? 0}</strong> likes</span>
          </div>
        )}

        {/* Filter */}
        <div className="mt-8 mb-4 flex items-center justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "rounded-none border-b-2 px-4 py-1.5 text-xs font-sans font-medium uppercase tracking-widest transition-colors duration-150",
                filter === f
                  ? "border-[var(--odyssey-accent)] text-[var(--odyssey-text)]"
                  : "border-transparent text-[var(--odyssey-text-muted)] hover:text-[var(--odyssey-text-secondary)]",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Timeline ── */}
      {filteredVideos.length === 0 ? (
        <EmptyState message={videos.length === 0 ? "Your journey starts with your first upload." : "No stories match this filter."} />
      ) : (
        <div className="relative pl-6 sm:pl-8">
          {/* Vertical spine */}
          <div className="odyssey-timeline-spine" />

          {timeline.map((group, groupIdx) => (
            <div key={`${group.year}-${group.month}`} className={groupIdx > 0 ? "mt-12" : ""}>
              {/* Date marker */}
              <div className="relative mb-8">
                <span className="odyssey-timeline-dot odyssey-timeline-dot--active" style={{ top: "10px" }} />
                <p className="font-serif text-2xl text-[var(--odyssey-text)]">
                  {MONTHS[group.month]} {group.year}
                </p>
              </div>

              {/* Videos in this month */}
              <div className="space-y-8">
                {group.videos.map((video) => (
                  <div key={video._id} className="group relative">
                    <span className="odyssey-timeline-dot" style={{ top: "12px" }} />

                    <Link to={`/story/${video._id}`} className="block">
                      <div className="odyssey-thumb aspect-video w-full rounded-md sm:aspect-[2.2/1]">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt={video.title} loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-[var(--odyssey-text-muted)]">
                            No thumbnail
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={`/story/${video._id}`}>
                          <h3 className="font-serif text-[17px] text-[var(--odyssey-text)] group-hover:text-[var(--odyssey-accent)] transition-colors">
                            {video.title}
                          </h3>
                        </Link>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-sans font-medium uppercase tracking-wider text-[var(--odyssey-text-muted)]">
                          <span className="inline-flex items-center gap-1">
                            {video.isPublished ? <Globe size={11} /> : <Lock size={11} />}
                            {video.isPublished ? "Public" : "Private"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Eye size={11} />
                            {(video.views || 0).toLocaleString()}
                          </span>
                          <span>{new Date(video.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>


                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
