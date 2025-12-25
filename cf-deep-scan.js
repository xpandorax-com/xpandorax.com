const token = 'VNR3Vo-Lx4xin1qWs5V5-yUBctO2YWFzTO98UwEz';
const accountId = '2bb5dac6bb0b6db1c0b08b61f2ac0ef6';

const headers = {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
};

async function deepScan() {
  console.log('🔍 Deep Scanning Cloudflare Pages Configuration...\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Get all Pages projects
    console.log('\n1️⃣  PAGES PROJECTS:');
    console.log('-'.repeat(60));
    const projectsRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`, { headers });
    const projectsData = await projectsRes.json();
    
    if (!projectsData.success) {
      console.log('❌ API Error:', projectsData.errors);
      return;
    }
    
    console.log(`Found ${projectsData.result.length} project(s)`);
    
    const project = projectsData.result.find(p => p.name === 'xpandorax-com');
    if (!project) {
      console.log('❌ Project xpandorax-com not found!');
      console.log('Available projects:', projectsData.result.map(p => p.name).join(', '));
      return;
    }
    
    console.log('\nProject Details:');
    console.log('  Name:', project.name);
    console.log('  ID:', project.id);
    console.log('  Production Branch:', project.production_branch);
    console.log('  Subdomain:', project.subdomain);
    console.log('  Custom Domains:', project.domains && project.domains.length > 0 ? project.domains.join(', ') : 'None');
    console.log('  Latest Deploy Status:', project.latest_deployment?.status || 'No deployments');
    
    // 2. Get recent deployments
    console.log('\n2️⃣  RECENT DEPLOYMENTS:');
    console.log('-'.repeat(60));
    const deploymentsRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/xpandorax-com/deployments`, { headers });
    const deploymentsData = await deploymentsRes.json();
    
    if (!deploymentsData.success) {
      console.log('❌ Error fetching deployments:', deploymentsData.errors);
      return;
    }
    
    if (deploymentsData.result.length === 0) {
      console.log('No deployments found');
      return;
    }
    
    deploymentsData.result.slice(0, 3).forEach((dep, i) => {
      console.log(`\nDeployment #${i + 1}:`);
      console.log('  ID:', dep.id);
      console.log('  Status:', dep.status);
      console.log('  Created:', new Date(dep.created_on).toLocaleString());
      console.log('  URL:', dep.url);
      console.log('  Environment:', dep.environment);
      console.log('  Commit:', dep.commit_hash ? dep.commit_hash.substring(0, 8) : 'N/A');
      
      if (dep.build_config) {
        console.log('\n  Build Configuration:');
        console.log('    Build System:', dep.build_config.build_system);
        console.log('    Build Command:', dep.build_config.build_command);
        console.log('    Output Directory:', dep.build_config.destination_dir);
        console.log('    Root Directory:', dep.build_config.root_dir);
      }
      
      if (dep.stages && dep.stages.length > 0) {
        console.log('\n  Build Stages:');
        dep.stages.forEach(stage => {
          const status = stage.status === 'success' ? '✓' : '✗';
          console.log(`    ${status} ${stage.name}: ${stage.status}`);
          if (stage.error_message) {
            console.log(`      Error: ${stage.error_message}`);
          }
        });
      }
    });
    
    // 3. Check for recent errors by examining function behavior
    console.log('\n3️⃣  CHECKING FUNCTION EXECUTION:');
    console.log('-'.repeat(60));
    
    try {
      const testRes = await fetch('https://xpandorax.com/', { 
        method: 'GET',
        headers: {
          'User-Agent': 'CloudflarePagesDiagnostic/1.0'
        }
      });
      
      console.log('HTTP Status:', testRes.status);
      console.log('Content-Type:', testRes.headers.get('content-type'));
      console.log('CF-RAY:', testRes.headers.get('cf-ray'));
      console.log('CF-Cache-Status:', testRes.headers.get('cf-cache-status'));
      
      const content = await testRes.text();
      console.log('Response Length:', content.length, 'bytes');
      console.log('Response Preview:', content.substring(0, 200));
      
      if (content.includes('Hello world')) {
        console.log('\n⚠️  Found "Hello world" response - indicates function handler issue');
        console.log('Likely causes:');
        console.log('  1. functions/[[path]].ts not being executed');
        console.log('  2. Remix loader not returning proper data');
        console.log('  3. SSR handler not properly configured');
      }
      
    } catch (e) {
      console.log('❌ Error testing endpoint:', e.message);
    }
    
    // 4. Source configuration
    console.log('\n4️⃣  SOURCE CONFIGURATION:');
    console.log('-'.repeat(60));
    if (project.source) {
      console.log('Source Type:', project.source.type);
      console.log('Config:', JSON.stringify(project.source.config, null, 2));
    } else {
      console.log('No source configured');
    }
    
  } catch (e) {
    console.error('❌ Unexpected Error:', e.message);
  }
  
  console.log('\n' + '='.repeat(60));
}

deepScan();
