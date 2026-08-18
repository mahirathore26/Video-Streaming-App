import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SearchBar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (event) => {
    event.preventDefault();
    const nextQuery = query.trim();
    navigate(nextQuery ? `/explore?q=${encodeURIComponent(nextQuery)}` : "/explore");
  };

  return (
    <form onSubmit={handleSearch} className="relative flex items-center gap-2.5 bg-[#FAF8F2] border border-[#D6CCBA] rounded-sm px-3.5 py-2 w-full group max-w-sm shadow-2xs hover:border-[#C3B49E] focus-within:border-[#7A2635] focus-within:ring-1 focus-within:ring-[#7A2635]/20 focus-within:shadow-sm transition-all duration-200">
      <div className="shrink-0 text-[#B08D57] group-focus-within:text-[#7A2635] transition-colors">
        {/* Historic-style magnifying glass */}
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="6" />
          <path d="M14.65 14.65L20 20" strokeWidth="1.75" />
          <path d="M17.5 14.5L14.5 17.5" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>
      <input 
        type="text" 
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search stories, articles, creators..." 
        className="w-full bg-transparent border-none p-0 text-[#24211D] text-[13px] font-sans placeholder:text-[#6F6A61] placeholder:italic outline-none focus:outline-none focus:ring-0"
      />
    </form>
  );
}
