import React, { useState } from 'react';
import moment from 'moment';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import DownloadAjax from 'src/api/download';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';

const EXPORT_OPTIONS = [
  {
    label: 'Excel',
    value: '1',
    icon: 'new_excel',
  },
  {
    label: 'PDF',
    value: '2',
    icon: 'pdf',
  },
];

const Wrap = styled.div`
  width: 220px;
  padding: 4px 0;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0px 3px 6px 1px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  .exportItem {
    padding: 0 20px;
    line-height: 44px;
    .Icon {
      color: #757575;
    }
    &:hover {
      background: #1677ff;
      color: #fff;
      .Icon {
        color: #fff;
      }
    }
  }
`;

export default function ExportTrigger(props) {
  const { worksheetId, rowId, filters = {}, projectId } = props;
  const [visible, setVisible] = useState(false);
  const featureStatus = getFeatureStatus(projectId, VersionProductType.batchDownloadFiles);

  const onExport = type => {
    setVisible(!visible);
    DownloadAjax.exportWorksheetOperationLogs({
      worksheetId,
      rowId,
      fileType: type,
      ...filters,
      startDate: filters.startDate ? moment(filters.startDate).format('YYYY-MM-DD HH:mm:ss') : undefined,
      endDate: filters.endDate ? moment(filters.endDate).format('YYYY-MM-DD HH:mm:ss') : undefined,
    }).then(res => {
      if (!res) alert(_l('导出失败', 3));
    });
  };

  const changeVisible = value => {
    if (value === true && featureStatus === '2') {
      buriedUpgradeVersionDialog(projectId, VersionProductType.batchDownloadFiles);
      return;
    }

    setVisible(value);
  };

  return (
    <Trigger
      popupVisible={visible}
      onPopupVisibleChange={changeVisible}
      action={['click']}
      popupAlign={{ points: ['tr', 'br'], offset: [0, 5] }}
      popup={
        <Wrap>
          {EXPORT_OPTIONS.map(l => (
            <div
              className="exportItem Hand valignWrapper"
              key={`recordLogExport-${l.label}`}
              onClick={() => onExport(l.value)}
            >
              <Icon icon={l.icon} className="Font18 mRight8" />
              {l.label}
            </div>
          ))}
        </Wrap>
      }
    >
      <span className="selectDate">
        <Icon icon="download" />
        {featureStatus === '2' && <Icon icon="auto_awesome" className="mLeft8" style={{ color: '#fdb432' }} />}
      </span>
    </Trigger>
  );
}
