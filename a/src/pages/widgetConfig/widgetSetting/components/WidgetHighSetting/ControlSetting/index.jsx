import React, { Fragment } from 'react';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'antd';
import { SettingItem } from '../../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange, updateConfig } from '../../../../util/setting';
import TelConfig from './TelConfig';
import UserConfig from './UserConfig';
import DateConfig from './DateConfig';
import TimeConfig from './TimeConfig';
import ScoreConfig from './ScoreConfig';
import DropConfig from './DropConfig';
import NumberConfig from './NumberConfig';
import AttachmentConfig from './AttachmentConfig';
import FormulaDateConfig from './FormulaDateConfig';
import RelateConfig from './RelateConfig';
import _ from 'lodash';

const TYPE_TO_COMP = {
  3: TelConfig,
  6: NumberConfig,
  14: AttachmentConfig,
  15: DateConfig,
  16: DateConfig,
  26: UserConfig,
  28: ScoreConfig,
  29: RelateConfig,
  31: NumberConfig,
  37: NumberConfig,
  38: FormulaDateConfig,
  46: TimeConfig,
};

const CASCADER_CONFIG = [
  {
    text: _l('必须选择到最后一级'),
    key: 'anylevel',
  },
  {
    text: _l('选择结果显示层级路径'),
    tip: _l('勾选后，将呈现选项路径。例：上海市/徐汇区/漕河泾'),
    key: 'allpath',
  },
];

export default function WidgetConfig(props) {
  const { data, onChange } = props;
  const { type, enumDefault, advancedSetting = {}, strDefault } = data;
  const {
    showxy,
    showtype,
    analysislink,
    uselast,
    sorttype = 'zh',
    anylevel,
    allpath,
    showdelete,
  } = getAdvanceSetting(data);

  // 文本、文本组合
  if (_.includes([2, 30, 32, 33], type)) {
    return (
      <Fragment>
        {_.includes([2, 32], type) && (
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={analysislink === '1'}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { analysislink: checked ? '0' : '1' }))}
            >
              <span>{_l('解析链接')}</span>
            </Checkbox>
          </div>
        )}
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={sorttype === 'zh'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { sorttype: checked ? 'en' : 'zh' }))}
          >
            <span>{_l('支持拼音排序')}</span>
            <Tooltip
              placement={'bottom'}
              title={_l(
                '勾选后，中文可按拼音A-Z进行排序。注意，勾选了支持拼音排序时排序索引不生效。如无需要，建议不勾选。',
              )}
            >
              <i className="icon icon-help Gray_9e Font16"></i>
            </Tooltip>
          </Checkbox>
        </div>
      </Fragment>
    );
  }
  // 选项
  if (_.includes([9, 10, 11], type)) {
    return <DropConfig {...props} />;
  }
  // 定位
  if (type === 40) {
    return (
      <Fragment>
        <div className="labelWrap">
          <Checkbox
            checked={Boolean(enumDefault)}
            size={'small'}
            text={_l('显示地图')}
            onClick={checked => onChange({ enumDefault: +!checked })}
          />
        </div>
        <div className="labelWrap">
          <Checkbox
            checked={showxy === '1'}
            disabled={(strDefault || '00')[0] === '1'}
            size={'small'}
            text={_l('显示经纬度')}
            onClick={checked => {
              onChange(handleAdvancedSettingChange(data, { showxy: checked ? '0' : '1' }));
            }}
          />
        </div>
      </Fragment>
    );
  }
  // 级联
  if (type === 35) {
    return (String(showtype) === '4' ? CASCADER_CONFIG.slice(1) : CASCADER_CONFIG).map(({ text, tip, key }) => (
      <div key={key} className="labelWrap">
        <Checkbox
          size="small"
          checked={String(advancedSetting[key]) === '1'}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { [key]: +!checked }))}
        >
          <span>{text}</span>
          {tip && (
            <Tooltip placement="topLeft" title={tip} arrowPointAtCenter>
              <i className="icon-help Gray_9e Font16"></i>
            </Tooltip>
          )}
        </Checkbox>
      </div>
    ));
  }
  // 地区
  if (_.includes([23, 24], type)) {
    return (
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={anylevel === '1'}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { anylevel: checked ? '0' : '1' }))}
        >
          <span>{_l('必须选择到最后一级')}</span>
        </Checkbox>
      </div>
    );
  }
  // 签名
  if (type === 42) {
    return (
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={uselast === '1'}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { uselast: String(+!checked) }))}
        >
          <span>{_l('允许使用上次的签名')}</span>
        </Checkbox>
      </div>
    );
  }
  // 查询记录
  if (type === 51) {
    const [isHiddenOtherViewRecord] = (strDefault || '000').split('');
    return (
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
          }}
        >
          <span style={{ marginRight: '6px' }}>{_l('按用户权限过滤')}</span>
          <Tooltip
            popupPlacement="bottom"
            title={
              <span>
                {_l('未勾选时，用户可查看所有查询结果。勾选后，按照用户对数据的权限查看，隐藏无权限的数据或字段')}
              </span>
            }
          >
            <i className="icon icon-help Gray_9e Font16 mLeft5 pointer" />
          </Tooltip>
        </Checkbox>
      </div>
    );
  }

  // 部门
  if (type === 27) {
    return (
      <Fragment>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={allpath === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { allpath: String(+!checked) }))}
          >
            <span>{_l('显示部门层级')}</span>
          </Checkbox>
        </div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={showdelete === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { showdelete: String(+!checked) }))}
          >
            <span>{_l('显示已删除')}</span>
            <Tooltip placement={'bottom'} title={_l('勾选时，组织中被删除的部门显示为“已删除”，否则不显示')}>
              <i className="icon-help Gray_bd Font15"></i>
            </Tooltip>
          </Checkbox>
        </div>
      </Fragment>
    );
  }

  const Comp = TYPE_TO_COMP[type];
  return <Comp {...props} />;
}
