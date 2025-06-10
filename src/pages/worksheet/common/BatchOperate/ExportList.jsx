import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, Menu, MenuItem } from 'ming-ui';
import { exportAttachment } from 'worksheet/common/ExportAttachment';
import { exportSheet } from 'worksheet/common/ExportSheet';
import IconText from 'worksheet/components/IconText';
import { canEditData } from 'worksheet/redux/actions/util';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { permitList } from 'src/pages/FormSet/config';
import { isOpenPermit } from 'src/pages/FormSet/util';
import { filterHidedControls } from 'src/utils/control';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';

const Con = styled.div`
  position: relative;
  .ming.exportMenu {
    width: 280px;
    margin-top: 4px;
  }
`;

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
  const [menuVisible, setMenuVisible] = useState(false);
  const attachmentControls =
    isCharge || canEditData(permissionType)
      ? controls.filter(item => item.type === 14)
      : filterHidedControls(controls, view.controls).filter(item => {
          const controlPermissions = item.controlPermissions || '111';
          const fieldPermission = item.fieldPermission || '111';
          return item.type === 14 && fieldPermission[0] === '1' && controlPermissions[0] === '1';
        });

  const featureType = getFeatureStatus(projectId, VersionProductType.batchDownloadFiles);

  useEffect(() => {}, []);
  return (
    <Con>
      <IconText
        dataEvent="export"
        icon="file_download"
        textCmp={() => {
          return (
            <Fragment>
              {_l('导出')}
              <Icon icon="arrow-down-border" className="printDownIcon" />
            </Fragment>
          );
        }}
        onClick={() => setMenuVisible(true)}
      />
      {menuVisible && (
        <Menu
          className="exportMenu"
          onClickAwayExceptions={['.doNotTriggerClickAway']}
          onClickAway={() => setMenuVisible(false)}
        >
          {EXPORT_LIST.map((item, i) => {
            if (item.exportType === 2 && _.isEmpty(attachmentControls)) return;
            return (
              <MenuItem
                data-event={item.key}
                key={i}
                className="noIcon"
                icon={<Icon icon={item.icon} />}
                onClick={() => {
                  setMenuVisible(false);
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
                              ((item.controlPermissions && item.controlPermissions[0] === '1') ||
                                !item.controlPermissions) &&
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
                  } else {
                    const allowDownload = isOpenPermit(
                      permitList.recordAttachmentSwitch,
                      sheetSwitchPermit,
                      view.viewId,
                    );
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
                  }
                }}
              >
                <span>{item.name}</span>
              </MenuItem>
            );
          })}
        </Menu>
      )}
    </Con>
  );
}
