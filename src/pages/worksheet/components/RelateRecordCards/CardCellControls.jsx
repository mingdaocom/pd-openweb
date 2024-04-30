import React from 'react';
import styled from 'styled-components';
import CellControl from 'worksheet/components/CellControls';
import { checkCellIsEmpty } from 'worksheet/util';
import _ from 'lodash';

const Con = styled.div``;

const Empty = styled.span`
  display: inline-block;
  width: 22px;
  height: 6px;
  background: #eaeaea;
  border-radius: 3px;
`;

const Group = styled.div`
  display: inline-block;
`;

const Control = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 12px;
  line-height: 28px;
  .label {
    max-width: 160px;
    color: #9e9e9e;
    padding-right: 1em;
  }
  .content {
    flex: 1;
    height: 28px;
    overflow: hidden;
    white-space: nowrap;
    .cellOptions,
    .cellDepartments,
    .cellUsers,
    .RelateRecordDropdown {
      overflow: hidden;
      width: 100%;
    }
    *:not(.icon) {
      font-size: 12px !important;
    }
  }
`;

export default function CardCellControls(props) {
  const { width, controls, data, parentControl, projectId, worksheetId, viewId, isCharge, sheetSwitchPermit } = props;
  let showColNum = 1;
  if (width > 950 && controls.length > 6) {
    showColNum = 3;
  } else if (width > 670 && controls.length > 3) {
    showColNum = 2;
  }
  const groups = _.chunk(controls, 3).slice(0, showColNum);
  return (
    <Con>
      {groups.map((group, gi) => (
        <Group
          style={{
            width: `${_.round(100 / showColNum, 2)}%`,
          }}
          key={gi}
        >
          {group.map((control, i) => (
            <Control key={i}>
              <div className="label ellipsis">{control.controlName}</div>
              <div className={`content control${control.type}`}>
                {!checkCellIsEmpty(data[control.controlId]) ? (
                  <CellControl
                    cell={Object.assign({}, control, { value: data[control.controlId] })}
                    row={data}
                    worksheetId={worksheetId}
                    from={4}
                    rowFormData={() => _.get(parentControl, 'formData') || []}
                    projectId={projectId}
                    viewId={viewId}
                    isCharge={isCharge}
                    sheetSwitchPermit={sheetSwitchPermit}
                  />
                ) : (
                  <Empty />
                )}
              </div>
            </Control>
          ))}
        </Group>
      ))}
    </Con>
  );
}
