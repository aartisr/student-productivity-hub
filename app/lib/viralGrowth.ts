/**
 * Viral Growth Utilities
 * Generates shareable content, tracking analytics, and viral moments
 */

import { Achievement, StudyStreak, QuizAttempt, AppData } from "../domain";

// ============================================================================
// SHAREABLE CARD GENERATOR - Creates viral-worthy content
// ============================================================================

export interface ShareableCard {
  title: string;
  description: string;
  imageData: string;
  hashtags: string[];
  cta: string;
  url: string;
}

export function generateStreakCard(streak: StudyStreak): ShareableCard {
  return {
    title: `🔥 Day ${streak.currentStreak} Streak!`,
    description: `I'm on a ${streak.currentStreak}-day study streak on Student Productivity Hub!`,
    imageData: `streak-${streak.currentStreak}`,
    hashtags: ["#StudentLife", "#StudyStreak", "#ProductivityHub", "#LearningJourney"],
    cta: "Join my study squad",
    url: `studenthub.app/streak`,
  };
}

export function generateAchievementCard(achievement: Achievement): ShareableCard {
  return {
    title: `🎉 ${achievement.badgeName}`,
    description: `I just unlocked "${achievement.badgeName}" - ${achievement.badgeDescription}`,
    imageData: `achievement-${achievement.badgeId}`,
    hashtags: ["#Achievement", "#StudentHub", "#StudyWin", "#Learning"],
    cta: "Get this badge too",
    url: `studenthub.app/achievements`,
  };
}

export function generateQuizMasteryCard(
  quiz: QuizAttempt,
  improvement: number
): ShareableCard {
  return {
    title: `📊 Quiz Mastery: ${quiz.percent}%`,
    description: `I improved by ${improvement}% on "${quiz.quizTitle}" - ${quiz.correct}/${quiz.total} correct!`,
    imageData: `quiz-${quiz.percent}`,
    hashtags: ["#QuizMastery", "#StudyWin", "#LearningGoals", "#StudentHub"],
    cta: "Challenge me",
    url: `studenthub.app/quiz/${quiz.quizId}`,
  };
}

export function generateMilestoneCard(milestone: string, count: number): ShareableCard {
  const milestoneMessages: Record<string, string> = {
    study_hours: `I've logged ${count} study hours!`,
    assignments: `I've completed ${count} assignments!`,
    quizzes: `I've mastered ${count} quizzes!`,
    streak_days: `I'm on a ${count}-day study streak!`,
  };

  return {
    title: `🏆 Milestone Unlocked!`,
    description: milestoneMessages[milestone] || `I've reached ${count} ${milestone}`,
    imageData: `milestone-${milestone}-${count}`,
    hashtags: ["#Milestone", "#StudentHub", "#LearningWins", "#StudyGoals"],
    cta: "Join the study movement",
    url: `studenthub.app`,
  };
}

// ============================================================================
// VIRAL MOMENTS TRACKER
// ============================================================================

export interface ViralMoment {
  id: string;
  type:
    | "streak_milestone"
    | "achievement_unlock"
    | "quiz_mastery"
    | "study_goal_reached"
    | "leaderboard_climb";
  userId: string;
  timestamp: number;
  data: Record<string, any>;
  shareCount: number;
  impressions: number;
}

export function detectViralMoments(
  userId: string,
  currentStreak: StudyStreak,
  lastStreak: StudyStreak | null,
  newAchievements: Achievement[],
  recentQuizzes: QuizAttempt[]
): ViralMoment[] {
  const moments: ViralMoment[] = [];
  const now = Date.now();

  // Streak milestone moments (10, 25, 50, 100 days)
  const streakMilestones = [10, 25, 50, 100, 365];
  streakMilestones.forEach((milestone) => {
    if (
      currentStreak.currentStreak === milestone &&
      (!lastStreak || lastStreak.currentStreak < milestone)
    ) {
      moments.push({
        id: `streak-${milestone}-${now}`,
        type: "streak_milestone",
        userId,
        timestamp: now,
        data: { streak: milestone },
        shareCount: 0,
        impressions: 0,
      });
    }
  });

  // Achievement unlock moments
  newAchievements.forEach((achievement) => {
    moments.push({
      id: `achievement-${achievement.id}-${now}`,
      type: "achievement_unlock",
      userId,
      timestamp: now,
      data: { badgeName: achievement.badgeName, icon: achievement.icon },
      shareCount: 0,
      impressions: 0,
    });
  });

  // Quiz mastery moments (90%+ scores)
  recentQuizzes.forEach((quiz) => {
    if (quiz.percent >= 90) {
      moments.push({
        id: `quiz-mastery-${quiz.id}-${now}`,
        type: "quiz_mastery",
        userId,
        timestamp: now,
        data: { quizTitle: quiz.quizTitle, score: quiz.percent },
        shareCount: 0,
        impressions: 0,
      });
    }
  });

  return moments;
}

// ============================================================================
// VIRAL ANALYTICS TRACKER
// ============================================================================

export interface ViralMetrics {
  shareRate: number;
  referralConversionRate: number;
  weeklyActiveInvites: number;
  averageFriendsInvited: number;
  viralCoefficient: number; // < 1 is viral decay, > 1 is viral growth
}

