import uuid
import random
from typing import List, Dict, Any

class Agent:
    def __init__(self, name: str, x: float, y: float, dna: Dict[str, float] = None, generation: int = 0):
        self.id = str(uuid.uuid4())
        self.name = name
        self.x = x
        self.y = y
        self.dest_x = x
        self.dest_y = y
        self.speed = random.uniform(0.5, 2.0)
        
        # Evolutionary DNA
        self.dna = dna or {
            "sociability": random.uniform(0, 1),
            "energy_loss_rate": random.uniform(0.01, 0.05),
            "aggressiveness": random.uniform(0, 1),
            "work_ethic": random.uniform(0, 1),
            "curiosity": random.uniform(0, 1),
            "strength": random.uniform(0.5, 2.0),
            "libido": random.uniform(0, 1),
            "cognitive_level": random.uniform(0, 0.1), # Starts very low
        }
        
        self.personality = self._generate_personality()
        self.memories = [] 
        self.inventory = {"wood": 0, "food": 0, "stone": 0, "iron": 0, "gold": 0, "resin": 0, "seed": 0, "clay": 0, "gemstone": 0, "mana": 0}
        self.tools = [] 
        self.status = "idle" 
        
        # Knowledge and Discovery
        self.discovered_recipes = [] 
        self.xp = 0
        self.level = 1
        self.needs = {
            "hunger": 100.0,  # 100 is full, 0 is starving
            "thirst": 100.0,  # 100 is full, 0 is dehydrated
            "social": 100.0,  # 100 is full, 0 is lonely
            "rest": 100.0     # 100 is full, 0 is exhausted
        }
        
        self.energy = 100.0
        self.age = 0
        self.max_age = random.randint(5000, 10000) # ticks
        self.generation = generation
        self.fitness = 0
        self.writings = [] # Knowledge passed down
        self.talking_to = None
        self.current_dialogue = None
    
    def _generate_personality(self):
        traits = ["friendly", "grumpy", "inquisitive", "philosophical", "paranoid", "optimistic", "pessimistic", "sarcastic", "naive", "wise"]
        return random.sample(traits, 2)
        
    def add_memory(self, type: str, text: str):
        self.memories.append({"type": type, "text": text})
        if len(self.memories) > 20:
            self.memories.pop(0)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "x": self.x,
            "y": self.y,
            "speed": self.speed,
            "dna": self.dna,
            "personality": self.personality,
            "status": self.status,
            "memories": self.memories,
            "inventory": self.inventory,
            "tools": self.tools,
            "discovered_recipes": self.discovered_recipes,
            "energy": self.energy,
            "needs": self.needs,
            "age": self.age,
            "max_age": self.max_age,
            "generation": self.generation,
            "fitness": self.fitness,
            "xp": self.xp,
            "level": self.level,
            "biome": getattr(self, "biome", "Desconocido"),
            "current_dialogue": self.current_dialogue
        }

    def mutate(self):
        new_dna = self.dna.copy()
        for key in new_dna:
            if random.random() < 0.1: # 10% mutation chance per gene
                new_dna[key] += random.uniform(-0.1, 0.1)
                limit = 2.0 if key in ["strength", "cognitive_level"] else 1.0
                new_dna[key] = max(0, min(limit, new_dna[key]))
        return new_dna

    def gain_xp(self, amount):
        self.xp += amount
        if self.xp >= self.level * 100:
            self.xp -= self.level * 100
            self.level += 1
            # Leveling up can increase cognitive level slightly
            self.dna["cognitive_level"] += 0.05
            return True
        return False
