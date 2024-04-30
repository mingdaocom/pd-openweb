import React, { Fragment, useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import SelectWorksheet from 'src/pages/worksheet/components/SelectWorksheet/SelectWorksheet.jsx';
import { FilterItemTexts, FilterDialog } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import { Icon, SvgIcon } from 'ming-ui';
import { WrapWorksheet } from './style';
import { getNodeInfo } from '../util';
import cx from 'classnames';
import { Tooltip } from 'antd';
import { DEFAULT_COLORS } from '../config';

export default function SourceCon(props) {
  const { projectId, appId, getWorksheets, onChange } = props;
  const [{ filterVisible, filterVisibleId, hideIds }, setState] = useSetState({
    filterVisible: false,
    filterVisibleId: '',
    hideIds: [],
  });

  const renderSourceItem = (dataInfo, canChange, filters, index) => {
    const sourceDt = getNodeInfo(props.flowData, 'DATASOURCE');

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
              <span className="flex mLeft5 Bold">{dataInfo.tableName}</span>
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
            <Tooltip title={_l('更改数据源')}>
              <div className="ming Icon icon icon-swap_horiz mLeft8 Gray_9e Font16 Hand ThemeHoverColor3" />
            </Tooltip>
          )}
          {dataInfo.workSheetId && (
            <Tooltip title={_l('删除')}>
              <Icon
                icon="clear"
                className="mLeft8 Font16 Hand Gray_9e del ThemeHoverColor3 mRight8"
                onClick={e => {
                  e.stopPropagation();
                  onChange(
                    {
                      ...sourceDt,
                      nodeConfig: {
                        ..._.get(sourceDt, 'nodeConfig'),
                        config: {
                          ..._.get(sourceDt, 'nodeConfig.config'),
                          sourceTables: (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).filter(
                            o => o.workSheetId !== dataInfo.workSheetId,
                          ),
                        },
                      },
                    },
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
  const renderSelectWorksheet = (dataInfo = {}, isAdd, dropdownElement, index) => {
    const sourceDt = getNodeInfo(props.flowData, 'DATASOURCE');
    const filters = _.get(dataInfo, 'filterConfig.items') || [];
    const canChange = (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length === 1 || !dataInfo.workSheetId;
    return (
      <WrapWorksheet
        className={cx('mTop12 Relative', {
          pBottom12: filters.length > 0 && !hideIds.includes(dataInfo.workSheetId),
          isAdd: isAdd,
          hoverBoxShadow: !isAdd,
        })}
      >
        {dataInfo.workSheetId && (
          <div className="colorByWorksheet" style={{ backgroundColor: DEFAULT_COLORS[index] }}></div>
        )}
        {canChange ? (
          <SelectWorksheet
            dialogClassName={'sheetSelectDialog'}
            worksheetType={0}
            projectId={projectId}
            appId={appId}
            filterIds={(_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).map(o => o.workSheetId)}
            value={dataInfo.workSheetId} // 选中的工作表 id
            onChange={(newappId, worksheetId, worksheet) => {
              // 当前应用或其他应用下的工作表（一个工作表只能选择一次）
              if (
                ((_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).map(o => o.workSheetId) || []).includes(
                  worksheetId,
                )
              ) {
                alert(_l('一个聚合表不能添加相同的数据源'), 3);
                return;
              }
              const ids = (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).map(o => o.workSheetId);
              getWorksheets(
                !dataInfo.workSheetId
                  ? ids.concat(worksheetId)
                  : ids.map(o => {
                      if (o.workSheetId === dataInfo.worksheetId) {
                        return worksheetId;
                      } else {
                        return o;
                      }
                    }),
              );
              const wsInfo = {
                // datasourceId: null,
                dsType: 'MING_DAO_YUN',
                // dsTypeExt: null,
                // className: 'table',
                // iconBgColor: '',
                icon: worksheet.icon,
                iconUrl: worksheet.iconUrl,
                // dbName: '',
                // schema: '',
                tableName: worksheet.workSheetName,
                // flinkTableName: null,
                appId: newappId,
                workSheetId: worksheetId,
                // fields: [],
                filterConfig: null,
                // checkedFields: [],
                // fakePk: null,
              };
              onChange({
                ...sourceDt,
                nodeConfig: {
                  ..._.get(sourceDt, 'nodeConfig'),
                  config: {
                    ..._.get(sourceDt, 'nodeConfig.config'),
                    sourceTables: !dataInfo.workSheetId
                      ? (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).concat(wsInfo)
                      : (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).map(o => {
                          if (o.workSheetId === dataInfo.workSheetId) {
                            return wsInfo;
                          } else {
                            return o;
                          }
                        }),
                  },
                },
              });
            }}
            dropdownElement={
              dropdownElement ? (
                dropdownElement
              ) : !dataInfo.workSheetId ? (
                <div className="Dropdown--input Dropdown--border">
                  <div className="Gray_a">{_l('请选择工作表')}</div>
                  <div className="ming Icon icon icon-arrow-down-border mLeft8 Gray_9e Font16 Hand mRight12 ThemeHoverColor3" />
                </div>
              ) : (
                renderSourceItem(dataInfo, true, filters, index)
              )
            }
          />
        ) : (
          <div className="selectWorksheetCommon ming Dropdown w100">
            <div class="dropdownWrapper w100">
              <div class="targetEle">{renderSourceItem(dataInfo, false, filters, index)}</div>
            </div>
          </div>
        )}

        {filters.length > 0 && !hideIds.includes(dataInfo.workSheetId) && (
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
              let newData = {
                ...sourceDt,
                nodeConfig: {
                  ..._.get(sourceDt, 'nodeConfig'),
                  config: {
                    ..._.get(sourceDt, 'nodeConfig.config'),
                    sourceTables: (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).map(o => {
                      if (o.workSheetId === dataInfo.workSheetId) {
                        return {
                          ...o,
                          filterConfig: null,
                        };
                      } else {
                        return o;
                      }
                    }),
                  },
                },
              };
              onChange(newData);
            }}
            controls={(props.sourceInfos.find(it => it.worksheetId === dataInfo.workSheetId) || {}).controls || []}
            allControls={[]}
            editFn={() => setState({ filterVisible: true, filterVisibleId: dataInfo.workSheetId })}
          />
        )}
      </WrapWorksheet>
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
    const relateControls = sourceInfo.controls || [];

    return (
      <FilterDialog
        // allowEmpty
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
        onChange={({ filters }) => {
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
          let newData = {
            ...sourceDt,
            nodeConfig: {
              ..._.get(sourceDt, 'nodeConfig'),
              config: {
                ..._.get(sourceDt, 'nodeConfig.config'),
                sourceTables: (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).map(o => {
                  if (o.workSheetId === filterVisibleId) {
                    return {
                      ...o,
                      filterConfig: {
                        items,
                      },
                    };
                  } else {
                    return o;
                  }
                }),
              },
            },
          };
          onChange(newData);
          setState({ filterVisible: false, filterVisibleId: '' });
        }}
        onClose={() => setState({ filterVisible: false, filterVisibleId: '' })}
        hideSupport
        supportGroup
      />
    );
  };
  const sourceDt = getNodeInfo(props.flowData, 'DATASOURCE');
  return (
    <React.Fragment>
      {(_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length > 0
        ? (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).map((o, index) => {
            return renderSelectWorksheet(o, false, null, index);
          })
        : renderSelectWorksheet()}
      {(_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length > 0 &&
        renderSelectWorksheet(
          {},
          true,
          <div className="Hand Gray_75 ThemeHoverColor3 alignItemsCenter Bold flexRowCon">
            <Icon icon="add" className="InlineBlock Font16" />
            <span>{_l('工作表')}</span>
          </div>,
        )}
      {renderFilterDialog()}
    </React.Fragment>
  );
}
