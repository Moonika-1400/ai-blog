import React, { useState } from "react";
import { BlogPost, PostStatus, ContentType } from "../types";
import { 
  BookOpen, 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Archive, 
  CheckCircle, 
  FileUp,
  Tag,
  Clock,
  Book,
  PenTool
} from "lucide-react";

interface CMSLibraryProps {
  posts: BlogPost[];
  selectedPostId: string | null;
  onSelectPost: (id: string) => void;
  onNewPost: (type: ContentType) => void;
  onImportPost: (post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => void;
  onDeletePost: (id: string) => void;
}

export default function CMSLibrary({
  posts,
  selectedPostId,
  onSelectPost,
  onNewPost,
  onImportPost,
  onDeletePost,
}: CMSLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilter, setCurrentFilter] = useState<"all" | PostStatus>("all");
  const [contentTypeFilter, setContentTypeFilter] = useState<"all" | ContentType>("all");
  const [selectedTagFitler, setSelectedTagFilter] = useState<string | null>(null);

  // Parse all available tags across all posts
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags || []).filter(Boolean))
  );

  // Filter posts list
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = currentFilter === "all" || post.status === currentFilter;
    const matchesContentType = contentTypeFilter === "all" || post.contentType === contentTypeFilter;
    const matchesTag = !selectedTagFitler || (post.tags && post.tags.includes(selectedTagFitler));

    return matchesSearch && matchesStatus && matchesContentType && matchesTag;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      let title = file.name.replace(/\.[^/.]+$/, ""); // strip extension
      let mainContent = text;

      if (text.trim().startsWith("# ")) {
        const lines = text.split("\n");
        title = lines[0].substring(2).trim();
        mainContent = lines.slice(1).join("\n").trim();
      }

      onImportPost({
        title,
        content: mainContent,
        summary: `Imported from ${file.name}`,
        tags: ["imported"],
        status: "draft",
        contentType: "blog",
        featuredImageSeed: Math.random().toString(36).substring(7),
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const getWordCount = (content: string) => {
    if (!content || !content.trim()) return 0;
    return content.trim().split(/\s+/).length;
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 w-80 shrink-0">
      {/* Header Panel */}
      <div className="p-5 border-b border-gray-100 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-neutral-800" />
            <h2 className="text-xs font-bold tracking-wider text-neutral-800 uppercase">My Library</h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
            {posts.length} saved
          </span>
        </div>

        {/* Action button groupings */}
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <button
              onClick={() => onNewPost("blog")}
              id="btn-create-new-post"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Blog Post
            </button>
            <button
              onClick={() => onNewPost("journal")}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <PenTool className="w-3.5 h-3.5" />
              New Journal
            </button>
          </div>
          <label className="flex items-center justify-center gap-2 py-1.5 border border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-lg text-xs text-neutral-500 cursor-pointer transition-colors">
            <FileUp className="w-3.5 h-3.5" />
            <span>Upload (.md / .txt)</span>
            <input
              type="file"
              accept=".md,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Search & Filter Options */}
      <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/40 flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search blogs or journals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400/25 transition-all text-neutral-700"
          />
        </div>

        {/* Content Type Filter */}
        <div className="flex bg-gray-150 p-1 rounded-lg">
          <button
            onClick={() => { setContentTypeFilter("all"); setSelectedTagFilter(null); }}
            className={`flex-1 text-center py-1 text-[10px] font-semibold rounded-md transition-all ${
              contentTypeFilter === "all"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-gray-500 hover:text-neutral-900"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => { setContentTypeFilter("blog"); setSelectedTagFilter(null); }}
            className={`flex-1 text-center py-1 text-[10px] font-semibold rounded-md transition-all ${
              contentTypeFilter === "blog"
                ? "bg-white text-neutral-905 shadow-xs"
                : "text-gray-500 hover:text-neutral-900"
            }`}
          >
            Blogs 📝
          </button>
          <button
            onClick={() => { setContentTypeFilter("journal"); setSelectedTagFilter(null); }}
            className={`flex-1 text-center py-1 text-[10px] font-semibold rounded-md transition-all ${
              contentTypeFilter === "journal"
                ? "bg-white text-neutral-905 shadow-xs"
                : "text-gray-500 hover:text-neutral-900"
            }`}
          >
            Journals 📓
          </button>
        </div>

        {/* Tab filters */}
        <div className="flex gap-1 border-b border-gray-100 pb-1.5">
          <button
            onClick={() => { setCurrentFilter("all"); setSelectedTagFilter(null); }}
            className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md transition-all ${
              currentFilter === "all" && !selectedTagFitler
                ? "bg-neutral-100 text-neutral-900"
                : "text-gray-500 hover:text-neutral-900"
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => { setCurrentFilter("draft"); setSelectedTagFilter(null); }}
            className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md transition-all ${
              currentFilter === "draft"
                ? "bg-amber-55 text-amber-900"
                : "text-gray-500 hover:text-neutral-900"
            }`}
          >
            Drafts
          </button>
          <button
            onClick={() => { setCurrentFilter("published"); setSelectedTagFilter(null); }}
            className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md transition-all ${
              currentFilter === "published"
                ? "bg-emerald-55 text-emerald-900"
                : "text-gray-500 hover:text-neutral-900"
            }`}
          >
            Published
          </button>
        </div>

        {/* Tag Filters list (only visible if we have tags) */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pt-1">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(selectedTagFitler === tag ? null : tag)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider transition-all border ${
                  selectedTagFitler === tag
                    ? "bg-neutral-800 text-white border-neutral-800"
                    : "bg-white text-gray-505 border-gray-200 hover:border-neutral-400"
                }`}
              >
                <Tag className="w-2.5 h-2.5 shrink-0" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Posts Listing */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <Archive className="w-8 h-8 text-neutral-300" />
            <p className="text-xs text-gray-400 font-sans">No drafts or entries found.</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isSelected = post.id === selectedPostId;
            const words = getWordCount(post.content);
            const readTime = Math.max(1, Math.round(words / 220));
            const isJournal = post.contentType === "journal";

            return (
              <div
                key={post.id}
                onClick={() => onSelectPost(post.id)}
                className={`group p-4 flex flex-col gap-1.5 cursor-pointer transition-all border-l-2 ${
                  isSelected
                    ? "bg-neutral-50/80 border-neutral-900"
                    : "hover:bg-gray-50/45 border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-xs shrink-0" title={isJournal ? "Journal Entry" : "Blog Post"}>
                      {isJournal ? "📓" : "📝"}
                    </span>
                    <h3 className={`text-xs font-semibold tracking-tight line-clamp-1 leading-tight flex-1 ${
                      isSelected ? "text-neutral-900 font-bold" : "text-neutral-700"
                    }`}>
                      {post.title || "Untitled draft"}
                    </h3>
                  </div>
                  
                  {/* Status Indicator */}
                  {post.status === "published" ? (
                    <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded uppercase font-mono font-bold">Live</span>
                  ) : (
                    <span className="text-[8px] bg-amber-50 text-amber-700 px-1 py-0.5 rounded uppercase font-mono font-bold">Draft</span>
                  )}
                </div>

                {post.summary && (
                  <p className="text-[10px] text-gray-450 line-clamp-2 leading-relaxed font-sans">
                    {post.summary}
                  </p>
                )}

                {/* Tags and Mood indicator */}
                <div className="flex items-center justify-between mt-1 text-[9px] text-gray-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {readTime}m
                    </span>
                    {post.mood && (
                      <span className="font-sans px-1 py-0.2 bg-yellow-50 text-amber-900 rounded select-none">
                        {post.mood}
                      </span>
                    )}
                  </div>

                  {/* Quick Delete action (visible on hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this story? This cannot be undone.")) {
                        onDeletePost(post.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-600 transition-opacity duration-150 cursor-pointer"
                    title="Delete Draft"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
