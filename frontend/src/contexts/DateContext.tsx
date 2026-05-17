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
    const newDate = new Date(selectedDate.setMonth(selectedDate.getMonth() + offset));
    setSelectedDate(new Date(newDate));
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

export const useGlobalDate = () => useContext(DateContext);