"use client";
import { Input } from "@/components/ui/input";

export default function FormInput({ id, type = "text", value, onChange, placeholder, required }) {
  return (
    <Input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  );
}
