import React, { useState } from 'react';
import _, { get } from 'lodash';
import { Input, Menu } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import { ControlContent } from 'worksheet/components/GroupByControl';
import { getDefaultValue } from 'worksheet/components/GroupByControl';
import { renderText } from 'src/utils/domain/control/display';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import { handleRecordError } from 'src/utils/services/worksheet/record';

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
  const normalizedKeyWords = keyWords.trim();
  const groupsForShow = groups
    .map(group => ({
      ...group,
      ...getGroupText(groupControl, group, groupEmptyName),
    }))
    .filter(group => String(group.key) !== String(currentGroupKey))
    .filter(group => !normalizedKeyWords || group.text.includes(normalizedKeyWords));
  const menuItems = groupsForShow.length
    ? groupsForShow.map(group => ({
        key: String(group.key),
        label: (
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
        ),
        onClick: () => {
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
        },
      }))
    : [{ key: 'empty', label: _l('没有搜索结果'), disabled: true }];

  return (
    <div className="flexColumn">
      <Input
        allowClear
        variant="underlined"
        value={keyWords}
        prefix={<i className="icon icon-search textSecondary Font20" />}
        onChange={event => setKeyWords(event.target.value)}
        placeholder={_l('将记录移动到...')}
      />
      <Menu className="mTop10" selectable={false} items={menuItems} />
    </div>
  );
}
