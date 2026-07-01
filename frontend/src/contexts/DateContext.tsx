import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { format } from 'date-fns';

interface DateContextData {
  selectedDate: Date;
  changeMonth: (offset: number) => void;
  formattedDate: string; // Ex: "Maio de 2024"
  queryMonth: number;
  queryYear: number;
}

const DateContext = createContext<DateContextData>({} as DateContextData);

export function DateProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const changeMonth = useCallback((offset: number) => {
    setSelectedDate(current => {
      const nextDate = new Date(current);
      nextDate.setMonth(nextDate.getMonth() + offset);
      return nextDate;
    });
  }, []);

  const contextValue = useMemo(() => ({
    selectedDate,
    changeMonth,
    formattedDate: format(selectedDate, 'MMMM yyyy'),
    queryMonth: selectedDate.getMonth() + 1,
    queryYear: selectedDate.getFullYear(),
  }), [changeMonth, selectedDate]);

  return (
    <DateContext.Provider value={contextValue}>
      {children}
    </DateContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useGlobalDate = () => useContext(DateContext);
