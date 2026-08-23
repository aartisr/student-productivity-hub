import type { Metadata } from "next";

const siteUrl = "https://sph.ai-aarti.com";

export const metadata: Metadata = {
  title: "Free Focus Timer for Study Sessions",
  description:
    "Use a free, flexible focus timer for study sessions, breaks, and a more intentional learning routine.",
  alternates: { canonical: "/focus-timer" },
  openGraph: {
    title: "Free Focus Timer for Study Sessions",
    description: "Set up focused study sessions and breaks in a calm, open study workspace.",
    url: `${siteUrl}/focus-timer`,
  },
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How can a focus timer help with studying?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A focus timer gives a study session a clear start and finish, making it easier to begin a task, sustain attention, and take a deliberate break.",
      },
    },
  ],
};

export default function FocusTimerPage() {
  return (
    <main className="discovery-page">
      <header className="discovery-header">
        <a className="discovery-brand" href="/">Student Productivity Hub</a>
        <a className="discovery-action" href="/">Start a focus session</a>
      </header>
      <article className="discovery-content">
        <p className="discovery-eyebrow">Free focus timer</p>
        <h1>Make room for focused study, one session at a time.</h1>
        <p className="discovery-intro">Student Productivity Hub includes a simple timer for focused study sessions and intentional breaks. It sits alongside your assignments, plan, quizzes, and progress rather than becoming another disconnected tool.</p>
        <section>
          <h2>A timer with a purpose</h2>
          <p>Choose a study session, start the timer, and return to your plan when you are done. The goal is not to optimize every minute. It is to make starting a little easier and build a record of meaningful study time.</p>
        </section>
        <section>
          <h2>Connect focus to the rest of your learning</h2>
          <p>Use the focus timer after identifying the next task in the <a href="/study-planner">study planner</a>, then reinforce what you learned with <a href="/quiz-practice">quiz practice</a>. Progress data stays connected to the work that produced it.</p>
        </section>
        <section>
          <h2>How can a focus timer help with studying?</h2>
          <p>A timer gives a study session a clear start and finish. That structure can make it easier to begin a task, sustain attention, and take a deliberate break before choosing what comes next.</p>
        </section>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} />
    </main>
  );
}