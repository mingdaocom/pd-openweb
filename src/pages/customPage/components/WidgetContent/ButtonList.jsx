import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Dialog as MobileDialog, Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Dialog, Input } from 'ming-ui';
import ConfirmButton from 'ming-ui/components/Dialog/ConfirmButton';
import departmentApi from 'src/api/department';
import homeAppApi from 'src/api/homeApp';
import organizeApi from 'src/api/organize';
import worksheetApi from 'src/api/worksheet';
import processApi from 'src/pages/workflow/api/process';
import customBtnWorkflow from 'mobile/components/socket/customBtnWorkflow';
import { RecordInfoModal } from 'mobile/Record';
import MobileNewRecord from 'worksheet/common/newRecord/MobileNewRecord';
import NewRecord from 'worksheet/common/newRecord/NewRecord';
import RecordInfoWrapper from 'worksheet/common/recordInfo/RecordInfoWrapper';
import { showFilteredRecords } from 'worksheet/components/SearchRecordResult';
import ScanQRCode from 'src/components/newCustomFields/components/ScanQRCode';
import { hrefReg } from 'src/pages/customPage/components/previewContent';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { navigateTo } from 'src/router/navigateTo';
import { getRequest } from 'src/utils/common';
import { browserIsMobile } from 'src/utils/common';
import { addBehaviorLog, mdAppResponse } from 'src/utils/project';
import { genUrl } from '../../util';
import ButtonDisplay from '../editWidget/button/ButtonDisplay';

