#!/usr/bin/env bash
# Gate G9 (network part): real multi-instance test for projects using network/net.gd.
# Bash variant. Windows without a working bash: use gate.ps1 -Net, which runs the same scenarios.
# Scenarios: A 4 players + duplicate names + start + late joiner refused; B full room refused;
#            C host leaves the lobby; D password room: right password in, wrong password refused,
#            oversized hello from a hostile client dropped unread.
# usage: net_test.sh <project-root>        (set GODOT=/path/to/godot if it is not on PATH)
set -u
GODOT="${GODOT:-godot}"; ROOT="${1:-.}"; T=$(mktemp -d); FAIL=0
[ -f "$ROOT/tests/net_smoke.gd" ] || { echo "no tests/net_smoke.gd (is this a networked project?)"; exit 2; }
"$GODOT" --headless --path "$ROOT" --import >/dev/null 2>&1
run() { timeout 60 "$GODOT" --headless --path "$ROOT" -s tests/net_smoke.gd -- "$@" 2>&1 | grep -E "^(PASS|FAIL)|SCRIPT ERROR"; }
echo "A: 4 players, duplicate names, start, late joiner refused"
run host 4 start >$T/h & sleep 2
run client Bob >$T/1 & run client Bob >$T/2 & run client Carol >$T/3 & run late 4 >$T/l & wait
echo "B: full room refuses a 5th player"
run host 4 hold >$T/h2 & sleep 2
run client Bob >$T/4 & run client Cy >$T/5 & run client Di >$T/6 & run full 3 >$T/f & wait
echo "C: host leaves the lobby, client is told"
run host 2 leave >$T/h3 & sleep 2
run client Bob expect_host_left >$T/c & wait
echo "D: password room, wrong password, hostile oversized hello"
run host 2 hold secret >$T/h4 & sleep 2
run joiner Bob secret ok >$T/d1 & run joiner Eve wrongpw "Wrong password" >$T/d2 & run evil >$T/d3 & wait
for f in h 1 2 3 l h2 f h3 c h4 d1 d2 d3; do
  [ "$f" = "4" ] && continue
  if grep -q FAIL $T/$f || grep -q "SCRIPT ERROR" $T/$f || [ ! -s $T/$f ]; then echo "  $f: $(cat $T/$f | tr '\n' ' ')"; FAIL=1; fi
done
[ $FAIL = 0 ] && echo "G9 PASS (net smoke)" || echo "G9 FAIL (net smoke)"; exit $FAIL
