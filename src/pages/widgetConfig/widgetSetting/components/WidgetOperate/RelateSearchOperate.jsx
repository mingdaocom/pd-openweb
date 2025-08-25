import React, { Fragment } from 'react';
import { Tooltip } from 'antd';
import _ from 'lodash';
import { Checkbox, Dropdown } from 'ming-ui';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import { SheetViewWrap } from '../../../styled';
import { formatViewToDropdown, isSheetDisplay } from '../../../util';

// 高级设置
export default function RelateSearchOperate(props) {
  const { data, onChange } = props;
  const { enumDefault2 = 1, controlId, viewId } = data;
  let { allowlink, openview = '', allowexport } = getAdvanceSetting(data);
  const { loading = true, views = [] } = window.subListSheetConfig[controlId] || {};
  const selectedViewIsDeleted = !loading && viewId && !_.find(views, sheet => sheet.viewId === viewId);
  const selectedOpenViewIsDelete = !loading && openview && !_.find(views, sheet => sheet.viewId === openview);
  const disableOpenViewDrop = !openview && viewId && !selectedViewIsDeleted;
  const isList = isSheetDisplay(data);

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          className="allowSelectRecords "
          size="small"
          text={_l('允许新增记录')}
          checked={enumDefault2 !== 1}
          onClick={checked => {
            onChange({ enumDefault2: checked ? 1 : 0 });
          }}
        />
      </div>
      <div className="labelWrap">
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
            cancelAble={!disableOpenViewDrop}
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
            disabled={disableOpenViewDrop}
            data={formatViewToDropdown(views)}
            value={openview && !selectedOpenViewIsDelete ? openview : undefined}
            onChange={value => {
              onChange(handleAdvancedSettingChange(data, { openview: value }));
            }}
          />
        </SheetViewWrap>
      ) : null}
      {isList && (
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={allowexport === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { allowexport: String(+!checked) }))}
          >
            <span style={{ marginRight: '4px' }}>{_l('允许导出')}</span>
            <Tooltip
              placement="bottom"
              autoCloseDelay={0}
              title={_l('勾选后支持在主记录详情中将查询到的可见记录导出为 Excel')}
            >
              <i className="icon-help Gray_9e Font16"></i>
            </Tooltip>
          </Checkbox>
        </div>
      )}
    </Fragment>
  );
}
