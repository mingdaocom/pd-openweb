import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import { Checkbox, Dropdown } from 'ming-ui';
import { Tooltip } from 'antd';
import { get, isEmpty } from 'lodash';
import { EditInfo } from '../../../../styled';
import SearchConfig from '../../../components/relateSheet/SearchConfig';
import { formatViewToDropdown } from '../../../../util';
import { SYSTEM_CONTROL } from '../../../../config/widget';
import { FilterItemTexts, FilterDialog } from '../../../components/FilterData';
import { getAdvanceSetting, handleAdvancedSettingChange, updateConfig } from 'src/pages/widgetConfig/util/setting';

export default function RelateConfig(props) {
  const { data, onChange, globalSheetInfo = {}, globalSheetControls, allControls } = props;
  const { enumDefault, strDefault, dataSource, viewId, controlId } = data;
  let { showtype = String(enumDefault), searchcontrol = '', showcount = '0', layercontrolid } = getAdvanceSetting(data);
  const searchfilters = getAdvanceSetting(data, 'searchfilters');
  const resultfilters = getAdvanceSetting(data, 'resultfilters');
  const [isHiddenOtherViewRecord] = strDefault.split('');
  const { loading, views = [], controls = [] } = window.subListSheetConfig[controlId] || {};

  const [{ isRelateView, searchVisible, resultFilterVisible, resultVisible }, setState] = useSetState({
    isRelateView: Boolean(viewId),
    searchVisible: false,
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
          size="small"
          checked={!!searchcontrol}
          onClick={() => {
            if (searchcontrol) {
              onChange(
                handleAdvancedSettingChange(data, {
                  searchcontrol: '',
                  searchtype: '',
                  clicksearch: '',
                  searchfilters: '',
                }),
              );
            }
            setState({ searchVisible: !searchcontrol });
          }}
        >
          <span style={{ marginRight: '6px' }}>{_l('查询设置')}</span>
          <Tooltip
            className="hoverTip"
            title={<span>{_l('设置用户选择关联记录时可以搜索和筛选的字段')}</span>}
            popupPlacement="bottom"
          >
            <i className="icon pointer icon-help Gray_bd Font15" />
          </Tooltip>
        </Checkbox>
      </div>
      {searchcontrol && (
        <EditInfo style={{ marginTop: '8px' }} onClick={() => setState({ searchVisible: true })}>
          <div className="text overflow_ellipsis Gray">
            <span className="Bold">{_l('搜索 ')}</span>
            {get(
              controls.find(item => item.controlId === searchcontrol),
              'controlName',
            ) || _l('字段已删除')}
            {searchfilters.length > 0 && (
              <Fragment>
                <span className="Bold">{_l('；筛选 ')}</span>
                {_l('%0个字段', searchfilters.length)}
              </Fragment>
            )}
          </div>
          <div className="edit">
            <i className="icon-edit"></i>
          </div>
        </EditInfo>
      )}
      {searchVisible && (
        <SearchConfig {...props} controls={controls} onClose={() => setState({ searchVisible: false })} />
      )}
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={isRelateView}
          onClick={checked => {
            setState({ isRelateView: !checked });
            if (checked) {
              onChange({ viewId: '' });
            }
          }}
        >
          <span style={{ marginRight: '6px' }}>{_l('关联视图')}</span>
          <Tooltip
            popupPlacement="bottom"
            title={
              <span>
                {_l(
                  '设置关联视图，统一控制关联记录的排序方式、选择范围、和打开记录时的视图。字段本身设置的排序和打开记录视图优先级高于此配置；过滤选择范围的效果为叠加。',
                )}
              </span>
            }
          >
            <i className="icon-help Gray_bd Font16 pointer"></i>
          </Tooltip>
        </Checkbox>
      </div>
      {isRelateView && (
        <Dropdown
          border
          className="w100"
          style={{ marginTop: '8px' }}
          loading={loading}
          noneContent={_l('请先选择关联表')}
          placeholder={
            selectedViewIsDeleted ? <span className="Red">{_l('视图已删除，请重新选择')}</span> : _l('选择视图')
          }
          data={dataSource ? formatViewToDropdown(views) : []}
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
              size="small"
              checked={resultVisible}
              onClick={checked => {
                if (checked) {
                  onChange({
                    ...handleAdvancedSettingChange(data, { resultfilters: '' }),
                    strDefault: updateConfig({
                      config: strDefault,
                      value: +!checked,
                      index: 0,
                    }),
                  });
                  setState({ resultVisible: false });
                } else {
                  setState({ resultVisible: true });
                }
              }}
            >
              <span style={{ marginRight: '6px' }}>{_l('过滤显示结果')}</span>
            </Checkbox>
          </div>
          {resultVisible && (
            <div className="mLeft25">
              <div className="labelWrap">
                <Checkbox
                  size="small"
                  checked={resultfilters && resultfilters.length > 0}
                  onClick={checked => {
                    if (checked) {
                      onChange(handleAdvancedSettingChange(data, { resultfilters: '' }));
                      setState({ resultVisible: !!+isHiddenOtherViewRecord });
                    } else {
                      setState({ resultFilterVisible: true });
                    }
                  }}
                >
                  <span style={{ marginRight: '6px' }}>{_l('按条件过滤')}</span>
                  <Tooltip popupPlacement="bottom" title={<span>{_l('设置筛选条件，只显示满足条件的关联记录')}</span>}>
                    <i className="icon-help Gray_bd Font16 pointer"></i>
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
                  size="small"
                  checked={!!+isHiddenOtherViewRecord}
                  onClick={checked => {
                    onChange({
                      strDefault: updateConfig({
                        config: strDefault,
                        value: +!checked,
                        index: 0,
                      }),
                    });
                    setState({ resultVisible: (resultfilters && resultfilters.length > 0) || !!+!checked });
                  }}
                >
                  <span style={{ marginRight: '6px' }}>{_l('按用户权限过滤')}</span>
                  <Tooltip
                    popupPlacement="bottom"
                    title={
                      <span>
                        {_l(
                          '未勾选时，用户在关联列表中可以查看所有关联数据。勾选后，按照用户对关联的工作表/视图的权限查看，隐藏无权限的数据或字段',
                        )}
                      </span>
                    }
                  >
                    <i className="icon icon-help Gray_bd Font15 mLeft5 pointer" />
                  </Tooltip>
                </Checkbox>
              </div>
            </div>
          )}
          {!layercontrolid && (
            <div className="labelWrap">
              <Checkbox
                className="allowSelectRecords"
                size="small"
                text={_l('显示计数')}
                checked={showcount !== '1'}
                onClick={checked =>
                  onChange(
                    handleAdvancedSettingChange(data, {
                      showcount: checked ? '1' : '0',
                    }),
                  )
                }
              >
                <Tooltip popupPlacement="bottom" title={<span>{_l('在表单中显示关联记录的数量')}</span>}>
                  <i className="icon icon-help Gray_bd Font15 mLeft5 pointer" />
                </Tooltip>
              </Checkbox>
            </div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
}
