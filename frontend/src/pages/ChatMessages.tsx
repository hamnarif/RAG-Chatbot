import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import axios from 'axios';
import { supabase } from '../utils/supabaseClient'; // import supabase client

type Message = {
    author: string;
    text: string | React.ReactNode; // Allowing JSX for Typewriter effect
};

interface ChatMessagesProps {
    userName: string;
    startNewChat: boolean;
    resetStartNewChat: () => void;
    onTitleGenerated: (title: string) => void;
    activeSessionId: string; // Updated type here
}

const useTypewriter = (text: string, speed = 100) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        if (!text) return;

        let index = 0;
        const intervalId = setInterval(() => {
            setDisplayedText((oldText) => oldText + text.charAt(index));
            index++;
            if (index === text.length) {
                clearInterval(intervalId);
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed]);

    return displayedText;
};

const TypewriterMessage = ({ text }: { text: string }) => {
    const displayedText = useTypewriter(text, 50);
    return <>{displayedText}</>;
};

const ChatMessages: React.FC<ChatMessagesProps> = ({
    userName,
    startNewChat,
    resetStartNewChat,
    onTitleGenerated,
    activeSessionId, // This is now a prop, but we'll use a hardcoded ID for testing
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isFirstMessage, setIsFirstMessage] = useState(true);
    const [messageQueue, setMessageQueue] = useState<{ userInput: string; botMessage: string }[]>([]); // Queue for messages waiting for an active session ID
    const initialMessagesLoadedRef = useRef(false);
    const [isBotThinking, setIsBotThinking] = useState(false);
    const firstUserInputRef = useRef<string | null>(null); // Use a ref to store the first user input
    const [chatTitle, setChatTitle] = useState<string>("New Chat"); // State to hold chat title
    const prevSessionIdRef = useRef(activeSessionId);


    // Effect for handling new chat initiation
    useEffect(() => {
        console.log('New chat started');
        if (startNewChat) {
            resetForNewChat();
            resetStartNewChat();
        }
    }, [startNewChat, resetStartNewChat]);

    // Effect for loading messages once when the active session ID is set
    useEffect(() => {
        console.log('Active session ID set:', activeSessionId);
        if (activeSessionId && !initialMessagesLoadedRef.current) {
            loadMessages(activeSessionId);
        }
    }, [activeSessionId]);

    // Effect for processing the message queue when the active session ID is updated and valid
    useEffect(() => {
        console.log('Session ID or message queue changed');
        if (activeSessionId && messageQueue.length > 0) {
            processMessageQueue();
        }
    }, [activeSessionId, messageQueue]);


    useEffect(() => {
        console.log('Checking for activeSessionId change to process and display first user input');
        if (activeSessionId !== prevSessionIdRef.current && firstUserInputRef.current) {
            console.log('Active session ID changed, processing and displaying first user input');
            // Display the first user input by updating the messages state
            // setMessages(currentMessages => [...currentMessages, { author: userName, text: firstUserInputRef.current }]);
            // Optionally, process this input as needed, e.g., fetch and display bot response
            // processSubsequentMessages(firstUserInputRef.current);
            processAndDisplayFirstMessage(firstUserInputRef.current);

            firstUserInputRef.current = null; // Clear the stored first input after processing
        }
        // Update the previous session ID ref to the current session ID at the end of the effect
        prevSessionIdRef.current = activeSessionId;
    }, [activeSessionId]); // Ensure dependencies are correctly listed


    const processAndDisplayFirstMessage = async (userInput: string) => {
        // Assuming this function is responsible for generating the response and updating the UI immediately
        const botResponse = await generateBotResponse(userInput); 
        await storeMessage(userInput, botResponse);

        setMessages([
            { author: userName, text: userInput },
            { author: 'Chatbot', text: <TypewriterMessage text={botResponse} /> }
        ]);
    };

    const processMessageQueue = async () => {
        // Process each message in the queue now that we have the correct activeSessionId
        for (const message of messageQueue) {
            await storeMessage(message.userInput, message.botMessage);
        }
        setMessageQueue([]); // Clear the queue after processing
    };


    const sendMessage = async (userInput: string) => {
        // console.log('Active Session ID:', activeSessionId);
        console.log('Sending message:', userInput);
        if (!userInput.trim()) return;
        try {

            if (isFirstMessage) {
                console.log('Processing first message');

                setIsFirstMessage(false); // Mark that the first message is being processed
                firstUserInputRef.current = userInput;
                const title = await generateChatTitle(userInput); // Generate title based on the first message
                console.log('Generated chat title:', title);

                setChatTitle(title);
                onTitleGenerated(title);
            } else {
                console.log('Processing subsequent message');

                await processSubsequentMessages(userInput);
            }
        } catch (error) {
            console.error("Error in sendMessage:", error);
        }
    };


    const processSubsequentMessages = async (userInput: string) => {
        console.log('Processing subsequent messages');
        updateMessages(userInput, null);
        const botMessage = await generateBotResponse(userInput);
        updateMessages(userInput, botMessage);
        if (!activeSessionId) {
            console.log('Queueing message due to no active session ID');
            queueMessage(userInput, botMessage);
            return;
        }
        console.log('Storing message in Supabase');
        await storeMessage(userInput, botMessage);
    };

    const generateChatTitle = async (userInput: string) => {
        try {
            const response = await axios.post('http://localhost:8000/process_user_input_for_title/', {
                user_input: userInput
            });
            return response.data && response.data.title ? response.data.title : "New Chat";
        } catch (error) {
            console.error('There was a problem generating the chat title:', error);
            return "New Chat"; // Default title on error
        }
    };


    const generateBotResponse = async (userInput: string) => {
        try {
            const response = await axios.post('http://localhost:8000/process_user_input/', { user_input: userInput });
            return response.data.answer;
        } catch (error) {
            console.error('There was a problem generating bot response:', error);
            return "There was an error processing your message."; // Default message on error
        }
    };

    const updateMessages = (userInput: string, botMessage: string | null) => {
        // Add the user's message immediately
        // const newMessages: Message[] = [{ author: userName, text: userInput }];

        // If botMessage is null, it indicates the bot's response is pending
        if (botMessage !== null) {
            setMessages(prev => {
                const newMessages = [...prev];
                // Assume the last message is the spinner
                newMessages[newMessages.length - 1] = { author: 'Chatbot', text: <TypewriterMessage text={botMessage} /> };
                return newMessages;
            });
            setIsBotThinking(false);

        } else {
            // Bot's response is pending, add a spinner as the placeholder
            setMessages(prev => [...prev, { author: userName, text: userInput }]);
            setMessages(prev => [
                ...prev,
                {
                    author: 'Chatbot', text:
                        <div className="flex justify-center items-center h-10 w-full">
                            <svg className="w-4 h-4 text-gray-300 animate-spin" viewBox="0 0 64 64" fill="none"
                                xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                                <path
                                    d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                                    stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
                                <path
                                    d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                                    stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
                                </path>
                            </svg>
                        </div>
                }
            ]); setIsBotThinking(true); // Show spinner while bot's response is pending

        }
    };


    const queueMessage = (userInput: string, botMessage: string) => {
        setMessageQueue(prevQueue => [...prevQueue, { userInput, botMessage }]);
    };



    // This new function handles storing messages in Supabase
    const storeMessage = async (userInput: string, botMessage: string) => {
        const { data, error } = await supabase
            .from('messages')
            .insert([
                { chat_id: activeSessionId, question: userInput, response: botMessage },
            ]);

        if (error) {
            console.error('Error storing the message in Supabase:', error);
        } else {
            console.log('Stored the message in Supabase:', data);
        }
    };

    const resetForNewChat = () => {
        setMessages([]);
        setIsFirstMessage(true);
        initialMessagesLoadedRef.current = false; // Allow messages to be loaded for a new session
    };


    // Function to load existing messages for a chat session
    const loadMessages = async (sessionId: string) => {
        // console.log('Attempting to load messages for session:', sessionId);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', sessionId)
                .order('timestamp', { ascending: true });

            if (error) {
                throw error;
            }

            // Transform the data into the format expected by MessageList
            const loadedMessages = data.map(dbMessage => {
                // Assuming 'question' field is always from the user
                const userMessage = {
                    author: userName,
                    text: dbMessage.question
                };
                // Assuming 'response' field is always from the chatbot
                const botMessage = {
                    author: 'Chatbot',
                    text: dbMessage.response
                };
                return [userMessage, botMessage];
            }).flat(); // Flatten the array of pairs into a single array

            setMessages(loadedMessages);
            setIsFirstMessage(false); // Set this to false since we've loaded previous messages
            initialMessagesLoadedRef.current = false;
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };


    return (
        <div className="flex flex-col h-full">
            <MessageList messages={messages} />
            <MessageInput onSendMessage={sendMessage} disabled={isBotThinking} />
            <p className="text-white text-center text-xs uppercase mt-4">
                Use uppercase for acronyms</p>
        </div>
    );
};

export default ChatMessages;