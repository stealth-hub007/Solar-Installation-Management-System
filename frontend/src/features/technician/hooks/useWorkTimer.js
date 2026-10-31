import { useState, useEffect, useCallback } from 'react';

export const useWorkTimer = (jobId) => {
  const storageKey = `sims_tech_timer_${jobId}`;
  
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.startTime) {
          const start = new Date(parsed.startTime).getTime();
          const now = Date.now();
          const elapsed = Math.max(0, Math.floor((now - start) / 1000));
          setStartTime(parsed.startTime);
          setElapsedSeconds(elapsed);
          setIsRunning(true);
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const startTimer = useCallback(() => {
    const now = new Date().toISOString();
    setStartTime(now);
    setElapsedSeconds(0);
    setIsRunning(true);
    localStorage.setItem(storageKey, JSON.stringify({ startTime: now }));
  }, [storageKey]);

  const stopTimer = useCallback(() => {
    const end = new Date().toISOString();
    setIsRunning(false);
    localStorage.removeItem(storageKey);
    const totalHours = Number((elapsedSeconds / 3600).toFixed(2));
    return {
      startTime,
      endTime: end,
      elapsedSeconds,
      totalHours: Math.max(0.1, totalHours),
    };
  }, [storageKey, elapsedSeconds, startTime]);

  return {
    isRunning,
    startTime,
    elapsedSeconds,
    startTimer,
    stopTimer,
  };
};

export default useWorkTimer;

