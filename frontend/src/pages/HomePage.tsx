import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatMessages from './ChatMessages'; // Import ChatMessages component
import { XCircleIcon, Bars3Icon } from '@heroicons/react/24/outline'; // Correct import path for Heroicons v2
import { supabase } from '../utils/supabaseClient'; // import supabase client
import DeleteModal from './DeleteModal';

interface ChatSession {
    id: string;
    title: string;
    latestMessageTimestamp: string | null;
    active?: boolean;
}

type Employee = {
    employee_id: number;
    full_name: string;
    official_email: string;
    id: string; // Assuming UUID is treated as a string in TypeScript
    whatsapp_no: string;
};


const HomePage = () => {
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [startNewChat, setStartNewChat] = useState(false);
    const [generatedTitle, setGeneratedTitle] = useState('');
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sessionIdToDelete, setSessionIdToDelete] = useState<string | null>(null);
    const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    // Place this function call where it best fits within your component's lifecycle or event handling logic


    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Callback to handle the new title from ChatMessages
    const handleTitleGenerated = (title: string) => {

        setGeneratedTitle(title); // Set the generated title in state
        console.log(title)
        createNewChatSession(title); // Create a new chat session in Supabase
    };

    // // Function to display the title in the sidebar
    // const displayTitleInSidebar = (title: string) => {
    //     const newChatSession: ChatSession = { id: Date.now().toString(), title };
    //     setChatSessions(prevSessions => [...prevSessions, newChatSession]);
    // };

    // Function to create a new chat session in Supabase
    const createNewChatSession = async (title: string) => {
        const { data: session, error: sessionError } = await supabase.auth.getUser();
        if (sessionError) {
            console.error('Error fetching session:', sessionError.message);
            return;
        }

        const user_id = session?.user?.id;
        if (!user_id) {
            console.error('No user found in session.');
            return;
        }

        try {
            const { error: insertError } = await supabase
                .from('chats')
                .insert([{ title, user_id }]);

            if (insertError) throw insertError;

            // After successfully inserting a new chat session, fetch the latest session ID for the user
            const { data: latestSession, error: fetchError } = await supabase
                .from('chats')
                .select('id')
                .eq('user_id', user_id)
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError) throw fetchError;

            // Assuming the fetch was successful and data is returned
            if (latestSession && latestSession.length > 0) {
                // console.log('Latest chat session ID:', latestSession[0].id);
                const newActiveSID = latestSession[0].id;
                // Here you update the activeSessionId with the latest session ID
                setActiveSessionId(newActiveSID);
                // console.log('New chat session created, ID:', newActiveSID);
                console.log('New chat session created, ID:');

            }
        } catch (error) {
            console.error('Error in session creation or fetching the latest session:', error);
        }
    };


    useEffect(() => {
        const fetchUserData = async () => {
            // Using supabase.auth.getUser() to fetch the current user's details
            const { data: session, error } = await supabase.auth.getUser();

            if (error) {
                console.error('Error fetching user data:', error.message);
                return;
            }

            if (session?.user) {
                // Use user details here
                const displayName = session.user.user_metadata?.full_name || 'User';
                setUserName(displayName);

            } else {
                navigate('/signin');
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error.message);
        } else {
            navigate('/signin');
        }
    };

    const handleNewChat = () => {
        setStartNewChat(true);
    };


    const fetchChatSessions = async () => {
        const { data: session, error: sessionError } = await supabase.auth.getUser();

        if (sessionError) {
            console.error('Error fetching session:', sessionError.message);
            return;
        }

        const user_id = session?.user?.id;
        if (!user_id) {
            console.error('No user found in session.');
            return;
        }

        try {
            // Perform a query to get chats joined with the latest message timestamp for each chat
            const { data: chatSessionsData, error: chatsError } = await supabase
                .from('chats')
                .select('id, title, user_id, created_at, messages:id (timestamp)')
                .eq('user_id', user_id)
                .order('created_at', { ascending: false });

            if (chatsError) throw chatsError;

            // Now we process the results to include the latest message timestamp
            const chatSessionsWithLatestTimestamp = chatSessionsData.map((chatSession) => {
                const latestMessageTimestamp = chatSession.messages
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.timestamp;

                return {
                    ...chatSession,
                    latestMessageTimestamp,
                };
            });

            // Sort the chat sessions based on the latest message timestamp
            const sortedChatSessions = chatSessionsWithLatestTimestamp.sort((a, b) =>
                new Date(b.latestMessageTimestamp).getTime() - new Date(a.latestMessageTimestamp).getTime()
            );

            // Update the state with the sorted chat sessions
            setChatSessions(sortedChatSessions);
        } catch (error) {
            console.error('Error fetching chat sessions:', error);
        }
    };


    // Rerun when the activeSessionId changes
    useEffect(() => {
        fetchChatSessions();
    }, [activeSessionId]);


    const handleDeleteClick = (sessionId: string) => {
        setSessionIdToDelete(sessionId);
        setShowDeleteModal(true);
    };


    const handleConfirmDelete = async () => {
        if (sessionIdToDelete) {
            try {
                const { error } = await supabase
                    .from('chats')
                    .delete()
                    .match({ id: sessionIdToDelete });

                if (error) throw error;

                // Filter out the deleted session from the state
                setChatSessions((currentSessions) =>
                    currentSessions.filter((session) => session.id !== sessionIdToDelete)
                );

                console.log('Chat session deleted successfully.');
            } catch (error) {
                console.error('Error deleting chat session:', error);
            } finally {
                // Hide modal and reset deletion state
                setShowDeleteModal(false);
                setSessionIdToDelete(null);
            }
        }
    };

    const handleEditTitle = (session: ChatSession) => {
        setEditingSessionId(session.id);
        setEditTitle(session.title);
    };

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditTitle(event.target.value);
    };
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, sessionId: string) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleTitleUpdate(sessionId);
        }
    };


    const handleTitleUpdate = async (sessionId: string) => {
        if (!editTitle.trim()) {
            console.log('The title cannot be empty.');
            setEditTitle(generatedTitle); // Reset title to the last saved state
            setEditingSessionId(null); // Exit edit mode
            return;
        }

        try {
            const { error } = await supabase
                .from('chats')
                .update({ title: editTitle })
                .eq('id', sessionId);

            if (error) throw error;

            console.log(`Title updated to: ${editTitle}`);

            // Update the title in the local state
            setChatSessions((prevSessions) =>
                prevSessions.map((session) =>
                    session.id === sessionId ? { ...session, title: editTitle } : session
                )
            );

            // Exit editing mode
            setEditingSessionId(null);
            setGeneratedTitle(editTitle); // Update the generated title state
        } catch (error) {
            console.error('Error updating the chat title:', error);
        }
    };



    return (
        <>

            <DeleteModal
                showModal={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
            />
            <div className="flex h-screen bg-stone-900 text-white">
                {/* Sidebar */}

                {/* Mobile toggle button, fixed on mobile screens */}
                <button
                    className="p-4  text-white md:hidden fixed z-30" // make sure it's fixed and has a higher z-index
                    onClick={handleToggleSidebar}
                >
                    {isSidebarOpen ? <XCircleIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </button>


                <div className={`w-1/4 flex flex-col justify-between bg-neutral-950 p-4 md:flex fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out z-20`}>
                    <button className="mb-4 text-sm md:text-base bg-neutral-950 hover:bg-stone-800 text-white py-2 px-4 font-normal hover:underline rounded inline-flex items-center"
                        onClick={handleNewChat}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                            <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                        </svg>

                        New Chat
                    </button>

                    <div className="flex-grow overflow-y-auto">
                        {chatSessions.map((session) => (
                            <div
                                key={session.id}
                                className="py-2 px-2 md:px-4 my-2 flex justify-between items-center bg-stone-900 rounded cursor-pointer"
                                onMouseEnter={() => setHoveredSessionId(session.id)}
                                onMouseLeave={() => setHoveredSessionId(null)}
                                onClick={() => setActiveSessionId(session.id)}
                            >
                                {editingSessionId === session.id ? (
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={handleTitleChange}
                                        onKeyDown={(e) => handleKeyDown(e, session.id)}
                                        onBlur={() => handleTitleUpdate(session.id)}
                                        className="text-sm md:text-base bg-transparent outline-none text-white"
                                        autoFocus
                                    />
                                ) : (
                                    <span className={`text-sm md:text-base ${session.id === activeSessionId ? 'text-white' : 'text-gray-400'}`}>
                                        {session.title}
                                    </span>
                                )}
                                {hoveredSessionId === session.id && (
                                    <div className="flex space-x-2">
                                        {/* Edit SVG icons */}
                                        <svg
                                            onClick={() => handleEditTitle(session)}
                                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                                            <path fillRule="evenodd" d="M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L6.226 12.25a2.751 2.751 0 0 1-.892.596l-2.047.848a.75.75 0 0 1-.98-.98l.848-2.047a2.75 2.75 0 0 1 .596-.892l7.262-7.261Z" clipRule="evenodd" />
                                        </svg>
                                        {/* Delete SVG icons*/}
                                        <svg
                                            onClick={() => handleDeleteClick(session.id)}

                                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                                            <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                                        </svg>

                                    </div>
                                )}
                            </div>
                        ))}
                    </div>


                    <div className="mt-auto">
                        <h1 className="text-base tracking-widest mb-4">Welcome, {userName || 'Guest'}!</h1>
                        <button onClick={handleLogout} className="text-base font-semibold  py-1 bg-red-600 hover:bg-red-700 rounded w-full">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="w-full md:w-3/4 flex flex-col p-4 h-screen md:ml-auto">
                    <div className="flex justify-center items-center p-4 bg-stone-900">
                        <h2 className="text-2xl p-32 text-white font-bold">
                            Chat with Manual for development projects 2021 🇵🇰🐪
                        </h2>
                    </div>


                    <div className="flex-grow overflow-y-auto">
                        <ChatMessages
                            userName={userName || 'Guest'}
                            startNewChat={startNewChat}
                            resetStartNewChat={() => setStartNewChat(false)}
                            onTitleGenerated={handleTitleGenerated}
                            activeSessionId={activeSessionId ?? ''}
                        />
                    </div>
                </div>
            </div>
        </>

    );
};

export default HomePage;