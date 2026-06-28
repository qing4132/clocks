"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Typewriter — HH:MM as four digits being typed into an input field.
 *
 *   No seconds. A caret blinks once per second right after the minute's
 *   ones digit, exactly like a real text input. The delete/type animation
 *   is timed to LAND exactly on the minute boundary: during the final
 *   moments of a minute it backspaces only the digits that will change and
 *   types the next minute's digits, so the new complete four digits appear
 *   precisely at :00 of that minute.
 *     1234 → 1235  delete 4, type 5
 *     1239 → 1240  delete 39, type 40
 *     1259 → 1300  delete 259, type 300
 *     0959 → 1000  delete 0959, type 1000
 *
 *   Idea once considered: occasionally "mistype" a digit and then correct
 *   it, for a more human feel.
 */

function hhmm(d: Date): string {
  return (
    String(d.getHours()).padStart(2, "0") +
    String(d.getMinutes()).padStart(2, "0")
  );
}

// Per-keystroke timing (ms). Backspaces run a touch quicker than typing,
// the way a held delete key feels faster than tapping out new characters.
const DELETE_MS = 130;
const TYPE_MS = 220;

// Monospace cell geometry. Digits are centered as a group and the caret
// hangs just to their right, like a real text field.
const CELL = 30; // horizontal advance per character
const FONT_SIZE = 46;
const CARET_W = 2.5;
const CARET_H = 50;
// `dominantBaseline=central` anchors the digits at the em center (which
// includes descender space), so their ink center sits a little above y=0.
// Shift the caret up by the same amount so the two read as vertically centered.
const CARET_DY = -2.5;
const CARET_COLOR = "#c1121f";

export default function TypewriterClock() {
  const [display, setDisplay] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [blinkOn, setBlinkOn] = useState(true);

  const displayRef = useRef("");

  // Plan each minute's animation so its final keystroke lands exactly on the
  // :00 boundary. We look ahead to the next minute, work out the delete/type
  // sequence from what's currently shown, and back-time every step from the
  // boundary so the complete new digits appear precisely at :00.
  useEffect(() => {
    const init = hhmm(new Date());
    displayRef.current = init;
    setDisplay(init);

    const timers: ReturnType<typeof setTimeout>[] = [];
    const clearTimers = () => {
      for (const t of timers) clearTimeout(t);
      timers.length = 0;
    };

    const plan = () => {
      clearTimers();
      const now = Date.now();
      const boundary = (Math.floor(now / 60000) + 1) * 60000; // next :00
      const target = hhmm(new Date(boundary));
      const cur = displayRef.current;

      // Shared leading digits that don't change.
      let p = 0;
      while (p < cur.length && p < target.length && cur[p] === target[p]) p++;

      // Frames: backspace down to the shared prefix, then type up to target.
      // cost = the pause that follows each keystroke before the next one.
      const frames: { str: string; cost: number }[] = [];
      let s = cur;
      for (let len = cur.length; len > p; len--) {
        s = s.slice(0, -1);
        frames.push({ str: s, cost: DELETE_MS });
      }
      for (let len = p; len < target.length; len++) {
        s = target.slice(0, len + 1);
        frames.push({ str: s, cost: TYPE_MS });
      }

      const finish = () => {
        displayRef.current = target;
        setDisplay(target);
        // Refresh the blink phase to the live wall-clock value before handing
        // the caret back to it. Otherwise the 80ms-sampled blinkOn state may
        // still be the stale pre-boundary value and the caret blips off for a
        // frame the instant `busy` clears.
        setBlinkOn(Math.floor(Date.now() / 500) % 2 === 0);
        setBusy(false);
        plan(); // schedule the following minute
      };

      if (frames.length === 0) {
        timers.push(setTimeout(finish, boundary - now + 20));
        return;
      }

      // Back-time: last frame paints at the boundary; each earlier frame is
      // its own cost ahead of the next.
      const n = frames.length;
      const paintAt = new Array<number>(n);
      paintAt[n - 1] = boundary;
      for (let i = n - 2; i >= 0; i--) paintAt[i] = paintAt[i + 1] - frames[i].cost;

      // Caret turns solid the instant typing begins.
      timers.push(
        setTimeout(() => setBusy(true), Math.max(0, paintAt[0] - now)),
      );

      frames.forEach((f, i) => {
        timers.push(
          setTimeout(() => {
            displayRef.current = f.str;
            setDisplay(f.str);
          }, Math.max(0, paintAt[i] - now)),
        );
      });

      timers.push(setTimeout(finish, boundary - now + 20));
    };

    plan();

    // Re-plan when returning to the tab, since background timers may drift.
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        displayRef.current = hhmm(new Date());
        setDisplay(displayRef.current);
        setBusy(false);
        plan();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimers();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Caret blink: phase derived from wall-clock time (one blink per second),
  // so it never drifts and resumes cleanly after a burst of typing. Solid
  // while typing via the `busy` term below.
  useEffect(() => {
    const id = setInterval(
      () => setBlinkOn(Math.floor(Date.now() / 500) % 2 === 0),
      80,
    );
    return () => clearInterval(id);
  }, []);

  const text = display ?? "";
  const startX = -(text.length * CELL) / 2;
  const caretX = startX + text.length * CELL + CELL * 0.1;
  const caretVisible = busy || blinkOn;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96"
      role="img"
      aria-label="Typewriter clock"
    >
      {display !== null &&
        text.split("").map((ch, i) => (
          <text
            key={i}
            x={startX + i * CELL + CELL / 2}
            y="2"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace"
            fontSize={FONT_SIZE}
            fill="#1a1a1a"
          >
            {ch}
          </text>
        ))}

      {/* blinking accent caret */}
      <rect
        x={caretX}
        y={2 - CARET_H / 2 + CARET_DY}
        width={CARET_W}
        height={CARET_H}
        fill={CARET_COLOR}
        opacity={caretVisible ? 1 : 0}
      />
    </svg>
  );
}
