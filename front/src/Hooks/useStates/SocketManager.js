// En un nuevo archivo, ej: src/Hooks/SocketManager.js

import { 
    createContext, 
    useContext, 
    useRef, 
    useEffect, 
    useMemo 
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
// Importamos las ACCIONES de Redux directamente desde el slice
import { f as ff, lf } from './fs'; 

// 1. Creamos un contexto solo para el socket
const SocketContext = createContext(null);

// 2. Creamos el Provider que GESTIONA la conexión
export const SocketProvider = ({ children }) => {
    const socket = useRef(null);
    const clientId = useRef(Date.now());

    // 3. Leemos el estado de Redux
    const s = useSelector(state => state.fs.s);
    const dispatch = useDispatch();

    // Obtenemos los valores del estado de forma segura
    const isConnected = useMemo(() => s.chat?.connected, [s.chat?.connected]);
    const group = useMemo(() => s.chat?.group, [s.chat?.group]);
    const actualMessage = useMemo(() => s.chat?.actualMessage, [s.chat?.actualMessage]);

    // 4. El useEffect "cerebro" que maneja la conexión
    useEffect(() => {
        if (!isConnected || !group) {
            // Si no debemos estar conectados, nos aseguramos de cerrar
            if (socket.current?.readyState === WebSocket.OPEN) {
                console.log('Cerrando conexión WebSocket (por estado).');
                socket.current.close();
            }
            return;
        }

        // --- Lógica de Conexión ---
        const wsUrl = `ws://localhost:8369/api/ws/${group}?clientId=${clientId.current}`;
        socket.current = new WebSocket(wsUrl);
        console.log('Intentando conectar al WebSocket (desde SocketManager)...');

        socket.current.onopen = () => {
            console.log('¡Conectado al WebSocket!');
            // ¡Actualizamos el estado de Redux!
            dispatch(ff.u2('chat', 'connected', true));
        };

        socket.current.onmessage = (event) => {
            const message = event.data;

            if (message !== "-done-") {
                // Actualizamos el 'actualMessage' en Redux
                dispatch(ff.u2('chat', 'actualMessage', actualMessage + message));
            } else {
                // Mensaje completado, movemos 'actualMessage' a 'messages'
                // (Necesitamos leer 's' de nuevo o usar un thunk, pero así funciona)
                const currentMessages = s.chat?.messages || [];
                dispatch(ff.u2('chat', 'messages', [...currentMessages, actualMessage]));
                dispatch(ff.u2('chat', 'actualMessage', ""));
            }
            dispatch(ff.u2('chat', 'cargando', false));
        };

        socket.current.onclose = () => {
            console.log('Desconectado del WebSocket.');
            dispatch(ff.u2('chat', 'connected', false));
        };

        socket.current.onerror = (error) => {
            console.error('Error en el WebSocket:', error);
            dispatch(ff.u2('chat', 'connected', false));
        };
        
        // Función de limpieza
        return () => {
            if (socket.current) {
                console.log('Cerrando conexión WebSocket (limpieza de efecto).');
                socket.current.close();
            }
        };
        // Este efecto depende del estado de Redux
    }, [isConnected, group, dispatch, s.chat?.messages, actualMessage]); // Agregamos 's' para que los callbacks tengan los valores frescos

    // 5. Proveemos SOLO la ref del socket a los hijos
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

// 6. Hook para que otros lo consuman
export const useSocket = () => useContext(SocketContext);