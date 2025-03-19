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
// Replace with: getHelpUrl('view', 'org')
```

### src/pages/worksheet/common/ViewConfig/components/urlParams/index.jsx

```javascript
// Original: "https://help.mingdao.com/view/link-parameter"
// Replace with: getHelpUrl('view', 'linkParameter')
```

### src/pages/worksheet/common/ViewConfig/components/DebugConfig/index.jsx

```javascript
// Original: "https://help.mingdao.com/extensions/developer/view"
// Replace with: getHelpUrl('extensions', 'developerView')
```

### src/pages/worksheet/common/ViewConfig/components/SortConditions.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/batch-refresh"
// Replace with: getHelpUrl('worksheet', 'batchRefresh')
```

### src/pages/worksheet/common/WorksheetBody/ImportDataFromExcel/ImportExcel/index.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/import-Excel-data"
// Replace with: getHelpUrl('worksheet', 'importExcelData')
```

### src/pages/worksheet/common/RefreshRecordDialog/RefreshRecordDialog.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/batch-refresh"
// Replace with: getHelpUrl('worksheet', 'batchRefresh')
```

### src/pages/worksheet/components/ImportFileToChildTable/PreviewData.jsx

```javascript
// Original: "https://help.mingdao.com"
// Replace with: getHelpUrl('common', 'mainHelp')
```

### src/pages/worksheet/components/DialogImportExcelCreate/DialogCreateApp/index.js

```javascript
// Original: "https://help.mingdao.com/worksheet/import-excel-create"
// Replace with: getHelpUrl('worksheet', 'importExcelCreate')
```

### src/pages/worksheet/components/DialogImportExcelCreate/SetImportExcelCreateWorksheetOrApp/index.js

```javascript
// Original: "https://help.mingdao.com/worksheet/import-excel-create"
// Replace with: getHelpUrl('worksheet', 'importExcelCreate')
```

### src/pages/AppSettings/components/AppGlobalVariable/index.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/node-update-global-variables"
// Replace with: getHelpUrl('workflow', 'updateGlobalVariables')
```

### src/pages/AppSettings/components/ImportUpgrade/index.js

```javascript
// Original: "https://help.mingdao.com/application/upgrade"
// Replace with: getHelpUrl('application', 'upgrade')
```

### src/pages/AppSettings/components/ImportUpgrade/components/UpgradeProcess/index.js

```javascript
// Original: "https://help.mingdao.com/application/upgrade"
// Replace with: getHelpUrl('application', 'upgrade')
```

```javascript
// Original: "https://help.mingdao.com/application/upgrade"
// Replace with: getHelpUrl('application', 'upgrade')
```

### src/pages/AppSettings/components/AllOptionList/index.js

```javascript
// Original: "https://help.mingdao.com/worksheet/option-set"
// Replace with: getHelpUrl('worksheet', 'optionSet')
```

### src/pages/AppSettings/components/Aggregation/components/Info.jsx

```javascript
// Original: "https://help.mingdao.com/application/aggregation"
// Replace with: getHelpUrl('application', 'aggregation')
```

### src/pages/AppSettings/components/Aggregation/index.jsx

```javascript
// Original: "https://help.mingdao.com/application/aggregation"
// Replace with: getHelpUrl('application', 'aggregation')
```

### src/pages/FormSet/containers/Print.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/print-template"
// Replace with: getHelpUrl('worksheet', 'printTemplate')
```

### src/pages/FormSet/containers/FormIndexSetting.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/index-acceleration"
// Replace with: getHelpUrl('worksheet', 'indexAcceleration')
```

### src/pages/FormSet/components/AliasDialog.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/field-property/#syestem-field-alias"
// Replace with: getHelpUrl('worksheet', 'fieldPropertyAlias')
```

### src/pages/FormSet/components/columnRules/ColumnRulesCon.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/business-rule"
// Replace with: getHelpUrl('worksheet', 'businessRule')
```

### src/pages/workflow/WorkflowList/components/CreateWorkflow/index.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/introduction"
// Replace with: getHelpUrl('workflow', 'introduction')
```

