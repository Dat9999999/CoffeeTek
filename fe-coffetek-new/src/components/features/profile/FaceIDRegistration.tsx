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
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
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
      setError("Please update your phone number before registering Face ID.");
      return;
    }

    actionTypeRef.current = action;
    setError("");
    setSuccess("");
    setIsDialogOpen(true);
  };

  // Start camera when dialog opens
  useEffect(() => {
    if (!isDialogOpen) {
      setIsCameraReady(false);
      return;
    }

    let stream: MediaStream | null = null;
    let isMounted = true;

    const startCamera = async () => {
      try {
        setIsCameraReady(false);
        
        // Wait a bit for dialog to fully render
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (!isMounted) return;

        // Start camera preview
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
        
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        
        streamRef.current = stream;
        
        // Wait for video element to be ready
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready
          await new Promise((resolve) => {
            if (videoRef.current) {
              const video = videoRef.current;
              const onLoadedMetadata = () => {
                video.play()
                  .then(() => {
                    if (isMounted) {
                      setIsCameraReady(true);
                    }
                    resolve(true);
                  })
                  .catch((err) => {
                    console.error("Video play error:", err);
                    if (isMounted) {
                      setIsCameraReady(true); // Still allow capture even if play fails
                    }
                    resolve(true);
                  });
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
              };
              video.addEventListener('loadedmetadata', onLoadedMetadata);
              
              // Fallback if loadedmetadata doesn't fire
              setTimeout(() => {
                if (isMounted && !isCameraReady) {
                  video.play().then(() => {
                    setIsCameraReady(true);
                  }).catch(() => {
                    setIsCameraReady(true);
                  });
                  resolve(true);
                }
              }, 1000);
            } else {
              resolve(true);
            }
          });
        } else {
          // Video element not ready, try again
          setTimeout(() => {
            if (videoRef.current && stream) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().then(() => {
                if (isMounted) setIsCameraReady(true);
              }).catch(() => {
                if (isMounted) setIsCameraReady(true);
              });
            }
          }, 200);
        }
      } catch (err: any) {
        console.error("Camera Error:", err);
        if (isMounted) {
          setError("Unable to access camera. Please check camera permissions.");
          setIsDialogOpen(false);
        }
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isDialogOpen]);

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
        throw new Error("Unable to capture image from camera.");
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
          ? "Face ID registered successfully!" 
          : "Face ID updated successfully!"
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
      let errorMessage = `Unable to ${actionTypeRef.current === "register" ? "register" : "update"} Face ID. Please try again.`;
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Handle specific AWS Rekognition errors
      if (err.response?.data?.errorCode) {
        switch (err.response.data.errorCode) {
          case "PERMISSION_REFUSED":
            errorMessage = "Camera access permission denied.";
            break;
          case "NO_FACE_DETECTED":
            errorMessage = "No face detected. Please ensure adequate lighting and look straight at the camera.";
            break;
          case "MULTIPLE_FACES":
            errorMessage = "Multiple faces detected. Please ensure only one person is in the frame.";
            break;
          case "FACE_DUPLICATE":
            errorMessage = "This face has already been registered in the system.";
            break;
          case "INVALID_IMAGE":
            errorMessage = "Invalid image. Please try again.";
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
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Reset states
    setIsDialogOpen(false);
    setIsCapturing(false);
    setIsProcessing(false);
    setIsCameraReady(false);
    setError(""); // Clear error when closing
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

  if (status === "checking") {
    return (
      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <span className="text-gray-600">Checking Face ID status...</span>
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
            <CardTitle className="text-lg font-semibold">Face ID</CardTitle>
            <CardDescription>
              Register or update Face ID for quick login at kiosk
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
                  <p className="font-medium text-gray-900">Face ID registered</p>
                  <p className="text-sm text-gray-500">
                    You can use Face ID to login at kiosk
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="text-amber-600" size={24} />
                <div>
                  <p className="font-medium text-gray-900">Face ID not registered</p>
                  <p className="text-sm text-gray-500">
                    Register Face ID for faster login
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
              Register Face ID
            </Button>
          ) : (
            <Button
              onClick={() => openCameraDialog("update")}
              disabled={isDialogOpen || isProcessing}
              variant="outline"
              className="flex-1"
            >
              <Camera className="mr-2" size={18} />
              Update Face ID
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
            <strong>Note:</strong> Face ID is used for face recognition. 
            Ensure adequate lighting and look straight at the camera when registering. 
            Images will be processed securely and only recognition data will be stored.
          </p>
        </div>
      </CardContent>

      {/* Camera Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-2xl" showCloseButton={!isProcessing}>
          <DialogHeader>
            <DialogTitle>
              {actionTypeRef.current === "register" ? "Register Face ID" : "Update Face ID"}
            </DialogTitle>
            <DialogDescription>
              Look straight at the camera and ensure adequate lighting. Press the capture button when ready.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Camera Preview */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="animate-spin text-white mx-auto mb-4" size={48} />
                    <p className="text-white font-medium text-lg">
                      Starting camera...
                    </p>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ display: isCameraReady ? 'block' : 'none' }}
              />
              {isCameraReady && !isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-4 border-blue-500 rounded-full w-64 h-64" />
                </div>
              )}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                  <div className="text-center">
                    <Loader2 className="animate-spin text-white mx-auto mb-4" size={48} />
                    <p className="text-white font-medium text-lg">
                      Processing image...
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
                  Cancel
                </Button>
                <Button
                  onClick={handleCapture}
                  disabled={isCapturing || !isCameraReady || !videoRef.current || !streamRef.current}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2" size={18} />
                      Capture Photo
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
