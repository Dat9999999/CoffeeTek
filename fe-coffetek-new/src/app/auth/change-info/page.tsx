"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import FormContainer from "@/components/forms/FormContainer";
import FormInput from "@/components/forms/FormInput";
import FormButton from "@/components/forms/FormButton";
import FormError from "@/components/forms/FormError";
import { authService } from "@/services";
import { useAuthContext } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeftOutlined, LogoutOutlined } from "@ant-design/icons";

// 1. Import Shadcn UI Alert Dialog components
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UpdateSecurityErrors {
    phone_number?: string;
    password?: string;
    confirmPassword?: string;
    address?: string;
    general?: string;
}

export default function UpdateSecurityPage() {
    const { user, setUser, setIsAuthenticated } = useAuthContext();
    const router = useRouter();

    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const [errors, setErrors] = useState<UpdateSecurityErrors>({});
    const [loading, setLoading] = useState<boolean>(false);


    // 2. Logic xử lý khi người dùng bấm "Continue" trên modal
    const onConfirmLogout = () => {
        authService.logout(setUser, setIsAuthenticated);
        toast.success("Logout success!");
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        const newErrors: UpdateSecurityErrors = {};

        // 1. Validate Phone Number
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneNumber.trim()) {
            newErrors.phone_number = "Please enter your phone number";
        } else if (!phoneRegex.test(phoneNumber)) {
            newErrors.phone_number = "Invalid phone number format (e.g., 0901234567)";
        }

        // 2. Validate Address Length
        if (!address.trim()) {
            newErrors.address = "Please enter your address";
        } else if (address.trim().length < 5) {
            newErrors.address = "Address must be at least 5 characters long";
        }

        // 3. Validate Password Length
        if (!password) {
            newErrors.password = "Please enter your password to confirm changes";
        } else if (password.length < 6) {
            newErrors.password = "Password must be longer than 6 characters";
        }

        // 4. Validate Confirm Password
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            await authService.updateSecurity({
                phone_number: phoneNumber,
                password: password,
                address: address,
            });

            toast.success("Security information updated successfully!");

            try {
                const userInfo = await authService.getUserLoginInfo();
                setUser(userInfo);
            } catch (fetchError) {
                console.error("Failed to refresh user info", fetchError);
            }

            router.push("/");

        } catch (error: any) {
            console.error("Error updating security:", error);
            const errorMessage = error?.response?.data?.message || "Failed to update information";
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormContainer
            title="Update Security To Continue"
            description="Update your phone number, address and password"
            link={null}
            backButton={<Link href="/"><ArrowLeftOutlined /> Back to Home</Link>}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* Phone Number */}
                <div>
                    <FormInput
                        id="phone_number"
                        type="text"
                        value={phoneNumber}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                        label="Phone Number"
                        required
                        placeholder="Enter new phone number"
                    />
                    <FormError message={errors.phone_number} />
                </div>

                {/* Address */}
                <div>
                    <FormInput
                        id="address"
                        type="text"
                        value={address}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                        label="Address"
                        required
                        placeholder="Enter your address"
                    />
                    <FormError message={errors.address} />
                </div>

                {/* Password & Confirm Password Group */}
                <div className="flex flex-col gap-4 ">
                    {/* Password */}
                    <div className="relative">
                        <FormInput
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            label="Password"
                            required
                            placeholder="Enter password (> 6 characters)"
                        />
                        <FormError message={errors.password} />
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <FormInput
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                            label="Confirm Password"
                            required
                            placeholder="Re-enter your password"
                        />
                        <FormError message={errors.confirmPassword} />
                    </div>
                </div>

                {/* General errors */}
                <FormError message={errors.general} />

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-2">
                    {/* Submit button */}
                    <FormButton
                        type="submit"
                        className="w-full flex items-center p-1 justify-center gap-1  text-white"
                        disabled={loading}
                    >
                        {loading && <Spinner />}
                        {loading ? "Updating..." : "Update Information"}
                    </FormButton>

                    {/* 3. Bọc nút Logout bằng AlertDialog */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button
                                type="button"
                                disabled={loading}
                                className="w-full p-2 flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors font-medium"
                            >
                                <LogoutOutlined /> Logout
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You will be returned to the login screen. You need to sign in again to access your account.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onConfirmLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Logout
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

            </form>
        </FormContainer>
    );
}