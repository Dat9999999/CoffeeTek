"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/lib/constant/api.constant";
import { STORAGE_KEYS } from "@/lib/constant/storageKey.constant";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
        <div className="flex items-center justify-center min-h-screen bg-gray-100 bg-[url(/image/login_background.jpg)] bg-cover">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                    <Button className="w-fit bg-lime-300" variant="link" asChild>
                        <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <a
                                    href="#"
                                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                >
                                    Forgot your password?
                                </a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>

                        {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

                        <CardFooter className="flex-col gap-2 px-0">
                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                            <Button type="button" variant="outline" className="w-full">
                                Login with Google
                            </Button>
                        </CardFooter>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
