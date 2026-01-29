"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { 
  IconUserBolt, 
  IconBrandTabler, 
  IconCalendarPlus, 
  IconArrowLeft,
  IconMail,
  IconPhone,
  IconTruck,
  IconTrendingUp,
  IconTrendingDown
} from "@tabler/icons-react";
import { Area, AreaChart, CartesianGrid, XAxis, Bar, BarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion"; 
import AuthAPI from "@/lib/auth/AuthApi";
import { transportService } from "@/lib/api";
import { cn } from "@/lib/utils";

const shipmentConfig = {
  shipments: {
    label: "Shipments",
    color: "#10b981", 
  },
} satisfies ChartConfig;

const costConfig = {
  cost: {
    label: "Cost (RON)",
    color: "#059669", 
  },
} satisfies ChartConfig;

export default function UserProfile() {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [shipmentData, setShipmentData] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [recentShipments, setRecentShipments] = useState<any[]>([]);
  const [percentageChange, setPercentageChange] = useState({ value: "0", isPositive: true });

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await AuthAPI.getProfile();
        setUserData(profile);

        const shipments = await transportService.list();
        
        const total = shipments.reduce((acc: number, curr: any) => acc + (parseFloat(curr.cost) || 0), 0);
        setTotalSpent(total);

        setRecentShipments(shipments.slice(0, 2));

        const now = new Date();
        const currentMonthIndex = now.getMonth();
        const currentYear = now.getFullYear();
        
        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthIndex = prevDate.getMonth();
        const prevYear = prevDate.getFullYear();

        let currentMonthCost = 0;
        let prevMonthCost = 0;

        const processChartData = () => {
            const last6Months = [];

            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                last6Months.push({
                    month: d.toLocaleString('default', { month: 'short' }),
                    year: d.getFullYear(),
                    monthIndex: d.getMonth(),
                    shipments: 0,
                    cost: 0
                });
            }

            shipments.forEach((item: any) => {
                const itemDate = new Date(item.created_at);
                const itemCost = parseFloat(item.cost) / 4;

                const bucket = last6Months.find(m => 
                    m.monthIndex === itemDate.getMonth() && 
                    m.year === itemDate.getFullYear()
                );
                if (bucket) {
                    bucket.shipments += 1;
                    bucket.cost += itemCost;
                }

                if (itemDate.getMonth() === currentMonthIndex && itemDate.getFullYear() === currentYear) {
                    currentMonthCost += itemCost;
                } else if (itemDate.getMonth() === prevMonthIndex && itemDate.getFullYear() === prevYear) {
                    prevMonthCost += itemCost;
                }
            });

            return last6Months;
        };

        setShipmentData(processChartData());

        let percentDiff = 0;
        if (prevMonthCost > 0) {
            percentDiff = ((currentMonthCost - prevMonthCost) / prevMonthCost) * 100;
        } else if (currentMonthCost > 0) {
            percentDiff = 100; 
        }
        
        setPercentageChange({
            value: Math.abs(percentDiff).toFixed(1),
            isPositive: percentDiff >= 0
        });

      } catch (e) {
        console.error("Error loading profile", e);
      }
    };
    loadData();
  }, []);

  const links = [
    { label: "Dashboard", href: "/profile", icon: <IconBrandTabler className="h-5 w-5 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Profile", href: "/user", icon: <IconUserBolt className="h-5 w-5 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Programare", href: "/programare", icon: <IconCalendarPlus className="h-5 w-5 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Logout", href: "/logout", icon: <IconArrowLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-200" /> },
  ];

  return (
    <div className="flex h-screen w-screen bg-gray-50 dark:bg-zinc-950">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
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

      <div className="flex flex-1 flex-col overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <div className="flex flex-col md:flex-row gap-6 md:items-stretch">
            <div className="w-full md:w-1/3">
              <HoverCardWrapper className="h-full">
                <Card className="h-full shadow-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Avatar className="h-16 w-16 border-2 border-emerald-500/20">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                        {userData.first_name?.[0]}{userData.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <CardTitle className="text-xl text-zinc-900 dark:text-zinc-100">
                        {userData.first_name} {userData.last_name}
                      </CardTitle>
                      <CardDescription className="text-zinc-500">@{userData.username || "user"}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 mt-4">
                    <div className="flex items-center gap-4 rounded-md border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 p-3">
                      <IconMail className="h-5 w-5 text-emerald-500" />
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-medium text-zinc-500 uppercase">Email</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{userData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-md border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 p-3">
                      <IconPhone className="h-5 w-5 text-emerald-500" />
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-medium text-zinc-500 uppercase">Phone</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{userData.phone_number}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 pt-4 pb-4 mt-auto">
                      <div className="flex flex-col w-full">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">User Role</span>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            Standard Client
                        </span>
                      </div>
                  </CardFooter>
                </Card>
              </HoverCardWrapper>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-2/3">
              
              <HoverCardWrapper>
                <Card className="h-full flex flex-col justify-center bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 shadow-sm relative overflow-hidden">
                  <CardHeader className="pb-2 relative z-10">
                    <CardDescription className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-xs tracking-wider">Total Spent</CardDescription>
                    <CardTitle className="text-4xl text-zinc-900 dark:text-white">
                      {(totalSpent / 4).toLocaleString()} <span className="text-lg text-zinc-400 font-normal">RON</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-xs text-zinc-500 flex items-center gap-1">
                      <span className={cn(
                        "font-medium flex items-center gap-1",
                        percentageChange.isPositive ? "text-emerald-500" : "text-amber-500"
                      )}>
                        {percentageChange.isPositive ? <IconTrendingUp className="h-3 w-3" /> : <IconTrendingDown className="h-3 w-3" />}
                        {percentageChange.isPositive ? "+" : "-"}{percentageChange.value}%
                      </span> 
                      vs last month
                    </div>
                  </CardContent>
                </Card>
              </HoverCardWrapper>

              <HoverCardWrapper>
                <Card className="h-full flex flex-col justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-zinc-500 uppercase text-xs tracking-wider font-bold">Total Shipments</CardDescription>
                    <CardTitle className="text-4xl text-zinc-900 dark:text-white">
                      {shipmentData.reduce((a, b) => a + b.shipments, 0)}
                    </CardTitle>
                  </CardHeader>
                    <CardContent>
                    <div className="text-xs text-zinc-500">Lifetime deliveries</div>
                  </CardContent>
                </Card>
              </HoverCardWrapper>
              
              <div className="sm:col-span-2 h-full">
                <HoverCardWrapper className="h-full">
                  <Card className="h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
                      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                        <CardTitle className="text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                           <IconTruck className="h-5 w-5 text-emerald-500" />
                           Active Shipments
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 flex-1">
                        {recentShipments.length > 0 ? (
                           <div className="space-y-4">
                              {recentShipments.map((s: any) => (
                                 <div key={s.id} className="flex items-center justify-between">
                                    <div>
                                       <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                          {s.pickup.split(',')[0]} 
                                          <span className="text-zinc-400">→</span> 
                                          {s.destination.split(',')[0]}
                                       </div>
                                       <p className="text-xs text-zinc-500 mt-0.5">
                                          ID: #{s.id} • {new Date(s.created_at).toLocaleDateString()}
                                       </p>
                                    </div>
                                    <div className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                                       In Transit
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="flex items-center justify-center h-full text-sm text-zinc-400 italic py-4">
                              No active shipments found.
                           </div>
                        )}
                      </CardContent>
                  </Card>
                </HoverCardWrapper>
              </div>

            </div>
          </div>

          <Separator className="bg-zinc-200 dark:bg-zinc-800" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <HoverCardWrapper>
              <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-zinc-900 dark:text-white">Shipment Frequency</CardTitle>
                  <CardDescription className="text-zinc-500">Volume of deliveries over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={shipmentConfig} className="min-h-[200px] w-full">
                    <AreaChart
                      accessibilityLayer
                      data={shipmentData}
                      margin={{ left: 12, right: 12 }}
                    >
                      <CartesianGrid vertical={false} stroke="#3f3f46" strokeOpacity={0.1} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                        stroke="#71717a"
                      />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                      <Area
                        dataKey="shipments"
                        type="natural"
                        fill="#10b981" 
                        fillOpacity={0.2}
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </HoverCardWrapper>

            <HoverCardWrapper>
               <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-zinc-900 dark:text-white">Spending Analysis</CardTitle>
                  <CardDescription className="text-zinc-500">Monthly cost breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={costConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={shipmentData}>
                      <CartesianGrid vertical={false} stroke="#3f3f46" strokeOpacity={0.1} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                        stroke="#71717a"
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar 
                          dataKey="cost" 
                          fill="#059669" 
                          radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </HoverCardWrapper>

          </div>
        </div>
      </div>
    </div>
  );
}


export const Logo = () => (
  <a href="#" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium whitespace-pre text-black dark:text-white">
    LJK Transport
    </motion.span>
  </a>
);

export const LogoIcon = () => (
  <a href="#" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
  </a>
);

const HoverCardWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [isHovered, setIsHovered] = useState(false);
   
  return (
    <div 
      className={cn("relative p-2 h-full group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.span
            className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-3xl"
            layoutId="hoverBackground" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
          />
        )}
      </AnimatePresence>
      <div className="relative z-20 h-full">
        {children}
      </div>
    </div>
  );
};
