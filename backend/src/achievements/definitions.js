/**
 * Achievement catalog — the SOURCE OF TRUTH for unlock conditions.
 * IDs must stay in sync with the display catalog in
 * frontend/src/game/achievements.js.
 *
 * Every check() receives a context object:
 *   { stats, friendsCount }
 * `stats` is the same aggregate produced by computeUserStats() (schema/stats.js).
 * `friendsCount` is the user's current accepted-friend count (see service.js).
 */
export const ACHIEVEMENTS = [
    // --- Progression ---
    { id: 'first_blood',  check: (c) => c.stats.total_games >= 1 },
    { id: 'wave_10',      check: (c) => c.stats.best_wave >= 10 },
    { id: 'wave_25',      check: (c) => c.stats.best_wave >= 25 },
    { id: 'wave_50',      check: (c) => c.stats.best_wave >= 50 },
    { id: 'wave_75',      check: (c) => c.stats.best_wave >= 75 },
    { id: 'wave_100',     check: (c) => c.stats.best_wave >= 100 },

    // --- Bosses ---
    { id: 'boss_slayer',  check: (c) => c.stats.total_boss_kills >= 1 },
    { id: 'boss_hunter',  check: (c) => c.stats.total_boss_kills >= 10 },
    { id: 'boss_legend',  check: (c) => c.stats.total_boss_kills >= 25 },

    // --- Kills ---
    { id: 'kills_100',    check: (c) => c.stats.total_kills >= 100 },
    { id: 'kills_1000',   check: (c) => c.stats.total_kills >= 1000 },
    { id: 'kills_10000',  check: (c) => c.stats.total_kills >= 10000 },
    { id: 'kills_100000', check: (c) => c.stats.total_kills >= 100000 },

    // --- Survival (single run) ---
    { id: 'survive_10m',  check: (c) => c.stats.best_time >= 600 },
    { id: 'survive_30m',  check: (c) => c.stats.best_time >= 1800 },
    { id: 'survive_1h',   check: (c) => c.stats.best_time >= 3600 },

    // --- Score (single run) ---
    { id: 'score_10k',    check: (c) => c.stats.high_score >= 10000 },
    { id: 'score_100k',   check: (c) => c.stats.high_score >= 100000 },
    { id: 'score_500k',   check: (c) => c.stats.high_score >= 500000 },
    { id: 'score_1m',     check: (c) => c.stats.high_score >= 1000000 },

    // --- Lifetime cumulative ---
    { id: 'lifetime_1m',  check: (c) => c.stats.total_score >= 1000000 },

    // --- Skill (not just grind) ---
    // Requires at least 10 runs so a single lucky run can't trigger it.
    { id: 'consistent',   check: (c) => c.stats.total_games >= 10 && c.stats.avg_wave >= 15 },

    // --- Endurance ---
    { id: 'grizzled',     check: (c) => c.stats.total_runs_past_20 >= 5 },

    // --- Dedication ---
    { id: 'dedicated_10',  check: (c) => c.stats.total_games >= 10 },
    { id: 'dedicated_50',  check: (c) => c.stats.total_games >= 50 },
    { id: 'dedicated_100', check: (c) => c.stats.total_games >= 100 },

    // --- Social (requires the Part 2 plumbing below) ---
    { id: 'social_first_friend', check: (c) => c.friendsCount >= 1 },
    { id: 'social_squad',        check: (c) => c.friendsCount >= 5 },
]