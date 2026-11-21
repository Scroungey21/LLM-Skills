/* CPU emulation of a CUDA subset, threaded: one block at a time, its threads run as real
   pthreads, so __syncthreads(), __shared__ and atomics behave like on a GPU (testing only). */
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <algorithm>
#include <pthread.h>
#include <vector>
#include <chrono>
struct dim3 { unsigned x, y, z; dim3(unsigned a = 1, unsigned b = 1, unsigned c = 1) : x(a), y(b), z(c) {} };
static thread_local dim3 threadIdx;
static dim3 blockIdx, blockDim, gridDim;
static pthread_barrier_t emu_bar;
#define __global__
#define __device__
#define __host__
#define __shared__ static
#define __syncthreads() pthread_barrier_wait(&emu_bar)
using std::max; using std::min;
template <class T> T atomicAdd(T *a, T v) { return __atomic_fetch_add(a, v, __ATOMIC_SEQ_CST); }
template <class T> T atomicMin(T *a, T v) { T o = __atomic_load_n(a, __ATOMIC_SEQ_CST); while (v < o && !__atomic_compare_exchange_n(a, &o, v, false, __ATOMIC_SEQ_CST, __ATOMIC_SEQ_CST)); return o; }
template <class T> T atomicMax(T *a, T v) { T o = __atomic_load_n(a, __ATOMIC_SEQ_CST); while (v > o && !__atomic_compare_exchange_n(a, &o, v, false, __ATOMIC_SEQ_CST, __ATOMIC_SEQ_CST)); return o; }
template <class T> T atomicCAS(T *a, T cmp, T v) { __atomic_compare_exchange_n(a, &cmp, v, false, __ATOMIC_SEQ_CST, __ATOMIC_SEQ_CST); return cmp; }
template <class T> T atomicExch(T *a, T v) { return __atomic_exchange_n(a, v, __ATOMIC_SEQ_CST); }
typedef int cudaError_t; static const int cudaSuccess = 0;
enum cudaMemcpyKind { cudaMemcpyHostToHost, cudaMemcpyHostToDevice, cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, cudaMemcpyDefault };
template <class T> cudaError_t cudaMalloc(T **p, size_t n) { *p = (T *)malloc(n); return 0; }
template <class T> cudaError_t cudaMallocManaged(T **p, size_t n) { *p = (T *)malloc(n); return 0; }
inline cudaError_t cudaMemcpy(void *d, const void *s, size_t n, cudaMemcpyKind) { memcpy(d, s, n); return 0; }
inline cudaError_t cudaMemset(void *d, int v, size_t n) { memset(d, v, n); return 0; }
inline cudaError_t cudaFree(void *p) { free(p); return 0; }
inline cudaError_t cudaDeviceSynchronize() { return 0; }
inline cudaError_t cudaGetLastError() { return 0; }
inline const char *cudaGetErrorString(cudaError_t) { return "no error"; }
typedef std::chrono::steady_clock::time_point *cudaEvent_t;
inline cudaError_t cudaEventCreate(cudaEvent_t *e) { *e = new std::chrono::steady_clock::time_point(); return 0; }
inline cudaError_t cudaEventRecord(cudaEvent_t e, int = 0) { *e = std::chrono::steady_clock::now(); return 0; }
inline cudaError_t cudaEventSynchronize(cudaEvent_t) { return 0; }
inline cudaError_t cudaEventElapsedTime(float *ms, cudaEvent_t a, cudaEvent_t b) { *ms = std::chrono::duration<float, std::milli>(*b - *a).count(); return 0; }
inline cudaError_t cudaEventDestroy(cudaEvent_t e) { delete e; return 0; }
struct EmuArg { dim3 t; void (*f)(void *); void *ctx; };
static void *emu_run(void *p) { EmuArg *a = (EmuArg *)p; threadIdx = a->t; a->f(a->ctx); return 0; }
template <class F> void emu_block(dim3 b, F f) {
  unsigned n = b.x * b.y * b.z; pthread_barrier_init(&emu_bar, 0, n);
  std::vector<pthread_t> th(n); std::vector<EmuArg> ar(n); unsigned k = 0;
  auto call = [](void *c) { (*(F *)c)(); };
  for (unsigned tz = 0; tz < b.z; tz++) for (unsigned ty = 0; ty < b.y; ty++) for (unsigned tx = 0; tx < b.x; tx++, k++) {
    ar[k] = { dim3(tx, ty, tz), call, &f }; pthread_create(&th[k], 0, emu_run, &ar[k]); }
  for (auto &t : th) pthread_join(t, 0);
  pthread_barrier_destroy(&emu_bar);
}
#define EMU_LAUNCH(K, G, B, ...) do { dim3 g_(G), b_(B); gridDim = g_; blockDim = b_; \
  for (unsigned bz = 0; bz < g_.z; bz++) for (unsigned by = 0; by < g_.y; by++) for (unsigned bx = 0; bx < g_.x; bx++) { \
    blockIdx = dim3(bx, by, bz); emu_block(b_, [&]() { K(__VA_ARGS__); }); } } while (0)
