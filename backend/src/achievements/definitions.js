/**
 * Every check() receives the same `stats` object produced by
 * computeUserStats() (schema/stats.js),the same aggregate already used
 * to render account/profile pages, so unlocking a run's achievements
 * costs zero extra queries.
 */
export const ACHIEVEMENTS = [
    { id: 'first_blood', check: (s) => s.total_games >= 1 },
    { id: 'wave_10', check: (s) => s.best_wave >= 10 },
    { id: 'wave_25', check: (s) => s.best_wave >= 25 },
    { id: 'wave_50', check: (s) => s.best_wave >= 50 },
    { id: 'boss_slayer', check: (s) => s.total_boss_kills >= 1 },
    { id: 'boss_hunter', check: (s) => s.total_boss_kills >= 10 },
    { id: 'kills_100', check: (s) => s.total_kills >= 100 },
    { id: 'kills_1000', check: (s) => s.total_kills >= 1000 },
    { id: 'kills_10000', check: (s) => s.total_kills >= 10000 },
    { id: 'survive_10m', check: (s) => s.best_time >= 600 },
    { id: 'survive_30m', check: (s) => s.best_time >= 1800 },
    { id: 'score_10k', check: (s) => s.high_score >= 10000 },
    { id: 'score_100k', check: (s) => s.high_score >= 100000 },
    { id: 'dedicated_10', check: (s) => s.total_games >= 10 },
    { id: 'dedicated_50', check: (s) => s.total_games >= 50 },
]