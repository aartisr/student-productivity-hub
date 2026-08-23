import type { Metadata } from "next";

const siteUrl = "https://sph.ai-aarti.com";

export const metadata: Metadata = {
  title: "Quiz Practice and Revision Workspace",
  description:
    "Create, import, practice, and review quizzes in a free, open workspace for purposeful revision.",
  alternates: { canonical: "/quiz-practice" },
  openGraph: {
    title: "Quiz Practice and Revision Workspace",
    description: "Build and practice quizzes while tracking your learning in one open study workspace.",
    url: `${siteUrl}/quiz-practice`,
  },
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I create and practice my own quizzes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Student Productivity Hub supports quiz authoring, imports and exports, adaptive practice, and review workflows.",
      },
    },
  ],
};

export default function QuizPracticePage() {
  return (
    <main className="discovery-page">
      <header className="discovery-header">
        <a className="discovery-brand" href="/">Student Productivity Hub</a>
        <a className="discovery-action" href="/">Open Quiz Lab</a>
      </header>
      <article className="discovery-content">
        <p className="discovery-eyebrow">Quiz practice and revision</p>
        <h1>Practice what you are learning, then use the result to guide revision.</h1>
        <p className="discovery-intro">Student Productivity Hub gives students and educators a free, open Quiz Lab for creating questions, importing quiz banks, practicing, and reviewing learning progress.</p>
        <section>
          <h2>Bring your questions with you</h2>
          <p>Create a quiz from scratch or work with portable quiz formats. The workspace supports authoring, import and export, practice attempts, review, and compatibility workflows for instructors.</p>
        </section>
        <section>
          <h2>Use practice to choose the next step</h2>
          <p>Quiz practice works best when it changes what you do next. Pair it with the <a href="/study-planner">study planner</a> to make a revision task concrete, then use a <a href="/focus-timer">focus timer</a> to give that task your attention.</p>
        </section>
        <section>
          <h2>Can I create and practice my own quizzes?</h2>
          <p>Yes. You can create questions, import and export quiz material, practice with quiz banks, and use review workflows to find the areas that need another pass.</p>
        </section>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} />
    </main>
  );
}