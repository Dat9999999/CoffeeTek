'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Delete, User, ArrowRight, Scan, Phone, Camera, X, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

type LoginMethod = 'SELECT' | 'PHONE' | 'FACEID';

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('SELECT');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [faceIdStatus, setFaceIdStatus] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
      // 1. Kiểm tra khách hàng có tồn tại không?
      // (Giả sử bạn có API GET /users/phone/{phone} hoặc GET /customers?phone=...)
      // Nếu chưa có API này, bạn có thể gọi API tạo mới luôn (nếu backend cho phép duplicate check)
      
      // Cách an toàn nhất: Gọi thử API tạo khách hàng mới. 
      // Nếu đã tồn tại -> Backend thường trả về lỗi hoặc user cũ -> Ta vẫn lấy được user đó.
      // Dưới đây là ví dụ gọi API tạo Customer (Bạn cần check lại Controller User/Customer của bạn)
      
      try {
         await api.post('/customers', { // Hoặc endpoint /users/register tùy backend
           phone: phone,
           name: 'Khách Kiosk', // Tên mặc định
         });
      } catch (err) {
         // Nếu lỗi 409 (Conflict/Exist) nghĩa là đã có -> Tốt, bỏ qua
         console.log("Khách đã tồn tại hoặc lỗi tạo:", err);
      }

      // 2. Lưu SĐT vào LocalStorage để trang Payment dùng
      localStorage.setItem('kiosk_phone', phone);
      
      // 3. Chuyển sang thanh toán
      router.push('/kiosk/payment');

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

  // Face ID Functions
  const startFaceId = async () => {
    setFaceIdStatus('SCANNING');
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
        videoRef.current.play();
      }

      // Simulate face recognition (Replace with actual face recognition API)
      // In production, you would:
      // 1. Capture frame from video
      // 2. Send to backend face recognition API
      // 3. Match with registered faces
      // 4. Return user phone number or user ID
      
      setTimeout(async () => {
        // Simulate face recognition process
        // TODO: Replace with actual face recognition API call
        // const faceData = await captureAndRecognize();
        // if (faceData && faceData.phone) {
        //   localStorage.setItem('kiosk_phone', faceData.phone);
        //   router.push('/kiosk/payment');
        // }
        
        // For now, simulate success after 2 seconds
        setFaceIdStatus('SUCCESS');
        setTimeout(() => {
          // In production, use the recognized phone number
          // localStorage.setItem('kiosk_phone', recognizedPhone);
          router.push('/kiosk/payment');
        }, 1000);
      }, 2000);

    } catch (err) {
      console.error('Face ID Error:', err);
      setFaceIdStatus('ERROR');
      setError('Không thể truy cập camera. Vui lòng thử lại hoặc dùng số điện thoại.');
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

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Nút Back */}
      <button 
        onClick={loginMethod === 'SELECT' ? () => router.back() : handleBackToSelect} 
        className="absolute top-8 left-8 p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors z-10"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Render based on login method */}
      {loginMethod === 'SELECT' && renderMethodSelection()}
      {loginMethod === 'PHONE' && renderPhoneLogin()}
      {loginMethod === 'FACEID' && renderFaceIdLogin()}
    </div>
  );
}