import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { useRelateRecordTableDialog } from 'worksheet/components/RelateRecordTableDialog';
import { useRelationSearchDialog } from 'src/components/Form/DesktopForm/widgets/RelationSearch';
import { RELATION_SEARCH_SHOW_TYPE } from 'src/utils/domain/worksheet/constants';

const Con = styled.div`
  .relationSearchTag {
    display: inline-block;
    background-color: var(--color-primary-transparent);
    border-radius: 3px;
    height: 21px;
    line-height: 21px;
    padding: 0 6px;
    font-size: 13px;
    cursor: pointer;
    .icon {
      font-size: 16px;
      color: var(--color-text-tertiary);
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
  const { open: openRelateRelateRecordTable, holder: relateRecordTableDialogHolder } = useRelateRecordTableDialog();
  const { open: openRelationSearchDialog, holder: relationSearchDialogHolder } = useRelationSearchDialog();

  return (
    <Con className={className} style={style} onClick={onClick}>
      {relateRecordTableDialogHolder}
      {relationSearchDialogHolder}
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
              formdata: _.isFunction(rowFormData) ? rowFormData() : rowFormData,
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
              forData: _.isFunction(rowFormData) ? rowFormData() : rowFormData,
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
