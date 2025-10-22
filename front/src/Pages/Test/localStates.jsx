import { useEffect } from 'react';
import { useStates } from "../../Hooks/useStates";
import style from './styles/index.module.scss';

export const localStates = props => {
    const { f } = useStates();
    const init = () => {
        f.u1('page', 'actual', 'test');
    }
    return { style, init }
}

export const indexEffects = props => {
    const { init } = localStates();
    useEffect(() => {
        init();
        console.log("index effect page");
    }, []);
}