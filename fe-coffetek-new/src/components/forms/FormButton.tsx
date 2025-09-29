"use client";
import { Button } from "@/components/ui/button";

export default function FormButton({ type = "button", variant = "default", className = "", children, ...props }: any) {
  return (
    <Button type={type} variant={variant} className={className} {...props}>
      {children}
    </Button>
  );
}
