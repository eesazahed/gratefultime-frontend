import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import { BackendServer } from "@/constants/BackendServer";

interface MonthlyCountContextType {
  loading: boolean;
  fetchLast31Entries: () => void;
  monthlyCount: number;
}

interface MonthlyCountProviderProps {
  children: ReactNode;
}

const MonthlyCountContext = createContext<MonthlyCountContextType | undefined>(
  undefined
);

export const useMonthlyCount = (): MonthlyCountContextType => {
  const context = useContext(MonthlyCountContext);
  if (!context) {
    throw new Error(
      "useMonthlyCount must be used within a MonthlyCountProvider"
    );
  }
  return context;
};

export const MonthlyCountProvider = ({
  children,
}: MonthlyCountProviderProps) => {
  const { token } = useAuth();
  const [entries, setEntries] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLast31Entries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BackendServer}/entries/last31`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch last 31 entries");
      }

      const data = await response.json();
      setEntries(data.data);
    } catch (error) {
      console.error("Error fetching last 31 entries:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const monthlyCount = useMemo(() => {
    if (!entries.length) return 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let count = 0;
    for (const utcTimestamp of entries) {
      const localDate = new Date(utcTimestamp);
      if (
        localDate.getFullYear() === currentYear &&
        localDate.getMonth() === currentMonth
      ) {
        count++;
      }
    }
    return count;
  }, [entries]);

  useEffect(() => {
    if (token) {
      fetchLast31Entries();
    }
  }, [token]);

  return (
    <MonthlyCountContext.Provider
      value={{
        loading,
        fetchLast31Entries,
        monthlyCount,
      }}
    >
      {children}
    </MonthlyCountContext.Provider>
  );
};
