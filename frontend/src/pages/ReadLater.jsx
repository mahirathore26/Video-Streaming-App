import { useEffect, useState } from "react";
import ArticleCard from "../components/article/ArticleCard";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { getBookmarkedArticles } from "../services/article";

export default function ReadLater() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await getBookmarkedArticles();
      const articleList = Array.isArray(response?.data) ? response.data : [];
      setArticles(articleList);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  if (loading) return <LoadingState message="Loading your reading list..." />;
  if (error) return <ErrorState onRetry={fetchArticles} message="Could not load your saved articles." />;

  return (
    <div className="odyssey-enter mx-auto max-w-5xl pb-16">
      <div className="mb-10 text-center border-b border-[var(--odyssey-border)] pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-wide text-[var(--odyssey-text)] mb-2">
          Read Later
        </h1>
        <p className="font-serif italic text-lg text-[var(--odyssey-text-muted)]">
          Your saved articles
        </p>
      </div>

      {articles.length === 0 ? (
        <EmptyState message="Your reading list is empty. Explore articles and save some for later." />
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
