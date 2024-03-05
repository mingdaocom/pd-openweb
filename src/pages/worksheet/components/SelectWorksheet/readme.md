#### 工作表选择组件


| 参数名 | 说明 | 是否必须 |
|---|---|---|
| projectId | 网络 id | 是 |
| appId | 应用 id | 是 |
|  worksheetType | 工作表类型 | 否  |
| value | 选中的工作表 id | 否 |
| hint | 空提示 默认为 选择您管理的工作表 | 否 |
| currentWorksheetId | 当前表 id（用来显示（本表）标识） | 否 |
| onChange | 回掉：参数 appId: 应用 id ，worksheetId: 工作表 id| 是 |


```
import SelectWorksheet from 'worksheet/components/SelectWorksheet';

<SelectWorksheet
    projectId={config.global.projectId}
    appId={widget.data.appId}
    value={widget.data.dataSource}
    currentWorksheetId={config.global.sourceId}
    onChange={(appId, worksheetId) => {
        this.changeWorksheetValue(worksheetId);
    }}
/>
```
