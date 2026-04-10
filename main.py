import ollama

class Agente:
    def __init__(self, nombre, personalidad, adn):
        self.nombre = nombre
        self.personalidad = personalidad
        self.adn = adn
        self.memoria = []  # Lista para guardar el contexto de la charla

    def generar_prompt_sistema(self):
        memoria_texto = "\n".join(self.memoria[-5:]) if self.memoria else "No hay recuerdos recientes."
        return f"""
        Eres {self.nombre}.
        Personalidad: {self.personalidad}.
        ADN (Rasgos base): {self.adn}.
        
        Reglas:
        1. Responde como el personaje, en primera persona.
        2. Sé breve, máximo 2 o 3 oraciones.
        3. Mantén el contexto de la charla.
        
        Memoria reciente:
        {memoria_texto}
        """

    def escuchar_y_responder(self, otro_agente, mensaje_entrante):
        # Guardar lo que escuchó
        self.memoria.append(f"{otro_agente.nombre} dice: {mensaje_entrante}")
        
        # Preparar los mensajes para Ollama
        mensajes = [
            {"role": "system", "content": self.generar_prompt_sistema()},
            {"role": "user", "content": f"{otro_agente.nombre} te dice: {mensaje_entrante}\n¿Qué le respondes?"}
        ]
        
        # Llamada al modelo local (asegúrate de tener 'phi3' o cambia el nombre)
        respuesta = ollama.chat(model='q352', messages=mensajes)
        texto_respuesta = respuesta['message']['content']
        
        # Guardar lo que respondió
        self.memoria.append(f"Yo respondí: {texto_respuesta}")
        return texto_respuesta

# --- Ejecución del Experimento ---
if __name__ == "__main__":
    # Creamos nuestros primeros dos habitantes
    agente_1 = Agente(
        nombre="Kael", 
        personalidad="Desconfiado, sarcástico y siempre tiene hambre.", 
        adn="Fuerza: 8, Inteligencia: 5, Carisma: 2"
    )
    
    agente_2 = Agente(
        nombre="Lyra", 
        personalidad="Extremadamente optimista, curiosa y amable.", 
        adn="Fuerza: 3, Inteligencia: 9, Carisma: 8"
    )

    print("--- Inicio de la Simulación ---")
    
    # Mensaje inicial manual para detonar la charla
    mensaje_actual = "Hola, veo que estás mirando ese árbol. ¿No te parece un día hermoso?"
    hablante_actual = agente_2
    oyente_actual = agente_1
    
    print(f"[{hablante_actual.nombre}]: {mensaje_actual}")

    # Bucle de interacción
    for i in range(4):  # 4 turnos de conversación
        respuesta = oyente_actual.escuchar_y_responder(hablante_actual, mensaje_actual)
        print(f"\n[{oyente_actual.nombre}]: {respuesta}")
        
        # Intercambiar roles
        mensaje_actual = respuesta
        temp = hablante_actual
        hablante_actual = oyente_actual
        oyente_actual = temp

    print("\n--- Fin de la Simulación ---")
