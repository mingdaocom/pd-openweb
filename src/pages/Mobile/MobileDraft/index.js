import React, { useState, useEffect, Fragment } from 'react';
import { Icon, ScrollView } from 'ming-ui';
import { Popup } from 'antd-mobile';
import worksheetAjax from 'src/api/worksheet';
import CellControl from 'src/pages/worksheet/components/CellControls';
import { getTitleTextFromControls, controlState } from 'src/components/newCustomFields/tools/utils';
import { SHEET_VIEW_HIDDEN_TYPES } from 'worksheet/constants/enum';
import { SYSTEM_ENUM } from 'src/components/newCustomFields/tools/config';
import { RecordInfoModal } from 'mobile/Record';
import { updateDraftTotalInfo } from 'src/pages/worksheet/common/WorksheetDraft/utils';
import { BrowserRouter } from 'react-router-dom';
import styled from 'styled-components';
import _ from 'lodash';

const ModalWrap = styled(Popup)`
  .mobileContainer {
    padding-top: 25px;
  }
  .adm-popup-body {
    color: #151515 !important;
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
    controls = [],
    addNewRecord, // 提交草稿新增记录
    sheetSwitchPermit,
    worksheetInfo = {},
    updateDraftTotal = () => {},
  } = props;
  const [currentRowId, setCurrentRowId] = useState('');
  const [draftData, setDraftDataList] = useState([]);

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

  const renderRow = data => {
    const titleText = getTitleTextFromControls(controls, data);
    const displayControls = controls.filter(
      item =>
        !_.includes([...SHEET_VIEW_HIDDEN_TYPES, 47], item.type) &&
        !_.includes(SYSTEM_ENUM, item.controlId) &&
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
          allowEmptySubmit
          visible={!!currentRowId}
          appId={appId}
          worksheetId={worksheetId}
          rowId={currentRowId}
          sheetSwitchPermit={sheetSwitchPermit}
          worksheetInfo={worksheetInfo}
          getDataType={21}
          from={21}
          onClose={() => {
            getDraftData({ appId, worksheetId });
            setCurrentRowId('');
          }}
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
          addNewRecord={addNewRecord}
        />
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
