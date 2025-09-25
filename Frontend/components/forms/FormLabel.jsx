"use client";
import { Label } from "@/components/ui/label";

export default function FormLabel({ htmlFor, children }) {
  return <Label htmlFor={htmlFor}>{children}</Label>;
}
