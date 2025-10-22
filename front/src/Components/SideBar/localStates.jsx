import { useMemo } from "react";
import { useStates } from "../../Hooks/useStates";
import style from './styles/index.module.scss';

export const localStates = () => {
    const { f, lf, s } = useStates();

    const actualPage = useMemo(() => s.page?.actual || '', [s.page?.actual]);
    const { prod_mode, dev_mode } = useMemo(() => s.app?.modes ?? {}, [s.app?.modes]);
    const menuOpen = useMemo(() => s.menu?.open, [s.menu?.open]);

    const changeTheme = () => {
        lf.toggleTheme();
    }
    const toggleMenu = () => {
        f.u1('menu', 'open', !menuOpen);
    }
    
    return {
        style, 
        changeTheme,
        prod_mode, dev_mode,
        actualPage, 
        menuOpen, toggleMenu
    }
}