#!/usr/bin/env python3
"""Extract marked code blocks for \\lstinputlisting.
Usage: python3 extract_blocks.py SRC_DIR OUT_DIR [file ...]
In sources, mark blocks with lines  //@name  ...  //@name_end  (or #@name for Python/shell).
Each block is dedented, padding before end-of-line comments collapsed (fewer wrapped lines),
and written to OUT_DIR/name.txt. Include it in LaTeX with \\lstinputlisting{OUT_DIR/name.txt}."""
import os, re, sys
src = sys.argv[1] if len(sys.argv) > 1 else '.'
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(src, 'blocks')
files = sys.argv[3:] or [f for f in os.listdir(src) if f.endswith(('.c', '.cu', '.cpp', '.h', '.py', '.java', '.sh'))]
os.makedirs(out, exist_ok=True)
mark = re.compile(r'^\s*(?://|#)@(\w+)\s*$')
n = 0
for fn in files:
    cur, buf = None, []
    for line in open(os.path.join(src, fn)).read().split('\n'):
        m = mark.match(line)
        if m:
            name = m.group(1)
            if name.endswith('_end') and cur:
                ind = min((len(x) - len(x.lstrip()) for x in buf if x.strip()), default=0)
                txt = '\n'.join(re.sub(r'(\S) {2,}', r'\1  ', x[ind:]) for x in buf)
                open(os.path.join(out, cur + '.txt'), 'w').write(txt.rstrip() + '\n')
                cur, buf, n = None, [], n + 1
            else:
                cur, buf = name, []
            continue
        if cur:
            buf.append(line)
print(f'{n} blocks written to {out}')
