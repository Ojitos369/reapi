import { useMemo } from "react";
import { useStates } from "../../Hooks/useStates";
import style from './style/index.module.scss';

export const localStates = () => {
    const { s } = useStates();
    const sidebarOpen = useMemo(() => s.sidebar?.open, [s.sidebar?.open]);
    const menubarOpen = useMemo(() => s.menubar?.open, [s.menubar?.open]);

    const openSectionClass = useMemo(() => {
        if (!sidebarOpen && !menubarOpen) return '';
        if (sidebarOpen && !menubarOpen) return 'sidebarOpen';
        if (!sidebarOpen && menubarOpen) return 'menubarOpen';
        return 'bothOpen';
    }, [sidebarOpen, menubarOpen]);

    const pageTitle = useMemo(() => s.page?.title, [s.page?.title]);

    return { style, openSectionClass, pageTitle }
}