import { Outlet } from "react-router-dom";
import { SideBar } from "../../Components/SideBar";
import { MenuBar } from "../../Components/MenuBar";
import { Header } from "../../Components/Header";
import { localStates } from "./localStates";


export const Main = props => {
    const { style, openSectionClass, pageTitle } = localStates();

    return (
        <div className={`${style.mainPage}`}>
            <Header />
            <div className={`${style.mainContent}`}>
                <SideBar />
                <section className={`${style.sectionContainer} ${openSectionClass && style[openSectionClass]}`}>
                    <div className={`${style.contentContainer}`}>
                        {!!pageTitle && 
                            <h1 className={`${style.pageTitle}`}>{pageTitle}</h1>
                        }
                        <Outlet />
                    </div>
                </section>
                <MenuBar />
            </div>
        </div>
    )
}
