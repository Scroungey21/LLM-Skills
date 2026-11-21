import re, sys
src = open(sys.argv[1]).read()
def repl(m):
    name, cfg, args = m.group(1), m.group(2), m.group(3)
    depth = 0; parts = []; cur = ''
    for ch in cfg:
        if ch in '([': depth += 1
        if ch in ')]': depth -= 1
        if ch == ',' and depth == 0: parts.append(cur); cur = ''
        else: cur += ch
    parts.append(cur)
    return f'EMU_LAUNCH({name}, {parts[0].strip()}, {parts[1].strip()}, {args});'
src = re.sub(r'(\w+)<<<(.*?)>>>\((.*?)\);', repl, src)
print('#include "cuda_emu2.h"\n' + src)