### src/pages/workflow/WorkflowList/AppWorkflowList.jsx

```javascript
// Original: 'https://help.mingdao.com/workflow/pbp'
// Replace with: getHelpUrl('workflow', 'pbp')
```

```javascript
// Original: 'https://help.mingdao.com/workflow/create'
// Replace with: getHelpUrl('workflow', 'create')
```

```javascript
// Original: "https://help.mingdao.com/workflow/create"
// Replace with: getHelpUrl('workflow', 'create')
```

### src/pages/workflow/WorkflowSettings/Detail/JSONParse/index.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/node-json-parsing"
// Replace with: getHelpUrl('workflow', 'nodeJsonParsing')
```

### src/pages/workflow/WorkflowSettings/Detail/Message/index.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/sms-failure"
// Replace with: getHelpUrl('workflow', 'smsFailure')
```

### src/pages/workflow/WorkflowSettings/Detail/Write/index.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/node-approve#field"
// Replace with: getHelpUrl('workflow', 'nodeApprove')
```

### src/pages/workflow/WorkflowSettings/Detail/AIGC/index.jsx

```javascript
// Original: "https://help.mingdao.com/purchase/billing-items"
// Replace with: getHelpUrl('purchase', 'billingItems')
```

### src/pages/workflow/WorkflowSettings/Detail/Approval/index.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/node-approve#field"
// Replace with: getHelpUrl('workflow', 'nodeApprove')
```

### src/pages/workflow/WorkflowSettings/Detail/CC/index.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/node-cc-send-internal-notification"
// Replace with: getHelpUrl('workflow', 'nodeCcSendInternalNotification')
```

### src/pages/workflow/WorkflowSettings/Detail/Branch/index.jsx

```javascript
// Original: "https://help.mingdao.com/worksheet/field-filter"
// Replace with: getHelpUrl('workflow', 'fieldFilter')
```

### src/pages/workflow/WorkflowSettings/EditFlow/components/CreateNodeDialog.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/introduction"
// Replace with: getHelpUrl('workflow', 'introduction')
```

### src/pages/workflow/WorkflowSettings/History/components/SerialProcessDialog.jsx

```javascript
// Original: "https://help.mingdao.com/workflow/configuration#operation-mode"
// Replace with: getHelpUrl('workflow', 'operationMode')
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
// Replace with: getHelpUrl('integration', 'enterParameters')
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
// Replace with: getHelpUrl('integration', 'enterParameters')
```

### src/pages/integration/apiIntegration/ConnectWrap/content/Upgrade/index.jsx

```javascript
// Original: "https://help.mingdao.com/application/upgrade"
// Replace with: getHelpUrl('application', 'upgrade')
```

```javascript
// Original: "https://help.mingdao.com/application/upgrade"
// Replace with: getHelpUrl('application', 'upgrade')
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
// Replace with: getHelpUrl('org', 'payment')
```

### src/pages/AuthService/config.js

```javascript
// Original: 'https://help.mingdao.com/faq/sms-emali-service-failure'
// Replace with: getHelpUrl('faq', 'smsEmaliServiceFailure')
```

### src/pages/AuthService/register/container/add.jsx

```javascript
// Original: "https://help.mingdao.com/org/id"
// Replace with: getHelpUrl('org', 'id')
```

### src/pages/plugin/config.js

```javascript
// Original: 'https://help.mingdao.com/extensions/developer/view'
// Replace with: getHelpUrl('extensions', 'developerView')
```

```javascript
// Original: 'https://help.mingdao.com/extensions/developer/view'
// Replace with: getHelpUrl('extensions', 'developerView')
```

### src/ming-ui/components/Support.jsx

```javascript
// Original: 'https://help.mingdao.com'
// Replace with: getHelpUrl('common', 'mainHelp')
```

```javascript
// Original: 'https://help.mingdao.com'
// Replace with: getHelpUrl('common', 'mainHelp')
```

