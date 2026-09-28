import React, { useState } from 'react';
import moment from 'moment';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import DownloadAjax from 'src/api/download';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { getFeatureStatus } from 'src/utils/services/project';

const EXPORT_MENU_ITEMS = [
  {
    label: 'Excel',
    key: '1',
    icon: <Icon icon="new_excel" className="Font18" />,
  },
  {
    label: 'PDF',
    key: '2',
    icon: <Icon icon="pdf" className="Font18" />,
  },
];

export default function ExportTrigger(props) {
  const { worksheetId, rowId, filters = {}, projectId } = props;
  const [visible, setVisible] = useState(false);
  const featureStatus = getFeatureStatus(projectId, VersionProductType.batchDownloadFiles);

  const onExport = type => {
    setVisible(false);
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
    <Dropdown
      open={visible}
      onOpenChange={changeVisible}
      trigger={['click']}
      placement="bottomRight"
      menu={{
        items: EXPORT_MENU_ITEMS,
        style: { width: 220 },
        onClick: ({ key }) => onExport(key),
      }}
    >
      <span className="selectDate">
        <Icon icon="download" />
        {featureStatus === '2' && (
          <Icon icon="auto_awesome" className="mLeft8" style={{ color: 'var(--color-warning)' }} />
        )}
      </span>
    </Dropdown>
  );
}
