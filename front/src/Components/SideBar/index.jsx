import { Link } from "react-router-dom";
import { localStates } from "./localStates";

export const SideBar = props => {
    const { style, menuOpen, actualPage } = localStates();

    const elementos = [
        {name: 'Index', page_name: 'index', to: '/'},
        {name: 'Chat', page_name: 'chat', to: '/chat'},
        {name: 'Test', page_name: 'test', to: '/test'},
    ]

    return (
        <nav className={`${style.SideBarContent} ${!menuOpen && style.hiddeBar}`}>
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
        </nav>
    )
}
/* 

*/