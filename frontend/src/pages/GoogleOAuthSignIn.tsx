import React, { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient'; // import supabase client

declare global {
    interface Window {
        handleSignInWithGoogle?: (response: any) => Promise<void>;
    }
}

const GoogleOAuthSignIn: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Function to handle sign in with Google
        window.handleSignInWithGoogle = async (response: any) => {

            const nonce = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');

            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
                nonce: nonce, // Use the non-hashed version here
            });

            if (error) {
                console.error('Error signing in', error);
                return;
            }

            // If sign in is successful, navigate to HomePage
            if (data) {
                navigate('/home'); // Replace '/home' with the actual path you wish to redirect to
            }            
        };

        // Append Google's JS library for OAuth
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            // Cleanup the script when component unmounts
            document.body.removeChild(script);
        };
    }, [navigate]);


    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 animate-fadeIn">
            <div className="bg-white p-1 rounded-lg shadow-lg">
                <div className="max-w-md w-full space-y-8 p-10 text-gray-900 rounded-lg transition-opacity duration-700 ease-in-out animate-fadeIn">
                    {/* SVG Logo */}
                    <div className="flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0 0 30 30">
                            <path d="M 15 2 C 11.154545 2 8 5.1545455 8 9 L 8 11 L 6 11 C 4.9 11 4 11.9 4 13 L 4 25 C 4 26.1 4.9 27 6 27 L 24 27 C 25.1 27 26 26.1 26 25 L 26 13 C 26 11.9 25.1 11 24 11 L 22 11 L 22 9 C 22 8.2047619 21.890601 7.4100849 21.648438 6.6835938 A 1.0001 1.0001 0 0 0 21.630859 6.6347656 C 20.590278 3.9754991 18.035897 2 15 2 z M 15 4 C 17.156184 4 18.991314 5.4178066 19.755859 7.3476562 C 19.908334 7.8171537 20 8.4064272 20 9 L 20 11 L 10 11 L 10 9 C 10 6.2454545 12.245455 4 15 4 z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-center text-3xl font-bold text-gray-900">
                            Manual Mastermind
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            SignIn to access the chatbot
                        </p>
                    </div>
                    <div id="buttonDiv" className="flex justify-center">
                        <div
                            id="g_id_onload"
                            data-client_id="SMTH
                            data-context="signin"
                            data-ux_mode="popup"
                            data-callback="handleSignInWithGoogle"
                            data-nonce=""
                            data-auto_select="true"
                            data-itp_support="true"
                            className="g_id_signin inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-100 transform transition duration-150 ease-in-out"
                            data-type="standard"
                            data-shape="rectangular"
                            data-theme="outline"
                            data-text="sign_in_with"
                            data-size="large"
                            data-logo_alignment="left"
                        >
                            <img src="/path-to-google-logo.svg" alt="Google logo in black color representing a 'Sign in with Google' button" className="w-5 h-5 mr-2" />
                            Sign in with Google
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );



};

export default GoogleOAuthSignIn;
