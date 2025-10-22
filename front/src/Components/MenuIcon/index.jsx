import { useMemo } from "react";
import { useStates } from "../../Hooks/useStates";
import style from './styles/index.module.scss';

const myStates = () => {
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
        menuOpen, toggleMenu
    }
}

export const MenuIcon = () => {
    const { menuOpen, toggleMenu } = myStates();
    return (
        <div className={`${style.menuIcon}`} onClick={toggleMenu}>
            <label className={`${style.hamburger}`}>
                <input type="checkbox" checked={menuOpen} readOnly />
                <svg viewBox="0 0 32 32">
                    <path className={`${style.line} ${style.lineTopBottom}`} d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"></path>
                    <path className={`${style.line}`} d="M7 16 27 16"></path>
                </svg>
            </label>
        </div>
    )
}