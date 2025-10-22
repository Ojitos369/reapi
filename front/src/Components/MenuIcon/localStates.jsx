import { useMemo } from "react";
import { useStates } from "../../Hooks/useStates";
import style from './styles/index.module.scss';

export const localStates = () => {
    const { f, s } = useStates();
    const menuOpen = useMemo(() => s.menu?.open ?? false, [s.menu?.open]);

    const toggleMenu = e => {
        if (!!e) {
            e.preventDefault(); 
            e.stopPropagation();
        }
        f.u1('menu', 'open', !menuOpen);
    }
    return {
        style, 
        menuOpen, toggleMenu
    }
}