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

interface SignUpErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function SignUpForm() {
  const [username, setUsername] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
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

      // Gọi API signup
      const signupRes = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          firstName,
          lastName,
          email,
        }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        setErrors({ general: signupData.message || "Signup failed" });
        return;
      }

      // Đăng nhập tự động sau khi signup
      const loginRes = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok && loginData.access_token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, loginData.access_token);
        router.push("/?login=success");
      } else {
        setErrors({ general: loginData.message || "Auto login failed" });
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
        <FormButton className="w-fit bg-blue-300" variant="link" asChild>
          <Link href="/auth/login">Already have an account? Login</Link>
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

        {/* First Name */}
        <FormInput
          id="firstName"
          type="text"
          value={firstName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFirstName(e.target.value)
          }
          label="First Name"
          required
        />

        {/* Last Name */}
        <FormInput
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setLastName(e.target.value)
          }
          label="Last Name"
          required
        />

        {/* Email */}
        <FormInput
          id="email"
          type="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          label="Email"
          required
        />
        <FormError message={errors.email} />

        {/* Password */}
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
        <FormError message={errors.password} />

        {/* Confirm Password */}
        <FormInput
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value)
          }
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
          {loading ? "Signing up..." : "Sign Up"}
        </FormButton>
      </form>
    </FormContainer>
  );
}
