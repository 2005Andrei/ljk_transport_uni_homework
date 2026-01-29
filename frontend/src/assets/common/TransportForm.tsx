import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Truck, ArrowRight, ArrowLeft, 
  Loader2, AlertTriangle, XCircle, CheckCircle2,
  Calendar, MapPin, Package, Download, Share2
} from "lucide-react";

import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { transportService } from "@/lib/api"; 

const CONFIG = {
  BRASOV_CENTER: { lat: 45.6579, lng: 25.6012 },
  BRASOV_RADIUS_KM: 8,
  TARIFF_LOCAL: 100,
  TARIFF_PER_KM: 3,
  LIMITS: {
    MAX_LENGTH: 3.5, 
    MAX_WIDTH: 1.4,  
    MAX_HEIGHT: 1.9, 
    MAX_WEIGHT_KG: 1500 
  }
};

// --- LOCAL STORAGE UTILS ---
const STORAGE_KEY = "transport_requests";

const getStoredTransports = () => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const storeTransport = (transportData: any) => {
  const transports = getStoredTransports();
  transports.unshift({
    id: transportData.id,
    timestamp: new Date().toISOString(),
    ...transportData
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transports.slice(0, 50))); // Keep last 50
};

// --- DIMENSION VALIDATION UTILS ---
const canFitInSpace = (items: Array<{length: number, width: number, height: number}>) => {
  const SPACE = {
    length: 3.5,
    width: 1.4,
    height: 1.9
  };

  for (const item of items) {
    const { length, width, height } = item;
    
    const orientations = [
      [length, width, height],
      [length, height, width],
      [width, length, height],
      [width, height, length],
      [height, length, width],
      [height, width, length]
    ];

    const fits = orientations.some(([l, w, h]) => 
      l <= SPACE.length && w <= SPACE.width && h <= SPACE.height
    );

    if (!fits) {
      return false;
    }
  }

  return true;
};

const validateItemDimensions = (items: Array<{length: number, width: number, height: number}>) => {
  const errors: string[] = [];
  
  items.forEach((item, index) => {
    const { length, width, height } = item;
    
    if (length <= 0 || width <= 0 || height <= 0) {
      errors.push(`Item ${index + 1}: All dimensions must be greater than 0`);
      return;
    }

    if (length > 10 || width > 10 || height > 10) {
      errors.push(`Item ${index + 1}: Dimensions seem abnormally large (max 10m per dimension)`);
      return;
    }

    const orientations = [
      [length, width, height],
      [length, height, width],
      [width, length, height],
      [width, height, length],
      [height, length, width],
      [height, width, length]
    ];

    const fits = orientations.some(([l, w, h]) => 
      l <= 3.5 && w <= 1.4 && h <= 1.9
    );

    if (!fits) {
      errors.push(`Item ${index + 1}: Cannot fit in vehicle space (3.5×1.4×1.9m) in any orientation`);
    }
  });

  return errors;
};
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

const isInsideBrasov = (lat: number, lng: number) => 
  calculateDistance(CONFIG.BRASOV_CENTER.lat, CONFIG.BRASOV_CENTER.lng, lat, lng) <= CONFIG.BRASOV_RADIUS_KM;

const itemSchema = z.object({
  description: z.string().min(1, "Required"),
  length: z.coerce.number().min(0.1),
  width: z.coerce.number().min(0.1),
  height: z.coerce.number().min(0.1),
  weight: z.coerce.number().min(0.1),
});

const schema = z.object({
  first_name: z.string().min(2, "Required"),
  last_name: z.string().min(2, "Required"),
  phone: z.string().min(10, "Invalid phone"),
  email: z.string().email().optional(),
  
  pickup_address: z.string().min(5, "Required"),
  pickup_lat: z.number().optional(),
  pickup_lng: z.number().optional(),
  
  dropoff_address: z.string().min(5, "Required"),
  dropoff_lat: z.number().optional(),
  dropoff_lng: z.number().optional(),
  
  items: z.array(itemSchema).min(1),
});

type FormValues = z.infer<typeof schema>;

