import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

interface UserContextType {
  preferredUnlockTime: number | null;
  notifsOn: boolean;
  loading: boolean;
  fetchUnlockTime: () => void;
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
  const [notifsOn, setNotifsOn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUnlockTime = async () => {
    try {
      const response = await fetch("http://localhost:5000/users/info", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch unlock time");
      }

      const data = await response.json();
      setPreferredUnlockTime(data.data.preferred_unlock_time);
      setNotifsOn(data.data.notifs_on);
    } catch (error) {
      console.error("Error fetching unlock time:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUnlockTime();
    }
  }, [token]);

  return (
    <UserContext.Provider
      value={{
        preferredUnlockTime,
        notifsOn,
        loading,
        fetchUnlockTime,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
