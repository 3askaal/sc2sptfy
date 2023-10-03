import React, { createContext, Dispatch, SetStateAction, useState } from 'react'

export interface DataContextType {
  data: IData | null;
  setData: Dispatch<SetStateAction<any>>;
}

export const DataContext = createContext<DataContextType>({
  data: null,
  setData: () => undefined,
})

export const IntelProvider = ({ children }: any) => {
  const [data, setData] = useState<any>({})

  return (
    <DataContext.Provider
      value={{
        data,
        setData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
