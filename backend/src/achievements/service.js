import { COLLECTION_USER_ACHIEVEMENTS, COLLECTION_FRIENDS, getDB } from '../config/db.js'
import { ACHIEVEMENTS } from './definitions.js'
import { computeUserStats } from '../schema/stats.js'

async function computeFriendsCount(userId) {
    const uid = userId.toString()
    return getDB().collection(COLLECTION_FRIENDS).countDocuments({
        pending: false,
        $or: [{ requester_id: uid }, { accepter_id: uid }]
    })
}

export async function getUnlockedAchievements(userId) {
    const docs = await getDB().collection(COLLECTION_USER_ACHIEVEMENTS)
        .find({ user_id: userId.toString() })
        .toArray()

    return docs.map(d => ({ id: d.achievement_id, unlocked_at: d.date }))
}

/**
 * Recomputes the user's full context (run stats + friend count) and unlocks
 * any newly-crossed achievements. Safe to call after ANY mutation that could
 * move the needle (a run, a friend acceptance, etc) — already-unlocked ids
 * are skipped and the unique index protects against double-inserts.
 *
 * @returns {Promise<string[]>} ids unlocked by THIS call (for the popup)
 */
export async function checkAndUnlockAchievements(userId) {
    const uid = userId.toString()

    const [stats, friendsCount, alreadyUnlockedList] = await Promise.all([
        computeUserStats(uid),
        computeFriendsCount(uid),
        getUnlockedAchievements(uid),
    ])

    const context = { stats, friendsCount }
    const alreadyUnlocked = new Set(alreadyUnlockedList.map(a => a.id))

    const newlyUnlocked = ACHIEVEMENTS
        .filter(def => !alreadyUnlocked.has(def.id))
        .filter(def => {
            try { return !!def.check(context) } catch { return false }
        })
        .map(def => def.id)

    if (newlyUnlocked.length > 0) {
        await getDB().collection(COLLECTION_USER_ACHIEVEMENTS).insertMany(
            newlyUnlocked.map(id => ({ user_id: uid, achievement_id: id, date: Date.now() })),
            { ordered: false }
        )
    }

    return newlyUnlocked
}