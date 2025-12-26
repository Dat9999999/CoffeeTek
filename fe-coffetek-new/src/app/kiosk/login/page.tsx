'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Delete, User, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Khách vãng lai (Guest) -> Dùng số mặc định của hệ thống
  const handleSkip = () => {
    // Bạn phải đảm bảo số này ĐÃ CÓ trong DB
    localStorage.setItem('kiosk_phone', '0000000000'); 
    router.push('/kiosk/payment');
  };

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Nút Back */}
      <button onClick={() => router.back()} className="absolute top-8 left-8 p-3 bg-white rounded-full shadow-sm">
        <ChevronLeft size={24} />
      </button>

      <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-10 fade-in">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <User size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Thành viên CoffeeTek</h1>
          <p className="text-gray-500">Nhập số điện thoại để tích điểm & nhận ưu đãi</p>
        </div>

        {/* Màn hình hiển thị số */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-orange-100 text-center relative">
          <span className={`text-4xl font-bold tracking-widest ${phone ? 'text-gray-900' : 'text-gray-300'}`}>
            {phone || '000 000 0000'}
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
            onClick={handleSkip}
            className="h-20 rounded-xl text-gray-400 font-medium text-lg active:scale-95 transition-all"
          >
            Bỏ qua
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
    </div>
  );
}