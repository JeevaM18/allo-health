"use client";

import { useEffect, useState, use } from "react";
import { useCountdown } from "@/hooks/useCountdown";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { 
  Lock, 
  ShoppingBag, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  Clipboard, 
  MapPin, 
  CheckCircle,
  Calendar,
  Sparkles,
  RefreshCw
} from "lucide-react";

export default function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();

  const fetchReservation = async () => {
    try {
      const res = await fetch(`/api/reservations/${id}`);
      if (!res.ok) throw new Error("Reservation not found");
      const data = await res.json();
      setReservation(data);
    } catch (err) {
      toast.error("Failed to load reservation receipt");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservation();
  }, [id]);

  const { totalSeconds, formatted } = useCountdown(reservation?.expiresAt);

  // Auto redirect on expiry
  useEffect(() => {
    if (reservation && totalSeconds <= 0 && reservation.status === "PENDING") {
      toast.error("Reservation window expired! Stock has been automatically rolled back.", {
        duration: 5000,
        id: "expiry-toast"
      });
      router.push("/");
    }
  }, [totalSeconds, reservation, router]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await fetch(`/api/reservations/${id}/confirm`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to confirm purchase");
      }

      toast.success("Allocation Confirmed! Your items are secured.", {
        duration: 4000,
        icon: "🎉"
      });
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Confirmation failed");
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/reservations/${id}/release`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to cancel reservation");
      }

      toast.success("Reservation cancelled. Stock rolled back to warehouse catalog.");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Cancellation failed");
    } finally {
      setCancelling(false);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(id);
    toast.success("Reservation Receipt ID copied!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a13] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="flex flex-col items-center gap-4 z-10">
          <RefreshCw className="w-10 h-10 text-purple-500 animate-spin" />
          <p className="text-slate-400 font-medium text-sm animate-pulse">Syncing checkout lock status...</p>
        </div>
      </div>
    );
  }

  if (!reservation) return null;

  const isLowTime = totalSeconds <= 60;
  const progressPercent = Math.min((totalSeconds / 600) * 100, 100);

  return (
    <div className="min-h-screen bg-[#070a13] relative overflow-hidden flex flex-col justify-between">
      {/* Sleek Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Decorative Radial Glows */}
      <div className={`absolute top-[10%] left-[20%] w-[35rem] h-[35rem] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${
        isLowTime ? "bg-rose-900/10" : "bg-purple-900/10"
      }`} />

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
          <div className="bg-[#121b2e] px-4 py-1.5 rounded-full border border-purple-500/20 text-xs font-semibold text-purple-300">
            Secure Allocation Checkout
          </div>
        </div>
      </header>

      {/* Main Panel content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full flex flex-col justify-center z-10">
        <div className="bg-[#090e1c] rounded-3xl border border-[#1b263b] shadow-2xl relative overflow-hidden">
          
          {/* Visual state indicator header panel */}
          <div className={`border-b border-[#1b263b] p-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-1000 ${
            isLowTime ? "bg-rose-500/5" : "bg-[#0c1326]"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-1000 ${
                isLowTime ? "bg-rose-500/20 text-rose-400" : "bg-purple-500/20 text-purple-400"
              }`}>
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Stock Allocation Secured</h2>
                <p className="text-slate-400 text-xs mt-0.5">Exclusive item reservation locked for checkout</p>
              </div>
            </div>

            {/* Countdown box */}
            <div className="flex items-center gap-3 bg-[#121b2e] px-5 py-2.5 rounded-2xl border border-[#1d2b4a]">
              <Clock className={`w-5 h-5 transition-colors duration-1000 ${
                isLowTime ? "text-rose-400 animate-bounce" : "text-purple-400"
              }`} />
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Lock Expiry Clock</div>
                <div className={`text-xl font-mono font-black transition-colors duration-1000 ${
                  isLowTime ? "text-rose-400" : "text-white"
                }`}>
                  {formatted}
                </div>
              </div>
            </div>
          </div>

          {/* Time Limit Progress Bar */}
          <div className="w-full bg-[#121b2e] h-1">
            <div 
              className={`h-full transition-all duration-1000 ${isLowTime ? "bg-rose-500" : "bg-purple-500"}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left side: Reservation Summary receipt */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Allocation Details</h3>
                <div className="bg-[#0b1022] border border-[#1b263b] rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] text-slate-400 mb-1">Stock Item</div>
                      <div className="font-bold text-white text-base">{reservation.product?.name || "Inventory Item"}</div>
                    </div>
                  </div>

                  <hr className="border-[#1b263b]/50" />

                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400">Dispatch Location</div>
                      <div className="text-sm font-semibold text-white">{reservation.warehouse?.name || "Dispatch Hub"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400">Reserved Quantity</div>
                      <div className="text-sm font-semibold text-white">{reservation.quantity} Unit</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security ID Badge */}
              <div className="flex items-center justify-between bg-[#121b2e]/60 border border-[#1b263b]/50 rounded-xl px-4 py-3 text-xs">
                <span className="text-slate-400 font-mono select-none">ID: {id.substring(0, 8)}...{id.substring(id.length - 8)}</span>
                <button 
                  onClick={copyId} 
                  className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  Copy ID
                </button>
              </div>
            </div>

            {/* Right side: Instructions and confirming action triggers */}
            <div className="flex flex-col justify-between gap-8">
              
              {/* Warnings and Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Checkout Instructions</h3>
                
                {isLowTime ? (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex gap-3 text-rose-300 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
                    <p className="leading-relaxed">
                      <strong>Critical Expiry!</strong> Your allocation lock is under 1 minute. Confirm now to secure stock before it automatically returns to the warehouse.
                    </p>
                  </div>
                ) : (
                  <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 flex gap-3 text-purple-300 text-sm">
                    <Sparkles className="w-5 h-5 shrink-0 text-purple-400" />
                    <p className="leading-relaxed">
                      While this timer is running, this stock is <strong>strictly locked and guaranteed</strong> for you. No race conditions can occur.
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons list */}
              <div className="space-y-3">
                <button
                  onClick={handleConfirm}
                  disabled={confirming || cancelling}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {confirming ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Securing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm Purchase
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={confirming || cancelling}
                  className="w-full h-12 rounded-xl bg-transparent hover:bg-rose-500/5 border border-[#1b263b] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Releasing Lock...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Cancel & Release Stock
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      </main>

      <footer className="border-t border-[#1b263b]/50 bg-[#090e1c]/40 py-6 text-center text-xs text-slate-500 z-10">
        All stock transactions are atomically secured against double-reservations.
      </footer>
    </div>
  );
}
