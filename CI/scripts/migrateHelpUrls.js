/**
 * Help URL Migration Script
 * 
 * This script helps migrate hardcoded help.mingdao.com URLs to use the centralized
 * helpUrls.js configuration.
 * 
 * Usage:
 * node CI/scripts/migrateHelpUrls.js [path]
 * 
 * If no path is provided, it will scan the entire src directory.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// URL mapping from paths to helpUrlConfig references
const urlPathMapping = {
  // Worksheet controls
  '/worksheet/controls': 'worksheet.controls',
  '/worksheet/title-field': 'worksheet.titleField',
  '/worksheet/control-select': 'worksheet.select',
  '/worksheet/control-relationship': 'worksheet.relationship',
  '/worksheet/control-region-city': 'worksheet.regionCity',
  '/worksheet/control-foreign': 'worksheet.foreign',
  '/worksheet/control-concat': 'worksheet.concat',
  '/worksheet/control-autonumber': 'worksheet.autoNumber',
  '/worksheet/control-formula': 'worksheet.formula',
  '/worksheet/control-subform': 'worksheet.subform',
  '/worksheet/control-rollup': 'worksheet.rollup',
  '/worksheet/control-cascading': 'worksheet.cascading',
  '/worksheet/control-ocr': 'worksheet.ocr',
  '/worksheet/control-members': 'worksheet.members',
  '/worksheet/control-o-roles': 'worksheet.oRoles',
  '/worksheet/controls#time': 'worksheet.time', 
  '/worksheet/field-filter': 'workflow.fieldFilter',
  
  // Workflow nodes
  '/workflow/node-loop': 'workflow.nodeLoop',
  '/workflow/node-branch': 'workflow.nodeBranch',
  '/workflow/node-fill-in': 'workflow.nodeFillIn',
  '/workflow/node-approve': 'workflow.nodeApprove',
  '/workflow/node-add-record': 'workflow.nodeAddRecord',
  '/workflow/node-update-record': 'workflow.nodeUpdateRecord',
  '/workflow/node-update-parameters': 'workflow.nodeUpdateParameters',
  '/workflow/node-delete-record': 'workflow.nodeDeleteRecord',
  
  // Integration
  '/integration/api': 'integration.api',
  '/integration/api#enter-parameters': 'integration.enterParameters',
  '/integration/api#api-request': 'integration.apiRequest',
  '/integration/api#output-parameters': 'integration.outputParameters',
  '/integration/data-integration': 'integration.dataIntegration',
  
  // Product features
  '/application/backup-restore': 'product.appBackupRestore',
  '/application/import-export': 'product.appImportExport',
  '/org/security': 'product.orgSecurity',
  '/worksheet/control-api-query': 'product.apiQueryControl',
  '/workflow/node-call-integrated-api': 'product.apiIntegrationNode',
  '/workflow/node-code-block': 'product.codeBlockNode',
};

// Regex to match help.mingdao.com URLs
const helpUrlRegex = /(["'])https?:\/\/help\.mingdao\.com(\/[^'"]+)?(["'])/g;

// Function to analyze a file for help URLs
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(helpUrlRegex);
    
    if (!matches) {
      return null;
    }
    
    const results = {
      file: filePath,
      matches: matches.map(match => {
        // Extract the path part from the URL
        const urlPath = match.match(/https?:\/\/help\.mingdao\.com(\/[^'"]+)/);
        const path = urlPath ? urlPath[1] : '/';
        
        // Find the mapping for this path
        const mappingKey = Object.keys(urlPathMapping).find(key => path === key || path.startsWith(key));
        const mapping = mappingKey ? urlPathMapping[mappingKey] : null;
        
        return {
          matchedUrl: match,
          path,
          suggestedMapping: mapping,
          replacement: mapping ? 
            `getHelpUrl('${mapping.split('.')[0]}', '${mapping.split('.')[1]}')` : 
            null
        };
      })
    };
    
    return results;
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return null;
  }
}

// Function to scan a directory recursively
function scanDirectory(dir) {
  let results = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      // Skip node_modules and .git
      if (item === 'node_modules' || item === '.git') {
        continue;
      }
      
      // Recurse into subdirectories
      results = results.concat(scanDirectory(itemPath));
    } else if (stats.isFile()) {
      // Only process JS and JSX files
      if (itemPath.endsWith('.js') || itemPath.endsWith('.jsx')) {
        const fileResult = analyzeFile(itemPath);
        if (fileResult) {
          results.push(fileResult);
        }
      }
    }
  }
  
  return results;
}

// Function to search for files using grep
function grepSearch() {
  try {
    const output = execSync('grep -r "help\\.mingdao\\.com" --include="*.js" --include="*.jsx" src').toString();
    const lines = output.split('\n').filter(Boolean);
    
    const files = new Set();
    for (const line of lines) {
      const filePath = line.split(':')[0];
      files.add(filePath);
    }
    
    let results = [];
    for (const file of files) {
      const fileResult = analyzeFile(file);
      if (fileResult) {
        results.push(fileResult);
      }
    }
    
    return results;
  } catch (err) {
    console.error('Error running grep search:', err);
    return [];
  }
}

// Function to generate a migration guide
function generateMigrationGuide(results) {
  let output = '# Help URL Migration Guide\n\n';
  output += 'This guide shows how to replace hardcoded help.mingdao.com URLs with the centralized helpUrls.js configuration.\n\n';
  
  output += '## Step 1: Import the helper functions\n\n';
  output += '```javascript\n';
  output += '// Import the helper functions at the top of your file\n';
  output += 'import { getHelpUrl } from \'src/common/helpUrls\';\n';
  output += '```\n\n';
  
  output += '## Step 2: Replace hardcoded URLs\n\n';
  output += 'Replace hardcoded URLs like this:\n\n';
  
  output += '```javascript\n';
  output += '// Before:\n';
  output += 'href="https://help.mingdao.com/worksheet/control-select"\n\n';
  output += '// After:\n';
  output += 'href={getHelpUrl(\'worksheet\', \'select\')}\n';
  output += '```\n\n';
  
  output += '## Files that need updating\n\n';
  
  for (const result of results) {
    output += `### ${result.file}\n\n`;
    
    for (const match of result.matches) {
      output += '```javascript\n';
      output += `// Original: ${match.matchedUrl}\n`;
      
      if (match.suggestedMapping) {
        const [section, topic] = match.suggestedMapping.split('.');
        output += `// Replace with: getHelpUrl('${section}', '${topic}')\n`;
      } else {
        output += `// No mapping found for path: ${match.path}\n`;
        output += `// Add this path to helpUrls.js and then use getHelpUrl()\n`;
      }
      
      output += '```\n\n';
    }
  }
  
  return output;
}

// Main function
function main() {
  const targetPath = process.argv[2] || 'src';
  console.log(`Scanning ${targetPath} for hardcoded help.mingdao.com URLs...`);
  
  let results;
  if (targetPath === 'src') {
    // Use grep for faster searching
    results = grepSearch();
  } else {
    // Recursively scan the specified directory
    results = scanDirectory(targetPath);
  }
  
  console.log(`Found ${results.length} files with hardcoded help.mingdao.com URLs.`);
  
  // Generate and write the migration guide
  const guide = generateMigrationGuide(results);
  fs.writeFileSync('helpUrlMigrationGuide.md', guide);
  
  console.log('Migration guide generated: helpUrlMigrationGuide.md');
}

main();