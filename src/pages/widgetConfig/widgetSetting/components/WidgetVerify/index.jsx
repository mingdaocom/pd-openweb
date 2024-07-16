import React from 'react';
import styled from 'styled-components';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'antd';
import { SettingItem, NumberRange } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange, canAsUniqueWidget } from 'src/pages/widgetConfig/util/setting';
import InputValue from './InputValue';
import DateVerify from './DateVerify';
import TextVerify from './TextVerify';
import AttachmentVerify from './AttachmentVerify';
import SubListVerify from './SubListVerify';
import _ from 'lodash';

const CompConfig = {
  2: TextVerify,
  14: AttachmentVerify,
  15: DateVerify,
  16: DateVerify,
  34: SubListVerify,
  46: DateVerify,
};

const TYPE_TO_TEXT = {
  2: { title: _l('限定字数'), placeholder: [_l('最小'), _l('最大')] },
  6: { title: _l('限定数值范围'), placeholder: [_l('最小'), _l('最大')] },
  8: { title: _l('限定金额范围'), placeholder: [_l('最小'), _l('最大')] },
  10: { title: _l('限定可选项数'), placeholder: [_l('最少'), _l('最多')] },
};

const SWITCH_TYPE_TO_TEXT = {
  0: _l('必须选中'),
  1: _l('必须开启'),
  2: _l('必须选是'),
};

const VerifySettingItem = styled(SettingItem)`
  .widgetDisplaySettingWrap {
    display: flex;
    flex-direction: column;
    .checkboxLabel {
      display: flex;
      align-self: baseline;
      width: auto;
    }
  }
  .timeFieldWrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    span {
      padding: 0 12px;
      margin-top: 12px;
    }
  }
  .dropLabel {
    .Checkbox {
      white-space: normal;
      align-items: flex-start;
    }
    .Checkbox-box {
      flex-shrink: 0;
      margin-top: 3px;
    }
  }
`;

export default function WidgetVerify(props) {
  const { data = {}, onChange, fromPortal, globalSheetInfo = {}, from } = props;
  const isSubList = from === 'subList';
  const { type, options = [], required = false, unique = false } = data;
  const Comp = CompConfig[type] || null;
  const {
    max = '',
    min = '',
    checkrange = '0',
    showtype,
    otherrequired = '0',
    required: forceReCheck,
  } = getAdvanceSetting(data);
  const { title, placeholder = [] } = TYPE_TO_TEXT[type] || {};
  const otherText =
    _.get(
      _.find(options, i => i.key === 'other' && !i.isDeleted),
      'value',
    ) || _l('其他');
  return (
    <VerifySettingItem>
      <div className="settingItemTitle mBottom0">{_l('验证')}</div>
      <div className="widgetDisplaySettingWrap">
        {/**必填 */}
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={required}
            onClick={checked =>
              onChange({
                ...handleAdvancedSettingChange(data, { required: checked ? '0' : forceReCheck }),
                required: !checked,
              })
            }
            text={type === 36 ? SWITCH_TYPE_TO_TEXT[showtype || '0'] : _l('必填')}
          />
        </div>
        {/**写入时强制校验 */}
        {required && from !== 'portal' && !_.includes([34], type) && (
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={forceReCheck === '1'}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { required: checked ? '0' : '1' }))}
            >
              <span>
                {_l('写入时强制校验')}
                <Tooltip
                  placement={'bottom'}
                  title={_l(
                    '忽略业务规则的配置，在所有写入数据的场景中校验必填，包括工作流、批量导入、API写入、数据集成同步等',
                  )}
                >
                  <i className="icon-help tipsIcon Gray_9e Font16 pointer"></i>
                </Tooltip>
              </span>
            </Checkbox>
          </div>
        )}
        {/**不允许重复输入 */}
        {!fromPortal && !isSubList && canAsUniqueWidget(data) && (
          <div className="labelWrap">
            <Checkbox size="small" checked={unique} onClick={checked => onChange({ unique: !checked })}>
              <span>
                {_l('不允许重复输入')}
                {!isSubList && (
                  <Tooltip
                    placement={'bottom'}
                    title={
                      <span>
                        {_l(
                          '选中后，不允许用户填写和已有字段值重复的数据，但对工作流或API写入、批量导入等操作不做限制。',
                        )}
                        <br />
                        {_l('若要确保数据绝对唯一，可创建该字段的唯一索引。')}
                        <span
                          className="pointer ThemeColor3"
                          onClick={e => {
                            e.stopPropagation();
                            window.open(
                              `${location.origin}/worksheet/formSet/edit/${globalSheetInfo.worksheetId}/indexSetting`,
                            );
                          }}
                        >
                          {_l('前往创建')}
                        </span>
                      </span>
                    }
                  >
                    <i className="icon-help tipsIcon Gray_9e Font16 pointer"></i>
                  </Tooltip>
                )}
              </span>
            </Checkbox>
          </div>
        )}

        {(_.includes([2, 8, 10], type) || (type === 6 && !_.includes(['1', '2'], showtype))) && (
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={checkrange === '1'}
              onClick={checked => {
                let tempData = { checkrange: checked ? '0' : '1' };
                if (type === 6 && checked) {
                  tempData.min = '';
                  tempData.max = '';
                }
                onChange(handleAdvancedSettingChange(data, tempData));
              }}
              text={title}
            />
          </div>
        )}

        {checkrange === '1' && (
          <NumberRange>
            <InputValue
              type={type}
              value={min}
              onChange={value => {
                if (type === 2) {
                  if (value === '0' || (max && +value > +max)) {
                    onChange(handleAdvancedSettingChange(data, { min: '' }));
                    return;
                  }
                }
                onChange(handleAdvancedSettingChange(data, { min: value }));
              }}
              placeholder={placeholder[0]}
            />
            <span>~</span>
            <InputValue
              type={type}
              value={max}
              onChange={value => {
                if (type === 2) {
                  if (value === '0') {
                    onChange(handleAdvancedSettingChange(data, { max: '' }));
                    return;
                  }
                }
                onChange(handleAdvancedSettingChange(data, { max: value }));
              }}
              onBlur={() => {
                if (type === 2 && min && +max < +min) {
                  onChange(handleAdvancedSettingChange(data, { max: '' }));
                  return;
                }
              }}
              placeholder={placeholder[1]}
            />
          </NumberRange>
        )}
      </div>

      {_.includes([9, 10, 11], type) && showtype !== '2' && _.find(options, i => i.key === 'other' && !i.isDeleted) && (
        <div className="labelWrap dropLabel">
          <Checkbox
            size="small"
            checked={otherrequired === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { otherrequired: checked ? '0' : '1' }))}
          >
            <span>
              {_l('选择“%0”时，补充信息必填', otherText)}
              <Tooltip placement={'bottom'} title={_l('勾选后，当用户选中“其他”时，必须在后面的文本框中填写内容。')}>
                <i className="icon-help tipsIcon Gray_9e Font16 pointer"></i>
              </Tooltip>
            </span>
          </Checkbox>
        </div>
      )}
      {Comp && <Comp {...props} />}
    </VerifySettingItem>
  );
}
