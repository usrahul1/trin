import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

export const productsApi = {
  getAll: async () => await api.get("/api/products"),
  getById: async (id) => await api.get(`/api/products/${id}`),
  create: async (data) => await api.post("/api/products", data),
  update: async (id, data) => await api.put(`/api/products/${id}`, data),
  delete: async (id) => await api.delete(`/api/products/${id}`),
}

export const ordersApi = {
  getAll: async () => await api.get("/api/orders"),
  
  getById: async (id) => await api.get(`/api/orders/${id}`),
  
  create: async (data) => {
    const response = await api.post("/api/orders", data);
    return response; 
  },
  
  updateStatus: async (id, status) => await api.put(`/api/orders/${id}`, { status }),
};


export default api
