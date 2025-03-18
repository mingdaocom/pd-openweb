/**
 * Centralized help URL configuration
 * This file contains all the help URLs used throughout the application.
 * Centralizing URLs here makes it easy to change domain or URL structure in the future.
 */

export const helpUrlConfig = {
  // Base URL that can be changed if the domain changes
  baseUrl: 'https://help.mingdao.com',
  
  // Main sections
  common: {
    mainHelp: '/',
  },
  
  // Product versions related help links
  product: {
    appBackupRestore: '/application/backup-restore',
    appImportExport: '/application/import-export',
    apiIntegration: '/integration/api',
    apiIntegrationNode: '/workflow/node-call-integrated-api',
    apiQueryControl: '/worksheet/control-api-query',
    orgSecurity: '/org/security',
    codeBlockNode: '/workflow/node-code-block',
    dingtalkIntegration: '/dingtalk/integration-guide',
    externalPortal: '/portal/introduction',
    feishuIntegration: '/feishu/integration-guide',
    printRecordNode: '/workflow/node-print-record',
    interfacePush: '/workflow/node-interface-push',
    recycleApplication: '/application/recycle',
    usageAnalysis: '/application/usage-analysis',
    wecomIntegration: '/wecom/integration-note',
    wordPrintTemplate: '/worksheet/word-print-template',
    apiIntroduction: '/api/introduction',
    apiProxy: '/org/security#apiproxy',
    pbpWorkflow: '/workflow/pbp',
    faqSearch: '/faq/sse',
    dataIntegration: '/integration/data-integration',
    extendedInfo: '/role/extended-info',
    dataEncryption: '/worksheet/data-encryption',
    exclusiveComputing: '/application/exclusive-computing-power',
    applicationLog: '/application/log',
    payment: '/org/payment',
  },
  
  // Workflow specific help links
  workflow: {
    triggerByWorksheet: '/workflow/trigger-by-worksheet',
    triggerByScheduled: '/workflow/trigger-by-scheduled',
    triggerByDateField: '/workflow/trigger-by-date-field',
    triggerByWebhook: '/workflow/trigger-by-webhook',
    nodeLoop: '/workflow/node-loop',
    nodeBranch: '/workflow/node-branch',
    nodeFillIn: '/workflow/node-fill-in',
    nodeApprove: '/workflow/node-approve',
    nodeCcNotification: '/workflow/node-cc-send-internal-notification',
    nodeAddRecord: '/workflow/node-add-record',
    nodeNewTask: '/workflow/node-new-task',
    nodeUpdateRecord: '/workflow/node-update-record',
    nodeUpdateParameters: '/workflow/node-update-parameters',
    nodeDeleteRecord: '/workflow/node-delete-record',
    nodeGetSingleData: '/workflow/node-get-single-data',
    nodeSendApiRequest: '/workflow/node-send-api-request',
    nodeCalculation: '/workflow/node-calculation',
    nodeSendSms: '/workflow/node-send-sms',
    nodeSendEmail: '/workflow/node-send-email',
    nodeDelay: '/workflow/node-delay',
    nodeGetMultipleData: '/workflow/node-get-multiple-data',
    nodeGetLink: '/workflow/node-get-link',
    nodeSubflow: '/workflow/node-subflow',
    nodeVoiceBroadcast: '/workflow/node-voice-broadcast',
    nodePrintRecord: '/workflow/node-print-record',
    nodeWechatTemplate: '/node-send-wechat-official-account-template-message',
    nodeCallPbp: '/workflow/node-call-pbp',
    nodeJsonParsing: '/workflow/node-json-parsing',
    nodeInitiateApproval: '/workflow/node-initiate-approval-flow',
    nodeGetSnapshot: '/workflow/node-get-snapshot',
    nodeAiText: '/workflow/node-AI-text-generation',
    nodeAiDataObjects: '/workflow/node-AI-generates-data-objects',
    nodeGetSingleDataFromUser: '/workflow/node-get-single-data-from-user',
    nodeGetMultipleDataFromUser: '/workflow/node-get-multiple-data-from-user',
    queueHelp: '/workflow/in-queue',
  },
  
  // External resources (full URLs)
  resources: {
    videoLearning: 'https://learn.mingdao.net/',
    communityForum: 'https://bbs.mingdao.net/',
    partnerList: 'https://www.mingdao.com/partnerlist',
    blog: 'https://blog.mingdao.com',
    activityCenter: 'https://www.mingdao.com/activitycenter',
    productUpdates: 'https://blog.mingdao.com/category/product/product-update',
    pricing: 'https://www.mingdao.com/price',
  }
};

/**
 * Maps the old VersionProductType constants to help URLs
 * This helps maintain backward compatibility with existing code
 */
