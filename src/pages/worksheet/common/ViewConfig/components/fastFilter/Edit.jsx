import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import { Dropdown, Icon, Checkbox, Input } from 'ming-ui';
import DropdownWrapper from 'worksheet/components/DropdownWrapper';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import {
  MULTI_SELECT_FILTER_TYPE,
  TEXT_FILTER_TYPE,
  LIMIT,
  NUMBER_FILTER_TYPE,
  DATE_FILTER_TYPE,
  RELA_FILTER_TYPE,
  GROUP_FILTER_TYPE,
  DIRECTION_TYPE,
  DATE_RANGE,
  OPTIONS_ALLOWITEM,
  SHOW_RELATE_TYPE,
  APP_ALLOWSCAN,
  ADVANCEDSETTING_KEYS,
  Filter_KEYS,
  FASTFILTER_CONDITION_TYPE,
  NAV_SHOW_TYPE,
  getSetDefault,
  getControlFormatType,
  DATE_TYPE_M,
  DATE_TYPE_Y,
  DATE_GRANULARITY_TYPE,
  getDefaultDateRange,
  getDefaultDateRangeType,
} from './util';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { Radio } from 'antd';
import AddCondition from 'src/pages/worksheet/common/WorkSheetFilter/components/AddCondition';
import cx from 'classnames';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import _ from 'lodash';
import { NAVSHOW_TYPE } from 'src/pages/worksheet/common/ViewConfig/components/navGroup/util';
import NavShow from 'src/pages/worksheet/common/ViewConfig/components/navGroup/NavShow';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import { formatAdvancedSettingByNavfilters, formatObjWithNavfilters } from 'src/pages/worksheet/common/ViewConfig/util';
import SearchConfig from './SearchConfig';
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
      min-height: 56px;
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
      overflow: auto;
      padding: 0 24px;
      .title {
        padding-top: 24px;
        margin-top: 0!important;
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
        padding: 0 12px 0 12px;
        .icon {
          line-height: 35px;
        }
        &.timeRange {
          padding: 0 0 0 12px;
          .act{
            width: 18px;
            height: 18px;
            margin-right: 5px;
          }
          .clearTimeRange,
          .changeTimeRange{
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            display:block;
            &.clearTimeRange{
              display:none;
            }
          }
          &:hover{
            .clearTimeRange{
              display:block;
            }
            .changeTimeRange{
              display:none;
            }
          }
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
        background: #fff;
        border-radius: 4px;
        margin-top: 8px;
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
          .icon-arrow-down-border{
            font-size: 14px;
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
          vertical-align: top;
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
  .filterDefaultValue{
    div:first-child {
      font-weight: bold;
    }
  }
  .RelateRecordDropdown-selected {
    height: auto;
  }
  input[type='number'] {
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      margin: 0;
      -webkit-appearance: none !important;
    }
  }
  .ming.Input{
    font-size: 13px;
    border: 1px solid #ddd;
    &:hover {
      border-color: #bbb;
    }
    &:focus {
      border-color: #2196f3;
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
    currentSheetInfo,
  } = params;
  let boxConT = useRef(null);
  const [{ fastFilters, control, advancedSetting, dataType, dataControls }, setState] = useSetState({
    fastFilters: [],
    control: {},
    advancedSetting: {},
    dataType: null,
    dataControls: {},
  });
  useEffect(() => {
    const d = view.fastFilters || [];
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
    let dd = worksheetControls.find(item => item.controlId === activeFastFilterId) || {};
    let controlNew = controlsFilter.find(o => o.controlId === activeFastFilterId);
    if ([10].includes(controlNew.type) && controlNew.filterType === 0) {
      //单选转成多选的字段 是、是其中一个=包含其中一个
      controlNew.filterType = 2;
    }
    if (!controlNew) {
      controlNew = {
        ...getSetDefault(dd),
        isErr: !dd.controlName,
        controlName: dd.controlName,
        type: getControlFormatType(dd),
        sourceControl: dd.sourceControl,
      };
    }
    let advancedSetting = controlNew.advancedSetting || {};
    setState({ fastFilters: d, dataControls: dd, control: controlNew, advancedSetting, dataType: controlNew.type });
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
            Object.keys(data).map(ii => {
              if (![...ADVANCEDSETTING_KEYS, ...Filter_KEYS].includes(ii)) {
                filters[ii] = data[ii];
              } else {
                if (ADVANCEDSETTING_KEYS.includes(ii)) {
                  filters.advancedSetting[ii] = data[ii];
                } else {
                  filters[ii] = data[ii];
                }
              }
            });
            return formatObjWithNavfilters(filters);
          } else {
            return formatObjWithNavfilters(o);
          }
        }),
        editAttrs: ['fastFilters'],
      }),
    );
  };

  const renderDrop = data => {
    let conData = worksheetControls.find(item => item.controlId === control.controlId) || {};
    let dataInfo = data.types.map(o => {
      return { ...o, disabled: !!conData.encryId && o.value !== FILTER_CONDITION_TYPE.EQ };
    });
    if (['dateRangeType'].includes(data.key)) {
      dataInfo =
        _.get(conData, 'advancedSetting.showtype') === '5'
          ? dataInfo.filter(o => o.value === 5)
          : _.get(conData, 'advancedSetting.showtype') === '4'
          ? dataInfo.filter(o => o.value !== 3)
          : dataInfo;
    }
    let type = getControlFormatType(control);
    let value = ['filterType', 'dateRangeType'].includes(data.key)
      ? ['filterType'].includes(data.key) && data.keys.includes(type) && control[data.key] === 0
        ? FILTER_CONDITION_TYPE.DATE_BETWEEN //兼容老数据的默认值
        : control[data.key]
      : JSON.parse(advancedSetting[data.key]) || data.default;
    return (
      <React.Fragment>
        <div className="title">{data.txt}</div>
        <Dropdown
          data={dataInfo}
          value={!dataInfo.find(o => o.value === value) ? undefined : value}
          className="flex"
          onChange={newValue => {
            let dataNew = { [data.key]: newValue };
            if (data.keys.includes(type) && [15, 16].includes(type)) {
              let daterange = getDaterange();
              if (['dateRangeType'].includes(data.key)) {
                dataNew = {
                  ...dataNew,
                  daterange: JSON.stringify(
                    daterange.filter(o =>
                      newValue == 5 ? DATE_TYPE_Y.includes(o) : newValue == 4 ? DATE_TYPE_M.includes(o) : true,
                    ),
                  ),
                };
              }
              if (['filterType'].includes(data.key)) {
                //日期字段筛选方式切换，颗粒度清空
                dataNew = {
                  ...dataNew,
                  daterange: JSON.stringify(daterange.filter(o => getDefaultDateRange(conData).includes(o))),
                  dateRangeType:
                    newValue !== FILTER_CONDITION_TYPE.DATEENUM ? undefined : getDefaultDateRangeType(conData),
                };
              }
            }
            updateViewSet({
              ...dataNew,
            });
          }}
          isAppendToBody
        />
        {!!conData.encryId && (
          <span className="Gray_75 mTop8 Block">
            {_l('当前字段已加密，只支持按照')}
            {(data.types.find(o => o.value === FILTER_CONDITION_TYPE.EQ) || {}).text}
          </span>
        )}
      </React.Fragment>
    );
  };
  const renderShowType = data => {
    return (
      <React.Fragment>
        <div className="title">{data.txt}</div>
        <Radio.Group
          onChange={e => {
            //  筛选方式默认等于 多选类型的字段
            if (data.key === 'allowitem' && e.target.value === 1 && MULTI_SELECT_FILTER_TYPE.keys.includes(dataType)) {
              updateViewSet({
                [data.key]: e.target.value,
                filterType: MULTI_SELECT_FILTER_TYPE.default,
              });
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
                // disabled={data.key === 'direction' && Number(advancedSetting.allowitem) === 1 && o.value === 1} // 平铺类型只支持多选
              >
                {o.text}
                {o.txt && <span className="Gray_75">{o.txt}</span>}
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
    const dateRangeType = _.get(control, 'dateRangeType') + '';
    let daterange = getDaterange().filter(o =>
      dateRangeType === '5' ? DATE_TYPE_Y.includes(o) : dateRangeType === '4' ? DATE_TYPE_M.includes(o) : true,
    );
    let dateRanges = DATE_RANGE.types;
    const activeControl = worksheetControls.find(item => item.controlId === control.controlId);
    const showType = _.get(activeControl, 'advancedSetting.showtype');
    let isAllRange = daterange.length >= DATE_RANGE.default.length;
    if (_.includes(['4', '5'], showType) || _.includes(['4', '5'], dateRangeType)) {
      dateRanges = dateRanges
        .map(options =>
          options.filter(o => _.includes([dateRangeType, showType].includes('5') ? DATE_TYPE_Y : DATE_TYPE_M, o.value)),
        )
        .filter(options => options.length);
      isAllRange = [dateRangeType, showType].includes('5')
        ? daterange.length >= DATE_TYPE_Y.length
        : daterange.length >= DATE_TYPE_M.length;
    }
    return (
      <React.Fragment>
        <div className="title">{DATE_RANGE.txt}</div>
        <DropdownWrapper className="w100 dropTimeWrap" downElement={<div>{renderListItem(dateRanges)}</div>}>
          <div className="Dropdown--input Dropdown--border mTop6">
            <div className="inputBox timeRange flexRow alignItemsCenter">
              <div className={cx('itemText flex', { Gray_bd: daterange.length <= 0 })}>
                {isAllRange ? _l('全选') : daterange.length <= 0 ? _l('请选择') : _l('选了 %0 个', daterange.length)}
              </div>
              <div className="act Relative">
                <Icon icon={'arrow-down-border'} className="Font14 Gray_9e changeTimeRange" />
                <Icon
                  icon={'cancel1'}
                  className="Font14 Gray_9e clearTimeRange Hand"
                  onClick={e => {
                    e.stopPropagation();
                    updateViewSet({
                      advancedSetting: { ...advancedSetting, daterange: '[]' },
                    });
                  }}
                />
              </div>
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
  const renderLimit = () => {
    return (
      <React.Fragment>
        <div className="title">{_l('位数')}</div>
        <Input
          type="number"
          className="w100 mTop8 placeholderColor"
          value={_.get(advancedSetting, 'limit')}
          placeholder={_l('请输入数值')}
          onChange={limit => {
            setState({
              advancedSetting: {
                ...advancedSetting,
                limit,
              },
            });
          }}
          onBlur={e => {
            let limit = e.target.value.trim();
            updateViewSet({ limit });
          }}
        />
      </React.Fragment>
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
      <div className="con flex">
        <div className="title">{_l('筛选字段')}</div>
        <AddCondition
          renderInParent
          className="addControl"
          columns={setSysWorkflowTimeControlFormat(worksheetControls, currentSheetInfo.switches || []).filter(
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
          offset={[0, 1]}
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
                <Icon icon={'arrow-down-border'} className="mLeft12 Font14 Gray_9e" />
              </div>
            );
          }}
        />
        {[TEXT_FILTER_TYPE, RELA_FILTER_TYPE, GROUP_FILTER_TYPE, NUMBER_FILTER_TYPE, DATE_FILTER_TYPE].map(o => {
          if (o.keys.includes(dataType)) {
            return renderDrop(o);
          }
        })}
        {/* 日期类型且筛选方式为等于 */}
        {DATE_GRANULARITY_TYPE.keys.includes(dataType) &&
          [FILTER_CONDITION_TYPE.DATEENUM].includes(control.filterType) &&
          renderDrop(DATE_GRANULARITY_TYPE)}
        {TEXT_FILTER_TYPE.keys.includes(dataType) &&
          FILTER_CONDITION_TYPE.TEXT_ALLCONTAIN === control[TEXT_FILTER_TYPE.key] && (
            <div className="mTop10 Gray_75">
              {_l('- 使用同时包含时，搜索内容中的空格将用于分词')}
              <br />
              {_l('- 在大数据量时使用包含、同时包含条件可能非常缓慢，建议使用等于，并创建索引来优化性能。')}
            </div>
          )}
        {[NAV_SHOW_TYPE].map(o => {
          if (o.keys.includes(dataType)) {
            const { advancedSetting = {}, controlId } = control; //快速筛选
            const info = worksheetControls.find(it => it.controlId === controlId) || {};
            const { navshow, navfilters = [] } = advancedSetting;
            return (
              <NavShow
                canShowNull
                fromCondition={'fastFilter'}
                params={{
                  types: NAVSHOW_TYPE.filter(o => o.value !== '1').filter(o => {
                    //选项作为分组，分组没有筛选
                    let type = info.type === 30 ? info.sourceControlType : info.type;
                    if ([9, 10, 11, 26].includes(type)) {
                      return o.value !== '3';
                    } else {
                      return true;
                    }
                  }),
                  txt: _l('显示项'),
                }}
                value={navshow}
                onChange={newValue => {
                  updateViewSet({
                    advancedSetting: { ...advancedSetting, ...newValue },
                  });
                }}
                advancedSetting={advancedSetting}
                navfilters={navfilters}
                filterInfo={{
                  allControls: info.relationControls,
                  globalSheetInfo: _.pick(currentSheetInfo, [
                    'appId',
                    'groupId',
                    'name',
                    'projectId',
                    'roleType',
                    'worksheetId',
                    'switches',
                  ]),
                  globalSheetControls: [
                    ...view.fastFilters.map(o => worksheetControls.find(it => it.controlId === o.controlId)),
                    view.navGroup && view.navGroup.length > 0
                      ? {
                          ...worksheetControls.find(it => it.controlId === view.navGroup[0].controlId),
                          isNavGroup: true,
                        }
                      : null,
                  ].filter(it => !!it && _.get(it, 'controlId') !== activeFastFilterId),
                  columns: worksheetControls,
                  navGroupId: controlId,
                }}
              />
            );
          }
        })}
        {[OPTIONS_ALLOWITEM].map(o => {
          if (o.keys.includes(dataType)) {
            return renderShowType(o);
          }
        })}
        {[MULTI_SELECT_FILTER_TYPE].map(o => {
          //多选类型字段 且 允许选择数量为多选 =>支持设置筛选方式  多选 => 人员、部门、组织角色enumDefault：1; 关联字段enumDefault: 2 ;多选字段
          if (
            o.keys.includes(dataType) &&
            (([26, 27, 48].includes(dataType) && dataControls.enumDefault === 1) ||
              (dataType === 29 && dataControls.enumDefault === 2) ||
              dataType === 10) &&
            Number(advancedSetting.allowitem) === 2
          ) {
            return renderDrop(o);
          }
        })}
        {[DIRECTION_TYPE, SHOW_RELATE_TYPE].map(o => {
          if (o.keys.includes(dataType)) {
            return renderShowType(o);
          }
        })}
        {DATE_RANGE.keys.includes(dataType) && renderTimeType()}
        {LIMIT.keys.includes(dataType) &&
          [FILTER_CONDITION_TYPE.START, FILTER_CONDITION_TYPE.END].includes(control.filterType) &&
          renderLimit()}
        {APP_ALLOWSCAN.keys.includes(dataType) && renderAppScan()}
        {/* <div className="mTop24 filterDefaultValue">
          <FilterDefaultValue
            firstControlData={_.cloneDeep(dataControls)}
            dataType={dataType}
            filter={control}//带默认值的内容 ？？？
            setFilter={data => {
              console.log(data);
            }}
          />
        </div> */}
        {[29].includes(dataType) && _.get(advancedSetting, 'navshow') !== '2' && (
          <SearchConfig
            controls={dataControls.relationControls}
            data={advancedSetting}
            onChange={newValue => {
              updateViewSet({
                ...newValue,
              });
            }}
          />
        )}
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
        <div className="boxEditFastFilter flexColumn">
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
