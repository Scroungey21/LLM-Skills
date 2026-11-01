"""Minimal stdlib client for the optional shared VoiceStudio service (docker compose --profile voicestudio).

Any channel can import this (or copy the calls) to reach VoiceStudio's local API at http://127.0.0.1:3900.
It never starts/stops the container; see tools/voicestudio/README.md.

    from vs_client import VoiceStudio
    vs = VoiceStudio()                      # reads VOICESTUDIO_API_KEY from env or the repo-root .env
    vs.health()
    wav = vs.generate("Hello there.", engine="omnivoice", ref_audio="ref.wav", ref_text="...", effect_preset="raw")
    wav = vs.stream_tts("You're lying!", engine="indextts2", ref_audio_b64=..., emo_text="devastated, crying")

CLI:  python tools/voicestudio/vs_client.py health | engines | models | install <repo_id> | sidecar <engine_id>
"""
from __future__ import annotations

import base64
import json
import os
import sys
import time
import uuid
import urllib.error
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
BASE = os.environ.get('VOICESTUDIO_BASE_URL', 'http://127.0.0.1:3900')


def _api_key() -> str:
    k = os.environ.get('VOICESTUDIO_API_KEY')
    if k:
        return k
    env = REPO / '.env'
    if env.exists():
        for line in env.read_text(encoding='utf-8-sig').splitlines():
            if line.startswith('VOICESTUDIO_API_KEY='):
                return line.split('=', 1)[1].strip()
    return ''


class VoiceStudioError(RuntimeError):
    pass


