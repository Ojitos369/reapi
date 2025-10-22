import { Outlet } from "react-router-dom";
import { SideBar } from "../../Components/SideBar";
import { Header } from "../../Components/Header";
import { localStates } from "./localStates";


export const Main = props => {
    const { style, menuOpen, pageTitle } = localStates();

    return (
        <div className={`${style.mainPage}`}>
            <Header />
            <SideBar />
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
