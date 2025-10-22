import { MenuIndexPart } from "./MenuIndexPart";
import { UserPart } from "./UserPart";
import { ModalUserMenu } from "./ModalUserMenu";
import { myStates } from "./myStates";


export const Header = props => {
    const { dev_mode, userMenu, style } = myStates();

    return (
        <div className={`${style.headerContent} ${dev_mode && style.devModeBC}`}>
            <MenuIndexPart />
            <UserPart />
            {userMenu && <ModalUserMenu />}
        </div>
    )
}
/* 

*/