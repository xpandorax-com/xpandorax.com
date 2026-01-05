import type { MetaFunction } from "@remix-run/cloudflare";
import { Video } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Live Cam - XpandoraX" },
    {
      name: "description",
      content: "Watch live cam streams on XpandoraX.",
    },
    { property: "og:title", content: "Live Cam - XpandoraX" },
    { property: "og:description", content: "Watch live cam streams on XpandoraX." },
    { property: "og:type", content: "website" },
  ];
};

export default function LiveCam() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="container py-4 sm:py-6">
        <div className="flex items-center gap-2">
          <Video className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 animate-pulse" />
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            Live Cam
          </h1>
          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full animate-pulse">
            LIVE
          </span>
        </div>
      </div>

      {/* Iframe Container - Takes remaining space */}
      <div className="flex-1 container pb-4 sm:pb-6">
        <div className="relative w-full h-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px] bg-black rounded-lg overflow-hidden">
          <iframe
            src="https://cbxyz.com/in/?tour=SHBY&campaign=HGMnE&track=embed&room=xpandorax_com"
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none' }}
            allowFullScreen
            title="Live Cam"
            allow="autoplay; fullscreen"
          />
        </div>
      </div>
    </div>
  );
}
