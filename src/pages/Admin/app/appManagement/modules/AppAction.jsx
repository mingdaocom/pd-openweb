import React, { Fragment } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Icon, UpgradeIcon } from 'ming-ui';
import { Drawer, Dropdown, Modal } from 'ming-ui/antd-components';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import UpgradeProcess from 'src/pages/AppSettings/components/ImportUpgrade/components/UpgradeProcess';
import AppTrash from 'src/pages/worksheet/common/Trash/AppTrash';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { getFeatureStatus } from 'src/utils/services/project';
import { importAppMode, optionData } from '../constant';
import AppLog from './AppLog';
import { useDecrypt } from './Dectypt';
import SelectApp from './SelectApp';

export default function BatchImportApp(props) {
  const { projectId, updateExportIds = () => {}, updateList = () => {} } = props;
  const [data, setData] = useSetState({
    moreVisible: false,
    exportAppVisible: false,
    importAppVisible: false,
    drawerVisible: false,
    appTrashVisible: false,
    upgradeModel:
      window.platformENV.isLocal && !window.platformENV.isOverseas && !window.platformENV.isPlatform ? 1 : 0, // 仅私有部署支持迁移模式,
  });
  const { moreVisible, exportAppVisible, importAppVisible, upgradeModel, drawerVisible, appTrashVisible } = data;
  const { open: openDecrypt, holder: decryptHolder } = useDecrypt();

  const handleClick = ({ action, featureId, featureType }) => {
    if (featureType === '2') {
      setData({ moreVisible: false });
      buriedUpgradeVersionDialog(projectId, featureId);
      return;
    }

    setData({ moreVisible: false });

    switch (action) {
      case 'handleExportAll':
        setData({ exportAppVisible: true });
        break;
      case 'handleUpdateAll':
        setData({ importAppVisible: true });
        break;
      case 'handleLog':
        setData({ drawerVisible: true });
        break;
      case 'openAppTrash':
        setData({ appTrashVisible: true });
        break;
      case 'openDecryptUpload':
        openDecrypt({ projectId });
        break;
      default:
        break;
    }
  };

  const isSupportMigrateMode =
    window.platformENV.isPlatform && window.platformENV.isHap
      ? getFeatureStatus(projectId, VersionProductType.appAccessPolicy) === '1'
      : window.platformENV.isLocal && !window.platformENV.isOverseas && !window.platformENV.isPlatform;

  const moreMenuItems = optionData
    .map(item => {
      const featureType = getFeatureStatus(projectId, item.featureId);

      if (_.includes(['handleExportAll', 'openAppTrash', 'handleUpdateAll'], item.action) && !featureType) {
        return null;
      }

      const menuItem = {
        key: item.action,
        icon: <Icon icon={item.icon} className="textTertiary" />,
        label: (
          <Fragment>
            {item.label}
            {item.featureId && featureType === '2' && <UpgradeIcon />}
          </Fragment>
        ),
      };

      if (item.action === 'handleUpdateAll' && featureType !== '2' && isSupportMigrateMode) {
        return {
          ...menuItem,
          children: importAppMode.map(v => ({
            key: v.value,
            label: (
              <Fragment>
                <div className="Font14 bold">{v.label}</div>
                <div className="desc">{v.description}</div>
              </Fragment>
            ),
            style: { minWidth: 438 },
            onClick: () => {
              setData({
                moreVisible: false,
                importAppVisible: true,
                upgradeModel: v.value,
              });
            },
          })),
        };
      }

      return {
        ...menuItem,
        onClick: () => handleClick({ ...item, featureType }),
      };
    })
    .filter(Boolean);

  return (
    <Fragment>
      {decryptHolder}
      <Dropdown
        open={moreVisible}
        onOpenChange={visible => setData({ moreVisible: visible })}
        trigger={['click']}
        menu={{
          items: moreMenuItems,
          style: { minWidth: 160 },
        }}
      >
        <span className="textTertiary Font18 icon-more_horiz Hand mLeft25 hoverColorPrimary"></span>
      </Dropdown>

      {/* 导出应用 */}
      {exportAppVisible && (
        <Modal
          open={exportAppVisible}
          width={720}
          className="importTotalAppDialog"
          mask={{ closable: false }}
          keyboard
          onCancel={() => setData({ exportAppVisible: false })}
          title={
            <div className="flexRow mBottom4">
              <span className="Font17 overflow_ellipsis Bold">{_l('选择要导出的应用')}</span>
            </div>
          }
          footer={null}
        >
          <SelectApp
            handleNext={list => {
              setData({ exportAppVisible: false });
              updateExportIds(list);
            }}
            closeDialog={() => setData({ exportAppVisible: false })}
          />
        </Modal>
      )}

      {/* 导入应用 */}
      {importAppVisible && (
        <UpgradeProcess
          projectId={projectId}
          type="2"
          upgradeModel={upgradeModel}
          onCancel={() => setData({ importAppVisible: false })}
        />
      )}

      {/* 日志 */}
      <Drawer
        rootClassName="appLogDrawerContainer"
        size={480}
        title={
          <div className="flexRow">
            <span className="flex">{_l('日志')}</span>
            <Icon
              icon="close"
              className=" Font20 textTertiary Hand"
              onClick={() => setData({ drawerVisible: false })}
            />
          </div>
        }
        placement="right"
        onClose={() => setData({ drawerVisible: false })}
        open={drawerVisible}
        mask={{ closable: false }}
        closable={false}
      >
        <AppLog visible={drawerVisible} />
      </Drawer>

      {/* 应用回收站 */}
      {appTrashVisible && (
        <AppTrash projectId={projectId} onCancel={() => setData({ appTrashVisible: false })} onRestore={updateList} />
      )}
    </Fragment>
  );
}
