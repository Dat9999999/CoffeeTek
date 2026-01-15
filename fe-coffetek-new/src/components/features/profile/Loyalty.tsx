"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gift, 
  Star, 
  Coins, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Sparkles,
  Tag
} from "lucide-react";
import { voucherService } from "@/services/voucherService";
import { useProfileStore } from "@/store/useProfileStore";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import type { Voucher } from "@/interfaces";

interface LoyaltyProps {
  loyalty: any;
}

interface GroupedVoucher {
  group_name: string;
  voucher_name: string;
  discount_percentage: number;
  minAmountOrder: number;
  requirePoint: number;
  valid_from: string;
  valid_to: string;
  count: number; // Number of available vouchers in this group
  sampleVoucher: Voucher; // One voucher from the group for display
  userHasThisType: boolean; // Whether user already has a voucher from this group
}

export default function Loyalty({ loyalty }: LoyaltyProps) {
  const { user } = useProfileStore();
  const points = loyalty?.points || 0;
  
  const [groupedVouchers, setGroupedVouchers] = useState<GroupedVoucher[]>([]);
  const [myVouchers, setMyVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [exchangingGroup, setExchangingGroup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"available" | "my-vouchers">("available");

  useEffect(() => {
    if (user?.phone_number) {
      // Fetch my vouchers first, then available vouchers (so we can check which groups user already has)
      fetchMyVouchers().then(() => {
        fetchAvailableVouchers();
      });
    }
  }, [user?.phone_number]);

  const fetchAvailableVouchers = async () => {
    try {
      setLoading(true);
      const response = await voucherService.getAll({
        page: 1,
        size: 1000, // Get more to group properly
        isActive: true,
      });
      
      const now = new Date();
      // Filter: customerPhone is null (not exchanged), is_active, and not expired
      const available = (response.data || []).filter((voucher: Voucher) => {
        if (voucher.customerPhone) return false; // Already exchanged
        if (!voucher.is_active) return false; // Not active
        
        const validFrom = new Date(voucher.valid_from);
        const validTo = new Date(voucher.valid_to);
        return now >= validFrom && now <= validTo; // Not expired
      });
      
      // Group vouchers by group_name
      const grouped = available.reduce((acc: Record<string, Voucher[]>, voucher: Voucher) => {
        const key = voucher.group_name || 'ungrouped';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(voucher);
        return acc;
      }, {});
      
      // Get user's existing vouchers to check which groups they already have
      const currentMyVouchers = myVouchers.length > 0 ? myVouchers : (await fetchMyVouchers() || []);
      const userVoucherGroups = new Set(
        currentMyVouchers.map((v: Voucher) => v.group_name).filter(Boolean)
      );
      
      // Convert to GroupedVoucher array
      const groupedArray: GroupedVoucher[] = Object.entries(grouped).map(([group_name, vouchers]) => {
        const sampleVoucher = vouchers[0]; // Use first voucher as sample
        return {
          group_name,
          voucher_name: sampleVoucher.voucher_name,
          discount_percentage: sampleVoucher.discount_percentage,
          minAmountOrder: sampleVoucher.minAmountOrder,
          requirePoint: sampleVoucher.requirePoint,
          valid_from: sampleVoucher.valid_from,
          valid_to: sampleVoucher.valid_to,
          count: vouchers.length,
          sampleVoucher: sampleVoucher,
          userHasThisType: userVoucherGroups.has(group_name), // Check if user already has this type
        };
      });
      
      setGroupedVouchers(groupedArray);
    } catch (error: any) {
      console.error("Error fetching available vouchers:", error);
      toast.error("Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVouchers = async () => {
    if (!user?.phone_number) return;
    
    try {
      const response = await voucherService.getUserActiveVoucher(user.phone_number);
      
      const now = new Date();
      // Filter out expired vouchers
      const validVouchers = (response || []).filter((voucher: Voucher) => {
        if (!voucher.is_active) return false;
        const validFrom = new Date(voucher.valid_from);
        const validTo = new Date(voucher.valid_to);
        return now >= validFrom && now <= validTo;
      });
      
      setMyVouchers(validVouchers);
      return validVouchers; // Return for use in fetchAvailableVouchers
    } catch (error: any) {
      console.error("Error fetching my vouchers:", error);
      // Don't show error toast for this, just log it
      return [];
    }
  };

  const handleExchange = async (groupName: string, requirePoint: number) => {
    if (!user?.phone_number) {
      toast.error("Please login to redeem voucher");
      return;
    }

    // Check if user already has a voucher from this group
    const userHasThisType = myVouchers.some((v: Voucher) => v.group_name === groupName);
    if (userHasThisType) {
      toast.error("Bạn đã có voucher loại này rồi! Mỗi loại voucher chỉ được đổi một lần.");
      return;
    }

    if (points < requirePoint) {
      toast.error(`Bạn không đủ điểm! Cần ${requirePoint} điểm, bạn có ${points} điểm.`);
      return;
    }

    try {
      setExchangingGroup(groupName);
      await voucherService.exchangeByGroup(groupName, user.phone_number);
      toast.success("Voucher redeemed successfully!");
      
      // Refresh data
      await Promise.all([fetchMyVouchers(), fetchAvailableVouchers()]);
      
      // Refresh profile to update points
      const { fetchProfile } = useProfileStore.getState();
      await fetchProfile();
    } catch (error: any) {
      console.error("Error exchanging voucher:", error);
      const errorMessage = error.message || error.response?.data?.message || "Không thể đổi voucher";
      toast.error(errorMessage);
    } finally {
      setExchangingGroup(null);
    }
  };

  const canAfford = (requirePoint: number): boolean => {
    return points >= requirePoint;
  };

  return (
    <div className="space-y-6">
      {/* Header with Points */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
              Điểm tích lũy của bạn
            </h3>
            <p className="text-gray-600">Sử dụng điểm để đổi voucher giảm giá</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-amber-600 mb-1">
              {points.toLocaleString("vi-VN")}
            </div>
            <div className="text-sm text-gray-600">điểm</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("available")}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === "available"
              ? "text-orange-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Voucher có sẵn
          {activeTab === "available" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("my-vouchers")}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === "my-vouchers"
              ? "text-orange-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Voucher của tôi
          {myVouchers.length > 0 && (
            <Badge className="ml-2 bg-orange-600 text-white text-xs">
              {myVouchers.length}
            </Badge>
          )}
          {activeTab === "my-vouchers" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"
            />
          )}
        </button>
      </div>

      {/* Content */}
      {loading && activeTab === "available" ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === "available" ? (
            <motion.div
              key="available"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {groupedVouchers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">
                    No vouchers available
                  </h4>
                  <p className="text-gray-500">
                    Please check back later for new vouchers
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedVouchers.map((group) => (
                    <motion.div
                      key={group.group_name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all shadow-sm hover:shadow-md overflow-hidden"
                    >
                      <div className="p-5">
                        {/* Voucher Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 mb-1">
                              {group.voucher_name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                                {group.discount_percentage}% OFF
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                                {group.count} vouchers left
                              </Badge>
                            </div>
                          </div>
                          <Sparkles className="w-6 h-6 text-amber-500" />
                        </div>

                        {/* Discount Info */}
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Discount:</span>
                            <span className="font-bold text-orange-600">
                              {group.discount_percentage}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-gray-600">Min Order:</span>
                            <span className="font-semibold text-gray-900">
                              {group.minAmountOrder.toLocaleString("vi-VN")}₫
                            </span>
                          </div>
                        </div>

                        {/* Valid Date */}
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(group.valid_from).toLocaleDateString("vi-VN")} -{" "}
                            {new Date(group.valid_to).toLocaleDateString("vi-VN")}
                          </span>
                        </div>

                        {/* Exchange Button */}
                        {group.userHasThisType ? (
                          <div className="w-full py-3 rounded-lg bg-green-100 text-green-700 font-semibold flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            You have this voucher
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleExchange(group.group_name, group.requirePoint)}
                              disabled={
                                exchangingGroup === group.group_name ||
                                !canAfford(group.requirePoint) ||
                                group.count === 0
                              }
                              className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                canAfford(group.requirePoint) && group.count > 0
                                  ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg"
                                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
                              } disabled:opacity-50`}
                            >
                              {exchangingGroup === group.group_name ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Exchanging...
                                </>
                              ) : (
                                <>
                                  <Coins className="w-4 h-4" />
                                  Redeem {group.requirePoint.toLocaleString("vi-VN")} points
                                </>
                              )}
                            </button>

                            {!canAfford(group.requirePoint) && (
                              <p className="text-xs text-red-500 text-center mt-2">
                                Need {group.requirePoint - points} more points
                              </p>
                            )}
                            {group.count === 0 && (
                              <p className="text-xs text-red-500 text-center mt-2">
                                Out of vouchers
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="my-vouchers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {myVouchers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">
                    You don't have any vouchers yet
                  </h4>
                  <p className="text-gray-500">
                    Redeem points to get discount vouchers now!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myVouchers.map((voucher) => (
                    <motion.div
                      key={voucher.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                      <div className="p-5">
                        {/* Voucher Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 mb-1">
                              {voucher.voucher_name}
                            </h4>
                            <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                              {voucher.discount_percentage}% OFF
                            </Badge>
                          </div>
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>

                        {/* Voucher Code */}
                        <div className="bg-white rounded-lg p-3 mb-3 border-2 border-dashed border-green-300">
                          <div className="text-xs text-gray-600 mb-1">Voucher Code:</div>
                          <div className="font-mono font-bold text-lg text-green-700 text-center">
                            {voucher.code}
                          </div>
                        </div>

                        {/* Discount Info */}
                        <div className="bg-white/50 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Discount:</span>
                            <span className="font-bold text-green-600">
                              {voucher.discount_percentage}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Min Order:</span>
                            <span className="font-semibold text-gray-900">
                              {voucher.minAmountOrder.toLocaleString("vi-VN")}₫
                            </span>
                          </div>
                        </div>

                        {/* Valid Date */}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Valid until: {new Date(voucher.valid_to).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
