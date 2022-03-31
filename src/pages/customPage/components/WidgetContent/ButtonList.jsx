import React, { useState } from 'react';
import styled from 'styled-components';
import NewRecord from 'worksheet/common/newRecord/NewRecord';
import MobileNewRecord from 'worksheet/common/newRecord/MobileNewRecord';
import ButtonDisplay from '../editWidget/button/ButtonDisplay';
import { Dialog } from 'ming-ui';
import { Modal, Toast } from 'antd-mobile';
import { getAppSimpleInfo } from 'src/api/homeApp';
import { startProcessByPBC } from 'src/pages/workflow/api/process';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { genUrl } from '../../util';
import { connect } from 'react-redux';
import { browserIsMobile } from 'src/util';

const ButtonListWrap = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  margin: 0 auto;
`;

function ButtonList({ button = {}, editable, layoutType, addRecord, info }) {
  const [createRecordInfo, setInfo] = useState({ visible: false, value: '', viewId: '', appId: '', name: '' });
  const { visible, value: worksheetId, viewId, appId, name } = createRecordInfo;
  const isMobile = browserIsMobile();
  const isPublicShare = location.href.includes('public/page');
  const handleClick = item => {
    if (editable) return;
    const { param, action, value, viewId, openMode = 1, name } = item;
    const isOpenNewWindow = openMode === 2;

    if (isPublicShare && action !== 4) {
      alert(_l('无权操作'), 3);
      return;
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
      alert(_l('请去App上扫码操作'), 3);
      return;
    }
    if (action === 6) {
      const { id, processId, name, config } = item;
      const { clickType, confirmMsg, sureName, cancelName, inputs = [] } = config;
      const run = () => {
        startProcessByPBC({
          appId: info.appId,
          triggerId: id,
          title: name,
          processId,
          controls: inputs.filter(item => item.value.length).map(input => {
            const value = input.value.map(item => {
              if (item.cid === 'triggerUser') {
                if (input.type === WIDGETS_TO_API_TYPE_ENUM.USER_PICKER) {
                  return JSON.stringify([md.global.Account.accountId]);
                } else {
                  return md.global.Account.fullname;
                }
              }
              if (item.cid === 'triggerTime') {
                return moment().format('YYYY-MM-DD HH:mm:ss');
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
      if (clickType === 1 && processId) {
        run();
        return;
      }
      if (clickType === 2 && processId) {
        if (isMobile) {
          Modal.alert(confirmMsg, '', [
            { text: cancelName, onPress: () => {}, style: 'default' },
            { text: sureName, onPress: () => run() },
          ]);
        } else {
          Dialog.confirm({
            title: <div className="mTop10">{confirmMsg}</div>,
            onOk: () => {
              run();
            },
            okText: sureName,
            cancelText: cancelName
          });
        }
        return;
      }
      return;
    }

    if (!value) return;

    getAppSimpleInfo({ workSheetId: value }).then(res => {
      const { appId, appSectionId } = res;
      if (action === 1) {
        setInfo({ visible: true, value, viewId, appId, name });
      }
      if (_.includes([2, 3], action)) {
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
    });
  };
  const NewRecordComponent = isMobile ? MobileNewRecord : NewRecord;
  return (
    <ButtonListWrap>
      <ButtonDisplay displayMode="display" layoutType={layoutType} onClick={handleClick} {...button} />
      {visible && (
        <NewRecordComponent
          visible
          showContinueAdd={false}
          onAdd={data => {
            alert(_l('添加成功'));
            setInfo({ visible: false });
            addRecord(data);
          }}
          title={isMobile ? name : null}
          appId={appId}
          worksheetId={worksheetId}
          viewId={viewId}
          hideNewRecord={() => setInfo({ visible: false })}
        />
      )}
    </ButtonListWrap>
  );
}

export default connect(({ sheet, appPkg, customPage }) => ({
  info: {
    ...sheet.base,
    projectId: appPkg.projectId,
    itemId: customPage.pageId,
  },
}))(ButtonList);
