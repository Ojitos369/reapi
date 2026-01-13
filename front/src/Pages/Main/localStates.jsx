import { useMemo, useEffect } from "react";
import { useStates, createState } from "../../Hooks/useStates";
import style from './style/index.module.scss';

export const localStates = () => {
    const { s } = useStates();
    // const sidebarOpen = useMemo(() => s.sidebar?.open, [s.sidebar?.open]);
    const [sidebarOpen, setSidebarOpen] = createState(['sidebar', 'open'], false);
    const menubarOpen = useMemo(() => s.menubar?.open, [s.menubar?.open]);
    const [isInMd, setIsInMd] = createState(['app', 'general', 'isInMd'], window.innerWidth >= 768);
    const pageTitle = useMemo(() => s.page?.title ?? '', [s.page?.title]);

    const init = () => {
        setSidebarOpen(isInMd);
    }

    const openSectionClass = useMemo(() => {
        if (!sidebarOpen && !menubarOpen) return '';
        if (sidebarOpen && !menubarOpen) return 'sidebarOpen';
        if (!sidebarOpen && menubarOpen) return 'menubarOpen';
        return 'bothOpen';
    }, [sidebarOpen, menubarOpen]);

    return { style, openSectionClass, init, isInMd, setIsInMd, pageTitle }
}

export const localEffects = () => {
    const { init, setIsInMd } = localStates();
    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsInMd(window.innerWidth >= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
}