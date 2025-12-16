import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Checkbox, Icon, Input } from 'ming-ui';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { filterOnlyShowField, getIconByType } from 'src/pages/widgetConfig/util';
import NavShow from 'src/pages/worksheet/common/ViewConfig/components/navGroup/NavShow';
import { NAVSHOW_TYPE } from 'src/pages/worksheet/common/ViewConfig/components/navGroup/util';
import { formatObjWithNavfilters } from 'src/pages/worksheet/common/ViewConfig/util';
import AddCondition from 'src/pages/worksheet/common/WorkSheetFilter/components/AddCondition';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import DateTimeDataRange from '../DateTimeDataRange';
import SearchConfig from '../SearchConfig';
import {
  ADVANCEDSETTING_KEYS,
  APP_ALLOWSCAN,
  DATE_FILTER_TYPE,
  DATE_GRANULARITY_TYPE,
  DATE_RANGE,
  DIRECTION_TYPE,
  FASTFILTER_CONDITION_TYPE,
  Filter_KEYS,
  formatFastFilterData,
  getControlFormatType,
  getSetDefault,
  GROUP_FILTER_TYPE,
  LIMIT,
  MULTI_SELECT_FILTER_TYPE,
  NAV_SHOW_TYPE,
  NUMBER_FILTER_TYPE,
  OPTIONS_ALLOWITEM,
  RELA_FILTER_TYPE,
  SHOW_RELATE_TYPE,
  TEXT_FILTER_TYPE,
} from '../util';
import DefCom from './DefCom';
import DropCom from './DropCom';
import ShowTypeCom from './ShowTypeCom';
import { Wrap } from './style';

