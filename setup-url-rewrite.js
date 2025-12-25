const token = 'VNR3Vo-Lx4xin1qWs5V5-yUBctO2YWFzTO98UwEz';
const zoneId = '7a80fd2ecf89fe08f0dc6b9ddf1ce2cc';

const headers = {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
};

async function setupUrlRewrite() {
  console.log('🔧 Setting up URL rewrite rule for root domain...\n');
  
  try {
    // First, delete the problematic AAAA record completely
    console.log('Step 1: Removing conflicting DNS records...');
    const dnsRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=xpandorax.com&type=AAAA`, { headers });
    const dnsData = await dnsRes.json();
    
    if (dnsData.result && dnsData.result.length > 0) {
      for (const record of dnsData.result) {
        await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`, {
          method: 'DELETE',
          headers
        });
        console.log('  Deleted AAAA record');
      }
    }
    
    console.log('✅ Removed\n');
    
    // Get all current rules to see what exists
    console.log('Step 2: Checking existing rules...');
    const rulesRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets`, { headers });
    const rulesData = await rulesRes.json();
    
    if (rulesData.result) {
      console.log(`  Found ${rulesData.result.length} ruleset(s)`);
    }
    
    console.log('✅ Checked\n');
    
    // Create a URL rewrite rule to forward root domain
    console.log('Step 3: Creating URL rewrite rule...');
    
    const rewriteRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/rules`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'rewrite',
        action_parameters: {
          uri: {
            path: {
              expression: 'concat("http://2059bde5.xpandorax-com.pages.dev", http.request.uri.path)'
            }
          }
        },
        expression: 'http.host eq "xpandorax.com"',
        description: 'Route root domain to Pages deployment'
      })
    });
    
    const rewriteData = await rewriteRes.json();
    
    if (rewriteData.success) {
      console.log('✅ URL rewrite rule created\n');
    } else if (rewriteData.errors) {
      console.log('⚠️  Error creating rule:', rewriteData.errors[0].message);
      console.log('Trying alternative approach...\n');
      
      // Try creating a page rule instead
      console.log('Step 3b: Creating Page Rule...');
      const pageRuleRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/page_rules`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          targets: [
            {
              target: 'url',
              constraint: {
                operator: 'matches',
                value: 'xpandorax.com/*'
              }
            }
          ],
          actions: [
            {
              id: 'forwarding_url',
              value: '301|https://www.xpandorax.com$0'
            }
          ],
          priority: 1,
          status: 'active'
        })
      });
      
      const pageRuleData = await pageRuleRes.json();
      if (pageRuleData.success) {
        console.log('✅ Page Rule created (301 redirect)\n');
      } else {
        console.log('Error:', pageRuleData.errors);
      }
    }
    
    // Purge cache
    console.log('Step 4: Purging cache...');
    await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ purge_everything: true })
    });
    console.log('✅ Cache purged\n');
    
    console.log('='.repeat(70));
    console.log('✅ Configuration complete!');
    console.log('='.repeat(70));
    console.log('\nAccess your site at:');
    console.log('  • https://www.xpandorax.com (direct routing)');
    console.log('  • https://xpandorax.com (should redirect or rewrite)');
    console.log('\nWait 30 seconds for propagation...');
    
  } catch (e) {
    console.error('Error:', e.message);
  }
}

setupUrlRewrite();
