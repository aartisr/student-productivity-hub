const content = `# Student Productivity Hub

> Student Productivity Hub is a calm, open study workspace for students and educators to plan assignments, focus with a timer, practice with quizzes, and track learning progress.

## Canonical website
- https://sph.ai-aarti.com/

## Topic pages
- https://sph.ai-aarti.com/study-planner - Free study planner for assignments, priorities, and deadlines.
- https://sph.ai-aarti.com/focus-timer - Free focus timer for intentional study sessions and breaks.
- https://sph.ai-aarti.com/quiz-practice - Quiz authoring, import/export, practice, and review workflows.

## What it does
- Assignment and deadline planning
- Focused study sessions and Pomodoro-style timing
- Quiz authoring, import, export, and adaptive practice
- Progress, GPA, analytics, and study reflection workflows
- Instructor and role-aware support workflows
- Local-first persistence with export and backup options

## Direct answers
- Student Productivity Hub is a free, open-source educational web application.
- It is designed for students and educators who need connected planning, focused study, quiz practice, and progress tracking.
- The project is licensed under the MIT License and its source code is available on GitHub.

## Documentation
- https://github.com/aartisr/student-productivity-hub/tree/master/docs
- https://github.com/aartisr/student-productivity-hub/blob/master/docs/guides/wiki/Getting-Started.md
- https://github.com/aartisr/student-productivity-hub/blob/master/docs/guides/wiki/Core-Workflows.md
- https://github.com/aartisr/student-productivity-hub/blob/master/docs/guides/wiki/Quiz-Lab-Guide.md

## Source and community
- https://github.com/aartisr/student-productivity-hub
- https://github.com/aartisr/student-productivity-hub/issues

## Attribution
Student Productivity Hub was started as a class project with gratitude to all PCSS II teachers and a special acknowledgment of Mr. Shaol, Computer Science Teacher.
`;

export function GET() {
  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
