"use client";

import React, { useState } from "react";
import {
  Achievement,
  LeaderboardEntry,
  StudyStreak,
  StudyGroup,
  ReferralLink,
} from "../domain";

// ============================================================================
// STUDY STREAK CARD - Shows daily consistency tracking
// ============================================================================
export function StreakCard({ streak }: { streak?: StudyStreak }) {
  if (!streak)
    return (
      <article className="panel community-panel streak-panel">
        <div className="community-panel-heading">
          <span className="community-icon">🔥</span>
          <h2>Start Your Streak</h2>
        </div>
        <p className="compact-line">
          Study today to begin your daily consistency streak.
        </p>
      </article>
    );

  const streakPercentage = (streak.currentStreak / Math.max(streak.longestStreak, 1)) * 100;

  return (
    <article className="panel community-panel streak-panel">
      <div className="community-panel-heading community-panel-split">
        <div className="community-title-row">
          <span className="community-icon">🔥</span>
          <div>
            <strong className="streak-value">
              {streak.currentStreak}
            </strong>
            <div className="community-caption">DAY STREAK</div>
          </div>
        </div>
        <div className="community-stat">
          <div className="community-caption">Personal best</div>
          <strong>
            {streak.longestStreak} days
          </strong>
        </div>
      </div>
      <progress
        className="streak-progress"
        aria-label={`${streak.currentStreak} day streak, personal best ${streak.longestStreak} days`}
        max={100}
        value={Math.min(streakPercentage, 100)}
      />
      <div className="community-caption">
        Total study days: {streak.totalStudyDays}
      </div>
    </article>
  );
}

// ============================================================================
// ACHIEVEMENT BADGE DISPLAY
// ============================================================================
export function AchievementBadge({
  achievement,
  onShare,
}: {
  achievement: Achievement;
  onShare?: () => void;
}) {
  return (
    <article className="achievement-badge-card">
      <div className="achievement-icon">{achievement.icon}</div>
      <h3>{achievement.badgeName}</h3>
      <p>
          {achievement.badgeDescription}
      </p>
      <div className="community-caption">Earned {new Date(achievement.earnedAt).toLocaleDateString()}</div>
      {onShare && (
        <button className="achievement-share" onClick={onShare}>Share</button>
      )}
    </article>
  );
}

// ============================================================================
// BADGES SHOWCASE
// ============================================================================
export function AchievementsPanel({
  achievements,
  onShare,
}: {
  achievements: Achievement[];
  onShare?: (achievement: Achievement) => void;
}) {
  if (achievements.length === 0) {
    return (
      <article className="panel community-panel empty-state">
        <div className="community-icon">🎯</div>
        <h2>No badges yet</h2>
        <p className="compact-line">
          Keep studying to unlock your first achievement!
        </p>
      </article>
    );
  }

  return (
    <article className="panel community-panel">
      <h2>🏆 Achievements</h2>
      <div className="achievement-grid">
        {achievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            onShare={() => onShare?.(achievement)}
          />
        ))}
      </div>
    </article>
  );
}

// ============================================================================
// GLOBAL LEADERBOARD
// ============================================================================
export function LeaderboardPanel({ entries }: { entries: LeaderboardEntry[] }) {
  const topEntries = entries.slice(0, 10);

  return (
    <article className="panel community-panel">
      <h2>🏅 Global Leaderboard</h2>
      <div className="leaderboard-list">
        {topEntries.length === 0 ? (
          <p className="empty-state compact-line">
            Be the first to join the leaderboard!
          </p>
        ) : (
          topEntries.map((entry, idx) => (
            <div
              key={entry.userId}
              className={`leaderboard-entry leaderboard-rank-${Math.min(idx + 1, 4)}`}
            >
              <div className="leaderboard-person">
                <div className="leaderboard-position">
                  {entry.rank}
                </div>
                <div>
                  <strong>
                    {entry.displayName}
                  </strong>
                  <div className="community-caption">
                    {entry.streakDays} day streak • {entry.studyHours}h studied
                  </div>
                </div>
              </div>
              <strong className="leaderboard-score">
                {entry.quizScore}%
              </strong>
            </div>
          ))
        )}
      </div>
    </article>
  );
}

