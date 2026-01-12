import { useMemo, useEffect } from 'react';
import { useStates, createState } from '../../Hooks/useStates';
import styles from './styles/index.module.scss';


export const localStates = props => {
    const { ls, s, f } = useStates();
    const theme = useMemo(() => ls.theme, [ls.theme]);
    const [modalMode, setModalMode] = createState(['changeTheme', 'modalMode'], "N");
    const [showModal, setShowModal] = createState(['changeTheme', 'showModal'], false);
    const [titulo, setTitulo] = createState(['page', 'title'], "");
    const [actualPage, setActualPage] = createState(['page', 'actual'], "");
    const hhMessage = useMemo(() => s.app?.hh?.response?.message, [s.app?.hh?.response?.message]);

    const init = () => {
        f.app.helloWorld();
        setTitulo("Index");
        setActualPage("index");
    }

    const toggleNot = () => {
        f.general.notificacion({
            mode: 'info',
            title: 'Cambio Thema',
            message: `Thema Cambiado a: ${theme}`
        });
    }

    const toggleModalMode = () => {
        // f.u1('changeTheme', 'modalMode', modalMode === "M" ? "N" : "M");
        setModalMode(modalMode === "M" ? "N" : "M");
    }

    const toggleShowModal = () => {
        // f.u1('changeTheme', 'showModal', !showModal);
        setShowModal(!showModal);
    }

    return {
        init, toggleNot, 
        styles,
        theme, toggleModalMode, toggleShowModal, 
        showModal, modalMode, 
        hhMessage
    }
}

export const indexEffect = props => {
    const { init, toggleNot, theme, showModal } = localStates();

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if (!showModal) return;
        toggleNot();
    }, [theme, showModal]);
}