const ButtonListWrap = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  margin: 0 auto;
`;

const getDepartments = (projectId, accountId) => {
  return new Promise((resolve, reject) => {
    departmentApi
      .getDepartmentsByAccountId({
        projectId,
        accountIds: [accountId],
      })
      .then(data => {
        const { maps } = data;
        const { departments } = _.find(maps, { accountId }) || {};
        resolve(departments || []);
      });
  });
};

const getOrganize = (projectId, accountId) => {
  return new Promise((resolve, reject) => {
    organizeApi
      .getOrganizesByAccountId({
        projectId,
        accountIds: [accountId],
      })
      .then(data => {
        const { maps } = data;
        const { organizes } = _.find(maps, { accountId }) || {};
        resolve(organizes || []);
      });
  });
};

let currentBtn = {};

export function ButtonList({
  ids,
  widget,
  button = {},
  editable,
  layoutType,
  addRecord,
  info,
  themeColor,
  customPageConfig,
}) {
  const [createRecordInfo, setInfo] = useState({
    visible: false,
    value: '',
    viewId: '',
    appId: '',
    name: '',
    writeControls: [],
    sheetSwitchPermit: [],
  });
  const {
    visible,
    value: worksheetId,
    viewId,
    appId,
    name,
    writeControls = [],
    sheetSwitchPermit = [],
  } = createRecordInfo;
  const isMobile = browserIsMobile();
  const isIPad = navigator.userAgent.toLowerCase().includes('ipad');
  const scanQRCodeRef = useRef();
  const [currentScanBtn, setCurrentScanBtn] = useState();
  const [previewRecord, setPreviewRecord] = useState({});
  const isPublicShare = location.href.includes('public/page');
  const includeScanQRCode = _.find(button.buttonList, { action: 5 });
  const projectId = info.projectId || _.get(info, 'apk.projectId');

  useEffect(() => {
    if (isMobile) {
      customBtnWorkflow();
    }
  });

  async function runStartProcessByPBC(item, scanQRCodeResult) {
    const { id, processId, name, config } = item;
    const { inputs = [] } = config;
    const { accountId } = md.global.Account;
    const appId = info.appId || _.get(info, 'apk.appId');
    const { pushUniqueId } = getRequest();
    let departments = [];
    let organizes = [];
    const isRequestDepartments = _.find(inputs, { value: [{ cid: 'triggerDepartment' }] });
    if (isRequestDepartments) {
      departments = await getDepartments(projectId, accountId);
    }
    const isRequestOrganizes = _.find(inputs, { value: [{ cid: 'triggerOrg' }] });
    if (isRequestOrganizes) {
      organizes = await getOrganize(projectId, accountId);
    }
    processApi
      .startProcessByPBC({
        pushUniqueId: window.isMingDaoApp
          ? pushUniqueId || md.global.Config.pushUniqueId
          : md.global.Config.pushUniqueId,
        appId,
        triggerId: id,
        title: name,
        processId,
        controls: inputs
          .filter(item => item.value.length)
          .map(input => {
            const value = input.value.map(item => {
              if (item.cid === 'triggerUser') {
                if (input.type === WIDGETS_TO_API_TYPE_ENUM.USER_PICKER) {
                  return JSON.stringify([accountId]);
                } else {
                  return md.global.Account.fullname;
                }
              }
              if (item.cid === 'triggerDepartment') {
                if (input.type === WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT) {
                  return JSON.stringify(departments.map(item => item.id));
                } else {
                  return JSON.stringify(departments.map(item => item.name));
                }
              }
              if (item.cid === 'triggerOrg') {
                if (input.type === WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE) {
                  return JSON.stringify(organizes.map(item => item.id));
                } else {
                  return JSON.stringify(organizes.map(item => item.name));
                }
              }
              if (item.cid === 'triggerTime') {
                return moment().format('YYYY-MM-DD HH:mm:ss');
              }
              if (item.cid === 'codeResult') {
                return scanQRCodeResult;
              }
              return item.staticValue;
            });
            return {
              ...input,
              value: value.join(''),
            };
          }),
      })
      .then(data => {
        refreshComponent();
      });
  }

  async function handleClick(item) {
    if (editable) return;
    const { param, action, value, viewId, openMode = 1, name } = item;

    currentBtn = item;
    if (isPublicShare && action !== 4) {
      alert(_l('无权操作'), 3);
      return;
    }
    if (action === 1 && value) {
      const { btnId } = item;
      isMobile && Toast.show({ icon: 'loading', content: _l('加载中，请稍后') });
      const { appId } = await homeAppApi.getAppSimpleInfo({ workSheetId: value });
      const sheetSwitchPermit = await worksheetApi.getSwitchPermit({ appId, worksheetId: value });
      isMobile && Toast.clear();
      const param = { visible: true, value, viewId, appId, name, sheetSwitchPermit };
      if (window.isMingDaoApp) {
        const url = `/mobile/addRecord/${appId}/${value}/${viewId}`;
        window.location.href = btnId ? `${url}?btnId=${btnId}` : url;
        return;
      }

      if (btnId) {
        isMobile && Toast.show({ icon: 'loading', content: _l('加载中，请稍后') });
        const { writeControls } = await worksheetApi.getWorksheetBtnByID({ appId, worksheetId: value, btnId });
        isMobile && Toast.clear();
        setInfo({ ...param, writeControls });
      } else {
        setInfo(param);
      }
    }
    if (_.includes([2, 3], action) && value) {
      isMobile && Toast.show({ icon: 'loading', content: _l('加载中，请稍后') });
      const { appId, appSectionId } = await homeAppApi.getAppSimpleInfo({ workSheetId: value });
      isMobile && Toast.clear();
      const getUrl = () => {
        let urlName = '/app';
        if (isMobile) {
          urlName = viewId ? '/mobile/recordList' : '/mobile/customPage';
        }
        let url = `${window.subPath || ''}${urlName}/${appId}/${appSectionId}/${value}`;
        if (viewId) {
          url += `/${viewId}`;
        }
        return url;
      };
      const url = getUrl();
      if (window.isMingDaoApp) {
        window.location.href = url;
      } else if (openMode === 2) {
        window.open(url);
      } else {
        navigateTo(url);
      }

      if (!viewId) {
        addBehaviorLog('customPage', value); //浏览自定义页面埋点
      }
    }
    if (action === 4 && value) {
      const url = genUrl(value, param, info);
      if (openMode === 1) {
        location.href = url;
        return;
      }
      if (openMode === 2) {
        window.open(url);
        return;
      }
      window.open(url, '_blank', 'width=800px,height=600px,left=200px,top=200px');
    }
    if (action === 5) {
      if (window.isMingDaoApp) {
        mdAppResponse({ type: 'scan' }).then(data => {
          const { value } = data;
          if (value) {
            handleScanQRCodeResult(value, item);
          }
        });
      } else if (isMobile || isIPad) {
        setCurrentScanBtn(item);
        scanQRCodeRef.current.handleScanCode();
      } else {
        const { placeholder, text } = item.config || {};
        const onOk = ({ eventSource } = {}) => {
          const value = _.get(scanQRCodeRef, 'current.state.value');
          if (value) {
            handleScanQRCodeResult(value, item);
            if (eventSource === 'pressEnter' && text === 2) {
              scanQRCodeRef.current.setState({ value: '' });
              document.querySelector('.confirmSubmitHint').classList.remove('hide');
              return;
            }
            dialogConfirm();
          } else {
            alert(_l('请输入内容'), 3);
          }
        };
        const dialogConfirm = Dialog.confirm({
          width: 480,
          title: <span className="bold">{name}</span>,
          description: (
            <div className="flexColumn">
              <Input
                autoFocus={true}
                defaultValue=""
                className="w100 confirmInput"
                placeholder={placeholder}
                ref={scanQRCodeRef}
                onKeyDown={e => {
                  if (e.keyCode === 13) {
                    onOk({ eventSource: 'pressEnter' });
                  }
                }}
              />
              <div className="mTop10 confirmSubmitHint hide" style={{ color: '#4caf50' }}>
                {_l('已提交，请输入下一条')}
              </div>
            </div>
          ),
          footer: (
            <div className="Dialog-footer-btns">
              <ConfirmButton
                onClose={_.noop}
                action={() => {
                  onOk();
                }}
                type="primary"
              >
                {_l('确定')}
              </ConfirmButton>
            </div>
          ),
        });
      }
    }
    if (action === 6) {
      const { processId, config } = item;
      const { clickType, confirmMsg, sureName, cancelName } = config;

      if (clickType === 1 && processId) {
        runStartProcessByPBC(item);
        return;
      }
      if (clickType === 2 && processId) {
        if (isMobile) {
          MobileDialog.confirm({
            content: confirmMsg,
            cancelText: cancelName,
            confirmText: sureName,
            onConfirm: () => runStartProcessByPBC(item),
          });
        } else {
          Dialog.confirm({
            title: <div className="mTop10">{confirmMsg}</div>,
            onOk: () => {
              runStartProcessByPBC(item);
            },
            okText: sureName,
            cancelText: cancelName,
          });
        }
        return;
      }
      return;
    }
  }

  async function handleScanQRCodeResult(result, appCurrentScanBtn) {
    const scanBtn = appCurrentScanBtn || currentScanBtn;
    const { config = {}, value, viewId } = scanBtn;

    // 链接
    if (hrefReg.test(result)) {
      if (config.recordLink) {
        const run = (shareData = {}) => {
          if (shareData.rowId) {
            if (window.isMingDaoApp) {
              window.location.href = `/mobile/record/${shareData.appId}/${shareData.worksheetId}/${shareData.viewId}/${shareData.rowId}`;
            } else {
              setPreviewRecord(shareData);
            }
          } else {
            window.open(result);
          }
        };
        if (result.includes('worksheetshare') || result.includes('public/record')) {
          const shareId = (result.match(/\/worksheetshare\/(.*)/) || result.match(/\/public\/record\/(.*)/))[1];
          Toast.show({ icon: 'loading', content: _l('加载中，请稍后') });
          const { data } = await worksheetApi.getShareInfoByShareId({ shareId });
          Toast.clear();
          run(data);
        } else {
          const urlPath = result.split('?')[0];
          const data = urlPath.match(/app\/(.*)\/(.*)\/(.*)\/row\/(.*)/) || [];
          const [url, appId, worksheetId, viewId, rowId] = data;
          if (appId && worksheetId && viewId && rowId) {
            run({
              appId,
              worksheetId,
              viewId,
              rowId,
            });
          } else {
            run();
          }
        }
        return;
      }
      if (config.otherLink) {
        if (window.isMingDaoApp) {
          window.location.href = result;
        } else {
          window.open(result);
        }
        return;
      }
    }
    // 文本，无处理
    if (config.text === 0) {
      if (isMobile) {
        MobileDialog.alert({
          content: <div className="WordBreak">{result}</div>,
          confirmText: _l('复制'),
          onConfirm: () => {
            copy(result);
            alert(_l('复制成功'), 1);
          },
        });
      } else {
        Dialog.confirm({
          title: <div className="mTop10">{result}</div>,
          onOk: () => {
            copy(result);
            alert(_l('复制成功'), 1);
          },
          okText: _l('复制'),
        });
      }
    }
    // 文本，搜索打开记录
    if (config.text === 1 && value && viewId) {
      const { isFilter } = config;
      isMobile && Toast.show({ icon: 'loading', content: _l('加载中，请稍后') });
      const { appId } = await homeAppApi.getAppSimpleInfo({ workSheetId: value });
      isMobile && Toast.clear();
      const filterId = isFilter && scanBtn.filterId ? scanBtn.filterId : '';
      const searchId = scanBtn.searchId ? scanBtn.searchId : '';
      if (isMobile) {
        const url = `/mobile/searchRecord/${appId}/${value}/${viewId}?keyWords=${encodeURIComponent(result)}&filterId=${filterId}&searchId=${searchId}`;
        if (window.mobileNavigateTo) {
          window.mobileNavigateTo(url);
        } else {
          location.href = url;
        }
      } else {
        // window.open(`/mobile/searchRecord/${appId}/${value}/${viewId}?keyWords=${encodeURIComponent(
        //     result,
        //   )}&filterId=${filterId}&searchId=${searchId}`);
        showFilteredRecords({
          appId,
          worksheetId: value,
          viewId,
          filterId,
          searchId,
          keyWords: result,
        });
      }
    }
    // 文本，调用封装业务流程
    if (config.text === 2) {
      runStartProcessByPBC(scanBtn, result);
    }
  }

  const refreshComponent = () => {
    const { refreshObjects = [] } = currentBtn.config;
    refreshObjects.forEach(item => {
      window[`refresh-${item.objectId}`] && window[`refresh-${item.objectId}`]();
    });
  };

  const NewRecordComponent = isMobile ? MobileNewRecord : NewRecord;

  return (
    <ButtonListWrap>
      <ButtonDisplay
        themeColor={themeColor}
        customPageConfig={customPageConfig}
        widget={widget}
        appId={ids.appId}
        displayMode="display"
        layoutType={layoutType}
        onClick={handleClick}
        {...button}
      />
      {includeScanQRCode && (isMobile || isIPad) && (
        <ScanQRCode ref={scanQRCodeRef} projectId={projectId} onScanQRCodeResult={handleScanQRCodeResult} />
      )}
      {visible && (
        <NewRecordComponent
          visible
          showFillNext={true}
          needCache={true}
          onAdd={data => {
            alert(_l('添加成功'));
            addRecord(data);
            refreshComponent();
          }}
          title={isMobile ? name : null}
          appId={appId}
          worksheetId={worksheetId}
          viewId={viewId}
          writeControls={writeControls}
          sheetSwitchPermit={sheetSwitchPermit}
          showDraftsEntry={isMobile ? true : false}
          openRecord={
            isMobile
              ? (recordId, viewId) => {
                  setPreviewRecord({
                    appId,
                    worksheetId,
                    viewId,
                    rowId: recordId,
                  });
                }
              : undefined
          }
          hideNewRecord={() => setInfo({ visible: false })}
        />
      )}
      {isMobile ? (
        <RecordInfoModal
          className="full"
          visible={!!previewRecord.rowId}
          appId={previewRecord.appId}
          worksheetId={previewRecord.worksheetId}
          viewId={previewRecord.viewId}
          rowId={previewRecord.rowId}
          onClose={() => {
            setPreviewRecord({});
          }}
        />
      ) : (
        !!previewRecord.rowId && (
          <RecordInfoWrapper
            visible
            projectId={projectId}
            recordId={previewRecord.rowId}
            worksheetId={previewRecord.worksheetId}
            appId={previewRecord.appId}
            viewId={previewRecord.viewId}
            hideRecordInfo={() => {
              setPreviewRecord({});
            }}
          />
        )
      )}
    </ButtonListWrap>
  );
}

export default connect(({ sheet, appPkg, customPage }) => ({
  info: {
    ...sheet.base,
    projectId: appPkg.projectId,
    itemId: customPage.pageId,
    apk: customPage.apk,
  },
}))(ButtonList);
