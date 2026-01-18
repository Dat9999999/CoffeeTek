'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, ChevronLeft, Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Category, Product, CartItem } from '../types';
import ProductModal from '../components/ProductModal';
import { getImageUrl } from "@/utils/image";
import CartDialog from '../components/CartDialog';

export default function KioskMenuPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State Giỏ hàng
  const [cart, setCart] = useState<CartItem[]>([]);

  // State Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);

  // --- 1. LẤY DANH MỤC LÚC ĐẦU ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories', {
          params: { page: 1, size: 100 }
        });
        // Kiểm tra cấu trúc trả về của Backend (thường là res.data.data hoặc res.data)
        const cats = res.data.data || res.data; 
        setCategories(cats);
        
        // Mặc định chọn danh mục đầu tiên
        if (cats.length > 0) {
          setActiveCategoryId(cats[0].id);
        }
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    };
    fetchCategories();

    // Load giỏ hàng từ LocalStorage (nếu khách quay lại trang này)
    const savedCart = localStorage.getItem('kiosk_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // --- 2. LẤY SẢN PHẨM KHI ĐỔI DANH MỤC ---
  useEffect(() => {
    if (!activeCategoryId) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Gọi API endpoint POS để lấy full topping/size
        const res = await api.get('/products/pos', {
          params: {
            page: 1,
            size: 100,
            categoryId: activeCategoryId
          }
        });
        const prods = res.data.data || res.data;
        setProducts(prods);
      } catch (err) {
        console.error("Lỗi lấy sản phẩm:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategoryId]);

  // --- 3. XỬ LÝ CART ---
  
  // Tính tổng tiền giỏ hàng
  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Mở Modal chọn món
  const handleProductClick = (product: Product) => {
    // Don't open modal if product is disabled
    if (product.isActive === false) {
      return;
    }
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Thêm vào giỏ (Callback từ Modal)
  const handleAddToCartFromModal = (newItem: CartItem) => {
    const updatedCart = [...cart, newItem];
    setCart(updatedCart);
    // Lưu ngay vào LocalStorage để trang Payment đọc được
    localStorage.setItem('kiosk_cart', JSON.stringify(updatedCart));
    // Dispatch event để các trang khác cập nhật
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Chuyển sang trang thanh toán (fallback, but CartDialog handles payment now)
  const goToPayment = () => {
    router.push('/kiosk/login');
  };

  const renderPrice = (product: Product) => {
    // 1. Nếu sản phẩm không có nhiều size -> Lấy giá gốc
    if (!product.is_multi_size) {
      return product.price 
        ? `${product.price.toLocaleString()}đ` 
        : 'Contact us';
    }

    // 2. Nếu có nhiều size -> Tìm Min và Max
    if (product.sizes && product.sizes.length > 0) {
      // Lấy danh sách giá từ mảng sizes
      const prices = product.sizes.map(s => s.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      // Nếu chỉ có 1 size hoặc giá min = max
      if (minPrice === maxPrice) {
        return `${minPrice.toLocaleString()}đ`;
      }

      // Trả về dạng khoảng giá: 30.000 - 45.000đ
      return `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}đ`;
    }

    return 'Price not available';
  };


  return (
    <div className="h-full flex flex-col bg-gray-50">
      
      {/* HEADER */}
      <header className="h-20 bg-white shadow-sm flex items-center px-6 justify-between flex-shrink-0 z-20">
        <button 
          onClick={() => window.location.href = '/'} 
          className="flex items-center gap-2 text-gray-600 font-medium active:scale-95 transition-transform"
        >
          <div className="p-2 bg-gray-100 rounded-full"><ChevronLeft size={24} /></div>
          <span>Home</span>
        </button>
        <div className="font-bold text-xl text-orange-600">COFFEE TEK <span className="text-gray-400 font-normal">| Kiosk</span></div>
      </header>

      {/* BODY */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR DANH MỤC */}
        <aside className="w-1/4 bg-white border-r border-gray-100 overflow-y-auto">
          <div className="p-4 space-y-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`w-full p-6 rounded-xl text-left text-lg font-bold transition-all shadow-sm
                  ${activeCategoryId === cat.id 
                    ? 'bg-orange-600 text-white shadow-orange-200 ring-4 ring-orange-100' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN GRID SẢN PHẨM */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-orange-600 gap-3">
              <Loader2 className="animate-spin" size={48} />
              <p className="font-medium">Loading menu...</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6 pb-32">
              {products.map(product => {
                // Xử lý ảnh an toàn
                const imgUrl = product.images && product.images.length > 0 
                  ? getImageUrl(product.images[0].image_name) 
                  : 'https://via.placeholder.com/300?text=No+Image';
                
                const isDisabled = product.isActive === false;
                
                return (
                  <div 
                    key={product.id}
                    onClick={() => handleProductClick(product)} // Mở Modal
                    className={`bg-white rounded-2xl p-4 shadow-sm border border-transparent transition-all duration-200 group relative ${
                      isDisabled 
                        ? 'opacity-60 cursor-not-allowed grayscale' 
                        : 'hover:border-orange-200 active:scale-95 cursor-pointer'
                    }`}
                  >
                    {/* Disabled overlay badge */}
                    {isDisabled && (
                      <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        Out of Stock
                      </div>
                    )}
                    
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4 relative">
                      <img 
                        src={imgUrl} 
                        alt={product.name} 
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          isDisabled ? '' : 'group-hover:scale-105'
                        }`} 
                      />
                      {!isDisabled && (
                      <div className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-lg text-orange-600">
                        <Plus size={24} strokeWidth={3} />
                      </div>
                      )}
                    </div>
                    
                    <h3 className={`font-bold text-lg line-clamp-2 min-h-[3.5rem] ${
                      isDisabled ? 'text-gray-400' : 'text-gray-800'
                    }`}>
                      {product.name}
                    </h3>
                    
                    <div className="mt-2 flex flex-col items-start">
                      <span className={`font-bold text-xl ${
                        isDisabled ? 'text-gray-400' : 'text-orange-600'
                      }`}>
                      {renderPrice(product)}
                    </span>
                      {product.old_price && (
                        <span className="text-gray-400 text-sm line-through decoration-1">
                          {product.old_price.toLocaleString()}đ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Hiển thị khi không có món */}
              {!loading && products.length === 0 && (
                 <div className="col-span-3 text-center py-20 text-gray-400">
                    <p>No items in this category.</p>
                 </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* FLOATING CART BAR */}
      {cart.length > 0 && (
        <div className="absolute bottom-6 left-6 right-6 z-30 animate-in slide-in-from-bottom-10 fade-in duration-300">
           <div className="bg-gray-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-gray-700/50 backdrop-blur-xl">
              <button 
                onClick={() => setIsCartDialogOpen(true)}
                className="flex items-center gap-5 px-4 hover:opacity-80 transition-opacity"
              >
                <div className="bg-orange-500 p-4 rounded-full relative shadow-lg shadow-orange-900/50">
                  <ShoppingCart size={28} />
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold border-2 border-gray-900">
                    {totalItems}
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-gray-400 text-sm font-medium">Subtotal</span>
                  <span className="text-2xl font-bold tracking-tight">{totalAmount.toLocaleString()}đ</span>
                </div>
              </button>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCartDialogOpen(true)}
                  className="bg-gray-700 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-gray-600 active:scale-95 transition-all"
                >
                  View Cart
                </button>
                 
              </div>
           </div>
        </div>
      )}

      {/* MODAL CHỌN MÓN */}
      <ProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCartFromModal}
      />

      {/* CART DIALOG */}
      <CartDialog
        isOpen={isCartDialogOpen}
        onClose={() => setIsCartDialogOpen(false)}
        onCheckout={goToPayment}
      />
    </div>
  );
}