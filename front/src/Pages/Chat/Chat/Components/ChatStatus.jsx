import { localStates } from '../localStates';

export const ChatStatus = () => {
    const { cargando, isConnected } = localStates();

    return (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
                {cargando && (
                    <span className="inline-flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Cargando...
                    </span>
                )}
            </div>
            <div>
                <span className={`px-2 py-1 rounded-full text-xs ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
            </div>
        </div>
    );
};
