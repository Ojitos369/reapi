import { localStates } from "./localStates";
import { useEffect, useRef } from 'react';
import { createState } from "../../Hooks/useStates";

import { Titulo } from "./Titulo";

export const Chat = () => {
    const { style, setTitulo, setActualPage } = localStates();

    const [messages, setMessages] = createState(['chat', 'messages'], []);
    const [actualMessage, setActualMessage] = createState(['chat', 'actualMessage'], "");
    const [input, setInput] = createState(['chat', 'input'], '');
    const [group, setGroup] = createState(['chat', 'group'], 'gen');
    const [isConnected, setIsConnected] = createState(['chat', 'connected'], false);
    const [cargando, setCargando] = createState(['chat', 'cargando'], false);
    const socket = useRef(null);
    const clientId = useRef(Date.now());

    const init = () => {
        setTitulo("chat");
        setActualPage("chat");
    };

    const handleConnect = () => {
        setIsConnected(true);
    };
    const sendMessage = () => {
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

        socket.current.onopen = () => {
            console.log('¡Conectado al WebSocket!');
        };

        socket.current.onmessage = (event) => {
            const message = event.data;
            if (message !== "-done-") {
                setActualMessage(actualMessage + message);
            } else {
                setMessages([...messages, actualMessage]);
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
            socket.current.close();
        };
    }, [isConnected, group]);

    return (
        <div className={`${style.chatPage}`}>
            <div className={`${style.chatHeader}`}>
                <Titulo />
                <span className={`${style.status} ${isConnected ? style.statusOn : style.statusOff}`}>
                    {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
            </div>

            <div className={`${style.chatBox}`}>
                {messages.length === 0 && !actualMessage &&
                    <p className={`${style.empty}`}>No hay mensajes todavía.</p>}
                {messages.map((msg, index) => (
                    <p key={index} className={`${style.message}`}>{msg}</p>
                ))}
                {actualMessage && <p className={`${style.message} ${style.streaming}`}>{actualMessage}</p>}
                {cargando && <p className={`${style.loading}`}>Cargando…</p>}
            </div>

            {!isConnected &&
                <div className={`${style.inputArea}`}>
                    <input
                        className={`${style.input}`}
                        type="text"
                        placeholder="Grupo"
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                    />
                    <button className={`${style.btn} ${style.btnPrimary}`} onClick={handleConnect}>
                        Conectar
                    </button>
                </div>}

            {isConnected &&
                <div className={`${style.inputArea}`}>
                    <input
                        className={`${style.input}`}
                        type="text"
                        placeholder="Escribe un mensaje…"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button className={`${style.btn} ${style.btnPrimary}`} onClick={sendMessage}>
                        Enviar
                    </button>
                </div>}
        </div>
    );
};
