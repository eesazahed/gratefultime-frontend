import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { BackendServer } from "@/constants/BackendServer";

interface UserContextType {
  loading: boolean;
  preferredUnlockTime: number | null;
  userTimezone: string | null;
  fetchUserData: () => void;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const { token } = useAuth();
  const [preferredUnlockTime, setPreferredUnlockTime] = useState<number | null>(
    null
  );
  const [userTimezone, setUserTimezone] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${BackendServer}/users/info`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 429) {
        console.error("Rate limit exceeded. User data state preserved.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch unlock time");
      }

      const data = await response.json();

      setPreferredUnlockTime(data.data.preferred_unlock_time);
      setUserTimezone(data.data.user_timezone);
    } catch (error) {
      console.error("Error fetching unlock time:", error);
      // Preserve previous state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  return (
    <UserContext.Provider
      value={{
        loading,
        preferredUnlockTime,
        userTimezone,
        fetchUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
