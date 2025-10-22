import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useStates } from "../../Hooks/useStates";

import style from './styles/index.module.scss';

const myStates = () => {
    const { f, lf, s } = useStates();

    const actualPage = useMemo(() => s.page?.actual || '', [s.page?.actual]);
    const { prod_mode, dev_mode } = useMemo(() => s.app?.modes ?? {}, [s.app?.modes]);
    const menuOpen = useMemo(() => s.menu?.open, [s.menu?.open]);

    const changeTheme = () => {
        lf.toggleTheme();
    }

    const closeSession = () => {
        f.auth.closeSession();
        console.log("close session");
    }

    const toggleMenu = () => {
        f.u1('menu', 'open', !menuOpen);
    }
    return {
        closeSession, changeTheme,
        prod_mode, dev_mode,
        actualPage, 
        menuOpen, toggleMenu
    }
}

export const MenuBar = props => {
    const { dev_mode } = myStates();
    const { menuOpen, actualPage } = myStates();

    const elementos = [
        {name: 'Index', page_name: 'index', to: '/'},
        {name: 'Chat', page_name: 'chat', to: '/chat'},
        {name: 'Test', page_name: 'test', to: '/test'},
    ]

    return (
        <div className={`${style.menuBarContent} ${!menuOpen && style.hiddeBar} ${dev_mode && style.devModeBC}`}>
            <li className={`${style.elementsList}`}>
                {elementos.map((ele, index) => {
                    const show = ele.show ?? true;
                    if (!show) return null;
                    return (
                        <Link key={index}  to={ele.to} className={`${style.link} ${(actualPage === ele.page_name) && style.linkSelected}`}>
                            {ele.name}
                        </Link>
                    )
                })}
            </li>
        </div>
    )
}
/* 

*/