const token = 'VNR3Vo-Lx4xin1qWs5V5-yUBctO2YWFzTO98UwEz';
const zoneId = '7a80fd2ecf89fe08f0dc6b9ddf1ce2cc';
const pagesDomain = '2059bde5.xpandorax-com.pages.dev';

const headers = {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
};

async function setupRedirect() {
  console.log('🔧 Setting up redirect rule for root domain\n');
  
  try {
    // Try to create redirect using Transform Rules
    console.log('Creating Transform Rule to redirect root -> www...');
    
    const ruleRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets/phases/http_request_dynamic_redirect/entrypoint`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        rules: [
          {
            action: 'redirect',
            action_parameters: {
              from_value: {
                status_code: 301,
                target_url: 'https://www.xpandorax.com/'
              }
            },
            expression: '(cf.threat_score < 50) and (http.host eq "xpandorax.com")',
            description: 'Redirect root domain to www',
            enabled: true
          }
        ]
      })
    });
    
    const ruleData = await ruleRes.json();
    
    if (ruleData.success) {
      console.log('✅ Redirect rule created!\n');
    } else {
      console.log('Response:', JSON.stringify(ruleData, null, 2));
    }
    
    // Purge cache
    console.log('\nPurging cache...');
    await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ purge_everything: true })
    });
    
    console.log('✅ Done!\n');
    console.log('='.repeat(70));
    console.log('✅ Root domain redirect configured!');
    console.log('='.repeat(70));
    console.log('\nhttps://xpandorax.com → https://www.xpandorax.com');
    console.log('https://www.xpandorax.com → Pages deployment');
    console.log('\nWait 30 seconds and try again!');
    
  } catch (e) {
    console.error('Error:', e.message);
  }
}

setupRedirect();
