import useRefState from "../../hooks/useRefState";
import React, { PropsWithChildren, createContext, useState } from "react";

type TableContext = {
    memoFieldRemoteAllOptionsMapRef: React.MutableRefObject<Record<string,Promise<any>> | undefined>
    setFieldRemoteAllOptions: (field: string, asyncOptions: Promise<any[]>) => void
}

/**
 * 做一个表格缓存
 */
export const TableContext = createContext<TableContext>({
    memoFieldRemoteAllOptionsMapRef: {current:undefined},
    setFieldRemoteAllOptions: () => { }
})

export function TableProvider({ children }: PropsWithChildren) {
    // 远程全量options缓存
    const [memoFieldRemoteAllOptionsMap, setMemoFieldRemoteAllOptionsMap,memoFieldRemoteAllOptionsMapRef] = useRefState({})

    function setFieldRemoteAllOptions(field: string, asyncOptions: Promise<any[]>) {
        setMemoFieldRemoteAllOptionsMap({
            ...memoFieldRemoteAllOptionsMap,
            [field]: asyncOptions
        })
    }

    return <TableContext.Provider value={{
        memoFieldRemoteAllOptionsMapRef,
        setFieldRemoteAllOptions
    }}>{children}</TableContext.Provider>
}

