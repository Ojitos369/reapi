import { localStates } from "./localStates";
import { useEffect, useRef } from 'react';

export const Chat = () => {
    const {
        init,
        messages, addMessage,
        actualMessage, actualizaActual, setActualMessage, 
        input, setInput,
        group, setGroup,
        isConnected, setIsConnected,
        cargando, setCargando,
    } = localStates();

    const socket = useRef(null);
    const clientId = useRef(Date.now());

    const handleConnect = () => {
        setIsConnected(true);
    };
    const sendMessage = () => {
        console.log(socket.current?.readyState);
        if (socket.current?.readyState === WebSocket.OPEN && input) {
            addMessage(`Yo: ${input}`);
            socket.current.send(input);
            setInput('');
            setCargando(true);
        }
    };

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if (!isConnected) return;

        const wsUrl = `ws://localhost:8369/api/ws/${group}?clientId=${clientId.current}`;
        socket.current = new WebSocket(wsUrl);

        console.log('Intentando conectar al WebSocket...');

        socket.current.onopen = () => {
            console.log('¡Conectado al WebSocket!');
        };

        socket.current.onmessage = (event) => {
            const message = event.data;

            if (message !== "-done-") {
                actualizaActual(message);
            } else {
                addMessage(message)
                setActualMessage("");
            }
            setCargando(false);
        };

        socket.current.onclose = () => {
            console.log('Desconectado del WebSocket.');
            setIsConnected(false);
        };

        socket.current.onerror = (error) => {
            console.error('Error en el WebSocket:', error);
        };

        return () => {
            console.log('Cerrando conexión WebSocket.');
            socket.current.close();
        };
    }, [isConnected, group]);

    return (
        <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-6">
            <div className="w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">
                <header className="p-6">
                    <h1 className="text-2xl font-semibold mb-4">Chat</h1>

                    <div className="chat-box h-96 rounded-lg p-4 overflow-y-auto flex flex-col space-y-3 border border-[var(--my-minor)]">
                        {messages.map((msg, index) => {
                            const isMe = msg.startsWith('Yo:');
                            const text = isMe ? msg.replace(/^Yo:\s?/, '') : msg;
                            return (
                                <div
                                    key={index}
                                    className={`inline-block px-4 py-2 rounded-lg break-words ${
                                        isMe
                                            ? 'bg-indigo-600 text-white self-end ml-auto shadow'
                                            : 'border-[var(--my-minor)]'
                                    }`}
                                >
                                    <p className="text-sm">{text}</p>
                                </div>
                            );
                        })}
                        {actualMessage && (
                            <div className="inline-block px-4 py-2 rounded-lg bg-green-100 text-green-600 self-start">
                                <p className="text-sm">{actualMessage}</p>
                            </div>
                        )}
                    </div>

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
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Escribe tu mensaje..."
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                    aria-label="Mensaje"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition"
                                >
                                    Enviar
                                </button>
                            </div>
                        )}
                    </div>

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
                </header>
            </div>
        </div>
    );
};