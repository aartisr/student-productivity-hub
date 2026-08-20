/**
 * Viral Notifications System
 * Real-time toast notifications that prompt sharing and drive viral moments
 */

export interface ViralNotification {
  id: string;
  type:
    | "streak_milestone"
    | "achievement_unlock"
    | "quiz_mastery"
    | "leaderboard_climb"
    | "referral_signup"
    | "study_group_invite"
    | "friend_activity";
  title: string;
  message: string;
  emoji: string;
  primaryCta: string;
  secondaryCta?: string;
  duration: number; // milliseconds
  shareUrl?: string;
  action?: () => void;
  secondaryAction?: () => void;
}

// ============================================================================
// NOTIFICATION TEMPLATES
// ============================================================================

export const STREAK_MILESTONE_NOTIFICATIONS: Record<
  number,
  Omit<ViralNotification, "id">
> = {
  5: {
    type: "streak_milestone",
    title: "🔥 5-Day Warrior!",
    message: "You're on fire! Tell friends about your consistency.",
    emoji: "🔥",
    primaryCta: "Share Streak",
    secondaryCta: "Dismiss",
    duration: 8000,
  },
  10: {
    type: "streak_milestone",
    title: "🔥 10-Day Master!",
    message: "10 days straight! Your dedication is legendary.",
    emoji: "🔥",
    primaryCta: "Share on Twitter",
    secondaryCta: "Invite Friends",
    duration: 10000,
  },
  25: {
    type: "streak_milestone",
    title: "🔥 25-Day Unstoppable!",
    message: "Nearly a month of consistency. You're inspiring!",
    emoji: "🔥",
    primaryCta: "Flex on Leaderboard",
    secondaryCta: "Challenge Friends",
    duration: 12000,
  },
  50: {
    type: "streak_milestone",
    title: "🔥 50-Day Phenomenon!",
    message: "Top 5% of all students. You're unstoppable.",
    emoji: "🔥",
    primaryCta: "Share Achievement",
    secondaryCta: "View Leaderboard",
    duration: 15000,
  },
  100: {
    type: "streak_milestone",
    title: "🔥 100-Day Legend!",
    message: "You've joined the 100-day elite club. You're a phenomenon!",
    emoji: "🔥",
    primaryCta: "Share to All Socials",
    secondaryCta: "Get Exclusive Badge",
    duration: 15000,
  },
  365: {
    type: "streak_milestone",
    title: "🔥 365-Day Immortal!",
    message: "A FULL YEAR of consistency. You redefine dedication.",
    emoji: "🔥",
    primaryCta: "Share Worldwide",
    secondaryCta: "Claim Your Badge",
    duration: 20000,
  },
};

export const ACHIEVEMENT_UNLOCK_NOTIFICATIONS: Record<
  string,
  Omit<ViralNotification, "id">
> = {
  rare_achievement: {
    type: "achievement_unlock",
    title: "🎉 Rare Badge Unlocked!",
    message: "You earned a rare achievement. Less than 10% of students have this.",
    emoji: "🎉",
    primaryCta: "Share Badge",
    secondaryCta: "View All",
    duration: 10000,
  },
  epic_achievement: {
    type: "achievement_unlock",
    title: "✨ Epic Achievement!",
    message: "This is legendary. Top 1% of students. Share it NOW.",
    emoji: "✨",
    primaryCta: "Go Viral",
    secondaryCta: "Challenge Friends",
    duration: 12000,
  },
  legendary_achievement: {
    type: "achievement_unlock",
    title: "👑 LEGENDARY!",
    message: "You're in the history books. This is generational.",
    emoji: "👑",
    primaryCta: "Claim Your Glory",
    secondaryCta: "Get Featured",
    duration: 15000,
  },
};

export const QUIZ_MASTERY_NOTIFICATIONS: Record<
  string,
  Omit<ViralNotification, "id">
