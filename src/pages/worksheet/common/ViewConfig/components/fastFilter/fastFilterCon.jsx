import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, SortableList } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { filterOnlyShowField, isOtherShowFeild } from 'src/pages/widgetConfig/util';
import AddCondition from 'src/pages/worksheet/common/WorkSheetFilter/components/AddCondition';
import { FASTFILTER_CONDITION_TYPE } from './util';
import './index.less';

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
        color: #1677ff;
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
        width: 100%;
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
        background: #1677ff;
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

const Item = ({ name, type, controlId, onEdit, onDelete, isErr, showOtherField, DragHandle }) => {
  return (
    <div className="customItemForFastFilter mBottom10">
      <DragHandle className="alignItemsCenter flexRow">
        <Icon className="mRight10 Font16 mLeft7 Hand dragHandle" icon="drag" />
      </DragHandle>
      <span
        className={cx('con overflow_ellipsis alignItemsCenter', { Red: isErr || showOtherField })}
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
            <Tooltip title={_l('ID: %0', controlId)} placement="bottom">
              <span>{_l('该字段已删除')}</span>
            </Tooltip>
          ) : showOtherField ? (
            _l('%0(无效类型)', name)
          ) : (
            name || ''
          )}
        </span>
        {!!onEdit && !isErr && !showOtherField && <Icon className="Font16 Hand editIcon" icon="edit" />}
      </span>
      {!!onDelete && (
        <Tooltip title={_l('删除')}>
          <Icon
            className="Font16 Hand deleteIcon mLeft15 mRight15"
            icon="trash"
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
};

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
  let [fastFilterDataControls, setDatas] = useState([]);
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
          width: '440px',
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
          <div className="mTop24">
            <SortableList
              worksheetControls={worksheetControls}
              items={fastFilterDataControls}
              itemKey="controlId"
              useDragHandle
              onSortEnd={list => {
                const order = list.map(o => o.controlId);
                onSortEnd(
                  fastFilters.sort((a, b) => {
                    return order.findIndex(id => id === a.controlId) - order.findIndex(id => id === b.controlId);
                  }),
                );
              }}
              helperClass={'filterSortableList'}
              renderItem={options => (
                <Item
                  {...options}
                  {...options.item}
                  name={options.item.controlName}
                  key={'item_' + options.index}
                  numN={options.index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )}
            />
          </div>
          {renderAdd()}
        </div>
      ) : (
        <div className="noData">{renderAdd()}</div>
      )}
    </Wrap>
  );
}
