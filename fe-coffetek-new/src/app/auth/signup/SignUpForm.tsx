"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { API_ENDPOINTS } from "@/lib/constant/api.constant";
import { STORAGE_KEYS } from "@/lib/constant/storageKey.constant";

import FormContainer from "@/components/forms/FormContainer";
import FormInput from "@/components/forms/FormInput";
import FormButton from "@/components/forms/FormButton";
import FormError from "@/components/forms/FormError";
import { toast } from "sonner";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { GoogleLoginComponent } from "@/components/auth";
import { authService } from "@/services";
import { useAuthContext } from "@/contexts/AuthContext";

interface SignUpErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface SignUpData {
  access_token: string;
  message: string;
}

function parseErrorMessage(data: any): string {
  if (!data) return "Login failed";

  // case message là string
  if (typeof data.message === "string") return data.message;

  // case message là mảng NestJS validation error
  if (Array.isArray(data.message)) {
    const first = data.message[0];
    if (first?.constraints) {
      return Object.values(first.constraints)[0] as string;
    }
  }

  return "Login failed";
}

export default function SignUpForm() {
  const { setUser, setIsAuthenticated } = useAuthContext();


  const [username, setUsername] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [errors, setErrors] = useState<SignUpErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: SignUpErrors = {};

    if (!username)
      newErrors.username = "Please enter your username (phone number)";
    if (!email) newErrors.email = "Please enter your email";
    if (!password) newErrors.password = "Please enter your password";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters long";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      // await new Promise(resolve => setTimeout(resolve, 5000));
      const signupRes = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          firstName,
          lastName,
          email,
          address,
        }),
      });

      const signupData: any = await signupRes.json();

      if (!signupRes.ok) {
        setErrors({ general: parseErrorMessage(signupData) });
        return;
      }

      if (signupRes.ok && signupData.access_token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, signupData.access_token);
        setIsAuthenticated(true);
        // try {
        //   const userInfo = await authService.getUserLoginInfo();
        //   localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
        //   setUser(userInfo);
        //   setIsAuthenticated(true);
        // } catch {
        //   console.log("Fetch user login failed");
        // }

        toast.success("Sign up successful! You can now explore your account.");
        router.push("/?login=success");
      } else {
        setErrors({ general: signupData.message || "Signup failed" });
      }
    } catch (err) {
      console.error("Signup error:", err);
      setErrors({ general: "Something went wrong, please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer
      title="Create a new account"
      description="Enter your details below to sign up"
      link={
        <FormButton className="w-fit bg-lime-300" variant="link" asChild>
          <Link href="/auth/login">Already have an account? Login</Link>
        </FormButton>
      }
      backButton={<Link href="/"><ArrowLeftOutlined />  Back to Home</Link>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Username */}
        <FormInput
          id="username"
          type="text"
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setUsername(e.target.value)
          }
          label="Phone Number"
          required
        />
        <FormError message={errors.username} />

        {/* Email */}
        <FormInput
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email"
          required
        />
        <FormError message={errors.email} />

        {/* First + Last Name (same row on desktop) */}
        <div className="flex flex-col md:flex-row gap-4">
          <FormInput
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            label="First Name"
            required
          />

          <FormInput
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            label="Last Name"
            required
          />
        </div>



        {/* Address */}
        <FormInput
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          label="Address"
        />

        {/* Password */}
        <FormInput
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Password"
          required
        />
        <FormError message={errors.password} />

        {/* Confirm Password */}
        <FormInput
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          label="Confirm Password"
          required
        />
        <FormError message={errors.confirmPassword} />

        {/* General Error */}
        <FormError message={errors.general} />

        {/* Submit */}
        <FormButton
          type="submit"
          className="w-full mt-4"
          disabled={loading}
        >
          {loading && (
            <svg
              className="w-5 h-5 text-white animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
              ></path>
            </svg>
          )}
          {loading ? "Signing up..." : "Sign Up"}
        </FormButton>

      </form>
    </FormContainer>
  );
}
