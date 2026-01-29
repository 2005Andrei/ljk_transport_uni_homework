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
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { HoverEffect } from "@/components/ui/card-hover-effect";

interface Shipment {
  id: number;
  leaving_address: string;
  destination: string;
  cost: number;
  content: string;
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

  useEffect(() => {
    setIsMounted(true);
    
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user_data", e);
      }
    }

    const history = localStorage.getItem("transport_requests");
    if (history) {
      try {
        setShipments(JSON.parse(history));
        console.log(JSON.parse(history));
      } catch (e) {
        console.error("Failed to parse transport_history", e);
      }
    }
  }, []);

  const links = [
    { label: "Dashboard", href: "/fuckall", icon: <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Profile", href: "/fuckass", icon: <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Settings", href: "#settings", icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    {
      label: "Logout",
      href: "/logout",
      icon: <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: () => {
        if (typeof window !== 'undefined') localStorage.clear();
      },
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
            <span>{s.details.distance_km.toFixed(0)} km</span>
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
                href: "#",
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

      <Dashboard projects={projects} hasShipments={shipments.length > 0} />
    </div>
  );
}

const Dashboard = ({ projects, hasShipments }: { projects: any[]; hasShipments: boolean }) => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-full flex-col overflow-y-auto rounded-tl-2xl bg-white p-8 md:p-12 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">Istoric Transport</h1>
          <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
            {hasShipments
              ? `Aveti ${projects.length} urmatoarele transporturi: ${projects.length > 1 ? "s" : ""}`
              : "No shipments yet"}
          </p>
        </div>

        <div className="w-full">
          {hasShipments ? (
            <div className="mx-auto max-w-7xl">
              <HoverEffect items={projects} />
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
  <a href="#" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium whitespace-pre text-black dark:text-white">
      TransTrack
    </motion.span>
  </a>
);

export const LogoIcon = () => (
  <a href="#" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
  </a>
);
