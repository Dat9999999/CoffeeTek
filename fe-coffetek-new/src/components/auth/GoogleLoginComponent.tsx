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
            toast.error('Đăng nhập Google thất bại');
            return;
        }

        try {
            // Gọi backend với token Google
            const data = await authService.loginGoogle({ token: credentialResponse.credential });

            if (data.access_token) {
                // ✅ Sử dụng STORAGE_KEYS.ACCESS_TOKEN thay vì hardcode
                localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);

                try {
                    const userInfo = await authService.getUserLoginInfo();
                    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
                    setUser(userInfo);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error("Fetch user login failed:", error);
                    toast.error('Không thể lấy thông tin người dùng');
                }

                toast.success('Đăng nhập thành công');
                router.push('/');
            } else {
                toast.error(data.message || 'Đăng nhập thất bại');
            }
        } catch (error: any) {
            console.error('Google login error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Đã xảy ra lỗi';
            toast.error(errorMessage);
        }
    };

    const handleError = () => {
        console.error('Google login failed');
        toast.error('Đăng nhập Google thất bại');
    };

    // ✅ Xử lý trường hợp không có CLIENT_ID một cách an toàn
    if (!CLIENT_ID) {
        console.error('Missing NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID environment variable');
        return (
            <div style={{ 
                padding: '12px', 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffc107',
                borderRadius: '4px',
                color: '#856404',
                textAlign: 'center'
            }}>
                Google Login không khả dụng. Vui lòng cấu hình GOOGLE_CLIENT_ID.
            </div>
        );
    }

    return (
        <GoogleOAuthProvider clientId={CLIENT_ID}>
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                text="signin_with"
                locale="vi"
            />
        </GoogleOAuthProvider>
    );
}
