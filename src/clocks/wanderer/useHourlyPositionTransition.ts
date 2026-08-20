"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useWallClock } from "../useWallClock";

const TRANSITION_MS = 1_400;

type HourlyPositionTransition = {
  currentPosition: number;
  previousPosition: number;
  transitioning: boolean;
};

export function useHourlyPositionTransition(
  getPosition: (hour: number) => number,
  canonicalPosition: number,
): HourlyPositionTransition {
  const resolvePosition = useEffectEvent(getPosition);
  const now = useWallClock(250);
  const hour = now?.getHours() ?? null;
  const hasSynced = useRef(false);
  const [state, setState] = useState<HourlyPositionTransition>(() => ({
    currentPosition: canonicalPosition,
    previousPosition: canonicalPosition,
    transitioning: false,
  }));

  useEffect(() => {
    if (hour === null) return;

    let syncTimer = 0;
    let transitionTimer = 0;
    syncTimer = window.setTimeout(() => {
      const nextPosition = resolvePosition(hour);
      if (!hasSynced.current) {
        hasSynced.current = true;
        setState({
          currentPosition: nextPosition,
          previousPosition: nextPosition,
          transitioning: false,
        });
        return;
      }

      setState((current) => {
        if (current.currentPosition === nextPosition) return current;
        transitionTimer = window.setTimeout(() => {
          setState((latest) => ({
            ...latest,
            previousPosition: latest.currentPosition,
            transitioning: false,
          }));
        }, TRANSITION_MS);
        return {
          currentPosition: nextPosition,
          previousPosition: current.currentPosition,
          transitioning: true,
        };
      });
    }, 0);

    return () => {
      window.clearTimeout(syncTimer);
      window.clearTimeout(transitionTimer);
    };
  }, [canonicalPosition, hour]);

  return state;
}