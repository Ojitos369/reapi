import { useMemo } from "react";
import { useStates } from "../../Hooks/useStates";
import style from './style/index.module.scss';

export const localStates = () => {
    const { s } = useStates();
    const menuOpen = useMemo(() => s.menu?.open, [s.menu?.open]);
    const pageTitle = useMemo(() => s.page?.title, [s.page?.title]);

    return { style, menuOpen, pageTitle }
}