import { localStates, indexEffect } from './localStates';
import { Test } from '../../Components/TestComponent';

export const Index = props => {
    const { styles, toggleShowModal, toggleModalMode, hhMessage, theme, showModal, modalMode } = localStates();
    indexEffect();

    return (
        <div className={`${styles.indexPage} flex w-full flex-wrap justify-center`}>
            <h2 className={`text-center w-1/3 mt-3 font-bold text-3xl ${theme === 'black' ? 'text-white' : 'text-black'} reflejo`}
            >
                Actual theme: {theme}
            </h2>
            <div className='flex w-full flex-wrap justify-center mt-4'>
                <h3 className='w-full text-center'>
                    Options
                </h3>
                <div className='w-1/5 m-3'>
                    <button
                        className={`w-full rounded-lg px-4 py-2 ${showModal ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700' } text-white`}
                        onClick={toggleShowModal}
                    >
                        Show Modal
                    </button>
                </div>
                {showModal && 
                <div className='w-1/5 m-3'>
                    <button
                        className='w-full rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white'
                        onClick={toggleModalMode}
                    >
                        Modal Mode: {modalMode === "M" ? "Move" : "Normal"}
                    </button>
                </div>}
            </div>
            <p>
                {hhMessage || 'Sin Message'}
            </p>
            <Test />
        </div>
    )
}