> = {
  "90_percent": {
    type: "quiz_mastery",
    title: "🎯 90% Mastery!",
    message: "You crushed this quiz. Time to challenge friends?",
    emoji: "🎯",
    primaryCta: "Send Challenge",
    secondaryCta: "Share Score",
    duration: 8000,
  },
  "95_percent": {
    type: "quiz_mastery",
    title: "🌟 95% Perfect!",
    message: "Nearly perfect. You're on top of this material.",
    emoji: "🌟",
    primaryCta: "Post to Feed",
    secondaryCta: "Flex on Leaderboard",
    duration: 8000,
  },
  "100_percent": {
    type: "quiz_mastery",
    title: "🚀 PERFECT SCORE!",
    message: "100%! You've achieved mastery. This is incredible.",
    emoji: "🚀",
    primaryCta: "Announce Victory",
    secondaryCta: "Get Legend Badge",
    duration: 12000,
  },
  improvement: {
    type: "quiz_mastery",
    title: "📈 Major Improvement!",
    message: "You improved by 25+ points! Keep this momentum.",
    emoji: "📈",
    primaryCta: "Share Progress",
    secondaryCta: "View Trend",
    duration: 8000,
  },
};

export const LEADERBOARD_NOTIFICATIONS: Record<
  string,
  Omit<ViralNotification, "id">
> = {
  new_rank: {
    type: "leaderboard_climb",
    title: "📈 Climbed the Ranks!",
    message: "You jumped to position #{newRank}. Keep going!",
    emoji: "📈",
    primaryCta: "View Leaderboard",
    secondaryCta: "Share Screenshot",
    duration: 8000,
  },
  top_100: {
    type: "leaderboard_climb",
    title: "🏆 Top 100 Global!",
    message: "You're now in the top 100 students worldwide.",
    emoji: "🏆",
    primaryCta: "Share Achievement",
    secondaryCta: "Challenge #99",
    duration: 10000,
  },
  top_10: {
    type: "leaderboard_climb",
    title: "🥇 Top 10!",
    message: "You're elite. One of the 10 best students globally.",
    emoji: "🥇",
    primaryCta: "Celebrate",
    secondaryCta: "Get Featured",
    duration: 12000,
  },
  number_1: {
    type: "leaderboard_climb",
    title: "👑 #1 CHAMPION!",
    message: "You're the #1 student globally. You're a legend.",
    emoji: "👑",
    primaryCta: "Share Victory",
    secondaryCta: "Interview Request",
    duration: 15000,
  },
};

export const REFERRAL_NOTIFICATIONS: Record<
  string,
  Omit<ViralNotification, "id">
> = {
  friend_signup: {
    type: "referral_signup",
    title: "🎁 Friend Joined!",
    message: "Your friend just signed up! You both earned rewards.",
    emoji: "🎁",
    primaryCta: "See Rewards",
    secondaryCta: "Invite More",
    duration: 8000,
  },
  multiple_signups: {
    type: "referral_signup",
    title: "🌟 Recruiter Badge Unlocked!",
    message: "You've recruited 5 friends! You're a top recruiter.",
    emoji: "🌟",
    primaryCta: "View My Squad",
    secondaryCta: "Keep Recruiting",
    duration: 10000,
  },
  study_squad_leader: {
    type: "referral_signup",
    title: "👑 Study Squad Leader!",
    message: "10 friends recruited. You're leading a movement!",
    emoji: "👑",
   primaryCta: "Featured Recruiter",
    secondaryCta: "Share Squad Link",
    duration: 12000,
  },
};

export const FRIEND_ACTIVITY_NOTIFICATIONS: Record<
  string,
  Omit<ViralNotification, "id">
> = {
  friend_milestone: {
    type: "friend_activity",
    title: "👥 Friend Hit Milestone!",
    message: "{friendName} just hit a 10-day streak. Can you match it?",
    emoji: "👥",
    primaryCta: "Match Streak",
    secondaryCta: "Celebrate",
    duration: 8000,
  },
  friend_beat_you: {
    type: "friend_activity",
    title: "🔥 Friend Beat Your Score!",
    message: "{friendName} just scored {score}% on the quiz. Rematch?",
    emoji: "🔥",
    primaryCta: "Challenge Back",
    secondaryCta: "View Score",
    duration: 10000,
  },
  group_achievement: {
    type: "friend_activity",
    title: "🎉 Group Celebration!",
    message: "Your study group unlocked a team achievement!",
    emoji: "🎉",
    primaryCta: "Celebrate",
    secondaryCta: "View Group",
    duration: 8000,
  },
};

export const STUDY_GROUP_NOTIFICATIONS: Record<
  string,
  Omit<ViralNotification, "id">
> = {
  invited_to_group: {
    type: "study_group_invite",
    title: "👥 Join Study Group!",
    message: "{inviterName} invited you to \"{groupName}\"",
    emoji: "👥",
    primaryCta: "Join Group",
    secondaryCta: "Later",
    duration: 10000,
  },
  group_milestone: {
    type: "study_group_invite",
    title: "🎯 Group Goal Achieved!",
    message: "Your group reached {goal}! Celebrate together.",
    emoji: "🎯",
    primaryCta: "Celebrate",
    secondaryCta: "Share",
    duration: 8000,
  },
};

