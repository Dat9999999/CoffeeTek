"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import FormContainer from "@/components/forms/FormContainer";
import FormInput from "@/components/forms/FormInput";
import FormLabel from "@/components/forms/FormLabel";
import FormButton from "@/components/forms/FormButton";
import FormError from "@/components/forms/FormError";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!email) newErrors.email = "Please enter your email";
    if (!password) newErrors.password = "Please enter your password";
    if (password && password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Sign up success:", { email, password });
    router.push("/auth/login");
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
      footer={
        <FormButton type="submit" className="w-3/4">
          Sign Up
        </FormButton>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Email */}
        <div className="grid gap-2">
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormError message={errors.email} />
        </div>

        {/* Password */}
        <div className="grid gap-2">
          <FormLabel htmlFor="password">Password</FormLabel>
          <FormInput
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormError message={errors.password} />
        </div>

        {/* Confirm Password */}
        <div className="grid gap-2">
          <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
          <FormInput
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <FormError message={errors.confirmPassword} />
        </div>
      </form>
    </FormContainer>
  );
}
