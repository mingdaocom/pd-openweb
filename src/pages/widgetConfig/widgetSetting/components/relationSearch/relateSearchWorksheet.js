import React, { Fragment, useEffect, useRef, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Dialog, Dropdown, LoadDiv, Support, SvgIcon, Switch } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import worksheetAjax from 'src/api/worksheet';
import { checkConditionCanSave } from 'src/pages/FormSet/components/columnRules/config';
import { DEFAULT_CONFIG } from 'src/pages/widgetConfig/config/widget';
import { enumWidgetType, filterSysControls, isSheetDisplay, toEditWidgetPage } from 'src/pages/widgetConfig/util';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/setting';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';
import { redefineComplexControl } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { handleAdvancedSettingChange } from 'src/utils/control';
import EmptyRuleConfig from '../EmptyRuleConfig';
import SelectSearchSheetFromApp from './SelectSearchSheetFromApp';
import { AddRelate, FilterContent } from './styled';

const RELATE_SEARCH_TYPE = [
  { key: 'new', text: _l('新建查询') },
  { key: 'exist', text: _l('已有关联') },
];

function FilterRelateSearch(props) {
  const {
    allControls,
    name,
    loading,
    projectId,
    appId,
    sheetId,
    worksheetId,
    sheetName,
    sourceControlId,
    relationControls = [],
    resultFilters,
    setFilters,
    data,
    setEmptyRule,
    globalSheetInfo = {},
    queryType,
  } = props;

  const isRelate = _.find(relationControls, r => _.includes([29, 34], r.type) && r.dataSource === worksheetId);

  const currentColumns = allControls
    .map(redefineComplexControl)
    .filter(i => !isSheetDisplay(i))
    .concat({
      controlId: 'current-rowid',
      controlName: _l('当前记录'),
      dataSource: worksheetId,
      type: 29,
    });

  const renderContent = () => {
    return (
      <Fragment>
        <div className="Font14 pBottom8">
          {_l('查询工作表')}
          <span
            className="ThemeColor3 ThemeHoverColor2 Hand Bold mLeft8"
            onClick={() =>
              toEditWidgetPage({
                sourceId: sheetId,
                ...(sourceControlId ? {} : { targetControl: sourceControlId }),
                fromURL: 'newPage',
              })
            }
          >
            {sheetName}
          </span>
          {isRelate && (
            <span>
              （{_l('关联当前')} <span className="Bold">{name}</span>）
            </span>
          )}
        </div>
        <div className="filterContent">
          <FilterConfig
            canEdit
            feOnly
            supportGroup={true}
            projectId={projectId}
            appId={appId}
            from={'relateSheet'}
            columns={relationControls}
            filterResigned={false}
            sourceControlId={sourceControlId}
            conditions={resultFilters}
            widgetControlData={{
              ...handleAdvancedSettingChange(data, { querytype: queryType }),
              globalSheetId: globalSheetInfo.worksheetId,
            }}
            onConditionsChange={(conditions = []) => {
              const newConditions = conditions.some(item => item.groupFilters)
                ? conditions
                : [
                    {
                      spliceType: 2,
                      isGroup: true,
                      groupFilters: conditions,
                    },
                  ];
              setFilters(newConditions);
            }}
            showCustom={true}
            currentColumns={currentColumns}
          />
        </div>
        <EmptyRuleConfig {...props} filters={resultFilters} handleChange={value => setEmptyRule(value)} />
      </Fragment>
    );
  };

  return <FilterContent>{loading ? <LoadDiv /> : renderContent()}</FilterContent>;
}

