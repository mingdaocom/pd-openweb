import React, { useMemo, useState } from 'react';
import _, { get } from 'lodash';
import styled from 'styled-components';
import { Input, ScrollView } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { ControlContent } from 'worksheet/components/GroupByControl';
import { getDefaultValue } from 'worksheet/components/GroupByControl';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { renderText } from 'src/utils/control';
import { handleRecordError } from 'src/utils/record';

const MoveRecordToOtherGroupWrap = styled.div`
  width: 360px;
  background: #ffffff;
  border-radius: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  height: 38px;
  border-radius: 3px 3px 0 0;
  border-bottom: 1px solid #ddd;
  padding: 0 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  .icon-search {
    color: #757575;
    font-size: 20px;
  }
  input {
    border: none !important;
    flex: 1;
    font-size: 13px;
  }
`;

const Content = styled(ScrollView)`
  padding: 5px 0;
  flex: 1;
  overflow-y: auto;
  .groupItem {
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    cursor: pointer;
    overflow: hidden;
    .cellOption {
      margin-bottom: 0px !important;
    }
    .controlContent {
      margin-right: 6px;
      display: flex;
      align-items: center;
      overflow: hidden;
    }
    &:hover {
      background-color: #f0f0f0;
    }
  }
`;

const Empty = styled.div`
  line-height: 36px;
  font-size: 13px;
  text-align: center;
  color: #757575;
`;

function updateRecord({ appId, viewId, worksheetId, recordId, value, control } = {}, cb = () => {}) {
  worksheetAjax
    .updateWorksheetRow({
      appId,
      viewId,
      worksheetId: worksheetId,
      rowId: recordId,
      newOldControl: [
        {
          ..._.pick(control, ['controlId', 'controlName', 'type']),
          value: control.controlId === 'ownerid' ? _.get(safeParse(value), '0.accountId') : value,
        },
      ],
    })
    .then(res => {
      if (res.resultCode === 1) {
        alert(_l('记录移动成功'));
        cb(res.data);
      } else {
        handleRecordError(res.resultCode);
      }
    });
}

function getGroupText(control, group, groupEmptyName) {
  if (group.key === '-1') {
    return {
      text: groupEmptyName,
    };
  }
  const value = getDefaultValue({ control, groupKey: group.key, name: group.name })[control.controlId];
  return {
    value,
    text: renderText({ ...control, value }),
  };
}

export default function MoveRecordToOtherGroup(props) {
  const {
    appId,
    viewId,
    worksheetId,
    recordId,
    groups = [],
    groupControl,
    currentGroupKey,
    view,
    onUpdate = () => {},
    onClose = () => {},
  } = props;
  const groupEmptyName = get(view, 'advancedSetting.groupemptyname', _l('空'));
  const [keyWords, setKeyWords] = useState('');
  const groupsForShow = useMemo(() => {
    let result = groups
      .map(group => ({
        ...group,
        ...getGroupText(groupControl, group, groupEmptyName),
      }))
      .filter(group => String(group.key) !== String(currentGroupKey));
    if (keyWords.trim()) {
      result = result.filter(group => group.text.indexOf(keyWords.trim()) > -1);
    }
    return result;
  }, [groups.map(g => g.key).join(','), keyWords.trim()]);
  return (
    <MoveRecordToOtherGroupWrap>
      <Header>
        <i className="icon icon-search" />
        <Input value={keyWords} onChange={setKeyWords} placeholder={_l('将记录移动到...')} />
        {!!keyWords && <i className="icon icon-cancel Hand Gray_9e Font16" onClick={() => setKeyWords('')}></i>}
      </Header>
      <Content style={{ maxHeight: '300px' }}>
        {!groupsForShow.length && <Empty>{_l('没有搜索结果')}</Empty>}
        {!!groupsForShow.length &&
          groupsForShow.map((group, i) => (
            <div
              className="groupItem"
              key={i}
              onClick={() => {
                updateRecord(
                  {
                    appId,
                    worksheetId,
                    viewId,
                    recordId,
                    control: groupControl,
                    value:
                      group.key === '-1'
                        ? ''
                        : getDefaultValue({ control: groupControl, groupKey: group.key, name: group.name })[
                            groupControl.controlId
                          ],
                  },
                  newRow => {
                    onUpdate({ ...newRow, group });
                    onClose();
                  },
                );
              }}
            >
              <ControlContent
                control={{
                  ...groupControl,
                  type:
                    groupControl.type === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD
                      ? groupControl.sourceControlType
                      : groupControl.type,
                }}
                groupKey={group.key}
                name={group.name}
                groupEmptyName={groupEmptyName}
              />
            </div>
          ))}
      </Content>
    </MoveRecordToOtherGroupWrap>
  );
}
