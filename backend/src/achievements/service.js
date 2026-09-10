import { COLLECTION_USER_ACHIEVEMENTS, getDB } from '../config/db.js'
import { ACHIEVEMENTS } from './definitions.js'

export async function getUnlockedAchievements(userId) {
    const docs = await getDB().collection(COLLECTION_USER_ACHIEVEMENTS)
        .find({ user_id: userId.toString() })
        .toArray()

    return docs.map(d => ({ id: d.achievement_id, unlocked_at: d.date }))
}

/**
 * Compares `stats` against every definition and persists any newly
 * crossed thresholds. Safe to call after every run, already-unlocked
 * ids are skipped, and the unique index protects against double-inserts.
 *
 * @returns {Promise<string[]>} ids unlocked by THIS call (for the popup)
 */
export async function checkAndUnlockAchievements(userId, stats) {
    const uid = userId.toString()
    const alreadyUnlocked = new Set(
        (await getUnlockedAchievements(uid)).map(a => a.id)
    )

    const newlyUnlocked = ACHIEVEMENTS
        .filter(def => !alreadyUnlocked.has(def.id))
        .filter(def => {
            try { return !!def.check(stats) } catch { return false }
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