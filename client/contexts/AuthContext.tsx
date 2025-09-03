import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "society_user" | "agent";
  societyId?: {
    _id: string;
    name: string;
    address: any;
  };
  permissions: {
    canRead: boolean;
    canWrite: boolean;
  };
  isEmailVerified: boolean;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "society_user" | "agent";
  societyId?: string;
  permissions?: {
    canRead: boolean;
    canWrite: boolean;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      fetchProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token is invalid
        localStorage.removeItem("authToken");
        setToken(null);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      localStorage.removeItem("authToken");
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const { token: authToken, user: userData } = data;

      setToken(authToken);
      setUser(userData);
      localStorage.setItem("authToken", authToken);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      const { token: authToken, user: newUser } = data;

      setToken(authToken);
      setUser(newUser);
      localStorage.setItem("authToken", authToken);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  };

  const updateProfile = async (data: { name?: string; email?: string }) => {
    if (!token) throw new Error("No authentication token");

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Profile update failed");
      }

      setUser(result.user);
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    if (!token) throw new Error("No authentication token");

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Password change failed");
      }
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
