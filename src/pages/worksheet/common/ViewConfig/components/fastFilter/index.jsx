import React, { createRef, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util';
import { Icon, Tooltip } from 'ming-ui';
import cx from 'classnames';
import { getIconByType } from 'src/pages/widgetConfig/util';
import './index.less';
import { FASTFILTER_CONDITION_TYPE, getSetDefault } from './util';
import { Checkbox } from 'ming-ui';
import bgFastFilters from './img/bgFastFilters.png';
import AddCondition from 'src/pages/worksheet/common/WorkSheetFilter/components/AddCondition';

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
    .checkBox {
      vertical-align: middle;
    }
    .ming.Checkbox.checked .Checkbox-box {
      // background-color: #9e9e9e;
    }
    .ming.Checkbox.Checkbox--disabled {
      color: #333;
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
    h6 {
      font-size: 20px;
      font-weight: 500;
      color: #333333;
      text-align: center;
      padding: 0;
      padding-top: 32px;
      margin: 0;
    }
    .text {
      font-weight: 400;
      text-align: center;
      color: #9e9e9e;
      line-height: 20px;
      font-size: 13px;
      width: 80%;
      margin: 24px auto 0;
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

const Item = SortableElement(({ name, type, controlId, editBtn, deleteBtn, numN, isErr }) => {
  return (
    <div className="customItemForFastFilter mBottom10" style={{}}>
      <SortHandle />
      <span
        className={cx('con', { Red: isErr })}
        onClick={() => {
          if (isErr) {
            return;
          }
          editBtn(numN, controlId);
        }}
      >
        <span className="overflow_ellipsis Font13 WordBreak">
          <Icon icon={getIconByType(type, false)} className={cx('mRight12 Font18 customIcon', { Red: isErr })} />
          {isErr ? _l('该字段已删除') : name || ''}
        </span>
        <Icon className="Font16 Hand editIcon" icon="new_mail" />
      </span>
      <Icon
        className="Font16 Hand deleteIcon mLeft15 mRight15"
        icon="delete2"
        onClick={() => {
          deleteBtn(numN, controlId);
        }}
      />
    </div>
  );
});

const SortableList = SortableContainer(({ items, editBtn, deleteBtn, worksheetControls }) => {
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
            editBtn={editBtn}
            deleteBtn={deleteBtn}
          />
        );
      })}
    </div>
  );
});
export default function FastFilter(params) {
  const { worksheetControls = [], setFastFilter, view = {}, updateCurrentView } = params;
  const { advancedSetting = {} } = view;
  let { enablebtn, clicksearch } = advancedSetting;
  let [fastFilters, setData] = useState(view.fastFilters || []);
  let [fastFilterDataControls, setDatas] = useState();
  let [showAddCondition, setShowAddCondition] = useState();
  let boxCon = useRef(null);
  useEffect(() => {
    const d = view.fastFilters || [];
    setData(d);
    setDatas(
      d.map(o => {
        const d = worksheetControls.find(item => item.controlId === o.controlId) || {};
        return {
          ...o,
          isErr: !o,
          controlName: d.controlName,
          type: d.type,
        };
      }),
    );
  }, [view.fastFilters]);
  const handleSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    let list = fastFilters.slice();
    const currentItem = list.splice(oldIndex, 1)[0];
    list.splice(newIndex, 0, currentItem);
    updateView(list);
  };
  const editBtn = (numN, id) => {
    setFastFilter(true, id);
  };
  const deleteBtn = (index, controlId) => {
    // let list = fastFilters.slice();
    // list.splice(index, 1);
    updateView(fastFilters.filter(o => o.controlId !== controlId));
  };
  const updateView = fastFilters => {
    updateCurrentView(
      Object.assign(view, {
        fastFilters,
        advancedSetting:
          fastFilters.length > 0
            ? {
                ...advancedSetting,
                enablebtn: fastFilters.length > 3 ? '1' : advancedSetting.enablebtn,
              }
            : {
                ...advancedSetting,
                clicksearch: '0', //
                enablebtn: '0',
              },
        editAttrs: ['fastFilters', 'advancedSetting'],
      }),
    );
  };
  const addFastFilter = data => {
    const d = getSetDefault(data);
    let dd = fastFilters.concat(d);
    if (fastFilters.length <= 0 && dd.length === 1) {
      setShowAddCondition(false);
      setTimeout(() => {
        setShowAddCondition(true);
      }, 500);
    } else {
      setShowAddCondition(undefined);
    }
    updateView(dd);
    setFastFilter(false, data.controlId);
  };

  const renderAdd = () => {
    return (
      <AddCondition
        renderInParent
        className="addControl"
        columns={worksheetControls.filter(
          o =>
            (FASTFILTER_CONDITION_TYPE.includes(o.type) ||
              (o.type === 30 && FASTFILTER_CONDITION_TYPE.includes((o.sourceControl || {}).type))) &&
            !fastFilters.map(o => o.controlId).includes(o.controlId),
        )}
        onAdd={addFastFilter}
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
        from="fastFilter"
        defaultVisible={showAddCondition}
      />
    );
  };

  const updateAdvancedSetting = data => {
    setShowAddCondition(false);
    updateCurrentView(
      Object.assign(view, {
        advancedSetting: updateViewAdvancedSetting(view, {
          ...data,
        }),
        editAttrs: ['advancedSetting'],
      }),
    );
  };

  return (
    <Wrap>
      {fastFilters.length > 0 ? (
        <div className="hasData">
          <div className="viewSetTitle">{_l('快速筛选')}</div>
          <div className="Gray_9e mTop8 mBottom4">
            {_l('选择字段作为快速筛选器平铺显示在视图中，以帮助用户快速查询记录。')}
          </div>
          <SortableList
            worksheetControls={worksheetControls}
            items={fastFilterDataControls}
            useDragHandle
            onSortEnd={handleSortEnd}
            helperClass={'filterSortableList'}
            editBtn={editBtn}
            deleteBtn={deleteBtn}
          />
          {renderAdd()}
          <div className="Gray mTop32 Bold">{_l('设置')}</div>
          <div className="mTop13">
            <Checkbox
              disabled={fastFilters.length > 3}
              className="checkBox InlineBlock"
              text={_l('启用查询按钮')}
              checked={enablebtn === '1'}
              onClick={() => {
                updateAdvancedSetting({
                  enablebtn: enablebtn !== '1' ? '1' : '0',
                });
              }}
            />
            <Tooltip
              popupPlacement="bottom"
              text={<span>{_l('启用按钮后，点击查询按钮执行筛选。当筛选字段超过3个时必须启用。')}</span>}
            >
              <div className="iconWrap pointer">
                <Icon icon="workflow_help" className="Gray_9e helpIcon Font18" />
              </div>
            </Tooltip>
          </div>
          <div className="mTop15">
            <Checkbox
              className="checkBox InlineBlock"
              text={_l('在执行查询后显示数据')}
              checked={clicksearch === '1'}
              onClick={() => {
                updateAdvancedSetting({
                  clicksearch: clicksearch !== '1' ? '1' : '0',
                });
              }}
            />

            <Tooltip
              popupPlacement="bottom"
              text={<span>{_l('勾选后，进入视图初始不显示数据，查询后显示符合筛选条件的数据。')}</span>}
            >
              <div className="iconWrap pointer">
                <Icon icon="workflow_help " className="Gray_9e helpIcon Font18" />
              </div>
            </Tooltip>
          </div>
        </div>
      ) : (
        <div className="noData">
          <div className="cover">
            <img src={bgFastFilters} alt="" srcset="" />
          </div>
          <h6 className="">{_l('快速筛选')}</h6>
          <p className="text">{_l('将字段作为筛选器显示在视图顶部，以帮助用户快速查找记录。')}</p>
          {renderAdd()}
        </div>
      )}
    </Wrap>
  );
}
