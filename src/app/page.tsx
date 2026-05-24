"use client";

import { useEffect, useState } from "react";
import { useReservation } from "@/hooks/useReservation";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { 
  Package, 
  Warehouse as WarehouseIcon, 
  Layers, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from "lucide-react";

// Mock metadata to enrich seeded products for retail mockup look
const PRODUCT_METADATA: Record<string, { desc: string; price: string; image: string }> = {
  "iPhone 15": {
    desc: "Titanium casing, A17 Pro chip, 48MP main camera, and USB-C. The ultimate mobile experience.",
    price: "₹1,34,900.00",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop"
  },
  "Samsung Galaxy S24": {
    desc: "Next-gen Galaxy AI, premium titanium design, 200MP camera, and immersive QHD+ display.",
    price: "₹1,29,999.00",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop"
  }
};

const DEFAULT_METADATA = {
  desc: "Premium grade catalog product stored and dispatched under perfect temperature and security controls.",
  price: "₹49,999.00",
  image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop"
};

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWarehouses, setSelectedWarehouses] = useState<Record<string, string>>({});
  const router = useRouter();
  const { createReservation, loading: reserving } = useReservation();

  const fetchProducts = async (isSilent = false) => {
    if (!isSilent) setLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);

      // Pre-select the first warehouse with available stock for each product
      const defaultSelections: Record<string, string> = {};
      data.forEach((p: any) => {
        const firstAvailable = p.inventories.find((inv: any) => inv.availableStock > 0);
        if (firstAvailable) {
          defaultSelections[p.id] = firstAvailable.warehouse.id;
        } else if (p.inventories.length > 0) {
          defaultSelections[p.id] = p.inventories[0].warehouse.id;
        }
      });
      setSelectedWarehouses((prev) => ({ ...defaultSelections, ...prev }));
    } catch (err) {
      toast.error("Failed to sync inventory catalogs");
    } finally {
      setLoadingProducts(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(true);
    toast.success("Live inventory catalog synchronized", { id: "sync-toast" });
  };

  const handleReserve = async (productId: string) => {
    const warehouseId = selectedWarehouses[productId];
    if (!warehouseId) {
      toast.error("Please select a warehouse first");
      return;
    }

    const product = products.find((p) => p.id === productId);
    const selectedInv = product?.inventories.find((inv: any) => inv.warehouse.id === warehouseId);
    
    if (!selectedInv || selectedInv.availableStock <= 0) {
      toast.error("Selected warehouse is currently out of stock");
      return;
    }

    const reservePromise = createReservation({
      productId,
      warehouseId,
      quantity: 1,
    });

    toast.promise(reservePromise, {
      loading: "Initiating stock lock...",
      success: (res) => {
        setTimeout(() => router.push(`/reservation/${res.id}`), 500);
        return "Stock locked! Redirecting to checkout...";
      },
      error: (err) => err.message || "Failed to secure reservation",
    });
  };

  return (
    <div className="min-h-screen bg-[#070a13] relative overflow-hidden flex flex-col">
      {/* Sleek Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Decorative Radial Glows */}
      <div className="absolute top-[-10%] left-[5%] w-[40rem] h-[40rem] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <header className="border-b border-[#1b263b] bg-[#090e1c]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-purple-500/20">
              A
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white">Allo</span>
              <span className="text-purple-400 font-medium ml-1">Inventory</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#121b2e] px-4 py-1.5 rounded-full border border-purple-500/20 text-xs font-semibold text-purple-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Stock Feed
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-[#1b263b] hover:bg-[#121b2e] transition-all duration-300 text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin text-purple-400" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full flex flex-col z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Global Stock Concurrency Lock Enabled
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Next-Gen <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">Inventory Experience</span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-8">
            Lock catalog stock items for <strong className="text-purple-400 font-semibold">10 minutes</strong> with full concurrency safety. Guaranteed race-condition protection.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#090e1c] p-2 rounded-2xl border border-[#1b263b] w-full max-w-2xl">
            <div className="flex items-center gap-3 p-3 text-left">
              <Clock className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-400">Lock Window</div>
                <div className="text-sm font-semibold text-white">10 Min Lock</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 text-left border-t sm:border-t-0 sm:border-l border-[#1b263b]">
              <TrendingUp className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-400">Visibility</div>
                <div className="text-sm font-semibold text-white">Live Stock Feed</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 text-left border-t sm:border-t-0 sm:border-l border-[#1b263b]">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-400">Allocation</div>
                <div className="text-sm font-semibold text-white">Guaranteed Lock</div>
              </div>
            </div>
          </div>
        </div>

        {/* Catalog Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Available Products</h2>
            </div>
            <div className="text-sm text-slate-400 font-medium">
              {products.length} products loaded
            </div>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#090e1c] border border-[#1b263b] rounded-2xl p-6 h-[450px] animate-pulse flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="bg-slate-800 h-44 rounded-xl w-full" />
                    <div className="h-6 bg-slate-800 rounded w-2/3" />
                    <div className="h-4 bg-slate-800 rounded w-full" />
                    <div className="h-4 bg-slate-800 rounded w-5/6" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-10 bg-slate-800 rounded-xl w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => {
                const meta = PRODUCT_METADATA[product.name] || DEFAULT_METADATA;
                const activeWarehouseId = selectedWarehouses[product.id];
                const activeInventory = product.inventories.find((inv: any) => inv.warehouse.id === activeWarehouseId);
                const hasStock = activeInventory && activeInventory.availableStock > 0;

                return (
                  <div key={product.id} className="group bg-[#090e1c] rounded-2xl border border-[#1b263b] hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
                    
                    {/* Floating total stock badge */}
                    <div className="absolute top-4 right-4 z-10 bg-indigo-500/10 backdrop-blur-md border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300">
                      {product.availableStock} total left
                    </div>

                    {/* Product Image Section */}
                    <div className="h-48 overflow-hidden relative bg-slate-900 border-b border-[#1b263b]/50">
                      <img 
                        src={meta.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090e1c] via-transparent to-transparent" />
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors duration-300">
                          {product.name}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                          {meta.desc}
                        </p>
                        
                        <div className="text-2xl font-black text-white mb-6">
                          {meta.price}
                        </div>

                        {/* Warehouses Selection Box */}
                        <div className="mb-6">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                            Select Dispatch Warehouse
                          </label>
                          <div className="space-y-2">
                            {product.inventories.map((inv: any) => {
                              const isSelected = selectedWarehouses[product.id] === inv.warehouse.id;
                              const isOut = inv.availableStock <= 0;
                              
                              // Determine Stock Status UI styling
                              let statusText = `${inv.availableStock} available`;
                              let statusClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                              if (inv.availableStock === 1) {
                                statusText = "Only 1 left!";
                                statusClass = "text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse";
                              } else if (isOut) {
                                statusText = "Out of stock";
                                statusClass = "text-rose-400 bg-rose-500/10 border-rose-500/20";
                              }

                              return (
                                <button
                                  key={inv.id}
                                  onClick={() => setSelectedWarehouses(prev => ({ ...prev, [product.id]: inv.warehouse.id }))}
                                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all duration-300 ${
                                    isSelected 
                                      ? "bg-[#161d33] border-purple-500 text-white shadow-inner" 
                                      : "bg-[#0b1022] border-[#1b263b] text-slate-400 hover:border-slate-500 hover:text-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <WarehouseIcon className={`w-4 h-4 ${isSelected ? "text-purple-400" : "text-slate-500"}`} />
                                    <span>{inv.warehouse.name}</span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusClass}`}>
                                    {statusText}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleReserve(product.id)}
                        disabled={!hasStock || reserving}
                        className={`w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                          hasStock
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/15 cursor-pointer active:scale-[0.98]"
                            : "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed shadow-none"
                        }`}
                      >
                        {reserving ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Locking Stock...
                          </>
                        ) : hasStock ? (
                          <>
                            Reserve for 10 Min
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        ) : (
                          "Out of stock"
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-[#1b263b]/50 bg-[#090e1c]/40 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-500/60" />
            <span>Allo Inventory Lock System — Production-Grade Concurrency Demo</span>
          </div>
          <span>Built with Next.js, Zod, Upstash Redis & PostgreSQL.</span>
        </div>
      </footer>
    </div>
  );
}
