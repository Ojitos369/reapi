import { localStates } from "./localStates";
import { MenuIcon } from "../MenuIcon";

export const MenuIndexPart = () => {
    const { logo, style } = localStates();
    return (
        <div className={`${style.menuIndexPart}`}>
            <div className={`${style.menuIcon}`}>
                <MenuIcon />
            </div>
        </div>
    )
}