const token = 'VNR3Vo-Lx4xin1qWs5V5-yUBctO2YWFzTO98UwEz';
const zoneId = '7a80fd2ecf89fe08f0dc6b9ddf1ce2cc';
const pagesDomain = '2059bde5.xpandorax-com.pages.dev';

const headers = {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
};

async function fixRootDomain() {
  console.log('🔧 Fixing root domain routing...\n');
  
  try {
    // First, purge all cache
    console.log('Step 1: Purging Cloudflare cache...');
    const purgeRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ purge_everything: true })
    });
    
    if (purgeRes.ok) {
      console.log('✅ Cache purged\n');
    }
    
    // Get all DNS records at root
    console.log('Step 2: Checking root domain records...');
    const dnsRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=xpandorax.com`, { headers });
    const dnsData = await dnsRes.json();
    
    if (!dnsData.success) {
      console.log('Error:', dnsData.errors);
      return;
    }
    
    // Find and delete non-essential records
    const rootRecords = dnsData.result.filter(r => r.name === 'xpandorax.com');
    console.log(`Found ${rootRecords.length} records at root`);
    
    for (const record of rootRecords) {
      if (record.type === 'AAAA' || record.type === 'A') {
        console.log(`  Deleting ${record.type} record...`);
        await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`, {
          method: 'DELETE',
          headers
        });
      }
    }
    
    console.log('✅ Old records cleaned\n');
    
    // Wait a moment
    await new Promise(r => setTimeout(r, 500));
    
    // Create CNAME at root
    console.log('Step 3: Creating CNAME at root domain...');
    const createRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'CNAME',
        name: '@',
        content: pagesDomain,
        ttl: 1,
        proxied: true
      })
    });
    
    const createData = await createRes.json();
    
    if (createData.success) {
      console.log('✅ Root CNAME record created!\n');
    } else {
      console.log('API Response:', JSON.stringify(createData.errors, null, 2), '\n');
      
      if (createData.errors && createData.errors[0].message.includes('Worker')) {
        console.log('⚠️  Worker managed record detected');
        console.log('This is likely a Cloudflare Worker or Page Rules conflict');
        console.log('Action needed: Check Cloudflare dashboard for Page Rules or Worker routes\n');
      }
    }
    
    // Final cache purge
    console.log('Step 4: Final cache purge...');
    await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ files: ['https://xpandorax.com/', 'https://www.xpandorax.com/'] })
    });
    
    console.log('✅ Cache purged\n');
    
    // Verify
    console.log('Step 5: Verifying DNS configuration...');
    const verifyRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=xpandorax.com`, { headers });
    const verifyData = await verifyRes.json();
    
    console.log('Current DNS records at root:');
    verifyData.result.filter(r => r.name === 'xpandorax.com').forEach(r => {
      console.log(`  ${r.type.padEnd(6)} -> ${r.content || 'N/A'}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Root domain fix applied!');
    console.log('='.repeat(70));
    console.log('Please wait 30-60 seconds for DNS propagation');
    console.log('Then try: https://xpandorax.com');
    
  } catch (e) {
    console.error('Error:', e.message);
  }
}

fixRootDomain();
