import React, { useState, useEffect, Fragment } from 'react';
import { Icon, ScrollView } from 'ming-ui';
import { Flex, Modal } from 'antd-mobile';
import worksheetAjax from 'src/api/worksheet';
import CellControl from 'src/pages/worksheet/components/CellControls';
import { getTitleTextFromControls, controlState } from 'src/components/newCustomFields/tools/utils';
import { SHEET_VIEW_HIDDEN_TYPES } from 'worksheet/constants/enum';
import { RecordInfoModal } from 'mobile/Record';
import { BrowserRouter } from 'react-router-dom';
import styled from 'styled-components';
import _ from 'lodash';

const ModalWrap = styled(Modal)`
  height: 95%;
  overflow: hidden;
  border-top-right-radius: 15px;
  border-top-left-radius: 15px;
  &.full {
    height: 100%;
    border-top-right-radius: 0;
    border-top-left-radius: 0;
  }
  .mobileContainer {
    padding-top: 25px;
  }
  .am-modal-content {
    background-color: #f5f5f5;
  }
  .am-modal-body {
    color: #333 !important;
    font-size: inherit !important;
  }
  .recordCardContent {
    padding: 5px 12px;
    margin: 0 10px 10px;
    background-color: #fff;
    border: 1px solid #fff;
    border-radius: 3px;
    box-shadow: 0px 1px 3px rgb(0 0 0 / 16%);
    position: relative;
    overflow: hidden;
    .controlWrapper {
      margin-bottom: 5px;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .deleteRecord {
      position: absolute;
      color: #f44338;
      font-size: 22px;
      right: 10px;
      bottom: 10px;
    }
    .emptyTag {
      border-radius: 3px;
      display: inline-block;
      width: 12px;
      height: 3px;
      background-color: #ededed;
    }
  }
`;

const DraftEntry = styled.div`
  position: relative;
  margin-right: 16px;
  padding-top: 3px;
  .draftDot {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    right: 1px;
    top: 3px;
    background-color: #f44336;
  }
`;

function MobileDraftList(props) {
  const {
    visible,
    onCancel = () => {},
    appId,
    worksheetId,
    controls = [],
    draftData = [],
    viewId,
    worksheetInfo = {},
    getDraftData = () => {},
    sheetSwitchPermit,
  } = props;
  const [currentRowId, setCurrentRowId] = useState('');

  const renderRow = data => {
    const titleText = getTitleTextFromControls(controls, data);
    const displayControls = controls.filter(
      item =>
        !_.includes([...SHEET_VIEW_HIDDEN_TYPES, 47], item.type) &&
        !_.includes(
          [
            'wfname',
            'wfcuaids',
            'wfcaid',
            'wfctime',
            'wfrtime',
            'wfftime',
            'wfstatus',
            'rowid',
            'ownerid',
            'caid',
            'uaid',
            'ctime',
          ],
          item.controlId,
        ) &&
        controlState(item, 2).visible,
    );
    const showControls = displayControls
      .filter(it => !it.attribute)
      .filter(it => !_.includes(['utime'], it.controlId))
      .slice(0, 2)
      .concat(controls.find(v => _.includes(['utime'], v.controlId)));

    return (
      <div
        className="recordCardContent"
        onClick={() => {
          setCurrentRowId(data.rowid);
        }}
      >
        <div className="flexRow valignWrapper mBottom5">
          <div className="Gray Blod Font14 ellipsis">{titleText}</div>
        </div>
        {showControls.map(control => {
          return (
            <div className="controlWrapper" key={control.controlId}>
              <div className="controlName ellipsis Gray_9e mRight10">{control.controlName}</div>
              <div className="controlContent ellipsis">
                {data[control.controlId] ? (
                  <CellControl
                    rowHeight={34}
                    cell={Object.assign({}, control, { value: data[control.controlId] })}
                    from={21}
                    className={'w100'}
                  />
                ) : (
                  <div className="emptyTag"></div>
                )}
              </div>
            </div>
          );
        })}
        <div className="deleteRecord">
          <Icon
            icon="delete2"
            onClick={e => {
              e.stopPropagation();
              worksheetAjax
                .deleteWorksheetRows({
                  appId,
                  worksheetId,
                  rowIds: [data.rowid],
                  deleteType: 21,
                })
                .then(res => {
                  if (res.successCount === 1) {
                    alert(_l('删除草稿成功'));
                    getDraftData({ appId, worksheetId });
                  } else {
                    alert(_l('删除草稿失败'), 2);
                  }
                });
            }}
          />
        </div>
      </div>
    );
  };
  return (
    <BrowserRouter>
      <ModalWrap popup animationType="slide-up" onClose={onCancel} visible={visible} className="full">
        <div className="flexColumn h100">
          <div className="flexRow valignWrapper pTop15 pLeft20 pRight20 pBottom8">
            <div className="flex Font15 Gray_9e leftAlign ellipsis">{_l('共%0条', draftData.length)}</div>
            <Icon icon="closeelement-bg-circle" className="Font22 Gray_9e" onClick={onCancel} />
          </div>
          <div className="flex">
            {_.isEmpty(draftData) ? (
              <Flex className="withoutRows" direction="column" justify="center" align="center">
                <Icon icon="drafts_approval" />
                <div className="text">{_l('暂无草稿')}</div>
              </Flex>
            ) : (
              <ScrollView>{draftData.map(item => renderRow(item))}</ScrollView>
            )}
          </div>
        </div>

        <RecordInfoModal
          className="full"
          visible={!!currentRowId}
          appId={appId}
          worksheetId={worksheetId}
          viewId={viewId}
          rowId={currentRowId}
          sheetSwitchPermit={sheetSwitchPermit}
          draftFormControls={controls.filter(
            item =>
              !_.includes([...SHEET_VIEW_HIDDEN_TYPES, 33], item.type) &&
              !_.includes(
                [
                  'wfname',
                  'wfcuaids',
                  'wfcaid',
                  'wfctime',
                  'wfrtime',
                  'wfftime',
                  'wfstatus',
                  'rowid',
                  'ownerid',
                  'caid',
                  'uaid',
                  'ctime',
                  'utime',
                ],
                item.controlId,
              ),
          )}
          getDataType={21}
          from={21}
          onClose={() => {
            getDraftData({ appId, worksheetId });
            setCurrentRowId('');
          }}
        />
      </ModalWrap>
    </BrowserRouter>
  );
}

export default function MobileDraft(props) {
  const { appId, controls = [], worksheetInfo,  sheetSwitchPermit } = props;
  const [visible, setVisible] = useState(false);
  const [draftData, setDraftData] = useState([]);

  useEffect(() => {
    getDraftData();
  }, []);

  const getDraftData = () => {
    worksheetAjax
      .getFilterRows({
        appId,
        worksheetId: worksheetInfo.worksheetId,
        getType: 21,
      })
      .then(res => {
        setDraftData(res.data);
      });
  };
  return (
    <Fragment>
      {!_.isEmpty(draftData) && (
        <DraftEntry
          onClick={() => {
            setVisible(true);
          }}
        >
          <i className="icon-drafts_approval Font22 Gray_9d"></i>
          {!_.isEmpty(draftData) && <span className="draftDot"></span>}
        </DraftEntry>
      )}

      <MobileDraftList
        visible={visible}
        appId={appId}
        worksheetId={worksheetInfo.worksheetId}
        controls={controls}
        draftData={draftData}
        worksheetInfo={worksheetInfo}
        getDraftData={getDraftData}
        onCancel={() => setVisible(false)}
        sheetSwitchPermit={sheetSwitchPermit}
      />
    </Fragment>
  );
}
