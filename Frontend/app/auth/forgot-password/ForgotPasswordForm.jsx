"use client";

import { useState } from "react";
import FormContainer from "@/components/forms/FormContainer";
import FormInput from "@/components/forms/FormInput";
import FormLabel from "@/components/forms/FormLabel";
import FormButton from "@/components/forms/FormButton";
import FormError from "@/components/forms/FormError";
import BackButton from "@/components/common/BackButton";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }
    setError("");

    // TODO: Gọi API gửi email reset password
    console.log("Send reset link to:", email);
  };

  return (
    <FormContainer
      title="Forgot Password"
      description="Nhập email của bạn để nhận liên kết đặt lại mật khẩu."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <div>
            <BackButton label="Back to login" href="/auth/login" />
          </div>
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <FormError message={error} />
        </div>

        <FormButton type="submit" variant="default">
          Submit
        </FormButton>
      </form>
    </FormContainer>
  );
}
