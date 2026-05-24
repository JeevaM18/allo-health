"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCountdown } from "@/hooks/useCountdown";
import toast from "react-hot-toast";
import { 
  ShoppingBag, 
  ArrowLeft, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Calendar,
  Layers,
  RefreshCw,
  Sparkles
} from "lucide-react";

// Sub-component to manage multiple countdown states safely in a list without hook limit violations
function PendingOrderCountdown({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const { totalSeconds, formatted } = useCountdown(expiresAt);

  useEffect(() => {
    if (totalSeconds <= 0) {
      onExpire();
    }
  }, [totalSeconds, onExpire]);

  if (totalSeconds <= 0) {
    return <span className="text-rose-400 font-bold text-xs uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">Expired</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors ${
      totalSeconds <= 60 
        ? "text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse" 
        : "text-purple-400 bg-purple-500/10 border-purple-500/20"
    }`}>
      <Clock className="w-3.5 h-3.5" />
      Expires in {formatted}
    </span>
  );
}

export default function MyOrders() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/my-reservations");
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      toast.error("Failed to load your reservations history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Please sign in to view your orders");
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router]);

  const handleConfirm = async (id: string) => {
    setActioningId(id);
    try {
      const res = await fetch(`/api/reservations/${id}/confirm`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to confirm lock");
      toast.success("Allocation secured successfully! 🎉");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Confirmation failed");
    } finally {
      setActioningId(null);
    }
  };

  const handleCancel = async (id: string) => {
    setActioningId(id);
    try {
      const res = await fetch(`/api/reservations/${id}/release`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to release lock");
      toast.success("Stock rolled back cleanly.");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Cancellation failed");
    } finally {
      setActioningId(null);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#070a13] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="flex flex-col items-center gap-4 z-10">
          <RefreshCw className="w-10 h-10 text-purple-500 animate-spin" />
          <p className="text-slate-400 font-medium text-sm animate-pulse">Syncing orders ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a13] relative overflow-hidden flex flex-col justify-between">
      {/* Sleek Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Decorative Glow */}
      <div className="absolute top-[-10%] right-[10%] w-[35rem] h-[35rem] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="border-b border-[#1b263b] bg-[#090e1c]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-lg text-white">
              A
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white">Allo</span>
              <span className="text-purple-400 font-medium ml-1">Inventory</span>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-[#121b2e] hover:text-white text-slate-400 text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full z-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3  py-1 rounded-full text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Allocation History Ledger
            </div>
            <h1 className="text-3xl font-extrabold text-white">My Inventory Reserves</h1>
            <p className="text-slate-400 text-sm mt-1">Track and manage your live stock locks and confirmed orders.</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#090e1c] rounded-2xl border border-[#1b263b] p-12 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">No active allocations found</h2>
            <p className="text-slate-400 text-sm max-w-md">You haven't locked or purchased any stock yet. Head back to the dashboard to secure item allocations!</p>
            <button 
              onClick={() => router.push("/")}
              className="mt-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98]"
            >
              Start Reservoir Lock
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isPending = order.status === "PENDING";
              const isConfirmed = order.status === "CONFIRMED";
              const isReleased = order.status === "RELEASED";

              // Status styles
              let statusLabel = "Released";
              let statusClass = "text-slate-400 bg-slate-500/10 border-slate-500/20";
              let statusIcon = <XCircle className="w-4 h-4" />;
              
              if (isPending) {
                statusLabel = "Pending Lock";
                statusClass = "text-purple-400 bg-purple-500/10 border-purple-500/20 animate-pulse";
                statusIcon = <Clock className="w-4 h-4" />;
              } else if (isConfirmed) {
                statusLabel = "Confirmed";
                statusClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                statusIcon = <CheckCircle className="w-4 h-4" />;
              }

              return (
                <div 
                  key={order.id} 
                  className={`bg-[#090e1c] rounded-2xl border border-[#1b263b] overflow-hidden transition-all duration-300 ${
                    isPending ? "shadow-lg shadow-purple-500/5 border-purple-500/30" : "hover:border-slate-800"
                  }`}
                >
                  <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Item Details */}
                    <div className="md:col-span-6 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusClass}`}>
                          {statusIcon}
                          {statusLabel}
                        </span>
                        
                        {isPending && (
                          <PendingOrderCountdown expiresAt={order.expiresAt} onExpire={fetchOrders} />
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                        {order.product?.name || "Inventory Item"}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{order.warehouse?.name}</span>
                        </div>
                        <span className="hidden sm:inline text-slate-600">•</span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{order.quantity} Unit</span>
                        </div>
                      </div>
                    </div>

                    {/* Meta Receipt code */}
                    <div className="md:col-span-3 text-slate-400 text-xs font-mono bg-[#0b1022] border border-[#1b263b]/50 px-3 py-2 rounded-xl md:text-center select-none">
                      ID: {order.id.substring(0, 8)}...{order.id.substring(order.id.length - 8)}
                    </div>

                    {/* Context Action Triggers */}
                    <div className="md:col-span-3 flex md:justify-end gap-2.5">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleConfirm(order.id)}
                            disabled={actioningId !== null}
                            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex-1 md:flex-initial transition-all active:scale-[0.98] shadow-md disabled:opacity-50"
                          >
                            {actioningId === order.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" />
                            ) : (
                              "Confirm"
                            )}
                          </button>
                          <button
                            onClick={() => handleCancel(order.id)}
                            disabled={actioningId !== null}
                            className="px-3.5 py-2.5 rounded-xl bg-transparent hover:bg-rose-500/5 border border-[#1b263b] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-xs font-bold transition-all disabled:opacity-50"
                          >
                            {actioningId === order.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5 mx-auto" />
                            )}
                          </button>
                        </>
                      ) : (
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider select-none pr-4">
                          {isConfirmed ? "Stock Allocated" : "Lock Released"}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-[#1b263b]/50 bg-[#090e1c]/40 py-6 text-center text-xs text-slate-500">
        Active locks guarantee stock allocation under extreme lock conditions.
      </footer>
    </div>
  );
}
