cuda_emu2.h + emu2.py: CPU emulator for CUDA kernels (testing only).
  python3 emu2.py prog.cu > prog.cpp && g++ -std=c++17 -pthread -I. prog.cpp -o prog && ./prog
Supports blockIdx/threadIdx/blockDim/gridDim (dim3), __shared__, __syncthreads, atomicAdd/Min/Max/CAS/Exch,
cudaMalloc/Memcpy/Memset/Free, events. Launch lines must fit on one line: kernel<<<g, b>>>(args);
