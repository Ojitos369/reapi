import { Outlet } from "react-router-dom";
import { useMemo } from "react";
import { MenuBar } from "../../Components/MenuBar";
import { Header } from "../../Components/Header";
import { useStates } from "../../Hooks/useStates";
import style from './style/index.module.scss';

const myStates = () => {
    const { s } = useStates();
    const menuOpen = useMemo(() => s.menu?.open, [s.menu?.open]);
    const pageTitle = useMemo(() => s.page?.title, [s.page?.title]);

    return { menuOpen, pageTitle }
}

export const Main = props => {
    const { menuOpen, pageTitle } = myStates();

    return (
        <div className={`${style.mainPage}`}>
            <Header />
            <MenuBar />
            <section className={`${style.sectionContainer} ${menuOpen && style.menuOpen}`}>
                <div className={`${style.contentContainer}`}>
                {!!pageTitle && 
                    <h1 className={`${style.pageTitle}`}>{pageTitle}</h1>
                }
                <Outlet />
                </div>
            </section>
        </div>
    )
}
