import { useEffect } from "react";
import type { AdConfig } from "~/types";

interface AdBannerProps {
  zoneId: string;
  className?: string;
}

/**
 * ExoClick banner ad component
 * Server-side injected for non-premium users only
 */
export function ExoClickBanner({ zoneId, className }: AdBannerProps) {
  useEffect(() => {
    // Load ExoClick ad script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://a.magsrv.com/ad-provider.js`;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [zoneId]);

  return (
    <div className={className}>
      <ins
        className="eas6a97888e"
        data-zoneid={zoneId}
        style={{ display: "block", width: "100%", height: "auto" }}
      />
    </div>
  );
}

interface JuicyAdsPopUnderProps {
  spotId: string;
}

/**
 * JuicyAds pop-under component
 * Injected server-side for non-premium users only
 */
export function JuicyAdsPopUnder({ spotId }: JuicyAdsPopUnderProps) {
  useEffect(() => {
    // Load JuicyAds pop-under script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://js.juicyads.com/jp.php?c=${spotId}&u=aHR0cHM6Ly93d3cuanVpY3lhZHMuY29t`;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [spotId]);

  // This component renders nothing visible
  return null;
}

interface AdContainerProps {
  adConfig: AdConfig | null;
  position: "top" | "bottom" | "sidebar";
}

/**
 * Ad container that shows ads only for non-premium users
 */
export function AdContainer({ adConfig, position }: AdContainerProps) {
  if (!adConfig) {
    return null;
  }

  const positionClasses = {
    top: "w-full mb-4",
    bottom: "w-full mt-4",
    sidebar: "w-full",
  };

  return (
    <div className={positionClasses[position]}>
      <ExoClickBanner
        zoneId={adConfig.exoclickZoneId}
        className="mx-auto max-w-[728px]"
      />
    </div>
  );
}

/**
 * Pop-under ads wrapper - only renders for non-premium users
 */
export function PopUnderAds({ adConfig }: { adConfig: AdConfig | null }) {
  if (!adConfig) {
    return null;
  }

  return <JuicyAdsPopUnder spotId={adConfig.juicyadsZoneId} />;
}
