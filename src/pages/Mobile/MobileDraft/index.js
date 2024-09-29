import React, { useState, useEffect, Fragment } from 'react';
import { Icon, ScrollView } from 'ming-ui';
import { Popup } from 'antd-mobile';
import worksheetAjax from 'src/api/worksheet';
import CellControl from 'src/pages/worksheet/components/CellControls';
import { getTitleTextFromControls, controlState } from 'src/components/newCustomFields/tools/utils';
import { SHEET_VIEW_HIDDEN_TYPES } from 'worksheet/constants/enum';
import { RecordInfoModal } from 'mobile/Record';
import { BrowserRouter } from 'react-router-dom';
import styled from 'styled-components';
import _ from 'lodash';

const ModalWrap = styled(Popup)`
  .mobileContainer {
    padding-top: 25px;
  }
  .adm-popup-body {
    color: #333 !important;
    background-color: #f5f5f5;
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
    getDraftData = () => {},
    sheetSwitchPermit,
    worksheetInfo = {},
  } = props;
  const [currentRowId, setCurrentRowId] = useState('');

  // 将关联列表表格、标签页表格转换为卡片形式
  const updateMobileControls = (control = {}) => {
    if (_.includes([29, 51], control.type)) {
      const showType = _.get(control, 'advancedSetting.showtype');
      return {
        ...control,
        advancedSetting: {
          ...control.advancedSetting,
          showtype: _.includes(['5', '6'], showType) ? '2' : showType,
        },
      };
    }
    return control;
  };

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
    const utimeControl = controls.find(v => _.includes(['utime'], v.controlId));
    const showControls = displayControls
      .filter(it => !it.attribute)
      .filter(it => !_.includes(['utime'], it.controlId))
      .slice(0, 2)
      .concat(utimeControl ? utimeControl : [])
      .map(control => updateMobileControls(control));


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
                    row={data}
                    worksheetId={worksheetId}
                    sheetSwitchPermit={sheetSwitchPermit}
                    from={21}
                    className={'w100'}
                    appId={appId}
                    disableDownload={true}
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
      <ModalWrap onClose={onCancel} visible={visible} className="mobileModal full">
        <div className="flexColumn h100">
          <div className="flexRow valignWrapper pTop15 pLeft20 pRight20 pBottom8">
            <div className="flex Font15 Gray_9e leftAlign ellipsis">{_l('共%0条', draftData.length)}</div>
            <Icon icon="closeelement-bg-circle" className="Font22 Gray_9e" onClick={onCancel} />
          </div>
          <div className="flex">
            {_.isEmpty(draftData) ? (
              <div className="withoutRows flexColumn alignItemsCenter justifyContentCenter">
                <Icon icon="drafts_approval" />
                <div className="text">{_l('暂无草稿')}</div>
              </div>
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
          rowId={currentRowId}
          sheetSwitchPermit={sheetSwitchPermit}
          worksheetInfo={worksheetInfo}
          draftFormControls={controls
            .filter(
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
            )
            .map(control => updateMobileControls(control))}
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
  const { appId, controls = [], worksheetInfo, worksheetId, sheetSwitchPermit } = props;
  const [visible, setVisible] = useState(false);
  const [draftData, setDraftData] = useState([]);

  useEffect(() => {
    getDraftData();
  }, []);

  const getDraftData = () => {
    worksheetAjax
      .getFilterRows({
        appId,
        worksheetId: worksheetId || worksheetInfo.worksheetId,
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
          {/* {!_.isEmpty(draftData) && <span className="draftDot"></span>} */}
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
