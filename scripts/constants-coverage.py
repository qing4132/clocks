"""Run the HH→MM→SS sequential 2-digit search on various famous constants."""

import bisect
from mpmath import mp


def find_worst(digits):
    pos_of = [[] for _ in range(100)]
    for i in range(len(digits) - 1):
        d = int(digits[i]) * 10 + int(digits[i + 1])
        pos_of[d].append(i)

    def first_after(needle, lo):
        lst = pos_of[needle]
        idx = bisect.bisect_left(lst, lo)
        return lst[idx] if idx < len(lst) else None

    worst = -1
    worst_triple = None
    misses = 0
    for h in range(24):
        for m in range(60):
            for s in range(60):
                ih = first_after(h, 0)
                if ih is None:
                    misses += 1
                    continue
                im = first_after(m, ih + 2)
                if im is None:
                    misses += 1
                    continue
                isec = first_after(s, im + 2)
                if isec is None:
                    misses += 1
                    continue
                end = isec + 2
                if end > worst:
                    worst = end
                    worst_triple = (h, m, s, ih, im, isec)
    return worst, worst_triple, misses


def digits_from(val, n):
    s = mp.nstr(val, n + 10, strip_zeros=False)
    s = s.replace(".", "").replace("-", "")
    return s[:n]


def champernowne(n):
    out = []
    total = 0
    k = 1
    while total < n + 5:
        ks = str(k)
        out.append(ks)
        total += len(ks)
        k += 1
    return "".join(out)[:n]


def copeland_erdos(n):
    primes = []
    s = ""
    cur = 2
    while len(s) < n + 5:
        is_prime = all(cur % p for p in primes if p * p <= cur)
        if is_prime:
            primes.append(cur)
            s += str(cur)
        cur += 1
    return s[:n]


def main():
    N = 5000
    mp.dps = N + 30

    cases = [
        ("π  (pi)",                       digits_from(mp.pi, N)),
        ("e  (Euler's number)",           digits_from(mp.e, N)),
        ("φ  (golden ratio)",             digits_from((1 + mp.sqrt(5)) / 2, N)),
        ("√2",                            digits_from(mp.sqrt(2), N)),
        ("√3",                            digits_from(mp.sqrt(3), N)),
        ("√5",                            digits_from(mp.sqrt(5), N)),
        ("γ  (Euler–Mascheroni)",         digits_from(mp.euler, N)),
        ("ln 2",                          digits_from(mp.log(2), N)),
        ("ln 10",                         digits_from(mp.log(10), N)),
        ("log₁₀ 2",                       digits_from(mp.log10(2), N)),
        ("ζ(3) (Apéry)",                  digits_from(mp.zeta(3), N)),
        ("G  (Catalan)",                  digits_from(mp.catalan, N)),
        ("eᵉ",                            digits_from(mp.e ** mp.e, N)),
        ("π·e",                           digits_from(mp.pi * mp.e, N)),
        ("π²",                            digits_from(mp.pi ** 2, N)),
        ("Champernowne 0.1234567891011…", champernowne(N)),
        ("Copeland–Erdős 0.23571113…",    copeland_erdos(N)),
    ]

    print(f'{"constant":<32} | {"worst":>5} | {"misses":>6} | worst triple')
    print("-" * 80)
    rows = []
    for name, s in cases:
        worst, triple, misses = find_worst(s)
        if triple:
            h, m, ss, ih, im, isec = triple
            t = f"{h:02d}:{m:02d}:{ss:02d}  @ {ih:>4}/{im:>4}/{isec:>4}"
        else:
            t = "-"
        rows.append((worst, name, misses, t))
        print(f"{name:<32} | {worst:>5} | {misses:>6} | {t}")

    print()
    print("sorted by required digits:")
    for worst, name, misses, t in sorted(rows):
        suffix = "" if misses == 0 else f"  (still {misses} miss)"
        print(f"  {worst:>5}  {name}{suffix}")


if __name__ == "__main__":
    main()
