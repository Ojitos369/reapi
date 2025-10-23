import { useMemo } from "react";
import { useStates } from "../../Hooks/useStates";
import style from './styles/index.module.scss';

export const localStates = () => {
    const { f, lf, s, ls } = useStates();

    const { prod_mode, dev_mode } = useMemo(() => s.app?.modes ?? {}, [s.app?.modes]);
    const actualTheme = useMemo(() => ls.theme, [ls.theme]);
    const menubarOpen = useMemo(() => s.menubar?.open, [s.menubar?.open]);

    const changeTheme = () => {
        lf.toggleTheme();
    }
    const toggleMenubar = () => {
        f.u1('menubar', 'open', !menubarOpen);
    }
    

    const elementos = useMemo(() => {
        return [
            {name: `Theme: ${actualTheme}`, action: changeTheme},
        ]
    }, [actualTheme, changeTheme]);

    return {
        style, 
        changeTheme,
        prod_mode, dev_mode,
        menubarOpen, toggleMenubar,
        actualTheme, elementos, 
    }
}