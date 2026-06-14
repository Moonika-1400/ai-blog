import { useState, useEffect } from "react";
import { animate, AnimatePresence, motion } from "motion/react";
import { BlogPost, PostStatus, ContentType } from "./types";
import CMSLibrary from "./components/CMSLibrary";
import Editor from "./components/Editor";
import AICompanion from "./components/AICompanion";
import PublishView from "./components/PublishView";
import { 
  Sparkles, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  CheckCircle,
  Clock,
  Info,
  PenTool
} from "lucide-react";

// Prebuild high quality initial state drafts for amazing first launch UX
const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "How I Built a Video Essay Channel in My Dorm",
    summary: "Reflecting on the simple workflows that helped me script, record, and publish 5 viral essays while studying full-time.",
    content: `## Scripting on a Budget

When I first started my video essay channel, I thought I needed expensive microphones, paid outline tools, and fancy team workspaces. I quickly realized that all great content creators need is a simple workspace and genuine thoughts.

### The 3 Rules of Good Video Essay Writing:
- **Write Verbally:** Speak your sentences aloud before drafting them. Video scripts should sound conversational, not like standard academic papers.
- **Hook Fast:** You have about 7 seconds to justify your viewer's attention. Start with a polarizing thesis instead of long intros.
- **The One-Idea Rule:** Every video should explain exactly ONE coherent concept perfectly, rather than touching on 10 things poorly.

## Managing My Time (Student + Creator)

I dedicate 15 quiet minutes every Thursday morning to journal about my next idea. It protects me from stress and keeps my upload schedule consistent!`,
    tags: ["creator", "video", "hacks"],
    status: "draft",
    contentType: "blog",
    createdAt: "2026-06-12T10:30:00Z",
    updatedAt: "2026-06-12T10:30:00Z",
    featuredImageSeed: "minimal设计"
  },
  {
    id: "2",
    title: "Weekly Study Review: Midterm Prep & Digital Cleanse",
    summary: "Reflecting on this academic week's biggest learning challenges and how turning off my phone created deep focus.",
    content: `## A Quiet Saturday Afternoon

Today was one of those rare days where everything went silent. I decided to try a simple "phone in another room" policy while revising for my upcoming midterms.

### What Went Well:
- **Concentration Peak:** I studied for clean 90-minute blocks without the usual urge to scroll social feeds.
- **Academic Flow:** Solved 12 complex algorithms from my textbook and annotated 3 research papers.
- **Mental Clarity:** Felt a deep sense of relief, realizing my mind doesn't need to process 50 short-form clips an hour.

### Learnings:
Creating healthy boundaries for my devices isn't a restriction; it's an investment in my own creative and academic freedom. Simple works.`,
    tags: ["journal", "mindful", "study"],
    status: "draft",
    contentType: "journal",
    mood: "🎯 Focused",
    createdAt: "2026-06-14T05:00:00Z",
    updatedAt: "2026-06-14T05:00:00Z",
    featuredImageSeed: "studyfocused"
  },
  {
    id: "3",
    title: "The Case for Slow Software Craftsmanship",
    summary: "Why the modern rush to ship code often compromises long-term systems, and the case for deliberate engineering.",
    content: `## Speed as a False Metric

We live in a cycle of rapid development. Teams celebrate shipping velocity above all else, tracking code cycles like speed runs. But fast systems often experience architectural cracks under the weight of scaling variables.

Slow software craftsmanship is an invitation to build for durability, legibility, and architectural sanity.

## Deliberate Design

Deliberate engineering starts by asking if code is even required:
- **Refinement over Volume:** A hundred lines of readable, pristine, self-documenting code is infinitely superior to a thousand lines of hurried, complex framework logic.
- **Dependency Sobriety:** Do not pull in large third-party libraries for simple functions. Custom, humble implementations preserve control and minimize security vulnerabilities.
- **Deep Code Reviews:** Treat code reading as a literary exercise. Ask if the ideas flow with simplicity.

## Long-Term Economics

Beautiful software is a legacy system that stays fresh for decades. It starts with selecting correct, simple paradigms (like SQLite or standard document stores) instead of deploying massive, redundant cluster layers.

Let us slow down slightly, write beautiful code, and craft systems that endure.`,
    tags: ["software", "philosophy", "craftsmanship"],
    status: "published",
    createdAt: "2026-06-13T09:12:00Z",
    updatedAt: "2026-06-14T01:45:00Z",
    publishedAt: "2026-06-14T01:45:00Z",
    featuredImageSeed: "slowcrafts",
    contentType: "blog"
  }
];

