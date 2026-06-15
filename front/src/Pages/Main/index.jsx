import { Outlet } from "react-router-dom";
import { Header } from "../../Components/Header";
import { SideBar } from "./SideBar";
import { MenuBar } from "./MenuBar";
import { localStates, localEffects } from "./localStates";

export const Main = props => {
    const { style, openSectionClass, showScrim, closeBars } = localStates();
    localEffects();

    return (
        <div className={`${style.mainPage}`}>
            <header className={`${style.headerSlot}`}>
                <Header />
            </header>

            <div className={`${style.pageContent} ${openSectionClass && style[openSectionClass]}`}>
                <SideBar />

                <section className={`${style.sectionContainer}`}>
                    <div className={`${style.contentContainer}`}>
                        <Outlet />
                    </div>
                </section>

                <MenuBar />

                {showScrim &&
                    <div className={`${style.scrim}`} onClick={closeBars} />}
            </div>
        </div>
    );
};
