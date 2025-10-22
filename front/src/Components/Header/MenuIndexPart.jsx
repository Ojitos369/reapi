import { myStates } from "./myStates";
import { MenuIcon } from "../MenuIcon";

export const MenuIndexPart = () => {
    const { logo, style } = myStates();
    return (
        <div className={`${style.menuIndexPart}`}>
            <div className={`${style.menuIcon}`}>
                <MenuIcon />
            </div>
        </div>
    )
}