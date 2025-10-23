import { useMemo } from "react";
import { useStore } from "react-redux";
import { useStates } from "../../Hooks/useStates";
import style from './styles/index.module.scss';

export const localStates = () => {
    const { f, lf, s } = useStates();
    const store = useStore();

    const actualPage = useMemo(() => s.page?.actual || '', [s.page?.actual]);
    const { prod_mode, dev_mode } = useMemo(() => s.app?.modes ?? {}, [s.app?.modes]);
    const userMenu = useMemo(() => s.modals?.user?.menu, [s.modals?.user?.menu]);
    const username = useMemo(() => s.usuario?.data?.usuario, [s.usuario?.data?.usuario]);
    const menubarOpen = useMemo(() => s.menubar?.open ?? false, [s.menubar?.open]);

    const openUserMenu = () => {
        // f.u1('menu', 'open', false);
        // f.u2('modals', 'user', 'menu', true);
        f.u1('menubar', 'open', !menubarOpen);
    }

    const changeTheme = () => {
        lf.toggleTheme();
    }

    const closeSession = () => {
        f.auth.closeSession();
        console.log("close session");
    }

    return {
        style, 
        closeSession, changeTheme,
        prod_mode, dev_mode,
        actualPage, 
        userMenu, openUserMenu, 
        username, menubarOpen, 
    }
}