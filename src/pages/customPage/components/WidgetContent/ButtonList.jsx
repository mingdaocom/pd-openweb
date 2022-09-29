import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import NewRecord from 'worksheet/common/newRecord/NewRecord';
import MobileNewRecord from 'worksheet/common/newRecord/MobileNewRecord';
import ButtonDisplay from '../editWidget/button/ButtonDisplay';
import { Dialog } from 'ming-ui';
import { Modal, Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import ScanQRCode from 'src/components/newCustomFields/components/ScanQRCode';
import { getAppSimpleInfo } from 'src/api/homeApp';
import { getDepartmentsByAccountId } from 'src/api/department';
import { getWorksheetBtnByID, getShareInfoByShareId } from 'src/api/worksheet';
import { startProcessByPBC } from 'src/pages/workflow/api/process';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { hrefReg } from 'src/pages/customPage/components/previewContent';
import { RecordInfoModal } from 'mobile/Record';
import { genUrl } from '../../util';
import { connect } from 'react-redux';
import { browserIsMobile, mdAppResponse } from 'src/util';
import { getRequest } from 'src/util';

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
    getDepartmentsByAccountId({
      projectId,
      accountIds: [accountId]
    }).then(data => {
      const { maps } = data;
      const { departments } = _.find(maps, { accountId }) || {};
      resolve(departments || []);
    });
  });
}

