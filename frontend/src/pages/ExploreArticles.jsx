import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ArticleCard from "../components/article/ArticleCard";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { getPublicArticles } from "../services/article";

export default function ExploreArticles() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await getPublicArticles(query);
      const articleList = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      setArticles(articleList);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  if (loading) return <LoadingState message="Loading articles..." />;
  if (error) return <ErrorState onRetry={fetchArticles} message="Could not load articles. Please try again." />;

  const safeArticles = Array.isArray(articles) ? articles.filter((article) => article?._id) : [];
  const [featured, ...gridArticles] = safeArticles;

  return (
    <div className="odyssey-page odyssey-enter pb-16 pt-4">
      {/* Header */}
      <section className="mb-8 text-center max-w-2xl mx-auto">
        {query ? (
          <>
            <p className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-[var(--odyssey-text-muted)] mb-3">
              Search results
            </p>
            <h1 className="font-serif text-3xl font-normal text-[var(--odyssey-text)] sm:text-4xl italic">
              &ldquo;{query}&rdquo;
            </h1>
            <div className="mt-6 flex justify-center">
               <Button variant="ghost" size="sm" onClick={() => navigate("/articles")}>
                 Clear Search
               </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[var(--odyssey-text)] tracking-wide mb-4">
              Written words.
            </h1>
            <p className="font-serif italic text-lg text-[var(--odyssey-text-muted)]">
              Explore essays, chronicles, and journeys.
            </p>
            <div className="mt-6">
              <Button size="sm" onClick={() => navigate("/article/write")}>Write an Article</Button>
            </div>
          </>
        )}
      </section>

      <div className="odyssey-rule mb-12" />

      {safeArticles.length === 0 ? (
        <EmptyState message={query ? `No records found for "${query}".` : "The archive is currently empty."} />
      ) : (
        <div className="space-y-16">
          {/* ── Featured hero ── */}
          {featured && (
            <section className="max-w-4xl mx-auto">
              {!query && (
                <p className="mb-6 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[var(--odyssey-warm)] text-center">
                  Featured Article
                </p>
              )}
              <ArticleCard article={featured} />
            </section>
          )}

          {/* ── Grid ── */}
          {gridArticles.length > 0 && (
            <section>
              <div className="mb-8 flex items-baseline justify-between border-b border-[var(--odyssey-border)] pb-2">
                <h2 className="font-serif text-2xl text-[var(--odyssey-text)]">Recent additions</h2>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {gridArticles.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
