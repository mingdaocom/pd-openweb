import React, { Fragment } from 'react';
import cx from 'classnames';
import { isEmpty } from 'lodash';
import { useSetState } from 'react-use';
import { Checkbox, Dropdown } from 'ming-ui';
import { Tooltip } from 'antd';
import { formatViewToDropdown } from '../../../util';
import { SettingItem, SheetViewWrap } from '../../../styled';
import { SYSTEM_CONTROL } from '../../../config/widget';
import { FilterItemTexts, FilterDialog } from '../../components/FilterData';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';

// 高级设置
export default function RelateOperate(props) {
  const { data, allControls, globalSheetControls, onChange } = props;
  const { enumDefault, enumDefault2 = 1, controlId, dataSource, viewId } = data;

  let {
    showtype = String(enumDefault),
    allowlink,
    allowcancel = '1',
    openview = '',
    searchrange = '1',
    allowdelete = '1',
    allowexport = '1',
    showquick = '1',
    allowbatch = '0',
  } = getAdvanceSetting(data);
  const filters = getAdvanceSetting(data, 'filters');
  const { loading, views = [], controls = [] } = window.subListSheetConfig[controlId] || {};
  const selectedViewIsDeleted = !loading && viewId && !_.find(views, sheet => sheet.viewId === viewId);
  const selectedOpenViewIsDelete = !loading && openview && !_.find(views, sheet => sheet.viewId === openview);
  const isList = enumDefault === 2 && showtype === '2';

  const [{ filterVisible }, setState] = useSetState({
    filterVisible: false,
  });

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          className="allowSelectRecords InlineBlock Gray"
          size="small"
          disabled={_.includes([0, 1], enumDefault2) && showtype === '3'} // 下拉框不能取消勾选
          text={_l('允许选择已有记录')}
          checked={_.includes([0, 1], enumDefault2)}
          onClick={checked => {
            // enumDefault2使用两位数代表两个字段的布尔值 所以此处有恶心判断
            if (checked) {
              onChange({
                ...handleAdvancedSettingChange(data, { searchrange: '', filters: '' }),
                enumDefault2: enumDefault2 === 0 ? 10 : 11,
              });
            } else {
              onChange({
                ...handleAdvancedSettingChange(data, { searchrange: '1' }),
                enumDefault2: enumDefault2 === 10 ? 0 : 1,
              });
            }
          }}
        />
      </div>
      {_.includes([0, 1], enumDefault2) && (
        <Fragment>
          <SheetViewWrap>
            <Dropdown
              border
              className="flex"
              data={[
                { text: _l('全部'), value: '1' },
                { text: _l('有查看权限的'), value: '0' },
              ]}
              value={searchrange}
              onChange={value => {
                onChange(
                  handleAdvancedSettingChange(data, {
                    searchrange: value,
                  }),
                );
              }}
            />
            <div
              className="filterEditIcon tip-bottom"
              data-tip={_l('过滤选择范围')}
              onClick={() => {
                if (!filters || !filters.length || filters.length <= 0) {
                  if (!dataSource) {
                    alert(_l('请先选择工作表'), 3);
                    return;
                  }
                  setState({
                    filterVisible: true,
                  });
                } else {
                  onChange(
                    handleAdvancedSettingChange(data, {
                      filters: '',
                    }),
                  );
                }
              }}
            >
              <i
                className={cx('icon-filter Font22 LineHeight34', {
                  ThemeColor3: filters && filters.length,
                })}
              ></i>
            </div>
          </SheetViewWrap>
          {filterVisible && (
            <FilterDialog
              {...props}
              showCustom
              filters={filters}
              supportGroup
              relationControls={controls}
              globalSheetControls={globalSheetControls}
              fromCondition={'relateSheet'}
              allControls={allControls.concat(SYSTEM_CONTROL.filter(c => _.includes(['caid', 'ownerid'], c.controlId)))}
              onChange={({ filters }) => {
                onChange(handleAdvancedSettingChange(data, { filters: JSON.stringify(filters) }));
                setState({ filterVisible: false });
              }}
              onClose={() => setState({ filterVisible: false })}
            />
          )}
          {!isEmpty(filters) && (
            <FilterItemTexts
              {...props}
              filters={filters}
              globalSheetControls={globalSheetControls}
              loading={loading}
              controls={controls}
              allControls={allControls.concat(SYSTEM_CONTROL.filter(c => _.includes(['caid', 'ownerid'], c.controlId)))}
              editFn={() => setState({ filterVisible: true })}
            />
          )}
        </Fragment>
      )}

      <div className="labelWrap">
        <Checkbox
          className="allowSelectRecords "
          size="small"
          text={_l('允许新增记录')}
          checked={_.includes([0, 10], enumDefault2)}
          onClick={checked => {
            // enumDefault2使用两位数代表两个字段的布尔值 所以此处有恶心判断
            if (checked) {
              onChange({
                enumDefault2: enumDefault2 === 0 ? 1 : 11,
              });
            } else {
              onChange({
                enumDefault2: enumDefault2 === 1 ? 0 : 10,
              });
            }
          }}
        />
      </div>
      {enumDefault === 2 && (
        <div className="labelWrap">
          <Checkbox
            size="small"
            text={_l('允许取消关联')}
            checked={allowcancel !== '0'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { allowcancel: checked ? '0' : '1' }))}
          />
        </div>
      )}
      {isList && (
        <div className="labelWrap">
          <Checkbox
            size="small"
            text={_l('允许删除记录')}
            checked={allowdelete !== '0'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { allowdelete: String(+!checked) }))}
          />
        </div>
      )}
      <div className="labelWrap mTop8 mBottom8">
        <Checkbox
          size="small"
          text={_l('允许打开记录')}
          checked={+allowlink}
          onClick={checked =>
            onChange(handleAdvancedSettingChange(data, { allowlink: +!checked, openview: checked ? '' : openview }))
          }
        />
      </div>
      {+allowlink ? (
        <SheetViewWrap>
          <div className="viewCon">{_l('视图')}</div>
          <Dropdown
            border
            className="flex"
            cancelAble
            loading={loading}
            placeholder={
              selectedOpenViewIsDelete || selectedViewIsDeleted ? (
                <span className="Red">{_l('已删除')}</span>
              ) : viewId && !selectedViewIsDeleted ? (
                _l('按关联视图配置')
              ) : (
                _l('未设置')
              )
            }
            data={formatViewToDropdown(views)}
            value={openview && !selectedOpenViewIsDelete ? openview : undefined}
            onChange={value => {
              onChange(handleAdvancedSettingChange(data, { openview: value }));
            }}
          />
        </SheetViewWrap>
      ) : null}

      {isList && (
        <SettingItem>
          <div className=" settingItemTitle">{_l('其他')}</div>
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={allowexport === '1'}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { allowexport: String(+!checked) }))}
            >
              <span style={{ marginRight: '4px' }}>{_l('允许导出')}</span>
              <Tooltip placement="bottom" title={_l('勾选后支持在主记录详情中将已关联的记录导出为 Excel')}>
                <i className="icon-help Gray_9e Font16"></i>
              </Tooltip>
            </Checkbox>
          </div>
          <div className="labelWrap">
            <Checkbox
              size="small"
              text={_l('允许批量操作')}
              checked={allowbatch === '1'}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { allowbatch: String(+!checked) }))}
            />
          </div>
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={showquick === '1'}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { showquick: String(+!checked) }))}
            >
              <span style={{ marginRight: '4px' }}>{_l('显示记录快捷方式')}</span>
              <Tooltip placement="bottom" title={_l('点击后可以在下拉菜单中进行记录的其他操作')}>
                <i className="icon-help Gray_9e Font16"></i>
              </Tooltip>
            </Checkbox>
          </div>
        </SettingItem>
      )}
    </Fragment>
  );
}
