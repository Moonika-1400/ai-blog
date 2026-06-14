import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Loader2, Info, BookOpen, PenTool, Smile } from "lucide-react";
import { WritingTone, ContentType } from "../types";

interface AICompanionProps {
  onGenerateSuccess: (
    post: { title: string; content: string; summary: string; tags: string[]; contentType: ContentType; mood?: string },
    promptUsed: string
  ) => void;
}

const BLOG_TEMPLATES = [
  {
    title: "Class Presentation summary",
    text: "Key research takeaways on the environmental impacts of digital footprints of students.",
    tone: "academic" as WritingTone,
    length: "medium",
    keywords: ["study", "environment", "digital"]
  },
  {
    title: "Content Creator Hack",
    text: "Simple micro-habits to organize video essay script drafts and maintain inspiration.",
    tone: "creative" as WritingTone,
    length: "short",
    keywords: ["creativity", "videoessay", "habits"]
  }
];

const JOURNAL_TEMPLATES = [
  {
    title: "Weekly Study Review",
    text: "Reflecting on this academic week's biggest learning challenges and wins.",
    tone: "reflective" as WritingTone,
    length: "short",
    mood: "🎯 Focused",
    keywords: ["learning", "weekly", "study"]
  },
  {
    title: "Creative Dream Log",
    text: "Scribbles of a surreal story idea about an archive library that grows overnight.",
    tone: "creative" as WritingTone,
    length: "short",
    mood: "💡 Creative",
    keywords: ["dreams", "story", "ideas"]
  },
  {
    title: "Daily Gratitude Reflection",
    text: "Listing three simple moments from today that brought peacefulness and calm energy.",
    tone: "casual" as WritingTone,
    length: "short",
    mood: "🧘 Calm",
    keywords: ["mindful", "gratitude", "today"]
  }
];

const STAGE_MESSAGES = [
  "Structuring thoughts...",
  "Formulating nice paragraph flows...",
  "Formatting clean markdown checklists...",
  "Polishing daily tags and summaries..."
];

const MOODS_LIST = [
  "🧘 Calm",
  "😊 Happy",
  "🎯 Focused",
  "🧠 Learning",
  "💡 Creative",
  "⚡ Energized",
  "🥺 Tired"
];

