import { gql } from 'graphql-tag'
import { getUnlockedAchievements } from '../achievements/service.js'

export const achievementTypeDefs = gql`
    type UnlockedAchievement {
        id: ID!
        unlocked_at: Float
    }

    extend type User {
        unlocked_achievements: [UnlockedAchievement]
    }
`

export const achievementResolvers = {
    User: {
        unlocked_achievements: async (parent) => getUnlockedAchievements(parent.id)
    }
}