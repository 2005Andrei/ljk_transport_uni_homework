"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconMapPin,
  IconTruck,
  IconCalendar,
  IconPackage,
  IconCurrencyEuro,
  IconCalendarPlus,
  IconCheck,
  IconLoader2,
  IconPhone
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { useNavigate } from "react-router-dom";
import AuthAPI from "@/lib/auth/AuthApi";
import { transportService } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface Shipment {
  id: number;
  leaving_address: string;
  destination: string;
  cost: number;
  content: string;
  status: number;
  phone_number: string,
  details: {
    distance_km: number;
    is_local: boolean;
    date: string;
  };
}

export default function Profile() {
  const [userData, setUserData] = useState<any>({});
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const navigate = useNavigate();

  const handleLogout = async (e: any) => {
    e.preventDefault();

    try {
      await AuthAPI.logout();
    } catch (err) {
      console.log("Lowkey screwed up");
    } finally {
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

 
  useEffect(() => {
    setIsMounted(true);

    const fetchData = async () => {
      try {
        const profileData = await AuthAPI.getProfile();
        console.log(profileData.is_staff);
        setUserData(profileData);
      } catch (e) {
        console.error("Failed to load profile:", e);
      }


      try {
        const transportList = await transportService.list();

        console.log(transportList);

        const formattedShipments: Shipment[] = transportList.map((item: any) => ({
          id: item.id,
          leaving_address: item.pickup, 
          destination: item.destination,
          cost: parseFloat(item.cost),
          content: item.content || "Standard Cargo",
          status: item.status,
          phone_number: item.phone_number,
          details: {
            distance_km: item.distance, 
            is_local: item.pickup.split(",").pop()?.trim() === item.destination.split(",").pop()?.trim(),
            date: item.created_at,
          },
        }));

        setShipments(formattedShipments);
      } catch (error) {
        console.error("Error fetching transports:", error);
      }
    };

    fetchData();
  }, []);



  const links = [
    { label: "Dashboard", href: "/profile", icon: <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Profile", href: "/user", icon: <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Programare", href: "/programare", icon: <IconCalendarPlus className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    //{ label: "Settings", href: "#settings", icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    {
      label: "Logout",
      href: "/logout",
      icon: <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      //onClick: handleLogout,
    },
  ];

  const projects = shipments.map((s) => ({
    title: `Shipment #${s.id} • ${s.details.is_local ? "Local" : "International"}`,
    description: (
      <span className="block space-y-3 text-sm">
        <span className="flex items-start gap-2">
          <IconMapPin className="h-4 w-4 mt-0.5 text-neutral-500" />
          <span className="block">
            <span className="block font-medium">From</span>
            <span className="block text-neutral-600 dark:text-neutral-400">{s.leaving_address.split(",")[0]}</span>
          </span>
        </span>
        <span className="flex items-start gap-2">
          <IconMapPin className="h-4 w-4 mt-0.5 text-neutral-500" />
          <span className="block">
            <span className="block font-medium">To</span>
            <span className="block text-neutral-600 dark:text-neutral-400">{s.destination.split(",")[0]}</span>
          </span>
        </span>
        <span className="flex items-center gap-6 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <span className="flex items-center gap-2">
            <IconTruck className="h-4 w-4 text-neutral-500" />
            <span>{s.details.distance_km} km</span>
          </span>
          <span className="flex items-center gap-2">
            <IconPackage className="h-4 w-4 text-neutral-500" />
            <span>{s.content.split(" (")[0]}</span>
          </span>
        </span>
        <span className="flex items-center justify-between pt-3">
          <span className="flex items-center gap-2 text-neutral-500">
            <IconCalendar className="h-4 w-4" />
            {new Date(s.details.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5 font-bold text-lg">
            <IconCurrencyEuro className="h-5 w-5" />
            {((s.cost)/4).toLocaleString()}
          </span>
        </span>
      </span>
    ),
    link: `#shipment-${s.id}`,
    id: s.id,
    status: s.status,
    onClick: () => setSelectedShipment(s),
  }));

  if (!isMounted) {
     return <div className="flex h-screen w-screen bg-gray-50 dark:bg-zinc-950" />;
  }

  return (
    <div className="flex h-screen w-screen bg-gray-50 dark:bg-zinc-950">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: `${userData.first_name || "User"} ${userData.last_name || ""}`,
                href: "/user",
                icon: (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {(userData.first_name?.[0] || "?").toUpperCase()}{(userData.last_name?.[0] || "").toUpperCase()}
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <Dashboard projects={projects} hasShipments={shipments.length > 0} onSelectShipment={(id) => {
        const found = shipments.find(s => s.id === id);
        if(found) setSelectedShipment(found);
      }}/>

      <ShipmentSheet 
        shipment={selectedShipment} 
        isOpen={!!selectedShipment} 
        onClose={(open) => !open && setSelectedShipment(null)}
        isStaff={userData?.is_staff || false}
      />

    </div>
  );
}

const Dashboard = ({ projects, hasShipments, onSelectShipment }: { projects: any[]; hasShipments: boolean, onSelectShipment: (id: number) => void }) => {
  
  const activeProjects = projects.filter(p => p.status !== 0);
  const pastProjects = projects.filter(p => p.status === 0);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-full flex-col overflow-y-auto rounded-tl-2xl bg-white p-8 md:p-12 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">Transporturi</h1>
        </div>

        <div className="w-full">
          {hasShipments ? (
            <div className="mx-auto max-w-7xl space-y-8" onClick={(e) => {
              const target = (e.target as HTMLElement).closest('a');
              if (target && target.getAttribute('href')?.startsWith('#shipment-')) {
                 e.preventDefault();
                 const id = parseInt(target.getAttribute('href')?.split('-')[1] || '0');
                 onSelectShipment(id);
              }
            }}>
              
              {activeProjects.length > 0 && (
                <div>
                   <h2 className="mt-8 text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    In Transit
                   </h2>
                   <HoverEffect items={activeProjects} />
                </div>
              )}

              {pastProjects.length > 0 && (
                <div>
                  {activeProjects.length > 0 && (
                    <div className="relative py-8">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase tracking-wider">
                        <span className="bg-white dark:bg-neutral-900 px-4 text-neutral-500">
                          Past Shipments
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {activeProjects.length === 0 && (
                     <h2 className="mt-8 text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
                        Past Shipments
                     </h2>
                  )}

                  <HoverEffect items={pastProjects} />
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center py-24">
              <div className="text-center">
                <IconTruck className="mx-auto h-16 w-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                <p className="text-xl text-neutral-500">Nu exista istoric.</p>
                <p className="mt-2 text-sm text-neutral-400">Transporturile vor aparea aici.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Logo = () => (
  <a href="/" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium whitespace-pre text-black dark:text-white">
    LJK Transport
    </motion.span>
  </a>
);

export const LogoIcon = () => (
  <a href="/" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
  </a>
);

const ShipmentSheet = ({ 
  shipment, 
  isOpen, 
  onClose,
  isStaff
}: { 
  shipment: Shipment | null, 
  isOpen: boolean, 
  onClose: (open: boolean) => void,
  isStaff: boolean
}) => {
  const [loading, setLoading] = useState(false);

  if (!shipment) return null;

  const isDelivered = shipment.status === 0;

  const handleMarkAsDelivered = async () => {
    try {
      setLoading(true);
      await transportService.mark_as_delivered(shipment.id);
      shipment.status = 0; 
      onClose(false); 
    } catch (error) {
      console.error("Failed to update shipment status", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col h-full w-full sm:max-w-xl bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 p-0 shadow-2xl">
        
        <SheetHeader className="p-6 mb-0 mt-8 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2 text-black dark:text-white">
              <IconPackage className="h-6 w-6 text-emerald-500" />
              Shipment #{shipment.id}
            </SheetTitle>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              isDelivered 
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            }`}>
              {isDelivered ? "Delivered" : "In Transit"}
            </span>
          </div>
          <SheetDescription>
            Created on {new Date(shipment.details.date).toLocaleDateString("en-GB", { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          <div className="relative border-l-2 border-dashed border-zinc-300 dark:border-zinc-700 ml-3 space-y-10 pb-2">
            
            <div className="relative pl-8">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-emerald-500 bg-white dark:bg-zinc-900" />
              <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Pickup</h4>
              <p className="text-lg font-medium mt-1 text-black dark:text-white">{shipment.leaving_address}</p>
            </div>

            <div className="relative pl-8">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Destination</h4>
              <p className="text-lg font-medium mt-1 text-black dark:text-white">{shipment.destination}</p>
            </div>
          </div>

          <Separator className="bg-zinc-200 dark:bg-zinc-800" />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <IconTruck className="h-4 w-4" /> Distance
              </div>
              <p className="text-xl font-semibold text-black dark:text-white">{shipment.details.distance_km} km</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <IconCurrencyEuro className="h-4 w-4" /> Total Cost
              </div>
              <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                {(shipment.cost).toLocaleString()} RON
              </p>
            </div>

            <div className="space-y-1 col-span-2">
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <IconPackage className="h-4 w-4" /> Cargo Content
              </div>
              <p className="text-md font-medium text-black dark:text-white">{shipment.content}</p>
            </div>

            {isStaff && (
              <div className="space-y-1 col-span-2">
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <IconUserBolt className="h-4 w-4" /> Client Contact
                </div>
                <p className="text-md font-medium text-black dark:text-white">
                  {shipment.phone_number || "No phone number available"}
                </p>
              </div>
            )}
          </div>
        </div> 

        <SheetFooter className="flex flex-col gap-4 p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          {isStaff && !isDelivered && (
             <div className="w-full">
               <button
                 disabled={loading}
                 onClick={handleMarkAsDelivered}
                 className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {loading ? (
                   <IconLoader2 className="h-5 w-5 animate-spin" />
                 ) : (
                   <IconCheck className="h-5 w-5" />
                 )}
                 Mark as Delivered
               </button>
             </div>
          )}

          <div className="w-full bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm text-zinc-500 flex flex-col gap-1">
            <p className="font-semibold text-black dark:text-white">Need help with this shipment?</p>
            <p>Contact support with ID <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">#{shipment.id}</span></p>
          </div>
        </SheetFooter>

      </SheetContent>
    </Sheet>
  )
};
