import { createState } from "../../Hooks/useStates";
import style from './styles/index.module.scss';


export const localStates = props => {
    const [titulo, setTitulo] = createState(['page', 'title'], "");
    const [actualPage, setActualPage] = createState(['page', 'actual'], "");
    const [messages, setMessages] = createState(['chat', 'messages'], []);
    const [actualMessage, setActualMessage] = createState(['chat', 'actualMessage'],"");
    const [input, setInput] = createState(['chat', 'input'],'');
    const [group, setGroup] = createState(['chat', 'group'],'gen');
    const [isConnected, setIsConnected] = createState(['chat', 'connected'],false);
    const [cargando, setCargando] = createState(['chat', 'cargando'],false);

    const init = () => {
        setTitulo("chat");
        setActualPage("chat");
    }

    const addMessage = () => {
        setMessages([...messages, actualMessage]);
    }

    const actualizaActual = message => {
        setActualMessage(actualMessage + message);
    }


    return { 
        style,
        init,
        actualPage, setActualPage,
        messages, addMessage, 
        actualMessage, actualizaActual, setActualMessage, 
        input, setInput, 
        group, setGroup, 
        isConnected, setIsConnected, 
        cargando, setCargando, 
    }
}
