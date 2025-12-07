import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Settings, Database, Key, Image, CreditCard } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Database Info */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Type</span>
              <span className="text-white">Cloudflare D1</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Status</span>
              <span className="text-green-400">Connected</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Manage your D1 database via the Cloudflare Dashboard or using Wrangler CLI.
            </p>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5" />
              Environment Variables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Set these in your Cloudflare Worker settings:
            </p>
            <div className="space-y-2 font-mono text-sm">
              <div className="bg-gray-800 p-3 rounded">
                <span className="text-purple-400">EXOCLICK_ZONE_ID</span>
                <span className="text-gray-500"> - Ad zone for non-premium users</span>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <span className="text-purple-400">JUICYADS_ZONE_ID</span>
                <span className="text-gray-500"> - Alternative ad zone</span>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <span className="text-purple-400">LEMON_SQUEEZY_API_KEY</span>
                <span className="text-gray-500"> - For premium subscriptions</span>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <span className="text-purple-400">LEMON_SQUEEZY_STORE_ID</span>
                <span className="text-gray-500"> - Your store ID</span>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <span className="text-purple-400">LEMON_SQUEEZY_WEBHOOK_SECRET</span>
                <span className="text-gray-500"> - Webhook verification</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Storage */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Image className="w-5 h-5" />
              Media Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              For thumbnails and images, you can use:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <strong>Cloudflare R2</strong> - Add R2 bucket binding in wrangler.toml
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <strong>Cloudflare Images</strong> - Optimized image delivery
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <strong>External URLs</strong> - Direct links to images hosted elsewhere
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Payment Integration */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Premium subscriptions are handled via Lemon Squeezy.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Provider</span>
                <span className="text-white">Lemon Squeezy</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Webhook URL</span>
                <code className="text-xs bg-gray-800 px-2 py-1 rounded text-purple-400">
                  /api/webhooks/lemon-squeezy
                </code>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Configure your Lemon Squeezy product and webhook in their dashboard, then add the environment variables.
            </p>
          </CardContent>
        </Card>

        {/* CMS Options */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              CMS Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              You have multiple CMS options available:
            </p>
            <div className="space-y-3">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-1">Custom Admin Panel (Current)</h3>
                <p className="text-gray-500 text-sm">
                  Built-in admin at /admin - manages content in D1 database directly.
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-1">Sanity.io</h3>
                <p className="text-gray-500 text-sm">
                  External CMS with beautiful studio. Set SANITY_PROJECT_ID to enable.
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-1">Decap CMS</h3>
                <p className="text-gray-500 text-sm">
                  Git-based CMS at /decap-admin - stores content as files in your repo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