export default function AICompanion({ onGenerateSuccess }: AICompanionProps) {
  const [activeTab, setActiveTab] = useState<ContentType>("blog");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<WritingTone>("creative");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [selectedMood, setSelectedMood] = useState<string>("🧘 Calm");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cycle messages during generation
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setGenerationStage((prev) => (prev + 1) % STAGE_MESSAGES.length);
      }, 3000);
    } else {
      setGenerationStage(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const addKeyword = () => {
    const trimmed = keywordInput.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (kwToRemove: string) => {
    setKeywords(keywords.filter((k) => k !== kwToRemove));
  };

  const handleApplyTemplate = (tpl: any, isJournal: boolean) => {
    setPrompt(tpl.text);
    setTone(tpl.tone);
    setLength(tpl.length as "short" | "medium" | "long");
    setKeywords(tpl.keywords || []);
    if (isJournal && tpl.mood) {
      setSelectedMood(tpl.mood);
    }
    setErrorMsg(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);

    // Build specialized prompt instructions if the active tab is journal vs blog
    const refinedPrompt = activeTab === "journal" 
      ? `Write a thoughtful modern personal journal entry based on these quick daily notes or feelings: "${prompt}". 
         Current mood is indicated as ${selectedMood}. 
         Format with headers, perhaps a cozy bulleted breakdown of what was learned or appreciated, and neat markdown.`
      : prompt.trim();

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: refinedPrompt,
          tone,
          length: activeTab === "journal" ? "short" : length,
          keywords: activeTab === "journal" ? [...keywords, "journal", selectedMood.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, "").trim().toLowerCase()] : keywords,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "An unexpected error occurred during draft formulation.");
      }

      onGenerateSuccess(
        {
          title: activeTab === "journal" 
            ? `Reflection: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${data.title}`
            : data.title,
          content: data.content,
          summary: data.summary,
          tags: activeTab === "journal" ? [...data.tags, "journal"] : data.tags,
          contentType: activeTab,
          mood: activeTab === "journal" ? selectedMood : undefined,
        },
        prompt
      );

      // Clean inputs
      setPrompt("");
      setKeywords([]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-100 w-80 shrink-0">
      {/* Brand Tabs Header */}
      <div className="p-3 border-b border-gray-100 flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-gray-400 font-mono tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-neutral-800" />
          CHOOSE ASSISTANT
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => { setActiveTab("blog"); setErrorMsg(null); }}
            className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "blog"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-gray-500 hover:text-neutral-900"
            }`}
          >
            Blog Generator
          </button>
          <button
            onClick={() => { setActiveTab("journal"); setErrorMsg(null); }}
            className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "journal"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-gray-500 hover:text-neutral-900"
            }`}
          >
            Daily Journal
          </button>
        </div>
      </div>

      {/* Primary Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* Templates suggestions for active mode */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
            {activeTab === "journal" ? "Journal Prompts" : "Student Blog Starters"}
          </h3>
          <div className="grid grid-cols-1 gap-1.5">
            {(activeTab === "journal" ? JOURNAL_TEMPLATES : BLOG_TEMPLATES).map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyTemplate(tpl, activeTab === "journal")}
                className="text-left p-2.5 border border-gray-100 bg-gray-50/50 hover:border-neutral-300 hover:bg-white rounded-lg transition-all flex flex-col gap-1 cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold text-neutral-800 flex items-center gap-1">
                    {activeTab === "journal" ? "📓" : "📝"} {tpl.title}
                  </span>
                  {(tpl as any).mood && (
                    <span className="text-[9px] font-sans px-1.5 py-0.5 bg-yellow-50 text-amber-800 rounded">
                      {(tpl as any).mood}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                  {tpl.text}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          
          {/* Mood Check-In for Journal */}
          {activeTab === "journal" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase flex items-center gap-1">
                <Smile className="w-3 h-3" />
                How are you feeling today?
              </label>
              <div className="flex flex-wrap gap-1">
                {MOODS_LIST.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMood(m)}
                    className={`px-2 py-1 rounded text-xs transition border cursor-pointer ${
                      selectedMood === m
                        ? "bg-amber-50 border-amber-300 text-amber-800 font-semibold"
                        : "bg-white border-gray-200 text-gray-600 hover:border-neutral-400"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                {activeTab === "journal" ? "Scribble thoughts / Bullet list" : "Describe post idea"}
              </label>
              {prompt && (
                <button
                  type="button"
                  onClick={() => setPrompt("")}
                  className="text-[9px] text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                activeTab === "journal"
                  ? "Type bullet points of today's events, achievements, worries, or raw creative prose..."
                  : "Type what you'd like the blog post to be about. Keep it simple..."
              }
              rows={4}
              required
              className="w-full p-2.5 border border-gray-200 bg-white rounded-lg text-xs outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400/25 transition-all resize-none leading-relaxed text-neutral-700 placeholder:text-gray-400"
            />
          </div>

          {/* Tone Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Tone
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(["creative", "academic", "casual", "reflective"] as WritingTone[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-2 py-1 rounded text-[11px] font-medium border capitalize transition-all cursor-pointer ${
                    tone === t
                      ? "bg-neutral-900 border-neutral-900 text-white shadow-xs"
                      : "bg-white border-gray-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Sizing/Length Selector (Only for Blog) */}
          {activeTab === "blog" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                Post Length
              </label>
              <div className="flex border border-gray-200 rounded p-0.5 bg-gray-50/50">
                {(["short", "medium", "long"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLength(l)}
                    className={`flex-1 text-center py-1 text-[10px] font-medium rounded capitalize transition-all cursor-pointer ${
                      length === l
                        ? "bg-white text-neutral-900 shadow-xs border border-gray-100"
                        : "text-gray-500 hover:text-neutral-700"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keywords tags input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Attach tags / topics
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="E.g. exam, inspiration"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                className="flex-1 px-2.5 py-1.5 border border-gray-200 bg-white rounded-lg text-xs outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400/25 transition-all text-neutral-700 placeholder:text-gray-350"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-2.5 border border-gray-200 hover:bg-neutral-50 rounded-lg text-xs text-neutral-700 transition cursor-pointer"
              >
                +
              </button>
            </div>
            
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    onClick={() => removeKeyword(kw)}
                    className="group bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 px-1.5 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider cursor-pointer border border-transparent hover:border-red-100 transition-all flex items-center gap-1"
                  >
                    {kw}
                    <span className="text-gray-400 group-hover:text-red-500 font-sans font-bold">×</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              id="btn-trigger-ai-generation"
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors duration-150 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Formulating...
                </>
              ) : (
                <>
                  {activeTab === "journal" ? "Refine Journal Reflection" : "Generate Blog Post"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Display Loader Stage Status */}
        {isGenerating && (
          <div className="bg-neutral-50 border border-neutral-100 p-3.5 rounded-lg flex flex-col gap-1.5 animate-pulse">
            <div className="flex items-center gap-1.5 text-[9px] text-neutral-450 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-700 animate-ping"></span>
              FORMULATING PROSE...
            </div>
            <p className="text-xs text-neutral-700 font-medium font-sans">
              {STAGE_MESSAGES[generationStage]}
            </p>
          </div>
        )}

        {/* Inline Error messages */}
        {errorMsg && (
          <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 text-red-500 mt-0.5" />
            <span className="leading-relaxed font-sans">{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
