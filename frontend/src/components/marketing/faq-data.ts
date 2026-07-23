// Single source of truth for the landing page FAQ accordion (LandingPageClient)
// and the FAQPage JSON-LD emitted from app/page.tsx. Keeping both in one place
// guarantees the structured data always matches what's actually rendered —
// Google requires FAQPage markup to mirror visible page content verbatim.
export interface FaqEntry {
  q: string
  a: string
}

export const FAQS: FaqEntry[] = [
  {
    q: 'What is LLDCanvas?',
    a: 'LLDCanvas is a free, all-in-one Low-Level Design (LLD) interview preparation platform: a UML class diagram editor, 23 pre-wired Gang-of-Four design patterns, a curated library of LLD and system design interview questions with staged hints and community discussion, timed Interview Mode with streaks and analytics, bite-sized revision notes on SOLID principles and OOP fundamentals, a plain-English code↔diagram language (Draft Notation), and a multi-language code execution sandbox — everything you need for LLD interview practice in one place, not scattered across seven different tools.',
  },
  {
    q: 'What is Low-Level Design (LLD)?',
    a: 'Low-Level Design (LLD) is the interview round where you design the classes, interfaces, and relationships that implement a system — think "design a Parking Lot" or "design a Rate Limiter" as actual code-level object-oriented design, not just architecture boxes. Interviewers evaluate your class diagrams, your use of design patterns and SOLID principles, and how cleanly your object model extends to new requirements. It sits between coding rounds (data structures & algorithms) and high-level System Design (load balancers, databases, scaling) — LLDCanvas is built specifically for practicing this round.',
  },
  {
    q: 'What is the difference between Low-Level Design (LLD) and System Design (HLD) interviews?',
    a: 'System Design (or High-Level Design) interviews focus on distributed-systems concerns — load balancing, database sharding, caching, and capacity estimation. LLD interviews focus one level down, on the actual object-oriented design: classes, interfaces, inheritance vs. composition, and design patterns for a single service or component. Many SDE interview loops include both. LLDCanvas is purpose-built for the LLD/OOD side — the UML editor, design patterns, and problems library — while also covering system-design-adjacent fundamentals like the CAP theorem, idempotency, and REST vs. RPC in the revision notes library.',
  },
  {
    q: 'How is LLDCanvas different from draw.io or Lucidchart?',
    a: 'draw.io and Lucidchart work with generic shapes. LLDCanvas works with classes. Every node is a real UML class node — with a header, attributes section, and methods section. Relationships carry real semantic meaning (a filled diamond is composition, a hollow triangle is inheritance) instead of being hand-drawn lines. You also get all 23 classic design pattern skeletons pre-wired, plus a full LLD interview-question library, timed interview drills, revision notes, and runnable code — none of which exist in generic diagramming tools.',
  },
  {
    q: 'What is Draft Notation?',
    a: 'A plain-English way to write class diagrams for LLD interview practice — describe classes and relationships in sentences like "User has many Post", and the UML diagram renders itself live as you type. Try it in the standalone Playground, or read the full syntax guide in the Docs.',
  },
  {
    q: 'What is Interview Mode, and how does it help with LLD and system design interview practice?',
    a: 'A timed practice mode built to simulate the pressure of a real interview: set a duration, design against a real countdown, and every session is logged automatically into a daily streak, an activity heatmap, and progress analytics — so the first time you design under real interview pressure isn’t the day it counts.',
  },
  {
    q: 'Does LLDCanvas have a library of LLD and system design interview questions?',
    a: 'Yes — a curated library of 100+ Low-Level Design problems and interview questions, tagged by difficulty (Easy, Medium, Hard) and by the companies known to ask them (Amazon, Google, Meta, Uber, Stripe, and more). Each problem ships with staged hints that unlock one at a time, plus a community discussion thread where you can compare your class diagram against other engineers’ submitted solutions.',
  },
  {
    q: 'Which design patterns and OOP concepts does LLDCanvas cover?',
    a: 'All 23 classic Gang-of-Four design patterns — Singleton, Factory Method, Observer, Strategy, Decorator, Adapter, and 17 more — plus 13 class-role stereotypes for common object-oriented design (OOD) roles. Every pattern is pre-wired with the correct UML relationships and handle positions, so you can insert a working skeleton with Ctrl+K instead of drawing one from memory.',
  },
  {
    q: 'Are SOLID principles covered?',
    a: 'Yes — SOLID principles, composition vs. inheritance, thread-safety, the CAP theorem, idempotency, and REST vs. RPC are all covered as bite-sized revision notes, organized by difficulty (Basic, Intermediate, Advanced) so you can revise the fundamentals in minutes instead of re-reading a textbook chapter.',
  },
  {
    q: 'Can I run code, not just draw diagrams?',
    a: 'Yes — the editor and Playground both include a code execution panel supporting 11 languages (Python, Java, C++, Go, Rust, TypeScript, C#, Ruby, PHP, Haskell, F#), so you can turn a class you designed into real, runnable logic without leaving the canvas.',
  },
  {
    q: 'Can I collaborate with others in real time?',
    a: 'Yes — invite teammates into the same diagram and see their cursors and edits live, no refresh or manual merging required. You can also leave threaded comments pinned to a specific node, with @mentions to bring someone into the conversation — useful for mock interviews and pair design sessions, not just solo LLD practice.',
  },
  {
    q: 'Do I need an account to use it?',
    a: 'No — open the local editor and start drawing immediately. No login, no install. Sign in only when you want cloud sync, Interview Mode history, the problems library, or revision notes tracking.',
  },
  {
    q: 'What happens to my local work if I sign in later?',
    a: 'It migrates automatically — your local diagram is copied to your cloud account the moment you sign in, and you are redirected to it.',
  },
  {
    q: 'Can I export my diagrams?',
    a: 'Yes. Export as PNG (for resumes, slide decks), SVG (scalable, for design docs), PlantUML text, Mermaid text (for GitHub READMEs, Notion, Confluence), or Draft Notation (plain-text, re-importable). All exports are available from the toolbar or the Ctrl+K command palette.',
  },
  {
    q: 'Is LLDCanvas a free LLD course, or just a diagramming tool?',
    a: 'It’s free end to end and functions as a self-paced LLD and system design interview-prep curriculum, not just a drawing tool: the UML editor, all 23 design pattern skeletons, Draft Notation, Interview Mode, the full problems library, revision notes, and code execution are all free right now. Signing in (free, via Google or email) only adds cloud sync and progress tracking across devices — there’s no paywalled "premium course" version of the core learning content.',
  },
  {
    q: 'Do I need a CS degree or prior experience to learn Low-Level Design here?',
    a: 'No — LLDCanvas is built to teach Low-Level Design from the fundamentals up. Start with the Basic-tier revision notes (SOLID principles, composition vs. inheritance), work through Easy problems in the library, and use Draft Notation to describe a design in plain English before you ever need to know UML syntax by heart.',
  },
  {
    q: 'Which companies’ LLD interview questions are covered in the problems library?',
    a: 'Problems are tagged by the companies known to ask them in real interview loops, including Amazon, Google, Meta, Uber, and Stripe, alongside classics like Parking Lot, Rate Limiter, Elevator System, and Notification Service — so you can filter practice toward the companies you’re actually interviewing with.',
  },
  {
    q: 'Is LLDCanvas useful for general SDE and software engineering interview preparation?',
    a: 'It’s purpose-built for the LLD, object-oriented design, and design-patterns portion of software engineering interviews specifically — the round that pure DSA/LeetCode practice doesn’t cover. Most SDE interview loops (Amazon, Google, Meta, and similar) include an LLD or system-design round alongside coding rounds, so LLDCanvas is meant to sit alongside your algorithms prep, not replace it.',
  },
]
