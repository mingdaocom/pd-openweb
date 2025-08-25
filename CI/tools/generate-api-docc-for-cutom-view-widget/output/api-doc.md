# 明道云插件接口文档  

```本文档由代码自动生成。如果某些参数描述难以理解，建议在主站进行相应操作，并观察发送的请求内容以获得更清晰的理解。```  

# 工作表

## getViewPermission

获取视图权限

### 参数

args.worksheetId  {string}  工作表id  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  

```js
import { apis } from "mdye";

apis.worksheet.getViewPermission(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppExtendAttr

获取应用角色用户扩展属性

### 参数

args.appId  {string}  AppId  
args.customLink  {string}  客户自定义登录链接参数值  

```js
import { apis } from "mdye";

apis.worksheet.getAppExtendAttr(args)
  .then(res => {
    console.log(res);
  });
```
---

## getExtendAttrOptionalControl

获取工作表的扩展属性选项控件信息

### 参数

args.worksheetId  {string}  工作表Id  
args.isPortal  {boolean}    

```js
import { apis } from "mdye";

apis.worksheet.getExtendAttrOptionalControl(args)
  .then(res => {
    console.log(res);
  });
```
---

## saveAppExtendAttr

保存应用角色用户扩展属性

### 参数

args.appId  {string}  应用  
args.worksheetId  {string}  工作表Id  
args.userControlId  {string}  用户控件  
args.extendAttrs  {array}  扩展字段属性  
args.extendAndAttrs  {array}  扩展且字段属性  
args.status  {integer}  状态【9：关闭 1：正常】  

```js
import { apis } from "mdye";

apis.worksheet.saveAppExtendAttr(args)
  .then(res => {
    console.log(res);
  });
```
---

## copyWorksheet

复制表格

### 参数

args.worksheetId  {string}  工作表id  
args.name  {string}  名称  
args.projectId  {string}  网络id  
args.isCopyBtnName  {boolean}  是否复制按钮名称  
args.isCopyDesc  {boolean}  是否复制描述  
args.isCopyAdmin  {boolean}  是否复制管理员  
args.isCopyRows  {boolean}  是否复制行数据  
args.appId  {string}  应用id  
args.appSectionId  {string}  分组id  
args.relationControlIds  {array}  复制的关联控件ID  

```js
import { apis } from "mdye";

