// MessageList.tsx
import React, { useEffect, useState, useRef } from 'react';

// Define a type for an individual message
type Message = {
    author: string;
    text: string | React.ReactNode; // This allows strings, JSX elements, etc.
};

// Define props for the MessageList component
interface MessageListProps {
    messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null); // Ref for the message list container
    const [showScrollDown, setShowScrollDown] = useState(false);


    const scrollToEnd = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const list = listRef.current;
        const handleScroll = () => {
            // If we're near the bottom, hide the button, otherwise show it
            if (list) {
                const isNearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 100;
                setShowScrollDown(!isNearBottom);
            }
        };

        list?.addEventListener('scroll', handleScroll);
        return () => list?.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!showScrollDown) {
            // If button is not shown, scroll to end
            scrollToEnd();
        }
    }, [messages, showScrollDown]);

    const formatMessageText = (text: string): JSX.Element => {
        return (
            <>
                {text.split('\n').map((line, index, array) => (
                    <React.Fragment key={index}>
                        {line}
                        {/* Do not render a <br/> after the last line */}
                        {index !== array.length - 1 && <br />}
                    </React.Fragment>
                ))}
            </>
        );
    };


    return (
        <>
            <div ref={listRef} className="messages-list flex flex-col space-y-4 p-6 overflow-y-auto flex-grow">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className="message flex justify-start items-start space-x-2"
                    >
                        <div className={`rounded-lg shadow-md p-3 ${message.author === 'User' ? 'bg-stone-800' : 'bg-stone-700'
                            }`}>
                            <span className="block text-sm font-bold text-white">{message.author}</span>
                            <div className="text-white text-opacity-90 break-words"> {/* Changed from <p> to <div> */}
                                {typeof message.text === 'string'
                                    ? formatMessageText(message.text) // Assuming you have a function formatMessageText
                                    : message.text}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={endOfMessagesRef} />
            </div >

            {showScrollDown && (
                <div className="fixed bottom-20 pb-4 inset-x-2 flex justify-center">
                    <button onClick={scrollToEnd} className="m-4 animate-bounce w-6 h-6 ">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </button>
                </div>
            )}
        </>
    );


};


export default MessageList;
