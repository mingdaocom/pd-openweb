module.exports = {
  worksheet: {
    getViewPermission: function (data) {
      return window.api.call('worksheet', 'getViewPermission', data);
    },
    getAppExtendAttr: function (data) {
      return window.api.call('worksheet', 'getAppExtendAttr', data);
    },
    getExtendAttrOptionalControl: function (data) {
      return window.api.call('worksheet', 'getExtendAttrOptionalControl', data);
    },
    saveAppExtendAttr: function (data) {
      return window.api.call('worksheet', 'saveAppExtendAttr', data);
    },
    copyWorksheet: function (data) {
      return window.api.call('worksheet', 'copyWorksheet', data);
    },
    updateEntityName: function (data) {
      return window.api.call('worksheet', 'updateEntityName', data);
    },
    editDeveloperNotes: function (data) {
      return window.api.call('worksheet', 'editDeveloperNotes', data);
    },
    updateWorksheetAlias: function (data) {
      return window.api.call('worksheet', 'updateWorksheetAlias', data);
    },
    updateWorksheetDec: function (data) {
      return window.api.call('worksheet', 'updateWorksheetDec', data);
    },
    updateWorksheetShareRange: function (data) {
      return window.api.call('worksheet', 'updateWorksheetShareRange', data);
    },
    getWorksheetInfo: function (data) {
      return window.api.call('worksheet', 'getWorksheetInfo', data);
    },
    getWorksheetBaseInfo: function (data) {
      return window.api.call('worksheet', 'getWorksheetBaseInfo', data);
    },
    getWorksheetInfoByWorkItem: function (data) {
      return window.api.call('worksheet', 'getWorksheetInfoByWorkItem', data);
    },
    getWorksheetShareUrl: function (data) {
      return window.api.call('worksheet', 'getWorksheetShareUrl', data);
    },
    getShareInfoByShareId: function (data) {
      return window.api.call('worksheet', 'getShareInfoByShareId', data);
    },
    getRefreshRowsMinute: function (data) {
      return window.api.call('worksheet', 'getRefreshRowsMinute', data);
    },
    getRowByID: function (data) {
      return window.api.call('worksheet', 'getRowByID', data);
    },
    getAttachmentDetail: function (data) {
      return window.api.call('worksheet', 'getAttachmentDetail', data);
    },
    getAttachmentShareId: function (data) {
      return window.api.call('worksheet', 'getAttachmentShareId', data);
    },
    getRowDetail: function (data) {
      return window.api.call('worksheet', 'getRowDetail', data);
    },
    checkRowEditLock: function (data) {
      return window.api.call('worksheet', 'checkRowEditLock', data);
    },
    getRowEditLock: function (data) {
      return window.api.call('worksheet', 'getRowEditLock', data);
    },
    cancelRowEditLock: function (data) {
      return window.api.call('worksheet', 'cancelRowEditLock', data);
    },
    getWorkItem: function (data) {
      return window.api.call('worksheet', 'getWorkItem', data);
    },
    getRowRelationRows: function (data) {
      return window.api.call('worksheet', 'getRowRelationRows', data);
    },
    addWorksheetRow: function (data) {
      return window.api.call('worksheet', 'addWorksheetRow', data);
    },
    saveDraftRow: function (data) {
      return window.api.call('worksheet', 'saveDraftRow', data);
    },
    addWSRowsBatch: function (data) {
      return window.api.call('worksheet', 'addWSRowsBatch', data);
    },
    updateWorksheetRow: function (data) {
      return window.api.call('worksheet', 'updateWorksheetRow', data);
    },
    checkFieldUnique: function (data) {
      return window.api.call('worksheet', 'checkFieldUnique', data);
    },
    updateWorksheetRows: function (data) {
      return window.api.call('worksheet', 'updateWorksheetRows', data);
    },
    updateRowRelationRows: function (data) {
      return window.api.call('worksheet', 'updateRowRelationRows', data);
    },
    replaceRowRelationRows: function (data) {
      return window.api.call('worksheet', 'replaceRowRelationRows', data);
    },
    refreshSummary: function (data) {
      return window.api.call('worksheet', 'refreshSummary', data);
    },
    refreshWorksheetRows: function (data) {
      return window.api.call('worksheet', 'refreshWorksheetRows', data);
    },
    deleteWorksheetRows: function (data) {
      return window.api.call('worksheet', 'deleteWorksheetRows', data);
    },
    restoreWorksheetRows: function (data) {
      return window.api.call('worksheet', 'restoreWorksheetRows', data);
    },
    removeWorksheetRows: function (data) {
      return window.api.call('worksheet', 'removeWorksheetRows', data);
    },
    getFilterRows: function (data) {
      return window.api.call('worksheet', 'getFilterRows', data);
    },
    getFilterRowsByQueryDefault: function (data) {
      return window.api.call('worksheet', 'getFilterRowsByQueryDefault', data);
    },
    getFilterRowsTotalNum: function (data) {
      return window.api.call('worksheet', 'getFilterRowsTotalNum', data);
    },
    getFilterRowsReport: function (data) {
      return window.api.call('worksheet', 'getFilterRowsReport', data);
    },
    getLogs: function (data) {
      return window.api.call('worksheet', 'getLogs', data);
    },
    getWorksheetOperationLogs: function (data) {
      return window.api.call('worksheet', 'getWorksheetOperationLogs', data);
    },
    getDetailTableLog: function (data) {
      return window.api.call('worksheet', 'getDetailTableLog', data);
    },
    batchGetWorksheetOperationLogs: function (data) {
      return window.api.call('worksheet', 'batchGetWorksheetOperationLogs', data);
    },
    updateWorksheetRowShareRange: function (data) {
      return window.api.call('worksheet', 'updateWorksheetRowShareRange', data);
    },
    getRowsShortUrl: function (data) {
      return window.api.call('worksheet', 'getRowsShortUrl', data);
    },
    copyRow: function (data) {
      return window.api.call('worksheet', 'copyRow', data);
    },
    getNavGroup: function (data) {
      return window.api.call('worksheet', 'getNavGroup', data);
    },
    getWorksheetArchives: function (data) {
      return window.api.call('worksheet', 'getWorksheetArchives', data);
    },
    saveWorksheetFilter: function (data) {
      return window.api.call('worksheet', 'saveWorksheetFilter', data);
    },
    getWorksheetFilters: function (data) {
      return window.api.call('worksheet', 'getWorksheetFilters', data);
    },
    getWorksheetFilterById: function (data) {
      return window.api.call('worksheet', 'getWorksheetFilterById', data);
    },
    deleteWorksheetFilter: function (data) {
      return window.api.call('worksheet', 'deleteWorksheetFilter', data);
    },
    sortWorksheetFilters: function (data) {
      return window.api.call('worksheet', 'sortWorksheetFilters', data);
    },
    saveWorksheetView: function (data) {
      return window.api.call('worksheet', 'saveWorksheetView', data);
    },
    getWorksheetViews: function (data) {
      return window.api.call('worksheet', 'getWorksheetViews', data);
    },
    getWorksheetViewById: function (data) {
      return window.api.call('worksheet', 'getWorksheetViewById', data);
    },
    deleteWorksheetView: function (data) {
      return window.api.call('worksheet', 'deleteWorksheetView', data);
    },
    restoreWorksheetView: function (data) {
      return window.api.call('worksheet', 'restoreWorksheetView', data);
    },
    copyWorksheetView: function (data) {
      return window.api.call('worksheet', 'copyWorksheetView', data);
    },
    sortWorksheetViews: function (data) {
      return window.api.call('worksheet', 'sortWorksheetViews', data);
    },
    copyWorksheetViewConfig: function (data) {
      return window.api.call('worksheet', 'copyWorksheetViewConfig', data);
    },
    editGenerateViewDefaultAlias: function (data) {
      return window.api.call('worksheet', 'editGenerateViewDefaultAlias', data);
    },
    editViewAlias: function (data) {
      return window.api.call('worksheet', 'editViewAlias', data);
    },
    getWorksheetBtns: function (data) {
      return window.api.call('worksheet', 'getWorksheetBtns', data);
    },
    checkWorksheetRowBtn: function (data) {
      return window.api.call('worksheet', 'checkWorksheetRowBtn', data);
    },
    checkWorksheetRowsBtn: function (data) {
      return window.api.call('worksheet', 'checkWorksheetRowsBtn', data);
    },
    getWorksheetBtnByID: function (data) {
      return window.api.call('worksheet', 'getWorksheetBtnByID', data);
    },
    optionWorksheetBtn: function (data) {
      return window.api.call('worksheet', 'optionWorksheetBtn', data);
    },
    saveWorksheetBtn: function (data) {
      return window.api.call('worksheet', 'saveWorksheetBtn', data);
    },
    copyWorksheetBtn: function (data) {
      return window.api.call('worksheet', 'copyWorksheetBtn', data);
    },
    getControlRules: function (data) {
      return window.api.call('worksheet', 'getControlRules', data);
    },
    saveControlRule: function (data) {
      return window.api.call('worksheet', 'saveControlRule', data);
    },
    sortControlRules: function (data) {
      return window.api.call('worksheet', 'sortControlRules', data);
    },
    saveWorksheetControls: function (data) {
      return window.api.call('worksheet', 'saveWorksheetControls', data);
    },
    addWorksheetControls: function (data) {
      return window.api.call('worksheet', 'addWorksheetControls', data);
    },
    getWorksheetControls: function (data) {
      return window.api.call('worksheet', 'getWorksheetControls', data);
    },
    getAiFieldRecommendation: function (data) {
      return window.api.call('worksheet', 'getAiFieldRecommendation', data);
    },
    getWorksheetsControls: function (data) {
      return window.api.call('worksheet', 'getWorksheetsControls', data);
    },
    editControlsAlias: function (data) {
      return window.api.call('worksheet', 'editControlsAlias', data);
    },
    editGenerateControlsDefaultAlias: function (data) {
      return window.api.call('worksheet', 'editGenerateControlsDefaultAlias', data);
    },
    editWorksheetControls: function (data) {
      return window.api.call('worksheet', 'editWorksheetControls', data);
    },
    resetControlIncrease: function (data) {
      return window.api.call('worksheet', 'resetControlIncrease', data);
    },
    deleteWorksheetAutoID: function (data) {
      return window.api.call('worksheet', 'deleteWorksheetAutoID', data);
    },
    editControlsStatus: function (data) {
      return window.api.call('worksheet', 'editControlsStatus', data);
    },
    getWorksheetReferences: function (data) {
      return window.api.call('worksheet', 'getWorksheetReferences', data);
    },
    getPrintList: function (data) {
      return window.api.call('worksheet', 'getPrintList', data);
    },
    getFormComponent: function (data) {
      return window.api.call('worksheet', 'getFormComponent', data);
    },
    getPrint: function (data) {
      return window.api.call('worksheet', 'getPrint', data);
    },
    getCodePrint: function (data) {
      return window.api.call('worksheet', 'getCodePrint', data);
    },
    getPrintTemplate: function (data) {
      return window.api.call('worksheet', 'getPrintTemplate', data);
    },
    editPrint: function (data) {
      return window.api.call('worksheet', 'editPrint', data);
    },
    editPrintFile: function (data) {
      return window.api.call('worksheet', 'editPrintFile', data);
    },
    saveRecordCodePrintConfig: function (data) {
      return window.api.call('worksheet', 'saveRecordCodePrintConfig', data);
    },
    editPrintName: function (data) {
      return window.api.call('worksheet', 'editPrintName', data);
    },
    editPrintRange: function (data) {
      return window.api.call('worksheet', 'editPrintRange', data);
    },
    editPrintFilter: function (data) {
      return window.api.call('worksheet', 'editPrintFilter', data);
    },
    editPrintTemplateSort: function (data) {
      return window.api.call('worksheet', 'editPrintTemplateSort', data);
    },
    deletePrint: function (data) {
      return window.api.call('worksheet', 'deletePrint', data);
    },
    getRowIndexes: function (data) {
      return window.api.call('worksheet', 'getRowIndexes', data);
    },
    addRowIndex: function (data) {
      return window.api.call('worksheet', 'addRowIndex', data);
    },
    updateRowIndex: function (data) {
      return window.api.call('worksheet', 'updateRowIndex', data);
    },
    updateRowIndexCustomeIndexName: function (data) {
      return window.api.call('worksheet', 'updateRowIndexCustomeIndexName', data);
    },
    removeRowIndex: function (data) {
      return window.api.call('worksheet', 'removeRowIndex', data);
    },
    getLinkDetail: function (data) {
      return window.api.call('worksheet', 'getLinkDetail', data);
    },
    getFormSubmissionSettings: function (data) {
      return window.api.call('worksheet', 'getFormSubmissionSettings', data);
    },
    editWorksheetSetting: function (data) {
      return window.api.call('worksheet', 'editWorksheetSetting', data);
    },
    getSwitch: function (data) {
      return window.api.call('worksheet', 'getSwitch', data);
    },
    editSwitch: function (data) {
      return window.api.call('worksheet', 'editSwitch', data);
    },
    batchEditSwitch: function (data) {
      return window.api.call('worksheet', 'batchEditSwitch', data);
    },
    getSwitchPermit: function (data) {
      return window.api.call('worksheet', 'getSwitchPermit', data);
    },
    getWorksheetApiInfo: function (data) {
      return window.api.call('worksheet', 'getWorksheetApiInfo', data);
    },
    getCollectionsByAppId: function (data) {
      return window.api.call('worksheet', 'getCollectionsByAppId', data);
    },
    saveOptionsCollection: function (data) {
      return window.api.call('worksheet', 'saveOptionsCollection', data);
    },
    updateOptionsCollectionAppId: function (data) {
      return window.api.call('worksheet', 'updateOptionsCollectionAppId', data);
    },
    deleteOptionsCollection: function (data) {
      return window.api.call('worksheet', 'deleteOptionsCollection', data);
    },
    getCollectionByCollectId: function (data) {
      return window.api.call('worksheet', 'getCollectionByCollectId', data);
    },
    getCollectionsByCollectIds: function (data) {
      return window.api.call('worksheet', 'getCollectionsByCollectIds', data);
    },
    getQuoteControlsById: function (data) {
      return window.api.call('worksheet', 'getQuoteControlsById', data);
    },
    addOrUpdateOptionSetApiInfo: function (data) {
      return window.api.call('worksheet', 'addOrUpdateOptionSetApiInfo', data);
    },
    optionSetListApiInfo: function (data) {
      return window.api.call('worksheet', 'optionSetListApiInfo', data);
    },
    ocr: function (data) {
      return window.api.call('worksheet', 'ocr', data);
    },
    getQuery: function (data) {
      return window.api.call('worksheet', 'getQuery', data);
    },
    getQueryBySheetId: function (data) {
      return window.api.call('worksheet', 'getQueryBySheetId', data);
    },
    saveQuery: function (data) {
      return window.api.call('worksheet', 'saveQuery', data);
    },
    saveFiltersGroup: function (data) {
      return window.api.call('worksheet', 'saveFiltersGroup', data);
    },
    getFiltersGroupByIds: function (data) {
      return window.api.call('worksheet', 'getFiltersGroupByIds', data);
    },
    deleteFiltersGroupByIds: function (data) {
      return window.api.call('worksheet', 'deleteFiltersGroupByIds', data);
    },
    excuteApiQuery: function (data) {
      return window.api.call('worksheet', 'excuteApiQuery', data);
    },
    getApiControlDetail: function (data) {
      return window.api.call('worksheet', 'getApiControlDetail', data);
    },
    sortAttachment: function (data) {
      return window.api.call('worksheet', 'sortAttachment', data);
    },
    editAttachmentName: function (data) {
      return window.api.call('worksheet', 'editAttachmentName', data);
    },
    getExportConfig: function (data) {
      return window.api.call('worksheet', 'getExportConfig', data);
    },
    saveExportConfig: function (data) {
      return window.api.call('worksheet', 'saveExportConfig', data);
    },
    getWorksheetCurrencyInfos: function (data) {
      return window.api.call('worksheet', 'getWorksheetCurrencyInfos', data);
    },
},
appManagement: {
    addRole: function (data) {
      return window.api.call('appManagement', 'addRole', data);
    },
    removeRole: function (data) {
      return window.api.call('appManagement', 'removeRole', data);
    },
    addRoleMembers: function (data) {
      return window.api.call('appManagement', 'addRoleMembers', data);
    },
    removeRoleMembers: function (data) {
      return window.api.call('appManagement', 'removeRoleMembers', data);
    },
    setRoleCharger: function (data) {
      return window.api.call('appManagement', 'setRoleCharger', data);
    },
    cancelRoleCharger: function (data) {
      return window.api.call('appManagement', 'cancelRoleCharger', data);
    },
    quitAppForRole: function (data) {
      return window.api.call('appManagement', 'quitAppForRole', data);
    },
    quitRole: function (data) {
      return window.api.call('appManagement', 'quitRole', data);
    },
    editAppRole: function (data) {
      return window.api.call('appManagement', 'editAppRole', data);
    },
    removeUserToRole: function (data) {
      return window.api.call('appManagement', 'removeUserToRole', data);
    },
    updateMemberStatus: function (data) {
      return window.api.call('appManagement', 'updateMemberStatus', data);
    },
    updateAppRoleNotify: function (data) {
      return window.api.call('appManagement', 'updateAppRoleNotify', data);
    },
    updateAppDebugModel: function (data) {
      return window.api.call('appManagement', 'updateAppDebugModel', data);
    },
    setDebugRoles: function (data) {
      return window.api.call('appManagement', 'setDebugRoles', data);
    },
    copyRole: function (data) {
      return window.api.call('appManagement', 'copyRole', data);
    },
    copyRoleToExternalPortal: function (data) {
      return window.api.call('appManagement', 'copyRoleToExternalPortal', data);
    },
    copyExternalRolesToInternal: function (data) {
      return window.api.call('appManagement', 'copyExternalRolesToInternal', data);
    },
    sortRoles: function (data) {
      return window.api.call('appManagement', 'sortRoles', data);
    },
    getAppRoleSetting: function (data) {
      return window.api.call('appManagement', 'getAppRoleSetting', data);
    },
    getRolesWithUsers: function (data) {
      return window.api.call('appManagement', 'getRolesWithUsers', data);
    },
    getSimpleRoles: function (data) {
      return window.api.call('appManagement', 'getSimpleRoles', data);
    },
    getTotalMember: function (data) {
      return window.api.call('appManagement', 'getTotalMember', data);
    },
    getRolesByMemberId: function (data) {
      return window.api.call('appManagement', 'getRolesByMemberId', data);
    },
    getOutsourcingMembers: function (data) {
      return window.api.call('appManagement', 'getOutsourcingMembers', data);
    },
    getAppRoleSummary: function (data) {
      return window.api.call('appManagement', 'getAppRoleSummary', data);
    },
    getDebugRoles: function (data) {
      return window.api.call('appManagement', 'getDebugRoles', data);
    },
    getMembersByRole: function (data) {
      return window.api.call('appManagement', 'getMembersByRole', data);
    },
    batchEditMemberRole: function (data) {
      return window.api.call('appManagement', 'batchEditMemberRole', data);
    },
    batchMemberQuitApp: function (data) {
      return window.api.call('appManagement', 'batchMemberQuitApp', data);
    },
    getRoleDetail: function (data) {
      return window.api.call('appManagement', 'getRoleDetail', data);
    },
    getAddRoleTemplate: function (data) {
      return window.api.call('appManagement', 'getAddRoleTemplate', data);
    },
    getAppForManager: function (data) {
      return window.api.call('appManagement', 'getAppForManager', data);
    },
    getManagerApps: function (data) {
      return window.api.call('appManagement', 'getManagerApps', data);
    },
    refresh: function (data) {
      return window.api.call('appManagement', 'refresh', data);
    },
    getUserIdApps: function (data) {
      return window.api.call('appManagement', 'getUserIdApps', data);
    },
    replaceRoleMemberForApps: function (data) {
      return window.api.call('appManagement', 'replaceRoleMemberForApps', data);
    },
    getUserApp: function (data) {
      return window.api.call('appManagement', 'getUserApp', data);
    },
    getMyApp: function (data) {
      return window.api.call('appManagement', 'getMyApp', data);
    },
    getAppsForProject: function (data) {
      return window.api.call('appManagement', 'getAppsForProject', data);
    },
    getAppsByProject: function (data) {
      return window.api.call('appManagement', 'getAppsByProject', data);
    },
    getApps: function (data) {
      return window.api.call('appManagement', 'getApps', data);
    },
    getToken: function (data) {
      return window.api.call('appManagement', 'getToken', data);
    },
    editAppStatus: function (data) {
      return window.api.call('appManagement', 'editAppStatus', data);
    },
    checkIsAppAdmin: function (data) {
      return window.api.call('appManagement', 'checkIsAppAdmin', data);
    },
    checkAppAdminForUser: function (data) {
      return window.api.call('appManagement', 'checkAppAdminForUser', data);
    },
    addRoleMemberForAppAdmin: function (data) {
      return window.api.call('appManagement', 'addRoleMemberForAppAdmin', data);
    },
    removeWorkSheetAscription: function (data) {
      return window.api.call('appManagement', 'removeWorkSheetAscription', data);
    },
    removeWorkSheetForApp: function (data) {
      return window.api.call('appManagement', 'removeWorkSheetForApp', data);
    },
    getAppItemRecoveryList: function (data) {
      return window.api.call('appManagement', 'getAppItemRecoveryList', data);
    },
    appItemRecovery: function (data) {
      return window.api.call('appManagement', 'appItemRecovery', data);
    },
    editWorkSheetInfoForApp: function (data) {
      return window.api.call('appManagement', 'editWorkSheetInfoForApp', data);
    },
    updateAppOwner: function (data) {
      return window.api.call('appManagement', 'updateAppOwner', data);
    },
    addWorkSheet: function (data) {
      return window.api.call('appManagement', 'addWorkSheet', data);
    },
    addSheet: function (data) {
      return window.api.call('appManagement', 'addSheet', data);
    },
    changeSheet: function (data) {
      return window.api.call('appManagement', 'changeSheet', data);
    },
    copyCustomPage: function (data) {
      return window.api.call('appManagement', 'copyCustomPage', data);
    },
    addAuthorize: function (data) {
      return window.api.call('appManagement', 'addAuthorize', data);
    },
    getAuthorizes: function (data) {
      return window.api.call('appManagement', 'getAuthorizes', data);
    },
    getAuthorizeSheet: function (data) {
      return window.api.call('appManagement', 'getAuthorizeSheet', data);
    },
    getAuthorizeSheetTemple: function (data) {
      return window.api.call('appManagement', 'getAuthorizeSheetTemple', data);
    },
    editAuthorizeStatus: function (data) {
      return window.api.call('appManagement', 'editAuthorizeStatus', data);
    },
    deleteAuthorizeStatus: function (data) {
      return window.api.call('appManagement', 'deleteAuthorizeStatus', data);
    },
    editAuthorizeRemark: function (data) {
      return window.api.call('appManagement', 'editAuthorizeRemark', data);
    },
    getWeiXinBindingInfo: function (data) {
      return window.api.call('appManagement', 'getWeiXinBindingInfo', data);
    },
    migrate: function (data) {
      return window.api.call('appManagement', 'migrate', data);
    },
    getAppApplyInfo: function (data) {
      return window.api.call('appManagement', 'getAppApplyInfo', data);
    },
    addAppApply: function (data) {
      return window.api.call('appManagement', 'addAppApply', data);
    },
    editAppApplyStatus: function (data) {
      return window.api.call('appManagement', 'editAppApplyStatus', data);
    },
    getIcon: function (data) {
      return window.api.call('appManagement', 'getIcon', data);
    },
    addCustomIcon: function (data) {
      return window.api.call('appManagement', 'addCustomIcon', data);
    },
    deleteCustomIcon: function (data) {
      return window.api.call('appManagement', 'deleteCustomIcon', data);
    },
    getCustomIconByProject: function (data) {
      return window.api.call('appManagement', 'getCustomIconByProject', data);
    },
    getAppsCategoryInfo: function (data) {
      return window.api.call('appManagement', 'getAppsCategoryInfo', data);
    },
    getAppsLibraryInfo: function (data) {
      return window.api.call('appManagement', 'getAppsLibraryInfo', data);
    },
    installApp: function (data) {
      return window.api.call('appManagement', 'installApp', data);
    },
    getAppLibraryDetail: function (data) {
      return window.api.call('appManagement', 'getAppLibraryDetail', data);
    },
    getLibraryToken: function (data) {
      return window.api.call('appManagement', 'getLibraryToken', data);
    },
    getLogs: function (data) {
      return window.api.call('appManagement', 'getLogs', data);
    },
    getExportsByApp: function (data) {
      return window.api.call('appManagement', 'getExportsByApp', data);
    },
    getExportPassword: function (data) {
      return window.api.call('appManagement', 'getExportPassword', data);
    },
    addWorkflow: function (data) {
      return window.api.call('appManagement', 'addWorkflow', data);
    },
    getEntityShare: function (data) {
      return window.api.call('appManagement', 'getEntityShare', data);
    },
    editEntityShareStatus: function (data) {
      return window.api.call('appManagement', 'editEntityShareStatus', data);
    },
    getEntityShareById: function (data) {
      return window.api.call('appManagement', 'getEntityShareById', data);
    },
    deleteBackupFile: function (data) {
      return window.api.call('appManagement', 'deleteBackupFile', data);
    },
    pageGetBackupRestoreOperationLog: function (data) {
      return window.api.call('appManagement', 'pageGetBackupRestoreOperationLog', data);
    },
    getAppSupportInfo: function (data) {
      return window.api.call('appManagement', 'getAppSupportInfo', data);
    },
    renameBackupFileName: function (data) {
      return window.api.call('appManagement', 'renameBackupFileName', data);
    },
    getValidBackupFileInfo: function (data) {
      return window.api.call('appManagement', 'getValidBackupFileInfo', data);
    },
    restore: function (data) {
      return window.api.call('appManagement', 'restore', data);
    },
    restoreData: function (data) {
      return window.api.call('appManagement', 'restoreData', data);
    },
    backup: function (data) {
      return window.api.call('appManagement', 'backup', data);
    },
    checkRestoreFile: function (data) {
      return window.api.call('appManagement', 'checkRestoreFile', data);
    },
    getTarTaskInfo: function (data) {
      return window.api.call('appManagement', 'getTarTaskInfo', data);
    },
    allUsageOverviewStatistics: function (data) {
      return window.api.call('appManagement', 'allUsageOverviewStatistics', data);
    },
    appUsageOverviewStatistics: function (data) {
      return window.api.call('appManagement', 'appUsageOverviewStatistics', data);
    },
    usageStatisticsForDimension: function (data) {
      return window.api.call('appManagement', 'usageStatisticsForDimension', data);
    },
    getGlobalLogs: function (data) {
      return window.api.call('appManagement', 'getGlobalLogs', data);
    },
    getArchivedGlobalLogs: function (data) {
      return window.api.call('appManagement', 'getArchivedGlobalLogs', data);
    },
    getArchivedList: function (data) {
      return window.api.call('appManagement', 'getArchivedList', data);
    },
    getWorksheetsUnderTheApp: function (data) {
      return window.api.call('appManagement', 'getWorksheetsUnderTheApp', data);
    },
    addLock: function (data) {
      return window.api.call('appManagement', 'addLock', data);
    },
    unlock: function (data) {
      return window.api.call('appManagement', 'unlock', data);
    },
    editLockPassword: function (data) {
      return window.api.call('appManagement', 'editLockPassword', data);
    },
    resetLock: function (data) {
      return window.api.call('appManagement', 'resetLock', data);
    },
    closeLock: function (data) {
      return window.api.call('appManagement', 'closeLock', data);
    },
    marketAppUpgrade: function (data) {
      return window.api.call('appManagement', 'marketAppUpgrade', data);
    },
    marketUpgrade: function (data) {
      return window.api.call('appManagement', 'marketUpgrade', data);
    },
    checkUpgrade: function (data) {
      return window.api.call('appManagement', 'checkUpgrade', data);
    },
    getWorksheetUpgrade: function (data) {
      return window.api.call('appManagement', 'getWorksheetUpgrade', data);
    },
    upgrade: function (data) {
      return window.api.call('appManagement', 'upgrade', data);
    },
    getUpgradeLogs: function (data) {
      return window.api.call('appManagement', 'getUpgradeLogs', data);
    },
    getMdyInfo: function (data) {
      return window.api.call('appManagement', 'getMdyInfo', data);
    },
    batchExportApp: function (data) {
      return window.api.call('appManagement', 'batchExportApp', data);
    },
    getsByUnionId: function (data) {
      return window.api.call('appManagement', 'getsByUnionId', data);
    },
    getBatchId: function (data) {
      return window.api.call('appManagement', 'getBatchId', data);
    },
    batchImportCheck: function (data) {
      return window.api.call('appManagement', 'batchImportCheck', data);
    },
    batchImport: function (data) {
      return window.api.call('appManagement', 'batchImport', data);
    },
    getAppLangs: function (data) {
      return window.api.call('appManagement', 'getAppLangs', data);
    },
    createAppLang: function (data) {
      return window.api.call('appManagement', 'createAppLang', data);
    },
    deleteAppLang: function (data) {
      return window.api.call('appManagement', 'deleteAppLang', data);
    },
    getAppLangDetail: function (data) {
      return window.api.call('appManagement', 'getAppLangDetail', data);
    },
    editAppLang: function (data) {
      return window.api.call('appManagement', 'editAppLang', data);
    },
    machineTranslation: function (data) {
      return window.api.call('appManagement', 'machineTranslation', data);
    },
    getAppStructureForER: function (data) {
      return window.api.call('appManagement', 'getAppStructureForER', data);
    },
    getProjectLangs: function (data) {
      return window.api.call('appManagement', 'getProjectLangs', data);
    },
    getsByProjectIds: function (data) {
      return window.api.call('appManagement', 'getsByProjectIds', data);
    },
    editProjectLangs: function (data) {
      return window.api.call('appManagement', 'editProjectLangs', data);
    },
    editPasswordRegexTipLangs: function (data) {
      return window.api.call('appManagement', 'editPasswordRegexTipLangs', data);
    },
    getProjectLang: function (data) {
      return window.api.call('appManagement', 'getProjectLang', data);
    },
    addOfflineItem: function (data) {
      return window.api.call('appManagement', 'addOfflineItem', data);
    },
    editOfflineItemStatus: function (data) {
      return window.api.call('appManagement', 'editOfflineItemStatus', data);
    },
    getOfflineItems: function (data) {
      return window.api.call('appManagement', 'getOfflineItems', data);
    },
    getBackupTask: function (data) {
      return window.api.call('appManagement', 'getBackupTask', data);
    },
    editBackupTaskStatus: function (data) {
      return window.api.call('appManagement', 'editBackupTaskStatus', data);
    },
    editBackupTaskInfo: function (data) {
      return window.api.call('appManagement', 'editBackupTaskInfo', data);
    },
},
homeApp: {
    createApp: function (data) {
      return window.api.call('homeApp', 'createApp', data);
    },
    deleteApp: function (data) {
      return window.api.call('homeApp', 'deleteApp', data);
    },
    getAppRecoveryRecordList: function (data) {
      return window.api.call('homeApp', 'getAppRecoveryRecordList', data);
    },
    appRecycleBinDelete: function (data) {
      return window.api.call('homeApp', 'appRecycleBinDelete', data);
    },
    restoreApp: function (data) {
      return window.api.call('homeApp', 'restoreApp', data);
    },
    editAppTimeZones: function (data) {
      return window.api.call('homeApp', 'editAppTimeZones', data);
    },
    editAppOriginalLang: function (data) {
      return window.api.call('homeApp', 'editAppOriginalLang', data);
    },
    markApp: function (data) {
      return window.api.call('homeApp', 'markApp', data);
    },
    editAppInfo: function (data) {
      return window.api.call('homeApp', 'editAppInfo', data);
    },
    updateAppSort: function (data) {
      return window.api.call('homeApp', 'updateAppSort', data);
    },
    copyApp: function (data) {
      return window.api.call('homeApp', 'copyApp', data);
    },
    publishSettings: function (data) {
      return window.api.call('homeApp', 'publishSettings', data);
    },
    editWhiteList: function (data) {
      return window.api.call('homeApp', 'editWhiteList', data);
    },
    editFix: function (data) {
      return window.api.call('homeApp', 'editFix', data);
    },
    editSSOAddress: function (data) {
      return window.api.call('homeApp', 'editSSOAddress', data);
    },
    getAllHomeApp: function (data) {
      return window.api.call('homeApp', 'getAllHomeApp', data);
    },
    getWorksheetsByAppId: function (data) {
      return window.api.call('homeApp', 'getWorksheetsByAppId', data);
    },
    getAttachementImages: function (data) {
      return window.api.call('homeApp', 'getAttachementImages', data);
    },
    getPageInfo: function (data) {
      return window.api.call('homeApp', 'getPageInfo', data);
    },
    getAppItemDetail: function (data) {
      return window.api.call('homeApp', 'getAppItemDetail', data);
    },
    getApp: function (data) {
      return window.api.call('homeApp', 'getApp', data);
    },
    checkApp: function (data) {
      return window.api.call('homeApp', 'checkApp', data);
    },
    getAppFirstInfo: function (data) {
      return window.api.call('homeApp', 'getAppFirstInfo', data);
    },
    getAppSimpleInfo: function (data) {
      return window.api.call('homeApp', 'getAppSimpleInfo', data);
    },
    getAppSectionDetail: function (data) {
      return window.api.call('homeApp', 'getAppSectionDetail', data);
    },
    addAppSection: function (data) {
      return window.api.call('homeApp', 'addAppSection', data);
    },
    updateAppSectionName: function (data) {
      return window.api.call('homeApp', 'updateAppSectionName', data);
    },
    updateAppSection: function (data) {
      return window.api.call('homeApp', 'updateAppSection', data);
    },
    deleteAppSection: function (data) {
      return window.api.call('homeApp', 'deleteAppSection', data);
    },
    updateAppSectionSort: function (data) {
      return window.api.call('homeApp', 'updateAppSectionSort', data);
    },
    updateSectionChildSort: function (data) {
      return window.api.call('homeApp', 'updateSectionChildSort', data);
    },
    setWorksheetStatus: function (data) {
      return window.api.call('homeApp', 'setWorksheetStatus', data);
    },
    getApiInfo: function (data) {
      return window.api.call('homeApp', 'getApiInfo', data);
    },
    getMyApp: function (data) {
      return window.api.call('homeApp', 'getMyApp', data);
    },
    getGroup: function (data) {
      return window.api.call('homeApp', 'getGroup', data);
    },
    addToGroup: function (data) {
      return window.api.call('homeApp', 'addToGroup', data);
    },
    removeToGroup: function (data) {
      return window.api.call('homeApp', 'removeToGroup', data);
    },
    markedGroup: function (data) {
      return window.api.call('homeApp', 'markedGroup', data);
    },
    addGroup: function (data) {
      return window.api.call('homeApp', 'addGroup', data);
    },
    editGroup: function (data) {
      return window.api.call('homeApp', 'editGroup', data);
    },
    deleteGroup: function (data) {
      return window.api.call('homeApp', 'deleteGroup', data);
    },
    editGroupSort: function (data) {
      return window.api.call('homeApp', 'editGroupSort', data);
    },
    editHomeSetting: function (data) {
      return window.api.call('homeApp', 'editHomeSetting', data);
    },
    markApps: function (data) {
      return window.api.call('homeApp', 'markApps', data);
    },
    editPlatformSetting: function (data) {
      return window.api.call('homeApp', 'editPlatformSetting', data);
    },
    myPlatform: function (data) {
      return window.api.call('homeApp', 'myPlatform', data);
    },
    marketApps: function (data) {
      return window.api.call('homeApp', 'marketApps', data);
    },
    recentApps: function (data) {
      return window.api.call('homeApp', 'recentApps', data);
    },
    getAppIdsAndItemIdsTest: function (data) {
      return window.api.call('homeApp', 'getAppIdsAndItemIdsTest', data);
    },
    myPlatformLang: function (data) {
      return window.api.call('homeApp', 'myPlatformLang', data);
    },
    getAppItems: function (data) {
      return window.api.call('homeApp', 'getAppItems', data);
    },
    getHomePlatformSetting: function (data) {
      return window.api.call('homeApp', 'getHomePlatformSetting', data);
    },
    getOwnedApp: function (data) {
      return window.api.call('homeApp', 'getOwnedApp', data);
    },
    getMyDbInstances: function (data) {
      return window.api.call('homeApp', 'getMyDbInstances', data);
    },
},
actionLog: {
    getActionLogs: function (data) {
      return window.api.call('actionLog', 'getActionLogs', data);
    },
    getOrgLogs: function (data) {
      return window.api.call('actionLog', 'getOrgLogs', data);
    },
    getAccountDevices: function (data) {
      return window.api.call('actionLog', 'getAccountDevices', data);
    },
    addLog: function (data) {
      return window.api.call('actionLog', 'addLog', data);
    },
},
instance: {
    count: function (data) {
      return window.api.call('instance', 'count', data);
    },
    forward: function (data) {
      return window.api.call('instance', 'forward', data);
    },
    getArchivedList: function (data) {
      return window.api.call('instance', 'getArchivedList', data);
    },
    getHistoryDetail: function (data) {
      return window.api.call('instance', 'getHistoryDetail', data);
    },
    getHistoryList: function (data) {
      return window.api.call('instance', 'getHistoryList', data);
    },
    getInstance: function (data) {
      return window.api.call('instance', 'getInstance', data);
    },
    getOperationDetail: function (data) {
      return window.api.call('instance', 'getOperationDetail', data);
    },
    getOperationHistoryList: function (data) {
      return window.api.call('instance', 'getOperationHistoryList', data);
    },
    operation: function (data) {
      return window.api.call('instance', 'operation', data);
    },
    overrule: function (data) {
      return window.api.call('instance', 'overrule', data);
    },
    pass: function (data) {
      return window.api.call('instance', 'pass', data);
    },
    restart: function (data) {
      return window.api.call('instance', 'restart', data);
    },
    revoke: function (data) {
      return window.api.call('instance', 'revoke', data);
    },
    signTask: function (data) {
      return window.api.call('instance', 'signTask', data);
    },
    submit: function (data) {
      return window.api.call('instance', 'submit', data);
    },
    taskRevoke: function (data) {
      return window.api.call('instance', 'taskRevoke', data);
    },
    transfer: function (data) {
      return window.api.call('instance', 'transfer', data);
    },
},
instanceVersion: {
    cover: function (data) {
      return window.api.call('instanceVersion', 'cover', data);
    },
    get2: function (data) {
      return window.api.call('instanceVersion', 'get2', data);
    },
    getTodoCount2: function (data) {
      return window.api.call('instanceVersion', 'getTodoCount2', data);
    },
    getTodoList2: function (data) {
      return window.api.call('instanceVersion', 'getTodoList2', data);
    },
    batch: function (data) {
      return window.api.call('instanceVersion', 'batch', data);
    },
    endInstance: function (data) {
      return window.api.call('instanceVersion', 'endInstance', data);
    },
    endInstanceList: function (data) {
      return window.api.call('instanceVersion', 'endInstanceList', data);
    },
    get: function (data) {
      return window.api.call('instanceVersion', 'get', data);
    },
    getTodoCount: function (data) {
      return window.api.call('instanceVersion', 'getTodoCount', data);
    },
    getTodoList: function (data) {
      return window.api.call('instanceVersion', 'getTodoList', data);
    },
    getTodoListFilter: function (data) {
      return window.api.call('instanceVersion', 'getTodoListFilter', data);
    },
    getWorkItem: function (data) {
      return window.api.call('instanceVersion', 'getWorkItem', data);
    },
    resetInstance: function (data) {
      return window.api.call('instanceVersion', 'resetInstance', data);
    },
    resetInstanceList: function (data) {
      return window.api.call('instanceVersion', 'resetInstanceList', data);
    },
},
process: {
    addProcess: function (data) {
      return window.api.call('process', 'addProcess', data);
    },
    closeStorePush: function (data) {
      return window.api.call('process', 'closeStorePush', data);
    },
    copyProcess: function (data) {
      return window.api.call('process', 'copyProcess', data);
    },
    deleteProcess: function (data) {
      return window.api.call('process', 'deleteProcess', data);
    },
    getHistory: function (data) {
      return window.api.call('process', 'getHistory', data);
    },
    getProcessApiInfo: function (data) {
      return window.api.call('process', 'getProcessApiInfo', data);
    },
    getProcessByControlId: function (data) {
      return window.api.call('process', 'getProcessByControlId', data);
    },
    getProcessById: function (data) {
      return window.api.call('process', 'getProcessById', data);
    },
    getProcessByTriggerId: function (data) {
      return window.api.call('process', 'getProcessByTriggerId', data);
    },
    getProcessConfig: function (data) {
      return window.api.call('process', 'getProcessConfig', data);
    },
    getProcessListApi: function (data) {
      return window.api.call('process', 'getProcessListApi', data);
    },
    getProcessPublish: function (data) {
      return window.api.call('process', 'getProcessPublish', data);
    },
    getStore: function (data) {
      return window.api.call('process', 'getStore', data);
    },
    getTriggerProcessList: function (data) {
      return window.api.call('process', 'getTriggerProcessList', data);
    },
    goBack: function (data) {
      return window.api.call('process', 'goBack', data);
    },
    move: function (data) {
      return window.api.call('process', 'move', data);
    },
    publish: function (data) {
      return window.api.call('process', 'publish', data);
    },
    saveProcessConfig: function (data) {
      return window.api.call('process', 'saveProcessConfig', data);
    },
    startProcess: function (data) {
      return window.api.call('process', 'startProcess', data);
    },
    startProcessById: function (data) {
      return window.api.call('process', 'startProcessById', data);
    },
    startProcessByPBC: function (data) {
      return window.api.call('process', 'startProcessByPBC', data);
    },
    updateProcess: function (data) {
      return window.api.call('process', 'updateProcess', data);
    },
    updateOwner: function (data) {
      return window.api.call('process', 'updateOwner', data);
    },
    updateUseStatus: function (data) {
      return window.api.call('process', 'updateUseStatus', data);
    },
},
processVersion: {
    batch: function (data) {
      return window.api.call('processVersion', 'batch', data);
    },
    getDifferenceByCompanyId: function (data) {
      return window.api.call('processVersion', 'getDifferenceByCompanyId', data);
    },
    getDifferenceByProcessId: function (data) {
      return window.api.call('processVersion', 'getDifferenceByProcessId', data);
    },
    getDifferenceProcessCount: function (data) {
      return window.api.call('processVersion', 'getDifferenceProcessCount', data);
    },
    getDifferenceProcessList: function (data) {
      return window.api.call('processVersion', 'getDifferenceProcessList', data);
    },
    getDifferenceProcessListByIds: function (data) {
      return window.api.call('processVersion', 'getDifferenceProcessListByIds', data);
    },
    getHistoryDifferenceByCompanyId: function (data) {
      return window.api.call('processVersion', 'getHistoryDifferenceByCompanyId', data);
    },
    getHistoryDifferenceByProcessId: function (data) {
      return window.api.call('processVersion', 'getHistoryDifferenceByProcessId', data);
    },
    getRouterList: function (data) {
      return window.api.call('processVersion', 'getRouterList', data);
    },
    getWarning: function (data) {
      return window.api.call('processVersion', 'getWarning', data);
    },
    init: function (data) {
      return window.api.call('processVersion', 'init', data);
    },
    remove: function (data) {
      return window.api.call('processVersion', 'remove', data);
    },
    reset: function (data) {
      return window.api.call('processVersion', 'reset', data);
    },
    updateRouterIndex: function (data) {
      return window.api.call('processVersion', 'updateRouterIndex', data);
    },
    updateWaiting: function (data) {
      return window.api.call('processVersion', 'updateWaiting', data);
    },
    updateWarning: function (data) {
      return window.api.call('processVersion', 'updateWarning', data);
    },
    count: function (data) {
      return window.api.call('processVersion', 'count', data);
    },
    getProcessByCompanyId: function (data) {
      return window.api.call('processVersion', 'getProcessByCompanyId', data);
    },
    getProcessRole: function (data) {
      return window.api.call('processVersion', 'getProcessRole', data);
    },
    getProcessUseCount: function (data) {
      return window.api.call('processVersion', 'getProcessUseCount', data);
    },
    list: function (data) {
      return window.api.call('processVersion', 'list', data);
    },
    listAll: function (data) {
      return window.api.call('processVersion', 'listAll', data);
    },
    removeProcess: function (data) {
      return window.api.call('processVersion', 'removeProcess', data);
    },
    restoreProcess: function (data) {
      return window.api.call('processVersion', 'restoreProcess', data);
    },
},
delegation: {
    add: function (data) {
      return window.api.call('delegation', 'add', data);
    },
    getList: function (data) {
      return window.api.call('delegation', 'getList', data);
    },
    getListByCompanyId: function (data) {
      return window.api.call('delegation', 'getListByCompanyId', data);
    },
    getListByPrincipals: function (data) {
      return window.api.call('delegation', 'getListByPrincipals', data);
    },
    update: function (data) {
      return window.api.call('delegation', 'update', data);
    },
},
qiniu: {
    getUploadToken: function (data) {
      return window.api.call('qiniu', 'getUploadToken', data);
    },
    getFileUploadToken: function (data) {
      return window.api.call('qiniu', 'getFileUploadToken', data);
    },
},
plugin: {
    create: function (data) {
      return window.api.call('plugin', 'create', data);
    },
    edit: function (data) {
      return window.api.call('plugin', 'edit', data);
    },
    getDetail: function (data) {
      return window.api.call('plugin', 'getDetail', data);
    },
    checkExists: function (data) {
      return window.api.call('plugin', 'checkExists', data);
    },
    getList: function (data) {
      return window.api.call('plugin', 'getList', data);
    },
    getAll: function (data) {
      return window.api.call('plugin', 'getAll', data);
    },
    remove: function (data) {
      return window.api.call('plugin', 'remove', data);
    },
    release: function (data) {
      return window.api.call('plugin', 'release', data);
    },
    rollback: function (data) {
      return window.api.call('plugin', 'rollback', data);
    },
    getReleaseHistory: function (data) {
      return window.api.call('plugin', 'getReleaseHistory', data);
    },
    removeRelease: function (data) {
      return window.api.call('plugin', 'removeRelease', data);
    },
    commit: function (data) {
      return window.api.call('plugin', 'commit', data);
    },
    removeCommit: function (data) {
      return window.api.call('plugin', 'removeCommit', data);
    },
    getCommitHistory: function (data) {
      return window.api.call('plugin', 'getCommitHistory', data);
    },
    getUseDetail: function (data) {
      return window.api.call('plugin', 'getUseDetail', data);
    },
    import: function (data) {
      return window.api.call('plugin', 'import', data);
    },
    export: function (data) {
      return window.api.call('plugin', 'export', data);
    },
    getExportHistory: function (data) {
      return window.api.call('plugin', 'getExportHistory', data);
    },
    getPluginListBySourece: function (data) {
      return window.api.call('plugin', 'getPluginListBySourece', data);
    },
    stateSave: function (data) {
      return window.api.call('plugin', 'stateSave', data);
    },
    stateRead: function (data) {
      return window.api.call('plugin', 'stateRead', data);
    },
},

}