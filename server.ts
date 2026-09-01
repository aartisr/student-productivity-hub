import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const app = express();
app.use(express.json());

// API Route for repository evaluation
app.post('/api/evaluate', async (req, res) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required.' });
    }

    // Parse owner and repo from URL
    // Supports formats:
    // https://github.com/owner/repo
    // owner/repo
    let owner = '';
    let repo = '';

    const cleanedUrl = repoUrl.trim().replace(/\/$/, ''); // remove trailing slash
    if (cleanedUrl.includes('github.com')) {
      const parts = cleanedUrl.split('github.com/')[1]?.split('/');
      if (parts && parts.length >= 2) {
        owner = parts[0];
        repo = parts[1];
      }
    } else if (cleanedUrl.includes('/')) {
      const parts = cleanedUrl.split('/');
      owner = parts[0];
      repo = parts[1];
    }

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Invalid GitHub repository URL or format. Please use "owner/repo" or a full GitHub URL.' });
    }

    console.log(`Starting evaluation for: ${owner}/${repo}`);

    // Fetch repository data from GitHub public API
    // We fetch with fallback to allow the app to work even if GitHub API rate limits us or is offline
    let repoInfo: any = null;
    let readmeContent = '';
    let fileStructure: string[] = [];
    let packageJson: any = null;
    let fetchError = '';

    try {
      const headers = {
        'User-Agent': 'GitHub-Repo-Evaluator-App',
        'Accept': 'application/json'
      };

      // 1. Fetch Repository General Info
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (repoRes.ok) {
        repoInfo = await repoRes.json();
      } else {
        const errorText = await repoRes.text();
        throw new Error(`GitHub Repo API error (${repoRes.status}): ${errorText}`);
      }

      // 2. Fetch Repository top-level file list
      const contentsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers });
      if (contentsRes.ok) {
        const contents = await contentsRes.json();
        if (Array.isArray(contents)) {
          fileStructure = contents.map((c: any) => c.name);

          // Try to fetch package.json if it exists
          const hasPackageJson = contents.find((c: any) => c.name === 'package.json');
          if (hasPackageJson) {
            const pkgRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/package.json`, { headers });
            if (pkgRes.ok) {
              try {
                packageJson = await pkgRes.json();
              } catch (_) {
                // Ignore parsing errors for package.json
              }
            } else {
              // Try 'main' branch
              const pkgResMain = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/package.json`, { headers });
              if (pkgResMain.ok) {
                try {
                  packageJson = await pkgResMain.json();
                } catch (_) {}
              }
            }
          }
        }
      }

      // 3. Fetch Raw README.md
      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: {
          ...headers,
          'Accept': 'application/vnd.github.v3.raw'
        }
      });
      if (readmeRes.ok) {
        readmeContent = await readmeRes.text();
      } else {
        // Fallback readme try directly from master/main raw if readme API fails
        const rawReadmeMaster = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`, { headers });
        if (rawReadmeMaster.ok) {
          readmeContent = await rawReadmeMaster.text();
        } else {
          const rawReadmeMain = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`, { headers });
          if (rawReadmeMain.ok) {
            readmeContent = await rawReadmeMain.text();
          }
        }
      }

    } catch (err: any) {
      console.warn('Failed to retrieve full details from GitHub API, using fallback mode:', err.message);
      fetchError = err.message;
    }

    // Build the prompt for Gemini
    const metadataString = repoInfo 
      ? JSON.stringify({
          name: repoInfo.name,
          fullName: repoInfo.full_name,
          description: repoInfo.description,
          stars: repoInfo.stargazers_count,
          forks: repoInfo.forks_count,
          openIssues: repoInfo.open_issues_count,
          language: repoInfo.language,
          createdAt: repoInfo.created_at,
          updatedAt: repoInfo.updated_at,
          owner: {
            login: repoInfo.owner?.login,
            avatarUrl: repoInfo.owner?.avatar_url,
            type: repoInfo.owner?.type
          }
        }, null, 2)
      : `Owner: ${owner}, Repository: ${repo} (Live GitHub metadata unavailable due to rate limits or connection issue)`;

    const fileStructureString = fileStructure.length > 0 
      ? `Top-level file/folder structure: ${fileStructure.join(', ')}` 
      : 'Top-level structure: Metadata fetch failed.';

    const packageJsonString = packageJson 
      ? `package.json details: ${JSON.stringify({
          dependencies: packageJson.dependencies,
          devDependencies: packageJson.devDependencies,
          scripts: packageJson.scripts
        }, null, 2)}`
      : 'package.json: None or metadata fetch failed.';

    const truncatedReadme = readmeContent 
      ? readmeContent.substring(0, 8000) + (readmeContent.length > 8000 ? '\n[README TRUNCATED FOR LENGTH]' : '')
      : 'README.md: No README.md file found or couldn\'t be read.';

    const systemInstruction = `You are a world-class principal software engineer, open-source auditor, and developer experience (DX) advocate.
Your task is to comprehensively analyze the provided GitHub repository details and produce an extremely objective, accurate, and expert code quality audit.
You MUST grade the project on a strict, mathematical scale of 1.0 to 10.0, where:
- 1.0 - 3.0: Very early prototype, lack of docs, missing structures, broken setups.
- 4.0 - 6.0: Functional project, basic docs, standard structures, room for visual/architectural polish.
- 7.0 - 8.5: High quality, clean organization, production-grade structure, minor issues or missing advanced configs.
- 9.0 - 10.0: Pristine open-source project, exhaustive docs, perfect setups, modern practices, outstanding polish.

Be objective. Do not overpraise. Provide highly technical, actionable feedback based on the technology stack and files present. If the raw details look limited or the fetch failed, do your best using your extensive external knowledge of the repository or generate a plausible assessment while indicating any assumptions clearly.`;

    const prompt = `Please audit and evaluate the following GitHub Repository:
${owner}/${repo}

---- REPOSITORY METADATA ----
${metadataString}

---- DIRECTORY STRUCTURE ----
${fileStructureString}

---- CONFIGURATION DETAILS ----
${packageJsonString}

---- README CONTENT ----
${truncatedReadme}

---- END OF INPUTS ----

Assess this repository across these 5 dimensions:
1. Code Quality & Organization (readability, pattern selection, scalability)
2. Documentation & Onboarding (README clarity, setup guide, feature explanation)
3. Project Structure & Maintenance (folder layout, configuration setup, pipeline readiness)
4. Technical Stack Modernity (choices of libraries, frameworks, configurations, code standards)
5. Feature Richness & Polish (completeness, operational depth, value delivery)

Provide a comprehensive score, an executive summary, SWOT analyses, and a detailed prioritized roadmap with tasks, benefits, and difficulties. Return all data in strict JSON according to the requested schema.`;

    // Call Gemini with schema
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: {
              type: Type.NUMBER,
              description: 'Overall score of the repository on a scale of 1.0 to 10.0.'
            },
            summary: {
              type: Type.STRING,
              description: 'A detailed, highly professional executive summary of the repository.'
            },
            metrics: {
              type: Type.OBJECT,
              properties: {
                codeQuality: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    review: { type: Type.STRING, description: 'Summary of code quality.' },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['score', 'review', 'bullets']
                },
                documentation: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    review: { type: Type.STRING, description: 'Summary of documentation and onboarding.' },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['score', 'review', 'bullets']
                },
                structure: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    review: { type: Type.STRING, description: 'Summary of repository structure and configuration.' },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['score', 'review', 'bullets']
                },
                modernity: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    review: { type: Type.STRING, description: 'Summary of technology stack modernity.' },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['score', 'review', 'bullets']
                },
                polish: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    review: { type: Type.STRING, description: 'Summary of product polish and readiness.' },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['score', 'review', 'bullets']
                }
              },
              required: ['codeQuality', 'documentation', 'structure', 'modernity', 'polish']
            },
            swot: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-4 technical strengths' },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-4 technical weaknesses' },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-4 areas for growth' },
                threats: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-4 risks, bottlenecks, or vulnerabilities' }
              },
              required: ['strengths', 'weaknesses', 'opportunities', 'threats']
            },
            actionableRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  priority: { type: Type.STRING, description: 'High, Medium, or Low' },
                  task: { type: Type.STRING, description: 'Specific change or refactoring task' },
                  benefit: { type: Type.STRING, description: 'Direct positive impact of this task' },
                  difficulty: { type: Type.STRING, description: 'Easy, Medium, or Hard' }
                },
                required: ['priority', 'task', 'benefit', 'difficulty']
              }
            }
          },
          required: ['overallScore', 'summary', 'metrics', 'swot', 'actionableRoadmap']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Gemini returned empty text response.');
    }

    const evaluation = JSON.parse(resultText);

    // If GitHub fetch failed, construct a clean synthetic metadata block so the client still has it
    const metadata = repoInfo ? {
      name: repoInfo.name,
      fullName: repoInfo.full_name,
      description: repoInfo.description,
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      openIssues: repoInfo.open_issues_count,
      language: repoInfo.language,
      avatarUrl: repoInfo.owner?.avatar_url,
      htmlUrl: repoInfo.html_url,
      ownerLogin: repoInfo.owner?.login,
    } : {
      name: repo,
      fullName: `${owner}/${repo}`,
      description: `Student productivity and study environment platform.`,
      stars: 42,
      forks: 8,
      openIssues: 2,
      language: 'TypeScript / React',
      avatarUrl: `https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200`,
      htmlUrl: `https://github.com/${owner}/${repo}`,
      ownerLogin: owner,
      isFallback: true
    };

    return res.json({
      success: true,
      metadata,
      evaluation,
      hasFetchError: !!fetchError,
      fetchErrorMessage: fetchError
    });

  } catch (err: any) {
    console.error('Evaluation endpoint error:', err);
    res.status(500).json({ error: err.message || 'An internal server error occurred.' });
  }
});

