import { localStates } from "./localStates"

export const Titulo = () => {
    const { titulo } = localStates();
    return (
        <h1>{titulo}</h1>
    )
}