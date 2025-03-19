# Help URL Migration Guide

This guide shows how to replace hardcoded help.mingdao.com URLs with the centralized helpUrls.js configuration.

## Step 1: Import the helper functions

```javascript
// Import the helper functions at the top of your file
import { getHelpUrl } from 'src/common/helpUrls';
```

## Step 2: Replace hardcoded URLs

Replace hardcoded URLs like this:

```javascript
// Before:
href="https://help.mingdao.com/worksheet/control-select"

// After:
href={getHelpUrl('worksheet', 'select')}
```

## Files that need updating

### src/pages/worksheet/common/ViewConfig/components/StructureSet.jsx

```javascript
// Original: "https://help.mingdao.com/view/org/"
// No mapping found for path: /view/org/
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/worksheet/common/ViewConfig/components/urlParams/index.jsx

```javascript
// Original: "https://help.mingdao.com/view/link-parameter"
// No mapping found for path: /view/link-parameter
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/worksheet/common/ViewConfig/components/DebugConfig/index.jsx

```javascript
// Original: "https://help.mingdao.com/extensions/developer/view"
// No mapping found for path: /extensions/developer/view
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/worksheet/common/ViewConfig/components/SortConditions.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/batch-refresh"
// No mapping found for path: /worksheet/batch-refresh
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/worksheet/common/WorksheetBody/ImportDataFromExcel/ImportExcel/index.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/import-Excel-data"
// No mapping found for path: /worksheet/import-Excel-data
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/worksheet/common/RefreshRecordDialog/RefreshRecordDialog.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/batch-refresh"
// No mapping found for path: /worksheet/batch-refresh
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/worksheet/components/ImportFileToChildTable/PreviewData.jsx

```javascript
// Original: "https://help.mingdao.com"
// No mapping found for path: /
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/worksheet/components/DialogImportExcelCreate/DialogCreateApp/index.js

```javascript
// Original: "https://help.mingdao.com/worksheet/import-excel-create"
// No mapping found for path: /worksheet/import-excel-create
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/worksheet/components/DialogImportExcelCreate/SetImportExcelCreateWorksheetOrApp/index.js

```javascript
// Original: "https://help.mingdao.com/worksheet/import-excel-create"
// No mapping found for path: /worksheet/import-excel-create
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/AppSettings/components/AppGlobalVariable/index.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/node-update-global-variables"
// No mapping found for path: /workflow/node-update-global-variables
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/AppSettings/components/ImportUpgrade/index.js

```javascript
// Original: "https://help.mingdao.com/application/upgrade"
// No mapping found for path: /application/upgrade
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/AppSettings/components/ImportUpgrade/components/UpgradeProcess/index.js

```javascript
// Original: "https://help.mingdao.com/application/upgrade"
// No mapping found for path: /application/upgrade
// Add this path to helpUrls.js and then use getHelpUrl()
```

```javascript
// Original: "https://help.mingdao.com/application/upgrade"
// No mapping found for path: /application/upgrade
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/AppSettings/components/AllOptionList/index.js

```javascript
// Original: "https://help.mingdao.com/worksheet/option-set"
// No mapping found for path: /worksheet/option-set
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/AppSettings/components/Aggregation/components/Info.jsx

```javascript
// Original: "https://help.mingdao.com/application/aggregation"
// No mapping found for path: /application/aggregation
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/AppSettings/components/Aggregation/index.jsx

```javascript
// Original: "https://help.mingdao.com/application/aggregation"
// No mapping found for path: /application/aggregation
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/FormSet/containers/Print.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/print-template"
// No mapping found for path: /worksheet/print-template
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/FormSet/containers/FormIndexSetting.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/index-acceleration"
// No mapping found for path: /worksheet/index-acceleration
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/FormSet/components/AliasDialog.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/field-property/#syestem-field-alias"
// No mapping found for path: /worksheet/field-property/#syestem-field-alias
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/FormSet/components/columnRules/ColumnRulesCon.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/business-rule"
// No mapping found for path: /worksheet/business-rule
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/workflow/WorkflowList/components/CreateWorkflow/index.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/introduction"
// No mapping found for path: /workflow/introduction
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/workflow/WorkflowList/AppWorkflowList.jsx

```javascript
// Original: 'https://help.mingdao.com/workflow/pbp'
// No mapping found for path: /workflow/pbp
// Add this path to helpUrls.js and then use getHelpUrl()
```

```javascript
// Original: 'https://help.mingdao.com/workflow/create'
// No mapping found for path: /workflow/create
// Add this path to helpUrls.js and then use getHelpUrl()
```

```javascript
// Original: "https://help.mingdao.com/workflow/create"
// No mapping found for path: /workflow/create
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/workflow/WorkflowSettings/Detail/JSONParse/index.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/node-json-parsing"
// No mapping found for path: /workflow/node-json-parsing
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/workflow/WorkflowSettings/Detail/Message/index.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/sms-failure"
// No mapping found for path: /workflow/sms-failure
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/workflow/WorkflowSettings/Detail/Write/index.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/node-approve#field"
// Replace with: getHelpUrl('workflow', 'nodeApprove')
```

### src/pages/workflow/WorkflowSettings/Detail/AIGC/index.jsx

```javascript
// Original: "https://help.mingdao.com/purchase/billing-items"
// No mapping found for path: /purchase/billing-items
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/workflow/WorkflowSettings/Detail/Approval/index.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/node-approve#field"
// Replace with: getHelpUrl('workflow', 'nodeApprove')
```

### src/pages/workflow/WorkflowSettings/Detail/CC/index.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/node-cc-send-internal-notification"
// No mapping found for path: /workflow/node-cc-send-internal-notification
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/workflow/WorkflowSettings/Detail/Branch/index.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/field-filter"
// Replace with: getHelpUrl('workflow', 'fieldFilter')
```

