FROM nvidia/cuda:12.8.1-cudnn-runtime-ubuntu24.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/root/.cache/huggingface

RUN apt-get update && apt-get install -y --no-install-recommends \
      python3.12 python3-pip ffmpeg libsndfile1 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# dots.tts 0.3.1 officially targets torch 2.8/CUDA 12.8. Pin the GPU stack so
# rebuilding the service cannot silently change its numerical/runtime behavior.
RUN python3.12 -m pip install --break-system-packages \
      torch==2.8.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cu128

# Keep application dependencies in their own layer. A server-library adjustment
# must not invalidate the multi-gigabyte CUDA/PyTorch installation above.
COPY tts-dots/constraints-recommended.txt /tmp/dots-recommended.txt
RUN python3.12 -m pip install --break-system-packages \
      dots.tts==0.3.1 uvicorn[standard]==0.35.0 soundfile==0.13.1 \
      -c /tmp/dots-recommended.txt

COPY tts-dots/server.py /app/server.py
COPY tts-dots/voices /app/voices

EXPOSE 8004
CMD ["python3.12", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8004"]
