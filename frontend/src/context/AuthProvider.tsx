import React, { createContext, useState } from "react";

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Read initial values from localStorage to persist auth on page reloads
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("access_token"),
  );

  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem("user_profile");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const loginWithGoogle = async (idToken: string) => {
    try {
      const response = await fetch("http://localhost:8000/users/google/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Failed to authenticate.");
      }

      // Matches the AuthResponse structure returned in ApiResponse.data
      const { access_token, user: userProfile } = resData.data;

      // Update state & save token for future headers
      setToken(access_token);
      setUser(userProfile);

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user_profile", JSON.stringify(userProfile));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_profile");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginWithGoogle,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
