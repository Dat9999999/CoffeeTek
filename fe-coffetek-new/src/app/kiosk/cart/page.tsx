'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Trash2, Plus, Minus, Edit2, ShoppingCart, X } from 'lucide-react';
import { CartItem } from '../types';
import { getImageUrl } from '@/utils/image';
import ProductModal from '../components/ProductModal';
import { Product } from '../types';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem('kiosk_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    };
    
    loadCart();
    
    // Listen for storage changes (when cart is updated from other tabs/pages)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kiosk_cart') {
        loadCart();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event (same tab updates)
    const handleCartUpdate = () => {
      loadCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('kiosk_cart', JSON.stringify(cart));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cart]);

  // Calculate totals
  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Update quantity
  const updateQuantity = (cartId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.cartId === cartId) {
          const unitPrice = calculateUnitPrice(item);
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: unitPrice * newQuantity,
          };
        }
        return item;
      });
    });
  };

  // Calculate unit price for an item
  const calculateUnitPrice = (item: CartItem): number => {
    const basePrice = item.is_multi_size && item.selectedSize 
      ? item.selectedSize.price 
      : item.price;
    const toppingsPrice = item.selectedToppings.reduce((sum, t) => sum + t.price, 0);
    return basePrice + toppingsPrice;
  };

  // Delete item
  const deleteItem = (cartId: string) => {
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
  };

  // Clear all items
  const clearCart = () => {
    if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      setCart([]);
      localStorage.removeItem('kiosk_cart');
    }
  };

  // Edit item - open modal with product data
  const handleEditItem = (item: CartItem) => {
    // Convert CartItem back to Product format for modal
    const product: Product = {
      id: item.id,
      name: item.name,
      price: item.price,
      old_price: item.old_price,
      is_multi_size: item.is_multi_size,
      product_detail: item.product_detail,
      categoryId: item.categoryId,
      images: item.images,
      sizes: item.sizes,
      toppings: item.toppings,
      optionGroups: item.optionGroups,
    };
    
    setSelectedProduct(product);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Handle update from modal
  const handleUpdateFromModal = (updatedItem: CartItem) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.cartId === editingItem?.cartId) {
          return {
            ...updatedItem,
            cartId: item.cartId, // Keep the same cartId
          };
        }
        return item;
      });
    });
    setIsModalOpen(false);
    setEditingItem(null);
    setSelectedProduct(null);
  };

  // Handle add new item (if coming from menu)
  const handleAddToCart = (newItem: CartItem) => {
    setCart(prevCart => [...prevCart, newItem]);
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Go to payment
  const goToPayment = () => {
    router.push('/kiosk/login');
  };

  // Go back to menu
  const goToMenu = () => {
    router.push('/kiosk/menu');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <header className="h-20 bg-white shadow-sm flex items-center px-6 justify-between flex-shrink-0">
        <button 
          onClick={goToMenu}
          className="flex items-center gap-2 text-gray-600 font-medium active:scale-95 transition-transform"
        >
          <div className="p-2 bg-gray-100 rounded-full">
            <ChevronLeft size={24} />
          </div>
          <span>Tiếp tục mua hàng</span>
        </button>
        <div className="font-bold text-xl text-orange-600">
          Giỏ hàng
        </div>
        <div className="w-24" /> {/* Spacer for centering */}
      </header>

      {/* BODY */}
      <main className="flex-1 overflow-y-auto p-6">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="text-gray-400" size={64} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
              <p className="text-gray-500 text-lg">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
            </div>
            <button
              onClick={goToMenu}
              className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-500 active:scale-95 transition-all"
            >
              Xem thực đơn
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Cart Items List */}
            {cart.map((item) => {
              const imgUrl = item.images && item.images.length > 0 
                ? getImageUrl(item.images[0].image_name) 
                : 'https://via.placeholder.com/150?text=No+Image';
              
              return (
                <div
                  key={item.cartId}
                  className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6 hover:border-orange-200 transition-all"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img 
                        src={imgUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => deleteItem(item.cartId)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-4"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {/* Size */}
                      {item.selectedSize && (
                        <p className="text-sm text-gray-600 mb-1">
                          Size: <span className="font-medium">{item.selectedSize.size.name}</span>
                        </p>
                      )}

                      {/* Toppings */}
                      {item.selectedToppings.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 mb-1">Topping:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.selectedToppings.map((topping) => (
                              <span
                                key={topping.id}
                                className="inline-block bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-xs font-medium"
                              >
                                {topping.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Options */}
                      {Object.keys(item.selectedOptions).length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 mb-1">Tùy chọn:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(item.selectedOptions).map(([groupId, valueId]) => {
                              const group = item.optionGroups.find(g => g.id === Number(groupId));
                              const value = group?.values.find(v => v.id === valueId);
                              return value ? (
                                <span
                                  key={`${groupId}-${valueId}`}
                                  className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium"
                                >
                                  {group?.name}: {value.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Note */}
                      {item.note && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 italic">Ghi chú: {item.note}</p>
                        </div>
                      )}

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-2">
                            <button
                              onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                              className="p-1 hover:bg-white rounded-lg transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={20} className={item.quantity <= 1 ? 'text-gray-300' : 'text-gray-700'} />
                            </button>
                            <span className="font-bold text-gray-900 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                              className="p-1 hover:bg-white rounded-lg transition-colors"
                            >
                              <Plus size={20} className="text-gray-700" />
                            </button>
                          </div>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditItem(item)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl font-medium hover:bg-orange-100 transition-colors"
                          >
                            <Edit2 size={18} />
                            Sửa
                          </button>
                        </div>

                        {/* Total Price */}
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Thành tiền</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {item.totalPrice.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Clear Cart Button */}
            {cart.length > 0 && (
              <div className="flex justify-end pt-4">
                <button
                  onClick={clearCart}
                  className="flex items-center gap-2 px-6 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                >
                  <Trash2 size={20} />
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER - Summary and Checkout */}
      {cart.length > 0 && (
        <footer className="bg-white border-t-2 border-gray-200 p-6 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-600 text-sm">Tổng số lượng</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems} sản phẩm</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm">Tổng thanh toán</p>
                <p className="text-3xl font-bold text-orange-600">
                  {totalAmount.toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>
            <button
              onClick={() => goToPayment()}
              className="w-full h-16 bg-orange-600 text-white rounded-2xl font-bold text-xl hover:bg-orange-500 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
            >
              Thanh toán
            </button>
          </div>
        </footer>
      )}

      {/* Edit Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
          setSelectedProduct(null);
        }}
        onAddToCart={editingItem ? handleUpdateFromModal : handleAddToCart}
        editingItem={editingItem}
      />
    </div>
  );
}

