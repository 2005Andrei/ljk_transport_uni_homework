"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState, useEffect } from "react";
import { WavyBackground } from "@/components/ui/wavy-background";
import { useNavigate } from "react-router-dom";
import VideoScrollHero from "@/components/VideoScrollHero";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { Timeline } from "@/components/ui/timeline";


const isAuthenticated = () => !!localStorage.getItem('access_token');

export default function Homepage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth > 768);
    }
    
    window.addEventListener("resize", handleResize);
    
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { name: "Acasa", link: "/" },
    { name: "Programare", link: "/programare" },
  ];








  

const data = [
  {
    title: "2024",
    content: (
      <div>
        <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
          Am extins flota internațională și am optimizat rutele de transport
          rutier pentru livrări mai rapide și mai sigure în toată Europa.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <img
            src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7"
            alt="camion transport international"
            width={500}
            height={500}
            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06)] md:h-44 lg:h-60"
          />
          <img
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957"
            alt="flota camioane"
            width={500}
            height={500}
            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06)] md:h-44 lg:h-60"
          />
          <img
            src="https://images.unsplash.com/photo-1586864387789-628af9feed72"
            alt="logistica transport"
            width={500}
            height={500}
            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06)] md:h-44 lg:h-60"
          />
          <img
            src="https://images.unsplash.com/photo-1590496793929-36417d3117de"
            alt="transport marfa"
            width={500}
            height={500}
            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06)] md:h-44 lg:h-60"
          />
        </div>
      </div>
    ),
  },
  {
    title: "Început de 2023",
    content: (
      <div>
        <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
          Am investit în digitalizarea proceselor logistice și în sisteme moderne
          de urmărire a transporturilor în timp real.
        </p>
        <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
          Accentul a fost pus pe siguranță, predictibilitate și reducerea timpilor
          de livrare pentru clienții noștri.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <img
            src="https://images.unsplash.com/photo-1559297434-fae8a1916a79"
            alt="depozit logistic"
            width={500}
            height={500}
            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06)] md:h-44 lg:h-60"
          />
          <img
            src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81"
            alt="incarcare marfa"
            width={500}
            height={500}
            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06)] md:h-44 lg:h-60"
          />
          <img
            src="https://images.unsplash.com/photo-1578575437130-527eed3abbec"
            alt="camion autostrada"
            width={500}
            height={500}
            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06)] md:h-44 lg:h-60"
          />
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
            alt="logistica industriala"
            width={500}
            height={500}
            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06)] md:h-44 lg:h-60"
          />
        </div>
      </div>
    ),
  },
  {
    title: "Evoluție & Repere",
    content: (
      <div>
        <p className="mb-4 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
          Etape importante în dezvoltarea companiei noastre de transport.
        </p>
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300">
            ✅ Lansare servicii transport internațional
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300">
            ✅ Monitorizare GPS pentru întreaga flotă
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300">
            ✅ Extindere capacitate depozitare
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300">
            ✅ Parteneriate logistice strategice
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300">
            ✅ Reducere emisii prin optimizare rute
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <img
            src="https://images.unsplash.com/photo-1616432043562-3671ea2e5242"
            alt="transport european"
            width={500}
            height={500}
            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06)] md:h-44 lg:h-60"
          />
          <img
            src="https://images.unsplash.com/photo-1603791440384-56cd371ee9a7"
            alt="flota moderna"
            width={500}
            height={500}
            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06)] md:h-44 lg:h-60"
          />
          <img
            src="https://images.unsplash.com/photo-1611095973763-414019e72400"
            alt="logistica rutiera"
            width={500}
            height={500}
            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06)] md:h-44 lg:h-60"
          />
          <img
            src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492"
            alt="transport marfa grea"
            width={500}
            height={500}
            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06)] md:h-44 lg:h-60"
          />
        </div>
      </div>
    ),
  },
];





  return (
    <>
      <div className="relative z-50"> 
        <Navbar>
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />
            <div className="flex items-center gap-4">
              {isAuthenticated() ? (
                <NavbarButton variant="primary" onClick={() => navigate('/profile')}>Administrare</NavbarButton>
              ) : (
                <NavbarButton variant="primary" onClick={() => navigate('/login')}>Login</NavbarButton>
              )}
            </div>
          </NavBody>
  
          <MobileNav>
            <MobileNavHeader>
              <NavbarLogo />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </MobileNavHeader>
  
            <MobileNavMenu
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            >
              {navItems.map((item, idx) => (
                <a
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-neutral-600 dark:text-neutral-300"
                >
                  <span className="block">{item.name}</span>
                </a>
              ))}
              <div className="flex w-full flex-col gap-4">
                <NavbarButton onClick={() => setIsMobileMenuOpen(false)} variant="primary" className="w-full">
                Programare
                </NavbarButton>
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>
      </div>

      {isDesktop ? (
        <VideoScrollHero />
      ) : (
        <WavyBackground className="max-w-4x1 mx-auto pb-40">
          <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold inter-var text-center">
            LJK Transport
          </p>
          <p className="text-base md:text-lg mt-4 text-white font-normal inter-var text-center">
            Transportul aici este insane. Il livram azi si ajunge ieri.
          </p>
        </WavyBackground>
      )}

      <DummyContent />
      <div className="relative w-full overflow-clip">
        <Timeline data={data} />
      </div>
      <div className="w-full dark:bg-neutral-950 p-10">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
          Footer. Hello there. Imi e lene sa mai caut text placeholder.
        </p>
      </div>

    </>
  );
}

