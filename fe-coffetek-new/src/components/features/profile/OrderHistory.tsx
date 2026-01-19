"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Receipt, 
  Package, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Truck,
  Download,
  Loader2,
  ExternalLink
} from "lucide-react";
import { orderService } from "@/services/orderService";
import type { Order, OrderStatus } from "@/interfaces";
import { getImageUrl } from "@/utils/image";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface OrderHistoryProps {
  orders: any[];
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1509042239860-f550ce710b93";

export default function OrderHistory({ orders }: OrderHistoryProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<Record<number, Order>>({});

  const toggleOrder = async (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    // If we haven't loaded this order's details yet, fetch them
    if (!orderDetails[orderId]) {
      setLoadingOrderId(orderId);
      try {
        const fullOrder = await orderService.getById(orderId);
        setOrderDetails((prev) => ({ ...prev, [orderId]: fullOrder }));
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoadingOrderId(null);
      }
    }

    setExpandedOrderId(orderId);
  };

  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "completed":
        return {
          label: "Completed",
          icon: CheckCircle2,
          color: "bg-green-100 text-green-700 border-green-300",
          iconColor: "text-green-600",
        };
      case "paid":
        return {
          label: "Paid",
          icon: CheckCircle2,
          color: "bg-blue-100 text-blue-700 border-blue-300",
          iconColor: "text-blue-600",
        };
      case "pending":
        return {
          label: "Pending",
          icon: Clock,
          color: "bg-yellow-100 text-yellow-700 border-yellow-300",
          iconColor: "text-yellow-600",
        };
      case "shipping":
        return {
          label: "Shipping",
          icon: Truck,
          color: "bg-purple-100 text-purple-700 border-purple-300",
          iconColor: "text-purple-600",
        };
      case "canceled":
        return {
          label: "Canceled",
          icon: XCircle,
          color: "bg-red-100 text-red-700 border-red-300",
          iconColor: "text-red-600",
        };
      default:
        return {
          label: status,
          icon: Package,
          color: "bg-gray-100 text-gray-700 border-gray-300",
          iconColor: "text-gray-600",
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const handleDownloadInvoice = async (orderId: number) => {
    try {
      setLoadingInvoiceId(orderId);
      const invoiceUrl = await orderService.getInvoice(orderId);
      
      if (invoiceUrl) {
        // Open invoice in new window
        window.open(invoiceUrl, '_blank', 'noopener,noreferrer');
        toast.success("Opening invoice...");
      } else {
        toast.error("Unable to get invoice URL");
      }
    } catch (error: any) {
      console.error("Error fetching invoice:", error);
      const errorMessage = error.response?.data?.message || error.message || "Unable to load invoice";
      toast.error(errorMessage);
    } finally {
      setLoadingInvoiceId(null);
    }
  };

  const getProductImage = (product: any): string => {
    if (product?.images && product.images.length > 0) {
      const sortedImages = product.images.sort((a: any, b: any) => a.sort_index - b.sort_index);
      return getImageUrl(sortedImages[0].image_name);
    }
    return getImageUrl();
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No orders yet
        </h3>
        <p className="text-gray-500">
          You don't have any orders yet. Place an order to see your history here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Order History
        </h3>
        <p className="text-gray-600">
          View details of your orders
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order: any) => {
          const isExpanded = expandedOrderId === order.id;
          const isLoading = loadingOrderId === order.id;
          const fullOrder = orderDetails[order.id] || order;
          const statusConfig = getStatusConfig(order.status || "pending");
          const StatusIcon = statusConfig.icon;
          const dateInfo = formatDate(order.created_at || order.date || new Date().toISOString());
          const orderTotal = order.final_price || order.total_price || order.total || 0;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              {/* Order Header */}
              <div
                className="p-5 cursor-pointer"
                onClick={() => toggleOrder(order.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-gray-500" />
                        <span className="font-bold text-lg text-gray-900">
                          Order #{order.id}
                        </span>
                      </div>
                      <Badge
                        className={`${statusConfig.color} border font-medium text-xs px-2 py-1`}
                      >
                        <StatusIcon className={`w-3 h-3 ${statusConfig.iconColor} inline mr-1`} />
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{dateInfo.date}</span>
                        <span className="mx-1">•</span>
                        <span>{dateInfo.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {orderTotal.toLocaleString("vi-VN")}₫
                    </div>
                    <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mt-2">
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span>Collapse</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span>View details</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Details (Expanded) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 bg-gray-50"
                  >
                    {isLoading ? (
                      <div className="p-8 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                        <span className="ml-2 text-gray-600">Loading details...</span>
                      </div>
                    ) : (
                      <div className="p-6 space-y-4">
                        {/* Order Items */}
                        {fullOrder.order_details && fullOrder.order_details.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-800 mb-3">
                              Ordered Products
                            </h4>
                            {fullOrder.order_details.map((detail: any) => {
                              const productImage = getProductImage(detail.product);
                              return (
                                <div
                                  key={detail.id}
                                  className="bg-white rounded-lg p-4 border border-gray-200"
                                >
                                  <div className="flex gap-4">
                                    {/* Product Image */}
                                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                      <Image
                                        src={productImage}
                                        alt={detail.product_name || detail.product?.name || "Product"}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                                        }}
                                      />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-semibold text-gray-900 mb-1">
                                        {detail.product_name || detail.product?.name || "Product"}
                                      </h5>

                                      {/* Size */}
                                      {detail.size && (
                                        <p className="text-sm text-gray-600 mb-1">
                                          Size: {detail.size.name}
                                        </p>
                                      )}

                                      {/* Options */}
                                      {detail.optionValue && detail.optionValue.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                          {detail.optionValue.map((opt: any) => (
                                            <Badge
                                              key={opt.id}
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {opt.name}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}

                                      {/* Toppings */}
                                      {detail.ToppingOrderDetail && detail.ToppingOrderDetail.length > 0 && (
                                        <div className="mb-2">
                                          <p className="text-xs text-gray-500 mb-1">Toppings:</p>
                                          <div className="flex flex-wrap gap-1">
                                            {detail.ToppingOrderDetail.map((topping: any) => (
                                              <Badge
                                                key={topping.id}
                                                variant="outline"
                                                className="text-xs bg-orange-50 border-orange-200 text-orange-700"
                                              >
                                                {topping.topping?.name || topping.topping?.product?.name}
                                                {topping.quantity > 1 && ` x${topping.quantity}`}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Quantity and Price */}
                                      <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm text-gray-600">
                                          Quantity: {detail.quantity}
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                          {(detail.unit_price * detail.quantity).toLocaleString("vi-VN")}₫
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">
                            No order details available
                          </p>
                        )}

                        {/* Order Summary */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="space-y-2">
                            <div className="flex justify-between text-gray-700">
                              <span>Total Product Amount:</span>
                              <span>
                                {fullOrder.original_price?.toLocaleString("vi-VN") || orderTotal.toLocaleString("vi-VN")}₫
                              </span>
                            </div>
                            {fullOrder.original_price && fullOrder.final_price && fullOrder.original_price !== fullOrder.final_price && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount:</span>
                                <span>
                                  -{(fullOrder.original_price - fullOrder.final_price).toLocaleString("vi-VN")}₫
                                </span>
                              </div>
                            )}
                            <div className="pt-2 border-t border-gray-200 flex justify-between text-lg font-bold text-gray-900">
                              <span>Total Payment:</span>
                              <span className="text-orange-600">
                                {orderTotal.toLocaleString("vi-VN")}₫
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order Note */}
                        {fullOrder.note && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                              <span className="font-medium">Note:</span> {fullOrder.note}
                            </p>
                          </div>
                        )}

                        {/* Invoice Download */}
                        {fullOrder.invoiceUrl && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleDownloadInvoice(fullOrder.id)}
                              disabled={loadingInvoiceId === fullOrder.id}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingInvoiceId === fullOrder.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="w-4 h-4" />
                                  View Invoice
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
