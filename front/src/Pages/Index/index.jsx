import { localStates, indexEffect } from './localStates';
import { Test } from '../../Components/TestComponent';
import { ViewTransition } from "react";

export const Index = props => {
    const { styles, toggleShowModal, toggleModalMode, hhMessage, theme, showModal, modalMode } = localStates();
    indexEffect();

    return (
        <div className={`${styles.indexPage}`}>
            <section className={`${styles.hero}`}>
                <span className={`${styles.badge}`}>reapi · panel</span>
                <h1 className={`${styles.title}`}>Bienvenido de vuelta</h1>
                <p className={`${styles.subtitle}`}>
                    Plantilla base modular con estado global, sidebar y menubar dinámicos.
                </p>
            </section>

            <div className={`${styles.grid}`}>
                <article className={`${styles.card}`}>
                    <span className={`${styles.cardLabel}`}>Tema actual</span>
                    <strong className={`${styles.cardValue}`}>{theme}</strong>
                    <p className={`${styles.cardHint}`}>
                        Cámbialo desde el menú lateral derecho.
                    </p>
                </article>

                <article className={`${styles.card}`}>
                    <span className={`${styles.cardLabel}`}>Respuesta API</span>
                    <strong className={`${styles.cardValue}`}>{hhMessage || '—'}</strong>
                    <p className={`${styles.cardHint}`}>Endpoint base/hh</p>
                </article>

                <article className={`${styles.card}`}>
                    <span className={`${styles.cardLabel}`}>Modal demo</span>
                    <strong className={`${styles.cardValue}`}>
                        {showModal ? 'Activo' : 'Inactivo'}
                    </strong>
                    <p className={`${styles.cardHint}`}>
                        {showModal ? `Modo: ${modalMode === 'M' ? 'Mover' : 'Normal'}` : 'Sin modal'}
                    </p>
                </article>
            </div>

            <section className={`${styles.actions}`}>
                <h2 className={`${styles.sectionTitle}`}>Acciones</h2>
                <div className={`${styles.actionsRow}`}>
                    <button
                        className={`${styles.btn} ${showModal ? styles.btnSuccess : styles.btnPrimary}`}
                        onClick={toggleShowModal}
                    >
                        {showModal ? 'Ocultar modal' : 'Mostrar modal'}
                    </button>
                    {showModal &&
                        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={toggleModalMode}>
                            Modo: {modalMode === 'M' ? 'Mover' : 'Normal'}
                        </button>}
                </div>
            </section>

            <Test />
        </div>
    );
};
