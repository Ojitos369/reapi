import { useMemo } from "react";
import { useStates } from "../../Hooks/useStates";
import style from './styles/index.module.scss';

export const localStates = () => {
    const { f, lf, s } = useStates();

    const actualPage = useMemo(() => s.page?.actual || '', [s.page?.actual]);
    const { prod_mode, dev_mode } = useMemo(() => s.app?.modes ?? {}, [s.app?.modes]);
    const sidebarOpen = useMemo(() => s.sidebar?.open, [s.sidebar?.open]);

    const changeTheme = () => {
        lf.toggleTheme();
    }
    const toggleSidebar = () => {
        f.u1('sidebar', 'open', !sidebarOpen);
    }
    
    return {
        style, 
        changeTheme,
        prod_mode, dev_mode,
        actualPage, 
        sidebarOpen, toggleSidebar
    }
}