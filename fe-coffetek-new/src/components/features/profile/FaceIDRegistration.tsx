"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, CheckCircle, X, Scan, AlertCircle, Loader2 } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import api from "@/lib/api";

type FaceIDStatus = "idle" | "registering" | "registered" | "error" | "updating" | "checking";

export default function FaceIDRegistration() {
  const { user } = useProfileStore();
  const [status, setStatus] = useState<FaceIDStatus>("checking");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const actionTypeRef = useRef<"register" | "update">("register");

  // Check if user has Face ID registered
  useEffect(() => {
    const checkFaceIDStatus = async () => {
      if (!user?.id) return;
      
      try {
        setStatus("checking");
        const response = await api.get("/auth/face-id/status");
        setIsRegistered(response.data?.hasFaceID || false);
        setStatus("idle");
      } catch (err) {
        console.error("Error checking Face ID status:", err);
        // If endpoint doesn't exist yet, assume not registered
        setIsRegistered(false);
        setStatus("idle");
      }
    };

    if (user) {
      checkFaceIDStatus();
    }
  }, [user]);

  // Capture image from video stream
  const captureImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    return canvas.toDataURL("image/jpeg", 0.8);
  };

  // Open dialog and start camera
  const openCameraDialog = async (action: "register" | "update") => {
    if (!user?.phone_number) {
      setError("Vui lòng cập nhật số điện thoại trước khi đăng ký Face ID.");
      return;
    }

    actionTypeRef.current = action;
    setError("");
    setSuccess("");
    setIsDialogOpen(true);

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
    } catch (err: any) {
      console.error("Camera Error:", err);
      setIsDialogOpen(false);
      setError("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập camera.");
    }
  };

  // Capture and process image
  const handleCapture = async () => {
    if (!videoRef.current) return;

    setIsCapturing(true);
    
    try {
      // Wait a bit for better image quality
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Capture image
      const imageData = captureImage();
      if (!imageData) {
        throw new Error("Không thể chụp ảnh từ camera.");
      }

      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setIsCapturing(false);
      setIsProcessing(true);

      // Send to backend for AWS Rekognition processing
      const endpoint = actionTypeRef.current === "register" 
        ? "/auth/face-id/register" 
        : "/auth/face-id/update";
      
      const method = actionTypeRef.current === "register" ? "post" : "put";
      
      await api[method](endpoint, {
        image: imageData, // base64 image
        phone: user?.phone_number,
        userId: user?.id?.toString() || "",
      });

      setIsDialogOpen(false);
      setIsProcessing(false);
      setStatus("registered");
      setIsRegistered(true);
      setSuccess(
        actionTypeRef.current === "register" 
          ? "Đăng ký Face ID thành công!" 
          : "Cập nhật Face ID thành công!"
      );
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
        setStatus("idle");
      }, 3000);
    } catch (err: any) {
      console.error("Face ID Error:", err);
      setIsProcessing(false);
      setIsCapturing(false);

      // Handle errors
      let errorMessage = `Không thể ${actionTypeRef.current === "register" ? "đăng ký" : "cập nhật"} Face ID. Vui lòng thử lại.`;
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Handle specific AWS Rekognition errors
      if (err.response?.data?.errorCode) {
        switch (err.response.data.errorCode) {
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
          case "INVALID_IMAGE":
            errorMessage = "Ảnh không hợp lệ. Vui lòng thử lại.";
            break;
        }
      }

      setError(errorMessage);
      setStatus("error");
      // Keep dialog open on error so user can retry
    }
  };

  // Close dialog and cleanup
  const closeDialog = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsDialogOpen(false);
    setIsCapturing(false);
    setIsProcessing(false);
  };


  // Cleanup camera on unmount or dialog close
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [isDialogOpen]);

  if (status === "checking") {
    return (
      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <span className="text-gray-600">Đang kiểm tra trạng thái Face ID...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Scan className="text-blue-600" size={20} />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Face ID (AWS Rekognition)</CardTitle>
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

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isRegistered ? (
            <Button
              onClick={() => openCameraDialog("register")}
              disabled={isDialogOpen || isProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="mr-2" size={18} />
              Đăng ký Face ID
            </Button>
          ) : (
            <Button
              onClick={() => openCameraDialog("update")}
              disabled={isDialogOpen || isProcessing}
              variant="outline"
              className="flex-1"
            >
              <Camera className="mr-2" size={18} />
              Cập nhật Face ID
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
            <strong>Lưu ý:</strong> Face ID sử dụng AWS Rekognition để nhận diện khuôn mặt. 
            Đảm bảo ánh sáng đủ và nhìn thẳng vào camera khi đăng ký. 
            Ảnh sẽ được xử lý an toàn và chỉ lưu thông tin nhận diện.
          </p>
        </div>
      </CardContent>

      {/* Camera Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-2xl" showCloseButton={!isProcessing}>
          <DialogHeader>
            <DialogTitle>
              {actionTypeRef.current === "register" ? "Đăng ký Face ID" : "Cập nhật Face ID"}
            </DialogTitle>
            <DialogDescription>
              Nhìn thẳng vào camera và đảm bảo ánh sáng đủ. Nhấn nút chụp ảnh khi sẵn sàng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Camera Preview */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-4 border-blue-500 rounded-full w-64 h-64" />
                </div>
              )}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="animate-spin text-white mx-auto mb-4" size={48} />
                    <p className="text-white font-medium text-lg">
                      Đang xử lý ảnh...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error in Dialog */}
            {error && isDialogOpen && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <X className="text-red-600" size={20} />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            {!isProcessing && (
              <div className="flex gap-3">
                <Button
                  onClick={closeDialog}
                  variant="outline"
                  className="flex-1"
                  disabled={isCapturing}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCapture}
                  disabled={isCapturing || !videoRef.current}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Đang chụp...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2" size={18} />
                      Chụp ảnh
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
