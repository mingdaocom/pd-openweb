import React, { Fragment, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import { isEmpty } from 'lodash';
import _ from 'lodash';
import { Checkbox, Dialog, Dropdown } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { permitList } from 'src/pages/FormSet/config';
import { isOpenPermit } from 'src/pages/FormSet/util';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import FilterItemTexts from 'src/pages/widgetConfig/widgetSetting/components/FilterData/FilterItemTexts';
import { SYSTEM_CONTROL } from '../../../config/widget';
import { SettingItem, SheetViewWrap } from '../../../styled';
import { formatViewToDropdown } from '../../../util';
import openSelectConfig from '../relateSheet/selectConfig';

const BATCH_OPTIONS = [
  {
    text: _l('导出'),
    key: 'batchexport',
    disabledKey: 'allowexport',
  },
  {
    text: _l('取消关联'),
    key: 'batchcancel',
    disabledKey: 'allowcancel',
  },
  {
    text: _l('删除'),
    key: 'batchdelete',
    disabledKey: 'allowdelete',
  },
  {
    text: _l('编辑'),
    key: 'batchedit',
  },
];

const BATCH_OPTIONS_RELATE_VIEW = [
  {
    text: _l('打印'),
    key: 'batchprint',
  },
  {
    text: _l('执行自定义动作'),
    key: 'batchbtn',
  },
];

function OperateDialog(props) {
  const { data, onClose, onOk, isRelateView } = props;
  const { batchcancel, batchdelete, batchedit = '1', batchexport, batchbtn, batchprint } = getAdvanceSetting(data);

  const [batchInfo, setBatchInfo] = useSetState({
    batchcancel,
    batchdelete,
    batchedit,
    batchexport,
    batchbtn,
    batchprint,
  });

  return (
    <Dialog width={480} visible={true} title={_l('批量操作设置')} onCancel={onClose} onOk={() => onOk(batchInfo)}>
      <div className="flexColumn pTop8">
        {BATCH_OPTIONS.map(item => {
          const defaultValue = getAdvanceSetting(data)[item.disabledKey] || '1';
          return (
            <div className="labelWrap mBottom10 ">
              <Checkbox
                size="small"
                {...(item.disabledKey ? { disabled: getAdvanceSetting(data, [item.disabledKey]) === 0 } : {})}
                checked={(batchInfo[item.key] || defaultValue) === '1'}
                onClick={checked => setBatchInfo({ [item.key]: String(+!checked) })}
              >
                <span className="textPrimary">{item.text}</span>
              </Checkbox>
            </div>
          );
        })}
        {BATCH_OPTIONS_RELATE_VIEW.map(item => {
          return (
            <div className="labelWrap mBottom10 flexCenter">
              <Checkbox
                size="small"
                disabled={!isRelateView}
                checked={batchInfo[item.key] === '1'}
                onClick={checked => setBatchInfo({ [item.key]: String(+!checked) })}
              >
                <span className="textPrimary">{item.text}</span>
              </Checkbox>
              {!isRelateView && (
                <span style={{ color: 'var(--color-warning-border)' }}>（{_l('未设置关联视图')}）</span>
              )}
            </div>
          );
        })}
      </div>
    </Dialog>
  );
}

// 高级设置
export default function RelateOperate(props) {
  const { data, allControls, globalSheetControls, onChange, globalSheetInfo = {} } = props;
  const [visible, setVisible] = useState(false);
  const { enumDefault, enumDefault2 = 1, controlId, viewId } = data;

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
    batchexport,
    batchdelete,
    batchcancel,
    allowimport = '0',
  } = getAdvanceSetting(data);
  const filters = getAdvanceSetting(data, 'filters') || [];
  const { loading = true, views = [], controls = [] } = window.subListSheetConfig[controlId] || {};
  const selectedViewIsDeleted = !loading && viewId && !_.find(views, sheet => sheet.viewId === viewId);
  const selectedOpenViewIsDelete = !loading && openview && !_.find(views, sheet => sheet.viewId === openview);
  const isRelateView = Boolean(data.viewId) && !selectedViewIsDeleted;
  const isList = enumDefault === 2 && _.includes(['2', '5', '6'], showtype);
  // 导入权限
  const excelImportSwitch = isOpenPermit(permitList.importSwitch, globalSheetInfo.switches, globalSheetInfo.viewId);

  return (
    <Fragment>
      <div className="labelWrap labelBetween">
        <Checkbox
          className="allowSelectRecords InlineBlock textPrimary"
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
          {!isEmpty(filters) && (
            <FilterItemTexts
              {...props}
              filters={filters}
              globalSheetControls={globalSheetControls}
              loading={loading}
              controls={controls}
              allControls={allControls.concat(SYSTEM_CONTROL.filter(c => _.includes(['caid', 'ownerid'], c.controlId)))}
              editFn={() => openSelectConfig(props)}
            />
          )}
          <Dropdown
            border
            className={cx('w100', { mTop10: isEmpty(filters) })}
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
      {showtype === '6' && (
        <div className="labelWrap">
          <Checkbox
            className="allowSelectRecords "
            size="small"
            text={_l('允许导入新增')}
            checked={allowimport === '1'}
            disabled={!excelImportSwitch && allowimport !== '1'}
            onClick={checked => {
              onChange(handleAdvancedSettingChange(data, { allowimport: checked ? '0' : '1' }));
            }}
          />
        </div>
      )}
      {enumDefault === 2 && (
        <div className="labelWrap">
          <Checkbox
            size="small"
            text={_l('允许取消关联')}
            checked={allowcancel !== '0'}
            onClick={checked =>
              onChange(
                handleAdvancedSettingChange(data, {
                  allowcancel: checked ? '0' : '1',
                  ...(checked && batchcancel === '1' ? { batchcancel: '0' } : {}),
                }),
              )
            }
          />
        </div>
      )}
      {isList && (
        <div className="labelWrap">
          <Checkbox
            size="small"
            text={_l('允许删除记录')}
            checked={allowdelete !== '0'}
            onClick={checked =>
              onChange(
                handleAdvancedSettingChange(data, {
                  allowdelete: String(+!checked),
                  ...(checked && batchdelete === '1' ? { batchdelete: '0' } : {}),
                }),
              )
            }
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
              onClick={checked =>
                onChange(
                  handleAdvancedSettingChange(data, {
                    allowexport: String(+!checked),
                    ...(checked && batchexport === '1' ? { batchexport: '0' } : {}),
                  }),
                )
              }
            >
              <span style={{ marginRight: '4px' }}>{_l('允许导出')}</span>
              <Tooltip placement="bottom" title={_l('勾选后支持在主记录详情中将已关联的记录导出为 Excel')}>
                <i className="icon-help textTertiary Font16"></i>
              </Tooltip>
            </Checkbox>
          </div>
          <div className="labelWrap labelBetween">
            <Checkbox
              size="small"
              text={_l('允许批量操作')}
              checked={allowbatch === '1'}
              onClick={checked => {
                if (checked) {
                  onChange(
                    handleAdvancedSettingChange(data, {
                      allowbatch: '0',
                      batchcancel: '0',
                      batchedit: '0',
                      batchdelete: '0',
                      batchexport: '0',
                      batchbtn: '0',
                      batchprint: '0',
                    }),
                  );
                  return;
                }
                onChange(
                  handleAdvancedSettingChange(data, {
                    allowbatch: '1',
                    batchedit: '1',
                    ...(isRelateView ? { batchbtn: '1', batchprint: '1' } : {}),
                  }),
                );
              }}
            />
            {allowbatch === '1' && (
              <Tooltip placement="bottom" title={_l('批量设置')}>
                <i
                  className="icon-settings textTertiary Font16 Hand Right ThemeHoverColor3"
                  onClick={() => setVisible(true)}
                ></i>
              </Tooltip>
            )}
          </div>
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={showquick === '1'}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { showquick: String(+!checked) }))}
            >
              <span style={{ marginRight: '4px' }}>{_l('显示记录快捷方式')}</span>
              <Tooltip placement="bottom" title={_l('点击后可以在下拉菜单中进行记录的其他操作')}>
                <i className="icon-help textTertiary Font16"></i>
              </Tooltip>
            </Checkbox>
          </div>
        </SettingItem>
      )}

      {visible && (
        <OperateDialog
          data={data}
          isRelateView={isRelateView}
          onClose={() => setVisible(false)}
          onOk={info => {
            onChange(handleAdvancedSettingChange(data, info));
            setVisible(false);
          }}
        />
      )}
    </Fragment>
  );
}