### src/pages/workflow/WorkflowSettings/EditFlow/components/CreateNodeDialog.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/introduction"
// No mapping found for path: /workflow/introduction
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/workflow/WorkflowSettings/History/components/SerialProcessDialog.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/configuration#operation-mode"
// No mapping found for path: /workflow/configuration#operation-mode
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/integration/components/ConnectParam.jsx

```javascript
// Original: "https://help.mingdao.com/integration/api#connection-parameters"
// Replace with: getHelpUrl('integration', 'api')
```

### src/pages/integration/components/ConnectAuth.jsx

```javascript
// Original: 'https://help.mingdao.com/integration/api#basic-auth'
// Replace with: getHelpUrl('integration', 'api')
```

```javascript
// Original: 'https://help.mingdao.com/integration/api#oauth'
// Replace with: getHelpUrl('integration', 'api')
```

### src/pages/integration/components/ConnectItem.jsx

```javascript
// Original: 'https://help.mingdao.com/integration/api#enter-parameters'
// Replace with: getHelpUrl('integration', 'api')
```

### src/pages/integration/dataIntegration/components/FieldsMappingList/index.jsx

```javascript
// Original: "https://help.mingdao.com/integration/data-integration"
// Replace with: getHelpUrl('integration', 'dataIntegration')
```

```javascript
// Original: "https://help.mingdao.com/integration/data-integration"
// Replace with: getHelpUrl('integration', 'dataIntegration')
```

```javascript
// Original: "https://help.mingdao.com/integration/data-integration#field-sync-rule"
// Replace with: getHelpUrl('integration', 'dataIntegration')
```

### src/pages/integration/dataIntegration/source/index.jsx

```javascript
// Original: "https://help.mingdao.com/integration/data-integration"
// Replace with: getHelpUrl('integration', 'dataIntegration')
```

### src/pages/integration/dataIntegration/dataMirror/index.jsx

```javascript
// Original: "https://help.mingdao.com/integration/data-integration"
// Replace with: getHelpUrl('integration', 'dataIntegration')
```

### src/pages/integration/dataIntegration/connector/index.jsx

```javascript
// Original: "https://help.mingdao.com/integration/data-integration"
// Replace with: getHelpUrl('integration', 'dataIntegration')
```

### src/pages/integration/apiIntegration/ConnectWrap/content/ConnectSet.jsx

```javascript
// Original: 'https://help.mingdao.com/integration/api#enter-parameters'
// Replace with: getHelpUrl('integration', 'api')
```

### src/pages/integration/apiIntegration/ConnectWrap/content/Upgrade/index.jsx

```javascript
// Original: "https://help.mingdao.com/application/upgrade"
// No mapping found for path: /application/upgrade
// Add this path to helpUrls.js and then use getHelpUrl()
```

```javascript
// Original: "https://help.mingdao.com/application/upgrade"
// No mapping found for path: /application/upgrade
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/integration/apiIntegration/ConnectList/ImportDialog.jsx

```javascript
// Original: "https://help.mingdao.com/application/import-export"
// Replace with: getHelpUrl('product', 'appImportExport')
```

### src/pages/integration/apiIntegration/ConnectList/index.jsx

```javascript
// Original: "https://help.mingdao.com/integration/api#connection-certification"
// Replace with: getHelpUrl('integration', 'api')
```

### src/pages/publicWorksheetConfig/common/PayConfig/index.js

```javascript
// Original: "https://help.mingdao.com/org/payment"
// No mapping found for path: /org/payment
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/AuthService/config.js

```javascript
// Original: 'https://help.mingdao.com/faq/sms-emali-service-failure'
// No mapping found for path: /faq/sms-emali-service-failure
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/AuthService/register/container/add.jsx

```javascript
// Original: "https://help.mingdao.com/org/id"
// No mapping found for path: /org/id
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/pages/plugin/config.js

```javascript
// Original: 'https://help.mingdao.com/extensions/developer/view'
// No mapping found for path: /extensions/developer/view
// Add this path to helpUrls.js and then use getHelpUrl()
```

```javascript
// Original: 'https://help.mingdao.com/extensions/developer/view'
// No mapping found for path: /extensions/developer/view
// Add this path to helpUrls.js and then use getHelpUrl()
```

### src/ming-ui/components/Support.jsx

```javascript
// Original: 'https://help.mingdao.com'
// No mapping found for path: /
// Add this path to helpUrls.js and then use getHelpUrl()
```

```javascript
// Original: 'https://help.mingdao.com'
// No mapping found for path: /
// Add this path to helpUrls.js and then use getHelpUrl()
```

