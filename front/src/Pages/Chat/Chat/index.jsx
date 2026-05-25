import { ViewTransition } from "react";
import { localStates, localEffects } from './localStates';
import { useChatWs } from '../../../Hooks/myHooks/useChatWs';
import { ChatMessages } from './Components/ChatMessages';
import { ChatInput } from './Components/ChatInput';
import { ChatStatus } from './Components/ChatStatus';

export const Chat = () => {
    const { style } = localStates();
    const { sendMessage } = useChatWs();
    localEffects();

    return (
        <ViewTransition default="moveRight">
            <div className="w-full h-full rounded-2xl shadow-xl overflow-hidden">
                <header className="p-6">
                    <h1 className="text-2xl font-semibold mb-4">Chat</h1>
                    <ChatMessages />
                    <ChatInput sendMessage={sendMessage} />
                    <ChatStatus />
                </header>
            </div>
        </ViewTransition>
    );
};
