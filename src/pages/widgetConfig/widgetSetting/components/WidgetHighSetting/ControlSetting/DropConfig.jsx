import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import { Checkbox, Tooltip } from 'ming-ui/antd-components';
import { handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import AssignValue from '../../OptionList/AssignValue';

export default function DropConfig(props) {
  const { data, onChange, fromPortal } = props;
  const [visible, setVisible] = useState(false);
  const {
    type,
    dataSource,
    advancedSetting: { showtype, allowadd, checktype, readonlyshowall, showselectall } = {},
    options = [],
    enumDefault,
  } = data;

  const hasScore = _.find(options, (i = {}) => _.isNumber(i.score));

  return (
    <Fragment>
      {!dataSource && !fromPortal && (
        <div className="labelWrap" style={{ justifyContent: 'space-between' }}>
          <Checkbox
            checked={!!enumDefault}
            onChange={event => {
              const checked = !event.target.checked;

              if (checked) {
                onChange({
                  enumDefault: +checked,
                });
              } else {
                setVisible(true);
              }
            }}
            size="small"
          >
            <span>{_l('为选项赋分值')}</span>
          </Checkbox>
          {!!enumDefault && (
            <div className="pointer textSecondary hoverColorPrimary" onClick={() => setVisible(true)}>
              {hasScore && <span className="mRight6">{_l('已设置')}</span>}
              <span className="icon-settings Font15"></span>
            </div>
          )}
        </div>
      )}
      {visible && (
        <AssignValue
          options={options}
          enableScore={enumDefault === 1}
          onOk={({ options, enableScore }) => {
            onChange({ options, enumDefault: +enableScore });
            setVisible(false);
          }}
          onCancel={() => setVisible(false)}
        />
      )}
      {(type === 9 || (type === 10 && checktype !== '1')) && (
        <div className="labelWrap">
          <Checkbox
            checked={readonlyshowall === '1'}
            onChange={event =>
              onChange(
                handleAdvancedSettingChange(data, {
                  readonlyshowall: !event.target.checked ? '0' : '1',
                }),
              )
            }
            size="small"
          >
            <span>{_l('只读时显示全部选项')}</span>
          </Checkbox>
        </div>
      )}
      {((type === 11 && showtype !== '2') || (type === 10 && checktype === '1')) && (
        <div className="labelWrap">
          <Checkbox
            checked={allowadd === '1'}
            onChange={event =>
              onChange(
                handleAdvancedSettingChange(data, {
                  allowadd: !event.target.checked ? '0' : '1',
                }),
              )
            }
            size="small"
          >
            <span>{_l('允许用户增加选项')}</span>
            <Tooltip
              placement="bottom"
              title={_l(
                '勾选后，用户填写时可输入不在备选项中的内容，并添加至选项列表。若不勾选，通过工作流、API写入、批量导入等操作仍可将新的选项添加至选项列表。',
              )}
            >
              <i className="icon-help tipsIcon textTertiary Font16 pointer"></i>
            </Tooltip>
          </Checkbox>
        </div>
      )}
      {type === 10 && (
        <div className="labelWrap">
          <Checkbox
            checked={showselectall === '1'}
            onChange={event =>
              onChange(
                handleAdvancedSettingChange(data, {
                  showselectall: !event.target.checked ? '0' : '1',
                }),
              )
            }
            size="small"
          >
            <span>{_l('显示全选操作')}</span>
          </Checkbox>
        </div>
      )}
    </Fragment>
  );
}