// ============================================================================
// NOTIFICATION MANAGER
// ============================================================================

export interface NotificationQueue {
  notifications: ViralNotification[];
  activeNotification: ViralNotification | null;
  queue: (notification: Omit<ViralNotification, "id">) => void;
  dismiss: () => void;
  subscribe: (callback: (n: ViralNotification | null) => void) => () => void;
}

export function createNotificationManager(): NotificationQueue {
  let notifications: ViralNotification[] = [];
  let activeNotification: ViralNotification | null = null;
  let subscribers: Array<(n: ViralNotification | null) => void> = [];
  let activeTimer: NodeJS.Timeout | null = null;

  function notify(listeners: ((n: ViralNotification | null) => void)[]) {
    listeners.forEach((cb) => cb(activeNotification));
  }

  function showNext() {
    if (activeTimer) clearTimeout(activeTimer);

    if (notifications.length === 0) {
      activeNotification = null;
      notify(subscribers);
      return;
    }

    activeNotification = notifications.shift()!;
    notify(subscribers);

    activeTimer = setTimeout(showNext, activeNotification.duration);
  }

  return {
    get notifications() {
      return [...notifications];
    },
    get activeNotification() {
      return activeNotification;
    },
    queue(notification: Omit<ViralNotification, "id">) {
      notifications.push({
        ...notification,
        id: `notif-${Date.now()}-${Math.random()}`,
      });

      if (!activeNotification) {
        showNext();
      }
    },
    dismiss() {
      if (activeTimer) clearTimeout(activeTimer);
      showNext();
    },
    subscribe(callback: (n: ViralNotification | null) => void) {
      subscribers.push(callback);
      return () => {
        subscribers = subscribers.filter((s) => s !== callback);
      };
    },
  };
}

// ============================================================================
// VIRAL MOMENT TRIGGERS
// ============================================================================

export function triggerViralNotifications(
  streakDays: number,
  previousStreakDays: number,
  newAchievements: string[],
  newQuizScores: number[],
  manager: NotificationQueue
) {
  // Streak milestones
  const milestones = [5, 10, 25, 50, 100, 365];
  milestones.forEach((milestone) => {
    if (
      streakDays === milestone &&
      previousStreakDays < milestone &&
      STREAK_MILESTONE_NOTIFICATIONS[milestone]
    ) {
      manager.queue(STREAK_MILESTONE_NOTIFICATIONS[milestone]);
    }
  });

  // Achievement unlocks
  newAchievements.forEach((achievementType) => {
    const template = ACHIEVEMENT_UNLOCK_NOTIFICATIONS[achievementType];
    if (template) manager.queue(template);
  });

  // Quiz mastery
  newQuizScores.forEach((score) => {
    if (score === 100 && QUIZ_MASTERY_NOTIFICATIONS["100_percent"]) {
      manager.queue(QUIZ_MASTERY_NOTIFICATIONS["100_percent"]);
    } else if (score >= 95 && QUIZ_MASTERY_NOTIFICATIONS["95_percent"]) {
      manager.queue(QUIZ_MASTERY_NOTIFICATIONS["95_percent"]);
    } else if (score >= 90 && QUIZ_MASTERY_NOTIFICATIONS["90_percent"]) {
      manager.queue(QUIZ_MASTERY_NOTIFICATIONS["90_percent"]);
    }
  });
}

// ============================================================================
// NOTIFICATION COMPONENT INTEGRATION
// ============================================================================

export const NOTIFICATION_TOAST_CSS = `
  .viral-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    max-width: 400px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 20px;
    color: #fff;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 9999;
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(400px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .viral-notification__emoji {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .viral-notification__title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .viral-notification__message {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 12px;
    line-height: 1.4;
  }

  .viral-notification__ctas {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .viral-notification__cta {
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 100px;
  }

  .viral-notification__cta:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  .viral-notification__cta.primary {
    background: #fff;
    color: #667eea;
  }

  .viral-notification__cta.primary:hover {
    background: rgba(255, 255, 255, 0.9);
  }

  @media (max-width: 640px) {
    .viral-notification {
      bottom: 10px;
      right: 10px;
      left: 10px;
      max-width: none;
    }
  }
`;
