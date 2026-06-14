import { useState } from "react";
import { BlogPost } from "../types";
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Printer, 
  BookOpen, 
  Calendar, 
  Bookmark, 
  Copy, 
  CheckCircle,
  Clock
} from "lucide-react";

interface PublishViewProps {
  post: BlogPost;
  onClose: () => void;
  onExport: () => void;
}

export default function PublishView({ post, onClose, onExport }: PublishViewProps) {
  const [copied, setCopied] = useState(false);

  const getWordCount = (content: string) => {
    if (!content) return 0;
    return content.trim().split(/\s+/).filter(Boolean).length;
  };

  const getReadTime = (content: string) => {
    const words = getWordCount(content);
    return Math.max(1, Math.round(words / 220));
  };

  // Generate a beautiful abstract SVG pattern based on the featuredImageSeed string hash
  const generateAbstractPattern = (seed: string = "inkflow") => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 140) % 360;
    const saturation = 55; // elegant pastel/muted saturation
    const lightness = 65;

    return (
      <svg className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">
        <defs>
          <linearGradient id={`grad-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`hsl(${hue1}, ${saturation}%, ${lightness - 20}%)`} />
            <stop offset="50%" stopColor={`hsl(${(hue1 + 40) % 360}, ${saturation}%, ${lightness}%)`} />
            <stop offset="100%" stopColor={`hsl(${hue2}, ${saturation - 10}%, ${lightness + 10}%)`} />
          </linearGradient>
          <pattern id={`pattern-${seed}`} width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
            <rect width="100" height="100" fill="none" />
            <circle cx="20" cy="20" r="1.5" fill="rgba(255, 255, 255, 0.25)" />
            <line x1="0" y1="20" x2="40" y2="20" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.5" />
          </pattern>
        </defs>
        
        {/* Background gradient */}
        <rect width="100%" height="100%" fill={`url(#grad-${seed})`} />
        
        {/* Grid Overlay */}
        <rect width="100%" height="100%" fill={`url(#pattern-${seed})`} />

        {/* Abstract floating circles */}
        <circle cx="200" cy="150" r="110" fill="rgba(255, 255, 255, 0.12)" filter="blur(4px)" />
        <circle cx="580" cy="240" r="160" fill="rgba(255, 255, 255, 0.08)" filter="blur(6px)" />
        <circle cx="410" cy="180" r="80" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
        
        {/* Abstract aesthetic card lines */}
        <line x1="50" y1="50" x2="750" y2="50" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="0.5" />
        <line x1="50" y1="350" x2="750" y2="350" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="0.5" />

        <text x="50" y="335" fontFamily="monospace" fontSize="11" fill="rgba(255, 255, 255, 0.6)" letterSpacing="1">
          INKFLOW ARTICLE COMPONENT // SEED: {seed.toUpperCase()}
        </text>
      </svg>
    );
  };

  const handleCopyLink = () => {
    const fakeUrl = `${window.location.origin}/stories/${post.id}`;
    navigator.clipboard.writeText(fakeUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const publishDateStr = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });

  return (
    <div className="fixed inset-0 bg-[#fbfbfb] z-50 flex flex-col overflow-y-auto select-text">
      
      {/* Published View Reader bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 h-14 shrink-0 flex items-center justify-between px-6 z-10 transition-colors">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors py-1.5 px-3 rounded-lg hover:bg-neutral-50 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Close Reader
        </button>

        <div className="flex items-center gap-2">
          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors py-1.5 px-3 rounded-lg border border-gray-200 text-xs font-semibold cursor-pointer bg-white"
          >
            {copied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 animate-in fade-in zoom-in-75 duration-150" />
                Copied Link!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Link
              </>
            )}
          </button>

          {/* Export button */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors py-1.5 px-3 rounded-lg border border-gray-200 text-xs font-semibold cursor-pointer bg-white"
          >
            <Download className="w-3.5 h-3.5" />
            Markdown
          </button>

          {/* Prints layout page */}
          <button
            onClick={handlePrint}
            title="Print post"
            className="p-1 px-3 border border-gray-200 hover:bg-neutral-50 rounded-lg text-neutral-600 cursor-pointer text-xs"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main visual document layout */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 flex flex-col gap-8">
        
        {/* Post abstract Featured Graphic Banner */}
        <div className="h-64 w-full rounded-2xl overflow-hidden shadow-xs border border-gray-100 select-none bg-indigo-50">
          {generateAbstractPattern(post.featuredImageSeed || post.id)}
        </div>

        {/* Metabar */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3.5 text-xs text-neutral-400 font-mono tracking-wide uppercase">
            <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
              <Bookmark className="w-3 h-3 text-emerald-600" />
              Published
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {publishDateStr}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {getReadTime(post.content)} min read
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 pt-2">
            {/* Publisher author circle */}
            <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold shadow-xs select-none">
              {post.contentType === "journal" ? "📓" : "✍️"}
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-800">
                {post.contentType === "journal" ? "Personal Journal Entry" : "AI Blog Writer"}
              </p>
              <p className="text-[10px] text-gray-400 font-mono">
                {post.mood ? `Mood: ${post.mood}` : "DOCUMENT PREVIEW"}
              </p>
            </div>
          </div>
        </div>

        {post.summary && (
          <div className="py-2.5">
            <p className="text-xl text-neutral-500 font-serif leading-relaxed italic border-l-3 border-neutral-300 pl-4">
              {post.summary}
            </p>
          </div>
        )}

        {/* Rendered fully polished readable document */}
        <article className="prose-editor text-stone-800 font-serif leading-loose text-[18px] md:text-[19px] space-y-7 border-t border-gray-100 pt-8 pb-16">
          {post.content ? (
            post.content.split("\n\n").map((block, idx) => {
              const trimmed = block.trim();
              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={idx} className="font-serif font-bold text-2xl text-neutral-900 mt-8 mb-4 tracking-tight">
                    {trimmed.substring(3)}
                  </h2>
                );
              }
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={idx} className="font-serif font-semibold text-lg text-neutral-800 mt-6 mb-3">
                    {trimmed.substring(4)}
                  </h3>
                );
              }
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <ul key={idx} className="list-disc pl-6 my-4 space-y-2 text-stone-700">
                    {trimmed.split("\n").map((li, liIdx) => (
                      <li key={liIdx}>{li.substring(2)}</li>
                    ))}
                  </ul>
                );
              }
              // Bold support
              const renderedParts = trimmed.split("**").map((part, pIdx) => {
                if (pIdx % 2 === 1) return <strong key={pIdx} className="font-bold text-neutral-900">{part}</strong>;
                return part;
              });
              return <p key={idx} className="mb-4">{renderedParts}</p>;
            })
          ) : (
            <p className="text-stone-300 italic">This post contains no content.</p>
          )}
        </article>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-20">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-neutral-100 border border-neutral-200/50 text-neutral-600 px-3 py-1 rounded text-xs lowercase font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
