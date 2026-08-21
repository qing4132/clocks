"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { ControlledTimeContext } from "../WallClockProvider";

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
 *   Easter egg (once per device per day, only on the first :59→:00 wrap of
 *   the session). The typist "miscounts" and treats MM=59+1 as MM=60,
 *   typing `HH60` at the boundary before catching the mistake:
 *     1659 → 1660 at 17:00:00 exactly (delete "59", type "60"), then a
 *     short natural pause, then 1660 → 1700 (delete "660", type "700").
 *   The wrong value lands ON the boundary; the correction finishes about
 *   a second later. Consumed even if missed (tab hidden through boundary,
 *   or the browser reloaded before the wrap could fire) — one shot per
 *   local calendar day.
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

// After the mistaken value lands ON the boundary, the typist takes a full
// beat before starting to correct — long enough that the wrong value is
// clearly perceived. Correction begins at boundary + EGG_PAUSE_MS.
const EGG_PAUSE_MS = 3000;
// During the egg's correction phase only, the typist backspaces twice as
// fast — the mistake is obvious and the hand is already reaching for the
// key. Typing speed for the new digits stays normal.
const EGG_CORRECTION_DELETE_MS = DELETE_MS / 2;

const EGG_STORAGE_KEY = "qc-typewriter-egg-day";

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

type Frame = { str: string; cost: number };

