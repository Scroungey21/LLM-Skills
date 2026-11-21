#!/usr/bin/env python3
"""Package a revision-project export folder.
Usage: python3 package_export.py EXPORT_DIR OUT_ZIP
EXPORT_DIR must already contain 00_START_HERE.md, CONTEXT_PROMPT.md and the folders
(inputs/ outputs/ artifacts/ sources/ docs/ notes/ skills/). Helper zipdir() builds inner zips.
Writes manifest.json (path, bytes, sha256, origin), zips everything, re-opens and verifies."""
import hashlib, json, os, sys, zipfile
SKIP_DIRS = {'node_modules', '__pycache__', '.git', 'shots', '.cache'}
SKIP_EXT = {'.aux', '.log', '.toc', '.out', '.o', '.pyc', '.tgz'}

def zipdir(src, out_zip, arcroot=None, readme=None):
    """Zip a working tree (caches, build junk and binaries excluded), optionally adding README.md."""
    arcroot = arcroot or os.path.basename(src.rstrip('/'))
    with zipfile.ZipFile(out_zip, 'w', zipfile.ZIP_DEFLATED) as z:
        for d, ds, fs in os.walk(src):
            ds[:] = [x for x in ds if x not in SKIP_DIRS]
            for f in fs:
                p = os.path.join(d, f); ext = os.path.splitext(f)[1]
                if ext in SKIP_EXT: continue
                if ext == '' and os.access(p, os.X_OK): continue
                z.write(p, os.path.join(arcroot, os.path.relpath(p, src)))
        if readme: z.writestr('README.md', readme)

def main(root, out):
    for req in ('00_START_HERE.md', 'CONTEXT_PROMPT.md'):
        assert os.path.exists(os.path.join(root, req)), f'missing {req}'
    files = []
    for d, ds, fs in os.walk(root):
        for f in sorted(fs):
            if f == 'manifest.json': continue
            p = os.path.join(d, f); rel = os.path.relpath(p, root)
            files.append({'path': rel, 'bytes': os.path.getsize(p),
                          'sha256': hashlib.sha256(open(p, 'rb').read()).hexdigest(),
                          'origin': rel.split(os.sep)[0] if os.sep in rel else 'handoff'})
    json.dump({'files': files}, open(os.path.join(root, 'manifest.json'), 'w'), indent=1)
    name = os.path.basename(root.rstrip('/'))
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for d, ds, fs in os.walk(root):
            for f in fs:
                p = os.path.join(d, f); z.write(p, os.path.join(name, os.path.relpath(p, root)))
    with zipfile.ZipFile(out) as z:
        assert z.testzip() is None
        names = set(z.namelist())
        for f in files: assert os.path.join(name, f['path']) in names, f['path']
        for n in names:
            if n.endswith('.zip'):
                import io
                assert zipfile.ZipFile(io.BytesIO(z.read(n))).testzip() is None, n
    print(f'{out}: {os.path.getsize(out)//1024} KB, {len(files)} files, verified')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
