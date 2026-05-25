import { localStates } from '../localStates';

export const ChatMessages = () => {
    const { messages, actualMessage } = localStates();

    return (
        <div className="chat-box h-full rounded-lg p-4 overflow-y-auto flex flex-col space-y-3 border border-[var(--my-minor)]">
            {messages.map((msg, index) => {
                const isMe = msg.startsWith('Yo:');
                const text = isMe ? msg.replace(/^Yo:\s?/, '') : msg;
                return (
                    <div
                        key={index}
                        className={`inline-block px-4 py-2 rounded-lg break-words ${
                            isMe
                                ? 'bg-indigo-600 text-white self-end ml-auto shadow'
                                : 'bg-green-400 text-black border-[var(--my-minor)]'
                        }`}
                    >
                        <p className="text-sm">{text}</p>
                    </div>
                );
            })}
            {actualMessage && (
                <div className="inline-block px-4 py-2 rounded-lg bg-green-100 text-green-900 self-start">
                    <p className="text-sm">{actualMessage}</p>
                </div>
            )}
        </div>
    );
};