export const versionProductTypeToHelpUrl = {
  1: 'product/appBackupRestore',
  2: 'product/appImportExport',
  3: 'product/apiIntegration',
  4: 'product/apiIntegrationNode',
  5: 'product/apiQueryControl',
  6: 'product/orgSecurity',
  8: 'product/codeBlockNode',
  10: 'product/dingtalkIntegration',
  11: 'product/externalPortal',
  12: 'product/feishuIntegration',
  13: 'product/printRecordNode',
  14: 'product/interfacePush',
  16: 'product/recycleApplication',
  17: 'product/usageAnalysis',
  19: 'product/wecomIntegration',
  20: 'product/wordPrintTemplate',
  21: 'product/apiIntroduction',
  22: 'product/apiProxy',
  23: 'product/pbpWorkflow',
  25: 'product/faqSearch',
  26: 'product/dataIntegration',
  27: 'product/extendedInfo',
  29: 'product/dataEncryption',
  30: 'product/exclusiveComputing',
  31: 'product/applicationLog',
  40: 'product/payment',
};

/**
 * Maps the workflow node types to help URLs
 * This helps maintain backward compatibility with existing code
 */
export const workflowNodeTypeToHelpUrl = {
  // Trigger types
  '0-1': 'workflow/triggerByWorksheet',
  '0-5': 'workflow/triggerByScheduled',
  '0-6': 'workflow/triggerByDateField',
  '0-7': 'workflow/triggerByWebhook',
  '0-45': 'workflow/nodeLoop',
  // Regular node types
  1: 'workflow/nodeBranch',
  3: 'workflow/nodeFillIn',
  4: 'workflow/nodeApprove',
  5: 'workflow/nodeCcNotification',
  '6-1-1': 'workflow/nodeAddRecord',
  '6-1-2': 'workflow/nodeNewTask',
  '6-2': 'workflow/nodeUpdateRecord',
  '6-2-102': 'workflow/nodeUpdateParameters',
  '6-3': 'workflow/nodeDeleteRecord',
  '6-20': 'workflow/nodeGetSingleData',
  '6-21': 'workflow/nodeAddRecord',
  '7-406': 'workflow/nodeGetSingleData',
  '7-407': 'workflow/nodeGetSingleData',
  8: 'workflow/nodeSendApiRequest',
  9: 'workflow/nodeCalculation',
  10: 'workflow/nodeSendSms',
  11: 'workflow/nodeSendEmail',
  12: 'workflow/nodeDelay',
  13: 'workflow/nodeGetMultipleData',
  14: 'workflow/nodeCodeBlock',
  15: 'workflow/nodeGetLink',
  16: 'workflow/nodeSubflow',
  17: 'workflow/nodeInterfacePush',
  '17-8': 'workflow/nodeVoiceBroadcast',
  18: 'workflow/nodePrintRecord',
  19: 'workflow/nodeWechatTemplate',
  20: 'workflow/nodeCallPbp',
  21: 'workflow/nodeJsonParsing',
  25: 'workflow/nodeCallIntegratedApi',
  26: 'workflow/nodeInitiateApproval',
  27: 'workflow/nodeCcNotification',
  28: 'workflow/nodeGetSnapshot',
  29: 'workflow/nodeLoop',
  '31-531': 'workflow/nodeAiText',
  '31-532': 'workflow/nodeAiDataObjects',
  1000: 'workflow/nodeGetSingleDataFromUser',
  1001: 'workflow/nodeGetMultipleDataFromUser',
  queue: 'workflow/queueHelp',
};

/**
 * Gets the full help URL for a specific help topic
 * @param {string} section - The section in the help config (e.g., 'workflow', 'product')
 * @param {string} topic - The specific topic key
 * @param {string} anchor - Optional anchor tag for the URL
 * @returns {string} The complete help URL
 */
export function getHelpUrl(section, topic, anchor) {
  try {
    // External resources have full URLs
    if (section === 'resources') {
      return helpUrlConfig[section][topic] || helpUrlConfig.baseUrl;
    }
    
    // For internal help pages, combine with the base URL
    const path = helpUrlConfig[section][topic] || '/';
    const anchorTag = anchor ? `#${anchor}` : '';
    return `${helpUrlConfig.baseUrl}${path}${anchorTag}`;
  } catch (e) {
    console.error('Error getting help URL:', e);
    return helpUrlConfig.baseUrl;
  }
}

/**
 * Gets a help URL from a version product type ID
 * @param {number} typeId - The version product type ID
 * @returns {string} The complete help URL
 */
export function getHelpUrlFromVersionType(typeId) {
  const mappedPath = versionProductTypeToHelpUrl[typeId];
  if (!mappedPath) return helpUrlConfig.baseUrl;
  
  const [section, topic] = mappedPath.split('/');
  return getHelpUrl(section, topic);
}

/**
 * Gets a help URL from a workflow node type
 * @param {string|number} nodeType - The workflow node type
 * @returns {string} The complete help URL
 */
export function getHelpUrlFromNodeType(nodeType) {
  const mappedPath = workflowNodeTypeToHelpUrl[nodeType];
  if (!mappedPath) return helpUrlConfig.baseUrl;
  
  const [section, topic] = mappedPath.split('/');
  return getHelpUrl(section, topic);
}