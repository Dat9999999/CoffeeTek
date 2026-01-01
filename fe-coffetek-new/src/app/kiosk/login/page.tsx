'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Delete, User, ArrowRight, Scan, Phone, Camera, X, CheckCircle, Loader2, Gift, Star } from 'lucide-react';
import api from '@/lib/api';

type LoginMethod = 'SELECT' | 'PHONE' | 'FACEID' | 'CUSTOMER_INFO';

interface CustomerInfo {
  phone: string;
  userId: number;
  name?: string;
  email?: string;
  points?: number;
}

interface Voucher {
  id: number;
  code: string;
  voucher_name: string;
  discount_percentage: number;
  minAmountOrder: number;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('SELECT');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [faceIdStatus, setFaceIdStatus] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loadingCustomerInfo, setLoadingCustomerInfo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isCameraReadyRef = useRef<boolean>(false);

  // Xử lý nhập phím số
  const handleType = (num: string) => {
    if (phone.length < 10) setPhone(prev => prev + num);
    setError('');
  };

  const handleDelete = () => {
    setPhone(prev => prev.slice(0, -1));
    setError('');
  };

  // HÀM QUAN TRỌNG: Kiểm tra và Đăng nhập
  const handleLogin = async () => {
    // Validate cơ bản
    if (phone.length < 10 || !phone.startsWith('0')) {
      setError('Số điện thoại không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      // 1. Try to find user by phone
      let userId: number | null = null;
      try {
        const userRes = await api.get('/user/search-pos', {
          params: { searchName: phone, page: 1, size: 1 }
        });
        
        if (userRes.data?.data && userRes.data.data.length > 0) {
          userId = userRes.data.data[0].id;
        }
      } catch (err) {
        console.log("Could not find user:", err);
      }

      // 2. Lưu SĐT vào LocalStorage để trang Payment dùng
      localStorage.setItem('kiosk_phone', phone);
      
      // 3. Fetch customer info and vouchers
      if (userId) {
        await fetchCustomerInfo(phone, userId);
        setLoginMethod('CUSTOMER_INFO');
      } else {
        // If user not found, just go to payment
        router.push('/kiosk/payment');
      }

    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // Khách vãng lai (Guest) -> Không cần số điện thoại
  const handleSkip = () => {
    // Xóa phone number để backend xử lý như khách vãng lai (customerPhone là optional)
    localStorage.removeItem('kiosk_phone');
    router.push('/kiosk/payment');
  };

  // Capture image from video stream
  const captureImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // Fetch customer info and vouchers
  const fetchCustomerInfo = async (phone: string, userId: number) => {
    setLoadingCustomerInfo(true);
    try {
      // Fetch vouchers
      const vouchersRes = await api.get('/voucher/my-active', {
        params: { customerPhone: phone }
      });
      
      const now = new Date();
      const validVouchers = (vouchersRes.data || []).filter((v: Voucher) => {
        const validFrom = new Date(v.valid_from);
        const validTo = new Date(v.valid_to);
        return v.is_active && now >= validFrom && now <= validTo;
      });
      setVouchers(validVouchers);

      // Try to get customer details from user search
      try {
        const userRes = await api.get('/user/search-pos', {
          params: { searchName: phone, page: 1, size: 1 }
        });
        
        if (userRes.data?.data && userRes.data.data.length > 0) {
          const user = userRes.data.data[0];
          setCustomerInfo({
            phone,
            userId,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            points: user.CustomerPoint?.points || 0,
          });
        } else {
          setCustomerInfo({ phone, userId });
        }
      } catch (err) {
        console.log('Could not fetch user details:', err);
        setCustomerInfo({ phone, userId });
      }
    } catch (err) {
      console.error('Error fetching customer info:', err);
      setCustomerInfo({ phone, userId });
    } finally {
      setLoadingCustomerInfo(false);
    }
  };

  // Face ID Functions
  const startFaceId = async () => {
    setFaceIdStatus('SCANNING');
    setError('');
    isCameraReadyRef.current = false;
    
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current) {
            const onLoadedMetadata = () => {
              isCameraReadyRef.current = true;
              videoRef.current?.removeEventListener('loadedmetadata', onLoadedMetadata);
              resolve(true);
            };
            videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
            
            // Fallback timeout
            setTimeout(() => {
              if (!isCameraReadyRef.current) {
                isCameraReadyRef.current = true;
                resolve(true);
              }
            }, 1000);
          } else {
            resolve(true);
          }
        });
      }

      // Wait a bit for better face detection, then capture
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Capture image
      const imageData = captureImage();
      if (!imageData) {
        throw new Error('Không thể chụp ảnh từ camera.');
      }

      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // Send to backend for face recognition
      const response = await api.post('/auth/face-id/login', {
        image: imageData,
      });

      const { phone: recognizedPhone, userId } = response.data;

