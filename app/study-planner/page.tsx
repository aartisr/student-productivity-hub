import type { Metadata } from "next";

const siteUrl = "https://sph.ai-aarti.com";

export const metadata: Metadata = {
  title: "Free Study Planner for Assignments and Deadlines",
  description:
    "Plan assignments, prioritize next steps, and protect deadlines with the free Student Productivity Hub study planner.",
  alternates: { canonical: "/study-planner" },
  openGraph: {
    title: "Free Study Planner for Assignments and Deadlines",
    description: "A calm, free study planner for turning deadlines into manageable next steps.",
    url: `${siteUrl}/study-planner`,
  },
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a study planner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A study planner is a structured place to record assignments, due dates, priorities, and the next actions needed to complete them.",
      },
    },
    {
      "@type": "Question",
      name: "Is Student Productivity Hub free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Student Productivity Hub is an open-source educational web application available under the MIT License.",
      },
    },
  ],
};

export default function StudyPlannerPage() {
  return (
    <main className="discovery-page">
      <header className="discovery-header">
        <a className="discovery-brand" href="/">Student Productivity Hub</a>
        <a className="discovery-action" href="/">Open the planner</a>
      </header>
      <article className="discovery-content">
        <p className="discovery-eyebrow">Free study planner</p>
        <h1>Turn assignments and deadlines into a study plan you can follow.</h1>
        <p className="discovery-intro">
          Student Productivity Hub is a free, open study workspace for students who want one calm place to capture assignments, choose the next useful step, and protect important deadlines.
        </p>
        <section>
          <h2>Plan the work in front of you</h2>
          <p>
            Add assignments with their subject, due date, and priority. Use the planner to break larger work into small tasks, then return to a clear view of what needs attention next.
          </p>
        </section>
        <section>
          <h2>Study without losing the thread</h2>
          <p>
            A plan is more useful when it connects to focused study and revision. The workspace also includes a focus timer, quiz practice, progress tracking, and portable backups.
          </p>
          <p><a href="/focus-timer">Explore the focus timer</a> or <a href="/quiz-practice">learn about quiz practice</a>.</p>
        </section>
        <section>
          <h2>Questions students ask</h2>
          <h3>What is a study planner?</h3>
          <p>A study planner keeps assignments, deadlines, priorities, and concrete next actions together so you can make a realistic decision about what to work on.</p>
          <h3>Is it free?</h3>
          <p>Yes. The application is free and open source under the MIT License. You can inspect the project, contribute improvements, or report an issue on <a href="https://github.com/aartisr/student-productivity-hub">GitHub</a>.</p>
        </section>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} />
    </main>
  );
}