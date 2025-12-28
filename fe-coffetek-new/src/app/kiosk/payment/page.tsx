'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, QrCode, CheckCircle, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react'; // Import thư viện QR
import api from '@/lib/api';
import { CartItem, CreateOrderPayload, OrderDetailItemDTO } from '../types';

export default function PaymentPage() {
  const router = useRouter();
  const [step, setStep] = useState<'METHOD' | 'PROCESSING' | 'QR_SHOW' | 'SUCCESS'>('METHOD');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  
  // Ref để quản lý interval polling
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('kiosk_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    
    // Cleanup khi component unmount
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // --- HÀM 1: TẠO ĐƠN HÀNG ---
  const handleCreateOrder = async (method: 'CASH' | 'VNPAY') => {
    if (cart.length === 0) return;
    setStep('PROCESSING');
    
    try {
      // 1. Map CartItem sang DTO Backend
      const orderDetails: OrderDetailItemDTO[] = cart.map(item => ({
        productId: item.id.toString(),
        quantity: item.quantity.toString(),
        sizeId: item.selectedSize?.id.toString(),
        note: item.note || '',
        // Map Topping: Backend yêu cầu { toppingId, quantity }
        toppingItems: item.selectedToppings.map(t => ({
            toppingId: t.id.toString(),
            quantity: "1" // Mặc định 1 topping cùng loại
        })),
        // Map Option: Lấy mảng values từ object { groupId: valueId }
        optionValue: Object.values(item.selectedOptions).map(id => id.toString())
      }));

      const customerPhone = localStorage.getItem('kiosk_phone') || undefined; // Fallback nếu lỗi

      const payload: CreateOrderPayload = {
        order_details: orderDetails,
        customerPhone: customerPhone ,
        staffId: '1', 
        note: `Kiosk Order - ${method}`
      };

      console.log("Sending Payload:", payload); // Debug xem payload đúng chưa

      // 2. Gọi API Tạo đơn
      const res = await api.post('/order', payload);
      const newOrder = res.data; // Object Order trả về
      console.log("Order Created:", newOrder);
      
      setOrderId(newOrder.id);

      // 3. Phân nhánh xử lý
      if (method === 'CASH') {
        setStep('SUCCESS');
        localStorage.removeItem('kiosk_cart'); // Xóa giỏ
      } else {
        // VNPay Flow
        await handleVNPay(newOrder.id, newOrder.final_price || 0); // Dùng final_price từ response cho chuẩn
      }

    } catch (error: any) {
      console.error("Lỗi tạo đơn:", error.response?.data || error);
      alert("Lỗi tạo đơn: " + (error.response?.data?.message || "Vui lòng thử lại"));
      setStep('METHOD');
    }
  };

  // --- HÀM 2: LẤY LINK VNPAY & POLLING ---
  const handleVNPay = async (orderId: number, amount: number) => {
    try {
      // Gọi API lấy link thanh toán
      // Lưu ý: Backend trả về text url trực tiếp (dựa theo code service bạn gửi)
      const payRes = await api.post('/order/paid/online', {
        orderId: orderId,
        amount: amount, 
        // Backend có thể tự tính amount từ DB, nhưng DTO có field này nên cứ gửi
      });

      const paymentUrl = payRes.data; // API trả về string URL
      if (paymentUrl && typeof paymentUrl === 'string' && paymentUrl.startsWith('http')) {
         setQrUrl(paymentUrl);
         setStep('QR_SHOW');
         
         // Bắt đầu Polling kiểm tra trạng thái
         startPolling(orderId);
      } else {
        alert("Không lấy được link thanh toán. Vui lòng chọn Tiền mặt.");
        setStep('METHOD');
      }

    } catch (error) {
       console.error("VNPay Error:", error);
       alert("Lỗi kết nối VNPay");
       setStep('METHOD');
    }
  };

  // --- HÀM 3: POLLING CHECK TRẠNG THÁI ---
  const startPolling = (orderId: number) => {
    // Check mỗi 3 giây
    pollIntervalRef.current = setInterval(async () => {
       try {
         const res = await api.get(`/order/${orderId}`);
         const order = res.data;
         
         // Kiểm tra status từ enum Backend (PAID hoặc COMPLETED)
         if (order.status === 'paid' || order.status === 'completed') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setStep('SUCCESS');
            localStorage.removeItem('kiosk_cart');
         }
       } catch (err) {
         console.error("Polling Error", err);
       }
    }, 3000);
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* HEADER */}
      <header className="h-20 bg-white shadow-sm flex items-center px-6">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full mr-4 hover:bg-gray-200">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Thanh toán đơn hàng</h1>
      </header>

      {/* BODY */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        
        {/* VIEW 1: CHỌN PHƯƠNG THỨC */}
        {step === 'METHOD' && (
          <div className="w-full max-w-4xl grid grid-cols-2 gap-8">
            <button 
              onClick={() => handleCreateOrder('VNPAY')}
              className="group bg-white p-10 rounded-3xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-blue-100 transition-all flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode size={48} />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800">Quét mã QR / VNPay</h3>
                <p className="text-gray-500 mt-2">Thanh toán nhanh qua App ngân hàng</p>
              </div>
            </button>

            <button 
              onClick={() => handleCreateOrder('CASH')}
              className="group bg-white p-10 rounded-3xl shadow-sm border-2 border-transparent hover:border-green-500 hover:shadow-green-100 transition-all flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Banknote size={48} />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800">Tiền mặt tại quầy</h3>
                <p className="text-gray-500 mt-2">Nhận hóa đơn và thanh toán cho thu ngân</p>
              </div>
            </button>
          </div>
        )}

        {/* VIEW 2: LOADING */}
        {step === 'PROCESSING' && (
           <div className="flex flex-col items-center gap-6">
              <Loader2 className="animate-spin text-orange-600 w-16 h-16" />
              <p className="text-2xl font-medium text-gray-600">Đang khởi tạo đơn hàng...</p>
           </div>
        )}

        {/* VIEW 3: HIỂN THỊ QR CODE */}
        {step === 'QR_SHOW' && (
           <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full animate-in zoom-in duration-300">
              <h2 className="text-2xl font-bold mb-8">Quét mã để thanh toán</h2>
              
              <div className="bg-white p-4 border-2 border-orange-100 rounded-2xl inline-block shadow-inner mb-8">
                  <QRCodeCanvas 
                    value={qrUrl} 
                    size={280}
                    level={"H"}
                    includeMargin={true}
                  />
              </div>

              <div className="flex items-center justify-center gap-3 text-orange-600 font-medium text-lg bg-orange-50 py-3 rounded-xl">
                 <Loader2 className="animate-spin" size={24} />
                 Đang chờ xác nhận từ ngân hàng...
              </div>
              <p className="text-sm text-gray-400 mt-6">Đừng tắt màn hình này bạn nhé!</p>
           </div>
        )}

        {/* VIEW 4: SUCCESS */}
        {step === 'SUCCESS' && (
           <div className="text-center space-y-6 animate-in slide-in-from-bottom duration-500">
              <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                 <CheckCircle size={64} strokeWidth={3} />
              </div>
              <div>
                 <h2 className="text-4xl font-bold text-gray-900">Đặt hàng thành công!</h2>
                 <p className="text-xl text-gray-500 mt-3">
                   Mã đơn hàng của bạn là: <span className="font-bold text-gray-900 text-2xl">#{orderId}</span>
                 </p>
                 {qrUrl ? (
                    <p className="text-green-600 font-medium mt-2">Đã thanh toán thành công</p>
                 ) : (
                    <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-xl flex items-center justify-center gap-2 max-w-md mx-auto">
                       <AlertCircle size={24}/>
                       <span>Vui lòng đến quầy để thanh toán tiền mặt</span>
                    </div>
                 )}
              </div>
              
              <div className="pt-10">
                 <button 
                   onClick={() => router.push('/kiosk')}
                   className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all"
                 >
                   Về màn hình chính (10s)
                 </button>
              </div>
           </div>
        )}

      </main>
    </div>
  );
}