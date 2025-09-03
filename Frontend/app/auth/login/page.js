"use client";
import { useState } from "react";
export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Handle authentication logic here
        try {
            const response = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: email, password }),
            });
            const data = await response.json();
            console.log(data);
            if (response.ok) {
                // Handle successful login (e.g., redirect, store token, etc.)
                alert('Login successful!');
            } else {
                // Handle login error (e.g., show error message)
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="p-6 rounded-2xl shadow-md bg-white w-80">
                <h1 className="text-2xl font-bold mb-4">Sign In</h1>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        className="border rounded px-3 py-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border rounded px-3 py-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
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
