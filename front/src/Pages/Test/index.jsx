import { useState, useEffect, useRef } from 'react';

export const Test = () => {
    const [messages, setMessages] = useState([]);
    const [actualMessage, setActualMessage] = useState("");
    const [input, setInput] = useState('');
    const [group, setGroup] = useState('gen'); // Nombre del grupo
    const [isConnected, setIsConnected] = useState(false);
    
    const socket = useRef(null);
    const clientId = useRef(Date.now());

    // Este useEffect ahora maneja la conexión y el procesamiento de mensajes.
    useEffect(() => {
        // Si no estamos intentando conectar, no hacemos nada.
        if (!isConnected) return;

        const wsUrl = `ws://localhost:8369/api/ws/${group}/${clientId.current}`;
        socket.current = new WebSocket(wsUrl);

        console.log('Intentando conectar al WebSocket...');

        socket.current.onopen = () => {
            console.log('¡Conectado al WebSocket!');
        };

        socket.current.onmessage = (event) => {
            const message = event.data;

            if (message !== "-done-") {
                // ✅ LA SOLUCIÓN CLAVE ESTÁ AQUÍ
                // Usamos la forma funcional para asegurar que siempre usamos el estado más reciente.
                setActualMessage(prevActualMessage => prevActualMessage + message);
            } else {
                // Cuando llega "-done-", guardamos el mensaje completo y reseteamos el actual.
                setActualMessage(prevActualMessage => {
                    setMessages(prevMessages => [...prevMessages, prevActualMessage]);
                    return ""; // Reseteamos el mensaje actual
                });
            }
        };

        socket.current.onclose = () => {
            console.log('Desconectado del WebSocket.');
            setIsConnected(false);
        };

        socket.current.onerror = (error) => {
            console.error('Error en el WebSocket:', error);
        };

        // Función de limpieza para desconectar el socket
        return () => {
            console.log('Cerrando conexión WebSocket.');
            socket.current.close();
        };
    }, [isConnected, group]); // Se ejecuta cuando cambia el estado de conexión o el grupo

    const handleConnect = () => {
        setIsConnected(true);
    };

    const sendMessage = () => {
        if (socket.current?.readyState === WebSocket.OPEN && input) {
            setMessages(prev => [...prev, `Yo: ${input}`]); // Opcional: muestra tu propio mensaje inmediatamente
            socket.current.send(input);
            setInput('');
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Chat con LLM en Streaming</h1>
                <div className="chat-box">
                    {messages.map((msg, index) => (
                        <p key={index}>{msg}</p>
                    ))}
                    {actualMessage && <p>{actualMessage}</p>}
                </div>

                {!isConnected && 
                    <div className="input-area">
                        <input
                            type="text"
                            value={group}
                            onChange={(e) => setGroup(e.target.value)}
                        />
                        <button onClick={handleConnect}>Conectar</button>
                    </div>
                }
                <br /><br />
                {isConnected &&
                    <div className="input-area">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button onClick={sendMessage}>Enviar</button>
                    </div>
                }
            </header>
        </div>
    );
};