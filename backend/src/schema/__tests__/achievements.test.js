import { jest } from '@jest/globals';

const mockFind = jest.fn();
const mockToArray = jest.fn();
const mockInsertMany = jest.fn();

jest.unstable_mockModule('../../config/db.js', () => ({
    getDB: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
            find: mockFind.mockReturnValue({ toArray: mockToArray }),
            insertMany: mockInsertMany,
        })
    }),
    COLLECTION_USER_ACHIEVEMENTS: 'user_achievements',
}));

const { checkAndUnlockAchievements, getUnlockedAchievements } = await import('../../achievements/service.js');

describe('Achievements service', () => {
    afterEach(() => jest.clearAllMocks());

    it('maps stored docs to {id, unlocked_at}', async () => {
        mockToArray.mockResolvedValueOnce([{ user_id: 'u1', achievement_id: 'first_blood', date: 123 }]);
        expect(await getUnlockedAchievements('u1')).toEqual([{ id: 'first_blood', unlocked_at: 123 }]);
    });

    it('unlocks and persists newly-crossed achievements', async () => {
        mockToArray.mockResolvedValueOnce([]);
        mockInsertMany.mockResolvedValueOnce({ acknowledged: true });

        const stats = { total_games: 1, best_wave: 12, total_boss_kills: 0, total_kills: 50, best_time: 100, high_score: 500 };
        const result = await checkAndUnlockAchievements('u1', stats);

        expect(result).toEqual(expect.arrayContaining(['first_blood', 'wave_10']));
        expect(mockInsertMany).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ user_id: 'u1', achievement_id: 'first_blood' }),
                expect.objectContaining({ user_id: 'u1', achievement_id: 'wave_10' }),
            ]),
            { ordered: false }
        );
    });

    it('does not re-unlock an achievement the user already has', async () => {
        mockToArray.mockResolvedValueOnce([{ user_id: 'u1', achievement_id: 'first_blood', date: 1 }]);
        const stats = { total_games: 5, best_wave: 1, total_boss_kills: 0, total_kills: 1, best_time: 1, high_score: 1 };
        const result = await checkAndUnlockAchievements('u1', stats);

        expect(result).not.toContain('first_blood');
        expect(mockInsertMany).not.toHaveBeenCalled();
    });
});