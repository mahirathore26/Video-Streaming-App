import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Globe, Lock, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { deleteVideo, getMyVideos, togglePublish } from "../services/video";
import { getMyArticles, togglePublishArticle, deleteArticle } from "../services/article";

export default function Studio() {
  const [videos, setVideos] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingPublish, setLoadingPublish] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("videos"); // "videos" | "articles"
  const navigate = useNavigate();

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      if (activeTab === "videos") {
        const response = await getMyVideos();
        setVideos(response.data);
      } else {
        const response = await getMyArticles();
        setArticles(response.data);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  if (loading && videos.length === 0 && articles.length === 0) return <LoadingState message="Loading studio..." />;
  if (error) return <ErrorState onRetry={fetchContent} message="Could not load your workspace data." />;

  return (
    <div className="odyssey-enter w-full max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-[var(--odyssey-text-muted)] mb-3">
            Workspace
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--odyssey-text)] tracking-wider">
            Creator Studio
          </h1>
        </div>
        <div className="flex gap-2">
           <Button size="sm" variant="secondary" onClick={() => navigate("/article/write")}>New Article</Button>
           <Button size="sm" onClick={() => navigate("/upload")}>Upload Video</Button>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-6 border-b border-[var(--odyssey-border)]">
        <button
           className={`pb-2 font-sans text-sm font-semibold uppercase tracking-wider ${activeTab === 'videos' ? 'border-b-2 border-[var(--odyssey-text)] text-[var(--odyssey-text)]' : 'text-[var(--odyssey-text-muted)] hover:text-[var(--odyssey-text)]'}`}
           onClick={() => setActiveTab("videos")}
        >
           Videos
        </button>
        <button
           className={`pb-2 font-sans text-sm font-semibold uppercase tracking-wider ${activeTab === 'articles' ? 'border-b-2 border-[var(--odyssey-text)] text-[var(--odyssey-text)]' : 'text-[var(--odyssey-text-muted)] hover:text-[var(--odyssey-text)]'}`}
           onClick={() => setActiveTab("articles")}
        >
           Articles
        </button>
      </div>

      {activeTab === "videos" ? (
         videos.length === 0 ? (
           <EmptyState message="No videos yet. Start by uploading your first story." />
         ) : (
           <>
             {/* Table header */}
             <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_6rem_5rem_7rem] gap-3 px-2 pb-2 font-sans text-[11px] font-semibold uppercase tracking-widest text-[var(--odyssey-text-secondary)] border-b-2 border-[var(--odyssey-border)] mb-2">
               <span>Story</span>
               <span>Status</span>
               <span>Views</span>
               <span className="text-right">Actions</span>
             </div>

             {/* Rows */}
             <div className="divide-y divide-[var(--odyssey-border)]">
               {videos.map((video) => (
                 <div
                   key={video._id}
                   className="group flex flex-col gap-3 py-3 sm:grid sm:grid-cols-[minmax(0,1fr)_6rem_5rem_7rem] sm:items-center sm:gap-3 sm:px-2 hover:bg-[var(--odyssey-surface-soft)] -mx-2 px-2 rounded transition-colors duration-150"
                 >
                   {/* Story info */}
                   <div className="flex items-center gap-3 min-w-0">
                     <div
                       className="odyssey-thumb aspect-video w-20 shrink-0 rounded cursor-pointer"
                       onClick={() => navigate(`/story/${video._id}`)}
                     >
                       {video.thumbnail ? (
                         <img src={video.thumbnail} alt={video.title} loading="lazy" />
                       ) : (
                         <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--odyssey-text-muted)]">—</div>
                       )}
                     </div>
                     <div className="min-w-0">
                       <button
                         onClick={() => navigate(`/story/${video._id}`)}
                         className="block truncate font-serif text-[17px] text-[var(--odyssey-text)] hover:text-[var(--odyssey-accent)] text-left transition-colors w-full"
                       >
                         {video.title}
                       </button>
                       <p className="mt-1 font-sans truncate text-[11px] uppercase tracking-wider text-[var(--odyssey-text-muted)]">
                         {new Date(video.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                       </p>
                     </div>
                   </div>

                   {/* Status */}
                   <div className="flex items-center gap-1 text-xs text-[var(--odyssey-text-muted)]">
                     {video.isPublished ? (
                       <><Globe size={12} className="text-[var(--odyssey-success)]" /> <span>Public</span></>
                     ) : (
                       <><Lock size={12} className="text-[var(--odyssey-warning)]" /> <span>Private</span></>
                     )}
                   </div>

                   {/* Views */}
                   <span className="flex items-center gap-1 text-xs text-[var(--odyssey-text-muted)]">
                     <Eye size={12} />
                     {(video.views || 0).toLocaleString()}
                   </span>

                   {/* Actions */}
                   <div className="flex items-center justify-end gap-1">
                     <Button
                       variant="ghost"
                       size="sm"
                       isLoading={loadingPublish === video._id}
                       onClick={async () => {
                         setLoadingPublish(video._id);
                         try {
                           const response = await togglePublish(video._id);
                           setVideos((previous) => previous.map((entry) => (
                             entry._id === video._id ? { ...entry, isPublished: response.data.isPublished } : entry
                           )));
                           toast.success("Updated");
                         } catch (error) {
                           toast.error(error.response?.data?.message || "Failed");
                         } finally {
                           setLoadingPublish(null);
                         }
                       }}
                     >
                       {video.isPublished ? "Unpublish" : "Publish"}
                     </Button>

                     <Button
                       iconOnly
                       variant="ghost"
                       size="sm"
                       className="hover:!text-[var(--odyssey-danger)]"
                       aria-label="Delete"
                       isLoading={loadingDelete === video._id}
                       onClick={async () => {
                         if (!window.confirm("Delete this video permanently?")) return;
                         setLoadingDelete(video._id);
                         try {
                           await deleteVideo(video._id);
                           setVideos((previous) => previous.filter((entry) => entry._id !== video._id));
                           toast.success("Deleted");
                         } catch (error) {
                           toast.error(error.response?.data?.message || "Failed");
                         } finally {
                           setLoadingDelete(null);
                         }
                       }}
                     >
                       <Trash2 size={13} />
                     </Button>
                   </div>
                 </div>
               ))}
             </div>
           </>
         )
      ) : (
         articles.length === 0 ? (
           <EmptyState message="No articles yet. Start by writing your first article." />
         ) : (
           <>
             {/* Table header */}
             <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_6rem_7rem] gap-3 px-2 pb-2 font-sans text-[11px] font-semibold uppercase tracking-widest text-[var(--odyssey-text-secondary)] border-b-2 border-[var(--odyssey-border)] mb-2">
               <span>Article</span>
               <span>Status</span>
               <span className="text-right">Actions</span>
             </div>

             {/* Rows */}
             <div className="divide-y divide-[var(--odyssey-border)]">
               {articles.map((article) => (
                 <div
                   key={article._id}
                   className="group flex flex-col gap-3 py-3 sm:grid sm:grid-cols-[minmax(0,1fr)_6rem_7rem] sm:items-center sm:gap-3 sm:px-2 hover:bg-[var(--odyssey-surface-soft)] -mx-2 px-2 rounded transition-colors duration-150"
                 >
                   {/* Article info */}
                   <div className="flex items-center gap-3 min-w-0">
                     <div className="min-w-0">
                       <button
                         onClick={() => navigate(`/article/write/${article._id}`)}
                         className="block truncate font-serif text-[17px] text-[var(--odyssey-text)] hover:text-[var(--odyssey-accent)] text-left transition-colors w-full"
                       >
                         {article.title}
                       </button>
                       <p className="mt-1 font-sans truncate text-[11px] uppercase tracking-wider text-[var(--odyssey-text-muted)]">
                         {new Date(article.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                       </p>
                     </div>
                   </div>

                   {/* Status */}
                   <div className="flex items-center gap-1 text-xs text-[var(--odyssey-text-muted)]">
                     {article.isPublished ? (
                       <><Globe size={12} className="text-[var(--odyssey-success)]" /> <span>Published</span></>
                     ) : (
                       <><Lock size={12} className="text-[var(--odyssey-warning)]" /> <span>Draft</span></>
                     )}
                   </div>

                   {/* Actions */}
                   <div className="flex items-center justify-end gap-1">
                     <Button
                       variant="ghost"
                       size="sm"
                       isLoading={loadingPublish === article._id}
                       onClick={async () => {
                         setLoadingPublish(article._id);
                         try {
                           const response = await togglePublishArticle(article._id);
                           setArticles((previous) => previous.map((entry) => (
                             entry._id === article._id ? { ...entry, isPublished: response.data.isPublished } : entry
                           )));
                           toast.success("Updated");
                         } catch (error) {
                           toast.error(error.response?.data?.message || "Failed");
                         } finally {
                           setLoadingPublish(null);
                         }
                       }}
                     >
                       {article.isPublished ? "Unpublish" : "Publish"}
                     </Button>

                     <Button
                       iconOnly
                       variant="ghost"
                       size="sm"
                       className="hover:!text-[var(--odyssey-danger)]"
                       aria-label="Delete"
                       isLoading={loadingDelete === article._id}
                       onClick={async () => {
                         if (!window.confirm("Delete this article permanently?")) return;
                         setLoadingDelete(article._id);
                         try {
                           await deleteArticle(article._id);
                           setArticles((previous) => previous.filter((entry) => entry._id !== article._id));
                           toast.success("Deleted");
                         } catch (error) {
                           toast.error(error.response?.data?.message || "Failed");
                         } finally {
                           setLoadingDelete(null);
                         }
                       }}
                     >
                       <Trash2 size={13} />
                     </Button>
                   </div>
                 </div>
               ))}
             </div>
           </>
         )
      )}
    </div>
  );
}
