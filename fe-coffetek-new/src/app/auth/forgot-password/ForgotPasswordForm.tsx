"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import router
import { toast } from "sonner"; // Import toast (hoặc thư viện bạn đang dùng)
import FormContainer from "@/components/forms/FormContainer";
import FormInput from "@/components/forms/FormInput";
import FormButton from "@/components/forms/FormButton";
import FormError from "@/components/forms/FormError";

export default function ForgotPasswordForm() {
  const router = useRouter(); // Khởi tạo router
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Step 1: Send OTP
  const handleSendOtp = async (e: any) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email.");
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forget-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Unable to send OTP. Please check your email.");

      toast.success((await res.json()).message || "OTP sent to your email.");
      setStep(2); // Move to merged Step 2
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Step 2: Verify OTP & Reset Password (Merged)
  const handleResetPassword = async (e: any) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword)
      return setError("Please fill in all fields.");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match.");

    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      });

      if (!res.ok) throw new Error("Failed to reset password. Invalid OTP or expired.");

      // Success logic
      toast.success("Password reset successfully!");
      router.push("/"); // Redirect to home
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <FormContainer
      title="Forgot Password"
      description={
        step === 1
          ? "Enter your email to receive a password reset OTP."
          : "Enter the OTP sent to your email and set a new password."
      }
    >
      <form
        onSubmit={step === 1 ? handleSendOtp : handleResetPassword}
        className="flex flex-col gap-4"
      >
        {/* STEP 1: Email Input */}
        {step === 1 && (
          <FormInput
            id="email"
            type="email"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            label="Email"
            required
          />
        )}

        {/* STEP 2: OTP + New Password + Confirm Password */}
        {step === 2 && (
          <>
            <FormInput
              id="otp"
              type="text"
              value={otp}
              onChange={(e: any) => setOtp(e.target.value)}
              label="OTP Code"
              required
            />

            <FormInput
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e: any) => setNewPassword(e.target.value)}
              label="New Password"
              required
            />

            <FormInput
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e: any) => setConfirmPassword(e.target.value)}
              label="Confirm New Password"
              required
            />
          </>
        )}

        {error && <FormError message={error} />}

        <FormButton type="submit" variant="default">
          {step === 1 ? "Send OTP" : "Reset Password"}
        </FormButton>
      </form>
    </FormContainer>
  );
}