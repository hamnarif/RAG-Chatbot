
import { supabase } from '../utils/supabaseClient'; // import supabase client

const startNewChat = async () => {
    // Fetch the current user's session
    const { data: session, error: sessionError } = await supabase.auth.getUser();
    if (sessionError) {
        console.error('Error fetching session:', sessionError.message);
        return;
    }

    // Extract user ID from session if session is not null
    const user = session?.user; // Optional chaining to handle null session

    if (!user) {
        console.error('No user found in session.');
        return;
    }

    // Access user ID
    const userId = user.id;
    console.log('User ID:', userId);

    // Continue with other operations...
};
