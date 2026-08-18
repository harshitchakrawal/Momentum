import axios, { type AxiosRequestConfig } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean
  }
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

let isRefreshing = false

// Requests that hit a 401 while a refresh was already in flight. They wait
// here instead of each firing their own refresh.
let queue: {
  config: AxiosRequestConfig
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
}[] = []


  // Settle everything that was waiting on the refresh. Passing an error rejects
  // them — leaving them unsettled would hang the caller forever.
 
function flushQueue(error: unknown) {
  const waiting = queue
  queue = []

  waiting.forEach(({ config, resolve, reject }) => {
    if (error) reject(error)
    else api(config).then(resolve, reject)
  })
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config

    // A refresh that itself 401s must not be retried, or we loop forever.
    const canRetry =
      error.response?.status === 401 &&
      config &&
      !config.skipAuthRefresh &&
      !config.url?.includes('/auth/refresh/') &&
      !config._retry

    if (!canRetry) return Promise.reject(error)

    config._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ config, resolve, reject })
      })
    }

    isRefreshing = true

    try {
      await api.post('/auth/refresh/')
      flushQueue(null)
      return api(config)
    } catch (refreshError) {
      flushQueue(refreshError)
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    } finally {
      // Must run on failure too, otherwise every later 401 queues up behind a
      // refresh that will never happen.
      isRefreshing = false
    }
  }
)

export const fetcher = (url: string) => api.get(url).then((res) => res.data)
