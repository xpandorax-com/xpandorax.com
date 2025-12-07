import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, Link, Outlet } from "@remix-run/react";
import { requireAdmin } from "~/lib/auth/session.server";
import { 
  LayoutDashboard, 
  Video, 
  FolderOpen, 
  Users, 
  Settings, 
  LogOut,
  Home,
  BarChart3
} from "lucide-react";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [{ title: "Admin Dashboard - XpandoraX" }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const { user } = await requireAdmin(request, context);
    return json({ user });
  } catch (error) {
    return redirect("/login?redirect=/admin");
  }
}

export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/videos", icon: Video, label: "Videos" },
    { to: "/admin/categories", icon: FolderOpen, label: "Categories" },
    { to: "/admin/actresses", icon: Users, label: "Models" },
    { to: "/admin/stats", icon: BarChart3, label: "Statistics" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">X</span>
            </div>
            <span className="text-white font-semibold">XpandoraX Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              end={item.end}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm" className="flex-1 text-gray-400 hover:text-white">
              <Link to="/">
                <Home className="w-4 h-4 mr-1" />
                Site
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="flex-1 text-gray-400 hover:text-white">
              <Link to="/logout">
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
