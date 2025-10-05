"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import FormContainer from "@/components/forms/FormContainer";
import FormInput from "@/components/forms/FormInput";
import FormLabel from "@/components/forms/FormLabel";
import FormButton from "@/components/forms/FormButton";
import FormError from "@/components/forms/FormError";
import { STORAGE_KEYS } from "@/lib/constant/storageKey.constant";
import { API_ENDPOINTS } from "@/lib/constant/api.constant";

export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        throw new Error("No access token found. Please log in again.");
      }

      const res = await fetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const contentType = res.headers.get("content-type");
      const data =
        contentType && contentType.includes("application/json")
          ? await res.json()
          : await res.text();

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }

        const errorMessage =
          typeof data === "string"
            ? data
            : (data.message as string) || "Change password failed";

        throw new Error(errorMessage);
      }

      setSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");

      // ✅ Tự động quay lại sau 2 giây
      setTimeout(() => {
        router.back(); // quay lại trang trước đó
      }, 2000);
    } catch (err: unknown) {
      console.error("Change password error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer
      title="Change Password"
      description="Enter your old and new password below."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <FormInput
            id="oldPassword"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            label="Old Password"
          />

          <FormInput
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            label="New Password"
          />
          <FormError message={error} />
          {success && (
            <p className="text-green-600 text-sm font-medium mt-2 text-center">
              {success} Redirecting...
            </p>
          )}
        </div>

        {/* Submit */}
        <FormButton type="submit" variant="default" disabled={loading}>
          {loading ? "Changing..." : "Change Password"}
        </FormButton>
      </form>
    </FormContainer>
  );
}
