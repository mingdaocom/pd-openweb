import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Dropdown, Icon, Checkbox } from 'ming-ui';
import DropdownWrapper from 'worksheet/components/DropdownWrapper';
import { getIconByType } from 'src/pages/widgetConfig/util';
import {
  TEXT_FILTER_TYPE,
  NUMBER_FILTER_TYPE,
  RELA_FILTER_TYPE,
  GROUP_FILTER_TYPE,
  DIRECTION_TYPE,
  DATE_RANGE,
  OPTIONS_ALLOWITEM,
  SHOW_RELATE_TYPE,
  APP_ALLOWSCAN,
  ADVANCEDSETTING_KEYS,
  FASTFILTER_CONDITION_TYPE,
  getSetDefault,
  getControlFormatType,
} from './util';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { Radio } from 'antd';
import AddCondition from 'src/pages/worksheet/common/WorkSheetFilter/components/AddCondition';
import cx from 'classnames';
import errorBoundary from 'ming-ui/decorators/errorBoundary';

const Wrap = styled.div`
  width: 400px;
  .boxEditFastFilterCover {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 12;
    background: rgba(0, 0, 0, 0.2);
  }
  .boxEditFastFilter {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 400px;
    background: #fff;
    box-shadow: 0px 8px 36px 0px rgba(0, 0, 0, 0.24);
    right: 0;
    z-index: 12;
    .ant-radio-checked::after {
      position: absolute;
      top: initial;
      left: 0;
      width: 16px;
      height: 16px;
      bottom: 0;
    }
    .topHeader {
      height: 56px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: start;
      border-bottom: 1px solid #ededed;
      font-size: 16px;
      font-weight: 500;
      span {
        flex: 1;
      }
      .icon-close {
        color: #9d9d9d !important
        &:hover {
          color: #2196f3;
        }
      }
    }
    .con {
      padding: 0 24px;
      .title {
        padding-top: 24px;
        font-weight: bold;
        font-size: 13px;
        font-size: 13px;
      }
      .ant-radio-input {
        display: none !important;
      }
      .active {
        .inputBox {
          border: 1px solid #2196f3;
        }
      }
      .inputBox {
        width: 100%;
        display: flex;
        line-height: 36px;
        height: 36px;
        opacity: 1;
        background: #ffffff;
        border: 1px solid #dddddd;
        border-radius: 4px;
        padding: 0 8px 0 12px;
        .icon {
          line-height: 35px;
        }
        .itemText {
          text-align: left;
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
      .Dropdown {
        width: 100%;
        display: flex;
        line-height: 36px;
        height: 36px;
        opacity: 1;
        background: #ffffff;
        // border: 1px solid #dddddd;
        border-radius: 4px;
        margin: 8px 0;
        box-sizing: border-box;
        & > div {
          flex: 1;
        }
        .Dropdown--input {
          padding: 0 8px 0 12px;
          width: 100%;
          display: flex;
          border: 1px solid #dddddd;
          border-radius: 4px;
          height: 36px;
          &.active {
            border: 1px solid #2196f3;
          }
          .value,
          .Dropdown--placeholder {
            flex: 1;
            max-width: 100%;
          }
          .Icon {
            line-height: 36px;
            font-size: 18px;
          }
          .List {
            width: 100%;
            top: 104% !important;
          }
        }
      }
      .ming.Menu {
        width: 100%;
        top: 104% !important;
      }
      .ant-radio-group {
        display: block;
        .ant-radio-wrapper {
          width: 50%;
          display: inline-block;
          margin: 0;
        }
      }
    }

    .dropTimeWrap {
      .aroundList {
        max-height: 320px;
        overflow: scroll;
        label {
          display: block;
          padding: 8px 15px;
        }
      }
      .Dropdown--hr {
        height: 1px;
        margin-top: 6px;
        margin-bottom: 6px;
        background: #ddd;
        &:last-child {
          display: none;
        }
      }
    }
  }
`;