export default function App() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  // Panel Toggles
  const [showLibrary, setShowLibrary] = useState(true);
  const [showAICompanion, setShowAICompanion] = useState(true);
  
  // Published view preview state
  const [activePublishPost, setActivePublishPost] = useState<BlogPost | null>(null);

  // Initialize and load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("inkflow_drafts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosts(parsed);
        if (parsed.length > 0) {
          setSelectedPostId(parsed[0].id);
        }
      } catch (err) {
        console.error("Failed to load local drafts, pre-loading defaults.", err);
        setPosts(INITIAL_BLOG_POSTS);
        setSelectedPostId("1");
      }
    } else {
      setPosts(INITIAL_BLOG_POSTS);
      setSelectedPostId("1");
    }
  }, []);

  // Save changes to localStorage
  const savePosts = (newPosts: BlogPost[]) => {
    setPosts(newPosts);
    localStorage.setItem("inkflow_drafts", JSON.stringify(newPosts));
  };

  const getSelectedPost = () => {
    return posts.find((p) => p.id === selectedPostId) || null;
  };

  // Create empty new story draft
  const handleCreateNewPost = (type: ContentType) => {
    const newPost: BlogPost = {
      id: Math.random().toString(36).substring(7),
      title: type === "journal" ? `Journal Entry` : "Untitled draft",
      content: "",
      summary: "",
      tags: type === "journal" ? ["journal"] : ["draft"],
      contentType: type,
      status: "draft",
      mood: type === "journal" ? "🧘 Calm" : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featuredImageSeed: Math.random().toString(36).substring(7),
    };
    const updated = [newPost, ...posts];
    savePosts(updated);
    setSelectedPostId(newPost.id);
  };

  // Import uploaded markdown/text file
  const handleImportPost = (imported: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => {
    const newPost: BlogPost = {
      ...imported,
      id: Math.random().toString(36).substring(7),
      contentType: imported.contentType || "blog",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newPost, ...posts];
    savePosts(updated);
    setSelectedPostId(newPost.id);
  };

  // Update selected post content/metadata
  const handleUpdateActivePost = (updates: Partial<BlogPost>) => {
    if (!selectedPostId) return;
    const updated = posts.map((post) => {
      if (post.id === selectedPostId) {
        return {
          ...post,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return post;
    });
    savePosts(updated);
  };

  // Toggle Publish State
  const handlePublishToggle = () => {
    const current = getSelectedPost();
    if (!current) return;

    const nextStatus: PostStatus = current.status === "published" ? "draft" : "published";
    const publishedAt = nextStatus === "published" ? new Date().toISOString() : undefined;

    handleUpdateActivePost({ 
      status: nextStatus,
      publishedAt 
    });
  };

  // Delete a post
  const handleDeletePost = (id: string) => {
    const remaining = posts.filter((p) => p.id !== id);
    savePosts(remaining);
    
    // Auto shift selected post to first remaining
    if (selectedPostId === id) {
      if (remaining.length > 0) {
        setSelectedPostId(remaining[0].id);
      } else {
        setSelectedPostId(null);
      }
    }
  };

  // AI Generation Formulation Success Callback
  const handleAIFormulationSuccess = (
    generated: { 
      title: string; 
      content: string; 
      summary: string; 
      tags: string[]; 
      contentType: ContentType; 
      mood?: string 
    },
    promptUsed: string
  ) => {
    const newPost: BlogPost = {
      id: Math.random().toString(36).substring(7),
      title: generated.title,
      summary: generated.summary,
      content: generated.content,
      tags: generated.tags,
      contentType: generated.contentType || "blog",
      mood: generated.mood,
      status: "draft",
      promptUsed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featuredImageSeed: Math.random().toString(36).substring(7),
    };
    const updated = [newPost, ...posts];
    savePosts(updated);
    setSelectedPostId(newPost.id);
  };

  const handleExportPostMarkdown = (post: BlogPost) => {
    const markdownContent = `# ${post.title}\n\n*${post.summary || "Drafted via AI"}*\n\n${post.content}`;
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "post"}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-stone-50 select-none">
      
      {/* Brand Header */}
      <header className="h-14 border-b border-gray-100 bg-white shrink-0 flex items-center justify-between px-5 z-20">
        <div className="flex items-center gap-3">
          {/* Toggle Library panel */}
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            title="Toggle Library Sidebar"
            className="p-1.5 hover:bg-neutral-50 border border-gray-200 rounded-lg text-neutral-600 cursor-pointer hover:text-neutral-950 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          {/* Title branding logo */}
          <div className="flex items-center gap-1.5 ml-1">
            <div className="w-6 h-6 rounded-md bg-neutral-900 flex items-center justify-center">
              <span className="text-white text-xs font-mono font-bold tracking-tighter">AI</span>
            </div>
            <span className="text-sm font-semibold tracking-wide text-neutral-800">AI Blog & CMS</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-150 text-neutral-500 rounded">v1.2</span>
          </div>
        </div>

        {/* Global status stats */}
        <div className="hidden md:flex items-center gap-5 text-gray-400 font-mono text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            DRAFTS: {posts.filter((p) => p.status === "draft").length}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            PUBLISHED: {posts.filter((p) => p.status === "published").length}
          </div>
        </div>

        {/* Toggle AI Companion panel */}
        <div>
          <button
            onClick={() => setShowAICompanion(!showAICompanion)}
            title="Toggle AI Companion Panel"
            className={`flex items-center gap-1.5 p-1.5 px-3 border rounded-lg text-xs font-medium cursor-pointer transition-all ${
              showAICompanion
                ? "bg-neutral-900 border-neutral-900 text-white"
                : "border-gray-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Assistant
          </button>
        </div>
      </header>


      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side Library Column (CMS) */}
        <AnimatePresence initial={false}>
          {showLibrary && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="overflow-hidden border-r border-gray-100 shrink-0"
            >
              <CMSLibrary
                posts={posts}
                selectedPostId={selectedPostId}
                onSelectPost={(id) => setSelectedPostId(id)}
                onNewPost={handleCreateNewPost}
                onImportPost={handleImportPost}
                onDeletePost={handleDeletePost}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Canvas Writing Workspace */}
        <main className="flex-1 flex overflow-hidden">
          <Editor
            post={getSelectedPost()}
            onUpdatePost={handleUpdateActivePost}
            onDeletePost={handleDeletePost}
            onPublishToggle={handlePublishToggle}
            onViewPublished={() => getSelectedPost() && setActivePublishPost(getSelectedPost())}
          />
        </main>

        {/* Right Side Assistant panel */}
        <AnimatePresence initial={false}>
          {showAICompanion && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="overflow-hidden border-l border-gray-100 shrink-0"
            >
              <AICompanion
                onGenerateSuccess={handleAIFormulationSuccess}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Published Story Viewer overlays */}
      <AnimatePresence>
        {activePublishPost && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="fixed inset-0 z-50 overflow-hidden"
          >
            <PublishView
              post={activePublishPost}
              onClose={() => setActivePublishPost(null)}
              onExport={() => handleExportPostMarkdown(activePublishPost)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
