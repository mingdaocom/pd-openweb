import React, { Fragment, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Popup } from 'antd-mobile';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { updateDraftTotalInfo } from 'src/pages/worksheet/common/WorksheetDraft/utils';
import DraftList from './DraftList';

const ModalWrap = styled(Popup)`
  .mobileContainer {
    padding-top: 25px;
  }
  .adm-popup-body {
    color: #151515 !important;
    background-color: #f5f5f5;
  }
`;

const DraftEntry = styled.div`
  position: relative;
  margin-right: 16px;
  padding-top: 3px;
`;

const TotalNumWrap = styled.span`
  background-color: #eaeaea;
  padding: 2px 6px;
  border-radius: 10px;
`;

function MobileDraftList(props) {
  const {
    visible,
    onCancel = () => {},
    appId,
    worksheetId,
    addNewRecord, // 提交草稿新增记录
    worksheetInfo = {},
    updateDraftTotal = () => {},
  } = props;
  const [draftData, setDraftDataList] = useState([]);

  const getDraftData = () => {
    worksheetAjax
      .getFilterRows({
        appId,
        worksheetId: worksheetId || worksheetInfo.worksheetId,
        getType: 21,
      })
      .then(res => {
        setDraftDataList(res.data);
        updateDraftTotal(res.data.length);
      });
  };

  useEffect(() => {
    getDraftData();
  }, []);

  return (
    <BrowserRouter>
      <ModalWrap onClose={onCancel} visible={visible} className="mobileModal full">
        <div className="flexColumn h100">
          <div className="flexRow valignWrapper pTop15 pLeft20 pRight20 pBottom8">
            <div className="flex Font15 Gray_9e leftAlign ellipsis">{_l('共%0条', draftData.length)}</div>
            <Icon icon="cancel" className="Font22 Gray_9e" onClick={onCancel} />
          </div>
          <DraftList
            draftData={draftData}
            appId={appId}
            worksheetId={worksheetId}
            worksheetInfo={worksheetInfo}
            addNewRecord={addNewRecord}
            getDraftData={getDraftData}
            updateDraftList={(rowId, rowData) => {
              let data = _.clone(draftData);
              if (!rowData) {
                data = data.filter(it => it.rowid !== rowId);
              } else {
                const index = _.findIndex(data, it => it.rowid === rowId);
                data[index] = rowData;
              }
              updateDraftTotal(data.length);
              setDraftDataList(data);
            }}
          />
        </div>
      </ModalWrap>
    </BrowserRouter>
  );
}

export default function MobileDraft(props) {
  const { appId, controls = [], worksheetInfo, worksheetId, sheetSwitchPermit, ...rest } = props;
  const [visible, setVisible] = useState(false);
  const [total, setTotal] = useState(_.get(window, `draftTotalNumInfo[${worksheetId}]`));

  // 获取草稿箱计数
  const loadDraftDataCount = () => {
    if (window.draftTotalNumInfo && window.draftTotalNumInfo[worksheetId]) return;

    worksheetAjax
      .getFilterRowsTotalNum({
        appId,
        worksheetId,
        getType: 21,
      })
      .then(res => {
        const total = Number(res) || 0;
        updateDraftTotalInfo({ worksheetId, total });
        setTotal(total);
      });
  };

  useEffect(() => {
    loadDraftDataCount();
  }, []);

  if (_.get(worksheetInfo, 'advancedSetting.closedrafts') === '1' && !Number(total)) {
    return null;
  }

  return (
    <Fragment>
      {total ? (
        <DraftEntry
          onClick={() => {
            setVisible(true);
          }}
        >
          <Icon icon="drafts_approval" className="Font20 Gray_9e pointer mTop4" />
          <span className="TxtTop mLeft5 Font13 Gray_75">{_l('草稿箱')}</span>
          {total ? <TotalNumWrap className="TxtTop mLeft5 Gray Font13">{total}</TotalNumWrap> : ''}
        </DraftEntry>
      ) : (
        ''
      )}

      <MobileDraftList
        {...rest}
        visible={visible}
        appId={appId}
        worksheetId={worksheetInfo.worksheetId}
        controls={controls}
        worksheetInfo={worksheetInfo}
        onCancel={() => setVisible(false)}
        sheetSwitchPermit={sheetSwitchPermit}
        updateDraftTotal={total => {
          setTotal(total);
          updateDraftTotalInfo({ worksheetId, total });
        }}
      />
    </Fragment>
  );
}