      if (!recognizedPhone) {
        throw new Error('Không nhận diện được khuôn mặt. Vui lòng thử lại.');
      }

      // Save phone to localStorage
      localStorage.setItem('kiosk_phone', recognizedPhone);

      // Fetch customer info and vouchers
      await fetchCustomerInfo(recognizedPhone, userId);

      setFaceIdStatus('SUCCESS');
      setLoginMethod('CUSTOMER_INFO');

    } catch (err: any) {
      console.error('Face ID Error:', err);
      setFaceIdStatus('ERROR');
      
      // Stop camera on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      let errorMessage = 'Không thể nhận diện khuôn mặt. Vui lòng thử lại hoặc dùng số điện thoại.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    }
  };

  const stopFaceId = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setFaceIdStatus('IDLE');
    isCameraReadyRef.current = false;
  };

  const handleContinueToPayment = () => {
    router.push('/kiosk/payment');
  };

  const handleBackToSelect = () => {
    stopFaceId();
    setLoginMethod('SELECT');
    setError('');
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopFaceId();
    };
  }, []);

  // Render Method Selection Screen
  const renderMethodSelection = () => (
    <div className="w-full max-w-2xl space-y-8 animate-in slide-in-from-bottom-10 fade-in">
      <div className="text-center space-y-2">
        <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User size={48} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Đăng nhập</h1>
        <p className="text-gray-500 text-lg">Chọn phương thức đăng nhập của bạn</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Phone Login Option */}
        <button
          onClick={() => setLoginMethod('PHONE')}
          className="group bg-white p-8 rounded-3xl shadow-lg border-2 border-transparent hover:border-orange-500 hover:shadow-xl transition-all flex flex-col items-center gap-6 min-h-[280px]"
        >
          <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-100 transition-transform">
            <Phone size={40} />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Số điện thoại</h3>
            <p className="text-gray-500">Nhập số điện thoại để đăng nhập</p>
          </div>
        </button>

        {/* Face ID Login Option */}
        <button
          onClick={() => {
            setLoginMethod('FACEID');
            setTimeout(() => startFaceId(), 300);
          }}
          className="group bg-white p-8 rounded-3xl shadow-lg border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all flex flex-col items-center gap-6 min-h-[280px]"
        >
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-transform">
            <Scan size={40} />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Face ID</h3>
            <p className="text-gray-500">Nhận diện khuôn mặt để đăng nhập</p>
          </div>
        </button>
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="w-full py-4 text-gray-500 font-medium hover:text-gray-700 transition-colors"
      >
        Bỏ qua - Tiếp tục như khách
      </button>
    </div>
  );

  // Render Phone Login Screen
  const renderPhoneLogin = () => (
    <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-10 fade-in">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Nhập số điện thoại</h1>
        <p className="text-gray-500">Nhập số điện thoại để tích điểm & nhận ưu đãi</p>
      </div>

      {/* Màn hình hiển thị số */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-orange-100 text-center relative">
        <span className={`text-4xl font-bold tracking-widest ${phone ? 'text-gray-900' : 'text-gray-300'}`}>
          {phone}
        </span>
        {error && <p className="text-red-500 text-sm mt-2 absolute -bottom-6 left-0 right-0">{error}</p>}
      </div>

      {/* Bàn phím số (Numpad) */}
      <div className="grid grid-cols-3 gap-4 px-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleType(num.toString())}
            className="h-20 bg-white rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.05)] border border-gray-100 text-2xl font-bold text-gray-700 active:scale-95 active:shadow-none transition-all"
          >
            {num}
          </button>
        ))}
        <button 
          onClick={handleBackToSelect}
          className="h-20 rounded-xl text-gray-400 font-medium text-lg active:scale-95 transition-all"
        >
          Quay lại
        </button>
        <button
          onClick={() => handleType('0')}
          className="h-20 bg-white rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.05)] border border-gray-100 text-2xl font-bold text-gray-700 active:scale-95 active:shadow-none transition-all"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="h-20 bg-gray-100 rounded-xl text-gray-600 flex items-center justify-center active:scale-95 transition-all"
        >
          <Delete size={28} />
        </button>
      </div>

      {/* Nút Submit */}
      <button
        onClick={handleLogin}
        disabled={loading || phone.length < 10}
        className="w-full h-16 bg-orange-600 text-white rounded-2xl font-bold text-xl hover:bg-orange-500 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200"
      >
        {loading ? 'Đang kiểm tra...' : (
           <>Tiếp tục <ArrowRight /></>
        )}
      </button>
    </div>
  );

  // Render Face ID Login Screen
  const renderFaceIdLogin = () => (
    <div className="w-full max-w-2xl space-y-8 animate-in slide-in-from-bottom-10 fade-in">
      <div className="text-center space-y-2">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
          faceIdStatus === 'SCANNING' ? 'bg-blue-100 text-blue-600 animate-pulse' :
          faceIdStatus === 'SUCCESS' ? 'bg-green-100 text-green-600' :
          faceIdStatus === 'ERROR' ? 'bg-red-100 text-red-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          {faceIdStatus === 'SCANNING' ? (
            <Camera size={48} className="animate-pulse" />
          ) : faceIdStatus === 'SUCCESS' ? (
            <CheckCircle size={48} />
          ) : faceIdStatus === 'ERROR' ? (
            <X size={48} />
          ) : (
            <Scan size={48} />
          )}
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          {faceIdStatus === 'SCANNING' ? 'Đang nhận diện...' :
           faceIdStatus === 'SUCCESS' ? 'Nhận diện thành công!' :
           faceIdStatus === 'ERROR' ? 'Nhận diện thất bại' :
           'Face ID'}
        </h1>
        <p className="text-gray-500 text-lg">
          {faceIdStatus === 'SCANNING' ? 'Vui lòng nhìn thẳng vào camera' :
           faceIdStatus === 'SUCCESS' ? 'Đang chuyển hướng...' :
           faceIdStatus === 'ERROR' ? 'Không thể nhận diện. Vui lòng thử lại' :
           'Nhấn để bắt đầu nhận diện khuôn mặt'}
        </p>
      </div>

      {/* Camera View */}
      <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Overlay for face detection guide */}
        {faceIdStatus === 'SCANNING' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-4 border-blue-500 rounded-full w-64 h-64 animate-pulse" />
          </div>
        )}

        {/* Status overlay */}
        {faceIdStatus === 'SUCCESS' && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
            <div className="bg-white rounded-full p-6">
              <CheckCircle size={64} className="text-green-600" />
            </div>
          </div>
        )}

        {faceIdStatus === 'ERROR' && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
            <div className="bg-white rounded-full p-6">
              <X size={64} className="text-red-600" />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleBackToSelect}
          className="flex-1 h-16 bg-gray-100 text-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft size={24} />
          Quay lại
        </button>
        
        {faceIdStatus === 'ERROR' && (
          <button
            onClick={startFaceId}
            className="flex-1 h-16 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Camera size={24} />
            Thử lại
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}
    </div>
  );

  // Render Customer Info Screen
  const renderCustomerInfo = () => (
    <div className="w-full max-w-2xl space-y-6 animate-in slide-in-from-bottom-10 fade-in">
      <div className="text-center space-y-2">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={48} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Đăng nhập thành công!</h1>
        <p className="text-gray-500 text-lg">Thông tin khách hàng</p>
      </div>

      {loadingCustomerInfo ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-orange-600" size={32} />
          <span className="ml-3 text-gray-600">Đang tải thông tin...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={24} className="text-orange-600" />
              Thông tin khách hàng
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Số điện thoại:</span>
                <span className="font-semibold text-gray-900">{customerInfo?.phone}</span>
              </div>
              {customerInfo?.name && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Họ tên:</span>
                  <span className="font-semibold text-gray-900">{customerInfo.name}</span>
                </div>
              )}
              {customerInfo?.email && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-gray-900">{customerInfo.email}</span>
                </div>
              )}
              {customerInfo?.points !== undefined && (
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Star className="text-amber-500" size={20} />
                    Điểm tích lũy:
                  </span>
                  <span className="font-bold text-amber-600 text-lg">{customerInfo.points.toLocaleString('vi-VN')} điểm</span>
                </div>
              )}
            </div>
          </div>

          {/* Vouchers Card */}
          {vouchers.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Gift size={24} className="text-orange-600" />
                Voucher khả dụng ({vouchers.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {vouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{voucher.voucher_name}</p>
                        <p className="text-sm text-gray-600">Mã: {voucher.code}</p>
                      </div>
                      <span className="bg-orange-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                        -{voucher.discount_percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Áp dụng cho đơn hàng từ {voucher.minAmountOrder.toLocaleString('vi-VN')}₫
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      HSD: {new Date(voucher.valid_to).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {vouchers.length === 0 && (
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <Gift className="text-gray-400 mx-auto mb-2" size={32} />
              <p className="text-gray-500">Bạn chưa có voucher nào</p>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinueToPayment}
            className="w-full h-16 bg-orange-600 text-white rounded-2xl font-bold text-xl hover:bg-orange-500 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
          >
            Tiếp tục mua hàng <ArrowRight size={24} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Nút Back */}
      <button 
        onClick={loginMethod === 'SELECT' ? () => router.back() : handleBackToSelect} 
        className="absolute top-8 left-8 p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors z-10"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Render based on login method */}
      {loginMethod === 'SELECT' && renderMethodSelection()}
      {loginMethod === 'PHONE' && renderPhoneLogin()}
      {loginMethod === 'FACEID' && renderFaceIdLogin()}
      {loginMethod === 'CUSTOMER_INFO' && renderCustomerInfo()}
    </div>
  );
}