class VoiceStudio:
    def __init__(self, base: str = BASE, api_key: str | None = None, timeout: float = 1200):
        self.base = base.rstrip('/')
        self.key = api_key if api_key is not None else _api_key()
        self.timeout = timeout

    # --- plumbing -------------------------------------------------------------------------------
    def _req(self, method: str, path: str, body: bytes | None = None, ctype: str | None = None, timeout: float | None = None):
        h = {'Authorization': f'Bearer {self.key}'} if self.key else {}
        if ctype:
            h['Content-Type'] = ctype
        r = urllib.request.Request(self.base + path, data=body, method=method, headers=h)
        try:
            with urllib.request.urlopen(r, timeout=timeout or self.timeout) as resp:
                return resp.read(), dict(resp.headers)
        except urllib.error.HTTPError as e:
            raise VoiceStudioError(f'{method} {path} -> HTTP {e.code}: {e.read()[:800].decode("utf-8", "replace")}') from None

    def get(self, path: str):
        return json.loads(self._req('GET', path, timeout=60)[0])

    def post_json(self, path: str, obj: dict):
        return json.loads(self._req('POST', path, json.dumps(obj).encode(), 'application/json')[0] or b'{}')

    @staticmethod
    def _multipart(fields: dict, files: dict):
        b = uuid.uuid4().hex
        out = []
        for k, v in fields.items():
            if v is None:
                continue
            out.append(f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
        for k, p in files.items():
            if p is None:
                continue
            p = Path(p)
            out.append(f'--{b}\r\nContent-Disposition: form-data; name="{k}"; filename="{p.name}"\r\nContent-Type: application/octet-stream\r\n\r\n'.encode()
                       + p.read_bytes() + b'\r\n')
        out.append(f'--{b}--\r\n'.encode())
        return b''.join(out), f'multipart/form-data; boundary={b}'

    # --- API ------------------------------------------------------------------------------------
    def health(self):
        return self.get('/health')

    def engines(self):
        return self.get('/engines/tts')

    def models(self):
        return self.get('/models')

    def install_model(self, repo_id: str, wait: bool = True):
        r = self.post_json('/models/install', {'repo_id': repo_id})
        return self._wait('/models/install/status') if wait else r

    def install_sidecar(self, engine_id: str, wait: bool = True):
        r = json.loads(self._req('POST', f'/engines/sidecar/{engine_id}/install', b'{}', 'application/json')[0] or b'{}')
        return self._wait(f'/engines/sidecar/{engine_id}/install/status') if wait else r

    def _wait(self, status_path: str, every: float = 10):
        while True:
            s = self.get(status_path)
            txt = json.dumps(s)
            if '"failed"' in txt or '"error"' in txt and '"error": null' not in txt:
                return s
            if not s.get('jobs') and s.get('state') not in ('running', 'installing', 'queued', 'downloading'):
                return s
            time.sleep(every)

    def generate(self, text: str, *, engine: str | None = None, ref_audio: str | Path | None = None, ref_text: str | None = None,
                 instruct: str | None = None, profile_id: str | None = None, seed: int | None = None, effect_preset: str = 'raw',
                 language: str | None = 'English', denoise: bool = False, **extra) -> bytes:
        """POST /generate (multipart). effect_preset defaults to 'raw' (no processing) -- VoiceStudio's own default is
        'broadcast' (compression/EQ), which would colour A/B comparisons. Returns WAV bytes."""
        fields = {'text': text, 'engine': engine, 'ref_text': ref_text, 'instruct': instruct, 'profile_id': profile_id,
                  'seed': seed, 'effect_preset': effect_preset, 'language': language, 'denoise': str(denoise).lower(), **extra}
        body, ct = self._multipart(fields, {'ref_audio': ref_audio})
        data, _ = self._req('POST', '/generate', body, ct)
        return data

    def stream_tts(self, text: str, **kw) -> bytes:
        """/ws/tts (the only public route that forwards IndexTTS emotion fields: emo_text, emo_vector[8], emo_alpha,
        emo_audio). Needs `websockets` (pip install websockets). Returns WAV bytes assembled from the PCM frames."""
        import asyncio
        import io
        import wave

        import websockets  # type: ignore

        async def run():
            url = self.base.replace('http', 'ws', 1) + '/ws/tts' + (f'?token={self.key}' if self.key else '')
            hdr = {'Authorization': f'Bearer {self.key}'} if self.key else {}
            pcm, sr = bytearray(), 24000
            # No keepalive pings and a long open timeout: the first request loads the engine's weights (minutes) and the
            # server does not answer pings while it is busy, which otherwise drops the socket (1011 keepalive timeout).
            async with websockets.connect(url, additional_headers=hdr, max_size=None, open_timeout=self.timeout,
                                          ping_interval=None, close_timeout=30) as ws:
                await ws.send(json.dumps({'text': text, **kw}))
                async for msg in ws:
                    if isinstance(msg, bytes):
                        pcm += msg
                        continue
                    m = json.loads(msg)
                    sr = int(m.get('sample_rate') or sr)
                    if m.get('audio_pcm_b64'):
                        pcm += base64.b64decode(m['audio_pcm_b64'])
                    if m.get('type') in ('done', 'end', 'complete') or m.get('done'):
                        break
                    if m.get('type') == 'error' or m.get('error'):
                        raise VoiceStudioError(json.dumps(m)[:800])
            buf = io.BytesIO()
            with wave.open(buf, 'wb') as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(sr)
                w.writeframes(bytes(pcm))
            return buf.getvalue()

        return asyncio.run(run())


if __name__ == '__main__':
    vs = VoiceStudio()
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'health'
    if cmd == 'health':
        print(json.dumps(vs.health(), indent=1))
    elif cmd == 'engines':
        for b in vs.engines().get('backends', []):
            print(f"{b['id']:<22} available={b['available']!s:<5} emotion={b.get('supports_emotion')!s:<5} {b['display_name']}")
    elif cmd == 'models':
        for m in vs.models() if isinstance(vs.models(), list) else vs.models().get('models', []):
            print(f"{m.get('installed')!s:<5} {m.get('size_gb')!s:>5} GB  {m['repo_id']}")
    elif cmd == 'install':
        print(json.dumps(vs.install_model(sys.argv[2]), indent=1)[:3000])
    elif cmd == 'sidecar':
        print(json.dumps(vs.install_sidecar(sys.argv[2]), indent=1)[:3000])
    else:
        sys.exit(__doc__)
