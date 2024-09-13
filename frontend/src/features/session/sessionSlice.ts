// src/features/session/sessionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Session } from '@supabase/supabase-js';

// Define the initial state using the `Session` type
interface SessionState {
    value: Session | null;
}

const initialState: SessionState = {
    value: null,
};

export const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setSession: (state, action: PayloadAction<Session | null>) => {
            state.value = action.payload;
        },
    },
});

// Export the actions
export const { setSession } = sessionSlice.actions;

// Export the reducer as a default export
export default sessionSlice.reducer;
