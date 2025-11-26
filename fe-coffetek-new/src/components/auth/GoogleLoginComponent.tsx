// components/auth/GoogleLoginComponent.tsx
"use client";

import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { authService } from '@/services';
import { STORAGE_KEYS } from '@/lib/constant/storageKey.constant';
import { useAuthContext } from '@/contexts/AuthContext';

export function GoogleLoginComponent() {
    const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    const router = useRouter();
    const { setUser, setIsAuthenticated } = useAuthContext();

    const handleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            toast.error('Google login failed');
            return;
        }

        try {
            // Gọi backend với token Google
            const data = await authService.loginGoogle({ token: credentialResponse.credential });


            if (data.access_token) {
                localStorage.setItem('ACCESS_TOKEN', data.access_token);

                try {
                    const userInfo = await authService.getUserLoginInfo();
                    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
                    setUser(userInfo);
                    setIsAuthenticated(true);
                } catch {
                    console.log("Fetch user login failed");
                }

                toast.success('Login success');
                router.push('/');
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        }
    };

    const handleError = () => {
        console.log('Login Failed');
        toast.error('Google login failed');
    };

    if (!CLIENT_ID) throw new Error("Missing GOOGLE_WEB_CLIENT_ID");

    return (
        <GoogleOAuthProvider clientId={CLIENT_ID}>
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                text="signin_with"
                locale="en-US"
            />
        </GoogleOAuthProvider>
    );
}
