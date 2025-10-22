import { User as UserIcon } from '../Icons';
import { myStates } from "./myStates";

export const UserPart = () => {
    const { openUserMenu, style } = myStates();
    return (
        <div className={`${style.userPart}`}>
            <UserIcon className="manita" onClick={openUserMenu}/>
        </div>
    )
}