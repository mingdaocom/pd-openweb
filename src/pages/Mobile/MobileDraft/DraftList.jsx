import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import { Icon, ScrollView } from 'ming-ui';
import styled from 'styled-components';
import { RecordInfoModal } from 'mobile/Record';
import { SHEET_VIEW_HIDDEN_TYPES } from 'worksheet/constants/enum';
import worksheetAjax from 'src/api/worksheet';
import { SYSTEM_ENUM } from 'src/components/newCustomFields/tools/config';
import { controlState, getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import CellControl from 'src/pages/worksheet/components/CellControls';

const Wrap = styled.div`
  &.recordCardContent {
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

export default function DraftList(props) {
  const {
    draftData = [],
    appId,
    worksheetId,
    worksheetInfo = {},
    addNewRecord = () => {},
    updateDraftList = () => {},
    getDraftData = () => {},
  } = props;
  const {
    template: { controls = [] },
    switches,
  } = worksheetInfo;
  const [currentRowId, setCurrentRowId] = useState('');

  const handleDelete = (e, data) => {
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
          updateDraftList(data.rowid);
        } else {
          alert(_l('删除草稿失败'), 2);
        }
      });
  };

  const renderRecordItem = data => {
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
      .concat(utimeControl ? utimeControl : []);

    return (
      <Wrap key={data.rowid} className="recordCardContent" onClick={() => setCurrentRowId(data.rowid)}>
        <div className="flexRow valignWrapper mBottom5">
          <div className="Gray Blod Font14 ellipsis">{titleText}</div>
        </div>
        {showControls.map(control => {
          return (
            <div className="controlWrapper" key={`${data.rowid}-${control.controlId}`}>
              <div className="controlName ellipsis Gray_9e mRight10">{control.controlName}</div>
              <div className="controlContent ellipsis">
                {data[control.controlId] ? (
                  <CellControl
                    rowHeight={34}
                    cell={Object.assign({}, control, { value: data[control.controlId] })}
                    row={data}
                    worksheetId={worksheetId}
                    sheetSwitchPermit={switches}
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
          <Icon icon="delete2" onClick={e => handleDelete(e, data)} />
        </div>

        {!!currentRowId && (
          <RecordInfoModal
            className="full"
            allowEmptySubmit
            visible={!!currentRowId}
            appId={appId}
            worksheetId={worksheetId}
            rowId={currentRowId}
            sheetSwitchPermit={switches}
            worksheetInfo={worksheetInfo}
            getDataType={21}
            from={21}
            onClose={() => {
              getDraftData();
              setCurrentRowId('');
            }}
            updateDraftList={updateDraftList}
            addNewRecord={addNewRecord}
          />
        )}
      </Wrap>
    );
  };

  return (
    <Fragment>
      {_.isEmpty(draftData) ? (
        <div className="withoutRows flexColumn alignItemsCenter justifyContentCenter">
          <Icon icon="drafts_approval" />
          <div className="text">{_l('暂无记录')}</div>
        </div>
      ) : (
        <ScrollView scrollContentClassName="pTop20 pBottom20">
          {draftData.map(item => renderRecordItem(item))}
        </ScrollView>
      )}
    </Fragment>
  );
}
