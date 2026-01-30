"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import carVideo from "@/components/resources/car-video.mp4";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { motion } from "motion/react";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";

gsap.registerPlugin(ScrollTrigger);

export default function VideoScrollHero() {
  const container = useRef(null);
  const videoRef = useRef(null);
  const textContainer = useRef(null);

  useGSAP(() => {
    const video = videoRef.current;
    if (!video || !container.current) return;

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top top",
        end: "+=6000", 
        pin: true,
        scrub: 1, 
      },
    });

    tl.to(".main-title", { opacity: 0, duration: 1 });

    const safeDuration = video.duration && !isNaN(video.duration) ? video.duration : 15;
    
    tl.fromTo(
      video,
      { currentTime: 0 },
      { currentTime: safeDuration, duration: 10, ease: "none" },
      0
    );

    const sections = gsap.utils.toArray(".feature-item");
    
    sections.forEach((section, i) => {
      
      const fadeInStart = 1.5 + (i * 3);
      const fadeOutStart = fadeInStart + 2;

      tl.fromTo(
        section,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1 },
        fadeInStart
      );

      tl.to(
        section,
        { opacity: 0, y: -50, duration: 1 },
        fadeOutStart
      );
    });

  }, { scope: container });


  const words = [
      {
        text: "Transportati",
      },
      {
        text: "cu",
      },
      {
        text: "noi",
      },
      {
        text: "la",
      },
      {
        text: "LJK",
        className: "text-emerald-500 dark:text-emerald-500",
      },
    ];

  return (
    <div ref={container} className="relative h-screen w-full overflow-hidden bg-black">
      
      <video
        ref={videoRef}
        className="absolute top-0 left-0 h-full w-full object-cover"
        muted
        playsInline
        preload="auto"
        onLoadedData={() => console.log('video loaded')}
        onError={(e) => console.log('video error ', e)}
        src = {carVideo}
      >
      </video>

      <div className="main-title absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <TypewriterEffectSmooth words={words}/>
      </div>

      <div ref={textContainer} className="absolute inset-0 z-20 pointer-events-none">
        
        <div className="feature-item absolute top-1/2 left-[10%] -translate-y-1/2 w-[40%] opacity-0">
          <h2 className="text-6xl font-bold text-white mb-4">Aerodynamic</h2>
          <p className="text-2xl text-gray-200">Cut through the air with our new streamlined chassis.</p>
        </div>

        <div className="feature-item absolute top-1/2 left-[10%] -translate-y-1/2 w-[40%] opacity-0">
          <h2 className="text-6xl font-bold text-white mb-4">Zero Emissions</h2>
          <p className="text-2xl text-gray-200">Drive into the future with a carbon-neutral footprint.</p>
        </div>

        <div className="feature-item absolute top-1/2 left-[10%] -translate-y-1/2 w-[40%] opacity-0">
          <h2 className="text-6xl font-bold text-white mb-4">Total Silence</h2>
          <p className="text-2xl text-gray-200">Experience the road like never before.</p>
        </div>

      </div>
    </div>
  );
}
