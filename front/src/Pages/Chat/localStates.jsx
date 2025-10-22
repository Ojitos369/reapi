import { createState } from "../../Hooks/useStates";
import style from './styles/index.module.scss';


export const localStates = props => {
    const [titulo, setTitulo] = createState(['page', 'title'], "");
    const [actualPage, setActualPage] = createState(['page', 'actual'], "");
    


    return { 
        style,
        titulo, setTitulo,
        actualPage, setActualPage
    }
}
