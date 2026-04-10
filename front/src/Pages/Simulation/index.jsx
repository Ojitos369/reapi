import { useEffect, useState, useRef } from 'react';
import { SimulationMap } from '../../Components/Simulation/SimulationMap';
import { AgentDashboard } from '../../Components/Simulation/AgentDashboard';

export const Simulation = () => {
    const [worldState, setWorldState] = useState({ 
        agents: [], 
        chat_logs: [], 
        env_objects: [], 
        game_time: 0,
        size_x: 2000,
        size_y: 2000,
        time_scale: 1.0,
        is_running: false
    });
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [hoveredAgentId, setHoveredAgentId] = useState(null);
    const [hoveredInfo, setHoveredInfo] = useState(null);
    const wsRef = useRef(null);

    const formatGameTime = (ticks) => {
        if (ticks === undefined) return "";
        const totalSeconds = Math.floor(ticks / 20);
        const days = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `Día ${days}, ${seconds}s`;
    };

    const sendCommand = (cmd, val = null) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ command: cmd, value: val }));
        }
    };

    useEffect(() => {
        const connectWs = () => {
            const wsUrl = `ws://localhost:8369/api/ws/simulation`;
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => console.log('Simulation WS connected');
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setWorldState(prev => {
                        const newLogs = data.chat_logs || [];
                        const mergedLogs = [...prev.chat_logs];
                        
                        newLogs.forEach(nLog => {
                            const exists = mergedLogs.some(mLog => 
                                mLog.time === nLog.time && 
                                mLog.text === nLog.text && 
                                mLog.agent === nLog.agent
                            );
                            if (!exists) mergedLogs.push(nLog);
                        });

                        const limitedLogs = mergedLogs.slice(-100);

                        return {
                            ...data,
                            chat_logs: limitedLogs
                        };
                    });
                } catch (e) {
                    console.error('Error parsing WS data:', e);
                }
            };
            ws.onerror = (e) => console.error('WS Error', e);
            ws.onclose = () => {
                console.log('WS Closed, retrying in 2s...');
                setTimeout(connectWs, 2000);
            };
            wsRef.current = ws;
        };
        connectWs();

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    let selectedAgent = null;
    let selectedObject = null;
    if (selectedEntity?.type === 'agent') {
        selectedAgent = worldState.agents?.find(a => a.id === selectedEntity.id);
    } else if (selectedEntity?.type === 'object') {
        selectedObject = worldState.env_objects?.find(o => o.id === selectedEntity.id);
    }

    return (
        <div className="w-screen h-screen flex bg-gray-900 text-white font-sans overflow-hidden">
            {/* Main view for the canvas */}
            <div className="flex-1 relative flex flex-col p-4 overflow-hidden">
                <header className="z-10 p-4 bg-gray-800 bg-opacity-70 backdrop-blur rounded-2xl shadow-lg border border-gray-700 flex justify-between items-center mb-4">
                    <div className="flex-shrink-0">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            AI Civilization
                        </h1>
                        <div className="flex items-center mt-1">
                            <p className="text-xs text-gray-300">Ollama Powered Models</p>
                            <p className="text-xs font-mono text-indigo-400 font-bold ml-4">
                                {formatGameTime(worldState.game_time)}
                            </p>
                        </div>
                    </div>

                    {/* Hover Info Section */}
                    <div className="flex-1 px-8 flex justify-center pointer-events-none">
                        {hoveredInfo && (
                            <div className="flex space-x-6 text-[11px] font-mono bg-gray-900 bg-opacity-50 px-4 py-2 rounded-xl border border-gray-700">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 uppercase text-[9px]">Posición</span>
                                    <span className="text-blue-300">{hoveredInfo.x}, {hoveredInfo.y}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 uppercase text-[9px]">Bioma</span>
                                    <span className="text-green-400">{hoveredInfo.biome || 'N/A'}</span>
                                </div>
                                {hoveredInfo.objects.length > 0 && (
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 uppercase text-[9px]">Objetos</span>
                                        <span className="text-amber-400">{hoveredInfo.objects.join(', ')}</span>
                                    </div>
                                )}
                                {hoveredInfo.agents.length > 0 && (
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 uppercase text-[9px]">Personajes</span>
                                        <span className="text-purple-400">{hoveredInfo.agents.join(', ')}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4 flex-shrink-0">
                        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                            <button 
                                onClick={() => sendCommand(worldState.is_running ? 'PAUSE' : 'RESUME')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${worldState.is_running ? 'bg-amber-600 text-white' : 'bg-green-600 text-white'}`}
                            >
                                {worldState.is_running ? 'PAUSAR' : 'REANUDAR'}
                            </button>
                        </div>
                        
                        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700 space-x-1">
                            {[0.5, 1, 2, 5, 10].map(speed => (
                                <button
                                    key={speed}
                                    onClick={() => sendCommand('SPEED', speed)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold ${worldState.time_scale === speed ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => {
                                if(confirm("¿Seguro que quieres reiniciar el mundo? Se borrarán todos los agentes y la historia.")) {
                                    sendCommand('RESET');
                                    setWorldState(prev => ({...prev, chat_logs: []}));
                                }
                            }}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-lg transition-all"
                        >
                            REINICIAR MUNDO
                        </button>
                    </div>
                </header>
                
                <div className="flex-1 relative bg-gray-950 rounded-2xl border-2 border-gray-800 overflow-auto custom-scrollbar">
                    <SimulationMap 
                        agents={worldState.agents} 
                        envObjects={worldState.env_objects}
                        chatLogs={worldState.chat_logs}
                        selectedEntity={selectedEntity}
                        onSelectEntity={setSelectedEntity}
                        onHoverInfo={setHoveredInfo}
                        sizeX={worldState.size_x}
                        sizeY={worldState.size_y}
                        hoveredAgentId={hoveredAgentId}
                        biome_seeds={worldState.biome_seeds}
                        biomes_config={worldState.biomes_config}
                    />
                </div>
            </div>

            {/* Sidebar dashboard */}
            <div className="w-96 border-l border-gray-700 bg-gray-800 bg-opacity-80 backdrop-blur shadow-2xl z-20 flex flex-col">
                <AgentDashboard 
                    agent={selectedAgent} 
                    envObject={selectedObject}
                    chatLogs={worldState.chat_logs} 
                    allAgents={worldState.agents}
                    onSelectAgent={(id) => setSelectedEntity({ type: 'agent', id })}
                    onHoverAgent={setHoveredAgentId}
                />
            </div>
        </div>
    );
};
