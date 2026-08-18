import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import VideoCard from "../components/video/VideoCard";
import { getChannel } from "../services/user";
import { getChannelVideos } from "../services/video";
import { getAuthorArticles } from "../services/article";
import ArticleCard from "../components/article/ArticleCard";
import { getSubscribers, toggleSubscription } from "../services/subscription";
import { useSelector } from "react-redux";

import { Camera, Edit3 } from "lucide-react";
import EditProfileModal from "../components/profile/EditProfileModal";

export default function Profile() {
  const { username } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const editMode = searchParams.get("edit") === "true";
  
  const currentUser = useSelector((state) => state.auth.user);

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("stories"); // "stories" | "articles" | "journey"
  
  const [subscribers, setSubscribers] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingSubscribe, setLoadingSubscribe] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(false);

      try {
        const channelRes = await getChannel(username);
        const channelData = channelRes.data;
        setChannel(channelData);

        const [videosRes, articlesRes, subsRes] = await Promise.all([
          getChannelVideos(channelData._id),
          getAuthorArticles(channelData._id),
          getSubscribers(channelData._id),
        ]);

        const videoList = Array.isArray(videosRes?.data) ? videosRes.data : Array.isArray(videosRes) ? videosRes : [];
        const articleList = Array.isArray(articlesRes?.data) ? articlesRes.data : Array.isArray(articlesRes) ? articlesRes : [];
        
        setVideos(videoList);
        setArticles(articleList);
        setSubscribers(subsRes.data.totalSubscribers);
        setIsSubscribed(subsRes.data.isSubscribed || false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (editMode && channel && currentUser && currentUser._id === channel._id) {
      setIsEditModalOpen(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("edit");
      setSearchParams(newParams, { replace: true });
    }
  }, [editMode, channel, currentUser, searchParams, setSearchParams]);

  const handleSubscribe = async () => {
    if (!channel) return;
    setLoadingSubscribe(true);
    try {
      await toggleSubscription(channel._id);
      const updated = await getSubscribers(channel._id);
      setSubscribers(updated.data.totalSubscribers);
      setIsSubscribed((v) => !v);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to subscribe");
    } finally {
      setLoadingSubscribe(false);
    }
  };

  const handleProfileUpdated = (updatedUser) => {
    setChannel((prev) => ({
      ...prev,
      ...updatedUser,
    }));
  };

  if (loading) return <LoadingState message="Loading profile..." />;
  if (error || !channel) return <ErrorState message="Could not load this profile." />;
  
  const isOwnProfile = currentUser && currentUser._id === channel._id;

  const journeyTimeline = [...videos, ...articles].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).reduce((groups, item) => {
    const d = new Date(item.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!groups[key]) groups[key] = { year: d.getFullYear(), month: d.getMonth(), items: [] };
    groups[key].items.push(item);
    return groups;
  }, {});
  
  const timelineGroups = Object.values(journeyTimeline);
  
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="odyssey-enter pb-16">
      {/* ── Cover ── */}
      <div className="-mx-5 -mt-6 sm:-mx-6 lg:-mx-8 lg:-mt-8">
        <div className="relative h-36 w-full bg-[var(--odyssey-surface-elevated)] sm:h-48 lg:h-56 group">
          {channel.coverimage ? (
            <img
              src={channel.coverimage}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--odyssey-surface)] to-[var(--odyssey-surface-elevated)]" />
          )}
          {/* Bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--odyssey-bg)] to-transparent" />

          {/* Own profile edit cover button */}
          {isOwnProfile && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-4 right-4 bg-[#FAF8F2]/90 hover:bg-[#FAF8F2] text-[#24211D] border border-[#D6CCBA] text-xs font-sans font-medium uppercase tracking-wider px-3 py-1.5 rounded-sm shadow-xs flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-all"
            >
              <Camera size={14} /> Change Cover
            </button>
          )}
        </div>
      </div>

      {/* ── Profile info ── */}
      <div className="mx-auto max-w-4xl px-4 -mt-14 relative z-10 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="relative group">
            <Avatar
              src={channel.avatar}
              name={channel.fullname || channel.username}
              size="2xl"
              className="ring-[6px] ring-[var(--odyssey-bg)]"
            />
            {isOwnProfile && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Change Avatar"
              >
                <Camera size={22} />
              </button>
            )}
          </div>
          <div className="mt-4">
            <h1 className="font-serif text-3xl sm:text-4xl text-[var(--odyssey-text)] tracking-wider">
              {channel.fullname || channel.username}
            </h1>
            <p className="mt-1 font-sans text-xs uppercase tracking-[0.2em] text-[var(--odyssey-text-muted)]">@{channel.username}</p>
          </div>

          {/* Cover and Avatar carry sleek camera triggers. No bulky Edit Profile button needed here. */}
          {!isOwnProfile && (
            <div className="mt-6">
              <Button
                variant={isSubscribed ? "secondary" : "primary"}
                size="md"
                isLoading={loadingSubscribe}
                onClick={handleSubscribe}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 flex justify-center items-center gap-8 text-[11px] font-sans font-medium uppercase tracking-widest text-[var(--odyssey-text-muted)]">
          <span><strong className="text-[var(--odyssey-text)] text-sm mr-1.5">{subscribers}</strong> subscribers</span>
          <span><strong className="text-[var(--odyssey-text)] text-sm mr-1.5">{videos.length}</strong> stories</span>
        </div>

        {/* Divider */}
        <div className="mt-12 w-full flex justify-center">
          <div className="flex items-center gap-6 border-b border-[var(--odyssey-border)] px-4">
            <button
               className={`pb-2 font-sans text-sm font-semibold uppercase tracking-wider ${activeTab === 'stories' ? 'border-b-2 border-[var(--odyssey-text)] text-[var(--odyssey-text)]' : 'text-[var(--odyssey-text-muted)] hover:text-[var(--odyssey-text)]'}`}
               onClick={() => setActiveTab("stories")}
            >
               Stories
            </button>
            <button
               className={`pb-2 font-sans text-sm font-semibold uppercase tracking-wider ${activeTab === 'articles' ? 'border-b-2 border-[var(--odyssey-text)] text-[var(--odyssey-text)]' : 'text-[var(--odyssey-text-muted)] hover:text-[var(--odyssey-text)]'}`}
               onClick={() => setActiveTab("articles")}
            >
               Articles
            </button>
            <button
               className={`pb-2 font-sans text-sm font-semibold uppercase tracking-wider ${activeTab === 'journey' ? 'border-b-2 border-[var(--odyssey-text)] text-[var(--odyssey-text)]' : 'text-[var(--odyssey-text-muted)] hover:text-[var(--odyssey-text)]'}`}
               onClick={() => setActiveTab("journey")}
            >
               Journey
            </button>
          </div>
        </div>

        {/* ── Content section ── */}
        <div className="text-left mt-10">
          {activeTab === "stories" && (
            videos.length === 0 ? (
              <EmptyState message={isOwnProfile ? "You haven't published any stories yet." : "No stories published yet."} />
            ) : (
              <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((video) => (
                  <VideoCard key={video._id} video={video} hideOwner />
                ))}
              </div>
            )
          )}
          
          {activeTab === "articles" && (
            articles.length === 0 ? (
              <EmptyState message={isOwnProfile ? "You haven't published any articles yet." : "No articles published yet."} />
            ) : (
              <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard key={article._id} article={article} hideOwner />
                ))}
              </div>
            )
          )}
          
          {activeTab === "journey" && (
            timelineGroups.length === 0 ? (
              <EmptyState message="The journey hasn't started yet." />
            ) : (
              <div className="relative pl-6 sm:pl-8 max-w-3xl mx-auto">
                <div className="odyssey-timeline-spine" />
                {timelineGroups.map((group, groupIdx) => (
                  <div key={`${group.year}-${group.month}`} className={groupIdx > 0 ? "mt-12" : ""}>
                    <div className="relative mb-8">
                      <span className="odyssey-timeline-dot odyssey-timeline-dot--active" style={{ top: "10px" }} />
                      <p className="font-serif text-2xl text-[var(--odyssey-text)]">
                        {MONTHS[group.month]} {group.year}
                      </p>
                    </div>
                    <div className="space-y-6">
                      {group.items.map((item) => (
                        <div key={item._id} className="relative">
                          <span className="odyssey-timeline-dot" style={{ top: "12px" }} />
                          <div className="ml-2 bg-[var(--odyssey-surface-elevated)] p-4 rounded border border-[var(--odyssey-border)] flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow">
                             <div className="w-full sm:w-40 shrink-0 aspect-video rounded overflow-hidden">
                               {item.thumbnail || item.coverImage ? (
                                 <img src={item.thumbnail || item.coverImage} className="w-full h-full object-cover" alt="" />
                               ) : (
                                 <div className="w-full h-full bg-[var(--odyssey-surface)] flex items-center justify-center font-serif text-[10px] italic text-[var(--odyssey-text-muted)]">[ No media ]</div>
                               )}
                             </div>
                             <div>
                                <h3 className="font-serif text-[17px] text-[var(--odyssey-text)] group-hover:text-[var(--odyssey-accent)] transition-colors line-clamp-2">
                                  {item.title}
                                </h3>
                                <p className="mt-1 font-sans text-[11px] uppercase tracking-wider text-[var(--odyssey-text-muted)]">
                                  {item.thumbnail !== undefined ? 'Video Story' : 'Written Article'} · {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </p>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={channel}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
}
