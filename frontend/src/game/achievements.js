// Display metadata only. IDs must match backend/src/achievements/definitions.js.
export const ACHIEVEMENT_TIER_COLORS = {
    common: '#bdc3c7',
    rare: '#3498db',
    epic: '#9b59b6',
    legendary: '#f1c40f',
};

export const ACHIEVEMENTS = [
    { id: 'first_blood',  icon: '🎮', tier: 'common' },
    { id: 'wave_10',      icon: '🌊', tier: 'common' },
    { id: 'wave_25',      icon: '🌊', tier: 'rare' },
    { id: 'wave_50',      icon: '🌊', tier: 'epic' },
    { id: 'wave_75',      icon: '🌊', tier: 'epic' },
    { id: 'wave_100',     icon: '🌊', tier: 'legendary' },

    { id: 'boss_slayer',  icon: '👹', tier: 'common' },
    { id: 'boss_hunter',  icon: '👹', tier: 'rare' },
    { id: 'boss_legend',  icon: '👹', tier: 'epic' },

    { id: 'kills_100',    icon: '⚔️', tier: 'common' },
    { id: 'kills_1000',   icon: '⚔️', tier: 'rare' },
    { id: 'kills_10000',  icon: '⚔️', tier: 'epic' },
    { id: 'kills_100000', icon: '⚔️', tier: 'legendary' },

    { id: 'survive_10m',  icon: '⏱️', tier: 'common' },
    { id: 'survive_30m',  icon: '⏱️', tier: 'rare' },
    { id: 'survive_1h',   icon: '⏱️', tier: 'epic' },

    { id: 'score_10k',    icon: '🏆', tier: 'common' },
    { id: 'score_100k',   icon: '🏆', tier: 'epic' },
    { id: 'score_500k',   icon: '🏆', tier: 'rare' },
    { id: 'score_1m',     icon: '🏆', tier: 'epic' },

    { id: 'lifetime_1m',  icon: '💰', tier: 'epic' },

    { id: 'consistent',   icon: '🎯', tier: 'rare' },
    { id: 'grizzled',     icon: '🪖', tier: 'rare' },

    { id: 'dedicated_10',  icon: '📅', tier: 'common' },
    { id: 'dedicated_50',  icon: '📅', tier: 'rare' },
    { id: 'dedicated_100', icon: '📅', tier: 'epic' },

    { id: 'social_first_friend', icon: '🤝', tier: 'common' },
    { id: 'social_squad',        icon: '🤝', tier: 'rare' },
];

export const ACHIEVEMENTS_BY_ID = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));