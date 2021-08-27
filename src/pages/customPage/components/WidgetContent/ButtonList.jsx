import React, { useState } from 'react';
import styled from 'styled-components';
import NewRecord from 'worksheet/common/newRecord/NewRecord';
import MobileNewRecord from 'worksheet/common/newRecord/MobileNewRecord';
import ButtonDisplay from '../editWidget/button/ButtonDisplay';
import { getAppSimpleInfo } from 'src/api/homeApp';
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
  const handleClick = item => {
    if (editable) return;
    const { param, action, value, viewId, openMode = 1, name } = item;
    const isOpenNewWindow = openMode === 2;
    if (!value) return;
    if (action === 4) {
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
          let url = `${urlName}/${appId}/${appSectionId}/${value}`;
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