// ============================================================================
// SOCIAL SHARING BUTTONS
// ============================================================================
export function ShareAchievementButtons({
  achievement,
  playerName,
}: {
  achievement: Achievement;
  playerName: string;
}) {
  const [copyStatus, setCopyStatus] = useState("");
  const message = `I just earned the "${achievement.badgeName}" badge on Student Productivity Hub! 🎉 Join me and start your learning journey.`;
  const encodedMessage = encodeURIComponent(message);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=https://studenthub.app`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=https://studenthub.app`;

  return (
    <div className="achievement-share-actions">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="achievement-share-action share-x"
      >
        <span>𝕏</span> Share
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="achievement-share-action share-linkedin"
      >
        <span>in</span> Share
      </a>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(`${message}\n\n${achievement.shareableUrl || "https://studenthub.app"}`);
            setCopyStatus("Achievement message copied.");
          } catch {
            setCopyStatus("Copy is unavailable in this browser.");
          }
        }}
        className="achievement-share-action share-copy"
      >
        <span>📋</span> Copy
      </button>
      {copyStatus ? <span className="copy-feedback" role="status" aria-live="polite">{copyStatus}</span> : null}
    </div>
  );
}

// ============================================================================
// REFERRAL LINK PANEL - Viral Invite System
// ============================================================================
export function ReferralPanel({
  referral,
  userEmail,
}: {
  referral?: ReferralLink;
  userEmail: string;
}) {
  const referralUrl = `https://studenthub.app?ref=${referral?.code || "demo"}`;
  const [copyStatus, setCopyStatus] = useState("");

  return (
    <article className="panel community-panel referral-panel">
      <h2>🎁 Invite Friends & Earn Rewards</h2>
      <p className="compact-line">
        Share your referral link and get exclusive badges and premium features when your friends sign up.
      </p>

      <div className="referral-copy-row mt-8">
        <label className="sr-only" htmlFor="referral-link">Your referral link</label>
        <input
          id="referral-link"
          type="text"
          value={referralUrl}
          readOnly
          className="referral-input"
        />
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(referralUrl);
              setCopyStatus("Referral link copied.");
            } catch {
              setCopyStatus("Copy is unavailable in this browser.");
            }
          }}
          className="secondary"
        >
          Copy
        </button>
      </div>
      {copyStatus ? <p className="copy-feedback" role="status" aria-live="polite">{copyStatus}</p> : null}

      {referral && (
        <div className="referral-metrics">
          <div>
            <strong>
              {referral.invitesUsed}
            </strong>
            <div className="community-caption">Friends invited</div>
          </div>
          <div>
            <strong>
              {referral.rewardsEarned}
            </strong>
            <div className="community-caption">Rewards earned</div>
          </div>
        </div>
      )}
    </article>
  );
}

// ============================================================================
// STUDY GROUP LISTING
// ============================================================================
export function StudyGroupsPanel({ groups }: { groups: StudyGroup[] }) {
  return (
    <article className="panel community-panel">
      <h2>👥 Study Groups</h2>

      {groups.length === 0 ? (
        <button className="study-group-empty">
          <div className="community-icon">➕</div>
          <strong>Create or Join a Study Group</strong>
          <p>Find study partners and collaborate</p>
        </button>
      ) : (
        <div className="study-group-list">
          {groups.map((group) => (
            <div
              key={group.id}
              className="study-group-row"
            >
              <div>
                <h3>{group.name}</h3>
                <p>{group.topic}</p>
                <div className="community-caption">
                  {group.members.length} members
                </div>
              </div>
              <button className="secondary">
                Join
              </button>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

// ============================================================================
// SOCIAL PROOF BANNER - Shows real-time stats
// ============================================================================
export function SocialProofBanner({
  totalUsers,
  totalStudyHours,
  averageStreak,
}: {
  totalUsers: number;
  totalStudyHours: number;
  averageStreak: number;
}) {
  return (
    <article className="panel community-panel social-proof-panel">
      <h2>
        🚀 Join {totalUsers.toLocaleString()} students already studying smarter
      </h2>
      <div className="social-proof-stats">
        <div>
          <strong>
            {(totalStudyHours / 1000).toFixed(1)}K
          </strong>
          <div className="community-caption">study hours logged</div>
        </div>
        <div>
          <strong>
            {averageStreak}
          </strong>
          <div className="community-caption">average streak</div>
        </div>
        <div>
          <strong>98%</strong>
          <div className="community-caption">satisfaction rate</div>
        </div>
      </div>
    </article>
  );
}