apis.worksheet.copyWorksheet(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateEntityName

修改表格行记录名

### 参数

args.worksheetId  {string}  工作表id  
args.entityName  {string}  记录名  
args.appID  {string}  应用Id  

```js
import { apis } from "mdye";

apis.worksheet.updateEntityName(args)
  .then(res => {
    console.log(res);
  });
```
---

## editDeveloperNotes

修改工作表开发者备注

### 参数

args.worksheetId  {string}  工作表id  
args.developerNotes  {string}  记录名  

```js
import { apis } from "mdye";

apis.worksheet.editDeveloperNotes(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateWorksheetAlias

更新 工作表别名

### 参数

args.appId  {string}  AppId  
args.worksheetId  {string}  工作表Id  
args.alias  {string}  别名  

```js
import { apis } from "mdye";

apis.worksheet.updateWorksheetAlias(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateWorksheetDec

修改表格描述

### 参数

args.worksheetId  {string}  工作表id  
args.dec  {string}  描述  
args.resume  {string}    

```js
import { apis } from "mdye";

apis.worksheet.updateWorksheetDec(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateWorksheetShareRange

修改表格视图分享范围

### 参数

args.appId  {string}  应用Id  
args.rowId  {string}  行Id  
args.worksheetId  {string}  工作表id  
args.viewId  {string}  视图Id  

```js
import { apis } from "mdye";

apis.worksheet.updateWorksheetShareRange(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetInfo

工作表详情

### 参数

args.worksheetId  {string}  工作表id  
args.relationWorksheetId  {string}  关联表的id  
args.getTemplate  {boolean}  是否获取Template  
args.getViews  {boolean}  是否获取Views  
args.appId  {string}  应用Id  
args.handleDefault  {boolean}  处理默认值  
args.worksheetIds  {array}  批量工作表id  
args.handControlSource  {boolean}  是否处理关联的原始类型  
args.getRules  {boolean}  是否需要验证规则  
args.getSwitchPermit  {boolean}  是否获取功能开关  
args.getRelationSearch  {boolean}  获取查下记录控件  
args.resultType  {integer}  获取类型 0或者1：常规 2：简易模式 3:严格鉴权  

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetBaseInfo

获取工作表基本信息

### 参数

args.worksheetId  {string}  工作表id  
args.relationWorksheetId  {string}  关联表的id  
args.getTemplate  {boolean}  是否获取Template  
args.getViews  {boolean}  是否获取Views  
args.appId  {string}  应用Id  
args.handleDefault  {boolean}  处理默认值  
args.worksheetIds  {array}  批量工作表id  
args.handControlSource  {boolean}  是否处理关联的原始类型  
args.getRules  {boolean}  是否需要验证规则  
args.getSwitchPermit  {boolean}  是否获取功能开关  
args.getRelationSearch  {boolean}  获取查下记录控件  
args.resultType  {integer}  获取类型 0或者1：常规 2：简易模式 3:严格鉴权  

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetBaseInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetInfoByWorkItem

审批、填写获取子表信息及控件权限

### 参数

args.worksheetId  {string}  工作表id  
args.relationWorksheetId  {string}  关联表的id  
args.getTemplate  {boolean}  是否获取Template  
args.getViews  {boolean}  是否获取Views  
args.appId  {string}  应用Id  
args.handleDefault  {boolean}  处理默认值  
args.worksheetIds  {array}  批量工作表id  
args.handControlSource  {boolean}  是否处理关联的原始类型  
args.getRules  {boolean}  是否需要验证规则  
args.getSwitchPermit  {boolean}  是否获取功能开关  
args.getRelationSearch  {boolean}  获取查下记录控件  
args.resultType  {integer}  获取类型 0或者1：常规 2：简易模式 3:严格鉴权  
args.controlId  {string}  子表的控件id  
args.instanceId  {string}  流程实例id  
args.workId  {string}  运行节点id  
args.linkId  {string}  工作流填写链接id  

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetInfoByWorkItem(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetShareUrl

获取工作表分享链接

### 参数

args.worksheetId  {string}  工作表id  
args.rowId  {string}  行Id  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.password  {string}  密码code  
args.validTime  {string}  有效时间  
args.pageTitle  {string}  页面标题  
args.isEdit  {boolean}  是否为编辑,获取url时不传，编辑时传true  

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetShareUrl(args)
  .then(res => {
    console.log(res);
  });
```
---

## getShareInfoByShareId

根据shareid得到worksheetid

### 参数

args.ticket  {string}  验证码返票据  
args.randStr  {string}  票据随机字符串  
args.clientId  {string}  客户端标识  
args.shareId  {string}  对外分享标识  
args.password  {string}  密码  
args.printId  {string}  打印模板id  

```js
import { apis } from "mdye";

apis.worksheet.getShareInfoByShareId(args)
  .then(res => {
    console.log(res);
  });
```
---

## getRefreshRowsMinute

获取工作表校准间隔时间

### 参数


```js
import { apis } from "mdye";

apis.worksheet.getRefreshRowsMinute(args)
  .then(res => {
    console.log(res);
  });
```
---

## getRowByID

行详情

### 参数

args.worksheetId  {string}  工作表id  
args.rowId  {string}  行id  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.instanceId  {string}  流程实例id  
args.workId  {string}  运行节点id  
args.getTemplate  {boolean}  是否获取模板  
args.shareId  {string}  分享页获取关联记录iD  
args.checkView  {boolean}  是否验证视图  
args.relationWorksheetId  {string}  关联控件ID  
args.discussId  {string}  讨论ID  

```js
import { apis } from "mdye";

apis.worksheet.getRowByID(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAttachmentDetail

获取 附件详情

### 参数

args.attachmentShareId  {string}  附件分享Id  

```js
import { apis } from "mdye";

apis.worksheet.getAttachmentDetail(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAttachmentShareId

获取 附件分享Id

### 参数

args.appId  {string}  应用Id  
args.viewId  {string}  视图Id  
args.worksheetId  {string}  工作表Id  
args.rowId  {string}  行记录Id  
args.controlId  {string}  控件Id  
args.fileId  {string}  附件Id  
args.instanceId  {string}  实例Id  
args.workId  {string}  工作Id  

```js
import { apis } from "mdye";

apis.worksheet.getAttachmentShareId(args)
  .then(res => {
    console.log(res);
  });
```
---

## getRowDetail

获取记录详情

### 参数

args.worksheetId  {string}  工作表id  
args.rowId  {string}  行id  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.instanceId  {string}  流程实例id  
args.workId  {string}  运行节点id  
args.getTemplate  {boolean}  是否获取模板  
args.shareId  {string}  分享页获取关联记录iD  
args.checkView  {boolean}  是否验证视图  
args.relationWorksheetId  {string}  关联控件ID  
args.discussId  {string}  讨论ID  

```js
import { apis } from "mdye";

apis.worksheet.getRowDetail(args)
  .then(res => {
    console.log(res);
  });
```
---

## checkRowEditLock

校验行记录编辑锁

### 参数

args.worksheetId  {string}    
args.rowId  {string}    
args.getRowUpdateTime  {boolean}    

```js
import { apis } from "mdye";

apis.worksheet.checkRowEditLock(args)
  .then(res => {
    console.log(res);
  });
```
---

## getRowEditLock

获取行记录编辑锁

### 参数

args.worksheetId  {string}    
args.rowId  {string}    
args.getRowUpdateTime  {boolean}    

```js
import { apis } from "mdye";

apis.worksheet.getRowEditLock(args)
  .then(res => {
    console.log(res);
  });
```
---

## cancelRowEditLock

取消行记录编辑锁

### 参数

args.worksheetId  {string}    
args.rowId  {string}    
args.getRowUpdateTime  {boolean}    

```js
import { apis } from "mdye";

apis.worksheet.cancelRowEditLock(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorkItem

根据工作流实例信息获取工作表信息

### 参数

args.instanceId  {string}  流程实例id  
args.workId  {string}  运行节点id  

```js
import { apis } from "mdye";

apis.worksheet.getWorkItem(args)
  .then(res => {
    console.log(res);
  });
```
---

## getRowRelationRows

获取记录关联记录

### 参数

args.worksheetId  {string}  工作表id  
args.rowId  {string}  行id  
args.controlId  {string}  控件id  
args.pageIndex  {integer}  页码  
args.pageSize  {integer}  页大小  
args.getWorksheet  {boolean}  是否获取工作表信息  
args.sortId  {string}    
args.isAsc  {boolean}    
args.shareId  {string}  分享ID  
args.keywords  {string}  关键词  
args.linkId  {string}  链接分享id  
args.viewId  {string}    
args.filterControls  {array}    
args.getRules  {boolean}    
args.fastFilters  {array}  快递筛选  
args.instanceId  {string}    
args.workId  {string}    
args.appId  {string}    
args.discussId  {string}    

```js
import { apis } from "mdye";

apis.worksheet.getRowRelationRows(args)
  .then(res => {
    console.log(res);
  });
```
---

## addWorksheetRow

添加行

### 参数

args.ticket  {string}  验证码返票据  
args.randStr  {string}  票据随机字符串  
args.worksheetId  {string}  工作表id  
args.receiveControls  {array}  该行所有的cell  
args.receiveRows  {array}  批量新增所有rows  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.btnId  {string}  自定义按钮ID  
args.btnRemark  {string}  按钮备注  
args.btnWorksheetId  {string}  点击按钮对应的工作表ID  
args.btnRowId  {string}  点击按钮对应的行记录ID  
args.pushUniqueId  {string}  推送ID  
args.verifyCode  {string}  验证码【根据配置来校验是否必填】  
args.rowStatus  {integer}  1：正常 21：草稿箱 22：提交草稿箱  
args.draftRowId  {string}  草稿ID  
args.clientId  {string}  未登录用户临时登录凭据  

```js
import { apis } from "mdye";

apis.worksheet.addWorksheetRow(args)
  .then(res => {
    console.log(res);
  });
```
---

## saveDraftRow

保存草稿箱记录

### 参数

args.ticket  {string}  验证码返票据  
args.randStr  {string}  票据随机字符串  
args.worksheetId  {string}  工作表id  
args.receiveControls  {array}  该行所有的cell  
args.receiveRows  {array}  批量新增所有rows  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.btnId  {string}  自定义按钮ID  
args.btnRemark  {string}  按钮备注  
args.btnWorksheetId  {string}  点击按钮对应的工作表ID  
args.btnRowId  {string}  点击按钮对应的行记录ID  
args.pushUniqueId  {string}  推送ID  
args.verifyCode  {string}  验证码【根据配置来校验是否必填】  
args.rowStatus  {integer}  1：正常 21：草稿箱 22：提交草稿箱  
args.draftRowId  {string}  草稿ID  
args.clientId  {string}  未登录用户临时登录凭据  

```js
import { apis } from "mdye";

apis.worksheet.saveDraftRow(args)
  .then(res => {
    console.log(res);
  });
```
---

## addWSRowsBatch

批量添加行

### 参数

args.ticket  {string}  验证码返票据  
args.randStr  {string}  票据随机字符串  
args.worksheetId  {string}  工作表id  
args.receiveControls  {array}  该行所有的cell  
args.receiveRows  {array}  批量新增所有rows  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.btnId  {string}  自定义按钮ID  
args.btnRemark  {string}  按钮备注  
args.btnWorksheetId  {string}  点击按钮对应的工作表ID  
args.btnRowId  {string}  点击按钮对应的行记录ID  
args.pushUniqueId  {string}  推送ID  
args.verifyCode  {string}  验证码【根据配置来校验是否必填】  
args.rowStatus  {integer}  1：正常 21：草稿箱 22：提交草稿箱  
args.draftRowId  {string}  草稿ID  
args.clientId  {string}  未登录用户临时登录凭据  

```js
import { apis } from "mdye";

apis.worksheet.addWSRowsBatch(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateWorksheetRow

修改行

### 参数

args.worksheetId  {string}  工作表id  
args.rowId  {string}  行id  
args.newOldControl  {array}  要修改的cell  
args.viewId  {string}  视图Id  
args.instanceId  {string}  流程实例id  
args.workId  {string}  运行节点id  
args.btnId  {string}  自定义按钮ID  
args.btnRemark  {string}  按钮备注  
args.btnWorksheetId  {string}  点击按钮对应的工作表ID  
args.btnRowId  {string}  点击按钮对应的行记录ID  
args.pushUniqueId  {string}  推送ID  
args.rowStatus  {integer}  1：正常 21：草稿箱  

```js
import { apis } from "mdye";

apis.worksheet.updateWorksheetRow(args)
  .then(res => {
    console.log(res);
  });
```
---

## checkFieldUnique

验证字段唯一性

### 参数

args.worksheetId  {string}  工作表id  
args.controlId  {string}  需要验证的控件id  
args.controlValue  {string}  新输入的值  

```js
import { apis } from "mdye";

apis.worksheet.checkFieldUnique(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateWorksheetRows

批量修改

### 参数

args.worksheetId  {string}  工作表id  
args.viewId  {string}  视图Id  
args.rowIds  {array}  行id  
args.appId  {string}  应用Id  
args.isAll  {boolean}  是否全部  
args.excludeRowIds  {array}  需要排除的rowIds  
args.filterControls  {array}  筛选条件  
args.keyWords  {string}  搜索关键字  
args.fastFilters  {array}  快递筛选  
args.navGroupFilters  {array}  导航分组筛选  
args.filtersGroup  {array}    
args.btnId  {string}  自定义按钮ID  
args.btnRemark  {string}  按钮备注  
args.btnWorksheetId  {string}  点击按钮对应的工作表ID  
args.btnRowId  {string}  点击按钮对应的行记录ID  
args.pushUniqueId  {string}  推送ID  
args.controls  {array}  批量编辑  

```js
import { apis } from "mdye";

apis.worksheet.updateWorksheetRows(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateRowRelationRows

编辑记录关联记录

### 参数

args.worksheetId  {string}  工作表id  
args.rowId  {string}  行id  
args.rowIds  {array}  行ids  
args.isAdd  {boolean}  isAdd  
args.controlId  {string}  控件Id  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.instanceId  {string}  流程实例id  
args.workId  {string}  运行节点id  

```js
import { apis } from "mdye";

apis.worksheet.updateRowRelationRows(args)
  .then(res => {
    console.log(res);
  });
```
---

## replaceRowRelationRows

编辑

### 参数

args.worksheetId  {string}  工作表id  
args.fromRowId  {string}  老的上级RowId  
args.toRowId  {string}  新的上级RowId  
args.rowIds  {array}  行ids  
args.controlId  {string}  关联控件ID  
args.viewId  {string}  视图Id  

```js
import { apis } from "mdye";

apis.worksheet.replaceRowRelationRows(args)
  .then(res => {
    console.log(res);
  });
```
---

## refreshSummary

刷新汇总控件

### 参数

args.worksheetId  {string}  工作表id  
args.rowId  {string}  行id  
args.rowIds  {array}  行ids  
args.isAdd  {boolean}  isAdd  
args.controlId  {string}  控件Id  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.instanceId  {string}  流程实例id  
args.workId  {string}  运行节点id  

```js
import { apis } from "mdye";

apis.worksheet.refreshSummary(args)
  .then(res => {
    console.log(res);
  });
```
---

## refreshWorksheetRows

批量刷新行记录

### 参数

args.worksheetId  {string}  工作表id  
args.viewId  {string}  视图Id  
args.rowIds  {array}  行id  
args.appId  {string}  应用Id  
args.isAll  {boolean}  是否全部  
args.excludeRowIds  {array}  需要排除的rowIds  
args.filterControls  {array}  筛选条件  
args.keyWords  {string}  搜索关键字  
args.fastFilters  {array}  快递筛选  
args.navGroupFilters  {array}  导航分组筛选  
args.filtersGroup  {array}    
args.btnId  {string}  自定义按钮ID  
args.btnRemark  {string}  按钮备注  
args.btnWorksheetId  {string}  点击按钮对应的工作表ID  
args.btnRowId  {string}  点击按钮对应的行记录ID  
args.pushUniqueId  {string}  推送ID  
args.controls  {array}  批量编辑  

```js
import { apis } from "mdye";

apis.worksheet.refreshWorksheetRows(args)
  .then(res => {
    console.log(res);
  });
```
---

## deleteWorksheetRows

删除行

### 参数

args.worksheetId  {string}  工作表id  
args.rowIds  {array}  行id  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.isAll  {boolean}  是否全选  
args.excludeRowIds  {array}  需要排除的rowIds  
args.filterControls  {array}  筛选条件  
args.keyWords  {string}  搜索关键字  
args.fastFilters  {array}  快速筛选  
args.navGroupFilters  {array}  导航分组筛选  
args.filtersGroup  {array}    
args.thoroughDelete  {boolean}  彻底删除  
args.pushUniqueId  {string}  推送ID  

```js
import { apis } from "mdye";

apis.worksheet.deleteWorksheetRows(args)
  .then(res => {
    console.log(res);
  });
```
---

## restoreWorksheetRows

恢复行

### 参数

args.worksheetId  {string}  工作表id  
args.rowIds  {array}  行ids  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.restoreRelation  {boolean}  恢复关联  
args.copyRelationControlId  {string}    
args.isAll  {boolean}  是否全选  
args.excludeRowIds  {array}  需要排除的rowIds  
args.filterControls  {array}  筛选条件  
args.keyWords  {string}  搜索关键字  
args.fastFilters  {array}  快速筛选  
args.pushUniqueId  {string}  推送ID  

```js
import { apis } from "mdye";

apis.worksheet.restoreWorksheetRows(args)
  .then(res => {
    console.log(res);
  });
```
---

## removeWorksheetRows

彻底删除

### 参数

args.worksheetId  {string}  工作表id  
args.rowIds  {array}  行ids  
args.appId  {string}  应用Id  
args.isAll  {boolean}  是否全选  
args.excludeRowIds  {array}  需要排除的rowIds  
args.filterControls  {array}  筛选条件  
args.keyWords  {string}  搜索关键字  
args.fastFilters  {array}  快速筛选  

```js
import { apis } from "mdye";

apis.worksheet.removeWorksheetRows(args)
  .then(res => {
    console.log(res);
  });
```
---

## getFilterRows

过滤查找

### 参数

args.ticket  {string}  验证码返票据  
args.randStr  {string}  票据随机字符串  
args.clientId  {string}  客户端标识  
args.worksheetId  {string}  工作表id  
args.filterControls  {array}  查询列  
args.fastFilters  {array}  快速筛选  
args.navGroupFilters  {array}  导航分组筛选  
args.filtersGroup  {array}  筛选组件筛选  
args.sortControls  {array}  排序列  
args.keyWords  {string}  关键词  
args.pageSize  {integer}  页大小  
args.pageIndex  {integer}  页码  
args.isUnRead  {boolean}  是否已读  
args.isGetWorksheet  {boolean}  是否查询工作表的详情  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.relationWorksheetId  {string}  relationWorksheetId  
args.relationViewId  {string}  RelationViewId  
args.rowId  {string}  行id  
args.controlId  {string}  控件Id  
args.kanbanKey  {string}  全部看板，&#34;-1&#34;:无等于或无选项单看板，&#34;key&#34;:单看板数据,  
args.layer  {integer}  层级视图加载层数  
args.beginTime  {string}  开始时间 日历视图  
args.endTime  {string}  结束时间 日历视图  
args.kanbanSize  {integer}  页大小  
args.kanbanIndex  {integer}  页码  
args.formId  {string}  公开表单ID  
args.linkId  {string}  填写链接id  
args.reportId  {string}  统计图ID  
args.notGetTotal  {boolean}  不获取总记录数  
args.requestParams  {object}  请求参数  

```js
import { apis } from "mdye";

apis.worksheet.getFilterRows(args)
  .then(res => {
    console.log(res);
  });
```
---

## getFilterRowsByQueryDefault

工作表查询默认值获取

### 参数

args.ticket  {string}  验证码返票据  
args.randStr  {string}  票据随机字符串  
args.clientId  {string}  客户端标识  
args.worksheetId  {string}  工作表id  
args.filterControls  {array}  查询列  
args.fastFilters  {array}  快速筛选  
args.navGroupFilters  {array}  导航分组筛选  
args.filtersGroup  {array}  筛选组件筛选  
args.sortControls  {array}  排序列  
args.keyWords  {string}  关键词  
args.pageSize  {integer}  页大小  
args.pageIndex  {integer}  页码  
args.isUnRead  {boolean}  是否已读  
args.isGetWorksheet  {boolean}  是否查询工作表的详情  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.relationWorksheetId  {string}  relationWorksheetId  
args.relationViewId  {string}  RelationViewId  
args.rowId  {string}  行id  
args.controlId  {string}  控件Id  
args.kanbanKey  {string}  全部看板，&#34;-1&#34;:无等于或无选项单看板，&#34;key&#34;:单看板数据,  
args.layer  {integer}  层级视图加载层数  
args.beginTime  {string}  开始时间 日历视图  
args.endTime  {string}  结束时间 日历视图  
args.kanbanSize  {integer}  页大小  
args.kanbanIndex  {integer}  页码  
args.formId  {string}  公开表单ID  
args.linkId  {string}  填写链接id  
args.reportId  {string}  统计图ID  
args.notGetTotal  {boolean}  不获取总记录数  
args.requestParams  {object}  请求参数  
args.id  {string}  工作表查询id  
args.getAllControls  {boolean}  是否返回所有控件返回值  

```js
import { apis } from "mdye";

apis.worksheet.getFilterRowsByQueryDefault(args)
  .then(res => {
    console.log(res);
  });
```
---

## getFilterRowsTotalNum

获取行记录总数

### 参数

args.ticket  {string}  验证码返票据  
args.randStr  {string}  票据随机字符串  
args.clientId  {string}  客户端标识  
args.worksheetId  {string}  工作表id  
args.filterControls  {array}  查询列  
args.fastFilters  {array}  快速筛选  
args.navGroupFilters  {array}  导航分组筛选  
args.filtersGroup  {array}  筛选组件筛选  
args.sortControls  {array}  排序列  
args.keyWords  {string}  关键词  
args.pageSize  {integer}  页大小  
args.pageIndex  {integer}  页码  
args.isUnRead  {boolean}  是否已读  
args.isGetWorksheet  {boolean}  是否查询工作表的详情  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.relationWorksheetId  {string}  relationWorksheetId  
args.relationViewId  {string}  RelationViewId  
args.rowId  {string}  行id  
args.controlId  {string}  控件Id  
args.kanbanKey  {string}  全部看板，&#34;-1&#34;:无等于或无选项单看板，&#34;key&#34;:单看板数据,  
args.layer  {integer}  层级视图加载层数  
args.beginTime  {string}  开始时间 日历视图  
args.endTime  {string}  结束时间 日历视图  
args.kanbanSize  {integer}  页大小  
args.kanbanIndex  {integer}  页码  
args.formId  {string}  公开表单ID  
args.linkId  {string}  填写链接id  
args.reportId  {string}  统计图ID  
args.notGetTotal  {boolean}  不获取总记录数  
args.requestParams  {object}  请求参数  

```js
import { apis } from "mdye";

apis.worksheet.getFilterRowsTotalNum(args)
  .then(res => {
    console.log(res);
  });
```
---

## getFilterRowsReport

工作表最下方统计

### 参数

args.worksheetId  {string}  工作表id  
args.filterControls  {array}  查询列  
args.columnRpts  {array}  列排序  
args.keyWords  {string}  关键词  
args.controlId  {string}    
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.fastFilters  {array}    
args.navGroupFilters  {array}  导航分组筛选  
args.filtersGroup  {array}  筛选组件  
args.requestParams  {object}  请求参数  

```js
import { apis } from "mdye";

apis.worksheet.getFilterRowsReport(args)
  .then(res => {
    console.log(res);
  });
```
---

## getLogs

获取日志

### 参数

args.worksheetId  {string}  工作表id  
args.pageSize  {integer}  页大小  
args.pageIndex  {integer}  页码  
args.rowId  {string}  行id  

```js
import { apis } from "mdye";

apis.worksheet.getLogs(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetOperationLogs

获取工作表操作日志

### 参数

args.pageSize  {integer}  分页大小  
args.pageIndex  {integer}  当前页  
args.objectType  {integer}  日志对象类型 1:工作表 2:行记录 3:视图 4:按钮 5:业务规则 99:其他  
args.worksheetId  {string}  工作表id  
args.rowId  {string}  记录id  
args.filterUniqueIds  {array}  根据唯一码筛选  
args.controlIds  {array}  筛选控件或属性ID  
args.opeartorIds  {array}  筛选操作人  
args.startDate  {string}  开始时间  
args.endDate  {string}  结束时间  
args.lastMark  {string}  最后标记时间  
args.isGlobaLog  {boolean}  是否为全局日志获取记录日志  
args.requestType  {integer}  日志操作类型 1：手动 2：工作流 3：按钮  
args.archiveId  {string}  归档ID  

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetOperationLogs(args)
  .then(res => {
    console.log(res);
  });
```
---

## getDetailTableLog

获取子表日志详情

### 参数

args.worksheetId  {string}  工作表id  
args.rowId  {string}  行记录id  
args.uniqueId  {string}  唯一id  
args.createTime  {string}  创建时间  
args.lastMark  {string}  最后标记时间  
args.objectType  {integer}  对象类型  
args.requestType  {integer}  请求类型  
args.pageIndex  {integer}  当前页  
args.pageSize  {integer}  页大小  
args.archiveId  {string}  归档ID  

```js
import { apis } from "mdye";

apis.worksheet.getDetailTableLog(args)
  .then(res => {
    console.log(res);
  });
```
---

## batchGetWorksheetOperationLogs

批量获取工作表日志

### 参数

args.pageSize  {integer}  分页大小  
args.pageIndex  {integer}  当前页  
args.objectType  {integer}  日志对象类型 1:工作表 2:行记录 3:视图 4:按钮 5:业务规则 99:其他  
args.worksheetId  {string}  工作表id  
args.rowId  {string}  记录id  
args.filterUniqueIds  {array}  根据唯一码筛选  
args.controlIds  {array}  筛选控件或属性ID  
args.opeartorIds  {array}  筛选操作人  
args.startDate  {string}  开始时间  
args.endDate  {string}  结束时间  
args.lastMark  {string}  最后标记时间  
args.isGlobaLog  {boolean}  是否为全局日志获取记录日志  
args.requestType  {integer}  日志操作类型 1：手动 2：工作流 3：按钮  
args.archiveId  {string}  归档ID  

```js
import { apis } from "mdye";

apis.worksheet.batchGetWorksheetOperationLogs(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateWorksheetRowShareRange

工作表记录分享范围修改

### 参数

args.appId  {string}  应用Id  
args.worksheetId  {string}  工作表id  
args.viewId  {string}  视图Id  
args.rowId  {string}  行id  

```js
import { apis } from "mdye";

apis.worksheet.updateWorksheetRowShareRange(args)
  .then(res => {
    console.log(res);
  });
```
---

## getRowsShortUrl

获取记录短链

### 参数

args.worksheetId  {string}  工作表id  
args.rowIds  {array}  行ids  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  

```js
import { apis } from "mdye";

apis.worksheet.getRowsShortUrl(args)
  .then(res => {
    console.log(res);
  });
```
---

## copyRow

复制行记录

### 参数

args.worksheetId  {string}  工作表id  
args.rowIds  {array}  行ids  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.restoreRelation  {boolean}  恢复关联  
args.copyRelationControlId  {string}    
args.isAll  {boolean}  是否全选  
args.excludeRowIds  {array}  需要排除的rowIds  
args.filterControls  {array}  筛选条件  
args.keyWords  {string}  搜索关键字  
args.fastFilters  {array}  快速筛选  
args.pushUniqueId  {string}  推送ID  

```js
import { apis } from "mdye";

apis.worksheet.copyRow(args)
  .then(res => {
    console.log(res);
  });
```
---

## getNavGroup

获取分组导航

### 参数

args.worksheetId  {string}  工作表id  
args.filterControls  {array}  查询列  
args.columnRpts  {array}  列排序  
args.keyWords  {string}  关键词  
args.controlId  {string}    
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.fastFilters  {array}    
args.navGroupFilters  {array}  导航分组筛选  
args.filtersGroup  {array}  筛选组件  
args.requestParams  {object}  请求参数  

```js
import { apis } from "mdye";

apis.worksheet.getNavGroup(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetArchives

获取工作表归档列表

### 参数

args.type  {integer}  1：行记录日志  

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetArchives(args)
  .then(res => {
    console.log(res);
  });
```
---

## saveWorksheetFilter

保存筛选器

### 参数

args.name  {string}  筛选器名称  
args.worksheetId  {string}  工作表id  
args.type  {integer}  视图类型 1：个人 2：公共  
args.items  {array}    
args.filterId  {string}  筛选条件编号  
args.appId  {string}  应用Id  
args.module  {integer}  1:工作表 2:统计  

```js
import { apis } from "mdye";

apis.worksheet.saveWorksheetFilter(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetFilters

获取可见筛选器

### 参数

args.worksheetId  {string}  工作表id  
args.controlId  {string}  控件ID  

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetFilters(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetFilterById

获取筛选器详情

### 参数

args.filterId  {string}  筛选器Id  
args.items  {array}  FilterSort  
args.projectId  {string}  网络Id  
args.worksheetId  {string}  工作表ID  

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetFilterById(args)
  .then(res => {
    console.log(res);
  });
```
---

## deleteWorksheetFilter

删除筛选器

### 参数

args.filterId  {string}  筛选器Id  
args.appId  {string}  应用ID  

```js
import { apis } from "mdye";

apis.worksheet.deleteWorksheetFilter(args)
  .then(res => {
    console.log(res);
  });
```
---

## sortWorksheetFilters

筛选器排序

### 参数

args.worksheetId  {string}  工作表id  
args.filterIds  {array}  筛选器Id  
args.appId  {string}  应用Id  

```js
import { apis } from "mdye";

apis.worksheet.sortWorksheetFilters(args)
  .then(res => {
    console.log(res);
  });
```
---

## saveWorksheetView

保存视图

### 参数

args.name  {string}  视图名称  
args.worksheetId  {string}  工作表Id  
args.sortCid  {string}  排序字段Id  
args.sortType  {integer}  排序类型  
args.rowHeight  {integer}  行高 0：紧凑 1：中等 2：高 3：超高  
args.controls  {array}  controls  
args.filters  {array}  filters  
args.fastFilters  {array}  fastfilters  
args.moreSort  {array}  排序  
args.navGroup  {array}  导航分组  
args.displayControls  {array}  显示字段  
args.showControls  {array}  Web显示字段  
args.controlsSorts  {array}  字段排序  
args.layersName  {array}  层级名称  
args.customDisplay  {boolean}  是否配置自定义显示列  
args.viewId  {string}  视图id  
args.appId  {string}  应用Id  
args.unRead  {boolean}  unRead  
args.viewType  {integer}  0:列表 1：看板 2：层级  
args.childType  {integer}  1：单表层级 2：多表层级  
args.viewControl  {string}  视图维度ID(分组ID)  
args.viewControls  {array}  多表层级视图控件  
args.coverCid  {string}  封面字段  
args.coverType  {integer}  0：填满 1：完整显示  
args.showControlName  {boolean}  显示控件名称  
args.advancedSetting  {object}  视图高级配置  
args.editAttrs  {array}  编辑属性  
args.editAdKeys  {array}  编辑AdvancedSetting属性keys  
args.pluginId  {string}  视图插件id  
args.pluginName  {string}  视图插件名称  
args.pluginIcon  {string}  视图插件图标  
args.pluginIconColor  {string}  插件插件图标颜色  
args.pluginSource  {integer}  插件来源  
args.projectId  {string}  组织id  

```js
import { apis } from "mdye";

apis.worksheet.saveWorksheetView(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetViews

获取可见视图

### 参数

args.worksheetId  {string}  工作表id  
args.viewId  {string}    
args.appId  {string}  应用Id  

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetViews(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetViewById

获取视图详情

### 参数

args.worksheetId  {string}  工作表id  
args.viewId  {string}    
args.appId  {string}  应用Id  

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetViewById(args)
  .then(res => {
    console.log(res);
  });
```
---

## deleteWorksheetView

删除视图

### 参数

args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.status  {integer}  9：删除 999：彻底删除  

```js
import { apis } from "mdye";

apis.worksheet.deleteWorksheetView(args)
  .then(res => {
    console.log(res);
  });
```
---

## restoreWorksheetView

恢复视图

### 参数

args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.status  {integer}  9：删除 999：彻底删除  

```js
import { apis } from "mdye";

apis.worksheet.restoreWorksheetView(args)
  .then(res => {
    console.log(res);
  });
```
---

## copyWorksheetView

获取工作表API

### 参数

args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  

```js
import { apis } from "mdye";

apis.worksheet.copyWorksheetView(args)
  .then(res => {
    console.log(res);
  });
```
---

## sortWorksheetViews

视图排序

### 参数

args.worksheetId  {string}  工作表id  
args.viewIds  {array}  视图Id  
args.appId  {string}  应用Id  

```js
import { apis } from "mdye";

apis.worksheet.sortWorksheetViews(args)
  .then(res => {
    console.log(res);
  });
```
---

## copyWorksheetViewConfig

复制视图配置

### 参数

args.viewId  {string}  视图Id  
args.copyKeys  {array}  用户选中的配置  
args.worksheetId  {string}  工作表Id  
args.targetViewIds  {array}  目标视图Id集合  

```js
import { apis } from "mdye";

apis.worksheet.copyWorksheetViewConfig(args)
  .then(res => {
    console.log(res);
  });
```
---

## editGenerateViewDefaultAlias

批量生成视图别名

### 参数

args.worksheetId  {string}  表id  

```js
import { apis } from "mdye";

apis.worksheet.editGenerateViewDefaultAlias(args)
  .then(res => {
    console.log(res);
  });
```
---

## editViewAlias

编辑视图别名

### 参数

args.worksheetId  {string}  表id  
args.views  {array}  视图别名信息  

```js
import { apis } from "mdye";

apis.worksheet.editViewAlias(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetBtns

获取按钮列表

### 参数

args.appId  {string}  应用ID  
args.viewId  {string}  视图ID  
args.rowId  {string}  行记录ID  
args.worksheetId  {string}  工作表ID  
args.btnId  {string}    
args.status  {integer}  状态 1：正常 9：回收站  
args.btnIds  {array}  批量获取按钮的id  
args.rowIds  {array}    

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetBtns(args)
  .then(res => {
    console.log(res);
  });
```
---

## checkWorksheetRowBtn

验证按钮是否满足行记录

### 参数

args.appId  {string}  应用ID  
args.viewId  {string}  视图ID  
args.rowId  {string}  行记录ID  
args.worksheetId  {string}  工作表ID  
args.btnId  {string}    
args.status  {integer}  状态 1：正常 9：回收站  
args.btnIds  {array}  批量获取按钮的id  
args.rowIds  {array}    

```js
import { apis } from "mdye";

apis.worksheet.checkWorksheetRowBtn(args)
  .then(res => {
    console.log(res);
  });
```
---

## checkWorksheetRowsBtn

批量验证行记录是否满足按钮条件

### 参数

args.appId  {string}  应用ID  
args.viewId  {string}  视图ID  
args.rowId  {string}  行记录ID  
args.worksheetId  {string}  工作表ID  
args.btnId  {string}    
args.status  {integer}  状态 1：正常 9：回收站  
args.btnIds  {array}  批量获取按钮的id  
args.rowIds  {array}    

```js
import { apis } from "mdye";

apis.worksheet.checkWorksheetRowsBtn(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetBtnByID

获取按钮详情

### 参数

args.appId  {string}  应用ID  
args.viewId  {string}  视图ID  
args.rowId  {string}  行记录ID  
args.worksheetId  {string}  工作表ID  
args.btnId  {string}    
args.status  {integer}  状态 1：正常 9：回收站  
args.btnIds  {array}  批量获取按钮的id  
args.rowIds  {array}    

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetBtnByID(args)
  .then(res => {
    console.log(res);
  });
```
---

## optionWorksheetBtn

操作按钮

### 参数

args.appId  {string}  应用iD  
args.viewId  {string}  视图ID  
args.btnId  {string}  按钮ID  
args.worksheetId  {string}  工作表ID  

```js
import { apis } from "mdye";

apis.worksheet.optionWorksheetBtn(args)
  .then(res => {
    console.log(res);
  });
```
---

## saveWorksheetBtn

保存按钮

### 参数

args.btnId  {string}    
args.name  {string}    
args.worksheetId  {string}    
args.showType  {integer}  1:一直 2：满足筛选条件  
args.filters  {array}  筛选条件  
args.displayViews  {array}  显示视图  
args.clickType  {integer}  1：立即执行 2：二次确认 3：填写  
args.confirmMsg  {string}  确认信息  
args.sureName  {string}  确认按钮  
args.cancelName  {string}  取消按钮  
args.writeObject  {integer}  对象 1：本记录 2：关联记录  
args.writeType  {integer}  类型 1：填写字段 2：新建关联记录  
args.relationControl  {string}  关联记录ID  
args.addRelationControlId  {string}  新建关联记录ID  
args.workflowType  {integer}  1:执行 2：不执行  
args.workflowId  {string}  工作流ID  
args.writeControls  {array}  填写控件 type - 1：只读 2：填写 3：必填  
args.appId  {string}  应用ID  
args.color  {string}  颜色  
args.icon  {string}  图标  
args.desc  {string}  描述  
args.isAllView  {integer}    
args.editAttrs  {array}  编辑属性  
args.verifyPwd  {boolean}    
args.enableConfirm  {boolean}    
args.advancedSetting  {object}    
args.isBatch  {boolean}    

```js
import { apis } from "mdye";

apis.worksheet.saveWorksheetBtn(args)
  .then(res => {
    console.log(res);
  });
```
---

## copyWorksheetBtn

复制按钮

### 参数

args.appId  {string}  应用iD  
args.viewId  {string}  视图ID  
args.btnId  {string}  按钮ID  
args.worksheetId  {string}  工作表ID  

```js
import { apis } from "mdye";

apis.worksheet.copyWorksheetBtn(args)
  .then(res => {
    console.log(res);
  });
```
---

## getControlRules

获取规则列表

### 参数

args.worksheetId  {string}    
args.ruleId  {string}    
args.instanceId  {string}  通过工作流时必传  
args.workId  {string}  通过工作流时必传  

```js
import { apis } from "mdye";

apis.worksheet.getControlRules(args)
  .then(res => {
    console.log(res);
  });
```
---

## saveControlRule

保存规则

### 参数

args.worksheetId  {string}    
args.ruleId  {string}    
args.ruleIds  {array}    
args.name  {string}    
args.disabled  {boolean}    
args.filters  {array}    
args.ruleItems  {array}    
args.editAttrs  {array}    
args.type  {integer}  0:交互  1：验证 2：锁定  
args.checkType  {integer}  0：前端  1：前后端  
args.hintType  {integer}  0：输入和提交 1：仅提交  

```js
import { apis } from "mdye";

apis.worksheet.saveControlRule(args)
  .then(res => {
    console.log(res);
  });
```
---

## sortControlRules

@param {Object} args 请求参数

### 参数

args.worksheetId  {string}    
args.ruleId  {string}    
args.ruleIds  {array}    
args.name  {string}    
args.disabled  {boolean}    
args.filters  {array}    
args.ruleItems  {array}    
args.editAttrs  {array}    
args.type  {integer}  0:交互  1：验证 2：锁定  
args.checkType  {integer}  0：前端  1：前后端  
args.hintType  {integer}  0：输入和提交 1：仅提交  

```js
import { apis } from "mdye";

apis.worksheet.sortControlRules(args)
  .then(res => {
    console.log(res);
  });
```
---

## saveWorksheetControls

保存表控件

### 参数

args.sourceId  {string}  兼容老数据  
args.worksheetId  {string}  WorksheetId  
args.version  {integer}  版本号  
args.controls  {array}  控件集合  
args.appId  {string}  应用ID  
args.controlId  {string}  控件ID  
args.controlIds  {array}  控件IDs  
args.status  {integer}  状态 1:恢复 999：彻底删除  
args.initNum  {integer}  初始化编号  

```js
import { apis } from "mdye";

apis.worksheet.saveWorksheetControls(args)
  .then(res => {
    console.log(res);
  });
```
---

## addWorksheetControls

添加表控件

### 参数

args.sourceId  {string}  兼容老数据  
args.worksheetId  {string}  WorksheetId  
args.version  {integer}  版本号  
args.controls  {array}  控件集合  
args.appId  {string}  应用ID  
args.controlId  {string}  控件ID  
args.controlIds  {array}  控件IDs  
args.status  {integer}  状态 1:恢复 999：彻底删除  
args.initNum  {integer}  初始化编号  

```js
import { apis } from "mdye";

apis.worksheet.addWorksheetControls(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetControls

获取表控件

### 参数

args.worksheetId  {string}  工作表id  
args.relationWorksheetId  {string}  关联表的id  
args.getTemplate  {boolean}  是否获取Template  
args.getViews  {boolean}  是否获取Views  
args.appId  {string}  应用Id  
args.handleDefault  {boolean}  处理默认值  
args.worksheetIds  {array}  批量工作表id  
args.handControlSource  {boolean}  是否处理关联的原始类型  
args.getRules  {boolean}  是否需要验证规则  
args.getSwitchPermit  {boolean}  是否获取功能开关  
args.getRelationSearch  {boolean}  获取查下记录控件  
args.resultType  {integer}  获取类型 0或者1：常规 2：简易模式 3:严格鉴权  

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetControls(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAiFieldRecommendation

获取工作表字段智能建议

### 参数

args.prompt  {string}  提示词  

```js
import { apis } from "mdye";

apis.worksheet.getAiFieldRecommendation(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetsControls

批量获取表控件

### 参数

args.worksheetId  {string}  工作表id  
args.relationWorksheetId  {string}  关联表的id  
args.getTemplate  {boolean}  是否获取Template  
args.getViews  {boolean}  是否获取Views  
args.appId  {string}  应用Id  
args.handleDefault  {boolean}  处理默认值  
args.worksheetIds  {array}  批量工作表id  
args.handControlSource  {boolean}  是否处理关联的原始类型  
args.getRules  {boolean}  是否需要验证规则  
args.getSwitchPermit  {boolean}  是否获取功能开关  
args.getRelationSearch  {boolean}  获取查下记录控件  
args.resultType  {integer}  获取类型 0或者1：常规 2：简易模式 3:严格鉴权  

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetsControls(args)
  .then(res => {
    console.log(res);
  });
```
---

## editControlsAlias

编辑控件别名

### 参数

args.sourceId  {string}  兼容老数据  
args.worksheetId  {string}  WorksheetId  
args.version  {integer}  版本号  
args.controls  {array}  控件集合  
args.appId  {string}  应用ID  
args.controlId  {string}  控件ID  
args.controlIds  {array}  控件IDs  
args.status  {integer}  状态 1:恢复 999：彻底删除  
args.initNum  {integer}  初始化编号  

```js
import { apis } from "mdye";

apis.worksheet.editControlsAlias(args)
  .then(res => {
    console.log(res);
  });
```
---

## editGenerateControlsDefaultAlias

生成控件默认别名

### 参数

args.appId  {string}  应用id  
args.worksheetId  {string}  工作表id  
args.version  {integer}  版本号  

```js
import { apis } from "mdye";

apis.worksheet.editGenerateControlsDefaultAlias(args)
  .then(res => {
    console.log(res);
  });
```
---

## editWorksheetControls

保存表控件

### 参数

args.sourceId  {string}  兼容老数据  
args.worksheetId  {string}  WorksheetId  
args.version  {integer}  版本号  
args.controls  {array}  控件集合  
args.appId  {string}  应用ID  
args.controlId  {string}  控件ID  
args.controlIds  {array}  控件IDs  
args.status  {integer}  状态 1:恢复 999：彻底删除  
args.initNum  {integer}  初始化编号  

```js
import { apis } from "mdye";

apis.worksheet.editWorksheetControls(args)
  .then(res => {
    console.log(res);
  });
```
---

## resetControlIncrease

重置自动编号

### 参数

args.sourceId  {string}  兼容老数据  
args.worksheetId  {string}  WorksheetId  
args.version  {integer}  版本号  
args.controls  {array}  控件集合  
args.appId  {string}  应用ID  
args.controlId  {string}  控件ID  
args.controlIds  {array}  控件IDs  
args.status  {integer}  状态 1:恢复 999：彻底删除  
args.initNum  {integer}  初始化编号  

```js
import { apis } from "mdye";

apis.worksheet.resetControlIncrease(args)
  .then(res => {
    console.log(res);
  });
```
---

## deleteWorksheetAutoID

删除autoid

### 参数

args.worksheetId  {string}  工作表id  
args.relationWorksheetId  {string}  关联表的id  
args.getTemplate  {boolean}  是否获取Template  
args.getViews  {boolean}  是否获取Views  
args.appId  {string}  应用Id  
args.handleDefault  {boolean}  处理默认值  
args.worksheetIds  {array}  批量工作表id  
args.handControlSource  {boolean}  是否处理关联的原始类型  
args.getRules  {boolean}  是否需要验证规则  
args.getSwitchPermit  {boolean}  是否获取功能开关  
args.getRelationSearch  {boolean}  获取查下记录控件  
args.resultType  {integer}  获取类型 0或者1：常规 2：简易模式 3:严格鉴权  

```js
import { apis } from "mdye";

apis.worksheet.deleteWorksheetAutoID(args)
  .then(res => {
    console.log(res);
  });
```
---

## editControlsStatus

编辑控件状态

### 参数

args.sourceId  {string}  兼容老数据  
args.worksheetId  {string}  WorksheetId  
args.version  {integer}  版本号  
args.controls  {array}  控件集合  
args.appId  {string}  应用ID  
args.controlId  {string}  控件ID  
args.controlIds  {array}  控件IDs  
args.status  {integer}  状态 1:恢复 999：彻底删除  
args.initNum  {integer}  初始化编号  

```js
import { apis } from "mdye";

apis.worksheet.editControlsStatus(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetReferences

获取字段和表引用关系

### 参数

args.worksheetId  {string}  工作表id  
args.controlId  {string}  字段ID  
args.type  {integer}  类型 1：字段引用关系 2：工作表引用关系  
args.module  {integer}  模块 1：工作表 2：工作流  
args.subModule  {integer}  子模块 0：表示获取全部 101：字段 102：视图 103：业务规则 201：流程节点  
args.isRefresh  {boolean}  刷新引用关系  
args.appId  {string}  空表示所有引用，默认传当前应用ID  

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetReferences(args)
  .then(res => {
    console.log(res);
  });
```
---

## getPrintList

获取系统打印列表

### 参数

args.worksheetId  {string}    
args.viewId  {string}    
args.rowIds  {array}    

```js
import { apis } from "mdye";

apis.worksheet.getPrintList(args)
  .then(res => {
    console.log(res);
  });
```
---

## getFormComponent

获取 表单组件

### 参数

args.worksheetId  {string}  工作表Id  

```js
import { apis } from "mdye";

apis.worksheet.getFormComponent(args)
  .then(res => {
    console.log(res);
  });
```
---

## getPrint

获取单个打印模板

### 参数

args.id  {string}    
args.projectId  {string}    
args.worksheetId  {string}  工作表id  
args.rowId  {string}  行id  
args.pageIndex  {integer}  页码  
args.pageSize  {integer}  页大小  
args.sortId  {string}    
args.isAsc  {boolean}    
args.keywords  {string}  关键词  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.instanceId  {string}  通过工作流审批打印时必传  
args.workId  {string}  通过工作流审批打印时必传  
args.filterControls  {array}    
args.fastFilters  {array}  快递筛选  

```js
import { apis } from "mdye";

apis.worksheet.getPrint(args)
  .then(res => {
    console.log(res);
  });
```
---

## getCodePrint

获取单个打印模板

### 参数

args.id  {string}    
args.projectId  {string}    
args.worksheetId  {string}  工作表id  
args.rowId  {string}  行id  
args.pageIndex  {integer}  页码  
args.pageSize  {integer}  页大小  
args.sortId  {string}    
args.isAsc  {boolean}    
args.keywords  {string}  关键词  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.instanceId  {string}  通过工作流审批打印时必传  
args.workId  {string}  通过工作流审批打印时必传  
args.filterControls  {array}    
args.fastFilters  {array}  快递筛选  

```js
import { apis } from "mdye";

apis.worksheet.getCodePrint(args)
  .then(res => {
    console.log(res);
  });
```
---

## getPrintTemplate

新建生成打印模板

### 参数

args.id  {string}    
args.projectId  {string}    
args.worksheetId  {string}  工作表id  
args.rowId  {string}  行id  
args.pageIndex  {integer}  页码  
args.pageSize  {integer}  页大小  
args.sortId  {string}    
args.isAsc  {boolean}    
args.keywords  {string}  关键词  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.instanceId  {string}  通过工作流审批打印时必传  
args.workId  {string}  通过工作流审批打印时必传  
args.filterControls  {array}    
args.fastFilters  {array}  快递筛选  

```js
import { apis } from "mdye";

apis.worksheet.getPrintTemplate(args)
  .then(res => {
    console.log(res);
  });
```
---

## editPrint

保存系统打印模板

### 参数

args.id  {string}  模板id (空=新建 非空=修改)  
args.saveControls  {array}  勾选保存的控件  

```js
import { apis } from "mdye";

apis.worksheet.editPrint(args)
  .then(res => {
    console.log(res);
  });
```
---

## editPrintFile

编辑打印模板文件属性

### 参数

args.id  {string}  模板id  
args.name  {string}  模板名称  
args.allowEditAfterPrint  {boolean}  允许编辑后打印  
args.advanceSettings  {array}  额外配置数据  

```js
import { apis } from "mdye";

apis.worksheet.editPrintFile(args)
  .then(res => {
    console.log(res);
  });
```
---

## saveRecordCodePrintConfig

保存记录二维码打印模板配置

### 参数

args.id  {string}  模板id  
args.projectId  {string}  组织id  
args.worksheetId  {string}  工作表id  
args.name  {string}  模板名称  
args.type  {integer}  3-二维码打印 4-条码打印  
args.range  {integer}  使用范围  
args.views  {array}  视图id  
args.advanceSettings  {array}  额外配置  

```js
import { apis } from "mdye";

apis.worksheet.saveRecordCodePrintConfig(args)
  .then(res => {
    console.log(res);
  });
```
---

## editPrintName

修改打印模板名称

### 参数

args.id  {string}    
args.name  {string}    

```js
import { apis } from "mdye";

apis.worksheet.editPrintName(args)
  .then(res => {
    console.log(res);
  });
```
---

## editPrintRange

修改打印模板范围

### 参数

args.id  {string}    
args.worksheetId  {string}    
args.viewsIds  {array}  视图Ids  

```js
import { apis } from "mdye";

apis.worksheet.editPrintRange(args)
  .then(res => {
    console.log(res);
  });
```
---

## editPrintFilter

修改打印模板筛选条件

### 参数

args.id  {string}    
args.filters  {array}  筛选条件  

```js
import { apis } from "mdye";

apis.worksheet.editPrintFilter(args)
  .then(res => {
    console.log(res);
  });
```
---

## editPrintTemplateSort

修改打印模板排序

### 参数

args.projectId  {string}    
args.worksheetId  {string}    
args.sortItems  {array}    

```js
import { apis } from "mdye";

apis.worksheet.editPrintTemplateSort(args)
  .then(res => {
    console.log(res);
  });
```
---

## deletePrint

删除打印模板

### 参数

args.id  {string}    

```js
import { apis } from "mdye";

apis.worksheet.deletePrint(args)
  .then(res => {
    console.log(res);
  });
```
---

## getRowIndexes

获取 工作表 索引字段配置

### 参数

args.worksheetId  {string}  工作表Id  

```js
import { apis } from "mdye";

apis.worksheet.getRowIndexes(args)
  .then(res => {
    console.log(res);
  });
```
---

## addRowIndex

新增 工作表行内容表索引

### 参数

args.worksheetId  {string}  工作表Id  
args.customeIndexName  {string}  自定义索引名称  
args.indexFields  {array}  索引字段  
args.uniqueIndex  {boolean}  是否 唯一索引  
args.wildcardIndex  {boolean}  是否 通配符文本索引  
args.sparseIndex  {boolean}  是否 稀疏索引  
args.backgroundIndex  {boolean}  是否 后台索引  
args.appId  {string}  AppId  

```js
import { apis } from "mdye";

apis.worksheet.addRowIndex(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateRowIndex

更新 工作表行内容表索引

### 参数

args.worksheetId  {string}  工作表Id  
args.customeIndexName  {string}  自定义索引名称  
args.indexFields  {array}  索引字段  
args.uniqueIndex  {boolean}  是否 唯一索引  
args.wildcardIndex  {boolean}  是否 通配符文本索引  
args.sparseIndex  {boolean}  是否 稀疏索引  
args.backgroundIndex  {boolean}  是否 后台索引  
args.indexConfigId  {string}  索引配置Id  
args.appId  {string}  AppId  
args.isSystemIndex  {boolean}  是否 系统级索引  
args.systemIndexName  {string}  系统级索引名称  

```js
import { apis } from "mdye";

apis.worksheet.updateRowIndex(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateRowIndexCustomeIndexName

更新 工作表行内容表索引名称

### 参数

args.appId  {string}  AppId  
args.worksheetId  {string}  工作表Id  
args.indexConfigId  {string}  索引配置Id  
args.customeIndexName  {string}  自定义索引名称  

```js
import { apis } from "mdye";

apis.worksheet.updateRowIndexCustomeIndexName(args)
  .then(res => {
    console.log(res);
  });
```
---

## removeRowIndex

移除 工作表行内容表索引

### 参数

args.appId  {string}  应用Id  
args.worksheetId  {string}  工作表Id  
args.indexConfigId  {string}  索引配置Id  
args.isSystemIndex  {boolean}  是否 系统级索引  
args.systemIndexName  {string}  系统级索引名称  

```js
import { apis } from "mdye";

apis.worksheet.removeRowIndex(args)
  .then(res => {
    console.log(res);
  });
```
---

## getLinkDetail

获取链接行记录

### 参数

args.ticket  {string}  验证码返票据  
args.randStr  {string}  票据随机字符串  
args.id  {string}    
args.password  {string}    

```js
import { apis } from "mdye";

apis.worksheet.getLinkDetail(args)
  .then(res => {
    console.log(res);
  });
```
---

## getFormSubmissionSettings

获取工作表创建记录表单提交设置信息

### 参数

args.workSheetId  {string}  工作表Id  
args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.worksheet.getFormSubmissionSettings(args)
  .then(res => {
    console.log(res);
  });
```
---

## editWorksheetSetting

更新工作表创建记录表单设置信息

### 参数

args.workSheetId  {string}  工作表id  
args.appId  {string}  应用id  
args.projectId  {string}  组织id  
args.advancedSetting  {object}  配置项数据  
args.editAdKeys  {array}  编辑AdvancedSetting属性keys  

```js
import { apis } from "mdye";

apis.worksheet.editWorksheetSetting(args)
  .then(res => {
    console.log(res);
  });
```
---

## getSwitch

获取功能系统开关配置

### 参数

args.worksheetId  {string}  工作表id  

```js
import { apis } from "mdye";

apis.worksheet.getSwitch(args)
  .then(res => {
    console.log(res);
  });
```
---

## editSwitch

更新系统配置开关（单个）

### 参数

args.worksheetId  {string}  工作表id  
args.state  {boolean}  开关  
args.viewIds  {array}    

```js
import { apis } from "mdye";

apis.worksheet.editSwitch(args)
  .then(res => {
    console.log(res);
  });
```
---

## batchEditSwitch

更新系统配置开关（批量）

### 参数

args.worksheetId  {string}  工作表id  
args.switchList  {array}    

```js
import { apis } from "mdye";

apis.worksheet.batchEditSwitch(args)
  .then(res => {
    console.log(res);
  });
```
---

## getSwitchPermit

获取功能系统开关（包含管理员判断）

### 参数

args.appId  {string}  应用管理员  
args.worksheetId  {string}  工作表id  

```js
import { apis } from "mdye";

apis.worksheet.getSwitchPermit(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetApiInfo

获取工作表信息

### 参数

args.worksheetId  {string}  工作表id  
args.appId  {string}  应用id  
args.version  {integer}  版本  1=v1  2=v2  

```js
import { apis } from "mdye";

apis.worksheet.getWorksheetApiInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## getCollectionsByAppId

获取应用下选项集

### 参数

args.collectionId  {string}    
args.collectionIds  {array}    
args.appId  {string}    
args.worksheetId  {string}    
args.options  {array}    
args.name  {string}    
args.colorful  {boolean}    
args.enableScore  {boolean}    
args.status  {integer}  0或者1：正常 9：停用,999：删除  

```js
import { apis } from "mdye";

apis.worksheet.getCollectionsByAppId(args)
  .then(res => {
    console.log(res);
  });
```
---

## saveOptionsCollection

保存选项集

### 参数

args.collectionId  {string}    
args.collectionIds  {array}    
args.appId  {string}    
args.worksheetId  {string}    
args.options  {array}    
args.name  {string}    
args.colorful  {boolean}    
args.enableScore  {boolean}    
args.status  {integer}  0或者1：正常 9：停用,999：删除  

```js
import { apis } from "mdye";

apis.worksheet.saveOptionsCollection(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateOptionsCollectionAppId

更新选项集所属应用

### 参数

args.collectionId  {string}    
args.collectionIds  {array}    
args.appId  {string}    
args.worksheetId  {string}    
args.options  {array}    
args.name  {string}    
args.colorful  {boolean}    
args.enableScore  {boolean}    
args.status  {integer}  0或者1：正常 9：停用,999：删除  

```js
import { apis } from "mdye";

apis.worksheet.updateOptionsCollectionAppId(args)
  .then(res => {
    console.log(res);
  });
```
---

## deleteOptionsCollection

删除选项集

### 参数

args.collectionId  {string}    
args.collectionIds  {array}    
args.appId  {string}    
args.worksheetId  {string}    
args.options  {array}    
args.name  {string}    
args.colorful  {boolean}    
args.enableScore  {boolean}    
args.status  {integer}  0或者1：正常 9：停用,999：删除  

```js
import { apis } from "mdye";

apis.worksheet.deleteOptionsCollection(args)
  .then(res => {
    console.log(res);
  });
```
---

## getCollectionByCollectId

获取选项集详细数据

### 参数

args.collectionId  {string}    
args.collectionIds  {array}    
args.appId  {string}    
args.worksheetId  {string}    
args.options  {array}    
args.name  {string}    
args.colorful  {boolean}    
args.enableScore  {boolean}    
args.status  {integer}  0或者1：正常 9：停用,999：删除  

```js
import { apis } from "mdye";

apis.worksheet.getCollectionByCollectId(args)
  .then(res => {
    console.log(res);
  });
```
---

## getCollectionsByCollectIds

批量获取选项集

### 参数

args.collectionId  {string}    
args.collectionIds  {array}    
args.appId  {string}    
args.worksheetId  {string}    
args.options  {array}    
args.name  {string}    
args.colorful  {boolean}    
args.enableScore  {boolean}    
args.status  {integer}  0或者1：正常 9：停用,999：删除  

```js
import { apis } from "mdye";

apis.worksheet.getCollectionsByCollectIds(args)
  .then(res => {
    console.log(res);
  });
```
---

## getQuoteControlsById

获取选项集引用的控件列表

### 参数

args.collectionId  {string}    
args.collectionIds  {array}    
args.appId  {string}    
args.worksheetId  {string}    
args.options  {array}    
args.name  {string}    
args.colorful  {boolean}    
args.enableScore  {boolean}    
args.status  {integer}  0或者1：正常 9：停用,999：删除  

```js
import { apis } from "mdye";

apis.worksheet.getQuoteControlsById(args)
  .then(res => {
    console.log(res);
  });
```
---

## addOrUpdateOptionSetApiInfo

获取添加选项接集接口信息

### 参数


```js
import { apis } from "mdye";

apis.worksheet.addOrUpdateOptionSetApiInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## optionSetListApiInfo

获取选项接集列表接口信息

### 参数


```js
import { apis } from "mdye";

apis.worksheet.optionSetListApiInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## ocr

工作表OCR识别

### 参数

args.worksheetId  {string}  工作表id  
args.controlId  {string}  ocr控件id  
args.data  {array}  ocr映射url数组(不管单个还是多个批量,都是数组)  

```js
import { apis } from "mdye";

apis.worksheet.ocr(args)
  .then(res => {
    console.log(res);
  });
```
---

## getQuery

get单个工作表查询

### 参数

args.id  {string}    

```js
import { apis } from "mdye";

apis.worksheet.getQuery(args)
  .then(res => {
    console.log(res);
  });
```
---

## getQueryBySheetId

worksheetId 批量获取工作表查询

### 参数

args.worksheetId  {string}    

```js
import { apis } from "mdye";

apis.worksheet.getQueryBySheetId(args)
  .then(res => {
    console.log(res);
  });
```
---

## saveQuery

保存工作表查询

### 参数

args.id  {string}  id 新建为空，修改传原值  
args.worksheetId  {string}  本表id  
args.controlId  {string}  默认值控件id  
args.sourceId  {string}  来源id （这里值得工作表id）  
args.sourceType  {integer}  1 = 本表，2 = 他表  
args.items  {array}  筛选条件  
args.configs  {array}  映射字段  
args.moreType  {integer}  0 = 获取第一条时，按配置来，1= 不赋值  
args.moreSort  {array}  排序  
args.queryCount  {integer}  查询条数  
args.resultType  {integer}  结果类型 0=查询到记录，1=仅查询到一条记录，2=查询到多条记录，3=未查询到记录  
args.eventType  {integer}  0 = 常规字段默认值，1 = 表单事件  

```js
import { apis } from "mdye";

apis.worksheet.saveQuery(args)
  .then(res => {
    console.log(res);
  });
```
---

## saveFiltersGroup

保存筛选组件

### 参数

args.filtersGroupId  {string}  筛选组件ID  
args.name  {string}  名称  
args.enableBtn  {boolean}  开启搜索按钮  
args.filters  {array}  filters  
args.advancedSetting  {object}  视图高级配置  
args.appId  {string}  应用ID  
args.filtersGroupIds  {array}  批量获取和删除使用  
args.pageId  {string}  自定义页面ID  

```js
import { apis } from "mdye";

apis.worksheet.saveFiltersGroup(args)
  .then(res => {
    console.log(res);
  });
```
---

## getFiltersGroupByIds

获取筛选组件

### 参数

args.filtersGroupId  {string}  筛选组件ID  
args.name  {string}  名称  
args.enableBtn  {boolean}  开启搜索按钮  
args.filters  {array}  filters  
args.advancedSetting  {object}  视图高级配置  
args.appId  {string}  应用ID  
args.filtersGroupIds  {array}  批量获取和删除使用  
args.pageId  {string}  自定义页面ID  

```js
import { apis } from "mdye";

apis.worksheet.getFiltersGroupByIds(args)
  .then(res => {
    console.log(res);
  });
```
---

## deleteFiltersGroupByIds

删除筛选组件

### 参数

args.filtersGroupId  {string}  筛选组件ID  
args.name  {string}  名称  
args.enableBtn  {boolean}  开启搜索按钮  
args.filters  {array}  filters  
args.advancedSetting  {object}  视图高级配置  
args.appId  {string}  应用ID  
args.filtersGroupIds  {array}  批量获取和删除使用  
args.pageId  {string}  自定义页面ID  

```js
import { apis } from "mdye";

apis.worksheet.deleteFiltersGroupByIds(args)
  .then(res => {
    console.log(res);
  });
```
---

## excuteApiQuery

执行api查询

### 参数

args.data  {object}  执行api查询数据  
args.projectId  {string}  组织id  
args.workSheetId  {string}  工作表id  
args.controlId  {string}  控件id  
args.apiTemplateId  {string}  api模板id  
args.apkId  {string}  应用id  
args.formId  {string}  公开表单id  
args.apiEventId  {string}  动作事件id（不传默认识别为api查询字段）  
args.authId  {string}  授权账户Id  
args.actionType  {integer}  事件执行类型 调用api 8 调用封装业务流程 13  

```js
import { apis } from "mdye";

apis.worksheet.excuteApiQuery(args)
  .then(res => {
    console.log(res);
  });
```
---

## getApiControlDetail

获取api模板消息信息

### 参数

args.apiTemplateId  {string}  api模板id  
args.type  {integer}  是否为请求参数模板 1-请求模板 2-响应模板 不传-请求响应  
args.actionType  {integer}  事件执行类型 调用api 8 调用封装业务流程 13  

```js
import { apis } from "mdye";

apis.worksheet.getApiControlDetail(args)
  .then(res => {
    console.log(res);
  });
```
---

## sortAttachment

更新附件排序

### 参数

args.worksheetId  {string}  表id  
args.rowId  {string}    
args.controlId  {string}  附件控件id  
args.viewId  {string}    
args.fileIds  {array}  附件ids（排好序的）  

```js
import { apis } from "mdye";

apis.worksheet.sortAttachment(args)
  .then(res => {
    console.log(res);
  });
```
---

## editAttachmentName

更新记录附件名

### 参数

args.worksheetId  {string}  工作表id  
args.rowId  {string}  行id  
args.viewId  {string}  视图Id  
args.appId  {string}  应用Id  
args.instanceId  {string}  流程实例id  
args.workId  {string}  运行节点id  
args.getTemplate  {boolean}  是否获取模板  
args.shareId  {string}  分享页获取关联记录iD  
args.checkView  {boolean}  是否验证视图  
args.relationWorksheetId  {string}  关联控件ID  
args.discussId  {string}  讨论ID  
args.fileId  {string}    
args.fileName  {string}    
args.controlId  {string}  附件的控件id  

```js
import { apis } from "mdye";

apis.worksheet.editAttachmentName(args)
  .then(res => {
    console.log(res);
  });
```
---

## getExportConfig

获取导出excel配置

### 参数

args.worksheetId  {string}    
args.viewId  {string}    

```js
import { apis } from "mdye";

apis.worksheet.getExportConfig(args)
  .then(res => {
    console.log(res);
  });
```
---

## saveExportConfig

保存导出配置

### 参数

args.worksheetId  {string}    
args.viewId  {string}    
args.exportExtIds  {array}  导出特殊列配置  
args.controlIds  {array}  需要导出的控件ids  
args.getColumnRpt  {boolean}  是否导出列统计  
args.edited  {boolean}  是否允许修改  
args.sortRelationCids  {array}  强制排序导出的关联控件id集合  
args.isNumber  {boolean}  控件是否以数值格式导出  

```js
import { apis } from "mdye";

apis.worksheet.saveExportConfig(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetCurrencyInfos

获取工作表币种类型

### 参数


```js
import { apis } from "mdye";

apis.worksheet.getWorksheetCurrencyInfos(args)
  .then(res => {
    console.log(res);
  });
```
---


---

# 应用管理

## addRole

添加角色

### 参数

args.appId  {string}  应用id  
args.name  {string}  名称  
args.hideAppForMembers  {boolean}  该角色成员不可见当前应用  
args.description  {string}  描述  
args.permissionWay  {integer}  角色类型（0:自定义、10:只读、50::成员、100:管理员）  
args.projectId  {string}  网络id  
args.sheets  {array}  工作表权限集合  
args.userIds  {array}  角色成员id集合  
args.pages  {array}  自定义页面  
args.extendAttrs  {array}  用户扩展权限字段  

```js
import { apis } from "mdye";

apis.appManagement.addRole(args)
  .then(res => {
    console.log(res);
  });
```
---

## removeRole

删除角色(并把人员移动到其他角色)

### 参数

args.appId  {string}  应用id  
args.roleId  {string}  角色id  
args.resultRoleId  {string}  目标角色id  
args.projectId  {string}  网络id  

```js
import { apis } from "mdye";

apis.appManagement.removeRole(args)
  .then(res => {
    console.log(res);
  });
```
---

## addRoleMembers

添加角色成员

### 参数

args.appId  {string}  应用id  
args.roleId  {string}  角色id  
args.userIds  {array}  用户  
args.departmentIds  {array}  部门  
args.departmentTreeIds  {array}  部门树  
args.projectOrganizeIds  {array}  网络角色  
args.jobIds  {array}  职位ids  
args.projectId  {string}  网络id  

```js
import { apis } from "mdye";

apis.appManagement.addRoleMembers(args)
  .then(res => {
    console.log(res);
  });
```
---

## removeRoleMembers

移除角色成员

### 参数

args.appId  {string}  应用id  
args.roleId  {string}  角色id  
args.selectAll  {boolean}  是否全选  
args.userIds  {array}  用户  
args.departmentIds  {array}  部门  
args.jobIds  {array}  职位  
args.departmentTreeIds  {array}  部门树  
args.projectOrganizeIds  {array}  网络角色  
args.projectId  {string}  网络id  

```js
import { apis } from "mdye";

apis.appManagement.removeRoleMembers(args)
  .then(res => {
    console.log(res);
  });
```
---

## setRoleCharger

设置 角色负责人

### 参数

args.appId  {string}  应用id  
args.roleId  {string}  角色id  
args.projectId  {string}  网络id  
args.memberId  {string}  成员Id（用户Id、部门Id、部门树的部门Id、职位Id、组织角色Id、全组织 的 组织Id）  
args.memberCategory  {integer}  成员类型（用户 = 10、部门 = 20、部门树 = 21、职位 = 30、组织角色 = 40、网络（全组织） = 50）  

```js
import { apis } from "mdye";

apis.appManagement.setRoleCharger(args)
  .then(res => {
    console.log(res);
  });
```
---

## cancelRoleCharger

取消设置 角色负责人

### 参数

args.appId  {string}  应用id  
args.roleId  {string}  角色id  
args.projectId  {string}  网络id  
args.memberId  {string}  成员Id（用户Id、部门Id、部门树的部门Id、职位Id、组织角色Id、全组织 的 组织Id）  
args.memberCategory  {integer}  成员类型（用户 = 10、部门 = 20、部门树 = 21、职位 = 30、组织角色 = 40、网络（全组织） = 50）  

```js
import { apis } from "mdye";

apis.appManagement.cancelRoleCharger(args)
  .then(res => {
    console.log(res);
  });
```
---

## quitAppForRole

退出应用单个角色

### 参数

args.appId  {string}  应用id  
args.roleId  {string}  角色id  

```js
import { apis } from "mdye";

apis.appManagement.quitAppForRole(args)
  .then(res => {
    console.log(res);
  });
```
---

## quitRole

退出应用下所有角色

### 参数

args.appId  {string}  应用id  
args.projectId  {string}  网络id  

```js
import { apis } from "mdye";

apis.appManagement.quitRole(args)
  .then(res => {
    console.log(res);
  });
```
---

## editAppRole

配置角色权限

### 参数

args.appId  {string}  应用id  
args.roleId  {string}  角色id  
args.projectId  {string}  网络id  

```js
import { apis } from "mdye";

apis.appManagement.editAppRole(args)
  .then(res => {
    console.log(res);
  });
```
---

## removeUserToRole

把人员移动到其他角色

### 参数

args.appId  {string}  应用id  
args.sourceAppRoleId  {string}  来源角色id  
args.resultAppRoleIds  {array}  目标角色id  
args.selectAll  {boolean}  是否全选  
args.userIds  {array}  用户id集合  
args.departmentIds  {array}  部门id集合  
args.jobIds  {array}  职位id集合  
args.projectId  {string}  网络id  
args.departmentTreeIds  {array}  部门树  
args.projectOrganizeIds  {array}  网络角色  

```js
import { apis } from "mdye";

apis.appManagement.removeUserToRole(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateMemberStatus

设置 开启/关闭 普通成员 是否可见角色列表

### 参数

args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.appManagement.updateMemberStatus(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateAppRoleNotify

设置 开启/关闭 应用角色通知

### 参数

args.appId  {string}  应用 Id  
args.notify  {boolean}  通知  

```js
import { apis } from "mdye";

apis.appManagement.updateAppRoleNotify(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateAppDebugModel

设置 开启/关闭 Debug模式

### 参数

args.appId  {string}  应用 Id  
args.isDebug  {boolean}  通知  

```js
import { apis } from "mdye";

apis.appManagement.updateAppDebugModel(args)
  .then(res => {
    console.log(res);
  });
```
---

## setDebugRoles

当前用户 设置调试的 角色

### 参数

args.appId  {string}  应用 Id  
args.roleIds  {array}  调试/模拟的 角色Ids（不传 则退出 调试）  

```js
import { apis } from "mdye";

apis.appManagement.setDebugRoles(args)
  .then(res => {
    console.log(res);
  });
```
---

## copyRole

复制角色

### 参数

args.appId  {string}  应用id  
args.roleId  {string}  角色id  
args.roleName  {string}  新角色名称  
args.copyPortalRole  {boolean}  是否是复制的外部门户角色  

```js
import { apis } from "mdye";

apis.appManagement.copyRole(args)
  .then(res => {
    console.log(res);
  });
```
---

## copyRoleToExternalPortal

复制角色到外部门户

### 参数

args.appId  {string}  应用id  
args.roleId  {string}  角色Id  
args.roleName  {string}  角色名称  

```js
import { apis } from "mdye";

apis.appManagement.copyRoleToExternalPortal(args)
  .then(res => {
    console.log(res);
  });
```
---

## copyExternalRolesToInternal

复制外部门户角色到内部

### 参数

args.appId  {string}  应用id  
args.roleId  {string}  角色Id  
args.roleName  {string}  角色名称  

```js
import { apis } from "mdye";

apis.appManagement.copyExternalRolesToInternal(args)
  .then(res => {
    console.log(res);
  });
```
---

## sortRoles

角色排序

### 参数

args.appId  {string}  应用id  
args.roleIds  {array}  排序后的角色ids  

```js
import { apis } from "mdye";

apis.appManagement.sortRoles(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppRoleSetting

获取 应用角色设置

### 参数

args.appId  {string}  应用id  
args.notOnSettingPage  {boolean}  不是在 配置页面（ 当为 ture 时，代表是在 前台/非管理 页面，此时 需要验证 角色负责人）  

```js
import { apis } from "mdye";

apis.appManagement.getAppRoleSetting(args)
  .then(res => {
    console.log(res);
  });
```
---

## getRolesWithUsers

获取 应用角色基本信息 列表（不含具体权限，包含  成员、职位等信息）

### 参数

args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.appManagement.getRolesWithUsers(args)
  .then(res => {
    console.log(res);
  });
```
---

## getSimpleRoles

获取 应用下所有角色信息（简要信息：含应用Id、角色Id、角色名称、是否为管理员）

### 参数

args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.appManagement.getSimpleRoles(args)
  .then(res => {
    console.log(res);
  });
```
---

## getTotalMember

分页获取 全部成员

### 参数

args.appId  {string}  应用Id  
args.pageIndex  {integer}  分页面码 = 默认1  
args.pageSize  {integer}  分页 页大小  
args.keywords  {string}  查询 关键词（现仅 支持 成员名称）  
args.searchMemberType  {integer}  搜索 成员类型（默认=0、用户/人员=10、部门=20，组织角色=30，职位=40）  
args.sort  {array}  排序参数  

```js
import { apis } from "mdye";

apis.appManagement.getTotalMember(args)
  .then(res => {
    console.log(res);
  });
```
---

## getRolesByMemberId

获取 成员的 角色Id和名称

### 参数

args.appId  {string}    
args.memberId  {string}    

```js
import { apis } from "mdye";

apis.appManagement.getRolesByMemberId(args)
  .then(res => {
    console.log(res);
  });
```
---

## getOutsourcingMembers

分页获取 外协成员

### 参数

args.appId  {string}  应用Id  
args.pageIndex  {integer}  分页面码 = 默认1  
args.pageSize  {integer}  分页 页大小  

```js
import { apis } from "mdye";

apis.appManagement.getOutsourcingMembers(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppRoleSummary

获取 角色列表（包含 我加入的角色标识）

### 参数

args.appId  {string}  应用Id  
args.allJoinRoles  {boolean}  查看所有加入的角色  

```js
import { apis } from "mdye";

apis.appManagement.getAppRoleSummary(args)
  .then(res => {
    console.log(res);
  });
```
---

## getDebugRoles

获取 调试模式 的可选角色

### 参数

args.appId  {string}  应用Id  

```js
import { apis } from "mdye";

apis.appManagement.getDebugRoles(args)
  .then(res => {
    console.log(res);
  });
```
---

## getMembersByRole

根据角色 分页获取 角色下的用户集

### 参数

args.appId  {string}  应用Id  
args.roleId  {string}  角色Id  
args.pageIndex  {integer}  分页面码 = 默认1  
args.pageSize  {integer}  分页 页大小  
args.keywords  {string}  查询 关键词（现仅 支持 成员名称）  
args.searchMemberType  {integer}  搜索 成员类型（默认=0、用户/人员=10、部门=20，组织角色=30，职位=40）  
args.sort  {array}  排序参数  （其中 FieldType值为： 默认[时间] = 0、时间 = 10、类型 = 20）  

```js
import { apis } from "mdye";

apis.appManagement.getMembersByRole(args)
  .then(res => {
    console.log(res);
  });
```
---

## batchEditMemberRole

批量编辑用户角色

### 参数

args.appId  {string}  应用Id  
args.dstRoleIds  {array}  目标角色Ids  
args.selectAll  {boolean}  是否全选  
args.isOutsourcing  {boolean}  是否全选外协  

```js
import { apis } from "mdye";

apis.appManagement.batchEditMemberRole(args)
  .then(res => {
    console.log(res);
  });
```
---

## batchMemberQuitApp

批量成员退出应用

### 参数

args.appId  {string}  应用Id  

```js
import { apis } from "mdye";

apis.appManagement.batchMemberQuitApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## getRoleDetail

获取应用下某个角色的具体权限信息

### 参数

args.appId  {string}  应用id  
args.roleId  {string}  角色id  
args.isPortal  {boolean}  是否外部门户 角色  

```js
import { apis } from "mdye";

apis.appManagement.getRoleDetail(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAddRoleTemplate

获取应用下所有工作表信息生成添加角色模板

### 参数

args.appId  {string}  应用id  
args.isPortal  {boolean}  是否外部门户 角色  

```js
import { apis } from "mdye";

apis.appManagement.getAddRoleTemplate(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppForManager

获取网络下用户为应用管理员的应用信息

### 参数

args.projectId  {string}  网络id  
args.containsLinks  {boolean}  是否包含链接类型  
args.getLock  {boolean}  是否获取锁定应用（默认不获取）  

```js
import { apis } from "mdye";

apis.appManagement.getAppForManager(args)
  .then(res => {
    console.log(res);
  });
```
---

## getManagerApps

网络下用户为管理员的应用集合

### 参数

args.projectId  {string}  网络id  
args.containsLinks  {boolean}  是否包含链接类型  

```js
import { apis } from "mdye";

apis.appManagement.getManagerApps(args)
  .then(res => {
    console.log(res);
  });
```
---

## refresh

刷新权限缓存

### 参数

args.appId  {string}  应用id  
args.tradeId  {string}  交易id  

```js
import { apis } from "mdye";

apis.appManagement.refresh(args)
  .then(res => {
    console.log(res);
  });
```
---

## getUserIdApps

获取以用户方式加入的应用

### 参数

args.projectId  {string}  组织id  
args.userId  {string}  交接用户id  

```js
import { apis } from "mdye";

apis.appManagement.getUserIdApps(args)
  .then(res => {
    console.log(res);
  });
```
---

## replaceRoleMemberForApps

交接应用角色

### 参数

args.projectId  {string}  组织id  
args.removeUserId  {string}  要移除的 用户Id  
args.addUserId  {string}  新添加的用户Id（可空，空时 = 仅移除）  
args.roles  {array}    

```js
import { apis } from "mdye";

apis.appManagement.replaceRoleMemberForApps(args)
  .then(res => {
    console.log(res);
  });
```
---

## getUserApp

组织下加入的应用

### 参数

args.projectId  {string}  网络id  
args.userId  {string}  用户id  

```js
import { apis } from "mdye";

apis.appManagement.getUserApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## getMyApp

我加入的应用

### 参数

args.projectId  {string}  组织id  
args.noCache  {boolean}  不走缓存  

```js
import { apis } from "mdye";

apis.appManagement.getMyApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppsForProject

获取网络下应用

### 参数

args.projectId  {string}  网络id  
args.status  {integer}  应用状态  0=关闭 1=启用  可空  
args.pageIndex  {integer}  页数（从1开始）  
args.pageSize  {integer}  每页显示数  
args.keyword  {string}  搜索关键字（支持名称和拥有者名称）  
args.sourceType  {integer}  来源 默认0=全部，2=过滤分发平台  
args.containsLinks  {boolean}  是否包含链接类型  
args.filterDBType  {integer}  数据筛选类型（0：全部，1= 默认数据库，2 =专属数据库，DbInstanceId传具体id）  
args.dbInstanceId  {string}  数据库实例id  
args.createrIds  {array}  创建者ids  

```js
import { apis } from "mdye";

apis.appManagement.getAppsForProject(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppsByProject

分页获取网络下应用信息

### 参数

args.projectId  {string}  网络id  
args.status  {integer}  应用状态  0=关闭 1=启用  可空  
args.pageIndex  {integer}  页数（从1开始）  
args.pageSize  {integer}  每页显示数  
args.keyword  {string}  搜索关键字（支持名称和拥有者名称）  
args.sourceType  {integer}  来源 默认0=全部，2=过滤分发平台  
args.containsLinks  {boolean}  是否包含链接类型  
args.filterDBType  {integer}  数据筛选类型（0：全部，1= 默认数据库，2 =专属数据库，DbInstanceId传具体id）  
args.dbInstanceId  {string}  数据库实例id  
args.createrIds  {array}  创建者ids  

```js
import { apis } from "mdye";

apis.appManagement.getAppsByProject(args)
  .then(res => {
    console.log(res);
  });
```
---

## getApps

获取应用信息（批量）

### 参数

args.appIds  {array}    

```js
import { apis } from "mdye";

apis.appManagement.getApps(args)
  .then(res => {
    console.log(res);
  });
```
---

## getToken

获取导出相关功能模块token

### 参数

args.worksheetId  {string}    
args.viewId  {string}    
args.projectId  {string}  网络id ，TokenType = 4或6时，这个必穿  

```js
import { apis } from "mdye";

apis.appManagement.getToken(args)
  .then(res => {
    console.log(res);
  });
```
---

## editAppStatus

更新应用状态

### 参数

args.appId  {string}  应用id（原应用包id）  
args.status  {integer}  状态  0=关闭 1=启用 2=删除  
args.projectId  {string}  网络id  

```js
import { apis } from "mdye";

apis.appManagement.editAppStatus(args)
  .then(res => {
    console.log(res);
  });
```
---

## checkIsAppAdmin

检测是否是网络后台应用管理员

### 参数

args.projectId  {string}  网络id  

```js
import { apis } from "mdye";

apis.appManagement.checkIsAppAdmin(args)
  .then(res => {
    console.log(res);
  });
```
---

## checkAppAdminForUser

验证用户是否在应用管理员中

### 参数

args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.appManagement.checkAppAdminForUser(args)
  .then(res => {
    console.log(res);
  });
```
---

## addRoleMemberForAppAdmin

把自己加入应用管理员(后台)

### 参数

args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.appManagement.addRoleMemberForAppAdmin(args)
  .then(res => {
    console.log(res);
  });
```
---

## removeWorkSheetAscription

移动分组下项到另外一个分组（如果是同一应用下应用id相同即可）

### 参数

args.sourceAppId  {string}  来源应用id  
args.resultAppId  {string}  目标应用id  
args.sourceAppSectionId  {string}  来源应用分组id  
args.resultAppSectionId  {string}  目标应用分组id  
args.workSheetsInfo  {array}  基础信息集合  

```js
import { apis } from "mdye";

apis.appManagement.removeWorkSheetAscription(args)
  .then(res => {
    console.log(res);
  });
```
---

## removeWorkSheetForApp

删除应用分组下项(工作表，自定义页面)

### 参数

args.appId  {string}  应用id  
args.projectId  {string}  组织id  
args.appSectionId  {string}  应用分组id  
args.workSheetId  {string}  id  
args.type  {integer}  类型 0=工作表，1=自定义页面  
args.isPermanentlyDelete  {boolean}  是否永久删除 true-表示永久删除 false-表示到回收站  

```js
import { apis } from "mdye";

apis.appManagement.removeWorkSheetForApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppItemRecoveryList

分页获取应用项回收站列表

### 参数

args.pageIndex  {integer}  当前页  
args.pageSize  {integer}  页大小  
args.projectId  {string}  组织id  
args.appId  {string}  应用id  
args.keyword  {string}  关键字搜索  

```js
import { apis } from "mdye";

apis.appManagement.getAppItemRecoveryList(args)
  .then(res => {
    console.log(res);
  });
```
---

## appItemRecovery

@param {Object} args 请求参数

### 参数

args.id  {string}  应用项回收站记录id  
args.projectId  {string}  组织id  
args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.appManagement.appItemRecovery(args)
  .then(res => {
    console.log(res);
  });
```
---

## editWorkSheetInfoForApp

修改分组下实体名称和图标

### 参数

args.appId  {string}  应用id  
args.appSectionId  {string}  应用分组id  
args.workSheetId  {string}  id  
args.workSheetName  {string}  名称  
args.icon  {string}  图标  
args.type  {integer}  类型  
args.urlTemplate  {string}  链接  
args.configuration  {object}  链接配置  
args.resume  {string}  摘要  

```js
import { apis } from "mdye";

apis.appManagement.editWorkSheetInfoForApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateAppOwner

变更应用拥有者

### 参数

args.appId  {string}  应用id  
args.memberId  {string}  新的应用拥有者  

```js
import { apis } from "mdye";

apis.appManagement.updateAppOwner(args)
  .then(res => {
    console.log(res);
  });
```
---

## addWorkSheet

应用分组下新增项

### 参数

args.appId  {string}  应用id  
args.appSectionId  {string}  SectionId  
args.name  {string}  名称  
args.icon  {string}  Logo  
args.type  {integer}  类型 0=工作表 1=自定义页面  
args.createType  {integer}  创建类型（创建自定义页面得时候需要传）0-表示普通 1-表示外部链接  
args.urlTemplate  {string}  链接  
args.configuration  {object}  链接配置  

```js
import { apis } from "mdye";

apis.appManagement.addWorkSheet(args)
  .then(res => {
    console.log(res);
  });
```
---

## addSheet

新增工作表（级联数据源及子表）

### 参数

args.worksheetId  {string}  原始工作表id  
args.name  {string}    
args.worksheetType  {integer}  1：普通表 2：子表  
args.createLayer  {boolean}  直接创建层级视图  

```js
import { apis } from "mdye";

apis.appManagement.addSheet(args)
  .then(res => {
    console.log(res);
  });
```
---

## changeSheet

转换工作表

### 参数

args.sourceWorksheetId  {string}  来源工作表id  
args.worksheetId  {string}  子表id  
args.name  {string}  子表名称  

```js
import { apis } from "mdye";

apis.appManagement.changeSheet(args)
  .then(res => {
    console.log(res);
  });
```
---

## copyCustomPage

复制自定义页面

### 参数

args.appId  {string}  应用id  
args.appSectionId  {string}  SectionId  
args.name  {string}  名称  
args.id  {string}  自定义页面id  

```js
import { apis } from "mdye";

apis.appManagement.copyCustomPage(args)
  .then(res => {
    console.log(res);
  });
```
---

## addAuthorize

新增应用授权

### 参数

args.appId  {string}  应用id  
args.name  {string}  名称  
args.type  {integer}  权限范围类型 1=全部，2=只读，10=自定义  
args.viewNull  {boolean}  不传视图id不返回数据配置  
args.sheets  {array}  工作表权限集（内含视图权限）  

```js
import { apis } from "mdye";

apis.appManagement.addAuthorize(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAuthorizes

获取应用授权

### 参数

args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.appManagement.getAuthorizes(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAuthorizeSheet

获取单个授权的工作表配置

### 参数

args.appId  {string}  应用id  
args.appKey  {string}  应用key  

```js
import { apis } from "mdye";

apis.appManagement.getAuthorizeSheet(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAuthorizeSheetTemple

新增授权是获取工作表配置模板

### 参数

args.appId  {string}  AppId  
args.customLink  {string}  客户自定义登录链接参数值  

```js
import { apis } from "mdye";

apis.appManagement.getAuthorizeSheetTemple(args)
  .then(res => {
    console.log(res);
  });
```
---

## editAuthorizeStatus

编辑应用授权类型

### 参数

args.appId  {string}  应用id  
args.appKey  {string}  应用key  
args.name  {string}  名称  
args.type  {integer}  权限范围类型 1=全部，2=只读  
args.viewNull  {boolean}  不传视图id不返回数据配置  
args.status  {integer}  授权状态 1-开启 2-关闭 3-删除  
args.sheets  {array}  工作表权限集（内含视图权限）  

```js
import { apis } from "mdye";

apis.appManagement.editAuthorizeStatus(args)
  .then(res => {
    console.log(res);
  });
```
---

## deleteAuthorizeStatus

删除应用授权类型

### 参数

args.appId  {string}  应用id  
args.appKey  {string}  应用key  

```js
import { apis } from "mdye";

apis.appManagement.deleteAuthorizeStatus(args)
  .then(res => {
    console.log(res);
  });
```
---

## editAuthorizeRemark

编辑备注

### 参数

args.appId  {string}    
args.appKey  {string}    
args.remark  {string}  备注  

```js
import { apis } from "mdye";

apis.appManagement.editAuthorizeRemark(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWeiXinBindingInfo

获取绑定的微信公众号信息

### 参数

args.appId  {string}  AppId  
args.customLink  {string}  客户自定义登录链接参数值  

```js
import { apis } from "mdye";

apis.appManagement.getWeiXinBindingInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## migrate

迁移应用

### 参数

args.appId  {string}  应用id  
args.dbInstanceId  {string}  专属数据库id (迁出为空）  
args.projectId  {string}  组织id  

```js
import { apis } from "mdye";

apis.appManagement.migrate(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppApplyInfo

获取当前应用的的申请信息

### 参数

args.appId  {string}  应用id  
args.pageIndex  {integer}  页码  
args.size  {integer}  页大小  

```js
import { apis } from "mdye";

apis.appManagement.getAppApplyInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## addAppApply

申请加入应用

### 参数

args.appId  {string}  应用id  
args.remark  {string}  申请说明  

```js
import { apis } from "mdye";

apis.appManagement.addAppApply(args)
  .then(res => {
    console.log(res);
  });
```
---

## editAppApplyStatus

更新应用申请状态

### 参数

args.ids  {array}  申请信息的id  
args.appId  {string}  应用id  
args.status  {integer}  状态 2=通过，3=拒绝  
args.roleId  {string}  角色id（拒绝时可空）  
args.remark  {string}  备注，拒绝理由  

```js
import { apis } from "mdye";

apis.appManagement.editAppApplyStatus(args)
  .then(res => {
    console.log(res);
  });
```
---

## getIcon

获取icon（包含系统和自定义）

### 参数

args.fileNames  {array}  自定义图标名称  
args.projectId  {string}  网络id  
args.isLine  {boolean}  线性图标或者面性图标 true表示线性，false表示面性，默认值为true  
args.iconType  {boolean}  图标类型 true-表示系统图标 false-自定义图标  
args.categories  {array}  分类数组  

```js
import { apis } from "mdye";

apis.appManagement.getIcon(args)
  .then(res => {
    console.log(res);
  });
```
---

## addCustomIcon

添加自定义图标

### 参数

args.projectId  {string}  网络id  
args.data  {array}  icon数据  

```js
import { apis } from "mdye";

apis.appManagement.addCustomIcon(args)
  .then(res => {
    console.log(res);
  });
```
---

## deleteCustomIcon

删除自定义图标

### 参数

args.fileNames  {array}  自定义图标名称  
args.projectId  {string}  网络id  
args.isLine  {boolean}  线性图标或者面性图标 true表示线性，false表示面性，默认值为true  
args.iconType  {boolean}  图标类型 true-表示系统图标 false-自定义图标  
args.categories  {array}  分类数组  

```js
import { apis } from "mdye";

apis.appManagement.deleteCustomIcon(args)
  .then(res => {
    console.log(res);
  });
```
---

## getCustomIconByProject

获取自定义图标

### 参数

args.fileNames  {array}  自定义图标名称  
args.projectId  {string}  网络id  
args.isLine  {boolean}  线性图标或者面性图标 true表示线性，false表示面性，默认值为true  
args.iconType  {boolean}  图标类型 true-表示系统图标 false-自定义图标  
args.categories  {array}  分类数组  

```js
import { apis } from "mdye";

apis.appManagement.getCustomIconByProject(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppsCategoryInfo

获取分类和首页信息

### 参数

args.isCategory  {boolean}  是否只加载分类信息  

```js
import { apis } from "mdye";

apis.appManagement.getAppsCategoryInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppsLibraryInfo

获取分类下应用库模板列表

### 参数

args.categoryId  {string}  分类id  

```js
import { apis } from "mdye";

apis.appManagement.getAppsLibraryInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## installApp

安装应用

### 参数

args.libraryId  {string}  应用库id  
args.projectId  {string}  网络id  

```js
import { apis } from "mdye";

apis.appManagement.installApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppLibraryDetail

获取单个应用库模板详情

### 参数

args.libraryId  {string}  应用库id  
args.projectId  {string}  网络ud  

```js
import { apis } from "mdye";

apis.appManagement.getAppLibraryDetail(args)
  .then(res => {
    console.log(res);
  });
```
---

## getLibraryToken

获取应用库FileUrl Token

### 参数

args.libraryId  {string}    
args.projectId  {string}  安装目标网络id  

```js
import { apis } from "mdye";

apis.appManagement.getLibraryToken(args)
  .then(res => {
    console.log(res);
  });
```
---

## getLogs

获取日志

### 参数

args.projectId  {string}    
args.keyword  {string}  搜索关键字  
args.handleType  {integer}  操作类型 1=创建 2=开启 3=关闭 4=删除 5=导出 6=导入  
args.start  {string}  开始时间  
args.end  {string}  结束时间  
args.pageIndex  {integer}    
args.pageSize  {integer}    

```js
import { apis } from "mdye";

apis.appManagement.getLogs(args)
  .then(res => {
    console.log(res);
  });
```
---

## getExportsByApp

获取导出记录

### 参数

args.appId  {string}    
args.pageIndex  {integer}    
args.pageSize  {integer}    

```js
import { apis } from "mdye";

apis.appManagement.getExportsByApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## getExportPassword

导出密码

### 参数

args.id  {string}  日志id  
args.appId  {string}  应用id  
args.passwordType  {integer}  0 = 导出密码，1 = 锁定密码  

```js
import { apis } from "mdye";

apis.appManagement.getExportPassword(args)
  .then(res => {
    console.log(res);
  });
```
---

## addWorkflow

创建工作流CSM

### 参数

args.projectId  {string}  网络id  
args.name  {string}  实体名称  

```js
import { apis } from "mdye";

apis.appManagement.addWorkflow(args)
  .then(res => {
    console.log(res);
  });
```
---

## getEntityShare

获取应用实体分享信息

### 参数

args.sourceId  {string}  分享来源id （页面id，图标id等）  
args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.appManagement.getEntityShare(args)
  .then(res => {
    console.log(res);
  });
```
---

## editEntityShareStatus

修改应用实体分享信息

### 参数

args.sourceId  {string}  分享来源id （页面id，图标id等）  
args.sourceType  {integer}  分享类型  21 =自定义页面，31 = 图表  
args.status  {integer}  状态  0 = 关闭，1 =启用  
args.password  {string}  密码  
args.validTime  {string}  有效时间  
args.pageTitle  {string}  页面标题  

```js
import { apis } from "mdye";

apis.appManagement.editEntityShareStatus(args)
  .then(res => {
    console.log(res);
  });
```
---

## getEntityShareById

获取分享基础信息

### 参数

args.ticket  {string}  验证码返票据  
args.randStr  {string}  票据随机字符串  
args.id  {string}  分享id  
args.password  {string}  密码  
args.clientId  {string}  客户端id  

```js
import { apis } from "mdye";

apis.appManagement.getEntityShareById(args)
  .then(res => {
    console.log(res);
  });
```
---

## deleteBackupFile

删除应用备份文件

### 参数

args.projectId  {string}    
args.appId  {string}  应用id  
args.id  {string}  应用备份操作日志Id  
args.fileName  {string}  应用备份的文件名  

```js
import { apis } from "mdye";

apis.appManagement.deleteBackupFile(args)
  .then(res => {
    console.log(res);
  });
```
---

## pageGetBackupRestoreOperationLog

分页获取应用备份还原操作日志

### 参数

args.pageIndex  {integer}  当前页  
args.pageSize  {integer}  页大小  
args.projectId  {string}  组织id  
args.appId  {string}  应用Id  
args.isBackup  {boolean}  是否为获取备份文件列表，true表示获取备份文件列表，false表示获取操作日志列表  
args.accountId  {string}  操作人  
args.startTime  {string}  开始时间  
args.endTime  {string}  结束时间  

```js
import { apis } from "mdye";

apis.appManagement.pageGetBackupRestoreOperationLog(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppSupportInfo

获取应用数量信息

### 参数

args.appId  {string}  AppId  
args.customLink  {string}  客户自定义登录链接参数值  

```js
import { apis } from "mdye";

apis.appManagement.getAppSupportInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## renameBackupFileName

重命名应用备份文件

### 参数

args.projectId  {string}    
args.appId  {string}  应用id  
args.id  {string}  应用备份操作日志Id  
args.fileName  {string}  备份新名称  
args.fileOldName  {string}  备份新名称  

```js
import { apis } from "mdye";

apis.appManagement.renameBackupFileName(args)
  .then(res => {
    console.log(res);
  });
```
---

## getValidBackupFileInfo

获取有效备份文件信息

### 参数

args.projectId  {string}    
args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.appManagement.getValidBackupFileInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## restore

还原应用

### 参数

args.projectId  {string}  组织id  
args.appId  {string}  应用id  
args.id  {string}  备份还原操作日志id  
args.autoEndMaintain  {boolean}  是否自动结束应用维护状态  
args.backupCurrentVersion  {boolean}  备份当前版本  
args.isRestoreNew  {boolean}  是否还原为新应用  
args.containData  {boolean}  是否还原数据  
args.fileUrl  {string}  文件链接  
args.fileName  {string}  文件名称  
args.dbInstanceId  {string}  数据库实例id  

```js
import { apis } from "mdye";

apis.appManagement.restore(args)
  .then(res => {
    console.log(res);
  });
```
---

## restoreData

还原数据

### 参数

args.id  {string}  任务id  
args.projectId  {string}  组织id  
args.appId  {string}  应用id  
args.fileUrl  {string}  文件链接  
args.fileName  {string}  文件名称  
args.backupCurrentVersion  {boolean}  备份当前版本  
args.dbInstanceId  {string}  数据库实例id  

```js
import { apis } from "mdye";

apis.appManagement.restoreData(args)
  .then(res => {
    console.log(res);
  });
```
---

## backup

备份应用

### 参数

args.appId  {string}  应用Id  
args.containData  {boolean}  是否备份数据  

```js
import { apis } from "mdye";

apis.appManagement.backup(args)
  .then(res => {
    console.log(res);
  });
```
---

## checkRestoreFile

校验还原文件

### 参数

args.appId  {string}  应用id  
args.fileUrl  {string}  文件url  
args.fileName  {string}  文件名称  

```js
import { apis } from "mdye";

apis.appManagement.checkRestoreFile(args)
  .then(res => {
    console.log(res);
  });
```
---

## getTarTaskInfo

获取tar文件上传状态

### 参数

args.id  {string}  任务id  

```js
import { apis } from "mdye";

apis.appManagement.getTarTaskInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## allUsageOverviewStatistics

使用情况统计分析

### 参数

args.projectId  {string}  组织id  
args.departmentId  {string}  部门id  
args.depFlag  {boolean}  true表示仅当强部门，false表示部门树  
args.appId  {string}  应用id  
args.dayRange  {integer}  天数范围 0 = 最近7天，1 = 最近一个月，2=最近一个季度，3=最近半年，4=最近一年  
args.dateDemension  {string}  &#34;1h&#34;:1小时 &#34;1d&#34;:1天 &#34;1w&#34;:1周 &#34;1M&#34;:1月 &#34;1q&#34;:1季度 &#34;1y&#34;:1年  
args.isApp  {boolean}  表示是否是应用的使用分析  

```js
import { apis } from "mdye";

apis.appManagement.allUsageOverviewStatistics(args)
  .then(res => {
    console.log(res);
  });
```
---

## appUsageOverviewStatistics

应用汇总概览

### 参数

args.projectId  {string}  组织id  
args.keyWord  {string}  关键字搜索  
args.pageIndex  {integer}  当前页  
args.pageSize  {integer}  页大小  
args.sortFiled  {string}  排序字段  
args.sorted  {boolean}  排序方式 true--asc false--desc  
args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.appManagement.appUsageOverviewStatistics(args)
  .then(res => {
    console.log(res);
  });
```
---

## usageStatisticsForDimension

不同维度使用情况统计(按应用，按成员)

### 参数

args.projectId  {string}  组织id  
args.dayRange  {integer}  天数范围 0 = 最近7天，1 = 最近一个月，2=最近一个季度，3=最近半年，4=最近一年  
args.pageIndex  {integer}  当前页  
args.pageSize  {integer}  页大小  
args.dimension  {integer}  维度 1-应用 2-用户  
args.sortFiled  {string}  排序字段（返回结果的列名，例如:appAccess）  
args.sorted  {boolean}  排序方式  
args.keyword  {string}  关键词查询  
args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.appManagement.usageStatisticsForDimension(args)
  .then(res => {
    console.log(res);
  });
```
---

## getGlobalLogs

获取应用日志

### 参数

args.projectId  {string}  组织id  
args.operators  {array}  操作人id数组  
args.appIds  {array}  应用id数组  
args.worksheetIds  {array}  工作表id数组  
args.modules  {array}  所属日志模块  
args.operationTypes  {array}  操作类型  
args.pageIndex  {integer}  当前页  
args.pageSize  {integer}  页大小  
args.columnNames  {array}  列名称  
args.menuName  {string}  菜单名称  
args.startDateTime  {string}  开始时间  
args.endDateTime  {string}  结束时间  
args.confirmExport  {boolean}  是否确认导出(超量的情况下传)  
args.isSingle  {boolean}  是否是单个应用  

```js
import { apis } from "mdye";

apis.appManagement.getGlobalLogs(args)
  .then(res => {
    console.log(res);
  });
```
---

## getArchivedGlobalLogs

归档日志查询

### 参数

args.projectId  {string}  组织id  
args.operators  {array}  操作人id数组  
args.appIds  {array}  应用id数组  
args.worksheetIds  {array}  工作表id数组  
args.modules  {array}  所属日志模块  
args.operationTypes  {array}  操作类型  
args.pageIndex  {integer}  当前页  
args.pageSize  {integer}  页大小  
args.columnNames  {array}  列名称  
args.menuName  {string}  菜单名称  
args.startDateTime  {string}  开始时间  
args.endDateTime  {string}  结束时间  
args.confirmExport  {boolean}  是否确认导出(超量的情况下传)  
args.isSingle  {boolean}  是否是单个应用  
args.archivedId  {string}  归档id  

```js
import { apis } from "mdye";

apis.appManagement.getArchivedGlobalLogs(args)
  .then(res => {
    console.log(res);
  });
```
---

## getArchivedList

获取归档

### 参数

args.projectId  {string}    
args.appId  {string}    

```js
import { apis } from "mdye";

apis.appManagement.getArchivedList(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetsUnderTheApp

获取应用下工作表信息

### 参数

args.projectId  {string}  组织id  
args.appIds  {array}  应用ids  
args.isFilterCustomPage  {boolean}  是否过滤自定义页面  

```js
import { apis } from "mdye";

apis.appManagement.getWorksheetsUnderTheApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## addLock

开启密码锁

### 参数

args.ticket  {string}  验证码返票据  
args.randStr  {string}  票据随机字符串  
args.clientId  {string}  客户端标识  
args.appId  {string}    
args.password  {string}    

```js
import { apis } from "mdye";

apis.appManagement.addLock(args)
  .then(res => {
    console.log(res);
  });
```
---

## unlock

map解锁

### 参数

args.ticket  {string}  验证码返票据  
args.randStr  {string}  票据随机字符串  
args.clientId  {string}  客户端标识  
args.appId  {string}    
args.password  {string}    

```js
import { apis } from "mdye";

apis.appManagement.unlock(args)
  .then(res => {
    console.log(res);
  });
```
---

## editLockPassword

修改锁定密码

### 参数

args.ticket  {string}  验证码返票据  
args.randStr  {string}  票据随机字符串  
args.clientId  {string}  客户端标识  
args.appId  {string}    
args.password  {string}    
args.newPassword  {string}    

```js
import { apis } from "mdye";

apis.appManagement.editLockPassword(args)
  .then(res => {
    console.log(res);
  });
```
---

## resetLock

重新锁定

### 参数

args.ticket  {string}  验证码返票据  
args.randStr  {string}  票据随机字符串  
args.clientId  {string}  客户端标识  
args.appId  {string}  应用id  
args.getSection  {boolean}  是否获取分组信息  
args.getManager  {boolean}  是否获取管理员列表信息  
args.getProject  {boolean}  获取组织信息  
args.getLang  {boolean}  是否获取应用语种信息  
args.isMobile  {boolean}  是否是移动端  

```js
import { apis } from "mdye";

apis.appManagement.resetLock(args)
  .then(res => {
    console.log(res);
  });
```
---

## closeLock

关闭应用锁

### 参数

args.ticket  {string}  验证码返票据  
args.randStr  {string}  票据随机字符串  
args.clientId  {string}  客户端标识  
args.appId  {string}  应用id  
args.getSection  {boolean}  是否获取分组信息  
args.getManager  {boolean}  是否获取管理员列表信息  
args.getProject  {boolean}  获取组织信息  
args.getLang  {boolean}  是否获取应用语种信息  
args.isMobile  {boolean}  是否是移动端  

```js
import { apis } from "mdye";

apis.appManagement.closeLock(args)
  .then(res => {
    console.log(res);
  });
```
---

## marketAppUpgrade

市场已安装应用升级校验

### 参数

args.tradeId  {string}  已购应用详情id  
args.id  {string}  历史版本id  

```js
import { apis } from "mdye";

apis.appManagement.marketAppUpgrade(args)
  .then(res => {
    console.log(res);
  });
```
---

## marketUpgrade

执行市场已安装应用升级

### 参数

args.id  {string}  批次id  
args.worksheets  {array}  勾选的升级的表  
args.workflows  {array}  勾选升级的流  
args.pages  {array}  勾选升级的页面  
args.roles  {array}  勾选升级的角色  
args.backupCurrentVersion  {boolean}  备份当前版本  
args.matchOffice  {boolean}  是否匹配用户  
args.upgradeStyle  {boolean}  是否升级应用外观导航  
args.upgradeLang  {boolean}  是否升级语言  
args.upgradeTimeZone  {boolean}  是否升级时区  
args.upgradeName  {boolean}  是否升级名称  
args.upgradeHide  {boolean}  是否升级显影配置  

```js
import { apis } from "mdye";

apis.appManagement.marketUpgrade(args)
  .then(res => {
    console.log(res);
  });
```
---

## checkUpgrade

校验升级文件

### 参数

args.appId  {string}  应用id  
args.url  {string}  文件url  
args.password  {string}  密码  
args.fileName  {string}  文件名  
args.batchId  {string}  批量导入升级的批次id  

```js
import { apis } from "mdye";

apis.appManagement.checkUpgrade(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetUpgrade

获取表升级详情

### 参数

args.id  {string}    
args.worksheetId  {string}  工作表id  
args.appId  {string}    
args.batchId  {string}  批量升级批次id  

```js
import { apis } from "mdye";

apis.appManagement.getWorksheetUpgrade(args)
  .then(res => {
    console.log(res);
  });
```
---

## upgrade

升级

### 参数

args.id  {string}  批次id  
args.appId  {string}  应用id  
args.url  {string}  导入文件链接（不带token的）  
args.worksheets  {array}  勾选的升级的表  
args.workflows  {array}  勾选升级的流  
args.pages  {array}  勾选升级的页面  
args.roles  {array}  勾选升级的角色  
args.backupCurrentVersion  {boolean}  备份当前版本  
args.matchOffice  {boolean}  是否匹配用户  
args.upgradeStyle  {boolean}  是否升级应用外观导航  
args.upgradeLang  {boolean}  是否升级语言  
args.upgradeTimeZone  {boolean}  是否升级时区  
args.upgradeName  {boolean}  是否升级名称  
args.upgradeHide  {boolean}  是否升级显影配置  

```js
import { apis } from "mdye";

apis.appManagement.upgrade(args)
  .then(res => {
    console.log(res);
  });
```
---

## getUpgradeLogs

获取应用升级记录

### 参数

args.appId  {string}  应用id  
args.tradeId  {string}  交易id  

```js
import { apis } from "mdye";

apis.appManagement.getUpgradeLogs(args)
  .then(res => {
    console.log(res);
  });
```
---

## getMdyInfo

获取mdy文件相关密码

### 参数

args.projectId  {string}  组织id  
args.url  {string}  文件url不带token  
args.name  {string}  文件名称  

```js
import { apis } from "mdye";

apis.appManagement.getMdyInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## batchExportApp

批量导出应用

### 参数

args.projectId  {string}  组织id  
args.password  {string}  密码  
args.locked  {boolean}  是否加锁  
args.lockPassword  {string}  锁密码  
args.appConfigs  {array}  导出应用配置  

```js
import { apis } from "mdye";

apis.appManagement.batchExportApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## getsByUnionId

获取组织下同源应用列表

### 参数

args.projectId  {string}  网络id  
args.unionId  {string}  同源id  
args.status  {integer}  应用状态  0=关闭 1=启用  （可空 ，不传查全部）  
args.pageIndex  {integer}  页数（从1开始）  
args.pageSize  {integer}  每页显示数  
args.keyword  {string}  搜索关键字（支持名称和拥有者名称）  
args.filterDBType  {integer}  数据筛选类型（0：全部，1= 默认数据库，2 =专属数据库，DbInstanceId传具体id）  
args.dbInstanceId  {string}  数据库实例id  
args.excludeAppIds  {array}  需要排除的应用id数组  

```js
import { apis } from "mdye";

apis.appManagement.getsByUnionId(args)
  .then(res => {
    console.log(res);
  });
```
---

## getBatchId

获取批量导入升级批次id

### 参数

args.projectId  {string}  组织id  

```js
import { apis } from "mdye";

apis.appManagement.getBatchId(args)
  .then(res => {
    console.log(res);
  });
```
---

## batchImportCheck

校验批量升级mdy文件

### 参数

args.projectId  {string}  组织id  
args.batchId  {string}    
args.url  {string}  mdy链接（不要带token）  
args.password  {string}  mdy密码  
args.removed  {boolean}  是否是移除mdy操作  

```js
import { apis } from "mdye";

apis.appManagement.batchImportCheck(args)
  .then(res => {
    console.log(res);
  });
```
---

## batchImport

批量导入升级

### 参数

args.projectId  {string}  组织id  
args.batchId  {string}  批次id  
args.datas  {array}  批量导入升级业务数据  
args.matchOffice  {boolean}  是否匹配组织人员等信息  
args.backupCurrentVersion  {boolean}  是否备份当前应用  
args.upgradeStyle  {boolean}  是否升级应用外观导航  
args.upgradeLang  {boolean}  是否升级语言  
args.upgradeTimeZone  {boolean}  是否升级时区  
args.upgradeName  {boolean}  是否升级名称  
args.upgradeHide  {boolean}  是否升级显影配置  

```js
import { apis } from "mdye";

apis.appManagement.batchImport(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppLangs

获取应用语种列表

### 参数

args.appId  {string}  应用id  
args.projectId  {string}  应用id  

```js
import { apis } from "mdye";

apis.appManagement.getAppLangs(args)
  .then(res => {
    console.log(res);
  });
```
---

## createAppLang

创建应用语言

### 参数

args.appId  {string}  应用id  
args.langCode  {array}  应用语种数组  
args.projectId  {string}    

```js
import { apis } from "mdye";

apis.appManagement.createAppLang(args)
  .then(res => {
    console.log(res);
  });
```
---

## deleteAppLang

删除应用语言

### 参数

args.appId  {string}  应用id  
args.id  {string}  应用语种id  
args.projectId  {string}    

```js
import { apis } from "mdye";

apis.appManagement.deleteAppLang(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppLangDetail

获取应用语言详情

### 参数

args.appId  {string}    
args.appLangId  {string}    

```js
import { apis } from "mdye";

apis.appManagement.getAppLangDetail(args)
  .then(res => {
    console.log(res);
  });
```
---

## editAppLang

编辑应用语言详情

### 参数

args.appId  {string}  应用id  
args.langId  {string}  语种id  
args.id  {string}  节点id  
args.parentId  {string}  父级节点id  
args.correlationId  {string}  关联id(应用id，分组id，工作表id等等)  
args.data  {object}  翻译数据  
args.projectId  {string}    

```js
import { apis } from "mdye";

apis.appManagement.editAppLang(args)
  .then(res => {
    console.log(res);
  });
```
---

## machineTranslation

机器翻译

### 参数

args.appId  {string}  应用id  
args.comparisonLangId  {string}  对照语种id  
args.targetLangId  {string}  目标语种id  
args.projectId  {string}  组织id  

```js
import { apis } from "mdye";

apis.appManagement.machineTranslation(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppStructureForER

@param {Object} args 请求参数

### 参数

args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.appManagement.getAppStructureForER(args)
  .then(res => {
    console.log(res);
  });
```
---

## getProjectLangs

获取组织语言

### 参数

args.projectId  {string}  组织id  
args.correlationIds  {array}  业务模块id（不需要筛选业务，不传就行）  
args.type  {integer}  业务模块，0 = 组织名称，20 = 应用分组（不需要筛选业务，不传就行），30 = 密码提示  

```js
import { apis } from "mdye";

apis.appManagement.getProjectLangs(args)
  .then(res => {
    console.log(res);
  });
```
---

## getsByProjectIds

批量获取业务类型组织语言

### 参数

args.projectIds  {array}    
args.type  {integer}  业务模块，0 = 组织名称，20 = 应用分组  

```js
import { apis } from "mdye";

apis.appManagement.getsByProjectIds(args)
  .then(res => {
    console.log(res);
  });
```
---

## editProjectLangs

编辑组织语言

### 参数

args.projectId  {string}  组织id  
args.correlationId  {string}  业务模块id  
args.type  {integer}  业务模块，0 = 组织名称，20 = 应用分组  
args.data  {array}  翻译数据  

```js
import { apis } from "mdye";

apis.appManagement.editProjectLangs(args)
  .then(res => {
    console.log(res);
  });
```
---

## editPasswordRegexTipLangs

编辑密码规则提示多语言

### 参数

args.data  {array}  翻译数据  

```js
import { apis } from "mdye";

apis.appManagement.editPasswordRegexTipLangs(args)
  .then(res => {
    console.log(res);
  });
```
---

## getProjectLang

获取组织名称多语言(只能获取名称)

### 参数

args.projectId  {string}  网络id  

```js
import { apis } from "mdye";

apis.appManagement.getProjectLang(args)
  .then(res => {
    console.log(res);
  });
```
---

## addOfflineItem

添加离线应用项

### 参数

args.appId  {string}  应用Id  
args.worksheetId  {string}  工作表Id  

```js
import { apis } from "mdye";

apis.appManagement.addOfflineItem(args)
  .then(res => {
    console.log(res);
  });
```
---

## editOfflineItemStatus

编辑离线应用项

### 参数

args.appId  {string}  应用id  
args.worksheetId  {string}  工作表Id  
args.status  {integer}  状态 （0 = 关闭，1 = 启用，2 = 删除）  

```js
import { apis } from "mdye";

apis.appManagement.editOfflineItemStatus(args)
  .then(res => {
    console.log(res);
  });
```
---

## getOfflineItems

获取离线应用项

### 参数

args.appId  {string}  应用id  
args.tradeId  {string}  交易id  

```js
import { apis } from "mdye";

apis.appManagement.getOfflineItems(args)
  .then(res => {
    console.log(res);
  });
```
---

## getBackupTask

获取备份定时任务

### 参数

args.appId  {string}  AppId  
args.customLink  {string}  客户自定义登录链接参数值  

```js
import { apis } from "mdye";

apis.appManagement.getBackupTask(args)
  .then(res => {
    console.log(res);
  });
```
---

## editBackupTaskStatus

修改定时备份任务状态

### 参数

args.appId  {string}  应用id  
args.status  {integer}  状态 （0 = 关闭，1 = 启用，2 = 删除）  

```js
import { apis } from "mdye";

apis.appManagement.editBackupTaskStatus(args)
  .then(res => {
    console.log(res);
  });
```
---

## editBackupTaskInfo

修改定时备份任务信息

### 参数

args.appId  {string}  应用id  
args.cycleType  {integer}  周期类型 (1= 每天，2 = 每周，3 = 每月)  
args.cycleValue  {integer}  具体周期值 （日期（1-31），星期（0 = 星期天））  
args.datum  {boolean}  备份数据  
args.status  {integer}  状态 （0 = 关闭，1 = 启用，2 = 删除）  

```js
import { apis } from "mdye";

apis.appManagement.editBackupTaskInfo(args)
  .then(res => {
    console.log(res);
  });
```
---


---

# 应用

## createApp

添加应用

### 参数

args.projectId  {string}  网络id  
args.name  {string}  名称  
args.icon  {string}  图标  
args.iconColor  {string}  图标颜色  
args.navColor  {string}  导航颜色  
args.lightColor  {string}  背景色  
args.groupId  {string}  分组id  
args.urlTemplate  {string}  url链接模板  
args.configuratiuon  {object}  链接配置  
args.pcDisplay  {boolean}  Pc端显示,  
args.webMobileDisplay  {boolean}  web移动端显示  
args.appDisplay  {boolean}  app端显示  
args.dbInstanceId  {string}  数据库实例id  

```js
import { apis } from "mdye";

apis.homeApp.createApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## deleteApp

首页删除应用(删除之后进入回收站)

### 参数

args.appId  {string}  应用id  
args.projectId  {string}  网络id  
args.isHomePage  {boolean}  是否首页 true 是 false 否  

```js
import { apis } from "mdye";

apis.homeApp.deleteApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppRecoveryRecordList

分页获取应用回收站

### 参数

args.pageIndex  {integer}  当前页  
args.pageSize  {integer}  页大小  
args.projectId  {string}  组织id  
args.isHomePage  {boolean}  是否为首页  
args.keyword  {string}  关键字搜索  

```js
import { apis } from "mdye";

apis.homeApp.getAppRecoveryRecordList(args)
  .then(res => {
    console.log(res);
  });
```
---

## appRecycleBinDelete

首页应用回收站彻底删除

### 参数

args.id  {string}  记录id  
args.projectId  {string}  网络id  
args.isHomePage  {boolean}  是否首页 true 是 false 否  

```js
import { apis } from "mdye";

apis.homeApp.appRecycleBinDelete(args)
  .then(res => {
    console.log(res);
  });
```
---

## restoreApp

恢复应用

### 参数

args.id  {string}  记录id  
args.projectId  {string}  组织id  
args.isHomePage  {boolean}  是否是首页恢复  

```js
import { apis } from "mdye";

apis.homeApp.restoreApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## editAppTimeZones

编辑应用时区

### 参数

args.appId  {string}    
args.timeZone  {integer}  1 = 跟随设备，其他参考个人设置，一样的code  

```js
import { apis } from "mdye";

apis.homeApp.editAppTimeZones(args)
  .then(res => {
    console.log(res);
  });
```
---

## editAppOriginalLang

编辑原始语言

### 参数

args.appId  {string}    
args.originalLang  {string}  原始语言code  

```js
import { apis } from "mdye";

apis.homeApp.editAppOriginalLang(args)
  .then(res => {
    console.log(res);
  });
```
---

## markApp

标星应用或应用项

### 参数

args.appId  {string}  应用id  
args.itemId  {string}  应用项id  
args.type  {integer}  0 = 应用，1 = 自定义页面，2 = 工作表  
args.isMark  {boolean}  是否标星（true or false）  
args.projectId  {string}  网络id(可空为个人应用)  

```js
import { apis } from "mdye";

apis.homeApp.markApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## editAppInfo

编辑应用

### 参数

args.appId  {string}  应用id  
args.projectId  {string}  网络id  
args.name  {string}  名称  
args.description  {string}  描述  
args.icon  {string}  图标  
args.iconColor  {string}  图标颜色  
args.appNaviStyle  {integer}  移动端:0 = 列表 ，1= 九宫格，2= 导航  
args.pcNavistyle  {integer}  PC端:0-经典 1-左侧列表 2-卡片模式，3 = 树形  
args.viewHideNavi  {boolean}  查看影藏导航项  
args.navColor  {string}  导航栏颜色  
args.lightColor  {string}  淡色色值  
args.gridDisplayMode  {integer}  宫格显示模式  
args.appNaviDisplayType  {integer}  移动端导航列表显示类型  
args.urlTemplate  {string}  外部链接url  
args.configuration  {object}  链接配置  
args.pcDisplay  {boolean}  Pc端显示,  
args.webMobileDisplay  {boolean}  web移动端显示  
args.appDisplay  {boolean}  app端显示  
args.selectAppItmeType  {integer}  记住上次使用（2 = 是，1 = 老配置，始终第一个）  
args.pcNaviDisplayType  {integer}  导航分组展开样式（10.2去掉了）  
args.displayIcon  {string}  显示图标,目前只有三级（000，111，，0=不勾选，1=勾选）  
args.expandType  {integer}  展开方式  0 = 默认，1 = 手风琴  
args.hideFirstSection  {boolean}  隐藏首个分组  
args.appNavItemIds  {array}  移动端导航应用项ids  

```js
import { apis } from "mdye";

apis.homeApp.editAppInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateAppSort

更新首页应用排序

### 参数

args.sortType  {integer}  排序类型 1= 全部组织星标应用排序，2 = 网络，3= 个人，4= 外部协作，5= 过期网络，6 = 首页应用分组下应用排序，7 = 当前组织星标应用排序， 8 = 我拥有的应用排序  
args.appIds  {array}  应用id  
args.projectId  {string}  网络id  
args.groupId  {string}  首页分组id  

```js
import { apis } from "mdye";

apis.homeApp.updateAppSort(args)
  .then(res => {
    console.log(res);
  });
```
---

## copyApp

复制应用

### 参数

args.appId  {string}  应用id  
args.appName  {string}  新的应用名称  
args.groupId  {string}  分组id  
args.dbInstanceId  {string}  数据库实例id  

```js
import { apis } from "mdye";

apis.homeApp.copyApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## publishSettings

应用发布设置

### 参数

args.appId  {string}  应用id  
args.projectId  {string}  组织id  
args.pcDisplay  {boolean}  Pc端显示,  
args.webMobileDisplay  {boolean}  web移动端显示  
args.appDisplay  {boolean}  app端显示  

```js
import { apis } from "mdye";

apis.homeApp.publishSettings(args)
  .then(res => {
    console.log(res);
  });
```
---

## editWhiteList

编辑开放接口的白名单

### 参数

args.whiteIps  {array}  白名单  
args.appId  {string}  应用id  
args.projectId  {string}  组织id  

```js
import { apis } from "mdye";

apis.homeApp.editWhiteList(args)
  .then(res => {
    console.log(res);
  });
```
---

## editFix

更新维护状态

### 参数

args.appId  {string}    
args.projectId  {string}    
args.fixed  {boolean}  维护中标识 true,false  
args.fixRemark  {string}  维护通知  

```js
import { apis } from "mdye";

apis.homeApp.editFix(args)
  .then(res => {
    console.log(res);
  });
```
---

## editSSOAddress

编辑sso登录应用首页地址

### 参数

args.appId  {string}    
args.ssoAddress  {string}    

```js
import { apis } from "mdye";

apis.homeApp.editSSOAddress(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAllHomeApp

获取首页所有应用信息

### 参数

args.containsLinks  {boolean}    

```js
import { apis } from "mdye";

apis.homeApp.getAllHomeApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorksheetsByAppId

获取应用下所有工作表信息

### 参数

args.appId  {string}  应用id  
args.getAlias  {boolean}  是否获取工作表别名(默认不获取)  

```js
import { apis } from "mdye";

apis.homeApp.getWorksheetsByAppId(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAttachementImages

获取附件图片列表

### 参数

args.workSheetId  {string}  工作表id  
args.viewId  {string}  视图id  
args.attachementControlId  {string}  控件id  
args.imageLimitCount  {integer}  图片上限数量  
args.displayMode  {integer}  展示方式（默认值为0） 0-all 1-每条记录第一张  
args.filedIds  {array}  工作表字段控件id数组  

```js
import { apis } from "mdye";

apis.homeApp.getAttachementImages(args)
  .then(res => {
    console.log(res);
  });
```
---

## getPageInfo

进入应用刷新页面，前端路由匹配接口

### 参数

args.id  {string}    
args.sectionId  {string}  分组id  

```js
import { apis } from "mdye";

apis.homeApp.getPageInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppItemDetail

批量获取应用项信息

### 参数


```js
import { apis } from "mdye";

apis.homeApp.getAppItemDetail(args)
  .then(res => {
    console.log(res);
  });
```
---

## getApp

获取应用详情（包含分组信息，请求参数可选）

### 参数

args.ticket  {string}  验证码返票据  
args.randStr  {string}  票据随机字符串  
args.clientId  {string}  客户端标识  
args.appId  {string}  应用id  
args.getSection  {boolean}  是否获取分组信息  
args.getManager  {boolean}  是否获取管理员列表信息  
args.getProject  {boolean}  获取组织信息  
args.getLang  {boolean}  是否获取应用语种信息  
args.isMobile  {boolean}  是否是移动端  

```js
import { apis } from "mdye";

apis.homeApp.getApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## checkApp

验证应用有效性

### 参数

args.appId  {string}  应用id  
args.tradeId  {string}  交易id  

```js
import { apis } from "mdye";

apis.homeApp.checkApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppFirstInfo

获取应用下分组和第一个工作表信息

### 参数

args.appId  {string}  应用id  
args.appSectionId  {string}  SectionId  

```js
import { apis } from "mdye";

apis.homeApp.getAppFirstInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppSimpleInfo

获取简单应用id及分组id

### 参数

args.workSheetId  {string}  工作表id  

```js
import { apis } from "mdye";

apis.homeApp.getAppSimpleInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppSectionDetail

根据应用分组id获取详情

### 参数

args.appId  {string}  应用id  
args.appSectionId  {string}  分组id  

```js
import { apis } from "mdye";

apis.homeApp.getAppSectionDetail(args)
  .then(res => {
    console.log(res);
  });
```
---

## addAppSection

添加应用分组

### 参数

args.appId  {string}  应用id  
args.name  {string}  分组名称  
args.icon  {string}  分组图标  
args.iconColor  {string}  分组图标颜色  
args.sourceAppSectionId  {string}  来源应用分组id（在此后添加应用分组）  
args.parentId  {string}  父级分组id（除了创建一级分组外不需要传，其他都需要传）  
args.rootId  {string}  根分组id（除了创建一级分组外不需要传,其他都需要传,参数值为一级分组的id）  

```js
import { apis } from "mdye";

apis.homeApp.addAppSection(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateAppSectionName

修改应用分组名称

### 参数

args.appId  {string}  应用id  
args.name  {string}  名称  
args.appSectionId  {string}  分组id  

```js
import { apis } from "mdye";

apis.homeApp.updateAppSectionName(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateAppSection

修改分组基础信息信息

### 参数

args.appId  {string}  应用id  
args.appSectionId  {string}  分组id  
args.appSectionName  {string}  分组名称  
args.icon  {string}  图标  
args.iconColor  {string}  图标颜色  

```js
import { apis } from "mdye";

apis.homeApp.updateAppSection(args)
  .then(res => {
    console.log(res);
  });
```
---

## deleteAppSection

删除应用分组（并移动该项下工作表到其他应用分组）

### 参数

args.appId  {string}  应用id  
args.appSectionId  {string}  删除应用分组Id  
args.sourceAppSectionId  {string}  目标应用分组id  

```js
import { apis } from "mdye";

apis.homeApp.deleteAppSection(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateAppSectionSort

更新应用分组排序信息

### 参数

args.appId  {string}  应用id  
args.appSectionIds  {array}  删除应用分组Id  

```js
import { apis } from "mdye";

apis.homeApp.updateAppSectionSort(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateSectionChildSort

更新应用分组下工作表排序信息

### 参数

args.appId  {string}  应用id  
args.appSectionId  {string}  分组id  
args.workSheetIds  {array}  排序后的完整ids  

```js
import { apis } from "mdye";

apis.homeApp.updateSectionChildSort(args)
  .then(res => {
    console.log(res);
  });
```
---

## setWorksheetStatus

设置应用项显示隐藏

### 参数

args.appId  {string}  应用id  
args.worksheetId  {string}  工作表id  
args.status  {integer}  状态(1= 显示，2 = 全隐藏，3 = PC隐藏，4 = 移动端隐藏)  

```js
import { apis } from "mdye";

apis.homeApp.setWorksheetStatus(args)
  .then(res => {
    console.log(res);
  });
```
---

## getApiInfo

获取应用open api文档

### 参数

args.appId  {string}  应用id  
args.notOnSettingPage  {boolean}  不是在 配置页面（ 当为 ture 时，代表是在 前台/非管理 页面，此时 需要验证 角色负责人）  

```js
import { apis } from "mdye";

apis.homeApp.getApiInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## getMyApp

获取我的应用

### 参数

args.projectId  {string}  网络id  
args.containsLinks  {boolean}  是否包含外部链接  
args.getMarkApp  {boolean}  是否获取标记 (默认获取，10.1新版本后可以不用获取)  

```js
import { apis } from "mdye";

apis.homeApp.getMyApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## getGroup

获取首页分组详情

### 参数

args.projectId  {string}  网络id  
args.containsLinks  {boolean}  是否包含外部链接  
args.getMarkApp  {boolean}  是否获取标记 (默认获取，10.1新版本后可以不用获取)  
args.id  {string}  首页分组id  

```js
import { apis } from "mdye";

apis.homeApp.getGroup(args)
  .then(res => {
    console.log(res);
  });
```
---

## addToGroup

添加应用到分组下

### 参数

args.appId  {string}  应用id  
args.personalGroups  {array}  个人分组ids  
args.projectGroups  {array}  网络分组ids  

```js
import { apis } from "mdye";

apis.homeApp.addToGroup(args)
  .then(res => {
    console.log(res);
  });
```
---

## removeToGroup

应用从分组下移除

### 参数

args.appId  {string}  应用id  
args.personalGroups  {array}  个人分组ids  
args.projectGroups  {array}  网络分组ids  

```js
import { apis } from "mdye";

apis.homeApp.removeToGroup(args)
  .then(res => {
    console.log(res);
  });
```
---

## markedGroup

标星分组

### 参数

args.id  {string}  分组id  
args.projectId  {string}    
args.isMarked  {boolean}    

```js
import { apis } from "mdye";

apis.homeApp.markedGroup(args)
  .then(res => {
    console.log(res);
  });
```
---

## addGroup

新增首页分组

### 参数

args.projectId  {string}    
args.name  {string}    
args.icon  {string}    

```js
import { apis } from "mdye";

apis.homeApp.addGroup(args)
  .then(res => {
    console.log(res);
  });
```
---

## editGroup

编辑分组信息

### 参数

args.id  {string}  分组id  
args.projectId  {string}    
args.name  {string}    
args.icon  {string}    

```js
import { apis } from "mdye";

apis.homeApp.editGroup(args)
  .then(res => {
    console.log(res);
  });
```
---

## deleteGroup

删除分组

### 参数

args.id  {string}  分组id  
args.projectId  {string}    

```js
import { apis } from "mdye";

apis.homeApp.deleteGroup(args)
  .then(res => {
    console.log(res);
  });
```
---

## editGroupSort

分组排序

### 参数

args.projectId  {string}    
args.ids  {array}  分组ids ，排好序传过来  
args.sortType  {integer}  排序类型 1= 星标，2 = 网络，3= 个人，  

```js
import { apis } from "mdye";

apis.homeApp.editGroupSort(args)
  .then(res => {
    console.log(res);
  });
```
---

## editHomeSetting

修改首页自定义显示设置

### 参数

args.projectId  {string}  网络id  
args.exDisplay  {boolean}  是否显示外部应用  
args.displayCommonApp  {boolean}  是否显示常用应用  
args.isAllAndProject  {boolean}  是否开启全部和组织分组  
args.displayMark  {boolean}  是否显示星标应用  
args.rowCollect  {boolean}  记录收藏  
args.displayApp  {boolean}  工作台左侧菜单是否显示app  
args.displayChart  {boolean}  图表收藏开关  
args.sortItems  {array}  排序  

```js
import { apis } from "mdye";

apis.homeApp.editHomeSetting(args)
  .then(res => {
    console.log(res);
  });
```
---

## markApps

批量标记应用和应用项目

### 参数

args.items  {array}  标记的应用和应用项  
args.projectId  {string}  组织id  

```js
import { apis } from "mdye";

apis.homeApp.markApps(args)
  .then(res => {
    console.log(res);
  });
```
---

## editPlatformSetting

编辑平台设置

### 参数

args.projectId  {string}  组织id  
args.bulletinBoards  {array}  宣传栏  
args.color  {string}  颜色  
args.slogan  {string}  标语  
args.logo  {string}  组织logo  
args.logoSwitch  {boolean}  logo开关  
args.boardSwitch  {boolean}  宣传栏目开关  
args.logoHeight  {integer}  logo高度  
args.advancedSetting  {object}    

```js
import { apis } from "mdye";

apis.homeApp.editPlatformSetting(args)
  .then(res => {
    console.log(res);
  });
```
---

## myPlatform

工作台

### 参数

args.projectId  {string}  组织id  
args.noCache  {boolean}  不走缓存  

```js
import { apis } from "mdye";

apis.homeApp.myPlatform(args)
  .then(res => {
    console.log(res);
  });
```
---

## marketApps

收藏的应用

### 参数

args.projectId  {string}  组织id  
args.noCache  {boolean}  不走缓存  

```js
import { apis } from "mdye";

apis.homeApp.marketApps(args)
  .then(res => {
    console.log(res);
  });
```
---

## recentApps

最近访问应用

### 参数

args.projectId  {string}  组织id  
args.noCache  {boolean}  不走缓存  

```js
import { apis } from "mdye";

apis.homeApp.recentApps(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppIdsAndItemIdsTest

获取工作台ids（测试用）

### 参数


```js
import { apis } from "mdye";

apis.homeApp.getAppIdsAndItemIdsTest(args)
  .then(res => {
    console.log(res);
  });
```
---

## myPlatformLang

工作台多语言

### 参数

args.projectId  {string}  组织id  
args.noCache  {boolean}  不走缓存  

```js
import { apis } from "mdye";

apis.homeApp.myPlatformLang(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAppItems

获取应用下应用项

### 参数

args.appId  {string}  应用id  
args.tradeId  {string}  交易id  

```js
import { apis } from "mdye";

apis.homeApp.getAppItems(args)
  .then(res => {
    console.log(res);
  });
```
---

## getHomePlatformSetting

获取平台设置

### 参数

args.projectId  {string}  组织id  
args.noCache  {boolean}  不走缓存  

```js
import { apis } from "mdye";

apis.homeApp.getHomePlatformSetting(args)
  .then(res => {
    console.log(res);
  });
```
---

## getOwnedApp

我拥有的应用

### 参数

args.projectId  {string}  组织id  
args.noCache  {boolean}  不走缓存  

```js
import { apis } from "mdye";

apis.homeApp.getOwnedApp(args)
  .then(res => {
    console.log(res);
  });
```
---

## getMyDbInstances

获取可用的专属数据库列表

### 参数

args.projectId  {string}    

```js
import { apis } from "mdye";

apis.homeApp.getMyDbInstances(args)
  .then(res => {
    console.log(res);
  });
```
---


---

# 操作日志

## getActionLogs

获取登录日志列表

### 参数

args.projectId  {string}  网络id  
args.pageIndex  {integer}  当前页码  
args.pageSize  {integer}  页面尺寸  
args.startDateTime  {string}  开始时间  
args.endDateTime  {string}  结束时间  
args.accountIds  {array}  用户ID  
args.columnNames  {array}  列名称  
args.fileName  {string}  导出文件名  
args.confirmExport  {boolean}  是否确认导出(超量的情况下传)  

```js
import { apis } from "mdye";

apis.actionLog.getActionLogs(args)
  .then(res => {
    console.log(res);
  });
```
---

## getOrgLogs

获取组织管理日志列表

### 参数

args.projectId  {string}  网络id  
args.pageIndex  {integer}  当前页码  
args.pageSize  {integer}  页面尺寸  
args.startDateTime  {string}  开始时间  
args.endDateTime  {string}  结束时间  
args.accountIds  {array}  用户ID  
args.fileName  {string}  文件名  
args.columnNames  {array}  列名称  
args.confirmExport  {boolean}  是否确认导出(超量的情况下传)  

```js
import { apis } from "mdye";

apis.actionLog.getOrgLogs(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAccountDevices

获取登录设备列表

### 参数


```js
import { apis } from "mdye";

apis.actionLog.getAccountDevices(args)
  .then(res => {
    console.log(res);
  });
```
---

## addLog

添加行为日志

### 参数

args.entityId  {string}  实体id(根据访问类型不同， 传不同模块id)  

```js
import { apis } from "mdye";

apis.actionLog.addLog(args)
  .then(res => {
    console.log(res);
  });
```
---


---

# 工作流-流程实例

## count

获取待处理列表总数

### 参数

args.access_token  {string}  令牌  

```js
import { apis } from "mdye";

apis.instance.count(args)
  .then(res => {
    console.log(res);
  });
```
---

## forward

审批-转审

### 参数

args.access_token  {string}  令牌  
requestWork  {审批动作}  {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}  

```js
import { apis } from "mdye";

apis.instance.forward(args)
  .then(res => {
    console.log(res);
  });
```
---

## getArchivedList

获取归档服务地址

### 参数

args.access_token  {string}  令牌  

```js
import { apis } from "mdye";

apis.instance.getArchivedList(args)
  .then(res => {
    console.log(res);
  });
```
---

## getHistoryDetail

获取历史详情

### 参数

args.access_token  {string}  令牌  
args.instanceId  {String}  *流程实例ID  

```js
import { apis } from "mdye";

apis.instance.getHistoryDetail(args)
  .then(res => {
    console.log(res);
  });
```
---

## getHistoryList

获取历史运行列表

### 参数

args.access_token  {string}  令牌  
args.archivedId  {string}  archivedId  
args.endDate  {Date}  结束时间  
args.instanceId  {String}  主instanceId(根据主历史查子流程历史使用)  
args.pageIndex  {int}  页数  
args.pageSize  {int}  每页数量  
args.processId  {String}  *流程ID  
args.startDate  {Date}  开始时间  
args.status  {int}  状态  
args.title  {String}  名称  
args.workId  {String}  主workId(根据主历史查子流程历史使用)  

```js
import { apis } from "mdye";

apis.instance.getHistoryList(args)
  .then(res => {
    console.log(res);
  });
```
---

## getInstance

获取实例基本信息

### 参数

args.access_token  {string}  令牌  
args.instanceId  {String}  *流程实例ID  

```js
import { apis } from "mdye";

apis.instance.getInstance(args)
  .then(res => {
    console.log(res);
  });
```
---

## getOperationDetail

获取操作窗口详情

### 参数

args.access_token  {string}  令牌  
args.id  {string}  *流程实例id  
args.workId  {string}  *工作Id  

```js
import { apis } from "mdye";

apis.instance.getOperationDetail(args)
  .then(res => {
    console.log(res);
  });
```
---

## getOperationHistoryList

获取操作历史

### 参数

args.access_token  {string}  令牌  
args.instanceId  {String}  *流程实例ID  

```js
import { apis } from "mdye";

apis.instance.getOperationHistoryList(args)
  .then(res => {
    console.log(res);
  });
```
---

## operation

对应各种操作

### 参数

args.access_token  {string}  令牌  
requestWork  {各种操作类型}  {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),operationType:操作类型 3撤回 4通过申请 5拒绝申请 6转审 7加签 9提交 10转交 16添加审批人 18催办(integer),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}  

```js
import { apis } from "mdye";

apis.instance.operation(args)
  .then(res => {
    console.log(res);
  });
```
---

## overrule

审批-否决

### 参数

args.access_token  {string}  令牌  
requestWork  {审批动作}  {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}  

```js
import { apis } from "mdye";

apis.instance.overrule(args)
  .then(res => {
    console.log(res);
  });
```
---

## pass

审批-通过

### 参数

args.access_token  {string}  令牌  
requestWork  {审批动作}  {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}  

```js
import { apis } from "mdye";

apis.instance.pass(args)
  .then(res => {
    console.log(res);
  });
```
---

## restart

重新发起

### 参数

args.access_token  {string}  令牌  
requestWork  {审批动作}  {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}  

```js
import { apis } from "mdye";

apis.instance.restart(args)
  .then(res => {
    console.log(res);
  });
```
---

## revoke

撤回

### 参数

args.access_token  {string}  令牌  
requestWork  {审批动作}  {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}  

```js
import { apis } from "mdye";

apis.instance.revoke(args)
  .then(res => {
    console.log(res);
  });
```
---

## signTask

审批-加签

### 参数

args.access_token  {string}  令牌  
requestWork  {审批动作}  {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}  

```js
import { apis } from "mdye";

apis.instance.signTask(args)
  .then(res => {
    console.log(res);
  });
```
---

## submit

填写动作-提交

### 参数

args.access_token  {string}  令牌  
requestWork  {审批动作}  {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}  

```js
import { apis } from "mdye";

apis.instance.submit(args)
  .then(res => {
    console.log(res);
  });
```
---

## taskRevoke

审批人撤回

### 参数

args.access_token  {string}  令牌  
requestWork  {审批动作}  {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}  

```js
import { apis } from "mdye";

apis.instance.taskRevoke(args)
  .then(res => {
    console.log(res);
  });
```
---

## transfer

填写动作-填写转给其他人

### 参数

args.access_token  {string}  令牌  
requestWork  {审批动作}  {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}  

```js
import { apis } from "mdye";

apis.instance.transfer(args)
  .then(res => {
    console.log(res);
  });
```
---


---

# 工作流-流程实例版本

## cover

用扩展表覆盖

### 参数

args.access_token  {string}  令牌  
args.id  {string}  *流程实例id  
args.workId  {string}  *工作Id  

```js
import { apis } from "mdye";

apis.instanceVersion.cover(args)
  .then(res => {
    console.log(res);
  });
```
---

## get2

获取流程实例流转详情

### 参数

args.access_token  {string}  令牌  
args.id  {string}  *流程实例id  
args.workId  {string}  *工作Id  

```js
import { apis } from "mdye";

apis.instanceVersion.get2(args)
  .then(res => {
    console.log(res);
  });
```
---

## getTodoCount2

获取未完成数量

### 参数

args.access_token  {string}  令牌  
args.apkId  {string}  应用id  
args.archivedId  {string}  归档服务地址  
args.complete  {boolean}  是否是已完成  
args.createAccountId  {string}  发起人id  
args.endDate  {string}  结束时间 yyyy-MM-dd  
args.keyword  {string}  null  
args.operationType  {integer}  操作类型 默认0 1填写/通过 2加签 3委托 4否决 5取消（非会签用）WorkItemOperationType  
args.pageIndex  {integer}  null  
args.pageSize  {integer}  null  
args.processId  {string}  流程id  
args.startAppId  {string}  触发器实体id  
args.startDate  {string}  开始时间 yyyy-MM-dd  
args.startSourceId  {string}  触发器数据源id  
args.status  {integer}  状态  1运行中，2完成，3否决，4 终止 失败  
args.type  {integer}  0:我发起的 -1待处理 包含(3:待填写 4:待审批) 5:待查看  

```js
import { apis } from "mdye";

apis.instanceVersion.getTodoCount2(args)
  .then(res => {
    console.log(res);
  });
```
---

## getTodoList2

根据表id行id获取审批流程执行列表

### 参数

args.access_token  {string}  令牌  
request  {RequestTodo}  {apkId:应用id(string),archivedId:归档服务地址(string),complete:是否是已完成(boolean),createAccountId:发起人id(string),endDate:结束时间 yyyy-MM-dd(string),keyword:null(string),operationType:操作类型 默认0 1填写/通过 2加签 3委托 4否决 5取消（非会签用）WorkItemOperationType(integer),pageIndex:null(integer),pageSize:null(integer),processId:流程id(string),startAppId:触发器实体id(string),startDate:开始时间 yyyy-MM-dd(string),startSourceId:触发器数据源id(string),status:状态  1运行中，2完成，3否决，4 终止 失败(integer),type:0:我发起的 -1待处理 包含(3:待填写 4:待审批) 5:待查看(integer),}  

```js
import { apis } from "mdye";

apis.instanceVersion.getTodoList2(args)
  .then(res => {
    console.log(res);
  });
```
---

## batch

批量操作

### 参数

args.access_token  {string}  令牌  
request  {RequestBatch}  {apkId:应用id(string),archivedId:归档服务地址(string),batchOperationType:批量操作类型 可操作动作 3撤回 4通过 5拒绝 6转审 7加签 9提交 10转交 12打印(integer),complete:是否是已完成(boolean),createAccountId:发起人id(string),endDate:结束时间 yyyy-MM-dd(string),id:单个实例id(string),keyword:null(string),operationType:操作类型 默认0 1填写/通过 2加签 3委托 4否决 5取消（非会签用）WorkItemOperationType(integer),pageIndex:null(integer),pageSize:null(integer),processId:流程id(string),selects:批量选择(array),startAppId:触发器实体id(string),startDate:开始时间 yyyy-MM-dd(string),startSourceId:触发器数据源id(string),status:状态  1运行中，2完成，3否决，4 终止 失败(integer),type:0:我发起的 -1待处理 包含(3:待填写 4:待审批) 5:待查看(integer),workId:单个运行id(string),}  

```js
import { apis } from "mdye";

apis.instanceVersion.batch(args)
  .then(res => {
    console.log(res);
  });
```
---

## endInstance

中止执行

### 参数

args.access_token  {string}  令牌  
args.instanceId  {string}  *instanceId  

```js
import { apis } from "mdye";

apis.instanceVersion.endInstance(args)
  .then(res => {
    console.log(res);
  });
```
---

## endInstanceList

中止执行批量

### 参数

args.access_token  {string}  令牌  
request  {RequestStartProcess}  {appId:表id(string),dataLog:扩展触发值(string),fastFilters:快速筛选条件(array),filterControls:筛选条件(array),filtersGroup:自定义页面筛选组(array),isAll:是否全选(boolean),keyWords:搜索框(string),navGroupFilters:分组筛选(array),pushUniqueId:push唯一id 客户端使用(string),sources:行ids(array),triggerId:按钮id(string),viewId:视图id(string),}  

```js
import { apis } from "mdye";

apis.instanceVersion.endInstanceList(args)
  .then(res => {
    console.log(res);
  });
```
---

## get

获取流程实例详情

### 参数

args.access_token  {string}  令牌  
args.id  {string}  *流程实例id  
args.workId  {string}  *工作Id  

```js
import { apis } from "mdye";

apis.instanceVersion.get(args)
  .then(res => {
    console.log(res);
  });
```
---

## getTodoCount

获取待处理数量

### 参数

args.access_token  {string}  令牌  
args.archivedId  {string}  archivedId  

```js
import { apis } from "mdye";

apis.instanceVersion.getTodoCount(args)
  .then(res => {
    console.log(res);
  });
```
---

## getTodoList

获取待处理列表

### 参数

args.access_token  {string}  令牌  
request  {RequestTodo}  {apkId:应用id(string),archivedId:归档服务地址(string),complete:是否是已完成(boolean),createAccountId:发起人id(string),endDate:结束时间 yyyy-MM-dd(string),keyword:null(string),operationType:操作类型 默认0 1填写/通过 2加签 3委托 4否决 5取消（非会签用）WorkItemOperationType(integer),pageIndex:null(integer),pageSize:null(integer),processId:流程id(string),startAppId:触发器实体id(string),startDate:开始时间 yyyy-MM-dd(string),startSourceId:触发器数据源id(string),status:状态  1运行中，2完成，3否决，4 终止 失败(integer),type:0:我发起的 -1待处理 包含(3:待填写 4:待审批) 5:待查看(integer),}  

```js
import { apis } from "mdye";

apis.instanceVersion.getTodoList(args)
  .then(res => {
    console.log(res);
  });
```
---

## getTodoListFilter

待处理筛选器

### 参数

args.access_token  {string}  令牌  
request  {RequestTodo}  {apkId:应用id(string),archivedId:归档服务地址(string),complete:是否是已完成(boolean),createAccountId:发起人id(string),endDate:结束时间 yyyy-MM-dd(string),keyword:null(string),operationType:操作类型 默认0 1填写/通过 2加签 3委托 4否决 5取消（非会签用）WorkItemOperationType(integer),pageIndex:null(integer),pageSize:null(integer),processId:流程id(string),startAppId:触发器实体id(string),startDate:开始时间 yyyy-MM-dd(string),startSourceId:触发器数据源id(string),status:状态  1运行中，2完成，3否决，4 终止 失败(integer),type:0:我发起的 -1待处理 包含(3:待填写 4:待审批) 5:待查看(integer),}  

```js
import { apis } from "mdye";

apis.instanceVersion.getTodoListFilter(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWorkItem

获取流程实例对应实体

### 参数

args.access_token  {string}  令牌  
args.id  {string}  *流程实例id  
args.workId  {string}  *工作Id  

```js
import { apis } from "mdye";

apis.instanceVersion.getWorkItem(args)
  .then(res => {
    console.log(res);
  });
```
---

## resetInstance

执行历史重试

### 参数

args.access_token  {string}  令牌  
args.instanceId  {string}  *instanceId  

```js
import { apis } from "mdye";

apis.instanceVersion.resetInstance(args)
  .then(res => {
    console.log(res);
  });
```
---

## resetInstanceList

执行历史重试批量

### 参数

args.access_token  {string}  令牌  
request  {RequestStartProcess}  {appId:表id(string),dataLog:扩展触发值(string),fastFilters:快速筛选条件(array),filterControls:筛选条件(array),filtersGroup:自定义页面筛选组(array),isAll:是否全选(boolean),keyWords:搜索框(string),navGroupFilters:分组筛选(array),pushUniqueId:push唯一id 客户端使用(string),sources:行ids(array),triggerId:按钮id(string),viewId:视图id(string),}  

```js
import { apis } from "mdye";

apis.instanceVersion.resetInstanceList(args)
  .then(res => {
    console.log(res);
  });
```
---


---

# 工作流-流程

## addProcess

创建流程

### 参数

args.access_token  {string}  令牌  
addProcess  {增加流程}  {companyId:公司ID(string),explain:说明(string),iconColor:图标颜色(string),iconName:图标名称(string),name:流程名称(string),relationId:关联关系(string),relationType:关联的类型(integer),startEventAppType:发起节点app类型：1：从工作表触发 5:循环触发 6:按日期表触发(integer),}  

```js
import { apis } from "mdye";

apis.process.addProcess(args)
  .then(res => {
    console.log(res);
  });
```
---

## closeStorePush

关闭流程触发历史推送

### 参数

args.access_token  {string}  令牌  
args.storeId  {string}  推送接收到的id  

```js
import { apis } from "mdye";

apis.process.closeStorePush(args)
  .then(res => {
    console.log(res);
  });
```
---

## copyProcess

复制工作流

### 参数

args.access_token  {string}  令牌  
copyProcessRequest  {CopyProcessRequest}  {name:流程名称增加的部分(string),processId:流程ID(string),subProcess:转为子流程(boolean),}  
args.name  {string}  *复制出来的流程名称后缀  
args.processId  {string}  *流程ID  

```js
import { apis } from "mdye";

apis.process.copyProcess(args)
  .then(res => {
    console.log(res);
  });
```
---

## deleteProcess

删除流程

### 参数

args.access_token  {string}  令牌  
args.processId  {string}  *流程ID  

```js
import { apis } from "mdye";

apis.process.deleteProcess(args)
  .then(res => {
    console.log(res);
  });
```
---

## getHistory

工作流历史版本

### 参数

args.access_token  {string}  令牌  
args.pageIndex  {string}  页码  
args.pageSize  {string}  条数  
args.processId  {string}  流程ID  

```js
import { apis } from "mdye";

apis.process.getHistory(args)
  .then(res => {
    console.log(res);
  });
```
---

## getProcessApiInfo

PBC流程api

### 参数

args.access_token  {string}  令牌  
args.processId  {string}  发布版流程ID  
args.relationId  {string}  relationId  

```js
import { apis } from "mdye";

apis.process.getProcessApiInfo(args)
  .then(res => {
    console.log(res);
  });
```
---

## getProcessByControlId

根据工作表控件获取流程

### 参数

args.access_token  {string}  令牌  
args.appId  {string}  工作表id  
args.companyId  {string}  网络id  
args.controlId  {string}  控件id  

```js
import { apis } from "mdye";

apis.process.getProcessByControlId(args)
  .then(res => {
    console.log(res);
  });
```
---

## getProcessById

根据流程id查询流程

### 参数

args.access_token  {string}  令牌  
args.id  {string}  *流程id  

```js
import { apis } from "mdye";

apis.process.getProcessById(args)
  .then(res => {
    console.log(res);
  });
```
---

## getProcessByTriggerId

根据按钮获取流程

### 参数

args.access_token  {string}  令牌  
args.appId  {string}  表id  
args.triggerId  {string}  按钮id  

```js
import { apis } from "mdye";

apis.process.getProcessByTriggerId(args)
  .then(res => {
    console.log(res);
  });
```
---

## getProcessConfig

流程全局配置

### 参数

args.access_token  {string}  令牌  
args.processId  {string}  流程ID  

```js
import { apis } from "mdye";

apis.process.getProcessConfig(args)
  .then(res => {
    console.log(res);
  });
```
---

## getProcessListApi

发布版开启过api的PBC流程列表

### 参数

args.access_token  {string}  令牌  
args.relationId  {string}  应用id  

```js
import { apis } from "mdye";

apis.process.getProcessListApi(args)
  .then(res => {
    console.log(res);
  });
```
---

## getProcessPublish

获取版本发布的信息

### 参数

args.access_token  {string}  令牌  
args.instanceId  {string}  流程实例id  
args.processId  {string}  流程id  

```js
import { apis } from "mdye";

apis.process.getProcessPublish(args)
  .then(res => {
    console.log(res);
  });
```
---

## getStore

流程触发历史

### 参数

args.access_token  {string}  令牌  
args.storeId  {string}  推送接收到的id  

```js
import { apis } from "mdye";

apis.process.getStore(args)
  .then(res => {
    console.log(res);
  });
```
---

## getTriggerProcessList

工作流配置 选择部分触发工作流的列表

### 参数

args.access_token  {string}  令牌  
args.processId  {string}  流程ID  

```js
import { apis } from "mdye";

apis.process.getTriggerProcessList(args)
  .then(res => {
    console.log(res);
  });
```
---

## goBack

返回上一个版本

### 参数

args.access_token  {string}  令牌  
args.processId  {string}  *流程id  

```js
import { apis } from "mdye";

apis.process.goBack(args)
  .then(res => {
    console.log(res);
  });
```
---

## move

流程移到到其他应用下

### 参数

args.access_token  {string}  令牌  
moveProcessRequest  {MoveProcessRequest}  {processId:流程id(string),relationId:移动到的应用id(string),}  

```js
import { apis } from "mdye";

apis.process.move(args)
  .then(res => {
    console.log(res);
  });
```
---

## publish

发布工作流

### 参数

args.access_token  {string}  令牌  
args.isPublish  {boolean}  isPublish  
args.processId  {string}  *流程id  

```js
import { apis } from "mdye";

apis.process.publish(args)
  .then(res => {
    console.log(res);
  });
```
---

## saveProcessConfig

保存流程全局配置

### 参数

args.access_token  {string}  令牌  
saveProcessConfigRequest  {保存流程配置}  {agents:代理人(array),allowRevoke:允许触发者撤回(boolean),allowTaskRevoke:允许审批人撤回(boolean),allowUrge:允许触发者催办(boolean),callBackType:允许触发者撤回后重新发起 -1: 无配置 0:重新执行  1:直接返回审批节点(integer),dateShowType:日期数据格式1:yyyy-MM-dd HH:mm 6：yyyy-MM-dd HH:mm:ss(integer),debugEvents:调试事件 0开启调试(array),defaultAgent:null(string),defaultCandidateUser:candidateUser获取为空时的默认处理(boolean),defaultErrorCandidateUsers:null(string),disabledPrint:是否关闭系统打印(boolean),dotType:小数位数：0 : 取所有小数位数， 1:根据字段上面配置的小数位数(integer),endContentType:异常结束返回的contentType(integer),endValue:异常结束返回的配置(string),errorInterval:错误通知间隔时间(integer),errorNotifiers:错误消息通知人(array),executeType:运行方式: 1 并行，2：顺序，3：串行(integer),initiatorMaps:审批人为空处理(object),isSaveVariables:是否只保存流程参数(boolean),pbcConfig:PBC高级设置(ref),permissionLevel:操作时验证用户权限级别 默认 0不需要验证 1查看权限(integer),printIds:打印模版id列表(array),processId:流程ID(string),processIds:编辑版的流程id(array),processVariables:流程参数(array),recordTitle:待办标题(string),required:验证必填字段(boolean),requiredIds:必须审批的节点(array),responseContentType:返回的contentType(integer),revokeNodeIds:通过指定的节点不允许撤回(array),sendTaskPass:触发者不发送通知(boolean),startEventPass:工作流触发者自动通过(boolean),triggerType:触发其他工作流 0 ：允许触发，1：只能触发指定工作流 2：不允许触发(integer),triggerView:触发者查看(boolean),userTaskNullMaps:审批人为空处理(object),userTaskNullPass:审批人为空自动通过(boolean),userTaskPass:审批人自动通过(boolean),value:返回的配置(string),viewNodeIds:可查看意见节点 null为默认全可见 空数组就是全不可见(array),}  

```js
import { apis } from "mdye";

apis.process.saveProcessConfig(args)
  .then(res => {
    console.log(res);
  });
```
---

## startProcess

工作表按钮触发流程

### 参数

args.access_token  {string}  令牌  
startProcess  {RequestStartProcess}  {appId:表id(string),dataLog:扩展触发值(string),fastFilters:快速筛选条件(array),filterControls:筛选条件(array),filtersGroup:自定义页面筛选组(array),isAll:是否全选(boolean),keyWords:搜索框(string),navGroupFilters:分组筛选(array),pushUniqueId:push唯一id 客户端使用(string),sources:行ids(array),triggerId:按钮id(string),viewId:视图id(string),}  

```js
import { apis } from "mdye";

apis.process.startProcess(args)
  .then(res => {
    console.log(res);
  });
```
---

## startProcessById

根据流程id手动触发流程

### 参数

args.access_token  {string}  令牌  
startProcess  {RequestStartProcessByProcessId}  {dataLog:扩展触发值(string),debugEvents:调试事件(动态人员赋值测试人) 1审批 2短信 3邮件(array),fields:参数(array),processId:流程id(string),pushUniqueId:推送唯一标识(string),sourceId:行记录id(string),}  

```js
import { apis } from "mdye";

apis.process.startProcessById(args)
  .then(res => {
    console.log(res);
  });
```
---

## startProcessByPBC

根据流程id手动触发PBC流程

### 参数

args.access_token  {string}  令牌  
startProcess  {RequestStartProcessByPBC}  {appId:绑定的页面id(string),controls:PBC参数(array),processId:pbc流程id(string),pushUniqueId:push唯一id 客户端使用(string),title:页面按钮名称(string),triggerId:页面按钮id(string),}  

```js
import { apis } from "mdye";

apis.process.startProcessByPBC(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateProcess

修改流程基本信息

### 参数

args.access_token  {string}  令牌  
updateProcess  {更新流程信息}  {companyId:公司ID(string),explain:说明(string),iconColor:图标颜色(string),iconName:图标名称(string),name:流程名称(string),processId:流程id(string),versionName:版本名称(string),}  

```js
import { apis } from "mdye";

apis.process.updateProcess(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateOwner

转交流程

### 参数

args.access_token  {string}  令牌  
args.companyId  {string}  *公司ID  
args.id  {string}  *流程id  
args.owner  {string}  *转交人ID  
updateOwner  {更新拥有者信息}  {companyId:公司ID(string),owner:被转交人id(string),processId:流程id(string),}  

```js
import { apis } from "mdye";

apis.process.updateOwner(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateUseStatus

启用流程或禁用流程

### 参数

args.access_token  {string}  令牌  
updateUseStatus  {更新流程状态}  {companyId:公司ID(string),enabled:是否启用,是：true,禁用：false(boolean),processId:流程id(string),}  

```js
import { apis } from "mdye";

apis.process.updateUseStatus(args)
  .then(res => {
    console.log(res);
  });
```
---


---

# 工作流-流程版本

## batch

批量设置(暂停 恢复)流程

### 参数

args.access_token  {string}  令牌  
request  {流程管理后台批量操作}  {hours:暂停多少小时(integer),processId:流程id(string),processIds:批量操作 流程ids(array),routerIndex:选择的通道序号(integer),waiting:开启还是关闭 默认true开启暂停(boolean),}  

```js
import { apis } from "mdye";

apis.processVersion.batch(args)
  .then(res => {
    console.log(res);
  });
```
---

## getDifferenceByCompanyId

按网络获取流程堆积量

### 参数

args.access_token  {string}  令牌  
args.companyId  {string}  网络id  

```js
import { apis } from "mdye";

apis.processVersion.getDifferenceByCompanyId(args)
  .then(res => {
    console.log(res);
  });
```
---

## getDifferenceByProcessId

获取流程堆积量

### 参数

args.access_token  {string}  令牌  
args.processId  {string}  编辑版流程id  

```js
import { apis } from "mdye";

apis.processVersion.getDifferenceByProcessId(args)
  .then(res => {
    console.log(res);
  });
```
---

## getDifferenceProcessCount

按网络获取堆积流程总数

### 参数

args.access_token  {string}  令牌  
difference  {RequestProcessDifference}  {companyId:网络id(string),ids:多个历史id(array),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),sorter:排序 正序{'difference':'ascend'} 倒序{'difference':'descend'}(object),}  

```js
import { apis } from "mdye";

apis.processVersion.getDifferenceProcessCount(args)
  .then(res => {
    console.log(res);
  });
```
---

## getDifferenceProcessList

按网络获取堆积流程列表

### 参数

args.access_token  {string}  令牌  
difference  {RequestProcessDifference}  {companyId:网络id(string),ids:多个历史id(array),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),sorter:排序 正序{'difference':'ascend'} 倒序{'difference':'descend'}(object),}  

```js
import { apis } from "mdye";

apis.processVersion.getDifferenceProcessList(args)
  .then(res => {
    console.log(res);
  });
```
---

## getDifferenceProcessListByIds

按历史id获取堆积流程列表

### 参数

args.access_token  {string}  令牌  
difference  {RequestProcessDifference}  {companyId:网络id(string),ids:多个历史id(array),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),sorter:排序 正序{'difference':'ascend'} 倒序{'difference':'descend'}(object),}  

```js
import { apis } from "mdye";

apis.processVersion.getDifferenceProcessListByIds(args)
  .then(res => {
    console.log(res);
  });
```
---

## getHistoryDifferenceByCompanyId

按网络获取流程堆积量历史

### 参数

args.access_token  {string}  令牌  
manage  {RequestInstanceIncrementManage}  {companyId:网络id(string),endDate:结束时间 yyyy-MM-dd HH:mm:ss(string),startDate:开始时间 yyyy-MM-dd HH:mm:ss(string),}  

```js
import { apis } from "mdye";

apis.processVersion.getHistoryDifferenceByCompanyId(args)
  .then(res => {
    console.log(res);
  });
```
---

## getHistoryDifferenceByProcessId

按流程id获取有堆积的历史

### 参数

args.access_token  {string}  令牌  
args.processId  {string}  编辑版流程id  

```js
import { apis } from "mdye";

apis.processVersion.getHistoryDifferenceByProcessId(args)
  .then(res => {
    console.log(res);
  });
```
---

## getRouterList

获取已有通道

### 参数

args.access_token  {string}  令牌  
args.companyId  {String}  *网络id  

```js
import { apis } from "mdye";

apis.processVersion.getRouterList(args)
  .then(res => {
    console.log(res);
  });
```
---

## getWarning

获取预警配置

### 参数

args.access_token  {string}  令牌  
args.companyId  {String}  *网络id  

```js
import { apis } from "mdye";

apis.processVersion.getWarning(args)
  .then(res => {
    console.log(res);
  });
```
---

## init

同步所有应用 所有执行数

### 参数

args.access_token  {string}  令牌  
request  {RequestProcessDifference}  {companyId:网络id(string),ids:多个历史id(array),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),sorter:排序 正序{'difference':'ascend'} 倒序{'difference':'descend'}(object),}  

```js
import { apis } from "mdye";

apis.processVersion.init(args)
  .then(res => {
    console.log(res);
  });
```
---

## remove

丢弃排队

### 参数

args.access_token  {string}  令牌  
request  {流程管理后台批量操作}  {hours:暂停多少小时(integer),processId:流程id(string),processIds:批量操作 流程ids(array),routerIndex:选择的通道序号(integer),waiting:开启还是关闭 默认true开启暂停(boolean),}  

```js
import { apis } from "mdye";

apis.processVersion.remove(args)
  .then(res => {
    console.log(res);
  });
```
---

## reset

重置排队计数

### 参数

args.access_token  {string}  令牌  
request  {流程管理后台批量操作}  {hours:暂停多少小时(integer),processId:流程id(string),processIds:批量操作 流程ids(array),routerIndex:选择的通道序号(integer),waiting:开启还是关闭 默认true开启暂停(boolean),}  

```js
import { apis } from "mdye";

apis.processVersion.reset(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateRouterIndex

修改选择的通道

### 参数

args.access_token  {string}  令牌  
request  {流程管理后台批量操作}  {hours:暂停多少小时(integer),processId:流程id(string),processIds:批量操作 流程ids(array),routerIndex:选择的通道序号(integer),waiting:开启还是关闭 默认true开启暂停(boolean),}  

```js
import { apis } from "mdye";

apis.processVersion.updateRouterIndex(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateWaiting

设置暂停流程

### 参数

args.access_token  {string}  令牌  
request  {流程管理后台批量操作}  {hours:暂停多少小时(integer),processId:流程id(string),processIds:批量操作 流程ids(array),routerIndex:选择的通道序号(integer),waiting:开启还是关闭 默认true开启暂停(boolean),}  

```js
import { apis } from "mdye";

apis.processVersion.updateWaiting(args)
  .then(res => {
    console.log(res);
  });
```
---

## updateWarning

修改预警配置

### 参数

args.access_token  {string}  令牌  
request  {RequestInstanceWarning}  {accountIds:通知人(array),companyId:网络id(string),enableEmail:邮件(boolean),enableSms:短信(boolean),value:预警值(integer),}  

```js
import { apis } from "mdye";

apis.processVersion.updateWarning(args)
  .then(res => {
    console.log(res);
  });
```
---

## count

流程列表数量

### 参数

args.access_token  {string}  令牌  
args.relationId  {string}  应用ID 或者 网络ID  
args.relationType  {string}  类型 0 网络，2应用  

```js
import { apis } from "mdye";

apis.processVersion.count(args)
  .then(res => {
    console.log(res);
  });
```
---

## getProcessByCompanyId

网络流程列表

### 参数

args.access_token  {string}  令牌  
args.apkId  {string}  应用ID  
args.companyId  {string}  网络id  
args.createrIds  {string}  创建者  
args.enabled  {string}  开启状态 0 全部，1：开启，2：关闭  
args.isAsc  {string}  是否升序  
args.keyWords  {string}  搜索框  
args.pageIndex  {string}  页数  
args.pageSize  {string}  条数  
args.processListType  {string}  列表类型  
args.sortId  {string}  排序字段id  

```js
import { apis } from "mdye";

apis.processVersion.getProcessByCompanyId(args)
  .then(res => {
    console.log(res);
  });
```
---

## getProcessRole

流程操作权限

### 参数

args.access_token  {string}  令牌  
args.relationId  {string}  应用ID 或者 流程ID  
args.relationType  {string}  类型 0 网络，2应用  

```js
import { apis } from "mdye";

apis.processVersion.getProcessRole(args)
  .then(res => {
    console.log(res);
  });
```
---

## getProcessUseCount

获取流程使用数量和执行次数

### 参数

args.access_token  {string}  令牌  
args.companyId  {string}  公司ID ,个人传空  

```js
import { apis } from "mdye";

apis.processVersion.getProcessUseCount(args)
  .then(res => {
    console.log(res);
  });
```
---

## list

流程列表接口

### 参数

args.access_token  {string}  令牌  
args.keyWords  {string}  keyWords  
args.pageIndex  {integer}  pageIndex  
args.pageSize  {integer}  pageSize  
args.processListType  {string}  *流程列表类型：1:工作表触发，2:时间触发，3:其他应用修改本应用，4:应用流程，5:网络流程,100:回收站  
args.relationId  {string}  应用ID 或者 网络ID  

```js
import { apis } from "mdye";

apis.processVersion.list(args)
  .then(res => {
    console.log(res);
  });
```
---

## listAll

应用下所有流程接口

### 参数

args.access_token  {string}  令牌  
args.keyWords  {string}  keyWords  
args.pageIndex  {integer}  pageIndex  
args.pageSize  {integer}  pageSize  
args.relationId  {string}  应用ID 或者 网络ID  

```js
import { apis } from "mdye";

apis.processVersion.listAll(args)
  .then(res => {
    console.log(res);
  });
```
---

## removeProcess

切底删除流程

### 参数

args.access_token  {string}  令牌  
args.processId  {string}  *流程ID  

```js
import { apis } from "mdye";

apis.processVersion.removeProcess(args)
  .then(res => {
    console.log(res);
  });
```
---

## restoreProcess

恢复流程

### 参数

args.access_token  {string}  令牌  
args.processId  {string}  *流程ID  

```js
import { apis } from "mdye";

apis.processVersion.restoreProcess(args)
  .then(res => {
    console.log(res);
  });
```
---


---

# 工作流-委托

## add

添加委托

### 参数

args.access_token  {string}  令牌  
request  {添加委托}  {apkIds:应用ids(array),companyId:公司ID(string),endDate:结束时间 yyyy-MM-dd HH:mm(string),principal:委托人(string),startDate:开始时间 yyyy-MM-dd HH:mm(string),trustee:受委托人(string),}  

```js
import { apis } from "mdye";

apis.delegation.add(args)
  .then(res => {
    console.log(res);
  });
```
---

## getList

获取委托列表

### 参数

args.access_token  {string}  令牌  

```js
import { apis } from "mdye";

apis.delegation.getList(args)
  .then(res => {
    console.log(res);
  });
```
---

## getListByCompanyId

获取组织下所有委托列表

### 参数

args.access_token  {string}  令牌  
request  {获取委托列表}  {companyId:公司ID(string),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),principals:多个委托人(array),sorter:排序字段 正序{'createDate':'ascend'} 倒序{'createDate':'descend'}(object),}  

```js
import { apis } from "mdye";

apis.delegation.getListByCompanyId(args)
  .then(res => {
    console.log(res);
  });
```
---

## getListByPrincipals

根据委托人获取委托列表

### 参数

args.access_token  {string}  令牌  
request  {获取委托列表}  {companyId:公司ID(string),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),principals:多个委托人(array),sorter:排序字段 正序{'createDate':'ascend'} 倒序{'createDate':'descend'}(object),}  

```js
import { apis } from "mdye";

apis.delegation.getListByPrincipals(args)
  .then(res => {
    console.log(res);
  });
```
---

## update

编辑委托

### 参数

args.access_token  {string}  令牌  
request  {编辑委托}  {apkIds:应用ids(array),companyId:公司ID(string),endDate:结束时间 yyyy-MM-dd HH:mm(string),id:委托ID(string),principal:委托人(string),startDate:开始时间 yyyy-MM-dd HH:mm(string),status:状态 1正常，0结束(integer),trustee:受委托人(string),}  

```js
import { apis } from "mdye";

apis.delegation.update(args)
  .then(res => {
    console.log(res);
  });
```
---


---

# 七牛

## getUploadToken

获取七牛上传 token

### 参数

args.files  {array}  批量上传文件token 请求对象  
args.worksheetId  {string}  默认为工作表ID，注：插件使用此ID  
args.appId  {string}    
args.projectId  {string}    
args.extend  {string}  扩展参数  

```js
import { apis } from "mdye";

apis.qiniu.getUploadToken(args)
  .then(res => {
    console.log(res);
  });
```
---

## getFileUploadToken

获取七牛上传 token

### 参数

args.files  {array}  批量上传文件token 请求对象  
args.worksheetId  {string}  默认为工作表ID，注：插件使用此ID  
args.appId  {string}    
args.projectId  {string}    
args.extend  {string}  扩展参数  

```js
import { apis } from "mdye";

apis.qiniu.getFileUploadToken(args)
  .then(res => {
    console.log(res);
  });
```
---


---

# 插件

## create

创建

### 参数

args.projectId  {string}  组织id  
args.name  {string}  插件名称  
args.icon  {string}  图标  
args.iconColor  {string}  图标颜色  
args.debugEnvironments  {array}  调试环境  
args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.plugin.create(args)
  .then(res => {
    console.log(res);
  });
```
---

## edit

编辑

### 参数

args.id  {string}  插件id  
args.name  {string}  插件名称  
args.icon  {string}  图标  
args.iconColor  {string}  图标颜色  
args.debugEnvironments  {array}  调试环境  
args.paramSettings  {array}  参数设置  
args.switchSettings  {object}  功能开关配置  
args.configuration  {object}  配置  
args.stepState  {integer}  步骤状态（前端自己决定,前提时值必须大于等于0）  
args.state  {integer}  插件状态  
args.templateType  {integer}  模板类型  
args.viewId  {string}  视图id  
args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.plugin.edit(args)
  .then(res => {
    console.log(res);
  });
```
---

## getDetail

获取单个插件详情

### 参数

args.id  {string}  插件id  
args.appId  {string}  应用id  
args.projectId  {string}  组织id  

```js
import { apis } from "mdye";

apis.plugin.getDetail(args)
  .then(res => {
    console.log(res);
  });
```
---

## checkExists

判断插件是否存在

### 参数

args.id  {string}  插件id  
args.appId  {string}  应用id  
args.projectId  {string}  组织id  

```js
import { apis } from "mdye";

apis.plugin.checkExists(args)
  .then(res => {
    console.log(res);
  });
```
---

## getList

获取插件列表

### 参数

args.creator  {string}  创建者，默认为当前登录账号  
args.projectId  {string}  组织id  
args.keywords  {string}  关键字搜索（插件名称）  
args.state  {integer}  是否启用状态  
args.pageIndex  {integer}  当前页  
args.pageSize  {integer}  页大小  

```js
import { apis } from "mdye";

apis.plugin.getList(args)
  .then(res => {
    console.log(res);
  });
```
---

## getAll

获取所有插件

### 参数

args.projectId  {string}  组织id  
args.pageIndex  {integer}  当前页  
args.pageSize  {integer}  页大小  
args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.plugin.getAll(args)
  .then(res => {
    console.log(res);
  });
```
---

## remove

删除

### 参数

args.id  {string}  插件id  

```js
import { apis } from "mdye";

apis.plugin.remove(args)
  .then(res => {
    console.log(res);
  });
```
---

## release

发布插件的新版本

### 参数

args.id  {string}  提交历史记录id  
args.versionCode  {string}  版本号  
args.description  {string}  说明  
args.configuration  {object}  配置  
args.pluginId  {string}  插件id  

```js
import { apis } from "mdye";

apis.plugin.release(args)
  .then(res => {
    console.log(res);
  });
```
---

## rollback

回滚到某一个版本

### 参数

args.releaseId  {string}  版本id  
args.pluginId  {string}  插件id  

```js
import { apis } from "mdye";

apis.plugin.rollback(args)
  .then(res => {
    console.log(res);
  });
```
---

## getReleaseHistory

获取版本历史

### 参数

args.id  {string}  插件id  
args.pageIndex  {integer}  当前页  
args.pageSize  {integer}  页大小  

```js
import { apis } from "mdye";

apis.plugin.getReleaseHistory(args)
  .then(res => {
    console.log(res);
  });
```
---

## removeRelease

删除版本

### 参数

args.id  {string}  版本id  
args.pluginId  {string}  插件id  

```js
import { apis } from "mdye";

apis.plugin.removeRelease(args)
  .then(res => {
    console.log(res);
  });
```
---

## commit

创建提交历史记录

### 参数

args.pluginId  {string}  插件id  
args.message  {string}  提交消息  
args.worksheetId  {string}  工作表id  

```js
import { apis } from "mdye";

apis.plugin.commit(args)
  .then(res => {
    console.log(res);
  });
```
---

## removeCommit

删除提交历史记录

### 参数

args.id  {string}  提交记录id  
args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.plugin.removeCommit(args)
  .then(res => {
    console.log(res);
  });
```
---

## getCommitHistory

获取提交历史列表

### 参数

args.id  {string}  插件id  
args.pageIndex  {integer}  当前页  
args.pageSize  {integer}  当前页  
args.appId  {string}  应用id  

```js
import { apis } from "mdye";

apis.plugin.getCommitHistory(args)
  .then(res => {
    console.log(res);
  });
```
---

## getUseDetail

获取插件使用明细

### 参数

args.id  {string}  插件id  
args.pageSize  {integer}  分页大小  
args.pageIndex  {integer}  当前页  
args.keywords  {string}  关键字  

```js
import { apis } from "mdye";

apis.plugin.getUseDetail(args)
  .then(res => {
    console.log(res);
  });
```
---

## import

插件导入

### 参数

args.projectId  {string}  组织id  
args.url  {string}  插件文件url  
args.pluginId  {string}  插件来源id  

```js
import { apis } from "mdye";

apis.plugin.import(args)
  .then(res => {
    console.log(res);
  });
```
---

## export

插件导出

### 参数

args.id  {string}  插件id  
args.releaseId  {string}  版本id  

```js
import { apis } from "mdye";

apis.plugin.export(args)
  .then(res => {
    console.log(res);
  });
```
---

## getExportHistory

插件导出历史

### 参数

args.id  {string}  插件id  
args.pageIndex  {integer}  当前页  
args.pageSize  {integer}  页大小  

```js
import { apis } from "mdye";

apis.plugin.getExportHistory(args)
  .then(res => {
    console.log(res);
  });
```
---

## getPluginListBySourece

根据来源获取插件

### 参数

args.projectId  {string}  组织id  
args.sourceId  {string}  应用id  

```js
import { apis } from "mdye";

apis.plugin.getPluginListBySourece(args)
  .then(res => {
    console.log(res);
  });
```
---

## stateSave

保存插件视图使用状态

### 参数

args.viewId  {string}  视图id  
args.accountId  {string}  用户Id  
args.data  {object}  插件数据  

```js
import { apis } from "mdye";

apis.plugin.stateSave(args)
  .then(res => {
    console.log(res);
  });
```
---

## stateRead

获取插件视图使用状态

### 参数

args.viewId  {string}  视图id  
args.accountId  {string}  用户Id  

```js
import { apis } from "mdye";

apis.plugin.stateRead(args)
  .then(res => {
    console.log(res);
  });
```
---

