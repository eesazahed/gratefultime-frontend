import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { BackendServer } from "@/constants/BackendServer";

interface MonthlyCountContextType {
  loading: boolean;
  fetchMonthlyCount: () => void;
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
  const [monthlyCount, setMonthlyCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMonthlyCount = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BackendServer}/entries/user_month_days`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch monthly count");
      }

      const data = await response.json();
      setMonthlyCount(data.days_count ?? 0);
    } catch (error) {
      console.error("Error fetching monthly count:", error);
      setMonthlyCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMonthlyCount();
    }
  }, [token]);

  return (
    <MonthlyCountContext.Provider
      value={{
        loading,
        fetchMonthlyCount,
        monthlyCount,
      }}
    >
      {children}
    </MonthlyCountContext.Provider>
  );
};
