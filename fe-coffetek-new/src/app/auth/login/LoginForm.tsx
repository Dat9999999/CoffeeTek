"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { API_ENDPOINTS } from "@/lib/constant/api.constant";
import { STORAGE_KEYS } from "@/lib/constant/storageKey.constant";

import FormContainer from "@/components/forms/FormContainer";
import FormInput from "@/components/forms/FormInput";
import FormButton from "@/components/forms/FormButton";
import FormError from "@/components/forms/FormError";
// import { authService } from "@/services"; // Nếu chưa dùng thì có thể comment
import { useAuthContext } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { GoogleLoginComponent } from "@/components/auth";

interface LoginErrors {
  username?: string;
  password?: string;
  general?: string;
}

// Hàm parse lỗi từ API/NestJS
function parseErrorMessage(data: any): string {
  if (!data) return "Login failed";

  if (typeof data.message === "string") return data.message;

  if (Array.isArray(data.message)) {
    const first = data.message[0];
    if (first?.constraints) {
      return Object.values(first.constraints)[0] as string;
    }
  }

  return "Login failed";
}

export default function LoginForm() {
  // Đổi tên biến state thành identifier hoặc giữ username để chung chung
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useAuthContext();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const newErrors: LoginErrors = {};

    // Cập nhật logic validate
    if (!username.trim()) newErrors.username = "Please enter your email or phone number";
    if (!password) newErrors.password = "Please enter your password";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      // (Optional) Giữ lại dòng này nếu bạn muốn test loading, nếu không nên xóa đi
      // await new Promise(resolve => setTimeout(resolve, 5000));

      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Backend cần xử lý field "username" này để tìm trong cả cột email và phone
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
        setIsAuthenticated(true);

        // Đoạn logic lấy user info (đã comment trong code gốc)
        // try {
        //   const userInfo = await authService.getUserLoginInfo();
        //   localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
        //   setUser(userInfo);
        // } catch {
        //   console.log("Fetch user login failed");
        // }

        toast.success("Login success");
        router.push("/");
      } else {
        setErrors({ general: parseErrorMessage(data) });
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrors({ general: "Something went wrong, please try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer
      title="Login to your account"
      // Cập nhật description
      description="Enter your email or phone number and password to login"
      link={
        <FormButton className="w-fit bg-lime-300" variant="link" asChild>
          <Link href="/auth/signup">Sign Up</Link>
        </FormButton>
      }
      backButton={<Link href="/"><ArrowLeftOutlined />  Back to Home</Link>}
    >

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Username Input */}
        <FormInput
          id="username"
          type="text" // Để text để nhập được cả email và số điện thoại
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          label="Email or Phone Number" // Cập nhật label
          placeholder="example@mail.com or 0901234567" // Thêm placeholder gợi ý
          required
        />
        <FormError message={errors.username} />

        {/* Password */}
        <div className="relative">
          <FormInput
            id="password"
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            label="Password"
            required
          />
          <Link
            href="/auth/forgot-password"
            className="absolute right-0 -bottom-7 text-[15px] font-medium text-gray-100 hover:text-green-400 underline underline-offset-2 transition-all"
          >
            Forgot your password?
          </Link>
        </div>
        <FormError message={errors.password} />

        {/* General errors */}
        <FormError message={errors.general} />

        {/* Submit button với loading spinner */}
        <FormButton
          type="submit"
          className="w-full mt-4 flex items-center p-1 justify-center gap-1"
          disabled={loading}
        >
          {loading && (
            <Spinner />
          )}
          {loading ? "Logging in..." : "Login"}
        </FormButton>

        <div>
          <GoogleLoginComponent />
        </div>
      </form>
    </FormContainer>
  );
}