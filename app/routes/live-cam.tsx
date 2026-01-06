import type { MetaFunction } from "@remix-run/cloudflare";
import { Video, ExternalLink, Users, Sparkles, Shuffle, Globe } from "lucide-react";
import { Button } from "~/components/ui/button";

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
  const liveCamUrl = "https://chaturbate.com/?join_overlay=1&campaign=HGMnE&tour=g4pe&track=default&disable_sound=0";

  const categories = [
    { title: "Female", color: "from-pink-500 to-rose-500", emoji: "👩", url: "https://chaturbate.com/in/?tour=EuIR&campaign=HGMnE&track=default" },
    { title: "Male", color: "from-blue-500 to-cyan-500", emoji: "👨", url: "https://chaturbate.com/in/?tour=YKzf&campaign=HGMnE&track=default" },
    { title: "Couples", color: "from-purple-500 to-pink-500", emoji: "💑", url: "https://chaturbate.com/in/?tour=DqyZ&campaign=HGMnE&track=default" },
    { title: "Trans", color: "from-amber-500 to-orange-500", emoji: "🌈", url: "https://chaturbate.com/in/?tour=vj0T&campaign=HGMnE&track=default" },
  ];

  const randomRooms = [
    { title: "Random Female", color: "from-pink-500 to-rose-500", emoji: "🎲", url: "https://chaturbate.com/in/?tour=41Ea&campaign=HGMnE&track=default" },
    { title: "Random Male", color: "from-blue-500 to-cyan-500", emoji: "🎲", url: "https://chaturbate.com/in/?tour=9rL0&campaign=HGMnE&track=default" },
    { title: "Random Couple", color: "from-purple-500 to-pink-500", emoji: "🎲", url: "https://chaturbate.com/in/?tour=goZq&campaign=HGMnE&track=default" },
    { title: "Random Trans", color: "from-amber-500 to-orange-500", emoji: "🎲", url: "https://chaturbate.com/in/?tour=sxJR&campaign=HGMnE&track=default" },
  ];

  const regions = [
    { title: "Asian Cams", color: "from-red-500 to-orange-500", emoji: "🌏", url: "https://chaturbate.com/in/?tour=AZcr&campaign=HGMnE&track=default" },
    { title: "Euro Russian Cams", color: "from-blue-500 to-indigo-500", emoji: "🌍", url: "https://chaturbate.com/in/?tour=ERcr&campaign=HGMnE&track=default" },
    { title: "North American Cams", color: "from-green-500 to-teal-500", emoji: "🌎", url: "https://chaturbate.com/in/?tour=NAcr&campaign=HGMnE&track=default" },
    { title: "South American Cams", color: "from-yellow-500 to-orange-500", emoji: "🌎", url: "https://chaturbate.com/in/?tour=SAcr&campaign=HGMnE&track=default" },
    { title: "Other Region Cams", color: "from-purple-500 to-violet-500", emoji: "🌐", url: "https://chaturbate.com/in/?tour=ORcr&campaign=HGMnE&track=default" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="container py-6 sm:py-8">
        <div className="flex items-center gap-2 mb-2">
          <Video className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 animate-pulse" />
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            Live Cam
          </h1>
          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full animate-pulse">
            LIVE
          </span>
        </div>
        <p className="text-muted-foreground">
          Watch thousands of live cam performers streaming right now
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 container pb-8 space-y-8">
        {/* Featured Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Featured Card */}
          <div className="md:col-span-2 lg:col-span-3 relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-red-500/20 border border-pink-500/30 p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent" />
            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25" />
                  <div className="relative w-4 h-4 bg-red-500 rounded-full" />
                </div>
                <span className="text-lg font-semibold text-red-400">Live Now</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
                  Thousands of Live Performers
                </span>
              </h2>
              
              <p className="text-muted-foreground max-w-2xl">
                Connect with live cam models from around the world. Interactive shows, private sessions, and more await you.
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-pink-500" />
                  <span>10,000+ Models Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>HD Quality Streams</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-red-500" />
                  <span>24/7 Live Content</span>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="mt-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold px-8 py-6 text-lg rounded-full shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all"
              >
                <a href={liveCamUrl} target="_blank" rel="noopener noreferrer">
                  <Video className="mr-2 h-5 w-5" />
                  Watch Live Cams
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>

              <p className="text-xs text-muted-foreground mt-2">
                Opens in a new tab • Free to browse
              </p>
            </div>
          </div>

          {/* Embedded Live Cam Section */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-pink-500/10 to-red-500/10">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25" />
                    <div className="relative w-3 h-3 bg-red-500 rounded-full" />
                  </div>
                  <h3 className="font-semibold">Featured Live Stream</h3>
                </div>
              </div>
              <div className="flex justify-center p-4">
                <iframe
                  src="https://cbxyz.com/in/?tour=nvfS&campaign=HGMnE&track=embed"
                  height="528"
                  width="850"
                  style={{ border: 'none' }}
                  allowFullScreen
                  title="Live Cam Stream"
                  allow="autoplay; fullscreen"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-pink-500" />
            <h2 className="text-xl font-bold">Browse by Category</h2>
          </div>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {categories.map((category) => (
              <a
                key={category.title}
                href={category.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl bg-card border p-6 hover:border-pink-500/50 transition-all hover:shadow-lg hover:shadow-pink-500/10"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <span className="text-3xl mb-2 block">{category.emoji}</span>
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">Live now</p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-pink-500 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Random Rooms Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shuffle className="h-5 w-5 text-purple-500" />
            <h2 className="text-xl font-bold">Random Rooms</h2>
          </div>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {randomRooms.map((room) => (
              <a
                key={room.title}
                href={room.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl bg-card border p-6 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${room.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <span className="text-3xl mb-2 block">{room.emoji}</span>
                    <h3 className="text-lg font-semibold">{room.title}</h3>
                    <p className="text-sm text-muted-foreground">Surprise me!</p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Regions Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-bold">Browse by Region</h2>
          </div>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {regions.map((region) => (
              <a
                key={region.title}
                href={region.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl bg-card border p-5 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${region.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <span className="text-2xl mb-2 block">{region.emoji}</span>
                    <h3 className="text-sm font-semibold">{region.title}</h3>
                    <p className="text-xs text-muted-foreground">Live now</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-green-500 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
