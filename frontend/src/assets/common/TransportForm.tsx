import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, Truck, ArrowRight, ArrowLeft, Loader2, CheckCircle2, MapPin, AlertCircle } from "lucide-react";


import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { transportService } from "@/lib/api"; 
import { CONFIG, formSchema, calculateStats, geocodeStructuredAddress } from "@/lib/transport-logic";
import type { TransportFormValues } from "@/lib/transport-logic";



export default function TransportRequest() {
  const [step, setStep] = useState<1 | 2 | "success">(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const formatAddress = (addr: { street: string; details?: string; city: string; county: string }) => {
    const parts = [
      addr.street,
      addr.details,
      addr.city,
      addr.county
    ].filter(Boolean);
    return parts.join(", ");
  };

  const formatContent = (items: any[]) => {
    return items.map(item => 
      `${item.description} (${item.length}x${item.width}x${item.height}cm, ${item.weight}kg)`
    ).join("; ");
  };

  const form = useForm<TransportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      items: [{ description: "", length: 0, width: 0, height: 0, weight: 0 }],
      pickup: { city: "Brasov", county: "Brasov" }, // Default values helpful for local users
      dropoff: { city: "", county: "" }
    }
  });


  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  const watchedValues = form.watch();
  const stats = calculateStats(watchedValues);


  const handleCalculatePrice = async () => {
    setIsCalculating(true);
    setRouteError(null);

    const { pickup, dropoff } = form.getValues();


    const isValid = await form.trigger(["pickup.street", "pickup.city", "pickup.county", "dropoff.street", "dropoff.city", "dropoff.county"]);
    if (!isValid) {
      setIsCalculating(false);
      return;
    }


    const pickupCoords = await geocodeStructuredAddress(pickup.street, pickup.city, pickup.county);
    if (!pickupCoords) {
      setRouteError("Could not find the Pickup Address. Please check street spelling.");
      setIsCalculating(false);
      return;
    }


    const dropoffCoords = await geocodeStructuredAddress(dropoff.street, dropoff.city, dropoff.county);
    if (!dropoffCoords) {
      setRouteError("Could not find the Dropoff Address. Please check street spelling.");
      setIsCalculating(false);

      return;
    }


    form.setValue("pickup.lat", pickupCoords.lat);
    form.setValue("pickup.lng", pickupCoords.lng);
    form.setValue("dropoff.lat", dropoffCoords.lat);
    form.setValue("dropoff.lng", dropoffCoords.lng);

    setIsCalculating(false);
  };



  const onSubmit = async (data: TransportFormValues) => {

  setIsSubmitting(true);
    try {
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone, 
        email: data.email,
        
        pickup: formatAddress(data.pickup), 
        destination: formatAddress(data.dropoff),
        
        content: formatContent(data.items), 
        
        cost: stats.price,
        distance: stats.distance,
      };

      console.log("Sending payload:", payload);
      
      await transportService.create(payload);
      setStep("success");
    } catch (error: any) {
      console.error("Submission error:", error);
      
      if (error.response?.data) {
        const serverErrors = error.response.data;
        if (serverErrors.phone_number) {
            form.setError("phone", { message: serverErrors.phone_number[0] });
        }
        alert("Please check the form for errors.");
      } else {
        alert("Something went wrong connecting to the server.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 text-white font-sans">
        <div className="text-center space-y-4 max-w-md bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-3xl font-bold">Request Sent!</h2>
          <Button onClick={() => window.location.reload()} className="bg-emerald-600 hover:bg-emerald-700 w-full">New Request</Button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 font-sans">
      <CardSpotlight className="w-full max-w-4xl bg-zinc-950 border border-zinc-900 shadow-2xl">
        <div className="relative z-20 p-8 h-full">
          
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b border-zinc-800 pb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Truck className="w-6 h-6 text-emerald-500" /> Transport Request
              </h1>
              <p className="text-sm text-zinc-500">
                Step {step}: {step === 1 ? "Contact" : "Logistics"}
              </p>
            </div>

            {step === 2 && (
              <div className="text-right bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 w-full md:w-auto">
                {stats.price > 0 ? (
                  <>
                    <div className="text-xs text-zinc-500 uppercase font-bold">
                      {stats.isLocal ? "Local" : `${stats.distance} km`}
                    </div>
                    <div className="text-2xl font-bold text-emerald-500">
                      {stats.price} RON
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-zinc-500 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Calculate route to see price
                  </div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormInput
                      label="First Name"
                      reg={form.register("first_name")}
                      error={form.formState.errors.first_name}
                    />
                    <FormInput
                      label="Last Name"
                      reg={form.register("last_name")}
                      error={form.formState.errors.last_name}
                    />
                    <FormInput
                      label="Phone"
                      reg={form.register("phone")}
                      error={form.formState.errors.phone}
                    />
                    <FormInput
                      label="Email"
                      reg={form.register("email")}
                      error={form.formState.errors.email}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      onClick={async () => {
                        if (await form.trigger(["first_name", "last_name", "phone"]))
                          setStep(2);
                      }}
                      className="bg-white text-black hover:bg-zinc-200"
                    >
                      Next <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    <AddressSection
                      form={form}
                      type="pickup"
                      title="Pickup Location"
                    />
                    <AddressSection
                      form={form}
                      type="dropoff"
                      title="Dropoff Location"
                    />
                  </div>

                  {routeError && (
                    <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 text-red-400 rounded-md text-sm">
                      <AlertCircle className="w-4 h-4" /> {routeError}
                    </div>
                  )}

                  <div className="space-y-4 pt-4 border-t border-zinc-900">
                    <div className="flex justify-between items-end">
                      <Label className="text-base text-white">Cargo Items</Label>
                      <span
                        className={cn(
                          "text-xs font-mono",
                          stats.isWeightError ? "text-red-500" : "text-zinc-500"
                        )}
                      >
                        {stats.totalWeight} / {CONFIG.LIMITS.MAX_WEIGHT_KG} kg
                      </span>
                    </div>

                    <div className="hidden md:grid grid-cols-12 gap-3 px-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <div className="col-span-4">Description</div>
                      <div className="col-span-2 text-center">L (cm)</div>
                      <div className="col-span-2 text-center">W (cm)</div>
                      <div className="col-span-2 text-center">H (cm)</div>
                      <div className="col-span-2 text-center">Weight (kg)</div>
                    </div>

                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="relative grid grid-cols-1 md:grid-cols-12 gap-3 items-start bg-zinc-900/30 p-3 rounded-lg border border-zinc-800"
                        >
                          <div className="md:col-span-4">
                            <Label className="md:hidden text-xs text-zinc-500 mb-1 block">Description</Label>
                            <Input
                              {...form.register(`items.${index}.description`)}
                              placeholder="e.g. Box of Books"
                              className="bg-zinc-950 border-zinc-700 focus:border-emerald-500/50"
                            />
                          </div>

                          <div className="grid grid-cols-4 gap-2 md:contents">
                              
                            <div className="md:col-span-2">
                               <Label className="md:hidden text-xs text-zinc-500 mb-1 block text-center">L</Label>
                               <Input
                                type="number"
                                step="0.1"
                                placeholder="0"
                                {...form.register(`items.${index}.length`)}
                                className="bg-zinc-950 border-zinc-700 text-center"
                              />
                            </div>
                            
                            <div className="md:col-span-2">
                               <Label className="md:hidden text-xs text-zinc-500 mb-1 block text-center">W</Label>
                               <Input
                                type="number"
                                step="0.1"
                                placeholder="0"
                                {...form.register(`items.${index}.width`)}
                                className="bg-zinc-950 border-zinc-700 text-center"
                              />
                            </div>

                            <div className="md:col-span-2">
                               <Label className="md:hidden text-xs text-zinc-500 mb-1 block text-center">H</Label>
                               <Input
                                type="number"
                                step="0.1"
                                placeholder="0"
                                {...form.register(`items.${index}.height`)}
                                className="bg-zinc-950 border-zinc-700 text-center"
                              />
                            </div>

                            <div className="md:col-span-2">
                               <Label className="md:hidden text-xs text-zinc-500 mb-1 block text-center">Kg</Label>
                               <Input
                                type="number"
                                step="0.1"
                                placeholder="0"
                                {...form.register(`items.${index}.weight`)}
                                className="bg-zinc-950 border-zinc-700 text-center font-bold text-emerald-500"
                              />
                            </div>
                          </div>

                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="absolute -top-2 -right-2 md:top-auto md:right-auto md:relative md:col-span-0 h-6 w-6 md:h-10 md:w-8 md:translate-x-2 bg-zinc-800 md:bg-transparent rounded-full text-zinc-400 hover:text-red-500 hover:bg-zinc-800"
                            >
                              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({
                          description: "",
                          length: 0,
                          width: 0,
                          height: 0,
                          weight: 0,
                        })
                      }
                      className="w-full border-dashed border-zinc-800 hover:bg-zinc-900 text-zinc-500 hover:text-white mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Another Item
                    </Button>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between pt-6 border-t border-zinc-800 gap-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className="text-zinc-400 hover:text-white order-2 md:order-1"
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>

                    <div className="flex gap-3 order-1 md:order-2 w-full md:w-auto">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCalculatePrice}
                        disabled={isCalculating}
                        className="flex-1 md:flex-none bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                      >
                        {isCalculating ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          "Verify & Calculate Price"
                        )}
                      </Button>

                      <Button
                        type="submit"
                        disabled={
                          !stats.canSubmit || isSubmitting || stats.price === 0
                        }
                        className={cn(
                          "flex-1 md:flex-none min-w-[150px]",
                          stats.canSubmit && stats.price > 0
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        )}
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          "Confirm Order"
                        )}
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


const FormInput = ({ label, reg, error, ...props }: any) => (
  <div className="space-y-1">
    <Label className={error ? "text-red-500" : "text-zinc-400"}>{label}</Label>
    <Input {...reg} {...props} className="bg-zinc-900 border-zinc-800 text-white" />
    {error && <span className="text-xs text-red-500">{error.message}</span>}
  </div>
);


const AddressSection = ({ form, type, title }: { form: UseFormReturn<TransportFormValues>, type: "pickup" | "dropoff", title: string }) => {
  const errors = form.formState.errors[type];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white font-medium pb-2 border-b border-zinc-800">
        <MapPin className="w-4 h-4 text-emerald-500" /> {title}
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs text-zinc-500">Street & Number Only</Label>
          <Input 
            {...form.register(`${type}.street`)} 
            placeholder="e.g. Calea București 33" 
            className="bg-zinc-950 border-zinc-800 focus:border-emerald-500/50 transition-colors"
          />
          {errors?.street ? (
            <span className="text-xs text-red-500">{errors.street.message}</span>
          ) : (
            <p className="text-[10px] text-zinc-600">
              Do not include Scara/Etaj/Ap here.
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-zinc-500">Additional Details (Optional)</Label>
          <Input 
            {...form.register(`${type}.details`)} 
            placeholder="e.g. Bl. 10, Sc. B, Et. 4, Ap. 12" 
            className="bg-zinc-950 border-zinc-800 placeholder:text-zinc-700"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-zinc-500">City</Label>
            <Input 
              {...form.register(`${type}.city`)} 
              placeholder="Brașov" 
              className="bg-zinc-950 border-zinc-800"
            />
            {errors?.city && <span className="text-xs text-red-500">{errors.city.message}</span>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-zinc-500">County</Label>
            <Input 
              {...form.register(`${type}.county`)} 
              placeholder="Brașov" 
              className="bg-zinc-950 border-zinc-800"
            />
            {errors?.county && <span className="text-xs text-red-500">{errors.county.message}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

