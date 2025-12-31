"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CheckCircle, X, Scan, AlertCircle, Loader2 } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import api from "@/lib/api";

// FaceIO types (will be available after installing @faceio/fiojs)
declare global {
  interface Window {
    faceIO?: any;
  }
}

type FaceIDStatus = "idle" | "registering" | "registered" | "error" | "updating";

export default function FaceIDRegistration() {
  const { user } = useProfileStore();
  const [status, setStatus] = useState<FaceIDStatus>("idle");
  const [faceIO, setFaceIO] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize FaceIO
  useEffect(() => {
    const initFaceIO = async () => {
      try {
        // Check if FaceIO is loaded
        if (typeof window !== "undefined" && window.faceIO) {
          // Replace with your FaceIO Public ID from dashboard
          const faceioInstance = new window.faceIO(process.env.NEXT_PUBLIC_FACEIO_PUBLIC_ID || "");
          setFaceIO(faceioInstance);
          
          // Check if user already has Face ID registered
          // You can call your backend API to check this
          // For now, we'll assume not registered
          setIsRegistered(false);
        } else {
          // Load FaceIO script dynamically
          const script = document.createElement("script");
          script.src = "https://cdn.faceio.net/fio.js";
          script.async = true;
          script.onload = () => {
            if (window.faceIO) {
              const faceioInstance = new window.faceIO(process.env.NEXT_PUBLIC_FACEIO_PUBLIC_ID || "");
              setFaceIO(faceioInstance);
            }
          };
          document.head.appendChild(script);
        }
      } catch (err) {
        console.error("FaceIO initialization error:", err);
        setError("Không thể khởi tạo FaceIO. Vui lòng thử lại sau.");
      }
    };

    initFaceIO();
  }, []);

  // Register or Update Face ID
  const handleRegisterFaceID = async () => {
    if (!faceIO) {
      setError("FaceIO chưa sẵn sàng. Vui lòng tải lại trang.");
      return;
    }

    if (!user?.phone_number) {
      setError("Vui lòng cập nhật số điện thoại trước khi đăng ký Face ID.");
      return;
    }

    setStatus("registering");
    setError("");
    setSuccess("");

    try {
      // Start camera preview
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Register face with FaceIO
      // Use phone number as the user ID
      const faceId = await faceIO.enroll({
        locale: "vi",
        payload: {
          phone: user.phone_number,
          userId: user.id?.toString() || "",
        },
      });

      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // Save Face ID to backend
      // You'll need to create this API endpoint in your NestJS backend
      try {
        await api.post("/auth/face-id/register", {
          faceId: faceId.facialId,
          phone: user.phone_number,
        });

        setStatus("registered");
        setIsRegistered(true);
        setSuccess("Đăng ký Face ID thành công!");
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess("");
          setStatus("idle");
        }, 3000);
      } catch (apiError) {
        console.error("API Error:", apiError);
        setError("Đăng ký Face ID thành công nhưng không thể lưu vào hệ thống. Vui lòng thử lại.");
        setStatus("error");
      }
    } catch (err: any) {
      console.error("Face ID Registration Error:", err);
      
      // Stop camera on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // Handle FaceIO specific errors
      let errorMessage = "Không thể đăng ký Face ID. Vui lòng thử lại.";
      
      if (err.name === "fiojs_error") {
        switch (err.errorCode) {
          case "PERMISSION_REFUSED":
            errorMessage = "Bạn đã từ chối quyền truy cập camera.";
            break;
          case "NO_FACE_DETECTED":
            errorMessage = "Không phát hiện khuôn mặt. Vui lòng đảm bảo ánh sáng đủ và nhìn thẳng vào camera.";
            break;
          case "MULTIPLE_FACES":
            errorMessage = "Phát hiện nhiều khuôn mặt. Vui lòng chỉ có một người trong khung hình.";
            break;
          case "FACE_DUPLICATE":
            errorMessage = "Khuôn mặt này đã được đăng ký trong hệ thống.";
            break;
          default:
            errorMessage = `Lỗi: ${err.message || "Vui lòng thử lại."}`;
        }
      }

      setError(errorMessage);
      setStatus("error");
    }
  };

  // Update/Re-register Face ID
  const handleUpdateFaceID = async () => {
    if (!faceIO) {
      setError("FaceIO chưa sẵn sàng. Vui lòng tải lại trang.");
      return;
    }

    setStatus("updating");
    setError("");
    setSuccess("");

    try {
      // Start camera preview
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Re-enroll face (FaceIO will update existing enrollment)
      const faceId = await faceIO.enroll({
        locale: "vi",
        payload: {
          phone: user?.phone_number,
          userId: user?.id?.toString() || "",
        },
      });

      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // Update Face ID in backend
      try {
        await api.put("/auth/face-id/update", {
          faceId: faceId.facialId,
          phone: user?.phone_number,
        });

        setStatus("registered");
        setSuccess("Cập nhật Face ID thành công!");
        
        setTimeout(() => {
          setSuccess("");
          setStatus("idle");
        }, 3000);
      } catch (apiError) {
        console.error("API Error:", apiError);
        setError("Cập nhật Face ID thành công nhưng không thể lưu vào hệ thống. Vui lòng thử lại.");
        setStatus("error");
      }
    } catch (err: any) {
      console.error("Face ID Update Error:", err);
      
      // Stop camera on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      let errorMessage = "Không thể cập nhật Face ID. Vui lòng thử lại.";
      
      if (err.name === "fiojs_error") {
        switch (err.errorCode) {
          case "PERMISSION_REFUSED":
            errorMessage = "Bạn đã từ chối quyền truy cập camera.";
            break;
          case "NO_FACE_DETECTED":
            errorMessage = "Không phát hiện khuôn mặt. Vui lòng đảm bảo ánh sáng đủ và nhìn thẳng vào camera.";
            break;
          default:
            errorMessage = `Lỗi: ${err.message || "Vui lòng thử lại."}`;
        }
      }

      setError(errorMessage);
      setStatus("error");
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Scan className="text-blue-600" size={20} />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Face ID</CardTitle>
            <CardDescription>
              Đăng ký hoặc cập nhật Face ID để đăng nhập nhanh tại kiosk
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            {isRegistered ? (
              <>
                <CheckCircle className="text-green-600" size={24} />
                <div>
                  <p className="font-medium text-gray-900">Face ID đã được đăng ký</p>
                  <p className="text-sm text-gray-500">
                    Bạn có thể sử dụng Face ID để đăng nhập tại kiosk
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="text-amber-600" size={24} />
                <div>
                  <p className="font-medium text-gray-900">Chưa đăng ký Face ID</p>
                  <p className="text-sm text-gray-500">
                    Đăng ký Face ID để đăng nhập nhanh hơn
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Camera Preview (shown during registration) */}
        {(status === "registering" || status === "updating") && (
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-4 border-blue-500 rounded-full w-64 h-64 animate-pulse" />
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
                <Loader2 className="animate-spin" size={20} />
                <span className="font-medium">
                  {status === "registering" ? "Đang đăng ký..." : "Đang cập nhật..."}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isRegistered ? (
            <Button
              onClick={handleRegisterFaceID}
              disabled={status === "registering" || !faceIO}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {status === "registering" ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Đang đăng ký...
                </>
              ) : (
                <>
                  <Camera className="mr-2" size={18} />
                  Đăng ký Face ID
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleUpdateFaceID}
              disabled={status === "updating" || !faceIO}
              variant="outline"
              className="flex-1"
            >
              {status === "updating" ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Camera className="mr-2" size={18} />
                  Cập nhật Face ID
                </>
              )}
            </Button>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <X className="text-red-600" size={20} />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Info Note */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Lưu ý:</strong> Face ID sẽ được sử dụng để đăng nhập tại kiosk. 
            Đảm bảo ánh sáng đủ và nhìn thẳng vào camera khi đăng ký.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