function Edit(params) {
  const {
    worksheetControls = [],
    view = {},
    updateCurrentView,
    activeFastFilterId,
    setActiveFastFilterId,
    onClose,
  } = params;
  let [fastFilters, setData] = useState();
  let [control, setControl] = useState();
  let [fastFilterDataControls, setDatas] = useState();
  let boxConT = useRef(null);
  let [advancedSetting, setAdvancedSetting] = useState();
  let [dataType, setDataType] = useState();
  useEffect(() => {
    const d = view.fastFilters || [];
    setData(d);
    let controlsFilter = d.map(o => {
      const c = worksheetControls.find(item => item.controlId === o.controlId) || {};
      return {
        ...o,
        isErr: !o,
        controlName: c.controlName,
        type: getControlFormatType(c),
        sourceControl: c.sourceControl,
      };
    });
    setDatas(controlsFilter);
    let dd = worksheetControls.find(item => item.controlId === activeFastFilterId) || {};
    let controlNew = controlsFilter.find(o => o.controlId === activeFastFilterId);
    if (!controlNew) {
      controlNew = {
        ...getSetDefault(dd),
        isErr: !dd.controlName,
        controlName: dd.controlName,
        type: getControlFormatType(dd),
        sourceControl: dd.sourceControl,
      };
    }
    setControl(controlNew);
    let advancedSetting = controlNew.advancedSetting || {};
    setAdvancedSetting(advancedSetting);
    setDataType(controlNew.type);
  }, [activeFastFilterId, view.fastFilters]);
  if (!control) {
    return '';
  }

  const updateViewSet = data => {
    updateCurrentView(
      Object.assign(view, {
        fastFilters: fastFilters.map((o, i) => {
          if (o.controlId === activeFastFilterId) {
            let filters = o;
            if (!ADVANCEDSETTING_KEYS.includes(Object.keys(data)[0])) {
              filters = {
                ...filters,
                ...data,
              };
            } else {
              filters = {
                ...filters,
                advancedSetting: {
                  ...advancedSetting,
                  ...data,
                },
              };
            }
            return filters;
          } else {
            return o;
          }
        }),
        editAttrs: ['fastFilters'],
      }),
    );
  };

  const renderDrop = data => {
    return (
      <React.Fragment>
        <div className="title">{data.txt}</div>
        <Dropdown
          data={data.types}
          value={data.key === 'filterType' ? control[data.key] : JSON.parse(advancedSetting[data.key]) || data.default}
          className="flex"
          onChange={newValue => {
            updateViewSet({ [data.key]: newValue });
          }}
        />
      </React.Fragment>
    );
  };
  const renderShowType = data => {
    return (
      <React.Fragment>
        <div className="title">{data.txt}</div>
        <Radio.Group
          onChange={e => {
            // 单选只支持下拉
            if (data.key === 'allowitem' && e.target.value === 1) {
              updateViewSet({ [data.key]: e.target.value, direction: 2 });
            } else {
              updateViewSet({ [data.key]: e.target.value });
            }
          }}
          value={JSON.parse(advancedSetting[data.key]) || data.default}
        >
          {data.types.map(o => {
            return (
              <Radio
                value={o.value}
                disabled={data.key === 'direction' && Number(advancedSetting.allowitem) === 1 && o.value === 1} // 平铺类型只支持多选
              >
                {o.text}
                {o.txt && <span className="Gray_9e">{o.txt}</span>}
              </Radio>
            );
          })}
        </Radio.Group>
      </React.Fragment>
    );
  };

  const getDaterange = () => {
    let { daterange } = advancedSetting;
    try {
      daterange = JSON.parse(daterange);
    } catch (error) {
      daterange = [];
    }
    return daterange;
  };

  const renderListItem = data => {
    let daterange = getDaterange();
    let isAllRange = daterange.length >= DATE_RANGE.default.length;
    return data.map((item, index) => {
      if (_.isArray(item)) {
        return (
          <React.Fragment key={index}>
            {renderListItem(item)}
            {!!item.length && <div className="Dropdown--hr" />}
          </React.Fragment>
        );
      } else {
        return (
          <React.Fragment key={index}>
            <Checkbox
              className="checkBox"
              text={item.text}
              checked={isAllRange || daterange.includes(item.value)}
              onClick={() => {
                let newValue = daterange;
                if (item.value === 'all') {
                  newValue = !isAllRange ? DATE_RANGE.default : [];
                } else {
                  if (newValue.includes(item.value)) {
                    newValue = newValue.filter(o => o !== item.value);
                  } else {
                    newValue = newValue.concat(item.value);
                  }
                }
                updateViewSet({ [DATE_RANGE.key]: JSON.stringify(newValue) });
              }}
            />
          </React.Fragment>
        );
      }
    });
  };
  const renderTimeType = () => {
    let daterange = getDaterange();
    let isAllRange = daterange.length >= DATE_RANGE.default.length;
    let dateRanges = DATE_RANGE.types;
    const activeControl = worksheetControls.find(item => item.controlId === control.controlId);
    const showType = _.get(activeControl, 'advancedSetting.showtype');
    if (_.includes(['4', '5'], showType)) {
      dateRanges = dateRanges
        .map(options =>
          options.filter(o =>
            _.includes(showType === '5' ? [15, 16, 17, 18] : [7, 8, 9, 12, 13, 14, 15, 16, 17, 18], o.value),
          ),
        )
        .filter(options => options.length);
    }
    return (
      <React.Fragment>
        <div className="title">{DATE_RANGE.txt}</div>
        <DropdownWrapper className="w100 dropTimeWrap" downElement={<div>{renderListItem(dateRanges)}</div>}>
          <div className="Dropdown--input Dropdown--border mTop6">
            <div className="inputBox">
              <div className={cx('itemText', { Gray_bd: daterange.length <= 0 })}>
                {isAllRange ? _l('全选') : daterange.length <= 0 ? _l('请选择') : _l('选了 %0 个', daterange.length)}
              </div>
              <Icon icon={'arrow-down-border'} className="mLeft12 Font18 Gray_9e" />
            </div>
          </div>
        </DropdownWrapper>
      </React.Fragment>
    );
  };

  const renderAppScan = () => {
    let { allowscan } = advancedSetting;
    return (
      <Checkbox
        className="checkBox InlineBlock mTop18"
        text={_l('App支持扫码查询')}
        checked={allowscan === '1'}
        onClick={() => {
          updateViewSet({ allowscan: allowscan === '1' ? '' : '1' });
        }}
      />
    );
  };
  const updateView = fastFilters => {
    updateCurrentView(
      Object.assign(view, {
        fastFilters,
        advancedSetting:
          fastFilters.length > 0
            ? view.advancedSetting
            : {
                ...advancedSetting,
                clicksearch: '0', //
                enablebtn: '0',
              },
        editAttrs: ['fastFilters', 'advancedSetting'],
      }),
    );
  };
  return (
    <React.Fragment>
      <div className="con">
        <div className="title">{_l('筛选字段')}</div>
        <AddCondition
          renderInParent
          className="addControl"
          columns={worksheetControls.filter(
            o =>
              (FASTFILTER_CONDITION_TYPE.includes(o.type) ||
                (o.type === 30 && FASTFILTER_CONDITION_TYPE.includes(getControlFormatType(o)))) &&
              !fastFilters.map(o => o.controlId).includes(o.controlId),
          )}
          onAdd={data => {
            const d = getSetDefault(data);
            updateView(
              fastFilters.map(o => {
                if (o.controlId === activeFastFilterId) {
                  return d;
                } else {
                  return o;
                }
              }),
            );
            setActiveFastFilterId(data.controlId);
          }}
          style={{
            width: '352px',
          }}
          offset={[0, -5]}
          classNamePopup="addControlDrop"
          comp={() => {
            const iconName = getIconByType(
              (worksheetControls.find(item => item.controlId === control.controlId) || {}).type,
              false,
            );
            return (
              <div className="inputBox mTop6" ref={boxConT}>
                {iconName ? <Icon icon={iconName} className="mRight12 Font18 Gray_75" /> : null}
                <div className="itemText">{control.controlName}</div>
                <Icon icon={'arrow-down-border'} className="mLeft12 Font18 Gray_9e" />
              </div>
            );
          }}
        />
        {[TEXT_FILTER_TYPE, RELA_FILTER_TYPE, GROUP_FILTER_TYPE, NUMBER_FILTER_TYPE].map(o => {
          if (o.keys.includes(dataType)) {
            return renderDrop(o);
          }
        })}
        {[OPTIONS_ALLOWITEM, DIRECTION_TYPE, SHOW_RELATE_TYPE].map(o => {
          if (o.keys.includes(dataType)) {
            return renderShowType(o);
          }
        })}
        {DATE_RANGE.keys.includes(dataType) && renderTimeType()}
        {APP_ALLOWSCAN.keys.includes(dataType) && renderAppScan()}
      </div>
    </React.Fragment>
  );
}
@errorBoundary
class EditCon extends React.Component {
  render() {
    return <Edit {...this.props} />;
  }
}

@withClickAway
export default class EditFastFilter extends React.Component {
  render() {
    if (!this.props.showFastFilter) {
      return '';
    }
    return (
      <Wrap>
        <div
          className="boxEditFastFilterCover"
          onClick={() => {
            this.props.onClose();
          }}
        ></div>
        <div className="boxEditFastFilter">
          <div className="topHeader">
            <span className="">{_l('筛选设置')}</span>
            <i
              className="icon icon-close Hand Font20"
              onClick={() => {
                this.props.onClose();
              }}
            ></i>
          </div>
          <EditCon {...this.props} />
        </div>
      </Wrap>
    );
  }
}
