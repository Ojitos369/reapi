import { User as UserIcon } from '../Icons';
import { localStates } from "./localStates";

export const UserPart = () => {
    const { openUserMenu, style } = localStates();
    return (
        <div className={`${style.userPart}`}>
            <UserIcon className="manita" onClick={openUserMenu}/>
        </div>
    )
}