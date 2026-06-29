"""
For each (h, m, s) in [0..23] x [0..59] x [0..59], find:
  i_h = first index of HH in pi
  i_m = first index of MM in pi at position >= i_h + 2
  i_s = first index of SS in pi at position >= i_m + 2
End index = i_s + 2  (number of digits needed if we stopped right after the match).

Report the maximum end-index across all 86400 triples,
plus the triple that hits that worst case.
"""

import sys
import time
from mpmath import mp

# --- 1. Generate pi to N digits, retry larger if a triple fails. ---------

def pi_digits(n):
    mp.dps = n + 20            # guard digits
    s = mp.nstr(mp.pi, n + 5, strip_zeros=False)  # "3.1415..."
    s = s.replace(".", "")[:n]
    return s

def find_worst(N):
    digits = pi_digits(N)

    # For each 2-digit string "DD" build the sorted list of positions where
    # it appears in pi (as substring digits[i:i+2] == "DD").
    pos_of = [[] for _ in range(100)]
    for i in range(len(digits) - 1):
        d = int(digits[i]) * 10 + int(digits[i + 1])
        pos_of[d].append(i)

    import bisect
    def first_after(needle, lo):
        lst = pos_of[needle]
        idx = bisect.bisect_left(lst, lo)
        if idx == len(lst):
            return None
        return lst[idx]

    worst = -1
    worst_triple = None
    misses = []

    for h in range(24):
        hh = h
        for m in range(60):
            mm = m
            for s in range(60):
                ss = s
                ih = first_after(hh, 0)
                if ih is None:
                    misses.append((h, m, s, "h"))
                    continue
                im = first_after(mm, ih + 2)
                if im is None:
                    misses.append((h, m, s, "m"))
                    continue
                isec = first_after(ss, im + 2)
                if isec is None:
                    misses.append((h, m, s, "s"))
                    continue
                end = isec + 2
                if end > worst:
                    worst = end
                    worst_triple = (h, m, s, ih, im, isec)

    return worst, worst_triple, misses, len(digits)


def main():
    N = int(sys.argv[1]) if len(sys.argv) > 1 else 20000
    print(f"computing pi to {N} digits...")
    t0 = time.time()
    worst, triple, misses, total = find_worst(N)
    t1 = time.time()
    if misses:
        print(f"  {len(misses)} triples could not be satisfied within {total} digits")
        for x in misses[:10]:
            print("   miss:", x)
        print("  (need more digits — re-run with a larger N)")
    print(f"worst end-index = {worst}  (pi positions 0..{worst-1})")
    if triple:
        h, m, s, ih, im, isec = triple
        print(f"worst triple: {h:02d}:{m:02d}:{s:02d}   ih={ih}  im={im}  is={isec}")
    print(f"elapsed {t1 - t0:.2f}s")


if __name__ == "__main__":
    main()