function Edit(params) {
  const {
    worksheetControls = [],
    view = {},
    updateCurrentView,
    activeFastFilterId,
    setActiveFastFilterId,
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
    let controlNew = controlsFilter.find(o => o.controlId === activeFastFilterId) || {};
    if ([10].includes(controlNew.type) && controlNew.filterType === 0) {
      //单选转成多选的字段 是、是其中一个=包含其中一个
      controlNew.filterType = 2;
    }
    if (!controlNew.controlId) {
      controlNew = {
        ...getSetDefault(dd),
        isErr: !dd.controlName,
        controlName: dd.controlName,
        sourceControl: dd.sourceControl,
      };
    }
    controlNew.type = getControlFormatType(dd);
    let advancedSetting = controlNew.advancedSetting || {};
    setState({ fastFilters: d, dataControls: dd, control: controlNew, advancedSetting, dataType: controlNew.type });
  }, [activeFastFilterId, view.fastFilters]);
  if (!control) {
    return '';
  }

  const updateViewSet = data => {
    updateCurrentView(
      Object.assign(view, {
        fastFilters: formatFastFilterData(
          fastFilters.map(o => {
            if (o.controlId === activeFastFilterId) {
              let filters = o;
              Object.keys(data).forEach(ii => {
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
        ),
        editAttrs: ['fastFilters'],
      }),
    );
  };

  const getDaterange = () => {
    let { daterange } = advancedSetting;
    try {
      daterange = safeParse(daterange, 'array');
    } catch (error) {
      console.log(error);
      daterange = [];
    }
    return daterange;
  };

  const renderAppScan = () => {
    let { allowscan } = advancedSetting;
    return (
      <Checkbox
        className="checkBox InlineBlock mTop18"
        text={_l('移动端支持扫码查询')}
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
          min={0}
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
  const updateView = (fastFilters, advanced) => {
    let param = { fastFilters };
    if (advanced) {
      param.advancedSetting = advanced;
    }
    if (fastFilters.length <= 0) {
      param.advancedSetting = {
        ...param.advancedSetting,
        clicksearch: '0',
        enablebtn: '0',
      };
    }
    param.editAttrs = Object.keys(param);
    if (Object.keys(param.advancedSetting || {}).length > 0) {
      param.editAdKeys = Object.keys(param.advancedSetting || {});
    }
    updateCurrentView(Object.assign(view, param));
  };

  const getShowTypeForDataRange = () => {
    const controlData = worksheetControls.find(item => item.controlId === control.controlId) || {};
    const { type } = controlData;
    if (type === 38) {
      return _.get(controlData, 'unit');
    }
    return _.get(controlData, 'advancedSetting.showtype');
  };

  return (
    <React.Fragment>
      <div className="con flex">
        <div className="title">{_l('筛选字段')}</div>
        <AddCondition
          renderInParent
          className="addControl"
          columns={filterOnlyShowField(
            setSysWorkflowTimeControlFormat(worksheetControls, currentSheetInfo.switches || []),
          ).filter(
            o =>
              (FASTFILTER_CONDITION_TYPE.includes(o.type) ||
                (o.type === 30 && FASTFILTER_CONDITION_TYPE.includes(getControlFormatType(o)))) &&
              !fastFilters.map(o => o.controlId).includes(o.controlId),
          )}
          onAdd={data => {
            const d = getSetDefault(data);
            const fastFilterData = fastFilters.map(o => {
              if (o.controlId === activeFastFilterId) {
                return d;
              } else {
                return o;
              }
            });
            const ids = safeParse(_.get(view, 'advancedSetting.requiredcids'), 'array');
            if (ids.includes(control.controlId)) {
              updateView(fastFilterData, { requiredcids: JSON.stringify(ids.filter(o => o !== control.controlId)) });
            } else {
              updateView(fastFilterData);
            }
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
            return (
              <DropCom
                data={o}
                worksheetControls={worksheetControls}
                control={control}
                advancedSetting={advancedSetting}
                updateViewSet={updateViewSet}
              />
            );
          }
        })}
        {/* 日期类型且筛选方式为等于 */}
        {DATE_GRANULARITY_TYPE.keys.includes(dataType) &&
          [FILTER_CONDITION_TYPE.DATEENUM].includes(control.filterType) && (
            <DropCom
              data={DATE_GRANULARITY_TYPE}
              worksheetControls={worksheetControls}
              control={control}
              advancedSetting={advancedSetting}
              updateViewSet={updateViewSet}
            />
          )}
        {TEXT_FILTER_TYPE.keys.includes(dataType) &&
        FILTER_CONDITION_TYPE.TEXT_ALLCONTAIN === control[TEXT_FILTER_TYPE.key] ? (
          <div className="mTop10 Gray_75">
            {_l('- 使用同时包含时，搜索内容中的空格将用于分词')}
            <br />
            {_l('- 在大数据量时使用包含、同时包含条件可能非常缓慢，建议使用等于，并创建索引来优化性能。')}
          </div>
        ) : FILTER_CONDITION_TYPE.LIKE === control[TEXT_FILTER_TYPE.key] ? (
          <div className="mTop10 Gray_75">
            {_l('默认方式下，用户可自行切换使用模糊匹配或精确匹配搜索，适合大多数筛选场景')}
          </div>
        ) : (
          ''
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
                  if (
                    newValue.shownullitem !== '1' &&
                    newValue.shownullitem !== advancedSetting.shownullitem &&
                    control.values[0]
                  ) {
                    const data = safeParse(control.values);
                    if (data.id === 'isEmpty') {
                      newValue.values = JSON.stringify([]);
                      return updateViewSet({
                        advancedSetting: { ...advancedSetting, ...newValue },
                      });
                    }
                  }
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
            return (
              <ShowTypeCom
                data={o}
                updateViewSet={updateViewSet}
                advancedSetting={advancedSetting}
                dataType={dataType}
              />
            );
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
            return (
              <DropCom
                data={o}
                worksheetControls={worksheetControls}
                control={control}
                advancedSetting={advancedSetting}
                updateViewSet={updateViewSet}
              />
            );
          }
        })}
        {[DIRECTION_TYPE, SHOW_RELATE_TYPE].map(o => {
          if (o.keys.includes(dataType)) {
            return (
              <ShowTypeCom
                data={o}
                updateViewSet={updateViewSet}
                advancedSetting={advancedSetting}
                dataType={dataType}
              />
            );
          }
        })}
        {DATE_RANGE.keys.includes(dataType) && (
          <DateTimeDataRange
            daterange={getDaterange()}
            dateRangeType={_.get(control, 'dateRangeType')}
            showType={getShowTypeForDataRange()}
            key={`${advancedSetting.daterange}_${_.get(control, 'dateRangeType')}`}
            onChange={data => {
              updateViewSet({
                advancedSetting: { ...advancedSetting, ...data },
              });
            }}
          />
        )}
        {LIMIT.keys.includes(dataType) &&
          [FILTER_CONDITION_TYPE.START, FILTER_CONDITION_TYPE.END].includes(control.filterType) &&
          renderLimit()}
        {APP_ALLOWSCAN.keys.includes(dataType) && renderAppScan()}
        {/* 文本(文本、文本组合，邮件地址、电话号码、证件等) 数值 金额 日期 时间 选项 检查项 部门 人员 组织角色 关联 级联 */}
        {[1, 2, 32, 3, 4, 5, 6, 7, 8, 15, 16, 17, 18, 46, 9, 10, 11, 36, 27, 26, 48, 29, 35].includes(dataType) && (
          <div className="mTop24">
            <DefCom
              view={view}
              currentSheetInfo={currentSheetInfo}
              control={control}
              dataControls={dataControls}
              dataType={dataType}
              advancedSetting={advancedSetting}
              worksheetControls={worksheetControls}
              updateViewSet={updateViewSet}
            />
          </div>
        )}
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
