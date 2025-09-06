"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/lib/constant/api.constant";
import { STORAGE_KEYS } from "@/lib/constant/storageKey.constant";

export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        let newErrors = {};

        // Validate email
        if (!email) {
            newErrors.email = "Please enter your email";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                newErrors.email = "Invalid email format";
            }
        }

        // Validate password
        if (!password) {
            newErrors.password = "Please enter your password";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
                router.push("/");
            } else {
                setErrors({ general: data.message || "Login failed" });
            }
        } catch (error) {
            console.error("Error during login:", error);
            setErrors({ general: "Something went wrong, please try again" });
        }
    };

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="p-6 rounded-2xl shadow-md bg-white w-80">
                <h1 className="text-2xl font-bold mb-4">Sign In</h1>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            className="border rounded px-3 py-2 w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            className="border rounded px-3 py-2 w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

                    <button
                        type="submit"
                        className="bg-black text-white rounded px-4 py-2 hover:bg-gray-800"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
