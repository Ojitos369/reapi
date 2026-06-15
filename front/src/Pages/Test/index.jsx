import { Route, Routes } from 'react-router-dom';
import { P404 } from '../P404';

import { Test as TestPage } from './Test';

export const Test = () => {

    return (
        <div className={`${style.testPage}`}>
            <span className={`${style.badge}`}>página · test</span>
            <h1 className={`${style.title}`}>Test Component</h1>
            <p className={`${style.subtitle}`}>
                Página de prueba modular. Reemplaza este contenido por tu vista.
            </p>
        </div>
    );
};
