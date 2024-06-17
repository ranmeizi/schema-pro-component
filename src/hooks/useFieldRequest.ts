import { useEffect, useState, useMemo, useContext } from "react";
import { TableContext } from "../components/TableProvider";

/**
 * 响应 parms 改变
 * 调用 request 函数
 */
export function useFieldRequest({ value, request, params, valueEnum, onLoaded, memoFieldKey }: any) {
    const [options, setOptions] = useState<any[]>([]);
    const {memoFieldRemoteAllOptionsMapRef,setFieldRemoteAllOptions} = useContext(TableContext)

    useEffect(() => {
        // 没有 valueEnum 时，去请求 options
        !valueEnum && getOptions()
    }, [params]);

    const getOptions = async() => {
        if(memoFieldKey){
            let asyncOptions = memoFieldRemoteAllOptionsMapRef.current?.[memoFieldKey]

            if(!!asyncOptions){
                setOptions(await asyncOptions)
            }else{
                asyncOptions = request(params) as Promise<any[]>
                setFieldRemoteAllOptions(memoFieldKey,asyncOptions)

                setOptions(await asyncOptions)
            }
        }else{
            request(params)
            .then((res: any) => {
                if (res === undefined) {
                    throw '请求异常';
                }
                setOptions(res || []);
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                onLoaded && onLoaded(res || []);
            })
            .catch((e: any) => {
                setOptions([]);
            });
        }
       
    }

    const valueMap = useMemo(() => {
        // valueEnum 优先级更高
        if (valueEnum) {
            return valueEnum;
        }

        const vm:any = {};
        for (const { value: _value, label } of options) {
            vm[_value] = label;
        }
        return vm;
    }, [options, valueEnum]);

    return {
        options,
        text: valueMap[value],
    };
}