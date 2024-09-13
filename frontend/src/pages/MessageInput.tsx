// MessageInput.tsx
import React, { useState, KeyboardEvent } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'; // Correct import path for Heroicons v2

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    disabled: boolean; // Adding a new prop for disabling the input
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
    const [text, setText] = useState('');

    const handleSendClick = () => {
        if (!disabled) { // Only allow sending if not disabled
            onSendMessage(text);
            setText(''); // Clear input after sending
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !disabled) { // Check if disabled before sending on enter key
            handleSendClick();
        }
    };

    return (
        <div className="message-input-container relative flex items-center bg-stone-900 rounded-full">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Your message here..."
                className="w-full p-2 pl-4 pr-10 bg-stone-800 text-white rounded-full outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={disabled} // Use the disabled prop to disable the input field
            />
            <button
                onClick={handleSendClick}
                className={`absolute right-2 inset-y-0 text-white font-semibold rounded-full ${disabled ? 'bg-gray-400' : 'hover:bg-gray-600'} focus:outline-none focus:ring shadow-lg flex items-center justify-center p-2`}
                disabled={disabled} // Use the disabled prop to disable the button
            >
                <PaperAirplaneIcon className="h-5 w-5"/>
            </button>
        </div>
    );
};

export default MessageInput;
