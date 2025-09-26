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
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    setError("");

    // TODO: Gọi API reset password
    console.log("Reset password to:", password);
  };

  return (
    <FormContainer
      title="Đặt lại mật khẩu"
      description="Nhập mật khẩu mới cho tài khoản của bạn."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <FormLabel htmlFor="password">Mật khẩu mới</FormLabel>
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
          <FormLabel htmlFor="confirmPassword">Xác nhận mật khẩu</FormLabel>
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
          Đặt lại mật khẩu
        </FormButton>
      </form>
    </FormContainer>
  );
}
