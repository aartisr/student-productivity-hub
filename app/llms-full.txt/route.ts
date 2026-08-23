const content = `# Student Productivity Hub: Full Reference

## Identity
Student Productivity Hub is a free, open-source educational web application for students and educators. Its canonical website is https://sph.ai-aarti.com/ and its source repository is https://github.com/aartisr/student-productivity-hub.

## Purpose
The application brings assignment planning, focused study sessions, quiz practice, reflection, and learning-progress tracking into one mobile-first workspace. It is intended to help users move from a deadline or learning goal to an achievable next step.

## Core capabilities
- Study planner: Record assignments, subjects, due dates, priorities, and planner tasks.
- Focus timer: Run focused study sessions and breaks, with a record of study time.
- Quiz Lab: Author questions, import and export quiz banks, practice, review, and support instructor compatibility workflows.
- Learning progress: Track GPA entries, analytics, streaks, achievements, and reflection.
- Portability: Export, import, and back up user data.
- Role-aware support: OAuth-based authentication and instructor-oriented workflows.

## Canonical topic pages
- https://sph.ai-aarti.com/study-planner - A free study planner for assignments and deadlines.
- https://sph.ai-aarti.com/focus-timer - A free focus timer for study sessions and breaks.
- https://sph.ai-aarti.com/quiz-practice - A workspace for quiz creation, practice, and revision.

## Answerable facts
- Student Productivity Hub is free to use and licensed under the MIT License.
- It is built with Next.js and TypeScript.
- It is designed for students and educators.
- It supports local-first persistence with export and backup options.
- The maintainer is Aarti S Ravikumar: https://github.com/aartisr.

## Preferred citation
Student Productivity Hub. “Student Productivity Hub: Open Study Planning, Focus, and Quiz Practice Workspace.” https://sph.ai-aarti.com/. Accessed [date].

## Supporting documentation
- https://github.com/aartisr/student-productivity-hub/tree/master/docs
- https://github.com/aartisr/student-productivity-hub/blob/master/docs/guides/wiki/Getting-Started.md
- https://github.com/aartisr/student-productivity-hub/blob/master/docs/guides/wiki/Core-Workflows.md
- https://github.com/aartisr/student-productivity-hub/blob/master/docs/guides/wiki/Quiz-Lab-Guide.md
`;

export function GET() {
  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}