export function ButtonList({ button = {}, editable, layoutType, addRecord, info }) {
  const [createRecordInfo, setInfo] = useState({ visible: false, value: '', viewId: '', appId: '', name: '', writeControls: [] });
  const { visible, value: worksheetId, viewId, appId, name, writeControls = [] } = createRecordInfo;
  const isMobile = browserIsMobile();
  const scanQRCodeRef = useRef();
  const [currentScanBtn, setCurrentScanBtn] = useState();
  const [previewRecord, setPreviewRecord] = useState({});
  const isPublicShare = location.href.includes('public/page');
  const includeScanQRCode = _.find(button.buttonList, { action: 5 });
  const isMingdao = navigator.userAgent.toLowerCase().indexOf('mingdao application') >= 0;
  const projectId = info.projectId || _.get(info, 'apk.projectId');

  async function runStartProcessByPBC(item, scanQRCodeResult) {
    const { id, processId, name, config } = item;
    const { inputs = [] } = config;
    const { accountId } = md.global.Account;
    const appId = info.appId || _.get(info, 'apk.appId');
    const { pushUniqueId } = getRequest();
    let departments = [];
    const isRequestDepartments = _.find(inputs, { value: [{ cid: 'triggerDepartment' }] });
    if (isRequestDepartments) {
      departments = await getDepartments(projectId, accountId);
    }
    startProcessByPBC({
      pushUniqueId: isMingdao ? (pushUniqueId || md.global.Config.pushUniqueId) : md.global.Config.pushUniqueId,
      appId,
      triggerId: id,
      title: name,
      processId,
      controls: inputs.filter(item => item.value.length).map(input => {
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
          value: value.join('')
        }
      })
    }).then(data => {
      if (isMobile && data) {
        Toast.info(_l('操作成功'));
      }
    });
  }

  async function handleClick(item) {
    if (editable) return;
    const { param, action, value, viewId, openMode = 1, name } = item;
    const isOpenNewWindow = isMingdao ? false : openMode === 2;

    if (isPublicShare && action !== 4) {
      alert(_l('无权操作'), 3);
      return;
    }
    if (action === 1 && value) {
      const { btnId } = item;
      isMobile && Toast.loading(_l('加载中，请稍后'));
      const { appId } = await getAppSimpleInfo({ workSheetId: value });
      isMobile && Toast.hide();
      const param = { visible: true, value, viewId, appId, name };
      if (isMingdao) {
        const url = `/mobile/addRecord/${appId}/${value}/${viewId}`;
        window.location.href = btnId ? `${url}?btnId=${btnId}` : url;
        return;
      }
      if (btnId) {
        isMobile && Toast.loading(_l('加载中，请稍后'));
        const { writeControls } = await getWorksheetBtnByID({ appId, worksheetId: value, btnId });
        isMobile && Toast.hide();
        setInfo({ ...param, writeControls });
      } else {
        setInfo(param);
      }
    }
    if (_.includes([2, 3], action) && value) {
      isMobile && Toast.loading(_l('加载中，请稍后'));
      const { appId, appSectionId } = await getAppSimpleInfo({ workSheetId: value });
      isMobile && Toast.hide();
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
      if (isOpenNewWindow) {
        window.open(url);
      } else {
        window.location.href = url;
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
      if (isMingdao) {
        mdAppResponse({ type: 'scan' }).then(data => {
          const { value } = data;
          if (value) {
            handleScanQRCodeResult(value, item);
          }
        });
      } else if (isMobile) {
        setCurrentScanBtn(item);
        scanQRCodeRef.current.handleScanCode();
      } else {
        alert('请去移动端扫码操作', 3);
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
          Modal.alert(confirmMsg, '', [
            { text: cancelName, onPress: () => {}, style: 'default' },
            { text: sureName, onPress: () => runStartProcessByPBC(item) },
          ]);
        } else {
          Dialog.confirm({
            title: <div className="mTop10">{confirmMsg}</div>,
            onOk: () => {
              runStartProcessByPBC(item);
            },
            okText: sureName,
            cancelText: cancelName
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
    const showModal = () => {
      Modal.alert(<div className="WordBreak">{result}</div>, '', [
        { text: _l('复制'), onPress: () => {
          copy(result);
          alert(_l('复制成功'), 1);
        } }
      ]);
    }

    // 链接
    if (hrefReg.test(result)) {
      if (config.recordLink && result.includes('worksheetshare')) {
        const shareId = result.match(/\/worksheetshare\/(.*)/)[1];
        Toast.loading(_l('加载中，请稍后'));
        const shareData = await getShareInfoByShareId({ shareId });
        Toast.hide();
        if (shareData.rowId) {
          if (isMingdao) {
            window.location.href = `/mobile/record/${shareData.appId}/${shareData.worksheetId}/${shareData.viewId}/${shareData.rowId}`;
          } else {
            setPreviewRecord(shareData);
          }
        } else {
          window.open(result);
        }
        return;
      }
      if (config.otherLink) {
        if (isMingdao) {
          window.location.href = result;
        } else {
          window.open(result);
        }
        return;
      }
    }
    // 文本，无处理
    if (config.text === 0) {
      showModal();
    }
    // 文本，搜索打开记录
    if (config.text === 1 && value && viewId) {
      const { isFilter } = config;
      isMobile && Toast.loading(_l('加载中，请稍后'));
      const { appId } = await getAppSimpleInfo({ workSheetId: value });
      isMobile && Toast.hide();
      const filterId = isFilter && scanBtn.filterId ? scanBtn.filterId : '';
      const searchId = scanBtn.searchId ? scanBtn.searchId : '';
      window.mobileNavigateTo(`/mobile/searchRecord/${appId}/${value}/${viewId}?keyWords=${encodeURIComponent(result)}&filterId=${filterId}&searchId=${searchId}`);
    }
    // 文本，调用业务流程
    if (config.text === 2) {
      runStartProcessByPBC(scanBtn, result);
    }
  }

  const NewRecordComponent = isMobile ? MobileNewRecord : NewRecord;

  return (
    <ButtonListWrap>
      <ButtonDisplay displayMode="display" layoutType={layoutType} onClick={handleClick} {...button} />
      {includeScanQRCode && <ScanQRCode ref={scanQRCodeRef} projectId={projectId} onScanQRCodeResult={handleScanQRCodeResult} />}
      {visible && (
        <NewRecordComponent
          visible
          showFillNext={true}
          onAdd={data => {
            alert(_l('添加成功'));
            addRecord(data);
          }}
          title={isMobile ? name : null}
          appId={appId}
          worksheetId={worksheetId}
          viewId={viewId}
          writeControls={writeControls}
          openRecord={isMobile ? (recordId, viewId) => {
            setPreviewRecord({
              appId,
              worksheetId,
              viewId,
              rowId: recordId
            });
          } : undefined}
          hideNewRecord={() => setInfo({ visible: false })}
        />
      )}
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
    </ButtonListWrap>
  );
}

export default connect(({ sheet, appPkg, customPage }) => ({
  info: {
    ...sheet.base,
    projectId: appPkg.projectId,
    itemId: customPage.pageId,
    apk: customPage.apk
  },
}))(ButtonList);
