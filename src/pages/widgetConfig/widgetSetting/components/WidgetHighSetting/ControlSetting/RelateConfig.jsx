import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import { isEmpty } from 'lodash';
import _ from 'lodash';
import { Checkbox, Select, Tooltip } from 'ming-ui/antd-components';
import FilterDialog from 'src/pages/widgetConfig/widgetSetting/components/FilterData/FilterDialog';
import FilterItemTexts from 'src/pages/widgetConfig/widgetSetting/components/FilterData/FilterItemTexts';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { updateConfig } from 'src/utils/domain/control/editorSetting';
import { formatViewToDropdown } from 'src/utils/domain/control/filters';
import { SYSTEM_CONTROL } from 'src/utils/domain/control/widget';
import SubListStatisticsConfig from '../components/SubListStatisticsConfig';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

export default function RelateConfig(props) {
  const { data, onChange, globalSheetControls, allControls } = props;
  const { enumDefault, strDefault, dataSource, viewId, controlId } = data;
  let { showtype = String(enumDefault), showcount = '0', layercontrolid } = getAdvanceSetting(data);
  const resultfilters = getAdvanceSetting(data, 'resultfilters');
  const [isHiddenOtherViewRecord] = strDefault.split('');
  const { loading = true, views = [], controls = [], sheetInfo = {} } = window.subListSheetConfig[controlId] || {};

  const [{ isRelateView, resultFilterVisible, resultVisible }, setState] = useSetState({
    isRelateView: Boolean(viewId),
    resultFilterVisible: false,
    resultVisible: (resultfilters && resultfilters.length > 0) || !!+isHiddenOtherViewRecord,
  });

  const selectedViewIsDeleted = !loading && viewId && !_.find(views, sheet => sheet.viewId === viewId);

  useEffect(() => {
    setState({
      isRelateView: Boolean(viewId),
      searchVisible: false,
      resultFilterVisible: false,
      resultVisible: (resultfilters && resultfilters.length > 0) || !!+isHiddenOtherViewRecord,
    });
  }, [controlId]);

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          checked={isRelateView}
          onChange={event => {
            const checked = !event.target.checked;
            setState({
              isRelateView: !checked,
            });
            if (checked) {
              onChange({
                ...handleAdvancedSettingChange(data, {
                  batchbtn: '',
                  batchprint: '',
                }),
                viewId: '',
              });
            }
          }}
          size="small"
        >
          <span style={{ marginRight: '6px' }}>{_l('关联视图')}</span>
          <Tooltip
            placement="bottom"
            title={
              <span>
                {_l(
                  '设置关联视图，统一控制关联记录的排序方式、选择范围、和打开记录时的视图。字段本身设置的排序和打开记录视图优先级高于此配置；过滤选择范围的效果为叠加。',
                )}
              </span>
            }
          >
            <i className="icon-help textDisabled Font16 pointer"></i>
          </Tooltip>
        </Checkbox>
      </div>
      {isRelateView && (
        <Select
          className="w100"
          style={{ marginTop: '8px' }}
          loading={loading}
          notFoundContent={_l('请先选择关联表')}
          placeholder={
            selectedViewIsDeleted ? <span className="Red">{_l('视图已删除，请重新选择')}</span> : _l('选择视图')
          }
          options={dataSource ? formatViewToDropdown(views) : []}
          fieldNames={SELECT_FIELD_NAMES}
          value={viewId && !selectedViewIsDeleted ? viewId : undefined}
          onChange={value => {
            onChange({ viewId: value });
          }}
        />
      )}
      {_.includes(['2', '5', '6'], showtype) && (
        <Fragment>
          <div className="labelWrap">
            <Checkbox
              checked={resultVisible}
              onChange={event => {
                const checked = !event.target.checked;

                if (checked) {
                  onChange({
                    ...handleAdvancedSettingChange(data, {
                      resultfilters: '',
                    }),
                    strDefault: updateConfig({
                      config: strDefault,
                      value: +!checked,
                      index: 0,
                    }),
                  });
                  setState({
                    resultVisible: false,
                  });
                } else {
                  setState({
                    resultVisible: true,
                  });
                }
              }}
              size="small"
            >
              <span style={{ marginRight: '6px' }}>{_l('过滤显示结果')}</span>
            </Checkbox>
          </div>
          {resultVisible && (
            <div className="mLeft25">
              <div className="labelWrap">
                <Checkbox
                  checked={resultfilters && resultfilters.length > 0}
                  onChange={event => {
                    if (!event.target.checked) {
                      onChange(
                        handleAdvancedSettingChange(data, {
                          resultfilters: '',
                        }),
                      );
                      setState({
                        resultVisible: !!+isHiddenOtherViewRecord,
                      });
                    } else {
                      setState({
                        resultFilterVisible: true,
                      });
                    }
                  }}
                  size="small"
                >
                  <span style={{ marginRight: '6px' }}>{_l('按条件过滤')}</span>
                  <Tooltip placement="bottom" title={_l('设置筛选条件，只显示满足条件的关联记录')}>
                    <i className="icon-help textDisabled Font16 pointer"></i>
                  </Tooltip>
                </Checkbox>
              </div>
              {resultFilterVisible && (
                <FilterDialog
                  {...props}
                  title={_l('设置筛选条件')}
                  showCustom
                  filterKey="resultfilters"
                  supportGroup
                  sheetSwitchPermit={sheetInfo.switches}
                  relationControls={controls}
                  globalSheetControls={globalSheetControls}
                  allControls={allControls.concat(
                    SYSTEM_CONTROL.filter(c => _.includes(['caid', 'ownerid'], c.controlId)),
                  )}
                  onChange={({ filters }) => {
                    onChange(handleAdvancedSettingChange(data, { resultfilters: JSON.stringify(filters) }));
                    setState({ resultFilterVisible: false });
                    setState({
                      resultVisible: (filters && filters.length > 0) || !!+isHiddenOtherViewRecord,
                    });
                  }}
                  onClose={() => setState({ resultFilterVisible: false })}
                />
              )}
              {!isEmpty(resultfilters) && (
                <FilterItemTexts
                  {...props}
                  filters={resultfilters}
                  globalSheetControls={globalSheetControls}
                  loading={loading}
                  controls={controls}
                  allControls={allControls.concat(
                    SYSTEM_CONTROL.filter(c => _.includes(['caid', 'ownerid'], c.controlId)),
                  )}
                  editFn={() => setState({ resultFilterVisible: true })}
                />
              )}
              <div className="labelWrap">
                <Checkbox
                  className="allowSelectRecords"
                  checked={!!+isHiddenOtherViewRecord}
                  onChange={event => {
                    const checked = !event.target.checked;
                    onChange({
                      strDefault: updateConfig({
                        config: strDefault,
                        value: +!checked,
                        index: 0,
                      }),
                    });
                    setState({
                      resultVisible: (resultfilters && resultfilters.length > 0) || !!+!checked,
                    });
                  }}
                  size="small"
                >
                  <span style={{ marginRight: '6px' }}>{_l('按用户权限过滤')}</span>
                  <Tooltip
                    placement="bottom"
                    title={
                      <span>
                        {_l(
                          '未勾选时，用户在关联列表中可以查看所有关联数据。勾选后，按照用户对关联的工作表/视图的权限查看，隐藏无权限的数据或字段',
                        )}
                      </span>
                    }
                  >
                    <i className="icon icon-help textDisabled Font15 mLeft5 pointer" />
                  </Tooltip>
                </Checkbox>
              </div>
            </div>
          )}
          {!layercontrolid && (
            <div className="labelWrap">
              <Checkbox
                className="allowSelectRecords"
                checked={showcount !== '1'}
                onChange={event =>
                  onChange(
                    handleAdvancedSettingChange(data, {
                      showcount: !event.target.checked ? '1' : '0',
                    }),
                  )
                }
                size="small"
              >
                {_l('显示计数')}
                <Tooltip placement="bottom" title={_l('在表单中显示关联记录的数量')}>
                  <i className="icon icon-help textDisabled Font15 mLeft5 pointer" />
                </Tooltip>
              </Checkbox>
            </div>
          )}

          <SubListStatisticsConfig {...props} controls={controls} />
        </Fragment>
      )}
    </Fragment>
  );
}
