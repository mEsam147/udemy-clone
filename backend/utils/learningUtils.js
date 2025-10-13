// utils/learningUtils.js
const mongoose = require("mongoose");

/**
 * Calculate estimated completion time based on current progress
 */
function calculateEstimatedCompletionTime(
  totalLessons,
  completedCount,
  totalHours
) {
  const remainingLessons = totalLessons - completedCount;
  if (remainingLessons <= 0) return null;

  const avgTimePerLesson = totalHours / totalLessons;
  const estimatedRemainingHours = remainingLessons * avgTimePerLesson;
  const estimatedDays = Math.ceil(estimatedRemainingHours / 2); // Assuming 2 hours/day

  return {
    lessonsRemaining: remainingLessons,
    hoursRemaining: Math.round(estimatedRemainingHours * 10) / 10,
    daysEstimated: estimatedDays,
    completionPace: "2 hours/day",
    timePerLesson: Math.round(avgTimePerLesson * 10) / 10,
  };
}

/**
 * Get next lesson for a course
 */
function getNextLesson(course, completedLessonsIds, currentLessonId = null) {
  if (!course.lessons || course.lessons.length === 0) return null;

  let nextLessonIndex = -1;

  if (currentLessonId) {
    // If currently watching a lesson, get the next one
    const currentIndex = course.lessons.findIndex(
      (l) => l._id.toString() === currentLessonId
    );
    if (currentIndex !== -1 && currentIndex < course.lessons.length - 1) {
      nextLessonIndex = currentIndex + 1;
    }
  } else {
    // Find first uncompleted lesson
    nextLessonIndex = course.lessons.findIndex(
      (lesson) =>
        !completedLessonsIds.some(
          (clId) => clId._id.toString() === lesson._id.toString()
        )
    );
  }

  if (nextLessonIndex === -1) return null;

  const nextLesson = course.lessons[nextLessonIndex];
  return {
    id: nextLesson._id.toString(),
    title: nextLesson.title,
    duration: nextLesson.duration || 0,
    order: nextLesson.order || nextLessonIndex + 1,
    isPreview: nextLesson.isPreview || false,
    estimatedTime: formatDuration(nextLesson.duration || 5), // Default 5 min
    position: nextLessonIndex + 1,
    total: course.lessons.length,
  };
}

/**
 * Format duration from minutes to readable format
 */
function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

/**
 * Calculate learning streaks from daily activity
 */
function calculateLearningStreaks(dailyActivity) {
  if (!dailyActivity || dailyActivity.length === 0)
    return { current: 0, max: 0 };

  const sortedActivity = [...dailyActivity].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  let currentStreak = 0;
  let maxStreak = 0;
  let currentStreakStart = null;

  for (let i = 0; i < sortedActivity.length; i++) {
    const currentDate = new Date(sortedActivity[i].date);
    currentDate.setHours(0, 0, 0, 0);

    if (
      i === 0 ||
      isConsecutiveDate(currentDate, new Date(sortedActivity[i - 1].date))
    ) {
      currentStreak++;
      if (currentStreak === 1) {
        currentStreakStart = sortedActivity[i].date;
      }

      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      currentStreak = 1;
      currentStreakStart = sortedActivity[i].date;
    }
  }

  return {
    currentStreak,
    maxStreak,
    currentStreakStart,
    longestStreak: maxStreak,
  };
}

/**
 * Check if two dates are consecutive
 */
function isConsecutiveDate(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(d1 - d2);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays === 1;
}

/**
 * Generate personalized recommendations
 */
function generatePersonalizedRecommendations(
  userEnrollments,
  allCourses,
  limit = 12
) {
  const userCategories = [
    ...new Set(userEnrollments.map((e) => e.course?.category).filter(Boolean)),
  ];
  const userLevels = [
    ...new Set(userEnrollments.map((e) => e.course?.level).filter(Boolean)),
  ];

  // Score courses based on user preferences
  const scoredCourses = allCourses
    .filter(
      (course) =>
        !userEnrollments.some(
          (e) => e.course._id.toString() === course._id.toString()
        )
    )
    .map((course) => {
      let score = 0;

      // Category match (highest weight)
      if (userCategories.includes(course.category)) {
        score += 40;
      }

      // Level progression (next level up)
      const userLevelIndex = userLevels.indexOf(course.level);
      if (userLevelIndex >= 0) {
        score += 30 - userLevelIndex * 5; // Higher levels get slightly lower score
      }

      // Popularity
      if (course.studentsEnrolled >= 1000) {
        score += 15;
      }

      // Recent update
      if (course.updatedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        score += 10;
      }

      // High rating
      if (course.ratings.average >= 4.5) {
        score += 5;
      }

      return { ...course.toObject(), recommendationScore: score };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);

  return scoredCourses;
}

/**
 * Analyze learning patterns
 */
function analyzeLearningPatterns(enrollments) {
  if (enrollments.length === 0) return {};

  const patterns = {
    preferredCategories: {},
    preferredLevels: {},
    avgCompletionTime: 0,
    peakLearningDays: {},
    learningConsistency: 0,
  };

  // Category preferences
  enrollments.forEach((enrollment) => {
    if (enrollment.course?.category) {
      patterns.preferredCategories[enrollment.course.category] =
        (patterns.preferredCategories[enrollment.course.category] || 0) + 1;
    }
  });

  // Level preferences
  enrollments.forEach((enrollment) => {
    if (enrollment.course?.level) {
      patterns.preferredLevels[enrollment.course.level] =
        (patterns.preferredLevels[enrollment.course.level] || 0) + 1;
    }
  });

  // Completion time analysis
  const completedCourses = enrollments.filter((e) => e.progress >= 100);
  if (completedCourses.length > 0) {
    const totalTime = completedCourses.reduce(
      (sum, e) =>
        sum +
        (new Date(e.updatedAt) - new Date(e.enrolledAt)) / (1000 * 60 * 60),
      0
    );
    patterns.avgCompletionTime = Math.round(
      totalTime / completedCourses.length
    );
  }

  // Learning consistency (active days per week)
  const activeDays = new Set();
  enrollments.forEach((enrollment) => {
    const date = new Date(enrollment.lastAccessed);
    const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    activeDays.add(dayKey);
  });

  patterns.learningConsistency =
    activeDays.size / Math.max(enrollments.length, 1);

  // Peak learning days
  enrollments.forEach((enrollment) => {
    const date = new Date(enrollment.lastAccessed);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    patterns.peakLearningDays[dayOfWeek] =
      (patterns.peakLearningDays[dayOfWeek] || 0) + 1;
  });

  return patterns;
}

module.exports = {
  calculateEstimatedCompletionTime,
  getNextLesson,
  formatDuration,
  calculateLearningStreaks,
  isConsecutiveDate,
  generatePersonalizedRecommendations,
  analyzeLearningPatterns,
};