export function RelateSearchWorksheet(props) {
  const { globalSheetInfo, data = {}, deleteWidget, allControls, onOk, isDeleteWorksheet } = props;
  const { dataSource, controlId } = data;
  const { querytype } = getAdvanceSetting(data);
  const { worksheetId, name } = globalSheetInfo;
  const ruleRef = useRef(null);

  const defaultRelateType = props.relateType || (data.sourceControlId ? 'exist' : 'new');
  const defaultAppId = props.appId || globalSheetInfo.appId;

  const [{ controls, loading, relateType }, setState] = useSetState({
    controls: [],
    relateType: defaultRelateType, // exist | new | filter
    loading: false,
  });
  const [{ relateFields, open, selectedControl }, setFields] = useSetState({
    open: false,
    relateFields: [],
    selectedControl: {},
  });

  const [
    { sheetName, relationControls, sourceControlId, resultFilters, appId, sheetId, projectId, queryType },
    setInfo,
  ] = useSetState({
    ..._.pick(data, ['relationControls', 'sourceControlId']),
    resultFilters: getAdvanceSetting(data, 'resultfilters') || '',
    appId: defaultAppId,
    sheetId: dataSource,
    sheetName: props.sheetName || '',
    projectId: globalSheetInfo.projectId,
    queryType: querytype,
  });

  const [visible, setVisible] = useState(true);
  const isFilter = relateType === 'filter';

  useEffect(() => {
    if (relateType !== 'filter') {
      if (!_.isEmpty(controls) && relateType === 'new') {
        if (sheetId) {
          handleSetSource();
        } else {
          setFields({
            relateFields: [],
            open: false,
            selectedControl: {},
          });
        }
        return;
      }
      if (loading || (relateType === 'new' ? !sheetId : !_.isEmpty(controls))) return;
      setState({ loading: true });
      worksheetAjax
        .getWorksheetControls({
          worksheetId,
          getControlType: 3,
          resultType: 3,
        })
        .then(res => {
          const filterControls = (_.get(res, 'data.controls') || []).filter(
            i => _.get(i, 'sourceControl.advancedSetting.hide') !== '1',
          );
          setState({ controls: filterControls });
          setInfo({
            ..._.pick(data, ['relationControls', 'sourceControlId']),
            resultFilters: getAdvanceSetting(data, 'resultfilters') || '',
          });
          if (sheetId && relateType === 'new') {
            handleSetSource({ newControls: filterControls });
          }
        })
        .finally(() => setState({ loading: false }));
    }

    if (relateType === 'filter' && sheetId) {
      setState({ loading: true });
      worksheetAjax
        .getWorksheetInfo({ worksheetId: sheetId, getTemplate: true })
        .then(res => {
          const tempControls = _.get(res, 'template.controls') || [];
          setInfo({
            sheetName: res.name,
            appId: res.appId,
            relationControls: queryType === '1' ? filterSysControls(tempControls) : tempControls,
            projectId: res.projectId,
          });
        })
        .finally(() => setState({ loading: false }));
    }
  }, [relateType, sheetId]);

  const handleSetSource = ({ newControls, open } = {}) => {
    const reControls = (newControls || controls || []).filter(
      i => i.dataSource === sheetId && _.get(i, 'sourceControl.advancedSetting.hide') !== '1',
    );
    // 配置回显
    if (!_.isEmpty(resultFilters) && _.isUndefined(open)) {
      const index = _.findIndex(
        reControls,
        i =>
          JSON.stringify(resultFilters).search(
            new RegExp('"controlId":"value"'.replace('value', _.get(i, 'sourceControl.controlId'))),
          ) > -1,
      );
      setFields({
        relateFields: reControls,
        open: index > -1,
        selectedControl: reControls[index] || {},
      });
      return;
    }
    setFields({
      relateFields: reControls,
      open: _.isUndefined(open) ? !_.isEmpty(reControls) : open,
      selectedControl: _.isUndefined(open) || true ? reControls[0] : {},
    });
  };

  const handleClose = () => {
    setVisible(false);
    // 首次创建取消的时候删除占位控件
    if (!dataSource) {
      deleteWidget(controlId);
    }
  };

  const renderContent = () => {
    if (relateType === 'new') {
      return (
        <div className="selectSheetWrap">
          <SelectSearchSheetFromApp
            onChange={setInfo}
            globalSheetInfo={globalSheetInfo}
            appId={appId}
            sheetId={sheetId}
            queryType={queryType}
          />
          {_.isEmpty(relateFields) ? null : (
            <Fragment>
              <div className={cx('relateWarning', { active: open })}>
                <span className="overflow_ellipsis flex">
                  {_l('检测到已有关联，是否查询关联当前 %0 的 %1 ？', name, sheetName)}
                </span>
                <Switch checked={open} text={''} onClick={checked => handleSetSource({ open: !checked })} />
              </div>
              {open ? (
                <Fragment>
                  <div className="selectItem Bold">{_l('依据关联记录')}</div>
                  <Dropdown
                    className="w100"
                    menuStyle={{ width: '100%' }}
                    border
                    value={_.get(selectedControl, 'sourceControl.controlId')}
                    data={relateFields.map(i => {
                      return {
                        value: _.get(i, 'sourceControl.controlId'),
                        text: _.get(i, 'sourceControl.controlName'),
                      };
                    })}
                    onChange={value =>
                      setFields({
                        selectedControl: _.find(relateFields, i => _.get(i, 'sourceControl.controlId') === value) || {},
                      })
                    }
                  />
                </Fragment>
              ) : null}
            </Fragment>
          )}
        </div>
      );
    }
    if (loading) return <LoadDiv />;
    return (
      <div className="existRelateWrap">
        {_.isEmpty(controls) ? (
          <div className="emptyHint">{_l('没有与当前工作表关联的表')}</div>
        ) : (
          <div className="relateListWrap">
            <div className="flexCenter mBottom10 Gray_9e pLeft8">
              <span style={{ flexShrink: 0 }}>{_l('查询关联当前')}</span>
              <span className="Bold Gray overflow_ellipsis mLeft5 mRight5">{name}</span>
              {_l('的')}
            </div>
            <ul>
              {controls.map(item => {
                const { type, controlName } = item.sourceControl || {};
                return (
                  <li
                    className={cx({
                      active: item.sourceControlId === sourceControlId && item.dataSource === sheetId,
                    })}
                    key={item.controlId}
                    onClick={() => {
                      setInfo({
                        sourceControlId: item.sourceControlId,
                        sheetId: item.dataSource,
                        queryType: '0',
                        resultFilters: '',
                        relationControls: [],
                      });
                      setFields({ selectedControl: item });
                    }}
                  >
                    <SvgIcon url={item.iconUrl} fill="#999999" size={18} className="InlineBlock" />
                    <span className="Bold mLeft10">{item.sourceEntityName}</span>
                    <span className="Gray_9e mLeft4 Font14">
                      {` - ${_.get(DEFAULT_CONFIG[enumWidgetType[type]], 'widgetName')}：${controlName}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderTypeContent = () => {
    if (relateType === 'filter') {
      const opts = {
        allControls,
        sheetName,
        sourceControlId,
        name,
        loading,
        projectId,
        appId,
        sheetId,
        worksheetId,
        relationControls,
        resultFilters,
        data,
        globalSheetInfo,
        queryType,
        setEmptyRule: value => (ruleRef.current = value),
        setFilters: value => setInfo({ resultFilters: value }),
      };
      return <FilterRelateSearch {...opts} />;
    }

    return (
      <Fragment>
        <div className="intro">
          {_l('根据条件查询目标工作表的记录。如：查询关联客户的订单。')}
          <Support type={3} href="https://help.mingdao.com/worksheet/control-query-records" text={_l('帮助')} />
        </div>
        <div className="relateWrap">
          <ul className="relateTypeTab">
            {RELATE_SEARCH_TYPE.map(({ key, text }) => (
              <li
                key={key}
                className={cx({ active: relateType === key })}
                onClick={() => {
                  setState({ relateType: key });
                  setInfo({
                    sheetName: '',
                    relationControls: [],
                    sourceControlId: '',
                    resultFilters: '',
                  });
                  setFields({
                    relateFields: [],
                    open: false,
                    selectedControl: {},
                  });
                }}
              >
                {text}
              </li>
            ))}
          </ul>
          {renderContent()}
        </div>
      </Fragment>
    );
  };

  return (
    <BrowserRouter>
      <Dialog
        width={640}
        type="scroll"
        visible={visible}
        title={<span className="Bold">{isFilter ? _l('查询条件') : _l('查询记录')}</span>}
        footer={null}
        className="SearchWorksheetDialog"
        onCancel={handleClose}
      >
        <AddRelate>
          {renderTypeContent()}
          <div className="footerBtn">
            <Button type="link" onClick={handleClose}>
              {_l('取消')}
            </Button>
            <Button
              type="primary"
              className="Bold"
              disabled={
                isFilter
                  ? !checkConditionCanSave(resultFilters)
                  : !sheetId || (isDeleteWorksheet && sheetId === dataSource)
              }
              onClick={() => {
                if (isFilter) {
                  function formatCondition(condition) {
                    if (condition.groupFilters) {
                      return {
                        ...condition,
                        groupFilters: condition.groupFilters.map(formatCondition),
                      };
                    }
                    return { ...condition, emptyRule: ruleRef.current };
                  }

                  onOk({
                    sheetId,
                    sourceControlId,
                    resultFilters: resultFilters.map(formatCondition).filter(_.identity),
                    relationControls,
                    sheetName,
                    queryType,
                  });
                  setVisible(false);
                } else {
                  setState({ relateType: 'filter', loading: true });
                  let resultFilters = [];
                  // 为关联表时，筛选条件有默认值
                  if (sourceControlId || (selectedControl || {}).sourceControl) {
                    const selectControl =
                      (sourceControlId || open) && selectedControl ? selectedControl.sourceControl : '';

                    if (
                      selectControl &&
                      selectControl.type === 29 &&
                      _.get(selectControl, 'advancedSetting.hide') !== '1'
                    ) {
                      let groupFilters = [
                        {
                          controlId: selectControl.controlId,
                          dataType: selectControl.type,
                          dynamicSource: [{ rcid: selectControl.dataSource, cid: 'current-rowid', staticValue: '' }],
                          filterType: 24,
                          isDynamicsource: true,
                          spliceType: 1,
                          emptyRule: 3,
                        },
                      ];
                      resultFilters = [{ isGroup: true, spliceType: 2, groupFilters }];
                    }
                  }
                  setInfo({ resultFilters });
                }
              }}
            >
              {isFilter ? _l('确定') : _l('下一步')}
            </Button>
          </div>
        </AddRelate>
      </Dialog>
    </BrowserRouter>
  );
}

export function relateSearchWorksheet(opts) {
  functionWrap(RelateSearchWorksheet, opts);
}
