import { useRef, useEffect, useState, useMemo } from 'react';

export const SimulationMap = ({ agents, envObjects = [], chatLogs, selectedEntity, onSelectEntity, onHoverInfo, sizeX = 2000, sizeY = 2000, hoveredAgentId, biome_seeds = [], biomes_config = {} }) => {
    const canvasRef = useRef(null);
    const [zoom, setZoom] = useState(0.5);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Pre-calculate biome grid for performance (40x40 cells for 2000x2000)
    const gridSize = 50; // pixels per cell
    const biomeGrid = useMemo(() => {
        if (!biome_seeds.length) return [];
        const grid = [];
        for (let y = 0; y < sizeY; y += gridSize) {
            const row = [];
            for (let x = 0; x < sizeX; x += gridSize) {
                // Find nearest seed
                let bestDist = Infinity;
                let type = "Pradera";
                biome_seeds.forEach(seed => {
                    const d = Math.hypot(x - seed.x, y - seed.y);
                    if (d < bestDist) {
                        bestDist = d;
                        type = seed.type;
                    }
                });
                row.push(type);
            }
            grid.push(row);
        }
        return grid;
    }, [biome_seeds, sizeX, sizeY]);

    const screenToWorld = (screenX, screenY) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const x = (screenX - rect.left - offset.x) / zoom;
        const y = (screenY - rect.top - offset.y) / zoom;
        return { x, y };
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        const { x, y } = screenToWorld(e.clientX, e.clientY);
        
        // Calculate hover info
        if (onHoverInfo) {
            const info = {
                x: Math.round(x),
                y: Math.round(y),
                biome: null,
                agents: [],
                objects: []
            };

            // Biome
            const gridX = Math.floor(x / gridSize);
            const gridY = Math.floor(y / gridSize);
            if (biomeGrid[gridY] && biomeGrid[gridY][gridX]) {
                info.biome = biomeGrid[gridY][gridX];
            }

            // Agents
            for (const agent of agents) {
                const dist = Math.hypot(agent.x - x, agent.y - y);
                if (dist < 20) {
                    info.agents.push(agent.name);
                }
            }

            // Objects
            for (const obj of envObjects) {
                if (obj.width && obj.height) {
                    if (x >= obj.x - obj.width/2 && x <= obj.x + obj.width/2 && 
                        y >= obj.y - obj.height/2 && y <= obj.y + obj.height/2) {
                        info.objects.push(obj.name || obj.type);
                    }
                } else {
                    const dist = Math.hypot(obj.x - x, obj.y - y);
                    if (dist < 30) {
                        info.objects.push(obj.name || obj.type);
                    }
                }
            }
            onHoverInfo(info);
        }

        if (!isDragging) return;
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e) => {
        const dx = Math.abs(e.clientX - lastMousePos.x);
        const dy = Math.abs(e.clientY - lastMousePos.y);
        setIsDragging(false);

        if (dx < 5 && dy < 5) {
            const { x, y } = screenToWorld(e.clientX, e.clientY);
            for (const agent of agents) {
                const dist = Math.hypot(agent.x - x, agent.y - y);
                if (dist < 20) {
                    onSelectEntity({ type: 'agent', id: agent.id });
                    return;
                }
            }
            for (const obj of envObjects) {
                if (obj.width && obj.height) {
                    if (x >= obj.x - obj.width/2 && x <= obj.x + obj.width/2 && 
                        y >= obj.y - obj.height/2 && y <= obj.y + obj.height/2) {
                        onSelectEntity({ type: 'object', id: obj.id });
                        return;
                    }
                } else {
                    const dist = Math.hypot(obj.x - x, obj.y - y);
                    if (dist < 30) {
                        onSelectEntity({ type: 'object', id: obj.id });
                        return;
                    }
                }
            }
            onSelectEntity(null);
        }
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        if (onHoverInfo) onHoverInfo(null);
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const factor = Math.pow(1.1, -e.deltaY / 100);
        setZoom(prev => Math.max(0.1, Math.min(prev * factor, 3)));
    };

    useEffect(() => {
        const updateCanvasSize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth - 400;
                canvasRef.current.height = window.innerHeight - 150;
            }
        };
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        return () => window.removeEventListener('resize', updateCanvasSize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0f172a'; // Deep slate base
        ctx.fillRect(0, 0, W, H);
        
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(zoom, zoom);

        // 1. Draw Biomes Grid
        biomeGrid.forEach((row, j) => {
            row.forEach((type, i) => {
                const config = biomes_config[type] || { color: "#334155" };
                const x = i * gridSize;
                const y = j * gridSize;
                
                // Very subtle fill
                ctx.fillStyle = config.color + "15"; // Very low opacity (hex alpha)
                ctx.fillRect(x, y, gridSize, gridSize);

                // Draw Borders between different biomes
                ctx.strokeStyle = config.color + "40"; // Medium opacity for borders
                ctx.lineWidth = 2/zoom;

                // Check neighbors for border drawing
                if (i < row.length - 1 && row[i+1] !== type) {
                    ctx.beginPath(); ctx.moveTo(x + gridSize, y); ctx.lineTo(x + gridSize, y + gridSize); ctx.stroke();
                }
                if (j < biomeGrid.length - 1 && biomeGrid[j+1][i] !== type) {
                    ctx.beginPath(); ctx.moveTo(x, y + gridSize); ctx.lineTo(x + gridSize, y + gridSize); ctx.stroke();
                }
            });
        });

        // 2. Draw Subtle Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'; 
        ctx.lineWidth = 1/zoom;
        for (let x = 0; x <= sizeX; x += 100) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, sizeY); ctx.stroke();
        }
        for (let y = 0; y <= sizeY; y += 100) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(sizeX, y); ctx.stroke();
        }

        // 3. Draw EnvObjects
        envObjects.forEach(obj => {
            const isSelected = selectedEntity?.type === 'object' && selectedEntity?.id === obj.id;
            ctx.save();
            
            // Add a subtle drop shadow to make emojis pop from biomes
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            if (isSelected) {
                ctx.beginPath();
                if (obj.width && obj.height) {
                    ctx.rect(obj.x - obj.width/2 - 5, obj.y - obj.height/2 - 5, obj.width + 10, obj.height + 10);
                } else {
                    ctx.arc(obj.x, obj.y, 35, 0, Math.PI * 2);
                }
                ctx.strokeStyle = '#34d399'; 
                ctx.lineWidth = 3/zoom;
                ctx.stroke();
            }

            if (obj.width && obj.height) {
                ctx.fillStyle = obj.type === 'structure' ? '#475569' : '#1e293b';
                ctx.fillRect(obj.x - obj.width/2, obj.y - obj.height/2, obj.width, obj.height);
                ctx.font = `${Math.min(obj.width, obj.height, 40)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(obj.emoji, obj.x, obj.y);
            } else {
                // Background for resource emojis to make them pop even more
                if (obj.type === 'resource') {
                    ctx.beginPath();
                    ctx.arc(obj.x, obj.y, 20, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.lineWidth = 1/zoom;
                    ctx.stroke();
                }

                ctx.font = '40px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Draw a small white stroke around the emoji for contrast
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 2/zoom;
                ctx.strokeText(obj.emoji, obj.x, obj.y);
                
                ctx.fillText(obj.emoji, obj.x, obj.y);
            }
            ctx.restore();
        });

        // 4. Draw Agents
        agents.forEach(agent => {
            const isSelected = selectedEntity?.type === 'agent' && selectedEntity?.id === agent.id;
            const isHovered = hoveredAgentId === agent.id;
            const x = agent.x;
            const y = agent.y;

            ctx.save();
            if (isHovered && !isSelected) {
                ctx.beginPath();
                ctx.arc(x, y, 25, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.setLineDash([5, 5]);
                ctx.lineWidth = 2/zoom;
                ctx.stroke();
                ctx.setLineDash([]);
            }

            if (isSelected) {
                ctx.beginPath();
                ctx.arc(x, y, 28, 0, Math.PI * 2);
                ctx.strokeStyle = '#c084fc'; 
                ctx.lineWidth = 3/zoom;
                ctx.stroke();
            }

            let bodyColor = '#3b82f6';
            let emitColor = 'transparent';
            if (agent.status === 'talking') { bodyColor = '#f59e0b'; emitColor = 'rgba(245, 158, 11, 0.5)'; }
            else if (agent.status === 'interacting') { bodyColor = '#10b981'; emitColor = 'rgba(16, 185, 129, 0.5)'; }
            else if (agent.status === 'building') { bodyColor = '#eab308'; emitColor = 'rgba(234, 179, 8, 0.5)'; }
            else if (agent.status === 'thinking_action') { bodyColor = '#8b5cf6'; emitColor = 'rgba(139, 92, 246, 0.6)'; }

            if (emitColor !== 'transparent') {
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, Math.PI * 2);
                ctx.fillStyle = emitColor;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fillStyle = bodyColor;
            ctx.fill();
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 2/zoom;
            ctx.stroke();

            ctx.fillStyle = '#f3f4f6';
            ctx.font = `bold ${14/zoom}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(agent.name, x, y - 35);
            ctx.restore();

            if (agent.current_dialogue) {
                const text = agent.current_dialogue;
                ctx.save();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.beginPath();
                ctx.roundRect(x - 60, y - 90, 120, 45, 8);
                ctx.fill();
                ctx.fillStyle = '#1f2937';
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                const shortText = text.length > 40 ? text.substring(0, 37) + '...' : text;
                ctx.fillText(shortText, x, y - 65);
                ctx.restore();
            }
        });

        ctx.restore();
    }, [agents, envObjects, selectedEntity, hoveredAgentId, sizeX, sizeY, zoom, offset, biomeGrid, biomes_config]);

    return (
        <div className="w-full h-full overflow-hidden bg-gray-950 cursor-move relative">
            <canvas 
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onWheel={handleWheel}
                className="block"
            />
            <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-80 p-2 rounded-lg border border-gray-700 text-[10px] text-gray-400 pointer-events-none">
                Mover: Click + Arrastrar | Zoom: Rueda | Biomas Irregulares Activos
            </div>
        </div>
    );
};
