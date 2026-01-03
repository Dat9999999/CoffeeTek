'use client';

import { useState, useEffect } from 'react';
import { X, Minus, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Size, Topping, CartItem } from '../types';
import { getImageUrl } from "@/utils/image";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  editingItem?: CartItem | null;
}

export default function ProductModal({ product, isOpen, onClose, onAddToCart, editingItem }: ProductModalProps) {
  // State quản lý lựa chọn của khách
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<Size | undefined>();
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({}); // { GroupId: ValueId }
  const [note, setNote] = useState('');

  // Reset state khi mở món mới hoặc edit item
  useEffect(() => {
    if (product) {
      // Nếu đang edit, load data từ editingItem
      if (editingItem) {
        setQuantity(editingItem.quantity);
        setSelectedSize(editingItem.selectedSize);
        setSelectedToppings(editingItem.selectedToppings);
        setSelectedOptions(editingItem.selectedOptions);
        setNote(editingItem.note || '');
      } else {
        // Nếu thêm mới, reset về mặc định
        setQuantity(1);
        setSelectedToppings([]);
        setSelectedOptions({});
        setNote('');
        
        // Tự động chọn size đầu tiên nếu có nhiều size
        if (product.is_multi_size && product.sizes.length > 0) {
          setSelectedSize(product.sizes[0]); 
        } else {
          setSelectedSize(undefined);
        }

        // Tự động chọn option đầu tiên của mỗi group
        const defaultOptions: Record<number, number> = {};
        product.optionGroups.forEach(group => {
          if (group.values.length > 0) {
            defaultOptions[group.id] = group.values[0].id;
          }
        });
        setSelectedOptions(defaultOptions);
      }
    }
  }, [product, editingItem]);

  if (!product || !isOpen) return null;

  // Tính giá
  const basePrice = product.is_multi_size && selectedSize ? selectedSize.price : product.price;
  const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const unitPrice = basePrice + toppingsPrice;
  const totalPrice = unitPrice * quantity;

  // Xử lý thêm vào giỏ hoặc cập nhật
  const handleAddToCart = () => {
    onAddToCart({
      ...product,
      cartId: editingItem?.cartId || Math.random().toString(36).substr(2, 9),
      quantity,
      selectedSize,
      selectedToppings,
      selectedOptions,
      totalPrice,
      note
    });
    onClose();
  };

  const toggleTopping = (topping: Topping) => {
    const exists = selectedToppings.find(t => t.id === topping.id);
    if (exists) {
      setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        {/* Backdrop mờ */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row"
        >
          {/* Nút đóng */}
          <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>

          {/* CỘT TRÁI: ẢNH (40%) */}
          <div className="w-full md:w-2/5 bg-gray-100 h-64 md:h-full relative">
            <img 
              src={getImageUrl(product.images?.[0]?.image_name)} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* CỘT PHẢI: FORM CHỌN (60%) */}
          <div className="flex-1 flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              
              {/* Header Tên & Giá */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
                <p className="text-gray-500 mt-2 text-sm">{product.product_detail}</p>
                <div className="text-3xl font-bold text-orange-600 mt-2">
                  {unitPrice.toLocaleString()}đ
                </div>
              </div>

              {/* 1. CHỌN SIZE (Nếu có) */}
              {product.is_multi_size && product.sizes.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    Select Size <span className="text-red-500">*</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[100px] px-4 py-3 rounded-xl border-2 font-bold transition-all relative
                          ${selectedSize?.id === size.id 
                            ? 'border-orange-500 bg-orange-50 text-orange-700' 
                            : 'border-gray-200 text-gray-600 hover:border-orange-200'}`}
                      >
                        {size.size.name}
                        <div className="text-sm font-normal opacity-80">{size.price.toLocaleString()}đ</div>
                        {selectedSize?.id === size.id && (
                          <div className="absolute top-[-8px] right-[-8px] bg-orange-500 text-white p-1 rounded-full">
                            <Check size={12} strokeWidth={4} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. CHỌN OPTIONS (Đường/Đá...) */}
              {product.optionGroups.map((group) => (
                <div key={group.id}>
                  <h3 className="font-bold text-gray-900 mb-3">{group.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.values.map((val) => (
                      <button
                        key={val.id}
                        onClick={() => setSelectedOptions(prev => ({ ...prev, [group.id]: val.id }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${selectedOptions[group.id] === val.id 
                            ? 'bg-gray-800 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {val.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* 3. CHỌN TOPPING */}
              {product.toppings.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Add Topping</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.toppings.map((topping) => {
                      const isSelected = selectedToppings.some(t => t.id === topping.id);
                      return (
                        <button
                          key={topping.id}
                          onClick={() => toggleTopping(topping)}
                          className={`flex items-center p-3 rounded-xl border transition-all text-left
                            ${isSelected 
                              ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' 
                              : 'border-gray-100 hover:border-gray-300'}`}
                        >
                          {/* Ảnh Topping (nếu có) */}
                          <div className="w-10 h-10 rounded-lg bg-gray-200 mr-3 overflow-hidden flex-shrink-0">
                             {topping.image_name && (
                               <img src={getImageUrl(topping.image_name)} className="w-full h-full object-cover" />
                             )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{topping.name}</div>
                            <div className="text-sm text-gray-500">+{topping.price.toLocaleString()}đ</div>
                          </div>
                          {isSelected && <Check size={20} className="text-orange-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. GHI CHÚ */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Note for store</h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Example: Less sweet, more ice..."
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm h-24 resize-none"
                />
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="p-6 bg-white border-t border-gray-100 flex items-center gap-4">
              {/* Tăng giảm số lượng */}
              <div className="flex items-center gap-4 bg-gray-100 rounded-xl p-2">
                <button 
                  onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                  className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-800 disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <Minus size={20} />
                </button>
                <span className="text-xl font-bold w-6 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-800"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Nút Thêm vào giỏ hoặc Cập nhật */}
              <button 
                onClick={handleAddToCart}
                disabled={product.is_multi_size && !selectedSize}
                className="flex-1 bg-orange-600 text-white h-14 rounded-xl font-bold text-lg hover:bg-orange-500 active:scale-95 transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between px-6"
              >
                <span>{editingItem ? 'Update' : 'Add to Cart'}</span>
                <span>{totalPrice.toLocaleString()}đ</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}