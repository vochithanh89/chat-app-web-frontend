import axios from "axios";

// Cấu hình base URL backend
const API_BASE_URL = "http://localhost:8082";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios instance cho public endpoints (không cần auth)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm JWT tự động nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userService = {
  // 🔑 Login
  async login(email, password) {
    const res = await publicApi.post("/auth-management/api/v1/auth/log-in", {
      identifier: email,
      password: password,
    });

    localStorage.setItem("token", res.data.data.accessToken);
    localStorage.setItem("refreshToken", res.data.data.refreshToken);

    const currentUser = await this.getCurrentUser();
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    return { ...res.data.data, user: currentUser };
  },

  // 🔑 Register + tự động gửi OTP nếu backend yêu cầu
  async register(data) {
    // Gửi đầy đủ các thuộc tính theo backend yêu cầu
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      phoneNumber: data.phoneNumber,
      address: data.address,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      bio: data.bio,
    };

    console.log("📝 Register Payload:", payload);

    try {
      // ✅ Sử dụng publicApi thay vì api (không gửi JWT token)
      const res = await publicApi.post("/api/v1/users/register", payload);
      console.log("✅ Register successful:", res.data);

      // Nếu backend trả về accessToken ngay sau register (auto login)
      if (res.data.data?.accessToken) {
        localStorage.setItem("token", res.data.data.accessToken);
        localStorage.setItem("refreshToken", res.data.data.refreshToken);
        const currentUser = await this.getCurrentUser();
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }

      return res.data;
    } catch (error) {
      console.error("❌ Register Error Status:", error.response?.status);
      console.error("❌ Register Error Full Response:", error.response?.data);
      console.error("❌ Register Error Message:", error.response?.data?.message);
      throw error;
    }
  },

  // 🔑 Logout
  async logout() {
    const token = localStorage.getItem("token");
    if (token) {
      await api.post("/auth-management/api/v1/auth/logout", { token });
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");
    return true;
  },

  // 🔑 Chuẩn hóa response user từ backend
  normalizeUserData(userData) {
    if (!userData) return null

    const firstName = userData.firstName || ''
    const lastName = userData.lastName || ''
    const fullName = `${firstName} ${lastName}`.trim()

    return {
      ...userData,
      name: userData.name || fullName || userData.username || userData.email,
      avatar: userData.avatar || userData.avatarUrl,
      role:
        userData.role ||
        userData.roles?.[0]?.name ||
        userData.roles?.[0]?.roleName ||
        'Member',
      status: userData.status || 'online',
    }
  },

  // 🔑 Lấy thông tin user hiện tại
  async getUserProfile() {
    const res = await api.get('/api/v1/users/me')
    const normalized = this.normalizeUserData(res.data.data)
    localStorage.setItem('currentUser', JSON.stringify(normalized))
    return normalized
  },

  async getCurrentUser() {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      return JSON.parse(stored)
    }
    return this.getUserProfile()
  },

  // 🔑 Cập nhật profile
  async updateProfile(data) {
    const res = await api.put('/api/v1/users/me', data)
    const normalized = this.normalizeUserData(res.data.data)
    localStorage.setItem('currentUser', JSON.stringify(normalized))
    return normalized
  },

  async updateStatus(status) {
    const current = await this.getCurrentUser()
    const updated = { ...current, status }
    localStorage.setItem('currentUser', JSON.stringify(updated))
    return updated
  },

  // 🔑 Đổi mật khẩu
  async changePassword(data) {
    const res = await api.put("/api/v1/users/password", data);
    return res.data;
  },

  // 🔑 Cập nhật avatar
  async updateAvatar(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/api/v1/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    localStorage.setItem("currentUser", JSON.stringify(res.data.data));
    return res.data.data;
  },

  // 🔑 Gửi OTP
  async sendOtp(email) {
    try {
      console.log("📧 Sending OTP to:", email);
      const res = await publicApi.post("/api/v1/users/send-otp", null, {
        params: { email },
      });
      console.log("✅ OTP sent successfully:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Send OTP Error Status:", error.response?.status);
      console.error("❌ Send OTP Error Response:", error.response);
      console.error("❌ Send OTP Error Full Response Data:", error.response?.data);
      console.error("❌ Send OTP Error Message:", error.response?.data?.message);
      
      let errorMsg = "Failed to send OTP";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.statusText) {
        errorMsg = error.response.statusText;
      }
      
      console.error("🔴 Final error message:", errorMsg);
      
      const err = new Error(errorMsg);
      err.response = error.response;
      throw err;
    }
  },
};