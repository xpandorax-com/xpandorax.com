import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

// GitHub OAuth callback for Decap CMS
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // Handle OAuth errors from GitHub
  if (error) {
    console.error("GitHub OAuth error:", error, errorDescription);
    return new Response(`GitHub OAuth error: ${errorDescription || error}`, { 
      status: 400,
      headers: { "Content-Type": "text/plain" }
    });
  }

  if (!code) {
    return new Response("Missing authorization code", { status: 400 });
  }

  const env = context.cloudflare.env as {
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
  };

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response("GitHub OAuth not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET secrets.", { status: 500 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json() as { 
      access_token?: string; 
      error?: string;
      error_description?: string;
    };

    if (tokenData.error || !tokenData.access_token) {
      console.error("Token exchange error:", tokenData);
      return new Response(`OAuth error: ${tokenData.error_description || tokenData.error}`, { 
        status: 400 
      });
    }

    const accessToken = tokenData.access_token;

    // Return HTML that sends the token back to Decap CMS via postMessage
    const responseData = JSON.stringify({ token: accessToken, provider: "github" });
    
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authentication Complete</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #1a1a2e; color: white; }
    .container { text-align: center; }
    .spinner { border: 3px solid #333; border-top: 3px solid #8b5cf6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Authenticating with GitHub...</p>
    <p style="font-size: 12px; opacity: 0.7;">This window will close automatically.</p>
  </div>
  <script>
    (function() {
      const data = ${responseData};
      
      function sendMessage() {
        if (window.opener) {
          // Send success message to opener (Decap CMS)
          window.opener.postMessage(
            'authorization:github:success:' + JSON.stringify(data),
            '*'
          );
          setTimeout(function() { window.close(); }, 1000);
        } else {
          document.body.innerHTML = '<div class="container"><p>Authentication successful!</p><p>You can close this window.</p></div>';
        }
      }
      
      // Try sending immediately
      sendMessage();
      
      // Also listen for message requests
      window.addEventListener('message', function(e) {
        if (e.data === 'authorizing:github') {
          sendMessage();
        }
      });
    })();
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    return new Response("Authentication failed: " + String(error), { status: 500 });
  }
}
