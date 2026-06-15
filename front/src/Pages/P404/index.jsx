import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStates } from '../../Hooks/useStates';
import style from './styles/index.module.scss';

export const P404 = () => {
    const { f } = useStates();
    useEffect(() => {
        f.u1('page', 'actual', '404 Not Found');
    }, []);

    return (
        <div className={`${style.p404Page}`}>
            <span className={`${style.code}`}>404</span>
            <h1 className={`${style.title}`}>Página no encontrada</h1>
            <p className={`${style.subtitle}`}>La ruta que buscas no existe o fue movida.</p>
            <Link to="/" className={`${style.backLink}`}>← Volver al inicio</Link>
        </div>
    );
};
