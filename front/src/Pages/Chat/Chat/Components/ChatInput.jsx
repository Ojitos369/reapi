import { localStates } from '../localStates';

export const ChatInput = ({ sendMessage }) => {
    const { input, setInput, group, setGroup, isConnected, handleConnect } = localStates();

    const handleSend = () => {
        sendMessage(input);
        setInput('');
    };

    return (
        <div className="mt-5 flex items-center justify-between">
            {!isConnected ? (
                <div className="w-full flex gap-3">
                    <input
                        type="text"
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                        placeholder="Nombre del grupo"
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        aria-label="Grupo"
                    />
                    <button
                        onClick={handleConnect}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                    >
                        Conectar
                    </button>
                </div>
            ) : (
                <div className="w-full flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        aria-label="Mensaje"
                    />
                    <button
                        onClick={handleSend}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition"
                    >
                        Enviar
                    </button>
                </div>
            )}
        </div>
    );
};
