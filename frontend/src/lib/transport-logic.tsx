import { z } from "zod";

export const CONFIG = {
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

export const addressSubSchema = z.object({
  street: z.string().min(3, "Street is required"),
  details: z.string().optional(),
  city: z.string().min(2, "City is required"),
  county: z.string().min(2, "County is required"),
  
  lat: z.number().optional(), 
  lng: z.number().optional(),
});

export const itemSchema = z.object({
  description: z.string().min(1, "Required"),
  length: z.coerce.number().min(0.1),
  width: z.coerce.number().min(0.1),
  height: z.coerce.number().min(0.1),
  weight: z.coerce.number().min(0.1),
});

export const formSchema = z.object({
  first_name: z.string().min(2, "Required"),
  last_name: z.string().min(2, "Required"),
  phone: z.string().min(10, "Invalid phone"),
  email: z.string().email().optional().or(z.literal('')),
  
  pickup: addressSubSchema,
  dropoff: addressSubSchema,
  
  items: z.array(itemSchema).min(1),
});

export type TransportFormValues = z.infer<typeof formSchema>;

export const geocodeStructuredAddress = async (street: string, city: string, county: string) => {
  const params = new URLSearchParams({
    format: 'json',
    street: street,
    city: city,
    county: county,
    country: 'Romania', // hardcoded :/ -> will likely have to change this
    limit: '1'
  });

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
    const data = await res.json();
    
    if (!data || data.length === 0) return null;
    
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name
    };
  } catch (error) {
    return null;
  }
};

const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const isInsideBrasov = (lat: number, lng: number) => 
  calcDistance(CONFIG.BRASOV_CENTER.lat, CONFIG.BRASOV_CENTER.lng, lat, lng) <= CONFIG.BRASOV_RADIUS_KM;

export const calculateStats = (data: TransportFormValues) => {
  const { pickup, dropoff, items } = data;
  
  let price = 0;
  let distance = 0;
  let isLocal = false;

  if (pickup?.lat && pickup?.lng && dropoff?.lat && dropoff?.lng) {
    distance = parseFloat(calcDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng).toFixed(1));
    isLocal = isInsideBrasov(pickup.lat, pickup.lng) && isInsideBrasov(dropoff.lat, dropoff.lng);
    price = isLocal ? CONFIG.TARIFF_LOCAL : Math.max(100, Math.round(distance * CONFIG.TARIFF_PER_KM));
  }

  const totalWeight = items.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0);
  
  const SPACE = { l: 3.5, w: 1.4, h: 1.9 };
  const fitsInSpace = items.every(item => {
    const dims = [item.length, item.width, item.height].sort((a, b) => b - a);
    const spaceDims = [SPACE.l, SPACE.w, SPACE.h].sort((a, b) => b - a);
    return dims[0] <= spaceDims[0] && dims[1] <= spaceDims[1] && dims[2] <= spaceDims[2];
  });

  const isWeightError = totalWeight > CONFIG.LIMITS.MAX_WEIGHT_KG;
  const canSubmit = !isWeightError && fitsInSpace && price > 0;

  return { price, distance, isLocal, totalWeight, isWeightError, fitsInSpace, canSubmit };
};
