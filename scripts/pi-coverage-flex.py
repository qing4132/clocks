"""
Variant: single-digit values 0-9 may also be matched as a 1-character needle.
(For value 9 we accept either "9" or "09"; for value 23 only "23" works.)

For each stage we pick the needle/position that gives the earliest start;
on ties (same start position) we prefer the shorter match (advances less).
"""

import sys, time, bisect
from mpmath import mp


def pi_digits(n):
    mp.dps = n + 20
    s = mp.nstr(mp.pi, n + 5, strip_zeros=False)
    return s.replace(".", "")[:n]


def needles_for(v):
    if v < 10:
        return [str(v), f"0{v}"]
    return [str(v)]


def find_first(digits, needles, lo):
    """Earliest (pos, length) where any needle matches at position >= lo.
    Tie-break by shorter length (minimises end position)."""
    best = None
    for n in needles:
        p = digits.find(n, lo)
        if p < 0:
            continue
        cand = (p, len(n))
        if best is None or cand < best:
            best = cand
    return best


def find_worst(N):
    digits = pi_digits(N)
    worst = -1
    worst_triple = None
    misses = []
    for h in range(24):
        nh = needles_for(h)
        for m in range(60):
            nm = needles_for(m)
            for s in range(60):
                ns = needles_for(s)
                a = find_first(digits, nh, 0)
                if a is None:
                    misses.append((h, m, s, "h"))
                    continue
                b = find_first(digits, nm, a[0] + a[1])
                if b is None:
                    misses.append((h, m, s, "m"))
                    continue
                c = find_first(digits, ns, b[0] + b[1])
                if c is None:
                    misses.append((h, m, s, "s"))
                    continue
                end = c[0] + c[1]
                if end > worst:
                    worst = end
                    worst_triple = (h, m, s, a, b, c)
    return worst, worst_triple, misses


def main():
    N = int(sys.argv[1]) if len(sys.argv) > 1 else 2000
    print(f"computing pi to {N} digits...")
    t0 = time.time()
    worst, triple, misses = find_worst(N)
    t1 = time.time()
    if misses:
        print(f"  {len(misses)} triples could not be satisfied within {N} digits")
        for x in misses[:5]:
            print("   miss:", x)
        return
    print(f"worst end-index = {worst}")
    if triple:
        h, m, s, a, b, c = triple
        print(f"worst triple: {h:02d}:{m:02d}:{s:02d}")
        print(f"  H pick: pos={a[0]:<5} len={a[1]}  (matched '{('0'+str(h))[-a[1]:]}')")
        print(f"  M pick: pos={b[0]:<5} len={b[1]}  (matched '{('0'+str(m))[-b[1]:]}')")
        print(f"  S pick: pos={c[0]:<5} len={c[1]}  (matched '{('0'+str(s))[-c[1]:]}')")
    print(f"elapsed {t1 - t0:.2f}s")


if __name__ == "__main__":
    main()
