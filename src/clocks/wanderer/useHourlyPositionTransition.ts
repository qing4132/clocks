"use client";

import { useEffect, useEffectEvent, useState } from "react";

const TRANSITION_MS = 1_400;

type HourlyPositionTransition = {
  currentPosition: number;
  previousPosition: number;
  transitioning: boolean;
};

function msUntilNextHour(now: Date) {
  const nextHour = new Date(now);
  nextHour.setMinutes(60, 0, 0);
  return nextHour.getTime() - now.getTime();
}

export function useHourlyPositionTransition(
  getPosition: (hour: number) => number,
  canonicalPosition: number,
): HourlyPositionTransition {
  const resolvePosition = useEffectEvent(getPosition);
  const [state, setState] = useState<HourlyPositionTransition>(() => ({
    currentPosition: canonicalPosition,
    previousPosition: canonicalPosition,
    transitioning: false,
  }));

  useEffect(() => {
    let syncTimer = 0;
    let hourTimer = 0;
    let transitionTimer = 0;

    function clearTimers() {
      window.clearTimeout(hourTimer);
      window.clearTimeout(transitionTimer);
    }

    function scheduleHourChange() {
      window.clearTimeout(hourTimer);
      const now = new Date();
      hourTimer = window.setTimeout(() => {
        const nextPosition = resolvePosition(new Date().getHours());
        window.clearTimeout(transitionTimer);
        setState((current) => ({
          currentPosition: nextPosition,
          previousPosition: current.currentPosition,
          transitioning: current.currentPosition !== nextPosition,
        }));
        transitionTimer = window.setTimeout(() => {
          setState((current) => ({
            ...current,
            previousPosition: current.currentPosition,
            transitioning: false,
          }));
        }, TRANSITION_MS);
        scheduleHourChange();
      }, msUntilNextHour(now));
    }

    function syncWithoutAnimation() {
      clearTimers();
      const currentPosition = resolvePosition(new Date().getHours());
      setState({
        currentPosition,
        previousPosition: currentPosition,
        transitioning: false,
      });
      scheduleHourChange();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        syncWithoutAnimation();
      }
    }

    syncTimer = window.setTimeout(syncWithoutAnimation, 0);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(syncTimer);
      clearTimers();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [canonicalPosition]);

  return state;
}