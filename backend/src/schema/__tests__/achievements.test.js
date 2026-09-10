import { jest } from '@jest/globals';

const mockFind = jest.fn();
const mockToArray = jest.fn();
const mockInsertMany = jest.fn();
const mockCountDocuments = jest.fn();

jest.unstable_mockModule('../src/config/db.js', () => ({
    getDB: jest.fn().mockReturnValue({
        collection: jest.fn((name) => {
            if (name === 'friends') return { countDocuments: mockCountDocuments };
            return {
                find: mockFind.mockReturnValue({ toArray: mockToArray }),
                insertMany: mockInsertMany,
            };
        })
    }),
    COLLECTION_USER_ACHIEVEMENTS: 'user_achievements',
    COLLECTION_FRIENDS: 'friends',
}));

jest.unstable_mockModule('../src/schema/stats.js', () => ({
    computeUserStats: jest.fn(),
}));

const { computeUserStats } = await import('../src/schema/stats.js');
const { checkAndUnlockAchievements, getUnlockedAchievements } = await import('../src/achievements/service.js');

describe('Achievements service', () => {
    afterEach(() => jest.clearAllMocks());

    it('maps stored docs to {id, unlocked_at}', async () => {
        mockToArray.mockResolvedValueOnce([{ user_id: 'u1', achievement_id: 'first_blood', date: 123 }]);
        expect(await getUnlockedAchievements('u1')).toEqual([{ id: 'first_blood', unlocked_at: 123 }]);
    });

    it('unlocks newly-crossed stat and social achievements together', async () => {
        mockToArray.mockResolvedValueOnce([]);
        mockCountDocuments.mockResolvedValueOnce(1);
        computeUserStats.mockResolvedValueOnce({
            total_games: 1, best_wave: 12, total_boss_kills: 0,
            total_kills: 50, best_time: 100, high_score: 500, total_score: 500,
            avg_wave: 12, total_runs_past_20: 0,
        });
        mockInsertMany.mockResolvedValueOnce({ acknowledged: true });

        const result = await checkAndUnlockAchievements('u1');

        expect(result).toEqual(expect.arrayContaining(['first_blood', 'wave_10', 'social_first_friend']));
    });

    it('does not re-unlock an achievement the user already has', async () => {
        mockToArray.mockResolvedValueOnce([{ user_id: 'u1', achievement_id: 'first_blood', date: 1 }]);
        mockCountDocuments.mockResolvedValueOnce(0);
        computeUserStats.mockResolvedValueOnce({
            total_games: 5, best_wave: 1, total_boss_kills: 0,
            total_kills: 1, best_time: 1, high_score: 1, total_score: 1,
            avg_wave: 1, total_runs_past_20: 0,
        });

        const result = await checkAndUnlockAchievements('u1');
        expect(result).not.toContain('first_blood');
        expect(mockInsertMany).not.toHaveBeenCalled();
    });
});