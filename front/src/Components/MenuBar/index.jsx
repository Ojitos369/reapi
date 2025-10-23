import { localStates } from "./localStates";

export const MenuBar = props => {
    const { style, menubarOpen, changeTheme } = localStates();

    const elementos = [
        {name: 'Cambiar Tema', action: changeTheme},
    ]

    return (
        <div className={`${style.MenuBarContent} ${!menubarOpen && style.hiddeBar}`}>
            <li className={`${style.elementsList}`}>
                {elementos.map((ele, index) => {
                    const show = ele.show ?? true;
                    if (!show) return null;
                    return (
                        <button key={index}  onClick={ele.action} className={`${style.link}`}>
                            {ele.name}
                        </button>
                    )
                })}
            </li>
        </div>
    )
}
/* 

*/