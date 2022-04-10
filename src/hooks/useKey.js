import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addKeyListener, removeKeyListener } from "../features/keys";

function useKey(key, handler, help) {
    const dispatch = useDispatch()
    return useEffect(() => {
        dispatch(addKeyListener(key, handler, help))
        return () => dispatch(removeKeyListener(key, handler, help))
    }, [key, handler, help, dispatch])
}

export default useKey
