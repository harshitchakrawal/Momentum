import axios from "axios";

let isRefreshing = false
let pendingRequests: (() => void)[] = [];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

api.interceptors.response.use((response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/refresh/') && !error.config._retry){
      error.config._retry = true
      try{
        if (isRefreshing == false){
          isRefreshing = true
          const res = await api.post('/auth/refresh/')
          isRefreshing = false
          pendingRequests.forEach((fn) => fn())
          pendingRequests = []
          
        }

        else if(isRefreshing == true){
          return new Promise((resolve, reject) => {
            pendingRequests.push(() =>{
              api(error.config).then(resolve, reject)
            })
          })
        }          

        return api(error.config)
      }
      catch(e){
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }
    else{
      return Promise.reject(error)
    }
  })