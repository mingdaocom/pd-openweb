import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import { openRelateRelateRecordTable } from 'worksheet/components/RelateRecordTableDialog';
import { openRelationSearchDialog } from 'src/components/newCustomFields/widgets/RelationSearch';
import { RELATION_SEARCH_SHOW_TYPE } from 'worksheet/constants/enum';

const Con = styled.div`
  .relationSearchTag {
    display: inline-block;
    background-color: rgba(0, 100, 240, 0.08);
    border-radius: 3px;
    height: 21px;
    line-height: 21px;
    padding: 0 6px;
    font-size: 13px;
    cursor: pointer;
    .icon {
      font-size: 16px;
      color: #9d9d9d;
      margin-right: 5px;
      position: relative;
      top: 2px;
    }
  }
`;

export default function RelationSearch(props) {
  const {
    isCharge,
    editable,
    projectId,
    appId,
    worksheetId,
    viewId,
    recordId,
    cell,
    rowFormData,
    className,
    style,
    onClick,
  } = props;
  return (
    <Con className={className} style={style} onClick={onClick}>
      <div
        className="relationSearchTag"
        onClick={e => {
          e.stopPropagation();
          if (cell.type === 51 && _.get(cell, 'advancedSetting.showtype') === String(RELATION_SEARCH_SHOW_TYPE.LIST)) {
            openRelateRelateRecordTable({
              // title: .recordTitle,
              appId,
              viewId,
              worksheetId,
              recordId,
              control: cell,
              formdata: rowFormData(),
              allowEdit: editable,
            });
          } else {
            openRelationSearchDialog({
              projectId,
              recordId,
              worksheetId,
              viewId,
              isCharge,
              control: {
                ...cell,
                advancedSetting: {
                  ...(cell.advancedSetting || {}),
                  showtype: String(RELATION_SEARCH_SHOW_TYPE.CARD),
                },
              },
              forData: rowFormData(),
            });
          }
        }}
      >
        <i className="icon icon-table"></i>
        {_l('查看')}
      </div>
    </Con>
  );
}
