import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, Radio } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { AnimationWrap } from 'src/pages/worksheet/common/ViewConfig/style.jsx';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import { setList } from '../config';
import { SwitchStyle } from './style';

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
        <AnimationWrap>
          {[
            { text: _l('紧凑'), value: 0 }, // 34
            { text: _l('中等'), value: 1 }, // 50
            { text: _l('高'), value: 2 }, // 70
            { text: _l('超高'), value: 3 }, // 100
          ].map(item => (
            <div
              className={cx('animaItem overflow_ellipsis', { active: (_.get(view, 'rowHeight') || 0) === item.value })}
              onClick={() => handleChange({ rowHeight: item.value }, ['rowHeight'])}
            >
              {item.text}
            </div>
          ))}
        </AnimationWrap>
      </div>
      <div className="commonConfigItem Font13 bold">{_l('显示设置')}</div>
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
              <SwitchStyle className="flex">
                <Icon
                  icon={show ? 'ic_toggle_on' : 'ic_toggle_off'}
                  className="Font28 Hand"
                  onClick={() => {
                    handleChange({ [o.key]: show ? '0' : '1' });
                  }}
                />
                <div className="switchText InlineBlock Normal mLeft12 mTop8">{o.txt}</div>
                {o.tips && (
                  <Tooltip title={o.tips}>
                    <i className="icon-help Font16 Gray_9e mLeft3 TxtMiddle" />
                  </Tooltip>
                )}
              </SwitchStyle>
              {['titlewrap'].includes(o.key) && show && (
                <AnimationWrap>
                  {[
                    { value: 0, tips: _l('顶对齐'), icon: 'align_vertical_top' },
                    { value: 1, tips: _l('垂直居中对齐'), icon: 'align_vertical_center' },
                  ].map(item => {
                    return (
                      <Tooltip title={item.tips}>
                        <div
                          className={cx('animaItem overflow_ellipsis pLeft16 pRight16', {
                            active: (_.get(view, 'advancedSetting.rctitlestyle') || '0') === item.value + '',
                          })}
                          onClick={() => handleChange({ rctitlestyle: item.value })}
                        >
                          <Icon icon={item.icon} className="Font16" />
                        </div>
                      </Tooltip>
                    );
                  })}
                </AnimationWrap>
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
              text={_l('经典模式')}
              checked={_.get(view, 'advancedSetting.sheettype') !== '1'}
              onClick={() => {
                handleChange({ sheettype: '0' }); ////表格交互
              }}
            />
            <div className="txt Gray_75 mTop8" style={{ marginLeft: '28px' }}>
              {_l('点整行打开记录')}
            </div>
          </div>
          <div className="mTop20">
            <Radio
              className=""
              text={_l('电子表格模式')}
              checked={_.get(view, 'advancedSetting.sheettype') === '1'}
              onClick={() => {
                handleChange({ sheettype: '1' });
              }}
            />
            <div className="txt Gray_75 mTop8" style={{ marginLeft: '28px' }}>
              {_l('点单元格选中字段，按空格键打开记录')}
            </div>
          </div>
          <div className="commonConfigItem Font13 bold mTop32">{_l('更多设置')}</div>
          <SwitchStyle className="mTop12">
            <div className="flexRow alignItemsCenter">
              <Icon
                icon={_.get(view, 'advancedSetting.fastedit') !== '0' ? 'ic_toggle_on' : 'ic_toggle_off'} //'1', //行内编辑
                className="Font28 Hand"
                onClick={() => {
                  handleChange({ fastedit: _.get(view, 'advancedSetting.fastedit') !== '0' ? '0' : '1' });
                }}
              />

              <div className="switchText InlineBlock Normal mLeft12">{_l('允许行内编辑')}</div>
            </div>
            <div className="flexRow">
              <div className="w28" />
              <div className="switchText InlineBlock Normal mLeft12 Gray_75 mTop4">
                {_l('无需打开记录详情，在表格行内直接编辑字段')}
              </div>
            </div>
          </SwitchStyle>
          <SwitchStyle className="mTop12">
            <div className="flexRow alignItemsCenter">
              <Icon
                icon={
                  _.get(view, 'advancedSetting.enablerules') !== '0' ////启用业务规则
                    ? 'ic_toggle_on'
                    : 'ic_toggle_off'
                }
                className="Font28 Hand"
                onClick={() => {
                  handleChange({
                    enablerules: _.get(view, 'advancedSetting.enablerules') !== '0' ? '0' : '1',
                  });
                }}
              />
              <div className="switchText InlineBlock Normal mLeft12">{_l('启用业务规则')}</div>
            </div>
            <div className="flexRow">
              <div className="w28"></div>
              <div className="switchText InlineBlock Normal mLeft12 Gray_75 mTop4">
                {_l('在表格中生效业务规则，但会影响表格性能')}
              </div>
            </div>
          </SwitchStyle>
        </Fragment>
      )}
    </div>
  );
}
