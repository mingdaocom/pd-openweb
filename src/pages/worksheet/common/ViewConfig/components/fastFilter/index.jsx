import React, { createRef, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util';
import { Icon, Tooltip } from 'ming-ui';
import './index.less';
import { FASTFILTER_CONDITION_TYPE, getSetDefault } from './util';
import { Checkbox } from 'ming-ui';
import bgFastFilters from './img/bgFastFilters.png';
import FastFilterCon from './fastFilterCon';
const Wrap = styled.div`
  .hasData {
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
  }
`;

export default function FastFilter(params) {
  const { worksheetControls = [], setFastFilter, view = {}, updateCurrentView } = params;
  const { advancedSetting = {} } = view;
  let { enablebtn, clicksearch } = advancedSetting;
  let [fastFilters, setData] = useState(view.fastFilters || []);
  let [showAddCondition, setShowAddCondition] = useState();
  useEffect(() => {
    const d = view.fastFilters || [];
    setData(d);
  }, [view.fastFilters]);
  const handleSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    let list = fastFilters.slice();
    const currentItem = list.splice(oldIndex, 1)[0];
    list.splice(newIndex, 0, currentItem);
    updateView(list);
  };
  const onEdit = id => {
    setFastFilter(true, id);
  };
  const onDelete = controlId => {
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

  const renderFastFilterCon = () => {
    return (
      <FastFilterCon
        fastFilters={fastFilters}
        worksheetControls={worksheetControls}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdd={addFastFilter}
        onSortEnd={handleSortEnd}
        from="fastFilter"
        showAddCondition={showAddCondition}
      />
    );
  };

  return (
    <Wrap>
      {fastFilters.length > 0 ? (
        <div className="hasData">
          <div className="viewSetTitle">{_l('????????????')}</div>
          <div className="Gray_9e mTop8 mBottom4">
            {_l('????????????????????????????????????????????????????????????????????????????????????????????????')}
          </div>
          {renderFastFilterCon()}
          <div className="Gray mTop32 Bold">{_l('??????')}</div>
          <div className="mTop13">
            <Checkbox
              disabled={fastFilters.length > 3}
              className="checkBox InlineBlock"
              text={_l('??????????????????')}
              checked={enablebtn === '1'}
              onClick={() => {
                updateAdvancedSetting({
                  enablebtn: enablebtn !== '1' ? '1' : '0',
                });
              }}
            />
            <Tooltip
              popupPlacement="bottom"
              text={<span>{_l('????????????????????????????????????????????????????????????????????????3?????????????????????')}</span>}>
              <div className="iconWrap pointer">
                <Icon icon="workflow_help" className="Gray_9e helpIcon Font18" />
              </div>
            </Tooltip>
          </div>
          <div className="mTop15">
            <Checkbox
              className="checkBox InlineBlock"
              text={_l('??????????????????????????????')}
              checked={clicksearch === '1'}
              onClick={() => {
                updateAdvancedSetting({
                  clicksearch: clicksearch !== '1' ? '1' : '0',
                });
              }}
            />

            <Tooltip
              popupPlacement="bottom"
              text={<span>{_l('?????????????????????????????????????????????????????????????????????????????????????????????')}</span>}>
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
          <h6 className="">{_l('????????????')}</h6>
          <p className="text">{_l('??????????????????????????????????????????????????????????????????????????????????????????')}</p>
          {renderFastFilterCon()}
        </div>
      )}
    </Wrap>
  );
}
