import React, { createRef, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { Icon, Tooltip } from 'ming-ui';
import cx from 'classnames';
import { getIconByType } from 'src/pages/widgetConfig/util';
import './index.less';
import { FASTFILTER_CONDITION_TYPE, getSetDefault } from './util';
import AddCondition from 'src/pages/worksheet/common/WorkSheetFilter/components/AddCondition';
import { filterOnlyShowField, isOtherShowFeild } from 'src/pages/widgetConfig/util';

const Wrap = styled.div`
  .hasData {
    .addFilterCondition {
      width: 100% !important;
      position: relative;
      margin: 14px 0 0;
      height: auto !important;
      border: 0px !important;
      line-height: 1 !important;
      text-align: center;
      & > span {
        width: 100% !important;
        display: block !important;
        padding: 0 0 !important;
      }
      span.addIcon {
        position: relative;
        background: #f8f8f8;
        color: #2196f3;
        border-radius: 3px;
        display: block;
        padding: 12px 0;
        cursor: pointer;
        text-align: center;
        font-weight: bold;
        .icon {
          font-size: 20px;
        }
        &:hover {
          color: #1565c0;
          background: #f5f5f5;
        }
      }
    }
    .iconWrap {
      display: inline-block;
      vertical-align: middle;
      margin-left: 8px;
    }
  }
  .noData {
    .cover {
      padding-top: 60px;
      img {
        height: 212px;
        display: block;
      }
    }
    .addFilterCondition {
      width: 100% !important;
      position: relative;
      width: auto !important;
      height: auto !important;
      border: 0px !important;
      line-height: 1 !important;
      text-align: center;
      &.nodata {
        margin: 32px auto 0 !important;
      }
      & > span {
        width: 100% !important;
        display: block !important;
        padding: 0 0 !important;
      }
      span.addIcon {
        position: relative;
        background: #2196f3;
        border-radius: 3px;
        color: #fff;
        display: inline-block;
        padding: 12px 32px;
        cursor: pointer;
        font-weight: bold;
        .icon {
          font-size: 20px;
        }
        &:hover {
          background: #1565c0;
        }
      }
    }
  }
`;
const SortHandle = SortableHandle(() => <Icon className="mRight10 Font16 mLeft7 Hand dragHandle" icon="drag" />);

const Item = SortableElement(({ name, type, controlId, onEdit, onDelete, isErr, showOtherField }) => {
  return (
    <div className="customItemForFastFilter mBottom10" style={{}}>
      <SortHandle />
      <span
        className={cx('con', { Red: isErr || showOtherField })}
        onClick={() => {
          if (isErr || showOtherField || !onEdit) {
            return;
          }
          onEdit(controlId);
        }}
      >
        <span className="overflow_ellipsis Font13 WordBreak">
          <Icon icon={getIconByType(type, false)} className={cx('mRight12 Font18 customIcon', { Red: isErr })} />
          {isErr ? (
            <Tooltip
              text={<span>{_l('ID: %0', controlId)}</span>}
              popupPlacement="bottom"
              tooltipClass="deleteHoverTips"
            >
              <span>{_l('该字段已删除')}</span>
            </Tooltip>
          ) : showOtherField ? (
            _l('%0(无效类型)', name)
          ) : (
            name || ''
          )}
        </span>
        {!!onEdit && !isErr && !showOtherField && <Icon className="Font16 Hand editIcon" icon="new_mail" />}
      </span>
      {!!onDelete && (
        <Tooltip text={<span>{_l('删除')}</span>}>
          <Icon
            className="Font16 Hand deleteIcon mLeft15 mRight15"
            icon="delete2"
            onClick={() => {
              if (!onDelete) {
                return;
              }
              onDelete(controlId);
            }}
          />
        </Tooltip>
      )}
    </div>
  );
});

const SortableList = SortableContainer(({ items, onEdit, onDelete, worksheetControls }) => {
  return (
    <div className="mTop24">
      {_.map(items, (item, index) => {
        return (
          <Item
            {...item}
            name={item.controlName}
            key={'item_' + index}
            numN={index}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
});
export default function FastFilterCon(params) {
  const {
    worksheetControls = [],
    fastFilters = [],
    from,
    onDelete,
    onEdit,
    onSortEnd,
    showAddCondition,
    onAdd,
    customAdd,
  } = params;
  let [fastFilterDataControls, setDatas] = useState();
  useEffect(() => {
    setDatas(
      fastFilters.map(filterItem => {
        const { controlName, type, ...rest } =
          worksheetControls.find(({ controlId }) => {
            if (typeof filterItem === 'string') return controlId === filterItem;
            return controlId === filterItem.controlId;
          }) || {};
        return {
          ...rest,
          controlId: typeof filterItem === 'string' ? filterItem : filterItem.controlId,
          isErr: !controlName,
          showOtherField: isOtherShowFeild({ type, ...rest }),
          controlName,
          type,
        };
      }),
    );
  }, [fastFilters]);

  const renderAdd = () => {
    if (customAdd) return customAdd();
    return (
      <AddCondition
        renderInParent
        className="addControl"
        columns={filterOnlyShowField(worksheetControls).filter(
          o =>
            (FASTFILTER_CONDITION_TYPE.includes(o.type) ||
              (o.type === 30 && FASTFILTER_CONDITION_TYPE.includes((o.sourceControl || {}).type))) &&
            !fastFilters.map(o => o.controlId).includes(o.controlId),
        )}
        onAdd={onAdd}
        style={{
          width: '360px',
        }}
        offset={[0, 0]}
        classNamePopup="addControlDrop"
        comp={() => {
          return (
            <span className="addIcon">
              <i className="icon icon-add Font16 mRight5"></i>
              {_l('选择字段')}
            </span>
          );
        }}
        from={from}
        defaultVisible={showAddCondition}
      />
    );
  };

  return (
    <Wrap>
      {fastFilters.length > 0 ? (
        <div className="hasData">
          <SortableList
            worksheetControls={worksheetControls}
            items={fastFilterDataControls}
            useDragHandle
            onSortEnd={onSortEnd}
            helperClass={'filterSortableList'}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          {renderAdd()}
        </div>
      ) : (
        <div className="noData">{renderAdd()}</div>
      )}
    </Wrap>
  );
}