function TypewriterFace({
  text,
  caretVisible,
}: {
  text: string;
  caretVisible: boolean;
}) {
  const startX = -(text.length * CELL) / 2;
  const caretX = startX + text.length * CELL + CELL * 0.1;

  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-72 h-72 sm:w-96 sm:h-96"
      role="img"
      aria-label="Typewriter clock"
    >
      {text.split("").map((ch, i) => (
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

function computeFrames(
  from: string,
  to: string,
  deleteMs: number = DELETE_MS,
): Frame[] {
  let p = 0;
  while (p < from.length && p < to.length && from[p] === to[p]) p++;

  const frames: Frame[] = [];
  let s = from;
  for (let len = from.length; len > p; len--) {
    s = s.slice(0, -1);
    frames.push({ str: s, cost: deleteMs });
  }
  for (let len = p; len < to.length; len++) {
    s = to.slice(0, len + 1);
    frames.push({ str: s, cost: TYPE_MS });
  }
  return frames;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readEggArmed(): boolean {
  try {
    return localStorage.getItem(EGG_STORAGE_KEY) !== todayKey();
  } catch {
    return false;
  }
}

function markEggConsumed() {
  try {
    localStorage.setItem(EGG_STORAGE_KEY, todayKey());
  } catch {
    // ignore (private mode / storage disabled)
  }
}

function LiveTypewriterClock() {
  const [display, setDisplay] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [blinkOn, setBlinkOn] = useState(true);

  const displayRef = useRef("");

  // The egg is armed at mount (once per calendar day per device). It stays
  // armed across normal-minute plans until the first :59→:00 wrap of this
  // session paints its fake value at the boundary — that instant writes the
  // storage flag and disarms. If the boundary passes while the tab is
  // hidden or the page reloads before firing, `readEggArmed()` on the next
  // mount still counts it as consumed as long as `markEggConsumed()` ran;
  // see `visibilitychange` handler below for the recovery case.
  const armedRef = useRef(false);
  const scheduledEggBoundaryRef = useRef<number | null>(null);

  useEffect(() => {
    armedRef.current = readEggArmed();

    const init = hhmm(new Date());
    displayRef.current = init;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const clearTimers = () => {
      for (const t of timers) clearTimeout(t);
      timers.length = 0;
    };

    const scheduleFrames = (
      frames: Frame[],
      paintAt: number[],
      now: number,
    ) => {
      frames.forEach((f, i) => {
        timers.push(
          setTimeout(() => {
            displayRef.current = f.str;
            setDisplay(f.str);
          }, Math.max(0, paintAt[i] - now)),
        );
      });
    };

    const plan = () => {
      clearTimers();
      scheduledEggBoundaryRef.current = null;

      const now = Date.now();
      const boundary = (Math.floor(now / 60000) + 1) * 60000; // next :00
      const target = hhmm(new Date(boundary));
      const cur = displayRef.current;
      const isWrap = cur.endsWith("59");

      // Fake typing lands at the boundary, correction runs after a pause.
      // Only fire when we still have room for the whole fake sequence in
      // real time — if the page loaded within a few hundred ms of the
      // boundary, fall back to a normal plan for this wrap; the egg stays
      // armed and will wait for the next :59.
      if (armedRef.current && isWrap) {
        const fakeTarget = cur.slice(0, 2) + "60";
        const fakeFrames = computeFrames(cur, fakeTarget);
        const fN = fakeFrames.length;
        const fakePaintAt = new Array<number>(fN);
        fakePaintAt[fN - 1] = boundary;
        for (let i = fN - 2; i >= 0; i--)
          fakePaintAt[i] = fakePaintAt[i + 1] - fakeFrames[i].cost;

        if (fakePaintAt[0] >= now) {
          runEggPlan(now, boundary, target, fakeTarget, fakeFrames, fakePaintAt);
          return;
        }
      }

      runNormalPlan(now, boundary, cur, target);
    };

    const runNormalPlan = (
      now: number,
      boundary: number,
      cur: string,
      target: string,
    ) => {
      const frames = computeFrames(cur, target);

      const finish = () => {
        displayRef.current = target;
        setDisplay(target);
        setBlinkOn(Math.floor(Date.now() / 500) % 2 === 0);
        setBusy(false);
        plan();
      };

      if (frames.length === 0) {
        timers.push(setTimeout(finish, boundary - now + 20));
        return;
      }

      const n = frames.length;
      const paintAt = new Array<number>(n);
      paintAt[n - 1] = boundary;
      for (let i = n - 2; i >= 0; i--)
        paintAt[i] = paintAt[i + 1] - frames[i].cost;

      timers.push(
        setTimeout(() => setBusy(true), Math.max(0, paintAt[0] - now)),
      );

      scheduleFrames(frames, paintAt, now);

      timers.push(setTimeout(finish, boundary - now + 20));
    };

    const runEggPlan = (
      now: number,
      boundary: number,
      target: string,
      fakeTarget: string,
      fakeFrames: Frame[],
      fakePaintAt: number[],
    ) => {
      scheduledEggBoundaryRef.current = boundary;

      const correctionFrames = computeFrames(
        fakeTarget,
        target,
        EGG_CORRECTION_DELETE_MS,
      );
      const cN = correctionFrames.length;
      const correctionStart = boundary + EGG_PAUSE_MS;
      const correctionPaintAt = new Array<number>(cN);
      correctionPaintAt[0] = correctionStart;
      for (let i = 1; i < cN; i++)
        correctionPaintAt[i] =
          correctionPaintAt[i - 1] + correctionFrames[i - 1].cost;
      const correctionEnd = correctionPaintAt[cN - 1];

      const finish = () => {
        displayRef.current = target;
        setDisplay(target);
        setBlinkOn(Math.floor(Date.now() / 500) % 2 === 0);
        setBusy(false);
        scheduledEggBoundaryRef.current = null;
        plan();
      };

      timers.push(
        setTimeout(() => setBusy(true), Math.max(0, fakePaintAt[0] - now)),
      );

      scheduleFrames(fakeFrames, fakePaintAt, now);

      // At the boundary: the wrong value has landed. Consumption fires
      // (whether or not the correction plays out) and the caret is handed
      // back to the normal blinker for the pause so the typist visibly
      // "pauses to notice the mistake" instead of holding a solid caret.
      timers.push(
        setTimeout(() => {
          armedRef.current = false;
          markEggConsumed();
          setBusy(false);
          setBlinkOn(Math.floor(Date.now() / 500) % 2 === 0);
        }, Math.max(0, boundary - now)),
      );

      // When correction begins, the caret goes solid again.
      timers.push(
        setTimeout(() => setBusy(true), Math.max(0, correctionStart - now)),
      );

      scheduleFrames(correctionFrames, correctionPaintAt, now);

      timers.push(setTimeout(finish, correctionEnd - now + 20));
    };

    plan();
  timers.push(setTimeout(() => setDisplay(init), 0));

    // Re-plan when returning to the tab, since background timers may drift.
    // Also enforce the "strictly one shot per day" rule: if the egg was
    // scheduled and its boundary has passed while we were hidden, consume
    // it here so the next wrap this session cannot fire it again.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;

      if (
        armedRef.current &&
        scheduledEggBoundaryRef.current !== null &&
        Date.now() > scheduledEggBoundaryRef.current
      ) {
        armedRef.current = false;
        markEggConsumed();
      }

      displayRef.current = hhmm(new Date());
      setDisplay(displayRef.current);
      setBusy(false);
      plan();
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
  const caretVisible = busy || blinkOn;

  return <TypewriterFace text={text} caretVisible={caretVisible} />;
}

export default function TypewriterClock() {
  const controlledNowMs = useContext(ControlledTimeContext);

  if (controlledNowMs !== null) {
    return (
      <TypewriterFace
        text={hhmm(new Date(controlledNowMs))}
        caretVisible={Math.floor(controlledNowMs / 500) % 2 === 0}
      />
    );
  }

  return <LiveTypewriterClock />;
}

