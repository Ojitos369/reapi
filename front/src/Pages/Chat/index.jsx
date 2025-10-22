import { localStates } from "./localStates";
import { useEffect, useRef } from 'react';
import { createState } from "../../Hooks/useStates";

import { Titulo } from "./Titulo";

export const Chat = () => {
    const { setTitulo, setActualPage } = localStates();

    const [messages, setMessages] = createState(['chat', 'messages'], []);
    const [actualMessage, setActualMessage] = createState(['chat', 'actualMessage'],"");
    const [input, setInput] = createState(['chat', 'input'],'');
    const [group, setGroup] = createState(['chat', 'group'],'gen');
    const [isConnected, setIsConnected] = createState(['chat', 'connected'],false);
    const [cargando, setCargando] = createState(['chat', 'cargando'],false);
    const socket = useRef(null);
    const clientId = useRef(Date.now());

    const init = () => {
        setTitulo("chat");
        setActualPage("chat");
    }

    const handleConnect = () => {
        setIsConnected(true);
    };
    const sendMessage = () => {
        console.log(socket.current?.readyState);
        if (socket.current?.readyState === WebSocket.OPEN && input) {
            setMessages(prev => [...prev, `Yo: ${input}`]);
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
                setActualMessage(actualMessage + message);
            } else {
                // setActualMessage(prevActualMessage => {
                //     setMessages(prevMessages => [...prevMessages, prevActualMessage]);
                //     return "";
                // });
                setMessages([...messages, actualMessage])
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
        <div className="App">
            <header className="App-header">
                <Titulo />
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
                {cargando && <p>Cargando...</p>}
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