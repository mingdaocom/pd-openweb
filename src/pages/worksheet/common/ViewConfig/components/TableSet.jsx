import React, { Fragment } from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Radio, Segmented, Switch, Tooltip } from 'ming-ui/antd-components';
import { VIEW_DISPLAY_TYPE } from 'src/utils/domain/worksheet/constants';
import { setList } from '../config';

export default function TableSet(props) {
  const { appId, view, updateCurrentView } = props;
  const isManageView = view.viewId === view.worksheetId;

  const handleChange = (obj, editAttrs) => {
    if (editAttrs) {
      updateCurrentView({
        ...view,
        appId,
        ...obj,
        editAttrs,
      });
    } else {
      updateCurrentView({
        ...view,
        appId,
        advancedSetting: obj,
        editAttrs: ['advancedSetting'],
        editAdKeys: Object.keys(obj),
      });
    }
  };

  return (
    <div className="dataSetting">
      <div className="commonConfigItem Font13 bold">{_l('行高')}</div>
      <div className="commonConfigItem mTop12 mBottom32">
        <Segmented
          block
          value={_.get(view, 'rowHeight') || 0}
          options={[
            { text: _l('紧凑'), value: 0 }, // 34
            { text: _l('中等'), value: 1 }, // 50
            { text: _l('高'), value: 2 }, // 70
            { text: _l('超高'), value: 3 }, // 100
          ].map(({ text, ...option }) => ({ ...option, label: text }))}
          onChange={value => handleChange({ rowHeight: value }, ['rowHeight'])}
        />
      </div>
      <div className="commonConfigItem Font13 bold mBottom8">{_l('显示设置')}</div>
      {setList
        .filter(o => VIEW_DISPLAY_TYPE.sheet === String(view.viewType) || !['showno', 'showsummary'].includes(o.key))
        .map(o => {
          // ['showno', 'showquick', 'showsummary', 'showvertical']; 默认开启
          // ['alternatecolor', 'titlewrap'] 默认关闭
          let show = ['alternatecolor', 'titlewrap'].includes(o.key)
            ? _.get(view, `advancedSetting.${o.key}`) === '1'
            : _.get(view, `advancedSetting.${o.key}`) !== '0';
          return (
            <div className="flexRow">
              <div className="flex flexRow alignItemsCenter viewConfigSwitchRow">
                <Switch size="mini" checked={show} onChange={() => handleChange({ [o.key]: show ? '0' : '1' })} />
                <div className="InlineBlock Normal mLeft12">{o.txt}</div>
                {o.tips && (
                  <Tooltip title={o.tips}>
                    <i className="icon-help Font16 textTertiary mLeft3 TxtMiddle" />
                  </Tooltip>
                )}
              </div>
              {['titlewrap'].includes(o.key) && show && (
                <Segmented
                  value={Number(_.get(view, 'advancedSetting.rctitlestyle') || 0)}
                  options={[
                    {
                      value: 0,
                      tooltip: _l('顶对齐'),
                      icon: <Icon icon="align_vertical_top" className="Font16" />,
                    },
                    {
                      value: 1,
                      tooltip: _l('垂直居中对齐'),
                      icon: <Icon icon="align_vertical_center" className="Font16" />,
                    },
                  ]}
                  onChange={value => handleChange({ rctitlestyle: value })}
                />
              )}
            </div>
          );
        })}
      {!isManageView && (
        <Fragment>
          <div className="commonConfigItem Font13 bold mTop32">{_l('表格交互方式')}</div>
          <div className="mTop12">
            <Radio
              className=""
              checked={_.get(view, 'advancedSetting.sheettype') !== '1'}
              onChange={() => {
                handleChange({
                  sheettype: '0',
                }); ////表格交互
              }}
              title={_l('经典模式')}
            >
              {_l('经典模式')}
            </Radio>
            <div className="txt textSecondary mTop8 mLeft30">{_l('点整行打开记录')}</div>
          </div>
          <div className="mTop20">
            <Radio
              className=""
              checked={_.get(view, 'advancedSetting.sheettype') === '1'}
              onChange={() => {
                handleChange({
                  sheettype: '1',
                });
              }}
              title={_l('电子表格模式')}
            >
              {_l('电子表格模式')}
            </Radio>
            <div className="txt textSecondary mTop8 mLeft30">{_l('点单元格选中字段，按空格键打开记录')}</div>
          </div>
          <div className="commonConfigItem Font13 bold mTop32">{_l('更多设置')}</div>
          <div className="mTop12">
            <div className="flexRow alignItemsCenter viewConfigSwitchRow">
              <Switch
                size="mini"
                checked={_.get(view, 'advancedSetting.fastedit') !== '0'}
                onChange={() => {
                  handleChange({ fastedit: _.get(view, 'advancedSetting.fastedit') !== '0' ? '0' : '1' });
                }}
              />

              <div className="InlineBlock Normal mLeft12">{_l('允许行内编辑')}</div>
            </div>
            <div className="InlineBlock Normal textSecondary mTop4" style={{ marginLeft: '40px' }}>
              {_l('无需打开记录详情，在表格行内直接编辑字段')}
            </div>
          </div>
          <div className="mTop12">
            <div className="flexRow alignItemsCenter viewConfigSwitchRow">
              <Switch
                size="mini"
                checked={_.get(view, 'advancedSetting.enablerules') !== '0'}
                onChange={() => {
                  handleChange({
                    enablerules: _.get(view, 'advancedSetting.enablerules') !== '0' ? '0' : '1',
                  });
                }}
              />
              <div className="InlineBlock Normal mLeft12">{_l('启用业务规则')}</div>
            </div>
            <div className="InlineBlock Normal textSecondary mTop4" style={{ marginLeft: '40px' }}>
              {_l('在表格中生效部分业务规则（样式、锁定及只读交互），会影响表格性能')}
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
}
