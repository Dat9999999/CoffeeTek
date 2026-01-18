'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, CheckCircle, ChevronLeft, Loader2, Tag, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react'; // Import thư viện QR
import api from '@/lib/api';
import { CartItem, CreateOrderPayload, OrderDetailItemDTO } from '../types';

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

export default function PaymentPage() {
  const router = useRouter();
  const [step, setStep] = useState<'METHOD' | 'PROCESSING' | 'QR_SHOW' | 'SUCCESS'>('METHOD');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Ref để quản lý interval polling
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set client-side flag and initialize data
  useEffect(() => {
    setIsClient(true);
    
    const savedCart = localStorage.getItem('kiosk_cart');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      setCart(cartData);
      
      // Calculate total
      const total = cartData.reduce((sum: number, item: CartItem) => sum + item.totalPrice, 0);
      setCartTotal(total);
    }
    
    // Check if customer is logged in and fetch vouchers immediately
    const customerPhone = localStorage.getItem('kiosk_phone');
    const loggedIn = !!customerPhone;
    setIsCustomerLoggedIn(loggedIn);
    
    // Fetch vouchers immediately if customer is logged in
    if (loggedIn && customerPhone) {
      fetchVouchers(customerPhone);
    }
    
    // Cleanup khi component unmount
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Refetch vouchers when cart total changes (to update applicability)
  useEffect(() => {
    if (!isClient) return;
    
    const customerPhone = localStorage.getItem('kiosk_phone');
    if (customerPhone && isCustomerLoggedIn) {
      fetchVouchers(customerPhone);
    }
  }, [cartTotal, isClient, isCustomerLoggedIn]);

  const fetchVouchers = async (phone: string) => {
    setLoadingVouchers(true);
    try {
      const res = await api.get('/voucher/my-active', {
        params: { customerPhone: phone }
      });
      const activeVouchers = res.data || [];
      console.log("Active Vouchers:", activeVouchers);
      
      // Show ALL active vouchers (filter only by active status and valid date)
      const now = new Date();
      const validVouchers = activeVouchers.filter((v: Voucher) => {
        const validFrom = new Date(v.valid_from);
        const validTo = new Date(v.valid_to);
        return v.is_active && 
               now >= validFrom && 
               now <= validTo;
      });
      
      setVouchers(validVouchers);
      
      // Clear selected voucher if it's no longer valid
      if (selectedVoucher && !validVouchers.find((v: Voucher) => v.code === selectedVoucher.code)) {
        setSelectedVoucher(null);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      setVouchers([]);
    } finally {
      setLoadingVouchers(false);
    }
  };

  // Check if voucher is applicable (meets minimum order amount)
  const isVoucherApplicable = (voucher: Voucher): boolean => {
    return cartTotal >= voucher.minAmountOrder;
  };

  // Calculate discount amount
  const calculateDiscount = (): number => {
    if (!selectedVoucher) return 0;
    // Only apply discount if voucher is applicable
    if (!isVoucherApplicable(selectedVoucher)) return 0;
    return (cartTotal * selectedVoucher.discount_percentage) / 100;
  };

  // Calculate final total after discount
  const finalTotal = (): number => {
    return Math.max(0, cartTotal - calculateDiscount());
  };

  // --- HÀM 1: TẠO ĐƠN HÀNG ---
  const handleCreateOrder = async () => {
    if (cart.length === 0) return;
    
    // Validate selected voucher before proceeding
    if (selectedVoucher && !isVoucherApplicable(selectedVoucher)) {
      alert(`Voucher "${selectedVoucher.voucher_name}" requires a minimum order of ${selectedVoucher.minAmountOrder.toLocaleString('en-US')}₫. Please select another voucher or deselect.`);
      return;
    }
    
    setStep('PROCESSING');
    
    try {
      // 1. Map CartItem sang DTO Backend
      const orderDetails: OrderDetailItemDTO[] = cart.map(item => {
        // Validate required fields
        if (!item.id) {
          throw new Error(`Cart item missing product ID`);
        }
        
        // Get option values - Backend expects optionId, not optionValue
        const optionIds = Object.values(item.selectedOptions || {}).map(id => id.toString()).filter(Boolean);
        
        // CRITICAL FIX: Backend expects Size.id (not ProductSize.id)
        // selectedSize.id is ProductSize ID, but we need selectedSize.size.id (the actual Size ID)
        const sizeId = item.selectedSize?.size?.id 
          ? item.selectedSize.size.id.toString() 
          : undefined;
        
        return {
          productId: item.id.toString(),
          quantity: item.quantity.toString(),
          sizeId: sizeId, // Use Size.id, not ProductSize.id
          note: item.note || '',
          // Map Topping: Backend yêu cầu { toppingId, quantity }
          toppingItems: item.selectedToppings && item.selectedToppings.length > 0
            ? item.selectedToppings.map(t => ({
                toppingId: t.id.toString(),
                quantity: "1" // Mặc định 1 topping cùng loại
              }))
            : undefined,
          // Map Option: Backend expects optionId (not optionValue)
          optionId: optionIds.length > 0 ? optionIds : []
        };
      });

      const customerPhone = localStorage.getItem('kiosk_phone') || undefined; // Fallback nếu lỗi

      const payload: CreateOrderPayload = {
        order_details: orderDetails,
        customerPhone: customerPhone ,
        staffId: '1', 
        note: `Kiosk Order - VNPAY`
      };

      console.log("Sending Payload:", JSON.stringify(payload, null, 2)); // Debug xem payload đúng chưa

      // 2. Gọi API Tạo đơn
      const res = await api.post('/order', payload);
      const newOrder = res.data; // Object Order trả về
      console.log("Order Created:", newOrder);
      
      // Validate order was created successfully
      if (!newOrder || !newOrder.id) {
        throw new Error("Order creation failed: Invalid response from server");
      }
      
      setOrderId(newOrder.id);

      // 3. VNPay Flow
      await handleVNPay(newOrder.id, newOrder.final_price || 0); // Dùng final_price từ response cho chuẩn

    } catch (error: any) {
      console.error("Lỗi tạo đơn:", error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.message || "Please try again";
      console.error("Full error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage
      });
      alert(`Error creating order: ${errorMessage}`);
      setStep('METHOD');
    }
  };

  // --- HÀM 2: LẤY LINK VNPAY & POLLING ---
  const handleVNPay = async (orderId: number, amount: number) => {
    try {
      // Gọi API lấy link thanh toán
      // Lưu ý: Backend trả về text url trực tiếp (dựa theo code service bạn gửi)
      // Only send voucher code if it's applicable
      const voucherCode = selectedVoucher && isVoucherApplicable(selectedVoucher) 
        ? selectedVoucher.code 
        : undefined;
      
      const payRes = await api.post('/order/paid/online', {
        orderId: orderId,
        amount: amount,
        ...(voucherCode && { voucherCode }),
        // Backend có thể tự tính amount từ DB, nhưng DTO có field này nên cứ gửi
      });

      const paymentUrl = payRes.data; // API trả về string URL
      if (paymentUrl && typeof paymentUrl === 'string' && paymentUrl.startsWith('http')) {
         setQrUrl(paymentUrl);
         
         // Open VNPay directly in new tab
         window.open(paymentUrl, '_blank');
         
         // Show QR code screen for reference and polling
         setStep('QR_SHOW');
         
         // Bắt đầu Polling kiểm tra trạng thái
         startPolling(orderId);
      } else {
        alert("Unable to get payment link. Please try again.");
        setStep('METHOD');
      }

    } catch (error) {
       console.error("VNPay Error:", error);
       alert("VNPay connection error");
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
        <h1 className="text-xl font-bold">Order Payment</h1>
      </header>

      {/* BODY */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        
        {/* VIEW 1: CHỌN PHƯƠNG THỨC */}
        {step === 'METHOD' && (
          <div className="w-full max-w-4xl space-y-6">
            {/* Voucher Selection Section */}
            {isClient && isCustomerLoggedIn && (
              <div className="bg-white rounded-2xl shadow-sm border-2 border-orange-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="text-orange-600" size={24} />
                    <h3 className="text-xl font-bold text-gray-900">Promo Code</h3>
                  </div>
                  {selectedVoucher && (
                    <button
                      onClick={() => setSelectedVoucher(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                {loadingVouchers ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="animate-spin text-orange-600" size={24} />
                    <span className="ml-2 text-gray-600">Loading vouchers...</span>
                  </div>
                ) : vouchers.length > 0 ? (
                  <div className="space-y-3">
                    <select
                      value={selectedVoucher?.code || ''}
                      onChange={(e) => {
                        const voucher = vouchers.find((v: Voucher) => v.code === e.target.value);
                        setSelectedVoucher(voucher || null);
                      }}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg font-medium focus:border-orange-500 focus:outline-none transition-colors"
                    >
                      <option value="">-- Select voucher --</option>
                      {vouchers.map((voucher) => {
                        const applicable = isVoucherApplicable(voucher);
                        return (
                          <option 
                            key={voucher.id} 
                            value={voucher.code}
                            disabled={!applicable}
                            style={{ color: applicable ? 'inherit' : '#9ca3af' }}
                          >
                            {voucher.voucher_name} - {voucher.discount_percentage}% off 
                            {voucher.minAmountOrder > 0 && ` (Min ${voucher.minAmountOrder.toLocaleString('en-US')}₫)`}
                            {!applicable && ' ⚠️ Not eligible'}
                          </option>
                        );
                      })}
                    </select>

                    {selectedVoucher && (
                      <div className={`rounded-xl p-4 space-y-2 border-2 ${
                        isVoucherApplicable(selectedVoucher) 
                          ? 'bg-orange-50 border-orange-200' 
                          : 'bg-yellow-50 border-yellow-300'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">Code:</span>
                          <span className="text-orange-600 font-bold">{selectedVoucher.code}</span>
                        </div>
                        {!isVoucherApplicable(selectedVoucher) && (
                          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-yellow-800 text-sm font-medium">
                            ⚠️ This voucher requires a minimum order of {selectedVoucher.minAmountOrder.toLocaleString('en-US')}₫. 
                            Your current cart: {cartTotal.toLocaleString('en-US')}₫
                          </div>
                        )}
                        {isVoucherApplicable(selectedVoucher) && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700 font-medium">Discount:</span>
                              <span className="text-green-600 font-bold">
                                -{calculateDiscount().toLocaleString('en-US')}₫ ({selectedVoucher.discount_percentage}%)
                              </span>
                            </div>
                            <div className="pt-2 border-t border-orange-200 flex items-center justify-between">
                              <span className="text-gray-900 font-bold text-lg">Total Payment:</span>
                              <span className="text-orange-600 font-bold text-xl">
                                {finalTotal().toLocaleString('en-US')}₫
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    You don't have any available vouchers
                  </p>
                )}
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>{cartTotal.toLocaleString('en-US')}₫</span>
                </div>
                {selectedVoucher && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({selectedVoucher.discount_percentage}%):</span>
                    <span>-{calculateDiscount().toLocaleString('en-US')}₫</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total:</span>
                  <span className="text-orange-600">{finalTotal().toLocaleString('en-US')}₫</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex justify-center">
            <button 
              onClick={() => handleCreateOrder()}
              className="group bg-white p-10 rounded-3xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-blue-100 transition-all flex flex-col items-center gap-6 w-full max-w-md"
            >
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode size={48} />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800">Scan QR Code / VNPay</h3>
                <p className="text-gray-500 mt-2">Quick payment via banking app</p>
              </div>
            </button>
            </div>
          </div>
        )}

        {/* VIEW 2: LOADING */}
        {step === 'PROCESSING' && (
           <div className="flex flex-col items-center gap-6">
              <Loader2 className="animate-spin text-orange-600 w-16 h-16" />
              <p className="text-2xl font-medium text-gray-600">Creating order...</p>
           </div>
        )}

        {/* VIEW 3: HIỂN THỊ QR CODE */}
        {step === 'QR_SHOW' && (
           <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full animate-in zoom-in duration-300">
              <h2 className="text-2xl font-bold mb-8">Scan code to pay</h2>
              
              <div className="bg-white p-4 border-2 border-orange-100 rounded-2xl inline-block shadow-inner mb-6">
                  <QRCodeCanvas 
                    value={qrUrl} 
                    size={280}
                    level={"H"}
                    includeMargin={true}
                  />
              </div>

              {/* Button to open VNPay directly */}
              <div className="mb-6">
                <button
                  onClick={() => window.open(qrUrl, '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <QrCode size={24} />
                  <span>Open VNPay to Scan QR Code</span>
                </button>
                <p className="text-xs text-gray-500 mt-2">Or scan the QR code above with your banking app</p>
              </div>

              <div className="flex items-center justify-center gap-3 text-orange-600 font-medium text-lg bg-orange-50 py-3 rounded-xl">
                 <Loader2 className="animate-spin" size={24} />
                 Waiting for bank confirmation...
              </div>
              <p className="text-sm text-gray-400 mt-6">Please complete payment in the opened VNPay window</p>
           </div>
        )}

        {/* VIEW 4: SUCCESS */}
        {step === 'SUCCESS' && (
           <div className="text-center space-y-6 animate-in slide-in-from-bottom duration-500">
              <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                 <CheckCircle size={64} strokeWidth={3} />
              </div>
              <div>
                 <h2 className="text-4xl font-bold text-gray-900">Order successful!</h2>
                 <p className="text-xl text-gray-500 mt-3">
                   Your order number is: <span className="font-bold text-gray-900 text-2xl">#{orderId}</span>
                 </p>
                 <p className="text-green-600 font-medium mt-2">Payment successful</p>
              </div>
              
              <div className="pt-10">
                 <button 
                   onClick={() => router.push('/kiosk')}
                   className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all"
                 >
                   Back to Home (10s)
                 </button>
              </div>
           </div>
        )}

      </main>
    </div>
  );
}