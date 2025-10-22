import { MenuIndexPart } from "./MenuIndexPart";
import { UserPart } from "./UserPart";
import { ModalUserMenu } from "./ModalUserMenu";
import { localStates } from "./localStates";


export const Header = props => {
    const { dev_mode, userMenu, style } = localStates();

    return (
        <header className={`${style.headerContent} ${dev_mode && style.devModeBC}`}>
            <MenuIndexPart />
            <UserPart />
            {userMenu && <ModalUserMenu />}
        </header>
    )
}
/* 

*/