export function calculateViralMetrics(appData: AppData): ViralMetrics {
  const totalUsers = appData.users.length;
  const totalReferrals = Object.values(appData.referrals).reduce(
    (sum, ref) => sum + ref.invitesUsed,
    0
  );

  // Viral coefficient calculation
  // (friends invited per user) * (conversion rate)
  const invitedPerUser = totalUsers > 0 ? totalReferrals / totalUsers : 0;
  const conversionRate = totalReferrals > 0 ? totalUsers / Math.max(totalReferrals, 1) : 0.3;
  const viralCoefficient = invitedPerUser * conversionRate;

  return {
    shareRate:
      totalUsers > 0
        ? (appData.achievements.length * 3.5) / totalUsers
        : 0,
    referralConversionRate: conversionRate,
    weeklyActiveInvites:
      totalReferrals > 0
        ? Math.floor(
            totalReferrals *
              0.4 * // 40% of referrals happen weekly
              0.7 // 70% retention
          )
        : 0,
    averageFriendsInvited: invitedPerUser,
    viralCoefficient,
  };
}

// ============================================================================
// VIRAL MESSAGING - Smart CTAs based on user behavior
// ============================================================================

export function getViralCTA(
  currentStreak: number,
  achievementCount: number,
  quizMastery: number
): string {
  if (currentStreak >= 25) {
    return `🔥 Share your ${currentStreak}-day streak with friends!`;
  }
  if (achievementCount >= 5) {
    return `🏆 Showcase your ${achievementCount} badges! Invite friends to study together.`;
  }
  if (quizMastery >= 85) {
    return `📊 You're crushing quizzes! Help friends level up their learning.`;
  }
  if (currentStreak >= 10) {
    return `🎯 Your ${currentStreak}-day streak is impressive. Share it!`;
  }
  return `✨ Tell friends about your study progress on Student Productivity Hub!`;
}

// ============================================================================
// VIRAL GROWTH RECOMMENDATIONS
// ============================================================================

export function getGrowthRecommendations(metrics: ViralMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.viralCoefficient < 0.5) {
    recommendations.push("💡 Invite 2-3 study partners to join your squad");
  }
  if (metrics.shareRate < 0.5) {
    recommendations.push("📤 Share your recent achievements on social media");
  }
  if (metrics.referralConversionRate < 0.2) {
    recommendations.push("🎁 Create a study group link and share it with Discord servers");
  }

  return recommendations;
}

// ============================================================================
// NOTIFICATION TRIGGERS - For real-time viral moments
// ============================================================================

export function shouldNotifyFriends(
  currentStreak: number,
  previousStreak: number
): boolean {
  // Notify on streak milestones: 5, 10, 25, 50, 100, 365 days
  const milestones = [5, 10, 25, 50, 100, 365];
  return (
    milestones.some(
      (m) => currentStreak === m && previousStreak < m
    )
  );
}

export function shouldNotifyAchievement(
  rarity: "common" | "rare" | "epic" | "legendary"
): boolean {
  // Notify friends for rare+ achievements
  return rarity !== "common";
}

// ============================================================================
// VIRAL COPY TEMPLATES
// ============================================================================

export const VIRAL_COPY = {
  CTAButtons: [
    "Join my study squad →",
    "Study smarter with me →",
    "Level up together →",
    "Compare achievements →",
    "Join the streak challenge →",
  ],
  ShareHeadlines: [
    "I just mastered a quiz on Student Productivity Hub",
    "My study streak is now {count} days! 🔥",
    "Check out my achievement: {badge}",
    "I logged {hours} study hours this week",
    "Joined a study group on Student Productivity Hub",
  ],
  InviteMessages: [
    "Want to join me on Student Productivity Hub? We can study together and compare progress.",
    "I'm on {days}-day study streak on this amazing app. Join me?",
    "Check out Student Productivity Hub - it's helping me stay organized and motivated.",
    "Compete with me on the leaderboard! {link}",
  ],
  Hashtags: [
    "#StudentHub",
    "#StudyStreak",
    "#ProductivityHack",
    "#StudentLife",
    "#LearningGoals",
    "#AchievementUnlocked",
    "#QuizMaster",
    "#StudyBuddy",
  ],
};

// ============================================================================
// VIRAL WIDGET DATA GENERATOR
// ============================================================================

export interface ViralWidget {
  title: string;
  metric: number | string;
  emoji: string;
  color: string;
  cta: string;
  shareLink: string;
}

export function generateViralWidgets(appData: AppData): ViralWidget[] {
  const currentUser = appData.currentUser;
  const userStreak = appData.streaks[currentUser];
  const userAchievements = appData.achievements.filter((a) => a.userId === currentUser);
  const userQuizzes = appData.quizAttempts[currentUser] || [];
  const avgQuizScore =
    userQuizzes.length > 0
      ? Math.round(userQuizzes.reduce((sum, q) => sum + q.percent, 0) / userQuizzes.length)
      : 0;

  return [
    ...(userStreak
      ? [
          {
            title: "Current Streak",
            metric: `${userStreak.currentStreak} days 🔥`,
            emoji: "🔥",
            color: "amber",
            cta: "Share streak",
            shareLink: `studenthub.app/share/streak/${userStreak.currentStreak}`,
          },
        ]
      : []),
    {
      title: "Achievements Unlocked",
      metric: `${userAchievements.length} badges`,
      emoji: "🏆",
      color: "purple",
      cta: "Show off",
      shareLink: `studenthub.app/share/achievements`,
    },
    {
      title: "Quiz Mastery",
      metric: `${avgQuizScore}% average`,
      emoji: "📊",
      color: "blue",
      cta: "Challenge friends",
      shareLink: `studenthub.app/quiz-challenge`,
    },
    {
      title: "Study Consistency",
      metric: userStreak
        ? `${Math.round((userStreak.totalStudyDays / 365) * 100)}% of days`
        : "Starting streak",
      emoji: "📈",
      color: "green",
      cta: "Join leaderboard",
      shareLink: `studenthub.app/leaderboard`,
    },
  ];
}
