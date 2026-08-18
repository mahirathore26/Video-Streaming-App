import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";

function formatDuration(seconds) {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Ensure the helper works flawlessly
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

export default function VideoCard({ video, hideOwner = false }) {
  if (!video) return null;
  const ownerName = video.owner?.fullname || video.owner?.username;
  const ownerAvatar = video.owner?.avatar;
  const views = `${(video.views || 0)} views`;
  
  const displayDuration = formatDuration(video.duration);

  return (
    <Link to={`/story/${video._id}`} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7A2635] rounded-sm transform hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E9E3D5] rounded-sm shadow-xs border border-[#D6CCBA] mb-3.5 transition-all duration-300 group-hover:border-[#C3B49E] group-hover:shadow-md">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[#6F6A61] font-serif italic">
            [ No Thumbnail ]
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 bg-[#FAF8F2]/95 px-2 py-0.5 border border-[#D6CCBA] shadow-2xs backdrop-blur-md">
          <span className="text-[9px] text-[#7A2635] uppercase tracking-[0.2em] font-bold font-sans">
            Video
          </span>
        </div>

        {displayDuration && (
          <div className="absolute bottom-2 right-2 bg-[#FAF8F2]/95 px-1.5 py-0.5 border border-[#D6CCBA] shadow-2xs backdrop-blur-md">
            <span className="text-[9px] text-[#24211D] font-semibold font-sans tracking-wide">
              {displayDuration}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 px-1 min-w-0">
        <h3 className="line-clamp-2 font-serif text-[18px] leading-snug text-[#24211D] group-hover:text-[#7A2635] transition-colors">
          {video.title}
        </h3>
        
        <div className="mt-1 flex items-start gap-2.5">
          {!hideOwner && ownerName && (
             <Avatar src={ownerAvatar} name={ownerName} size="xs" className="mt-0.5" />
          )}
          <div className="flex flex-col min-w-0">
             {!hideOwner && ownerName && (
                <span className="font-sans text-[12px] font-medium text-[#24211D] truncate block">
                  {ownerName}
                </span>
             )}
             <div className="flex items-center gap-1.5 font-sans text-[11px] font-medium text-[#6F6A61] tracking-wide uppercase mt-0.5">
               <span>{TimeAgo(video.createdAt)}</span>
               <span className="text-[9px]">•</span>
               <span>{views}</span>
             </div>
          </div>
          
          <button className="ml-auto p-1 text-[#D6CCBA] hover:text-[#B08D57] transition-colors focus:outline-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}
