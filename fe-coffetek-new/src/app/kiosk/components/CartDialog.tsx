'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, Edit2, ShoppingCart, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem, Product } from '../types';
import { getImageUrl } from '@/utils/image';
import ProductModal from './ProductModal';

interface CartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDialog({ isOpen, onClose, onCheckout }: CartDialogProps) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
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
    // Dispatch event to notify other components
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
    if (confirm('Are you sure you want to clear all items from your cart?')) {
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
    setIsProductModalOpen(true);
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
    setIsProductModalOpen(false);
    setEditingItem(null);
    setSelectedProduct(null);
  };

  // Go to payment page
  const goToPayment = () => {
    console.log('goToPayment');
    window.location.href = '/kiosk/login';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Dialog Content */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <ShoppingCart className="text-orange-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Cart</h2>
                <p className="text-sm text-gray-500">{totalItems} items</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Body - Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="text-gray-400" size={48} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Empty Cart</h3>
                  <p className="text-gray-500">Please add items to your cart</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => {
                  const imgUrl = item.images && item.images.length > 0 
                    ? getImageUrl(item.images[0].image_name) 
                    : 'https://via.placeholder.com/150?text=No+Image';
                  
                  return (
                    <div
                      key={item.cartId}
                      className="bg-gray-50 rounded-2xl border-2 border-gray-100 p-4 hover:border-orange-200 transition-all"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                          <img 
                            src={imgUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                              {item.name}
                            </h3>
                            <button
                              onClick={() => deleteItem(item.cartId)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          {/* Size */}
                          {item.selectedSize && (
                            <p className="text-xs text-gray-600 mb-1">
                              Size: <span className="font-medium">{item.selectedSize.size.name}</span>
                            </p>
                          )}

                          {/* Toppings */}
                          {item.selectedToppings.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-600 mb-1">Topping:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.selectedToppings.map((topping) => (
                                  <span
                                    key={topping.id}
                                    className="inline-block bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs font-medium"
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
                              <p className="text-xs text-gray-600 mb-1">Options:</p>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(item.selectedOptions).map(([groupId, valueId]) => {
                                  const group = item.optionGroups.find(g => g.id === Number(groupId));
                                  const value = group?.values.find(v => v.id === valueId);
                                  return value ? (
                                    <span
                                      key={`${groupId}-${valueId}`}
                                      className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium"
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
                              <p className="text-xs text-gray-500 italic">Note: {item.note}</p>
                            </div>
                          )}

                          {/* Price and Actions */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
                                <button
                                  onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus size={16} className={item.quantity <= 1 ? 'text-gray-300' : 'text-gray-700'} />
                                </button>
                                <span className="font-bold text-gray-900 min-w-[1.5rem] text-center text-sm">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <Plus size={16} className="text-gray-700" />
                                </button>
                              </div>

                              {/* Edit Button */}
                              <button
                                onClick={() => handleEditItem(item)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg font-medium hover:bg-orange-100 transition-colors text-sm"
                              >
                                <Edit2 size={14} />
                                Edit
                              </button>
                            </div>

                            {/* Total Price */}
                            <div className="text-right">
                              <p className="text-lg font-bold text-orange-600">
                                {item.totalPrice.toLocaleString('en-US')}₫
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
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={clearCart}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors text-sm"
                    >
                      <Trash2 size={16} />
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer - Summary and Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm">Total Items</p>
                  <p className="text-xl font-bold text-gray-900">{totalItems} items</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 text-sm">Total Payment</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {totalAmount.toLocaleString('en-US')}₫
                  </p>
                </div>
              </div>
            </div>
          )}
          <button onClick = {goToPayment} className="w-full h-14 bg-orange-600 text-white rounded-xl font-bold text-lg hover:bg-orange-500 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200">
            <ShoppingCart size={20} />
            Checkout
          </button>
        </motion.div>
      </div>

      {/* Edit Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingItem(null);
          setSelectedProduct(null);
        }}
        onAddToCart={editingItem ? handleUpdateFromModal : () => {}}
        editingItem={editingItem}
      />
    </AnimatePresence>
  );
}
