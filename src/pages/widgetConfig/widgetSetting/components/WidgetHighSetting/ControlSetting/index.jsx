import React, { Fragment } from 'react';
import _ from 'lodash';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange, updateConfig } from '../../../../util/setting';
import AttachmentConfig from './AttachmentConfig';
import CascaderConfig from './CascaderConfig';
import DateConfig from './DateConfig';
import DropConfig from './DropConfig';
import FormulaDateConfig from './FormulaDateConfig';
import NumberConfig from './NumberConfig';
import RelateConfig from './RelateConfig';
import RoleConfig from './RoleConfig';
import ScoreConfig from './ScoreConfig';
import SubListConfig from './SubListConfig';
import TelConfig from './TelConfig';
import TimeConfig from './TimeConfig';

const TYPE_TO_COMP = {
  3: TelConfig,
  6: NumberConfig,
  14: AttachmentConfig,
  15: DateConfig,
  16: DateConfig,
  28: ScoreConfig,
  29: RelateConfig,
  31: NumberConfig,
  34: SubListConfig,
  35: CascaderConfig,
  37: NumberConfig,
  38: FormulaDateConfig,
  46: TimeConfig,
  48: RoleConfig,
};

export default function WidgetConfig(props) {
  const { data, onChange, from } = props;
  const { type, enumDefault, enumDefault2, strDefault, noticeItem } = data;
  const {
    showxy,
    analysislink,
    uselast,
    sorttype = 'zh',
    anylevel,
    allpath,
    showdelete,
    allowcustom,
    checkusertype,
    usetimezone = '0',
  } = getAdvanceSetting(data);

  // 文本、文本组合
  if (_.includes([2, 30, 32, 33], type) || (type === 53 && enumDefault2 === 2)) {
    return (
      <Fragment>
        {_.includes([2, 32, 53], type) && (
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
        {!(type === 2 && enumDefault === 3) && (
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={sorttype === 'zh'}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { sorttype: checked ? 'en' : 'zh' }))}
            >
              <span>{_l('支持拼音排序')}</span>
              <Tooltip
                placement="bottom"
                title={_l(
                  '勾选后，中文可按拼音A-Z进行排序。注意，勾选了支持拼音排序时排序索引不生效。如无需要，建议不勾选。',
                )}
              >
                <i className="icon icon-help Gray_9e Font16"></i>
              </Tooltip>
            </Checkbox>
          </div>
        )}

        {type === 33 && (
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={usetimezone === '1'}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { usetimezone: checked ? '0' : '1' }))}
            >
              <span>{_l('按应用时区拼接')}</span>
              <Tooltip
                placement="bottom"
                title={_l('勾选后，当编号规则含时间相关字段时，对应的时间将按照应用时区显示。')}
              >
                <i className="icon icon-help Gray_9e Font16"></i>
              </Tooltip>
            </Checkbox>
          </div>
        )}
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
        {(strDefault || '00')[0] !== '1' && (
          <Fragment>
            <div className="labelWrap">
              <Checkbox
                checked={showxy === '1'}
                size={'small'}
                text={_l('显示经纬度')}
                onClick={checked => {
                  onChange(handleAdvancedSettingChange(data, { showxy: checked ? '0' : '1' }));
                }}
              />
            </div>
            <div className="labelWrap">
              <Checkbox
                checked={allowcustom === '1'}
                size={'small'}
                text={_l('允许输入自定义位置')}
                onClick={checked => {
                  onChange(handleAdvancedSettingChange(data, { allowcustom: checked ? '0' : '1' }));
                }}
              />
            </div>
          </Fragment>
        )}
      </Fragment>
    );
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
      <Fragment>
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
              placement="bottom"
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
        {/* <div className="labelWrap">
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
            <Tooltip placement="bottom" title={_l('在表单中显示查询记录的数量')}>
              <i className="icon icon-help Gray_bd Font15 mLeft5 pointer" />
            </Tooltip>
          </Checkbox>
        </div> */}
      </Fragment>
    );
  }

  if (type === 26) {
    return (
      <Fragment>
        {from !== 'subList' && (
          <div className="labelWrap">
            <Checkbox
              className="checkboxWrap"
              onClick={checked => {
                onChange({ noticeItem: Number(!checked) });
              }}
              checked={noticeItem === 1}
              text={_l('加入时收到通知')}
              size="small"
            />
          </div>
        )}
        {checkusertype !== '1' && (
          <div className="labelWrap">
            <Checkbox
              className="checkboxWrap"
              onClick={checked => {
                onChange(handleAdvancedSettingChange(data, { checkusertype: String(+!checked) }));
              }}
              text={_l('仅按成员类型赋值')}
              checked={checkusertype === '1'}
              size="small"
            >
              <Tooltip
                placement="bottom"
                title={
                  <span>
                    {_l('成员类型为常规时，不写入外部门户类型的成员，反之亦然。对工作流API写入或者批量导入不生效')}
                  </span>
                }
              >
                <i className="icon icon-help Gray_bd Font15 mLeft5 pointer" />
              </Tooltip>
            </Checkbox>
          </div>
        )}
      </Fragment>
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
            <span>{_l('显示部门路径')}</span>
          </Checkbox>
        </div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={showdelete === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { showdelete: String(+!checked) }))}
          >
            <span>{_l('显示已删除')}</span>
            <Tooltip placement="bottom" title={_l('勾选时，组织中被删除的部门显示为“已删除”，否则不显示')}>
              <i className="icon-help Gray_bd Font15"></i>
            </Tooltip>
          </Checkbox>
        </div>
      </Fragment>
    );
  }

  if (type === 53) {
    if (enumDefault2 === 6) return <NumberConfig {...props} />;
    return null;
  }

  const Comp = TYPE_TO_COMP[type];
  return <Comp {...props} />;
}
