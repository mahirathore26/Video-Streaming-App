import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ChevronDown } from "lucide-react";
import VideoCard from "../components/video/VideoCard";
import ArticleCard from "../components/article/ArticleCard";
import ErrorState from "../components/ui/ErrorState";
import { getExploreFeed } from "../services/feed";
import Button from "../components/ui/Button";

// Custom empty state with classical compass motif
function ClassicalEmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center my-8">
      <div className="mb-5 opacity-85 w-20 h-20 flex items-center justify-center rounded-full bg-[#E9E3D5]/80 backdrop-blur-xs text-[#7A2635] border border-[#D6CCBA]/60">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      </div>
      <h3 className="font-serif text-2xl text-[#24211D] mb-2">{message}</h3>
      <p className="font-serif italic text-sm text-[#6F6A61] max-w-md mx-auto">
        New stories and travelogues will appear in the archive shortly.
      </p>
    </div>
  );
}

// Custom parchment skeleton loader
function ClassicalSkeleton() {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-[#FAF8F2] border border-[#D6CCBA] rounded-sm p-3">
            <div className="aspect-[16/10] w-full rounded-xs bg-[#E9E3D5] mb-3"></div>
            <div className="h-4 bg-[#E9E3D5] w-3/4 rounded mb-2"></div>
            <div className="h-3 bg-[#E9E3D5] w-1/2 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Explore() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterType, setFilterType] = useState("all"); // 'all' | 'stories' | 'articles'

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await getExploreFeed(query);
      const feedList = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setItems(feedList);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const filteredItems = items.filter(item => {
    if (filterType === "all") return true;
    if (filterType === "stories") return item.contentType === "video";
    if (filterType === "articles") return item.contentType === "article";
    return true;
  });

  const featured = filteredItems.slice(0, 4); 
  const latest = filteredItems.slice(4);

  return (
    <div className="odyssey-enter bg-[#F4F0E6] min-h-screen pb-20 relative">
      
      {/* ── Atmospheric Background Layer ── */}
      <div 
        className="absolute top-0 left-0 w-full h-[600px] md:h-[800px] pointer-events-none opacity-40 mix-blend-multiply"
        style={{ 
          backgroundImage: "url('/explore-bg.jpg')", 
          backgroundPosition: "center top", 
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F4F0E6]/70 to-[#F4F0E6]" />
      </div>

      {/* ── Editorial Hero Section ── */}
      <div className="relative z-10 w-full pt-8 md:pt-12 pb-8">
        <div className="max-w-2xl">
            {/* Compass / Expedition Motif */}
            <div className="flex items-center gap-2 mb-3 text-[#B08D57]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
              <span className="text-[10px] font-sans font-semibold tracking-[0.25em] uppercase text-[#B08D57]">
                Expedition Archive
              </span>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl font-medium text-[#7A2635] tracking-tight leading-none mb-4">
              Explore
            </h1>
            <p className="font-serif italic text-lg md:text-2xl text-[#24211D] leading-relaxed">
              Stories and ideas from creators around the world.
            </p>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <main className="relative z-10 w-full">
        
        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-10 border-b border-[#D6CCBA] w-full relative pb-1">
          <div className="flex gap-8 -mb-px">
            {["All", "Stories", "Articles"].map(tab => {
              const val = tab.toLowerCase();
              const isActive = filterType === val;
              return (
                <button
                  key={tab}
                  onClick={() => setFilterType(val)}
                  className={`pb-2.5 pt-1 px-1 text-[11px] font-sans font-medium tracking-[0.15em] uppercase transition-all duration-200 border-b-2 ${
                    isActive 
                      ? "text-[#7A2635] border-[#7A2635]" 
                      : "text-[#6F6A61] border-transparent hover:text-[#24211D] hover:border-[#C3B49E]"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
          
          <button className="pb-2.5 pt-1 px-2.5 text-[11px] font-sans font-medium tracking-[0.15em] uppercase text-[#4A463F] hover:text-[#7A2635] transition-colors inline-flex items-center gap-1.5 rounded-sm hover:bg-[var(--odyssey-surface-hover)]">
            Latest <ChevronDown size={13} />
          </button>
        </div>

        {loading ? (
          <ClassicalSkeleton />
        ) : error ? (
          <ErrorState onRetry={fetchContent} message="We couldn't load the expedition feed." />
        ) : filteredItems.length === 0 ? (
          <ClassicalEmptyState message={query ? `No records found for "${query}".` : "Nothing here yet"} />
        ) : (
          <div className="space-y-16">
            
            {/* ── Featured Section ── */}
            {featured.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#D6CCBA]/40">
                   <div className="flex items-center gap-2">
                     <span className="text-[#B08D57] text-xs">✦</span>
                     <h2 className="font-serif text-2xl text-[#24211D]">Featured</h2>
                   </div>
                   {featured.length >= 4 && (
                     <button className="text-[11px] font-sans font-medium tracking-wider uppercase text-[#7A2635] hover:text-[#501923] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm hover:bg-[var(--odyssey-accent-subtle)] transition-colors group">
                       View all <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                     </button>
                   )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featured.map((item) => (
                    item.contentType === "article" ? (
                      <ArticleCard key={`article-${item._id}`} article={item} />
                    ) : (
                      <VideoCard key={`video-${item._id}`} video={item} />
                    )
                  ))}
                </div>
              </section>
            )}

            {/* Editorial Divider */}
            {latest.length > 0 && (
              <div className="flex items-center justify-center gap-4 py-6">
                 <div className="h-px bg-[#D6CCBA] w-full max-w-[140px]" />
                 <div className="rotate-45 w-2 h-2 border border-[#B08D57] block" />
                 <div className="h-px bg-[#D6CCBA] w-full max-w-[140px]" />
              </div>
            )}

            {/* ── Latest Section ── */}
            {latest.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#D6CCBA]/40">
                   <div className="flex items-center gap-2">
                     <span className="text-[#B08D57] text-xs">◆</span>
                     <h2 className="font-serif text-2xl text-[#24211D]">Latest</h2>
                   </div>
                   {latest.length >= 4 && (
                     <button className="text-[11px] font-sans font-medium tracking-wider uppercase text-[#7A2635] hover:text-[#501923] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm hover:bg-[var(--odyssey-accent-subtle)] transition-colors group">
                       View all <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                     </button>
                   )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {latest.map((item) => (
                    item.contentType === "article" ? (
                      <ArticleCard key={`article-${item._id}`} article={item} />
                    ) : (
                      <VideoCard key={`video-${item._id}`} video={item} />
                    )
                  ))}
                </div>
              </section>
            )}
            
            {latest.length > 0 && (
              <div className="pt-10 flex justify-center pb-8 border-t border-[#D6CCBA] mt-14">
                 <button className="border border-[#7A2635] text-[#7A2635] px-6 py-2.5 rounded-sm text-[11px] tracking-[0.12em] uppercase font-medium hover:bg-[#7A2635] hover:text-white transition-colors inline-flex items-center justify-center gap-2 group">
                   Load More <span className="transform group-hover:translate-y-0.5 transition-transform">↓</span>
                 </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
