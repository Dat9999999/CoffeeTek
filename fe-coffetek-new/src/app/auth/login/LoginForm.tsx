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

interface LoginErrors {
  username?: string;
  password?: string;
  general?: string;
}

export default function LoginForm() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const newErrors: LoginErrors = {};

    if (!username) newErrors.username = "Please enter your phone number";
    if (!password) newErrors.password = "Please enter your password";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters long";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (response.ok) {
          if (data.access_token) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
            console.log("Access token saved:", data.access_token);
          } else {
            console.warn("No access token returned from API.");
          }

          router.push("/?login=success");
        } else {
          setErrors({ general: data.message || "Login failed" });
        }
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        setErrors({ general: "Server did not return JSON. Check API URL." });
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
      description="Enter your phone number and password to login"
      link={
        <FormButton className="w-fit bg-lime-300" variant="link" asChild>
          <Link href="/auth/signup">Sign Up</Link>
        </FormButton>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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

        {/* Password */}
        <div className="relative">
          <FormInput
            id="password"
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
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

        {/* General error */}
        <FormError message={errors.general} />

        {/* Submit */}
        <FormButton
          type="submit"
          className="w-full mt-4"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </FormButton>
      </form>
    </FormContainer>
  );
}
