"use client";

import { useState } from "react";
import CountdownTimer from "./CountdownTimer";

export default function PromotionCard({ title, description, code, expiresAt }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white shadow-md p-6 rounded-lg hover:shadow-xl transition-all duration-300">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>

      <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
        <span className="font-mono text-sm">{code}</span>
        <button
          onClick={copyCode}
          className="text-blue-600 hover:underline text-sm"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="mt-4">
        <CountdownTimer expiresAt={expiresAt} />
      </div>
    </div>
  );
}
