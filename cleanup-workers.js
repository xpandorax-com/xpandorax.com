const token = 'VNR3Vo-Lx4xin1qWs5V5-yUBctO2YWFzTO98UwEz';
const accountId = '2bb5dac6bb0b6db1c0b08b61f2ac0ef6';
const zoneId = '7a80fd2ecf89fe08f0dc6b9ddf1ce2cc';

const headers = {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
};

async function cleanupWorkers() {
  console.log('🔍 Checking and cleaning Cloudflare Workers...\n');
  
  try {
    // Check Workers routes  
    console.log('Fetching Worker routes...');
    const routesRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/workers/routes`, { headers });
    const routesData = await routesRes.json();
    
    if (routesData.success && routesData.result && routesData.result.length > 0) {
      console.log(`Found ${routesData.result.length} Worker route(s):\n`);
      
      for (const route of routesData.result) {
        console.log(`Pattern: ${route.pattern}`);
        console.log(`Script: ${route.script}`);
        console.log(`ID: ${route.id}\n`);
        
        // Delete the route
        console.log(`Deleting route...`);
        const deleteRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/workers/routes/${route.id}`, {
          method: 'DELETE',
          headers
        });
        
        if (deleteRes.ok) {
          console.log('✅ Route deleted\n');
        } else {
          console.log('Error deleting route\n');
        }
      }
    } else {
      console.log('No Worker routes found or API error\n');
    }
    
    // Check for Workers scripts
    console.log('Checking for Worker scripts...');
    const scriptsRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts`, { headers });
    const scriptsData = await scriptsRes.json();
    
    if (scriptsData.success) {
      console.log(`Found ${scriptsData.result.length} script(s)`);
      scriptsData.result.forEach(s => {
        console.log(`  - ${s.id}`);
      });
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Cleanup complete!');
    console.log('='.repeat(70));
    
  } catch (e) {
    console.error('Error:', e.message);
  }
}

cleanupWorkers();
