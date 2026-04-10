import React, { useState } from 'react';

export const AgentDashboard = ({ agent, envObject, chatLogs, allAgents = [], onSelectAgent, onHoverAgent }) => {
    const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'logs'
    const [filters, setFilters] = useState({
        action: true,
        build: true,
        birth: true,
        death: true,
        dialogue: true,
        thinking: true,
        knowledge: true
    });

    const formatGameTime = (ticks) => {
        if (ticks === undefined) return "";
        const totalSeconds = Math.floor(ticks / 20);
        const days = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `Día ${days}, ${seconds}s`;
    };

    const toggleFilter = (type) => {
        setFilters(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const setAllFilters = (val) => {
        const newFilters = {};
        Object.keys(filters).forEach(k => newFilters[k] = val);
        setFilters(newFilters);
    };

    const invertFilters = () => {
        const newFilters = {};
        Object.keys(filters).forEach(k => newFilters[k] = !filters[k]);
        setFilters(newFilters);
    };

    const filterLabels = {
        action: { label: "Acciones", color: "bg-green-500" },
        build: { label: "Construcción", color: "bg-cyan-500" },
        birth: { label: "Nacimientos", color: "bg-blue-500" },
        death: { label: "Muertes", color: "bg-red-500" },
        dialogue: { label: "Diálogos", color: "bg-indigo-500" },
        thinking: { label: "Pensamientos", color: "bg-gray-500" },
        knowledge: { label: "Aprendizaje", color: "bg-amber-500" }
    };
    
    if (envObject) {
        return (
            <div className="h-full flex flex-col p-6 overflow-hidden">
                <div className="mb-6 border-b border-gray-700 pb-4 text-center">
                    <div className="text-6xl mb-2">{envObject.emoji}</div>
                    <h2 className="text-2xl font-extrabold bg-gradient-to-br from-green-300 to-emerald-400 bg-clip-text text-transparent mb-1">
                        {envObject.name}
                    </h2>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                        {envObject.type} Object
                    </p>
                </div>
                <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                    {envObject.metadata?.content && (
                        <div className="bg-amber-900 bg-opacity-20 p-4 rounded-xl border border-amber-700 border-opacity-30">
                            <h3 className="text-xs text-amber-500 uppercase font-bold tracking-widest mb-3">Escrito</h3>
                            <p className="text-sm text-amber-200 italic leading-relaxed">
                                "{envObject.metadata.content}"
                            </p>
                            <p className="text-right text-[10px] text-amber-600 mt-2">— {envObject.metadata.author}</p>
                        </div>
                    )}
                    <div className="bg-gray-700 bg-opacity-30 p-4 rounded-xl shadow-inner border border-gray-700">
                        <h3 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">Interaction History</h3>
                        <ul className="space-y-2">
                            {(envObject.history || []).length === 0 ? (
                                <p className="text-xs text-gray-500 italic">No interactions yet.</p>
                            ) : (
                                envObject.history.slice().reverse().map((log, i) => (
                                    <li key={i} className="text-sm pl-3 border-l-2 text-gray-300 border-emerald-500">
                                        {log}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6 overflow-hidden">
            <div className="mb-6 border-b border-gray-700 pb-4">
                <h2 className="text-3xl font-extrabold bg-gradient-to-br from-indigo-300 to-purple-400 bg-clip-text text-transparent mb-1">
                    {agent ? agent.name : (viewMode === 'overview' ? "Población" : "System Log")}
                </h2>
                <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold">
                    {agent ? `Gen ${agent.generation} | Age ${agent.age} | FT ${agent.fitness}` : (viewMode === 'overview' ? `${allAgents.length} agentes vivos` : "Live Events")}
                </p>
                {agent && (
                    <p className="text-xs text-indigo-400 font-bold mt-1">
                        {agent.status} | Bioma: {agent.biome} | Energy: {agent.energy.toFixed(0)}%
                    </p>
                )}
                
                {!agent && !envObject && (
                    <div className="flex space-x-2 mt-4">
                        <button 
                            onClick={() => setViewMode('overview')}
                            className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${viewMode === 'overview' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'}`}
                        >
                            VISTA GENERAL
                        </button>
                        <button 
                            onClick={() => setViewMode('logs')}
                            className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${viewMode === 'logs' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'}`}
                        >
                            LOGS GLOBALES
                        </button>
                    </div>
                )}
                
                {!agent && !envObject && viewMode === 'logs' && (
                    <div className="mt-4">
                        <div className="flex space-x-2 mb-3">
                            <button onClick={() => setAllFilters(true)} className="text-[9px] bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded font-bold uppercase">Todos</button>
                            <button onClick={() => setAllFilters(false)} className="text-[9px] bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded font-bold uppercase">Ninguno</button>
                            <button onClick={invertFilters} className="text-[9px] bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded font-bold uppercase">Invertir</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(filterLabels).map(([type, { label, color }]) => (
                                <label key={type} className={`flex items-center space-x-2 px-2 py-1 rounded-md text-[10px] cursor-pointer transition-colors ${filters[type] ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-500'}`}>
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={filters[type]} 
                                        onChange={() => toggleFilter(type)} 
                                    />
                                    <div className={`w-2 h-2 rounded-full ${filters[type] ? color : 'bg-gray-600'}`}></div>
                                    <span className="font-bold uppercase tracking-tighter">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {agent ? (
                    <div className="space-y-6">
                        {/* Needs */}
                        <div className="bg-gray-700 bg-opacity-30 p-4 rounded-xl shadow-inner border border-gray-700">
                            <h3 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">Survival Needs</h3>
                            <div className="space-y-3">
                                {Object.entries(agent.needs || {}).map(([k, v]) => (
                                    <div key={k} className="relative">
                                        <div className="flex justify-between text-[10px] mb-1">
                                            <span className="text-gray-400 capitalize">{k}</span>
                                            <span className={`${v < 20 ? 'text-red-400' : 'text-gray-500'}`}>{v.toFixed(0)}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${v < 20 ? 'bg-red-500' : (v < 50 ? 'bg-yellow-500' : 'bg-green-500')}`}
                                                style={{ width: `${v}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* DNA */}
                        <div className="bg-gray-700 bg-opacity-30 p-4 rounded-xl shadow-inner border border-gray-700">
                            <h3 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">DNA Traits</h3>
                            <div className="space-y-3">
                                {Object.entries(agent.dna || {}).map(([k, v]) => (
                                    <div key={k} className="relative">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-300 capitalize">{k.replace('_', ' ')}</span>
                                            <span className="text-gray-400">{(v * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                                                style={{ width: `${v * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Inventory */}
                        <div className="bg-gray-700 bg-opacity-30 p-4 rounded-xl shadow-inner border border-gray-700">
                            <h3 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">Inventory</h3>
                            <div className="grid grid-cols-5 gap-2 text-center">
                                <div className="bg-gray-800 p-1.5 rounded border border-gray-600">
                                    <span className="text-lg">🪵</span>
                                    <p className="text-[10px] font-bold text-gray-300 mt-1">{agent.inventory?.wood || 0}</p>
                                </div>
                                <div className="bg-gray-800 p-1.5 rounded border border-gray-600">
                                    <span className="text-lg">🍎</span>
                                    <p className="text-[10px] font-bold text-gray-300 mt-1">{agent.inventory?.food || 0}</p>
                                </div>
                                <div className="bg-gray-800 p-1.5 rounded border border-gray-600">
                                    <span className="text-lg">🪨</span>
                                    <p className="text-[10px] font-bold text-gray-300 mt-1">{agent.inventory?.stone || 0}</p>
                                </div>
                                <div className="bg-gray-800 p-1.5 rounded border border-gray-600">
                                    <span className="text-lg">⛓️</span>
                                    <p className="text-[10px] font-bold text-gray-300 mt-1">{agent.inventory?.iron || 0}</p>
                                </div>
                                <div className="bg-gray-800 p-1.5 rounded border border-gray-600">
                                    <span className="text-lg">🪙</span>
                                    <p className="text-[10px] font-bold text-gray-300 mt-1">{agent.inventory?.gold || 0}</p>
                                </div>
                                <div className="bg-gray-800 p-1.5 rounded border border-gray-600">
                                    <span className="text-lg">💧</span>
                                    <p className="text-[10px] font-bold text-gray-300 mt-1">{agent.inventory?.resin || 0}</p>
                                </div>
                                <div className="bg-gray-800 p-1.5 rounded border border-gray-600">
                                    <span className="text-lg">🌱</span>
                                    <p className="text-[10px] font-bold text-gray-300 mt-1">{agent.inventory?.seed || 0}</p>
                                </div>
                                <div className="bg-gray-800 p-1.5 rounded border border-gray-600">
                                    <span className="text-lg">🏺</span>
                                    <p className="text-[10px] font-bold text-gray-300 mt-1">{agent.inventory?.clay || 0}</p>
                                </div>
                                <div className="bg-gray-800 p-1.5 rounded border border-gray-600">
                                    <span className="text-lg">💎</span>
                                    <p className="text-[10px] font-bold text-gray-300 mt-1">{agent.inventory?.gemstone || 0}</p>
                                </div>
                                <div className="bg-gray-800 p-1.5 rounded border border-gray-600">
                                    <span className="text-lg">✨</span>
                                    <p className="text-[10px] font-bold text-gray-300 mt-1">{agent.inventory?.mana || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tools & Knowledge */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-700 bg-opacity-30 p-4 rounded-xl shadow-inner border border-gray-700">
                                <h3 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">Herramientas</h3>
                                <div className="flex flex-wrap gap-1">
                                    {(agent.tools || []).length === 0 ? (
                                        <span className="text-[10px] text-gray-500 italic">Ninguna</span>
                                    ) : (
                                        agent.tools.map((t, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-blue-900 bg-opacity-30 text-blue-300 border border-blue-500 border-opacity-30 rounded text-[10px]">
                                                {t}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-700 bg-opacity-30 p-4 rounded-xl shadow-inner border border-gray-700">
                                <h3 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">Recetas</h3>
                                <div className="flex flex-wrap gap-1">
                                    {(agent.discovered_recipes || []).length === 0 ? (
                                        <span className="text-[10px] text-gray-500 italic">Ninguna</span>
                                    ) : (
                                        agent.discovered_recipes.map((r, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-amber-900 bg-opacity-30 text-amber-300 border border-amber-500 border-opacity-30 rounded text-[10px]">
                                                {r}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Personality */}
                        <div className="bg-gray-700 bg-opacity-30 p-4 rounded-xl shadow-inner border border-gray-700">
                            <h3 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">Current Personality</h3>
                            <div className="flex flex-wrap gap-2">
                                {agent.personality?.map((p, i) => (
                                    <span key={i} className="px-3 py-1 bg-purple-500 bg-opacity-20 text-purple-300 rounded-full text-xs font-medium border border-purple-500 border-opacity-50">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Memories */}
                        <div className="bg-gray-700 bg-opacity-30 p-4 rounded-xl shadow-inner border border-gray-700">
                            <h3 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">Recent Memories</h3>
                            <ul className="space-y-2">
                                {(agent.memories || []).length === 0 ? (
                                    <p className="text-xs text-gray-500 italic">No memories yet.</p>
                                ) : (
                                    agent.memories.slice().reverse().map((mem, i) => (
                                        <li key={i} className={`text-sm pl-3 border-l-2 ${mem.type === 'action' ? 'text-gray-400 border-green-500 italic' : (mem.type === 'knowledge' ? 'text-amber-300 border-amber-500' : 'text-gray-300 border-indigo-500')}`}>
                                            {mem.text}
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        {viewMode === 'overview' ? (
                            <div className="space-y-3">
                                {allAgents.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic text-center mt-10">No hay sobrevivientes...</p>
                                ) : (
                                    allAgents.map((a, i) => (
                                        <div 
                                            key={a.id} 
                                            onClick={() => onSelectAgent(a.id)}
                                            onMouseEnter={() => onHoverAgent(a.id)}
                                            onMouseLeave={() => onHoverAgent(null)}
                                            className="bg-gray-800 bg-opacity-40 p-3 rounded-xl border border-gray-700 shadow-sm hover:border-indigo-500 cursor-pointer transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="text-sm font-bold text-indigo-300">{a.name}</h4>
                                                    <p className="text-[10px] text-gray-500 uppercase font-semibold">G{a.generation} · {a.age} años · {a.status} · {a.biome}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-[10px] font-bold ${a.energy > 30 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {a.energy.toFixed(0)}% EN
                                                    </span>
                                                    <div className="h-1 w-12 bg-gray-900 rounded-full mt-1 overflow-hidden">
                                                        <div 
                                                            className={`h-full ${a.energy > 30 ? 'bg-green-500' : 'bg-red-500'}`} 
                                                            style={{ width: `${a.energy}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-2">
                                                {Object.entries(a.needs || {}).map(([k, v]) => (
                                                    <div key={k} className="flex flex-col">
                                                        <div className="flex justify-between text-[8px] mb-0.5">
                                                            <span className="text-gray-500 uppercase">{k}</span>
                                                            <span className={v < 20 ? 'text-red-400' : 'text-gray-400'}>{v.toFixed(0)}%</span>
                                                        </div>
                                                        <div className="h-0.5 w-full bg-gray-900 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full ${v < 20 ? 'bg-red-500' : (v < 50 ? 'bg-yellow-500' : 'bg-green-500')}`}
                                                                style={{ width: `${v}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="flex gap-2 items-center text-[10px] text-gray-400">
                                                <div className="flex items-center space-x-1">
                                                    <span>🪵</span><span>{a.inventory.wood}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <span>🍎</span><span>{a.inventory.food}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <span>🪨</span><span>{a.inventory.stone}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 border-l border-gray-700 pl-2">
                                                    <span>🛠️</span><span>{a.tools.length}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col-reverse space-y-4">
                                {chatLogs.filter(log => filters[log.type] || (log.a && filters.dialogue)).length === 0 ? (
                                    <p className="text-sm text-gray-500 italic text-center mt-10">Waiting for events...</p>
                                ) : (
                                    chatLogs.filter(log => filters[log.type] || (log.a && filters.dialogue)).slice().reverse().map((log, i) => {
                                        const timeStr = log.time !== undefined ? formatGameTime(log.time) : "";
                                        
                                        if (log.type === "action") {
                                            return (
                                                <div key={i} className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm border-l-4 border-l-green-500">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="text-xs text-green-400 font-bold">{log.agent}</p>
                                                        <span className="text-[9px] text-gray-600">{timeStr}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-400 italic">{log.text}</p>
                                                </div>
                                            );
                                        }
                                        if (log.type === "birth") {
                                            return (
                                                <div key={i} className="bg-blue-900 bg-opacity-20 p-3 rounded-lg border border-blue-700 shadow-sm border-l-4 border-l-blue-500">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="text-xs text-blue-400 font-bold">🐣 {log.agent}</p>
                                                        <span className="text-[9px] text-blue-800">{timeStr}</span>
                                                    </div>
                                                    <p className="text-sm text-blue-100">{log.text}</p>
                                                </div>
                                            );
                                        }
                                        if (log.type === "death") {
                                            return (
                                                <div key={i} className="bg-red-900 bg-opacity-20 p-3 rounded-lg border border-red-700 shadow-sm border-l-4 border-l-red-500">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="text-xs text-red-400 font-bold">💀 {log.agent}</p>
                                                        <span className="text-[9px] text-red-800">{timeStr}</span>
                                                    </div>
                                                    <p className="text-sm text-red-100">{log.text}</p>
                                                </div>
                                            );
                                        }
                                        if (log.type === "knowledge") {
                                            return (
                                                <div key={i} className="bg-amber-900 bg-opacity-20 p-3 rounded-lg border border-amber-700 shadow-sm border-l-4 border-l-amber-500">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="text-xs text-amber-400 font-bold">📜 {log.agent}</p>
                                                        <span className="text-[9px] text-amber-800">{timeStr}</span>
                                                    </div>
                                                    <p className="text-sm text-amber-100">{log.text}</p>
                                                </div>
                                            );
                                        }
                                        if (log.type === "build") {
                                            return (
                                                <div key={i} className="bg-cyan-900 bg-opacity-20 p-3 rounded-lg border border-cyan-700 shadow-sm border-l-4 border-l-cyan-500">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="text-xs text-cyan-400 font-bold">🏗️ {log.agent}</p>
                                                        <span className="text-[9px] text-cyan-800">{timeStr}</span>
                                                    </div>
                                                    <p className="text-sm text-cyan-100">{log.text}</p>
                                                </div>
                                            );
                                        }
                                        if (log.type === "thinking") {
                                            return (
                                                <div key={i} className="bg-gray-900 bg-opacity-50 p-3 rounded-lg border border-gray-800 shadow-sm border-l-4 border-l-gray-500">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="text-xs text-gray-400 font-bold">🧠 {log.agent} pensando...</p>
                                                        <span className="text-[9px] text-gray-700">{timeStr}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 italic whitespace-pre-wrap">{log.text}</p>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={i} className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm border-l-4 border-l-indigo-500">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-xs text-indigo-400 font-bold">{log.a} → {log.b}</p>
                                                    <span className="text-[9px] text-gray-600">{timeStr}</span>
                                                </div>
                                                <p className="text-sm text-gray-200">"{log.text}"</p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
