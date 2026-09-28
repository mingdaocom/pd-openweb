import React from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import { useExportAttachment } from 'worksheet/common/ExportAttachment';
import { useExportSheet } from 'worksheet/common/ExportSheet';
import IconText from 'worksheet/components/IconText';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { permitList } from 'src/utils/domain/control/formEnum';
import { filterHidedControls } from 'src/utils/domain/control/sort';
import { canEditData } from 'src/utils/domain/permission/app';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { getFeatureStatus } from 'src/utils/services/project';

const EXPORT_LIST = [
  {
    name: _l('导出记录') + '（Excel，CSV）',
    icon: 'new_excel',
    exportType: 1,
    key: 'exportRecord',
  },
  {
    name: _l('导出附件'),
    icon: 'attachment',
    exportType: 2,
    key: 'exportAttachment',
  },
];

export default function ExportList(props) {
  const {
    isCharge,
    permissionType,
    count,
    allWorksheetIsSelected,
    appId,
    view,
    worksheetId,
    filters,
    sheetSwitchPermit,
    selectedRows = [],
    controls,
    worksheetInfo = {},
    rowsSummary,
    quickFilter,
    sortControls,
    filtersGroup,
    navGroupFilters,
  } = props;
  const { downLoadUrl, projectId } = worksheetInfo;
  const { open: exportAttachment, holder: exportAttachmentHolder } = useExportAttachment();
  const { open: exportSheet, holder: exportSheetHolder } = useExportSheet();
  const attachmentControls =
    isCharge || canEditData(permissionType)
      ? controls.filter(item => item.type === 14)
      : filterHidedControls(controls, view.controls).filter(item => {
          const controlPermissions = item.controlPermissions || '111';
          const fieldPermission = item.fieldPermission || '111';
          return item.type === 14 && fieldPermission[0] === '1' && controlPermissions[0] === '1';
        });

  const featureType = getFeatureStatus(projectId, VersionProductType.batchDownloadFiles);
  const menuItems = EXPORT_LIST.filter(item => item.exportType !== 2 || !_.isEmpty(attachmentControls)).map(item => ({
    key: item.key,
    icon: <Icon icon={item.icon} className="Font18" />,
    label: item.name,
    onClick: () => {
      if (window.isPublicApp) {
        alert(_l('预览模式下，不能操作'), 3);
        return;
      }

      const hasCharge = isCharge || canEditData(permissionType);

      if (item.exportType === 1) {
        exportSheet({
          allCount: count,
          allWorksheetIsSelected: allWorksheetIsSelected,
          appId: appId,
          exportView: view,
          worksheetId,
          projectId: projectId,
          searchArgs: filters,
          sheetSwitchPermit,
          selectRowIds: selectedRows.map(item => item.rowid),
          columns: hasCharge
            ? controls.filter(item => {
                return item.controlId !== 'rowid';
              })
            : filterHidedControls(controls, view.controls, false).filter(item => {
                return (
                  ((item.controlPermissions && item.controlPermissions[0] === '1') || !item.controlPermissions) &&
                  item.controlId !== 'rowid'
                );
              }),
          downLoadUrl: downLoadUrl,
          worksheetSummaryTypes: rowsSummary.types,
          quickFilter,
          filtersGroup,
          navGroupFilters,
          sortControls,
          isCharge: hasCharge,
          // 不支持列统计结果
          hideStatistics: true,
        });
        return;
      }

      const allowDownload = isOpenPermit(permitList.recordAttachmentSwitch, sheetSwitchPermit, view.viewId);

      if (!allowDownload) {
        return alert(_l('无附件下载权限，无法导出'), 2);
      }

      if (featureType === '2') {
        buriedUpgradeVersionDialog(projectId, VersionProductType.batchDownloadFiles);
        return;
      }

      exportAttachment({
        appId,
        worksheetId,
        viewId: view.viewId,
        attachmentControls,
        selectRowIds: selectedRows.map(item => item.rowid),
        quickFilter,
        searchArgs: filters,
        filtersGroup,
        navGroupFilters,
        isCharge: isCharge || canEditData(permissionType),
      });
    },
  }));

  return (
    <div>
      {exportAttachmentHolder}
      {exportSheetHolder}
      <Dropdown
        trigger={['click']}
        placement="bottomLeft"
        menu={{
          items: menuItems,
          style: { minWidth: 230 },
        }}
      >
        <div>
          <IconText
            dataEvent="export"
            icon="worksheet_export"
            textCmp={() => (
              <>
                {_l('导出')}
                <Icon icon="arrow-down-border" className="printDownIcon" />
              </>
            )}
          />
        </div>
      </Dropdown>
    </div>
  );
}
