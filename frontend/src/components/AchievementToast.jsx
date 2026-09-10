import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ACHIEVEMENTS_BY_ID, ACHIEVEMENT_TIER_COLORS } from '../game/achievements';
import '../assets/style/components/AchievementToast.css';

const DISPLAY_DURATION = 5000;

export default function AchievementToast({ achievementId, onDismiss }) {
    const { t } = useTranslation();
    const def = ACHIEVEMENTS_BY_ID[achievementId];

    useEffect(() => {
        const timer = setTimeout(onDismiss, DISPLAY_DURATION);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    if (!def) return null;
    const color = ACHIEVEMENT_TIER_COLORS[def.tier] ?? ACHIEVEMENT_TIER_COLORS.common;

    return (
        <div className="achievement-toast" style={{ borderColor: color }} onClick={onDismiss}>
            <div className="achievement-toast-icon" style={{ borderColor: color }}>{def.icon}</div>
            <div className="achievement-toast-body">
                <div className="achievement-toast-eyebrow" style={{ color }}>
                    {t('achievements.unlocked')}
                </div>
                <div className="achievement-toast-name">
                    {t(`achievements.list.${achievementId}.name`)}
                </div>
                <div className="achievement-toast-desc">
                    {t(`achievements.list.${achievementId}.desc`)}
                </div>
            </div>
        </div>
    );
}