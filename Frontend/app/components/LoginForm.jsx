"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { API_ENDPOINTS } from "@/lib/constant/api.constant";
import { STORAGE_KEYS } from "@/lib/constant/storageKey.constant";

import FormContainer from "./forms/FormContainer";
import FormInput from "./forms/FormInput";
import FormLabel from "./forms/FormLabel";
import FormButton from "./forms/FormButton";
import FormError from "./forms/FormError";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!email) {
      newErrors.email = "Please enter your email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Invalid email format";
      }
    }

    if (!password) {
      newErrors.password = "Please enter your password";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
        router.push("/");
      } else {
        setErrors({ general: data.message || "Login failed" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrors({ general: "Something went wrong, please try again" });
    }
  };

  return (
    <FormContainer
      title="Login to your account"
      description="Enter your email below to login to your account"
      link={
        <FormButton className="w-fit bg-lime-300" variant="link" asChild>
          <Link href="/auth/signup">Sign Up</Link>
        </FormButton>
      }
      footer={
        <>
          <FormButton type="submit" className="w-3/4">
            Login
          </FormButton>
          <FormButton type="button" variant="outline" className="w-3/4">
            Login with Google
          </FormButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-2">
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormError message={errors.email} />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center">
            <FormLabel htmlFor="password">Password</FormLabel>
            <a
              href="#"
              className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <FormInput
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormError message={errors.password} />
        </div>

        <FormError message={errors.general} />
      </form>
    </FormContainer>
  );
}
