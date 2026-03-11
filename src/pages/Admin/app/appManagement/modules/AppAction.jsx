import React, { Fragment } from 'react';
import { useSetState } from 'react-use';
import { Drawer } from 'antd';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Dialog, Icon, UpgradeIcon } from 'ming-ui';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import UpgradeProcess from 'src/pages/AppSettings/components/ImportUpgrade/components/UpgradeProcess';
import AppTrash from 'src/pages/worksheet/common/Trash/AppTrash';
import { getFeatureStatus } from 'src/utils/project';
import { importAppMode, optionData } from '../constant';
import AppLog from './AppLog';
import { decryptFunc } from './Dectypt';
import SelectApp from './SelectApp';

export default function BatchImportApp(props) {
  const { projectId, updateExportIds = () => {}, updateList = () => {} } = props;
  const [data, setData] = useSetState({
    moreVisible: false,
    exportAppVisible: false,
    importAppPopupVisible: false,
    importAppVisible: false,
    drawerVisible: false,
    appTrashVisible: false,
    upgradeModel:
      window.platformENV.isLocal && !window.platformENV.isOverseas && !window.platformENV.isPlatform ? 1 : 0, // 仅私有部署支持迁移模式,
  });
  const {
    moreVisible,
    exportAppVisible,
    importAppPopupVisible,
    importAppVisible,
    upgradeModel,
    drawerVisible,
    appTrashVisible,
  } = data;

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
        decryptFunc({ projectId });
        break;
      default:
        break;
    }
  };

  return (
    <Fragment>
      <Trigger
        popupVisible={moreVisible}
        onPopupVisibleChange={visible => setData({ moreVisible: visible })}
        action={['click']}
        popup={() => {
          return (
            <ul className="optionPanelTrigger moreOptionPanelTrigger">
              {optionData.map(item => {
                const featureType = getFeatureStatus(projectId, item.featureId);

                if (_.includes(['handleExportAll', 'openAppTrash', 'handleUpdateAll'], item.action) && !featureType) {
                  return;
                }

                if (
                  item.action === 'handleUpdateAll' &&
                  featureType !== '2' &&
                  window.platformENV.isLocal &&
                  !window.platformENV.isOverseas &&
                  !window.platformENV.isPlatform
                ) {
                  // 仅私有部署支持迁移模式
                  return (
                    <Trigger
                      action={['hover']}
                      popupVisible={importAppPopupVisible}
                      onPopupVisibleChange={visible => setData({ importAppPopupVisible: visible })}
                      popupAlign={{
                        overflow: { adjustX: true, adjustY: true },
                        points: ['cr', 'cl'],
                        offset: [-438, -36],
                      }}
                      popup={() => {
                        return (
                          <ul className="optionPanelTrigger importAppTrigger">
                            {importAppMode.map(v => {
                              return (
                                <li
                                  key={v.value}
                                  onClick={() => {
                                    setData({
                                      moreVisible: false,
                                      importAppVisible: true,
                                      importAppPopupVisible: false,
                                      upgradeModel: v.value,
                                    });
                                  }}
                                >
                                  <div className="Font14 bold">{v.label}</div>
                                  <div className="desc">{v.description}</div>
                                </li>
                              );
                            })}
                          </ul>
                        );
                      }}
                    >
                      <li key={item.action}>
                        <Icon icon={item.icon} className="mRight12 textTertiary" />
                        {item.label}
                        {item.featureId && featureType === '2' && <UpgradeIcon />}
                      </li>
                    </Trigger>
                  );
                }

                return (
                  <li key={item.action} onClick={() => handleClick({ ...item, featureType })}>
                    <Icon icon={item.icon} className="mRight12 textTertiary" />
                    {item.label}
                    {item.featureId && featureType === '2' && <UpgradeIcon />}
                  </li>
                );
              })}
            </ul>
          );
        }}
        popupAlign={{
          offset: [-125, 5],
          points: ['tr', 'tl'],
        }}
      >
        <span className="textTertiary Font18 icon-more_horiz Hand mLeft25 ThemeHoverColor3"></span>
      </Trigger>

      {/* 导出应用 */}
      {exportAppVisible && (
        <Dialog
          visible={exportAppVisible}
          width={720}
          className="importTotalAppDialog"
          overlayClosable={false}
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
        </Dialog>
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
        className="appLogDrawerContainer"
        width={480}
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
        visible={drawerVisible}
        maskClosable={false}
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