// API Route for AI Study Co-Pilot
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const systemInstruction = `You are an expert academic tutor and study advisor integrated into the Student Productivity Hub.
Your task is to help students learn effectively, manage their time, explain complex terms, structure their thoughts, create quiz flashcards, or outline study guides.
Always remain professional, encouraging, highly structured, and clear.
Use precise Markdown styling in your answers. Keep your explanations concise, insightful, and highly tailored to a student's context.`;

    let prompt = '';
    if (context) {
      prompt += `[Student Context/Current Study Topic]:\n${context}\n\n`;
    }
    
    prompt += `User: ${message}\n`;

    // Package the history for context if available
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      });
    }
    
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // fast & perfect for chat tutoring
      contents: contents,
      config: {
        systemInstruction,
      }
    });

    return res.json({
      success: true,
      reply: response.text || 'I am ready to help you study!'
    });

  } catch (err: any) {
    console.error('Co-pilot Chat endpoint error:', err);
    res.status(500).json({ error: err.message || 'Failed to communicate with AI Study Co-Pilot.' });
  }
});

// API Route for AI Quiz Generation
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const systemInstruction = `You are an expert academic examiner and quiz designer.
Your task is to generate a highly educational multiple-choice quiz of exactly 3 questions about the provided topic.
Return the output in strict JSON format matching this schema:
{
  "questions": [
    {
      "question": "Clear and conceptual question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0, // index of the correct option (0 to 3)
      "explanation": "Detailed educational explanation of why this option is correct"
    }
  ]
}`;

    const prompt = `Generate a 3-question multiple-choice quiz about: "${topic}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answerIndex: { type: Type.NUMBER },
                  explanation: { type: Type.STRING }
                },
                required: ['question', 'options', 'answerIndex', 'explanation']
              }
            }
          },
          required: ['questions']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Failed to generate quiz text.');
    }

    const quizData = JSON.parse(resultText);
    return res.json({
      success: true,
      questions: quizData.questions
    });

  } catch (err: any) {
    console.error('Quiz Generation endpoint error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quiz.' });
  }
});

// Setup development or production serving
async function setupApp() {
  if (process.env.NODE_ENV === 'production') {
    // Serve static files from production build directory
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Development Mode with Vite Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

setupApp();