const DummyContent = () => {
  return (
    <div className="container mx-auto p-8 pt-24">
      <h1 className="mb-4 text-center text-3xl font-bold">
        Continut placeholder este aici
      </h1>
      <p className="mb-10 text-center text-sm text-zinc-500">
        Chiar daca galeria de mai jos nu arata foarte bine, este pusa ca ideee.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            id: 1,
            title: "The",
            width: "md:col-span-1",
            height: "h-60",
            bg: "bg-neutral-100 dark:bg-neutral-800",
          },
          {
            id: 2,
            title: "First",
            width: "md:col-span-2",
            height: "h-60",
            bg: "bg-neutral-100 dark:bg-neutral-800",
          },
          {
            id: 3,
            title: "Rule",
            width: "md:col-span-1",
            height: "h-60",
            bg: "bg-neutral-100 dark:bg-neutral-800",
          },
          {
            id: 4,
            title: "Of",
            width: "md:col-span-3",
            height: "h-60",
            bg: "bg-neutral-100 dark:bg-neutral-800",
          },
          {
            id: 5,
            title: "F",
            width: "md:col-span-1",
            height: "h-60",
            bg: "bg-neutral-100 dark:bg-neutral-800",
          },
          {
            id: 6,
            title: "Club",
            width: "md:col-span-2",
            height: "h-60",
            bg: "bg-neutral-100 dark:bg-neutral-800",
          },
          {
            id: 7,
            title: "Is",
            width: "md:col-span-2",
            height: "h-60",
            bg: "bg-neutral-100 dark:bg-neutral-800",
          },
          {
            id: 8,
            title: "You",
            width: "md:col-span-1",
            height: "h-60",
            bg: "bg-neutral-100 dark:bg-neutral-800",
          },
          {
            id: 9,
            title: "Do NOT TALK about",
            width: "md:col-span-2",
            height: "h-60",
            bg: "bg-neutral-100 dark:bg-neutral-800",
          },
          {
            id: 10,
            title: "F Club",
            width: "md:col-span-1",
            height: "h-60",
            bg: "bg-neutral-100 dark:bg-neutral-800",
          },
        ].map((box) => (
          <div
            key={box.id}
            className={`${box.width} ${box.height} ${box.bg} flex items-center justify-center rounded-lg p-4 shadow-sm`}
          >
            <h2 className="text-xl font-medium">{box.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};


