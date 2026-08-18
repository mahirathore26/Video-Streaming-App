export default function StoryCard() {
  return (
    <div className="group cursor-pointer overflow-hidden rounded-2xl bg-[#181C25] border border-zinc-800 hover:border-violet-500 transition-all duration-300">

      <div className="relative">
        <div className="h-52 bg-zinc-700"></div>

        <span className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-xs">
          12:45
        </span>
      </div>

      <div className="p-4">

        <h2 className="font-semibold text-lg group-hover:text-violet-400 transition">
          Understanding JWT Authentication
        </h2>

        <p className="text-zinc-400 mt-2">
          CodeWithMahi
        </p>

        <p className="text-zinc-500 text-sm mt-1">
          24K views • 2 days ago
        </p>

      </div>

    </div>
  );
}