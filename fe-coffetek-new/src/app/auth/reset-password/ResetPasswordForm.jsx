"use client";

import { useState } from "react";
import FormContainer from "@/components/forms/FormContainer";
import FormInput from "@/components/forms/FormInput";
import FormLabel from "@/components/forms/FormLabel";
import FormButton from "@/components/forms/FormButton";
import FormError from "@/components/forms/FormError";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill in all required information.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");

    console.log("Reset password to:", password);
  };

  return (
    <FormContainer
      title="Reset Password"
      description="Enter a new password for your account."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <FormLabel htmlFor="password">New Password</FormLabel>
          <FormInput
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
          <FormInput
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <FormError message={error} />
        </div>

        <FormButton type="submit" variant="default">
          Reset Password
        </FormButton>
      </form>
    </FormContainer>
  );
}
