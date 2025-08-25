import React, { Fragment } from 'react';
import { useSetState } from 'react-use';
import { Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, SvgIcon } from 'ming-ui';
import { FilterDialog, FilterItemTexts } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import SelectWorksheet from 'src/pages/worksheet/components/SelectWorksheet/SelectWorksheet.jsx';
import { getTranslateInfo } from 'src/utils/app';
import { getSyncLicenseInfo } from 'src/utils/project';
import { DEFAULT_COLORS } from '../config';
import { getAllSourceList, getNodeInfo } from '../util';
import { filterForFilterDialog, getSourceMaxCountByVersion, sourceIsMax, updateConfig } from '../util';
import { WrapSelectCon, WrapSource, WrapWorksheet } from './style';

export default function SourceCon(props) {
  const { projectId, appId, getWorksheets, onChange, onChangeByInit = () => {} } = props;
  const [{ filterVisible, filterVisibleId, hideIds, isChange }, setState] = useSetState({
    filterVisible: false,
    filterVisibleId: '',
    hideIds: [],
    isChange: false,
  });

  const renderSourceItem = (dataInfo = {}, canChange = false, filters = []) => {
    if (dataInfo.isRelative) {
      return (
        <div className="Dropdown--input Dropdown--border" onClick={e => e.stopPropagation()}>
          {dataInfo.isDelete ? (
            <span className="Red Bold">{_l('字段已删除')}</span>
          ) : (
            <React.Fragment>
              <Icon type="link_record" className="Font16 Gray_9e" />
              <span className="flex mLeft5 Bold WordBreak overflow_ellipsis">{dataInfo.controlName}</span>
            </React.Fragment>
          )}
        </div>
      );
    }
    const sourceDt = getNodeInfo(props.flowData, 'DATASOURCE');
    const groupDt = getNodeInfo(props.flowData, 'GROUP');
    return (
      <Fragment>
        <div className="Dropdown--input Dropdown--border">
          {dataInfo.isDelete ? (
            <span className="Red Bold">{_l('数据源已删除')}</span>
          ) : (
            <React.Fragment>
              <SvgIcon
                url={
                  dataInfo.iconUrl
                    ? dataInfo.iconUrl
                    : `${md.global.FileStoreConfig.pubHost}/customIcon/${dataInfo.icon}.svg`
                }
                fill={'#9e9e9e'}
                size={16}
              />
              <span className="flex mLeft5 Bold WordBreak overflow_ellipsis">
                {getTranslateInfo(dataInfo.appId, null, dataInfo.workSheetId).name || dataInfo.tableName}
              </span>
            </React.Fragment>
          )}
          <Tooltip title={_l('筛选')}>
            <div
              className={cx(
                'ming Icon icon icon-filter mLeft8 Hand Font16 ThemeHoverColor3',
                filters.length > 0 ? 'ThemeColor3' : 'Gray_9e',
              )}
              onClick={e => {
                e.stopPropagation();
                if (filters.length > 0) {
                  setState({
                    hideIds: hideIds.includes(dataInfo.workSheetId)
                      ? hideIds.filter(o => o !== dataInfo.workSheetId)
                      : hideIds.concat(dataInfo.workSheetId),
                  });
                } else {
                  setState({
                    filterVisible: true,
                    filterVisibleId: dataInfo.workSheetId,
                  });
                }
              }}
            />
          </Tooltip>
          {canChange && (
            <Tooltip title={_l('更改数据源')} onClick={() => setState({ isChange: true })}>
              <div className="ming Icon icon icon-swap_horiz mLeft8 Gray_9e Font16 Hand ThemeHoverColor3 mRight8" />
            </Tooltip>
          )}
          {dataInfo.workSheetId && !canChange && (
            <Tooltip title={_l('删除')}>
              <Icon
                icon="clear"
                className="mLeft8 Font16 Hand Gray_9e del ThemeHoverColor3 mRight8"
                onClick={e => {
                  e.stopPropagation();
                  const sourceTables = (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).filter(
                    o => o.workSheetId !== dataInfo.workSheetId,
                  );
                  onChange(
                    [
                      updateConfig(sourceDt, {
                        sourceTables,
                      }),
                      updateConfig(groupDt, {
                        groupFields:
                          sourceTables.length <= 0
                            ? []
                            : (_.get(groupDt, 'nodeConfig.config.groupFields') || [])
                                .map((o = {}) => {
                                  let fields = (o.fields || []).filter(
                                    (it = {}) =>
                                      !!(sourceTables || []).find(a =>
                                        _.get(it, 'parentFieldInfo.oid')
                                          ? _.get(it, 'parentFieldInfo.oid').indexOf(`${a.workSheetId}_`) >= 0
                                          : (it.oid || '').indexOf(`${a.workSheetId}_`) >= 0,
                                      ),
                                  );
                                  return {
                                    ...o,
                                    fields: fields,
                                    resultField:
                                      fields.length <= 0
                                        ? {}
                                        : {
                                            ...o.resultField,
                                            ...fields[0],
                                            name: _.get(o, 'resultField.name'),
                                            alias: _.get(o, 'resultField.alias'),
                                          },
                                  };
                                })
                                .filter((o = {}) => (o.fields || []).length > 0),
                      }),
                    ],
                    {
                      sourceInfos: props.sourceInfos.filter(o => o.worksheetId !== dataInfo.workSheetId),
                    },
                  );
                }}
              />
            </Tooltip>
          )}
        </div>
      </Fragment>
    );
  };
  const renderDropdownElement = () => {
    const sourceDt = getNodeInfo(props.flowData, 'DATASOURCE');
    const sourceTablesData = _.get(sourceDt, 'nodeConfig.config.sourceTables') || [];
    const sourceDtList = getAllSourceList(props.flowData, props.sourceInfos);
    const canAdd =
      sourceDtList.length < getSourceMaxCountByVersion(_.get(props, 'flowData.projectId') || props.projectId) &&
      sourceDtList.length > 0;
    return (
      <WrapSelectCon>
        {sourceDtList.map((o, index) => {
          const filters = _.get(o, 'filterConfig.items') || [];
          const canChange = (sourceTablesData.length === 1 || !o.workSheetId) && !o.isRelative;
          return (
            <React.Fragment>
              <div className="topCon" onClick={e => e.stopPropagation()} />
              <WrapWorksheet
                className={cx('Relative hoverBoxShadow', {
                  pBottom12: filters.length > 0 && !hideIds.includes(o.workSheetId),
                  isRelative: o.isRelative,
                })}
                onClick={e => {
                  if (!canChange) {
                    e.stopPropagation();
                  } else {
                    setState({
                      isChange: true,
                    });
                  }
                }}
              >
                {sourceDtList.length > 1 && (
                  <div className="colorByWorksheet" style={{ backgroundColor: DEFAULT_COLORS[index] }}></div>
                )}
                {renderSourceItem(o, canChange, filters, index)}
                {!o.isRelative && filters.length > 0 && !hideIds.includes(o.workSheetId) && (
                  <FilterItemTexts
                    className={'filterConByWorksheet mTop0'}
                    data={{}}
                    filters={filters}
                    loading={false}
                    globalSheetInfo={{
                      projectId,
                      appId,
                    }}
                    onClear={() => {
                      let newData = [
                        updateConfig(sourceDt, {
                          sourceTables: (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).map(a => {
                            return o.workSheetId === a.workSheetId
                              ? {
                                  ...a,
                                  filterConfig: null,
                                }
                              : a;
                          }),
                        }),
                      ];
                      onChange(newData);
                    }}
                    controls={(props.sourceInfos.find(it => it.worksheetId === o.workSheetId) || {}).controls || []}
                    allControls={[]}
                    editFn={() => setState({ filterVisible: true, filterVisibleId: o.workSheetId })}
                  />
                )}
              </WrapWorksheet>
            </React.Fragment>
          );
        })}
        {sourceTablesData.length <= 0 && (
          <React.Fragment>
            <div className="topCon" onClick={e => e.stopPropagation()} />
            <WrapWorksheet className="hoverBoxShadow">
              <div className="Dropdown--input Dropdown--border">
                <div className="Gray_a">{_l('请选择工作表')}</div>
                <div className="ming Icon icon icon-arrow-down-border mLeft8 Gray_9e Font16 Hand mRight12 ThemeHoverColor3" />
              </div>
            </WrapWorksheet>
          </React.Fragment>
        )}

        {sourceDtList.length > 0 &&
          (['2', '3'].includes(_.get(getSyncLicenseInfo(projectId) || {}, 'version.versionIdV2')) && !canAdd ? (
            ''
          ) : (
            <React.Fragment>
              <div className="topCon" onClick={e => e.stopPropagation()} />
              <WrapWorksheet className={'Relative isAdd'}>
                <div
                  className={cx(
                    'alignItemsCenter Bold flexRowCon',
                    !canAdd || props.updateLoading ? 'Gray_bd' : 'Gray_75 ThemeHoverColor3 Hand',
                  )}
                  onClick={e => {
                    if (!canAdd) {
                      e.stopPropagation();
                      sourceIsMax(projectId);
                      return;
                    }
                    setState({ isChange: false });
                  }}
                >
                  {props.updateLoading ? (
                    _l('加载中...')
                  ) : (
                    <React.Fragment>
                      <Icon icon="add" className="InlineBlock Font16" />
                      <span>{_l('工作表')}</span>
                    </React.Fragment>
                  )}
                </div>
              </WrapWorksheet>
            </React.Fragment>
          ))}
      </WrapSelectCon>
    );
  };
  const onChangeSource = (newappId, worksheetId, worksheet) => {
    const sourceDt = getNodeInfo(props.flowData, 'DATASOURCE');
    // 当前应用或其他应用下的工作表（一个工作表只能选择一次）
    if (
      ((_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).map(o => o.workSheetId) || []).includes(worksheetId)
    ) {
      alert(_l('一个聚合表不能添加相同的数据源'), 3);
      return;
    }
    const ids = (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).map(o => o.workSheetId);
    getWorksheets(
      !isChange ? ids.concat(worksheetId) : [worksheetId],
      null,
      _.get(sourceDt, 'nodeConfig.config.sourceTables') || [],
    );

    const wsInfo = {
      dsType: 'MING_DAO_YUN',
      icon: worksheet.icon || 'table',
      iconUrl: worksheet.iconUrl || 'https://fp1.mingdaoyun.cn/customIcon/table.svg',
      tableName: worksheet.workSheetName,
      appId: newappId,
      workSheetId: worksheetId,
      filterConfig: null,
    };
    const updateSource = (flowData = props.flowData) => {
      const sourceDt = getNodeInfo(flowData, 'DATASOURCE');
      onChange(
        [
          updateConfig(sourceDt, {
            sourceTables: !isChange
              ? (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).concat(wsInfo)
              : [wsInfo],
          }),
        ],
        { flowData },
      );
    };
    if (!_.get(props, 'flowData.id')) {
      onChangeByInit(flowData => updateSource(flowData));
    } else {
      updateSource();
    }
  };
  const renderSelectWorksheet = () => {
    const sourceDt = getNodeInfo(props.flowData, 'DATASOURCE');
    const sourceTablesData = _.get(sourceDt, 'nodeConfig.config.sourceTables') || [];
    return (
      <SelectWorksheet
        dialogClassName={'sheetSelectDialog'}
        worksheetType={0}
        projectId={projectId}
        appId={appId}
        filterIds={sourceTablesData.map(o => o.workSheetId)}
        value={''} // 选中的工作表 id
        onChange={onChangeSource}
        dropdownElement={renderDropdownElement()}
      />
    );
  };
  const renderFilterDialog = () => {
    if (!filterVisible) {
      return '';
    }
    const sourceDt = getNodeInfo(props.flowData, 'DATASOURCE');
    const dataInfo = (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).find(
      o => o.workSheetId === filterVisibleId,
    );
    const filters = _.get(dataInfo, 'filterConfig.items') || [];
    const sourceInfo = props.sourceInfos.find(it => it.worksheetId === filterVisibleId) || {};
    const relateControls = filterForFilterDialog(sourceInfo.controls || []);

    const onChangeWithFilterDialog = ({ filters }) => {
      let items = filters.map(o => {
        if (o.isGroup) {
          return {
            ...o,
            groupFilters: o.groupFilters.map(it => {
              return {
                ...it,
                fieldName: (relateControls.find(a => a.id === it.controlId && a.alias === it.name) || {}).name,
              };
            }),
          };
        } else {
          return {
            ...o,
            fieldName: (relateControls.find(a => a.id === o.controlId && a.alias === o.name) || {}).name,
          };
        }
      });
      let newData = updateConfig(sourceDt, {
        sourceTables: (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).map(o => {
          if (o.workSheetId === filterVisibleId) {
            let param = {};
            if (items.length > 0) {
              param.filterConfig = {
                items,
              };
            }
            return {
              ...o,
              ...param,
            };
          } else {
            return o;
          }
        }),
      });
      onChange([newData]);
      setState({ filterVisible: false, filterVisibleId: '' });
    };

    return (
      <FilterDialog
        data={{}}
        overlayClosable={false}
        relationControls={relateControls || []}
        title={'筛选'}
        fromCondition="subTotal" //只能设置指定时间，套用原有设置
        filters={filters}
        allControls={[]}
        globalSheetInfo={{
          projectId,
          appId,
        }}
        onChange={onChangeWithFilterDialog}
        onClose={() => setState({ filterVisible: false, filterVisibleId: '' })}
        hideSupport
        supportGroup
      />
    );
  };
  return (
    <WrapSource className={cx({ isTopChild: isChange })}>
      {renderSelectWorksheet()}
      {renderFilterDialog()}
    </WrapSource>
  );
}
