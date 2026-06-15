"use client";

import { createContext, useContext, useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import { encryptData, decryptData } from "@/lib/security";

// Interface User
export type UserRole = "user" | "admin" | "super_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  lastLogin?: string;
}

interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  googleLogin: (idToken: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  setUser: (user: User | null) => Promise<void>;
  recheckSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const loginAttempts: Record<string, { count: number; lastAttempt: number }> = {};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [userState, setUserState] = useState<User | null>(null);
  const user = userState;
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedRef = useRef(false);

  const getTokenExpiration = (token: string): number => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp || 0;
    } catch (e) {
      console.error("Error getting token expiration:", e);
      return 0;
    }
  };

  // Fonction utilitaire pour normaliser le rôle
  const normalizeRole = (rawRole: string): "user" | "admin" | "super_admin" => {
    const roleString = String(rawRole).toLowerCase().trim();
    if (roleString === "super_admin" || roleString === "super admin") {
      return "super_admin";
    } else if (roleString === "admin") {
      return "admin";
    } else {
      return "user";
    }
  };

  // Helper to validate and get stored user session
  const getStoredSession = async (encryptedUser: string, authToken: string): Promise<User | null> => {
    try {
      const userData = await decryptData(encryptedUser);
      const tokenExpiration = getTokenExpiration(authToken);
      if (userData && tokenExpiration > Date.now() / 1000) {
        return JSON.parse(userData);
      }
    } catch (decryptErr) {
      console.error("❌ Erreur décryptage recheck:", decryptErr);
    }
    return null;
  };

  // Helper to refresh session from backend
  const refreshSession = async (authToken: string): Promise<User | null> => {
    try {
      const response = await fetch(`${apiUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user && data.accessToken) {
          localStorage.setItem("auth_token", data.accessToken);
          
          const finalRole = normalizeRole(data.user.role || "user");
          const normalizedUser = {
            ...data.user,
            role: finalRole
          };
          
          const encryptedUser = await encryptData(JSON.stringify(normalizedUser));
          localStorage.setItem("auth_user", encryptedUser);
          return normalizedUser;
        }
      }
    } catch (refreshErr) {
      console.error("❌ Erreur refresh:", refreshErr);
    }
    return null;
  };

  // Fonction utilitaire pour stocker les données auth
  const storeAuthData = async (authUser: User, token: string) => {
    const encryptedUser = await encryptData(JSON.stringify(authUser));
    localStorage.setItem("auth_user", encryptedUser);
    localStorage.setItem("auth_token", token);
    document.cookie = `auth_token=${token}; path=/; max-age=604800`;
    document.cookie = `user_role=${authUser.role}; path=/; max-age=604800`;
  };

  useEffect(() => {
    const checkSession = async () => {
      if (hasCheckedRef.current) {
        setIsLoading(false);
        return;
      }
      hasCheckedRef.current = true;

      console.log("🔍 Checking session...");
      try {
        const encryptedUser = localStorage.getItem("auth_user");
        const authToken = localStorage.getItem("auth_token");

        console.log("📦 Stored data:", { hasUser: !!encryptedUser, hasToken: !!authToken });

        if (encryptedUser && authToken) {
          let userData: string;
          try {
            userData = await decryptData(encryptedUser);
          } catch (decryptErr) {
            console.error("❌ Erreur décryptage:", decryptErr);
            localStorage.removeItem("auth_user");
            localStorage.removeItem("auth_token");
            setIsLoading(false);
            return;
          }
          
          console.log("✅ Decrypted userData:", userData);
          const tokenExpiration = getTokenExpiration(authToken);

          console.log("⏰ Token exp:", new Date(tokenExpiration * 1000), "Now:", new Date());

          if (userData && tokenExpiration > Date.now() / 1000) {
            const parsedUser = JSON.parse(userData);
            console.log("👤 Parsed user:", parsedUser);
            setUserState(parsedUser);
          } else {
            console.log("🚫 Session invalid/expired");
            localStorage.removeItem("auth_user");
            localStorage.removeItem("auth_token");
          }
        }
      } catch (error) {
        console.error("❌ Erreur de vérification de la session :", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // Fetch the public key from the backend
      const pubKeyRes = await fetch(`${apiUrl}/auth/public-key`);
      if (!pubKeyRes.ok) throw new Error("Failed to get public key");
      const pubKeyData = await pubKeyRes.json();
      
      // Encrypt the password using native Web Crypto API (RSA-OAEP with SHA-256)
      const pemContents = pubKeyData.publicKey
        .replace("-----BEGIN PUBLIC KEY-----", "")
        .replace("-----END PUBLIC KEY-----", "")
        .replace(/\s/g, '');
      const binaryDerString = globalThis.atob(pemContents);
      const binaryDer = new Uint8Array(binaryDerString.length);
      for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.codePointAt(i) || 0;
      }
      const cryptoKey = await globalThis.crypto.subtle.importKey(
        "spki",
        binaryDer.buffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["encrypt"]
      );
      const encoder = new TextEncoder();
      const encryptedBuffer = await globalThis.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        cryptoKey,
        encoder.encode(password)
      );
      const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
      const encryptedPasswordBase64 = globalThis.btoa(String.fromCodePoint(...encryptedArray));
      
      if (!encryptedPasswordBase64) throw new Error("Encryption failed");

      // Send the login request
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: encryptedPasswordBase64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || "Identifiants invalides." };
      }

      // Normaliser le rôle
      const userObj: User = {
        ...data.user,
        role: normalizeRole(data.user.role || "user"),
      };

      await storeAuthData(userObj, data.accessToken);
      setUserState(userObj);

      return { success: true, user: userObj };
    } catch (error) {
      console.error("❌ Erreur de connexion :", error);
      return { success: false, error: "Une erreur imprévue est survenue. Veuillez réessayer." };
    }
  };

  const googleLogin = async (idToken: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${apiUrl}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || "Erreur Google Login." };
      }

      // Normaliser le rôle
      const userObj: User = {
        ...data.user,
        role: normalizeRole(data.user.role || "user"),
      };

      await storeAuthData(userObj, data.accessToken);
      setUserState(userObj);

      return { success: true, user: userObj };
    } catch (error) {
      console.error("❌ Erreur googleLogin :", error);
      return { success: false, error: "Erreur réseau." };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      // Fetch the public key from the backend
      const pubKeyRes = await fetch(`${apiUrl}/auth/public-key`);
      if (!pubKeyRes.ok) throw new Error("Failed to get public key");
      const pubKeyData = await pubKeyRes.json();
      
      // Encrypt the password using native Web Crypto API (RSA-OAEP with SHA-256)
      const pemContents = pubKeyData.publicKey
        .replace("-----BEGIN PUBLIC KEY-----", "")
        .replace("-----END PUBLIC KEY-----", "")
        .replace(/\s/g, '');
      const binaryDerString = globalThis.atob(pemContents);
      const binaryDer = new Uint8Array(binaryDerString.length);
      for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.codePointAt(i) || 0;
      }
      const cryptoKey = await globalThis.crypto.subtle.importKey(
        "spki",
        binaryDer.buffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["encrypt"]
      );
      const encoder = new TextEncoder();
      const encryptedBuffer = await globalThis.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        cryptoKey,
        encoder.encode(password)
      );
      const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
      const encryptedPasswordBase64 = globalThis.btoa(String.fromCodePoint(...encryptedArray));
      
      if (!encryptedPasswordBase64) throw new Error("Encryption failed");

      // Send the signup request
      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password: encryptedPasswordBase64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || "Erreur lors de l'inscription." };
      }

      // Normaliser le rôle
      const userObj: User = {
        ...data.user,
        role: normalizeRole(data.user.role || "user"),
      };

      await storeAuthData(userObj, data.accessToken);
      setUserState(userObj);

      return { success: true, user: userObj };
    } catch (error) {
      console.error("❌ Erreur d'inscription :", error);
      return { success: false, error: "Erreur réseau. Vérifiez votre connexion et réessayez." };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        await fetch(`${apiUrl}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
      }
    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion backend:", error);
    } finally {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUserState(null);
      hasCheckedRef.current = false;
      globalThis.window.location.href = "/auth/login";
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    setUserState(updatedUser);

    try {
      const encryptedUser = await encryptData(JSON.stringify(updatedUser));
      localStorage.setItem("auth_user", encryptedUser);
    } catch (error) {
      console.error("❌ Échec de la mise à jour des données utilisateur :", error);
    }
  };

  const setUser = async (newUser: User | null) => {
    console.log("🔄 Setting user in context:", newUser);
    setUserState(newUser);
    if (newUser) {
      try {
        const encryptedUser = await encryptData(JSON.stringify(newUser));
        localStorage.setItem("auth_user", encryptedUser);
        console.log("✅ User stored in localStorage");
      } catch (err) {
        console.error("❌ Erreur chiffrement user:", err);
        localStorage.setItem("auth_user", JSON.stringify(newUser));
      }
    } else {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    }
  };

  const recheckSession = async () => {
    if (!isLoading && hasCheckedRef.current) {
      console.log("🔁 Session déjà vérifiée, skip");
      return;
    }
    setIsLoading(true);
    try {
      const encryptedUser = localStorage.getItem("auth_user");
      const authToken = localStorage.getItem("auth_token");
      
      if (encryptedUser && authToken) {
        const storedUser = await getStoredSession(encryptedUser, authToken);
        if (storedUser) {
          setUserState(storedUser);
          console.log("✅ Re-check success: user set");
          hasCheckedRef.current = true;
          setIsLoading(false);
          return;
        }
      }
      
      if (authToken) {
        const refreshedUser = await refreshSession(authToken);
        if (refreshedUser) {
          setUserState(refreshedUser);
          hasCheckedRef.current = true;
          setIsLoading(false);
          return;
        }
      }
      
      throw new Error("Invalid session on re-check");
    } catch (error) {
      console.error("❌ Re-check failed:", error);
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      googleLogin,
      register,
      logout,
      updateUser,
      setUser,
      recheckSession,
    }),
    [user, isLoading, login, googleLogin, register, logout, updateUser, setUser, recheckSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}