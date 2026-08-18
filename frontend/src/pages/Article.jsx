import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Bookmark, Calendar, User as UserIcon, Sparkles, X } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import { getArticle, toggleBookmarkArticle, getBookmarkedArticles, getArticleSummary } from "../services/article";

export default function Article() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchArticleData = async () => {
      setLoading(true);
      try {
        const response = await getArticle(id);
        const fetched = response.data;
        setArticle(fetched);

        if (currentUser) {
            try {
                // Determine if article is bookmarked ideally from a specific endpoint
                // but since we only have `getBookmarkedArticles()`, we could quickly check it
                const bookmarkRes = await getBookmarkedArticles();
                const bookmarked = bookmarkRes.data.some(b => b._id === fetched._id);
                setIsBookmarked(bookmarked);
            } catch (err) {
                // Silently ignore bookmark fetch error
            }
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchArticleData();
  }, [id, currentUser]);

  const handleBookmarkToggle = async () => {
    if (!currentUser) {
      toast.error("Please login to save articles");
      return;
    }
    
    setBookmarking(true);
    try {
      const response = await toggleBookmarkArticle(article._id);
      setIsBookmarked(response.data.bookmarked);
      toast.success(response.data.bookmarked ? "Article saved to Read Later" : "Article removed from Read Later");
    } catch (err) {
      toast.error("Failed to update bookmark status");
    } finally {
      setBookmarking(false);
    }
  };

  const handleFetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const response = await getArticleSummary(article._id);
      setAiSummary(response.data.summary);
      toast.success("AI Summary generated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate AI summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  if (loading) return <LoadingState message="Loading article..." />;
  if (error || !article) return <ErrorState message="Article not found or unavailable." />;

  const isAuthor = currentUser?._id === (article.author?._id || article.author);

  return (
    <div className="odyssey-enter mx-auto max-w-3xl py-8 pb-32">
      {/* Header */}
      <header className="mb-10 border-b border-[var(--odyssey-border)] pb-8 text-center">
        {article.tags && article.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {article.tags.map(tag => (
              <span key={tag} className="text-[11px] font-sans font-semibold uppercase tracking-widest text-[var(--odyssey-text-secondary)]">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-wide text-[var(--odyssey-text)] mb-6 leading-tight">
          {article.title}
        </h1>
        
        {article.excerpt && (
          <p className="font-serif italic text-xl text-[var(--odyssey-text-muted)] mb-8 max-w-2xl mx-auto">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center justify-center gap-6 mt-8 font-sans text-xs uppercase tracking-wider text-[var(--odyssey-text-muted)]">
          <Link to={`/profile/${article.author.username}`} className="flex items-center gap-2 hover:text-[var(--odyssey-text)] transition-colors">
            {article.author.avatar ? (
              <img src={article.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <UserIcon size={16} />
            )}
            <span className="font-medium text-[var(--odyssey-text-secondary)]">{article.author.fullname || article.author.username}</span>
          </Link>
          
          <span className="flex items-center gap-2">
            <Calendar size={14} />
            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Unpublished Draft"}
          </span>

          {currentUser && (
             <button 
               onClick={handleBookmarkToggle} 
               disabled={bookmarking}
               className={`flex items-center gap-1.5 transition-colors ${isBookmarked ? 'text-[var(--odyssey-accent)]' : 'hover:text-[var(--odyssey-text)]'}`}
             >
               <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
               {isBookmarked ? "Saved" : "Read Later"}
             </button>
          )}

          {isAuthor && (
            <Link to={`/article/write/${article._id}`} className="hover:text-[var(--odyssey-accent)] transition-colors">
              Edit Draft
            </Link>
          )}
        </div>
      </header>

      {/* Cover Image */}
      {article.coverImage && (
        <div className="mb-12 overflow-hidden rounded shadow-sm">
          <img 
            src={article.coverImage} 
            alt="Article cover" 
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* AI Summary Section */}
      <div className="mb-12">
        {!aiSummary && !loadingSummary && (
          <button 
            onClick={handleFetchSummary}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-[#FAF8F2] border border-[#D6CCBA] text-[#7A2635] rounded-sm shadow-xs font-sans text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-[#E9E3D5] hover:text-[#24211D] hover:-translate-y-0.5 transition-all"
          >
            <Sparkles size={15} /> Generative AI Summary
          </button>
        )}
        
        {loadingSummary && (
          <div className="flex items-center justify-center gap-2 mx-auto px-5 py-2.5 bg-[#FAF8F2] border border-[#D6CCBA] text-[#6F6A61] rounded-sm font-sans text-[11px] font-semibold uppercase tracking-[0.2em] w-max animate-pulse">
            <Sparkles size={15} className="animate-spin text-[#7A2635]" /> Analyzing Article...
          </div>
        )}

        {aiSummary && (
          <div className="relative bg-[#FAF8F2] border-l-4 border-l-[#7A2635] p-6 sm:p-8 rounded-r-sm border-t border-r border-b border-t-[#D6CCBA] border-r-[#D6CCBA] border-b-[#D6CCBA] shadow-sm mb-12">
            <button 
              onClick={() => setAiSummary("")} 
              className="absolute top-4 right-4 p-1.5 text-[#6F6A61] hover:text-[#24211D] hover:bg-[#E9E3D5] rounded-full transition-colors flex items-center justify-center"
              title="Dismiss"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-2.5 mb-4">
              <Sparkles size={18} className="text-[#7A2635]" />
              <h3 className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#7A2635]">AI Summary</h3>
            </div>
            <p className="font-serif text-[17.5px] leading-relaxed text-[#24211D]">
              {aiSummary}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <article className="max-w-none text-[var(--odyssey-text)] font-serif pt-4">
        {article.content ? (
          article.content
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((para, idx) => (
              <p
                key={idx}
                className={`mb-8 sm:mb-10 text-[18px] sm:text-[20px] leading-[1.85] sm:leading-[1.95] text-[#24211D] tracking-[0.01em] font-serif ${
                  idx === 0 ? "first-letter:float-left first-letter:text-5xl first-letter:font-serif first-letter:font-normal first-letter:mr-3.5 first-letter:mt-1 first-letter:text-[#7A2635]" : ""
                }`}
              >
                {para}
              </p>
            ))
        ) : (
          <p className="font-serif italic text-lg text-[var(--odyssey-text-muted)]">[ No content in this article ]</p>
        )}
      </article>

      {/* Editorial Footer Divider */}
      <div className="flex items-center justify-center gap-4 pt-16 pb-6">
        <div className="h-px bg-[#D6CCBA] w-full max-w-[160px]" />
        <div className="rotate-45 w-2 h-2 border border-[#B08D57] block" />
        <div className="h-px bg-[#D6CCBA] w-full max-w-[160px]" />
      </div>
    </div>
  );
}
