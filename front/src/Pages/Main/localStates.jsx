import { useMemo, useEffect, useState } from "react";
import { useStates, createState } from "../../Hooks/useStates";
import style from './style/index.module.scss';

export const localStates = () => {
    const [isInMd, setIsInMd] = createState(['app', 'general', 'isInMd'], window.innerWidth >= 768);
    const [sidebarOpen, setSidebarOpen] = createState(['sidebar', 'open'], false);
    const [menubarOpen, setMenubarOpen] = createState(['menubar', 'open'], false);
    const [didInit, setDidInit] = useState(false);

    const init = () => {
        setIsInMd(window.innerWidth >= 768);
        setSidebarOpen(window.innerWidth >= 768);
        setDidInit(true);
    };

    const closeBars = () => {
        setSidebarOpen(false);
        setMenubarOpen(false);
    };

    // En móvil solo una barra abierta a la vez (overlay)
    const showScrim = useMemo(
        () => !isInMd && (sidebarOpen || menubarOpen),
        [isInMd, sidebarOpen, menubarOpen]
    );

    const openSectionClass = useMemo(() => {
        if (!sidebarOpen && !menubarOpen) return '';
        if (sidebarOpen && !menubarOpen) return 'sidebarOpen';
        if (!sidebarOpen && menubarOpen) return 'menubarOpen';
        return 'bothOpen';
    }, [sidebarOpen, menubarOpen]);

    return {
        style, openSectionClass, showScrim, closeBars,
        isInMd, setIsInMd, sidebarOpen, menubarOpen, didInit, init
    };
};

export const localEffects = () => {
    const { init, setIsInMd } = localStates();

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        const handleResize = () => setIsInMd(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
};
