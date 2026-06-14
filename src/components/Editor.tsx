import { useState, useRef, useEffect } from "react";
import { BlogPost, WritingTone } from "../types";
import { 
  Sparkles, 
  Trash2, 
  FileText, 
  Eye, 
  Edit3, 
  Download, 
  BookOpen, 
  Loader2, 
  CheckCircle,
  Clock,
  HelpCircle
} from "lucide-react";

interface EditorProps {
  post: BlogPost | null;
  onUpdatePost: (updates: Partial<BlogPost>) => void;
  onDeletePost: (id: string) => void;
  onPublishToggle: () => void;
  onViewPublished: () => void;
}

export default function Editor({
  post,
  onUpdatePost,
  onDeletePost,
  onPublishToggle,
  onViewPublished,
}: EditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [isEditingSelection, setIsEditingSelection] = useState(false);
  const [customAIInstruction, setCustomAIInstruction] = useState("");
  const [aiActionLoading, setAiActionLoading] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionBubbleRef = useRef<HTMLDivElement>(null);

  // Monitor text selections in the text-area to show inline AI prompt trigger
  const handleTextareaSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedStr = textarea.value.substring(start, end).trim();
      if (selectedStr.length > 5) { // Minimum threshold to prevent tiny triggers
        setSelectedText(selectedStr);
        setSelectionRange({ start, end });
        return;
      }
    }
    // Only reset if selection is fully lost and we aren't active in editing selection
    if (!isEditingSelection) {
      setSelectedText("");
      setSelectionRange(null);
    }
  };

  // Perform server-side inline editing
  const handleAIEditAction = async (action: string) => {
    if (!post || !selectedText) return;
    setAiActionLoading(true);

    try {
      const response = await fetch("/api/ai/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedText,
          action,
          customInstruction: action === "custom" ? customAIInstruction : undefined,
          blogContext: `Topic: ${post.title}\nFull Text: ${post.content}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to edit selection.");
      }

      const updatedText = data.text;
      
      // Weave the edited section back into the document
      if (selectionRange && textareaRef.current) {
        const fullContent = post.content;
        const newContent =
          fullContent.substring(0, selectionRange.start) +
          updatedText +
          fullContent.substring(selectionRange.end);

        onUpdatePost({ content: newContent });
        
        // Reset state
        setSelectedText("");
        setSelectionRange(null);
        setIsEditingSelection(false);
        setCustomAIInstruction("");
      }
    } catch (error: any) {
      alert(error.message || "Could not process AI edit action.");
    } finally {
      setAiActionLoading(false);
    }
  };

  // Tag helper controls
  const handleAddTag = () => {
    if (!post) return;
    const cleanTag = newTagInput.trim().toLowerCase();
    if (cleanTag && !post.tags.includes(cleanTag)) {
      onUpdatePost({ tags: [...post.tags, cleanTag] });
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!post) return;
    onUpdatePost({ tags: post.tags.filter((t) => t !== tagToRemove) });
  };

  // Export files handler
  const handleExportMarkdown = () => {
    if (!post) return;
    const markdownContent = `# ${post.title}\n\n*${post.summary || "Drafted via InkFlow AI"}*\n\n${post.content}`;
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "inkflow-post"}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWordCount = () => {
    if (!post || !post.content) return 0;
    return post.content.trim().split(/\s+/).filter(Boolean).length;
  };

  const getCharCount = () => {
    if (!post) return 0;
    return post.content.length;
  };

  const getReadTime = () => {
    const words = getWordCount();
    return Math.max(1, Math.round(words / 220));
  };

  if (!post) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#fafafa] text-stone-400 p-8">
        <div className="text-center space-y-3 max-w-sm">
          <BookOpen className="w-12 h-12 text-stone-200 mx-auto" />
          <h3 className="text-sm font-semibold text-neutral-800">No Draft Selected</h3>
          <p className="text-xs text-stone-400 leading-relaxed font-sans">
            Choose an existing draft from the Library, upload a markdown file, or write a fresh prompt on the right to auto-generate a new story.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfdfd] overflow-hidden">
      {/* Editor top Action bar */}
      <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-2">
          {/* Status badge */}
          <span className={`text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full border ${
            post.status === "published"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-amber-50 text-amber-700 border-amber-100"
          }`}>
            {post.status}
          </span>
          <span className="text-xs text-gray-400 font-mono hidden md:inline">
            • Auto-saved to browser
          </span>
        </div>

        {/* View mode switches and main operations */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
            <button
              onClick={() => setIsPreviewMode(false)}
              className={`p-1.5 px-3 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
                !isPreviewMode
                  ? "bg-white text-neutral-900 shadow-xs border border-gray-100"
                  : "text-gray-500 hover:text-neutral-900"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Write
            </button>
            <button
              onClick={() => setIsPreviewMode(true)}
              className={`p-1.5 px-3 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
                isPreviewMode
                  ? "bg-white text-neutral-900 shadow-xs border border-gray-100"
                  : "text-gray-500 hover:text-neutral-900"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>

          <span className="w-px h-5 bg-gray-150 mx-1"></span>

          <button
            onClick={handleExportMarkdown}
            title="Export Markdown file"
            className="p-1 px-2.5 border border-gray-200 text-neutral-600 hover:bg-neutral-50 rounded-lg text-xs font-medium cursor-pointer transition-colors duration-100 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export</span>
          </button>

          <button
            onClick={onPublishToggle}
            id="btn-publish-toggle"
            className={`p-1 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 flex items-center gap-1.5 ${
              post.status === "published"
                ? "border border-red-200 text-red-600 hover:bg-red-50"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
            }`}
          >
            {post.status === "published" ? "Unpublish" : "Publish"}
          </button>

          {post.status === "published" && (
            <button
              onClick={onViewPublished}
              id="btn-view-published-story"
              className="p-1 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Read Post
            </button>
          )}
        </div>
      </div>

      {/* Editor primary canvas */}
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 flex flex-col items-center">
        <div className="w-full max-w-2xl flex flex-col h-full gap-4 relative">
          
          {/* Metadata selection banner helper */}
          {selectedText && (
            <div
              ref={selectionBubbleRef}
              className="bg-neutral-900 text-white p-3.5 rounded-xl shadow-xl border border-neutral-700/50 flex flex-col gap-2 z-30 w-full animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-yellow-400" /> SELECTED SECTOR ({selectedText.split(/\s+/).length} words)</span>
                <button 
                  onClick={() => { setSelectedText(""); setSelectionRange(null); setIsEditingSelection(false); }}
                  className="text-neutral-400 hover:text-white"
                >
                  Dismiss ×
                </button>
              </div>
              <p className="text-xs text-neutral-300 italic line-clamp-2 leading-relaxed bg-neutral-800/60 p-2 rounded-md border border-neutral-800">
                "{selectedText}"
              </p>
              
              {/* Direct Quick AI refinement shortcuts */}
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  disabled={aiActionLoading}
                  onClick={() => handleAIEditAction("improve")}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  ✨ Improve Prose
                </button>
                <button
                  type="button"
                  disabled={aiActionLoading}
                  onClick={() => handleAIEditAction("expand")}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  ➕ Expand Detail
                </button>
                <button
                  type="button"
                  disabled={aiActionLoading}
                  onClick={() => handleAIEditAction("shorten")}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  ✂️ Condense
                </button>
                <button
                  type="button"
                  disabled={aiActionLoading}
                  onClick={() => handleAIEditAction("tone-casual")}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  ☕ Make Casual
                </button>
                <button
                  type="button"
                  disabled={aiActionLoading}
                  onClick={() => handleAIEditAction("tone-professional")}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  💼 Make Professional
                </button>
                <button
                  type="button"
                  disabled={aiActionLoading}
                  onClick={() => handleAIEditAction("improve-grammar")}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  ✍️ Clean Grammar
                </button>
              </div>

              {/* Custom AI commands inside context */}
              <div className="flex gap-1 border-t border-neutral-800 pt-2 mt-1">
                <input
                  type="text"
                  placeholder="Ask AI to customize selection (e.g., translate to French, rewrite as bullet points...)"
                  value={customAIInstruction}
                  onChange={(e) => setCustomAIInstruction(e.target.value)}
                  disabled={aiActionLoading}
                  className="flex-1 bg-neutral-800 border border-neutral-700 text-white text-[11px] px-3 py-1.5 rounded-lg outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500/20"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customAIInstruction.trim()) {
                      handleAIEditAction("custom");
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={aiActionLoading || !customAIInstruction.trim()}
                  onClick={() => handleAIEditAction("custom")}
                  className="p-1 px-3 bg-neutral-200 hover:bg-neutral-300 disabled:bg-neutral-700 disabled:text-neutral-500 text-neutral-900 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                >
                  {aiActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-2" /> : "Apply"}
                </button>
              </div>
            </div>
          )}

          {/* Actual Writer Workspace */}
          {!isPreviewMode ? (
            <div className="flex-1 flex flex-col gap-4">
              {/* Post Title Edit */}
              <input
                type="text"
                placeholder="Title your story..."
                value={post.title}
                onChange={(e) => onUpdatePost({ title: e.target.value })}
                className="w-full text-3xl font-serif font-semibold tracking-tight text-neutral-900 bg-transparent outline-none border-b border-transparent focus:border-neutral-100 py-2 border-dashed leading-tight"
              />

              {/* Tag Editor Row */}
              <div className="flex flex-wrap items-center gap-1.5 py-1">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-stone-100 text-zinc-600 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 border border-neutral-200/50"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-400 hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                <input
                  type="text"
                  placeholder="+ Add parameter tag"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="text-[10px] font-mono outline-none uppercase tracking-wider text-zinc-400 bg-transparent py-0.5 border-b border-transparent hover:border-zinc-200 focus:border-zinc-400 focus:text-zinc-800"
                />
              </div>

              {/* Journal Mood input if post type is journal */}
              {post.contentType === "journal" && (
                <div className="flex flex-col gap-1.5 p-3.5 bg-yellow-50/20 rounded-xl border border-yellow-100/50">
                  <label className="text-[10px] font-bold text-amber-800 tracking-wider uppercase flex items-center gap-1 leading-none">
                    Daily Reflection Mood
                  </label>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {["🧘 Calm", "😊 Happy", "🎯 Focused", "🧠 Learning", "💡 Creative", "⚡ Energized", "🥺 Tired"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => onUpdatePost({ mood: m })}
                        className={`px-2.5 py-1 rounded text-xs transition border cursor-pointer ${
                          post.mood === m
                            ? "bg-amber-100 border-amber-300 text-amber-950 font-semibold"
                            : "bg-white/80 border-gray-200 text-gray-500 hover:border-neutral-300"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta Hook / Summary input */}
              <div className="flex flex-col gap-1.5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                <label className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase flex items-center gap-1">
                  Meta Description / Summary
                </label>
                <input
                  type="text"
                  placeholder="Set a meta summary description that draws readers in..."
                  value={post.summary}
                  onChange={(e) => onUpdatePost({ summary: e.target.value })}
                  className="bg-transparent text-xs text-neutral-600 outline-none w-full"
                />
              </div>

              {/* Editor Workspace Instruction */}
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 bg-blue-50/50 p-2.5 px-3 rounded-lg border border-blue-100/30 font-sans leading-relaxed">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>
                  <strong>Tip:</strong> Highlight five or more words of your prose to summon our **prose editor companion** and rewrite your copy. Works natively with standard Markdown rules.
                </span>
              </div>

              {/* Main Text Content area */}
              <textarea
                ref={textareaRef}
                value={post.content}
                onChange={(e) => onUpdatePost({ content: e.target.value })}
                onMouseUp={handleTextareaSelection}
                onKeyUp={handleTextareaSelection}
                placeholder="Start typing your thoughts here, or use the prompt assistant on the right..."
                className="w-full flex-1 min-h-[350px] outline-none font-serif text-[17px] text-stone-800 leading-relaxed bg-transparent resize-none h-full placeholder:text-stone-300"
              />
            </div>
          ) : (
            /* Rendered Markdown Preview Mode */
            <div className="flex-1 flex flex-col gap-6 select-text">
              <h1 className="text-4xl font-serif font-bold text-neutral-900 tracking-tight leading-tight">
                {post.title || "Untitled draft"}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 font-mono border-b border-gray-100 pb-4">
                <span className="flex items-center gap-1 bg-neutral-900 text-white px-2 py-0.5 rounded uppercase font-bold text-[9px] select-none">
                  {post.contentType === "journal" ? "📓 Journal" : "📝 Blog"}
                </span>
                {post.mood && (
                  <span className="bg-yellow-50 text-amber-900 border border-yellow-100 px-2 py-0.5 rounded text-[9px] font-sans">
                    Mood: {post.mood}
                  </span>
                )}
                <span>•</span>
                <span className="text-[10px] uppercase font-bold tracking-wider">{post.status}</span>
                <span>•</span>
                <span>{getReadTime()} min read</span>
                <span>•</span>
                <span>{getWordCount()} words</span>
              </div>

              {post.summary && (
                <p className="text-lg text-neutral-500 italic font-serif leading-relaxed pl-4 border-l-2 border-stone-200">
                  {post.summary}
                </p>
              )}

              {/* Markdown Rendered output */}
              <div className="prose-editor text-stone-800 font-serif leading-loose space-y-6">
                {post.content ? (
                  post.content.split("\n\n").map((block, idx) => {
                    const trimmed = block.trim();
                    if (trimmed.startsWith("## ")) {
                      return <h2 key={idx}>{trimmed.substring(3)}</h2>;
                    }
                    if (trimmed.startsWith("### ")) {
                      return <h3 key={idx}>{trimmed.substring(4)}</h3>;
                    }
                    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                      return (
                        <ul key={idx} className="list-disc pl-5 my-2 space-y-1">
                          {trimmed.split("\n").map((li, liIdx) => (
                            <li key={liIdx}>{li.substring(2)}</li>
                          ))}
                        </ul>
                      );
                    }
                    // Bold support
                    const renderedParts = trimmed.split("**").map((part, pIdx) => {
                      if (pIdx % 2 === 1) return <strong key={pIdx}>{part}</strong>;
                      return part;
                    });
                    return <p key={idx}>{renderedParts}</p>;
                  })
                ) : (
                  <p className="text-zinc-300 italic">No content written yet...</p>
                )}
              </div>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-6 border-t border-gray-50 flex-neutral-400">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-stone-50 border border-gray-100 text-stone-500 px-2.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editor footer metrics summary */}
      <div className="h-10 border-t border-gray-100 flex items-center justify-between px-6 bg-white text-[10px] text-gray-400 font-mono tracking-wider uppercase shrink-0">
        <div className="flex items-center gap-4">
          <span>WORDS: {getWordCount()}</span>
          <span>CHARS: {getCharCount()}</span>
        </div>
        <div>
          <span>EST. READ TIME: {getReadTime()} Min</span>
        </div>
      </div>
    </div>
  );
}
