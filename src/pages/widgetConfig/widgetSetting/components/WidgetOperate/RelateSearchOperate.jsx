import React, { Fragment } from 'react';
import _ from 'lodash';
import { Checkbox, Select, Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { formatViewToDropdown } from 'src/utils/domain/control/filters';
import { isSheetDisplay } from 'src/utils/domain/control/style';
import { SheetViewWrap } from '../../../styled';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

// 高级设置
export default function RelateSearchOperate(props) {
  const { data, onChange } = props;
  const { enumDefault2 = 1, controlId, viewId, enumDefault } = data;
  let { allowlink, openview = '', allowexport } = getAdvanceSetting(data);
  const { loading = true, views = [] } = window.subListSheetConfig[controlId] || {};
  const selectedViewIsDeleted = !loading && viewId && !_.find(views, sheet => sheet.viewId === viewId);
  const selectedOpenViewIsDelete = !loading && openview && !_.find(views, sheet => sheet.viewId === openview);
  const disableOpenViewDrop = !openview && viewId && !selectedViewIsDeleted;
  const isList = isSheetDisplay(data);

  return (
    <Fragment>
      {enumDefault !== 1 && (
        <div className="labelWrap">
          <Checkbox
            className="allowSelectRecords "
            checked={enumDefault2 !== 1}
            onChange={event => {
              onChange({
                enumDefault2: !event.target.checked ? 1 : 0,
              });
            }}
            size="small"
          >
            {_l('允许新增记录')}
          </Checkbox>
        </div>
      )}
      <div className="labelWrap">
        <Checkbox
          checked={+allowlink}
          onChange={event => {
            const checked = !event.target.checked;
            return onChange(
              handleAdvancedSettingChange(data, {
                allowlink: String(+!checked),
                openview: checked ? '' : openview,
              }),
            );
          }}
          size="small"
        >
          {_l('允许打开记录')}
        </Checkbox>
      </div>
      {+allowlink ? (
        <SheetViewWrap>
          <div className="viewCon">{_l('视图')}</div>
          <Select
            className="flex"
            variant="borderless"
            allowClear={!disableOpenViewDrop}
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
            options={formatViewToDropdown(views)}
            fieldNames={SELECT_FIELD_NAMES}
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
            checked={allowexport === '1'}
            onChange={event =>
              onChange(
                handleAdvancedSettingChange(data, {
                  allowexport: String(+event.target.checked),
                }),
              )
            }
            size="small"
          >
            <span style={{ marginRight: '4px' }}>{_l('允许导出')}</span>
            <Tooltip placement="bottom" title={_l('勾选后支持在主记录详情中将查询到的可见记录导出为 Excel')}>
              <i className="icon-help textTertiary Font16"></i>
            </Tooltip>
          </Checkbox>
        </div>
      )}
    </Fragment>
  );
}
