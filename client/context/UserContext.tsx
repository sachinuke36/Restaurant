import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchUserProfile } from "@/api/user/profile";
import { User } from "@/types/user";

interface UserContextType {
  user: User | null;
  loading: boolean;
  refetchUser: () => Promise<void>;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchUser = async () => {
    try {
      setLoading(true);
      const data = await fetchUserProfile();
      setUser(data.user);
    } catch (error) {
      console.log("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const clearUser = () => setUser(null);

  useEffect(() => {
    refetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refetchUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};
