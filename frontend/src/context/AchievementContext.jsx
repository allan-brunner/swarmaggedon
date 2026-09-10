import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ACHIEVEMENTS_BY_ID } from '../game/achievements';
import AchievementToast from '../components/AchievementToast';

const AchievementContext = createContext();

export const AchievementProvider = ({ children }) => {
    const [queue, setQueue] = useState([]);
    const [current, setCurrent] = useState(null);

    const notify = useCallback((ids = []) => {
        const valid = (ids || []).filter(id => ACHIEVEMENTS_BY_ID[id]);
        if (valid.length === 0) return;
        setQueue(prev => [...prev, ...valid]);
    }, []);

    useEffect(() => {
        if (!current && queue.length > 0) {
            setCurrent(queue[0]);
            setQueue(prev => prev.slice(1));
        }
    }, [queue, current]);

    return (
        <AchievementContext.Provider value={{ notify }}>
            {children}
            {current && (
                <AchievementToast
                    key={current}
                    achievementId={current}
                    onDismiss={() => setCurrent(null)}
                />
            )}
        </AchievementContext.Provider>
    );
};

export const useAchievements = () => useContext(AchievementContext);