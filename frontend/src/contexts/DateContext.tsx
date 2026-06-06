import { createContext, useContext, useState, type ReactNode } from 'react';
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

  const changeMonth = (offset: number) => {
    setSelectedDate(current => {
      const nextDate = new Date(current);
      nextDate.setMonth(nextDate.getMonth() + offset);
      return nextDate;
    });
  };

  return (
    <DateContext.Provider value={{
      selectedDate,
      changeMonth,
      formattedDate: format(selectedDate, 'MMMM yyyy'),
      queryMonth: selectedDate.getMonth() + 1,
      queryYear: selectedDate.getFullYear()
    }}>
      {children}
    </DateContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useGlobalDate = () => useContext(DateContext);
