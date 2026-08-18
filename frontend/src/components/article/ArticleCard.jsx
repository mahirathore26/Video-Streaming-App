import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";

function TimeAgo(dateInput) {
  if (!dateInput) return "";
  const diffInMs = new Date() - new Date(dateInput);
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks === 1) return "1 week ago";
  if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) return "1 month ago";
  return `${diffInMonths} months ago`;
}

function calculateReadTime(content, providedReadTime) {
  if (providedReadTime) return providedReadTime;
  if (!content) return "3 min read";
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export default function ArticleCard({ article, hideOwner = false }) {
  if (!article) return null;
  const ownerName = article.author?.fullname || article.author?.username;
  const ownerAvatar = article.author?.avatar;
  const readTimeStr = calculateReadTime(article.content, article.readTime);

  return (
    <Link
      to={`/article/${article.slug || article._id}`}
      className="group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7A2635] rounded-sm transform hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E9E3D5] rounded-sm shadow-xs border border-[#D6CCBA] mb-3.5 transition-all duration-300 group-hover:border-[#C3B49E] group-hover:shadow-md">
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[#6F6A61] font-serif italic">
            [ Essay Archive ]
          </div>
        )}

        {/* Clean, editorial top-left tag */}
        <div className="absolute top-2.5 left-2.5 bg-[#FAF8F2]/90 px-2 py-0.5 border border-[#D6CCBA]/80 shadow-2xs backdrop-blur-sm rounded-2xs">
          <span className="text-[9.5px] text-[#7A2635] uppercase tracking-[0.18em] font-medium font-sans">
            Essay
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 justify-between px-0.5 min-w-0">
        <div>
          <h3 className="line-clamp-2 font-serif text-[17px] font-normal leading-snug text-[#24211D] group-hover:text-[#7A2635] transition-colors">
            {article.title}
          </h3>
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-[#D6CCBA]/40 pt-2.5">
          <div className="flex items-center gap-2 min-w-0">
            {!hideOwner && ownerName && (
              <Avatar src={ownerAvatar} name={ownerName} size="xs" />
            )}
            <div className="flex items-center gap-1.5 min-w-0 font-sans text-[10.5px] text-[#6F6A61] tracking-wider uppercase font-medium">
              {!hideOwner && ownerName && (
                <>
                  <span className="text-[#24211D] truncate max-w-[110px] sm:max-w-[130px]">
                    {ownerName}
                  </span>
                  <span>·</span>
                </>
              )}
              <span className="shrink-0">{TimeAgo(article.createdAt)}</span>
              <span>·</span>
              <span className="shrink-0 text-[#7A2635] font-semibold">{readTimeStr}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
