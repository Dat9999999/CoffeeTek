// "use client";
// import { Input } from "@/components/ui/input";

// interface FormInputProps {
//   id: string;
//   type?: string;
//   value: string;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   required?: boolean;
//   label: string; // thêm label vào props
// }

// export default function FormInput({
//   id,
//   type = "text",
//   value,
//   onChange,
//   required = false,
//   label,
// }: FormInputProps) {
//   return (
//     <div className="relative mt-5">
//       <Input
//         id={id}
//         type={type}
//         value={value}
//         onChange={onChange}
//         required={required}
//         placeholder=" "
//         className="peer block w-full rounded-xl border border-gray-400 bg-transparent px-3 pt-5 pb-2 text-white placeholder-transparent focus:border-green-500 focus:ring-0 focus:outline-none transition-all duration-200"
//       />
//       <label
//         htmlFor={id}
//         className="absolute left-3 top-3 text-gray-400 text-sm transition-all duration-200 
//         peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
//         peer-focus:top-1 peer-focus:text-sm peer-focus:text-green-500"
//       >
//         {label}
//       </label>
//     </div>
//   );
// }

"use client";
import React from "react";

interface FormInputProps {
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
}

export default function FormInput({
  id,
  type = "text",
  value,
  onChange,
  required = false,
  label,
}: FormInputProps) {
  const hasValue = value && value.length > 0;

  return (
    <div className="relative mt-5">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        className="peer w-full border border-gray-400 rounded-xl bg-transparent 
                   px-3 pt-5 pb-2 text-white 
                   focus:border-green-500 focus:outline-none 
                   transition-all duration-200"
      />

      <label
        htmlFor={id}
        className={`
          absolute left-3 text-gray-400 transition-all duration-200 
          pointer-events-none px-1
          ${hasValue ? "top-1 text-sm text-green-500" : "peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-green-500"}
        `}
      >
        {label}
      </label>
    </div>
  );
}
