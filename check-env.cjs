const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ACCOUNT_ID = '2bb5dac6bb0b6db1c0b08b61f2ac0ef6';
const PROJECT_NAME = 'xpandorax';

let apiToken;
try {
  const wranglerConfigPath = path.join(os.homedir(), '.wrangler', 'config', 'default.toml');
  const configContent = fs.readFileSync(wranglerConfigPath, 'utf8');
  const match = configContent.match(/oauth_token\s*=\s*"([^"]+)"/);
  if (match) apiToken = match[1];
} catch (e) {
  console.error('Could not read wrangler config');
}

if (!apiToken) {
  console.error('No API token found');
  process.exit(1);
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    };
    if (body) options.headers['Content-Length'] = Buffer.byteLength(body);

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== Checking Cloudflare Pages Environment Variables ===\n');
  
  const project = await makeRequest('GET', `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}`);
  
  if (!project.success) {
    console.error('Failed to get project:', project.errors);
    return;
  }

  const envVars = project.result?.deployment_configs?.production?.env_vars || {};
  
  console.log('Current SANITY_PROJECT_ID:', envVars.SANITY_PROJECT_ID?.type, '=', envVars.SANITY_PROJECT_ID?.value || '(empty/secret)');
  console.log('Current SANITY_DATASET:', envVars.SANITY_DATASET?.type, '=', envVars.SANITY_DATASET?.value || '(empty/secret)');

  // Check if values need updating
  const needsUpdate = 
    envVars.SANITY_PROJECT_ID?.value !== 'p9gceue4' ||
    envVars.SANITY_DATASET?.value !== 'production';

  if (needsUpdate) {
    console.log('\n=== Updating environment variables ===\n');
    
    const deploymentConfigs = project.result.deployment_configs || {};
    if (!deploymentConfigs.production) deploymentConfigs.production = {};
    if (!deploymentConfigs.production.env_vars) deploymentConfigs.production.env_vars = {};

    deploymentConfigs.production.env_vars.SANITY_PROJECT_ID = {
      type: "plain_text",
      value: "p9gceue4"
    };
    deploymentConfigs.production.env_vars.SANITY_DATASET = {
      type: "plain_text",
      value: "production"
    };

    const updateResult = await makeRequest(
      'PATCH',
      `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}`,
      JSON.stringify({ deployment_configs: deploymentConfigs })
    );

    if (updateResult.success) {
      const newVars = updateResult.result?.deployment_configs?.production?.env_vars || {};
      console.log('✅ Updated successfully!');
      console.log('New SANITY_PROJECT_ID:', newVars.SANITY_PROJECT_ID?.type, '=', newVars.SANITY_PROJECT_ID?.value);
      console.log('New SANITY_DATASET:', newVars.SANITY_DATASET?.type, '=', newVars.SANITY_DATASET?.value);
    } else {
      console.error('❌ Update failed:', updateResult.errors);
    }
  } else {
    console.log('\n✅ Environment variables are already correct');
  }
}

main().catch(console.error);
