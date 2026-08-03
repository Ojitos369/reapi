import { localStates, indexEffect } from './localStates';
import { Test } from '../../Components/TestComponent';
import { Switch } from '../../Components/Switch';
import { ViewTransition } from "react";

export const Index = props => {
    const {
        styles, toggleShowModal, toggleModalMode, hhMessage, theme,
        showModal, modalMode, showLogin, toggleShowLogin, changeTheme,
    } = localStates();
    indexEffect();

    return (
        <ViewTransition default="moveLeft">
            <div className={`${styles.indexPage}`}>
                <header className={`${styles.pageHeader}`}>
                    <div>
                        <h1>Panel principal</h1>
                        <p>Plantilla reapi — React + FastAPI</p>
                    </div>
                    <span className={`${styles.statusPill} ${hhMessage ? styles.ok : ''}`}>
                        <span className={`${styles.dot}`} />
                        {hhMessage ? 'API conectada' : 'Sin conexión con la API'}
                    </span>
                </header>

                <div className={`${styles.cardsGrid}`}>
                    <section className={`${styles.card}`}>
                        <h2>Acceso</h2>
                        <p className={`${styles.cardHint}`}>
                            Controla la puerta de entrada de la aplicación.
                        </p>
                        <Switch
                            checked={showLogin}
                            onChange={toggleShowLogin}
                            label="Pantalla de inicio de sesión"
                            description="Al activarlo se pedirá iniciar sesión para usar la aplicación. Apagado por defecto."
                        />
                    </section>

                    <section className={`${styles.card}`}>
                        <h2>Apariencia</h2>
                        <p className={`${styles.cardHint}`}>
                            Tema actual: {theme === 'black' ? 'oscuro' : 'claro'}
                        </p>
                        <Switch
                            checked={theme === 'black'}
                            onChange={changeTheme}
                            label="Tema oscuro"
                            description="Alterna entre el tema claro y el oscuro."
                        />
                    </section>

                    <section className={`${styles.card}`}>
                        <h2>Demostración de modales</h2>
                        <p className={`${styles.cardHint}`}>
                            Prueba el modal que aparece al cambiar el tema.
                        </p>
                        <Switch
                            checked={showModal}
                            onChange={toggleShowModal}
                            label="Mostrar modal"
                            description="Activa el modal de aviso al cambiar el tema."
                        />
                        {showModal &&
                        <Switch
                            checked={modalMode === "M"}
                            onChange={toggleModalMode}
                            label="Modal movible"
                            description={`Modo actual: ${modalMode === "M" ? "Move" : "Normal"}`}
                        />}
                        {showModal &&
                        <p className={`${styles.cardNote}`}>
                            Cambia el tema de la página para ver el modal.
                        </p>}
                    </section>

                    <section className={`${styles.card}`}>
                        <h2>Estado del servidor</h2>
                        <p className={`${styles.cardHint}`}>
                            Respuesta del endpoint de prueba del backend.
                        </p>
                        <p className={`${styles.serverMessage}`}>
                            {hhMessage || 'Sin mensaje del servidor'}
                        </p>
                        <Test />
                    </section>
                </div>
            </div>
        </ViewTransition>
    )
}
