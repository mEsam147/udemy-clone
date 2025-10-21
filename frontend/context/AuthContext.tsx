// // lib/AuthContext.tsx
// "use client";

// import { getTokenCookie } from "@/lib/cookies";
// import { User } from "@/lib/types";
// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";

// type AuthContextType = {
//   isAuthenticated: boolean;
//   setIsAuthenticated: (val: boolean) => void;
//   user: any;
//   loading: boolean;
//   token: string | null;
//   updateUser: (userData: any) => void;
//   logout: () => void;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState<User | any>(null);
//   const [loading, setLoading] = useState(true);
//   const [token, setToken] = useState<string | null>(null);

//   const getToken = async () => {
//     const cookieToken = await getTokenCookie();
//     setToken(cookieToken!);
//     return cookieToken;
//   };

//   // Function to update user data
//   const updateUser = (userData: any) => {
//     setUser((prevUser: any) => ({
//       ...prevUser,
//       ...userData
//     }));
//   };

//   // Function to logout
//   const logout = () => {
//     setUser(null);
//     setIsAuthenticated(false);
//     setToken(null);
//     // Clear any stored tokens
//     document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
//     localStorage.removeItem('token');
//   };

//   useEffect(() => {
//     getToken();
//   }, []);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
//           credentials: "include",
//         });

//         if (!res.ok) {
//           setIsAuthenticated(false);
//           setUser(null);
//         } else {
//           const data = await res.json();
//           setUser(data?.data || null);
//           setIsAuthenticated(!!data?.data);
//         }
//       } catch (error) {
//         console.error(error);
//         setIsAuthenticated(false);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, []);

//   console.log("loading auth ", loading);
//   console.log("isAuth auth ", isAuthenticated);

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         setIsAuthenticated,
//         user,
//         loading,
//         token,
//         updateUser,
//         logout
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// lib/AuthContext.tsx
"use client";

import { getTokenCookie } from "@/lib/cookies";
import { User } from "@/lib/types";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  user: any;
  loading: boolean;
  token: string | null;
  updateUser: (userData: any) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const getToken = async () => {
    const cookieToken = await getTokenCookie();
    setToken(cookieToken!);
    return cookieToken;
  };

  const checkAuth = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: "include",
      });

      console.log("Auth check response:", res);
      if (!res.ok) {
        setIsAuthenticated(false);
        setUser(null);
      } else {
        const data = await res.json();
        setUser(data?.data || null);
        setIsAuthenticated(!!data?.data);
      }
    } catch (error) {
      console.error(error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData: any) => {
    setUser((prevUser: any) => ({
      ...prevUser,
      ...userData,
    }));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
  };

  useEffect(() => {
    getToken();
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        loading,
        token,
        updateUser,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
