"use client";

import { useState } from "react";
import FormContainer from "@/components/forms/FormContainer";
import FormInput from "@/components/forms/FormInput";
import FormButton from "@/components/forms/FormButton";
import FormError from "@/components/forms/FormError";
import BackButton from "@/components/commons/BackButton";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Gửi OTP
  const handleSendOtp = async (e: any) => {
    e.preventDefault();
    if (!email) return setError("Vui lòng nhập email.");
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forget-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Không thể gửi OTP. Vui lòng kiểm tra lại email.");
      setSuccess("OTP đã được gửi tới email của bạn!");
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Xác thực OTP
  const handleVerifyOtp = (e: any) => {
    e.preventDefault();
    if (!otp) return setError("Vui lòng nhập mã OTP.");
    setError("");
    setSuccess("Mã OTP hợp lệ! Hãy đặt mật khẩu mới.");
    setStep(3);
  };

  // Đặt lại mật khẩu
  const handleResetPassword = async (e: any) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword)
      return setError("Vui lòng nhập đầy đủ thông tin.");
    if (newPassword !== confirmPassword)
      return setError("Mật khẩu nhập lại không khớp.");

    setError("");
    setSuccess("");

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

      if (!res.ok) throw new Error("Không thể đặt lại mật khẩu. OTP có thể sai hoặc đã hết hạn.");
      setSuccess("Mật khẩu của bạn đã được đặt lại thành công!");
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <FormContainer
      title="Forgot Password"
      description={
        step === 1
          ? "Nhập email của bạn để nhận mã OTP đặt lại mật khẩu."
          : step === 2
            ? "Nhập mã OTP đã được gửi tới email của bạn."
            : "Nhập mật khẩu mới để hoàn tất đặt lại."
      }
    >
      <form
        onSubmit={
          step === 1 ? handleSendOtp : step === 2 ? handleVerifyOtp : handleResetPassword
        }
        className="flex flex-col gap-4"
      >

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

        {step === 2 && (
          <FormInput
            id="otp"
            type="text"
            value={otp}
            onChange={(e: any) => setOtp(e.target.value)}
            label="OTP"
            required
          />
        )}

        {step === 3 && (
          <>
            <FormInput
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e: any) => setNewPassword(e.target.value)}
              label="Mật khẩu mới"
              required
            />

            <FormInput
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e: any) => setConfirmPassword(e.target.value)}
              label="Xác nhận mật khẩu mới"
              required
            />
          </>
        )}

        {error && <FormError message={error} />}
        {success && <p className="text-green-600 text-sm text-center">{success}</p>}

        <FormButton type="submit" variant="default">
          {step === 1
            ? "Gửi OTP"
            : step === 2
              ? "Xác nhận OTP"
              : "Đặt lại mật khẩu"}
        </FormButton>
      </form>
    </FormContainer>
  );
}