// --- COMPONENT: ADDRESS AUTOCOMPLETE ---
const AddressInput = ({ 
  label, name, register, setValue, error, placeholder 
}: { 
  label: string, name: any, register: any, setValue: any, error?: any, placeholder: string 
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 3) {
        setSuggestions([]); 
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=3`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (e) { console.error(e); } 
      finally { setIsSearching(false); }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const selectPlace = (place: any) => {
    setQuery(place.display_name);
    setValue(name, place.display_name, { shouldValidate: true });
    setValue(name.replace("_address", "_lat"), parseFloat(place.lat));
    setValue(name.replace("_address", "_lng"), parseFloat(place.lon));
    setShowSuggestions(false);
  };

  const { onChange, ...restRegister } = register(name);

  return (
    <div className="w-full space-y-2">
      <Label className={cn("text-zinc-600 dark:text-zinc-400", error && "text-red-500")}>{label}</Label>
      <div className="relative">
        <Input 
          {...restRegister}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setValue(name, e.target.value, { shouldValidate: true }); }}
          placeholder={placeholder}
          className="bg-white dark:bg-zinc-900"
        />
        {isSearching && (
          <div className="absolute right-3 top-2.5">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-zinc-50 dark:bg-zinc-800/50 rounded-md border border-zinc-200 dark:border-zinc-700 mt-1"
          >
            {suggestions.map((s, i) => (
              <div 
                key={i} 
                onClick={() => selectPlace(s)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700 last:border-0 truncate"
              >
                {s.display_name}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  );
};

// --- MODERN SUCCESS COMPONENT ---
const SuccessScreen = ({ 
  successId, 
  onNewOrder 
}: { 
  successId: number; 
  onNewOrder: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'Transport Booking Confirmed',
      text: `Your transport request #${successId} has been confirmed!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`Transport request #${successId} - Booking Confirmed`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const receipt = {
      id: successId,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: 'Confirmed'
    };
    
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transport-${successId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-zinc-950 via-emerald-950/20 to-zinc-950 text-white font-sans">
      {/* Replaced CardSpotlight with a regular div */}
      <div className="w-full max-w-2xl bg-zinc-900/80 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Optional: Add a subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 pointer-events-none" />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 relative z-10"
        >
          {/* Animated Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2 
            }}
            className="mx-auto w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </motion.div>

          {/* Confirmation Text */}
          <div className="space-y-3">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
            >
              Booking Confirmed!
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-zinc-400 text-lg"
            >
              Your transport request has been successfully submitted
            </motion.p>
          </div>

          {/* Order Details Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 text-left space-y-4 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Order Date</span>
              </div>
              <span className="text-white font-medium">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-400">
                <Package className="w-4 h-4" />
                <span className="text-sm">Order ID</span>
              </div>
              <span className="text-emerald-400 font-mono font-bold">
                #{successId}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Status</span>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30">
                Confirmed
              </span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
          >
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex items-center gap-2 border-zinc-700 hover:bg-zinc-800 text-white transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
              {copied ? "Copied!" : "Share"}
            </Button>
            
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex items-center gap-2 border-zinc-700 hover:bg-zinc-800 text-white transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </Button>
            
            <Button
              onClick={onNewOrder}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              New Transport
            </Button>
          </motion.div>

          {/* Additional Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-zinc-500 pt-6"
          >
            You'll receive a confirmation email shortly. 
            <br />
            Your order has been saved to your local history.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function TransportRequest() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  const { register, control, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { items: [{ description: "", length: 0, width: 0, height: 0, weight: 0 }] }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const [pickupLat, pickupLng, dropoffLat, dropoffLng, items] = watch(["pickup_lat", "pickup_lng", "dropoff_lat", "dropoff_lng", "items"]);

  const stats = useMemo(() => {
    let price = 0;
    let distance = 0;
    let isLocal = false;

    if (typeof pickupLat === 'number' && typeof dropoffLat === 'number' && typeof pickupLng === 'number' && typeof dropoffLng === 'number') {
      distance = parseFloat(calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng).toFixed(1));
      isLocal = isInsideBrasov(pickupLat, pickupLng) && isInsideBrasov(dropoffLat, dropoffLng);
      price = isLocal ? CONFIG.TARIFF_LOCAL : Math.max(100, Math.round(distance * CONFIG.TARIFF_PER_KM));
    }

    let totalWeight = 0;
    const itemErrors: Record<number, string> = {};

    // Check dimension constraints
    const dimensionItems = items?.map(item => ({
      length: Number(item.length) || 0,
      width: Number(item.width) || 0,
      height: Number(item.height) || 0
    })) || [];

    const fitsInSpace = canFitInSpace(dimensionItems);

    items?.forEach((item, idx) => {
      const w = Number(item.weight) || 0;
      totalWeight += w;

      const l = Number(item.length) || 0;
      const width = Number(item.width) || 0;
      const h = Number(item.height) || 0;

      const itemFloorDims = [l, width].sort((a, b) => b - a); 
      
      const isTooLong = itemFloorDims[0] > CONFIG.LIMITS.MAX_LENGTH;
      const isTooWide = itemFloorDims[1] > CONFIG.LIMITS.MAX_WIDTH;
      const isTooTall = h > CONFIG.LIMITS.MAX_HEIGHT;

      if (isTooLong || isTooWide || isTooTall) {
        itemErrors[idx] = `Max dims: ${CONFIG.LIMITS.MAX_LENGTH}x${CONFIG.LIMITS.MAX_WIDTH}x${CONFIG.LIMITS.MAX_HEIGHT}m`;
      }
    });

    const isWeightError = totalWeight > CONFIG.LIMITS.MAX_WEIGHT_KG;
    const hasItemErrors = Object.keys(itemErrors).length > 0;
    const hasDimensionError = !fitsInSpace;
    const canSubmit = !isWeightError && !hasItemErrors && !hasDimensionError && price > 0;

    return { 
      price, 
      distance, 
      isLocal, 
      totalWeight, 
      isWeightError, 
      itemErrors, 
      hasDimensionError,
      canSubmit 
    };
  }, [items, pickupLat, dropoffLat, pickupLng, dropoffLng]);

  const onSubmit = async (data: FormValues) => {
    if (!stats.canSubmit) return;


  const dimensionItems = data.items.map(item => ({
      length: Number(item.length),
      width: Number(item.width),
      height: Number(item.height)
    }));

    const dimensionErrors = validateItemDimensions(dimensionItems);
    const fitsInSpace = canFitInSpace(dimensionItems);

    if (dimensionErrors.length > 0 || !fitsInSpace) {
      setSubmitError("Please fix dimension errors before submitting");
      return;
    }

    if (!stats.canSubmit) {
      setSubmitError("Cannot submit form with validation errors");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,            
      email: data.email || null,
      leaving_address: data.pickup_address,
      destination: data.dropoff_address,
      cost: stats.price,
      content: data.items.map(i => 
        `${i.description}: ${i.length}x${i.width}x${i.height}m (${i.weight}kg)`
      ).join("\n"),
      details: {
        distance_km: stats.distance,
        is_local: stats.isLocal,
        route: {
          from: { lat: data.pickup_lat!, lng: data.pickup_lng! },
          to: { lat: data.dropoff_lat!, lng: data.dropoff_lng! }
        }
      }
    };

    try {
      const response = await transportService.create(payload);
      setSuccessId(response.id);
      
      // Store in localStorage
      storeTransport({
        id: response.id,
        ...payload,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error("Submission failed", error);
      if (error.response && error.response.status === 404) {
        setSubmitError("Server endpoint not found. Please check API configuration.");
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewOrder = () => {
    setSuccessId(null);
    setStep(1);
    window.location.reload(); 
  };

  if (successId) {
    return <SuccessScreen successId={successId} onNewOrder={handleNewOrder} />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950 text-zinc-900 font-sans">
      <CardSpotlight className="w-full max-w-4xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <div className="relative z-20 flex flex-col h-full p-8 md:p-10">
          
          {/* HEADER */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <Truck className="w-6 h-6 text-emerald-600" />
                Transport Request
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {step === 1 ? "Step 1: Contact Details" : "Step 2: Logistics & Pricing"}
              </p>
            </div>
            
            {step === 2 && stats.price > 0 && (
              <div className="text-right">
                <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                  {stats.isLocal ? "Local (Brasov)" : `${stats.distance} km Route`}
                </div>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">
                  {stats.price} <span className="text-base font-normal text-zinc-400">RON</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
            <AnimatePresence mode="wait">
              
              {/* --- STEP 1: USER DATA --- */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input {...register("first_name")} placeholder="Ion" />
                      {errors.first_name && <span className="text-xs text-red-500">{errors.first_name.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input {...register("last_name")} placeholder="Popescu" />
                      {errors.last_name && <span className="text-xs text-red-500">{errors.last_name.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input {...register("phone")} placeholder="07xx..." />
                      {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input {...register("email")} placeholder="email@example.com" />
                      {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="button" onClick={async () => { if(await trigger(["first_name", "last_name", "phone"])) setStep(2); }} className="bg-zinc-900 text-white hover:bg-zinc-800">
                      Next Step <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* --- STEP 2: LOGISTICS --- */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="grid md:grid-cols-2 gap-6 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    <AddressInput 
                      label="Pickup Address" 
                      name="pickup_address" 
                      register={register} setValue={setValue} error={errors.pickup_address} placeholder="Start typing..." 
                    />
                    <AddressInput 
                      label="Delivery Address" 
                      name="dropoff_address" 
                      register={register} setValue={setValue} error={errors.dropoff_address} placeholder="Start typing..." 
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <Label className="text-base font-semibold">Cargo Items</Label>
                      <div className="text-right space-y-1">
                        <span className={cn("text-sm font-bold", stats.isWeightError ? "text-red-600" : "text-zinc-600")}>
                          Total: {stats.totalWeight} / {CONFIG.LIMITS.MAX_WEIGHT_KG} kg
                        </span>
                        {stats.hasDimensionError && (
                          <div className="text-xs text-red-500 font-medium flex items-center gap-1 justify-end">
                            <AlertTriangle className="w-3 h-3" />
                            Items don't fit in vehicle space
                          </div>
                        )}
                        {stats.isWeightError && (
                          <div className="text-xs text-red-500 font-medium">Exceeds 1.5t limit</div>
                        )}
                      </div>
                    </div>

                    <div className="hidden md:grid grid-cols-12 gap-4 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-t-md text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <div className="col-span-4">Description</div>
                      <div className="col-span-2 text-center">L (m)</div>
                      <div className="col-span-2 text-center">W (m)</div>
                      <div className="col-span-2 text-center">H (m)</div>
                      <div className="col-span-2 text-center">Kg</div>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {fields.map((field, index) => {
                        const errorMsg = stats.itemErrors[index];
                        return (
                          <div key={field.id} className={cn(
                            "grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-white dark:bg-zinc-900 border rounded-md shadow-sm items-start relative group transition-colors",
                            errorMsg ? "border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-800" : "border-zinc-200 dark:border-zinc-800"
                          )}>
                            <div className="md:col-span-4">
                              <Label className="md:hidden text-xs text-zinc-400 mb-1 block">Description</Label>
                              <Input {...register(`items.${index}.description`)} placeholder="Item name" />
                              {errorMsg && <span className="text-xs text-red-600 font-medium block mt-1">{errorMsg}</span>}
                            </div>
                            
                            <div className="grid grid-cols-4 gap-2 md:contents">
                              <div className="md:col-span-2">
                                <Label className="md:hidden text-xs text-zinc-400 mb-1 block text-center">L</Label>
                                <Input type="number" step="0.1" {...register(`items.${index}.length`)} className="text-center" placeholder="0" />
                              </div>
                              <div className="md:col-span-2">
                                <Label className="md:hidden text-xs text-zinc-400 mb-1 block text-center">W</Label>
                                <Input type="number" step="0.1" {...register(`items.${index}.width`)} className="text-center" placeholder="0" />
                              </div>
                              <div className="md:col-span-2">
                                <Label className="md:hidden text-xs text-zinc-400 mb-1 block text-center">H</Label>
                                <Input type="number" step="0.1" {...register(`items.${index}.height`)} className="text-center" placeholder="0" />
                              </div>
                              <div className="md:col-span-2">
                                <Label className="md:hidden text-xs text-zinc-400 mb-1 block text-center">Kg</Label>
                                <Input type="number" step="0.1" {...register(`items.${index}.weight`)} className="text-center font-semibold bg-zinc-50 dark:bg-zinc-800" placeholder="0" />
                              </div>
                            </div>

                            {fields.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => remove(index)}
                                className="absolute -right-2 -top-2 md:static md:col-span-0 md:flex items-center justify-center md:h-10 md:w-8 text-zinc-400 hover:text-red-500 bg-white md:bg-transparent rounded-full border md:border-0 border-zinc-200 shadow-sm md:shadow-none p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", length: 0, width: 0, height: 0, weight: 0 })} className="w-full text-zinc-500">
                      <Plus className="w-4 h-4 mr-2" /> Add Another Item
                    </Button>
                  </div>

                  <div className="flex justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800 text-white">
                    <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={isSubmitting}>
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <div className="flex flex-col items-end gap-2">
                      {/* --- ERROR MESSAGE UI --- */}
                      {submitError && (
                         <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-md border border-red-200 dark:border-red-800">
                            <AlertTriangle className="w-4 h-4" />
                            {submitError}
                         </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        disabled={!stats.canSubmit || isSubmitting}
                        className={cn("text-white px-8 min-w-[200px]", !stats.canSubmit || isSubmitting ? "opacity-70 cursor-not-allowed bg-zinc-400" : "bg-emerald-600 hover:bg-emerald-700")}
                      >
                         {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : (!stats.canSubmit ? "Cargo exceeds limits" : "Confirm Booking")}
                      </Button>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </CardSpotlight>
    </div>
  );
}
