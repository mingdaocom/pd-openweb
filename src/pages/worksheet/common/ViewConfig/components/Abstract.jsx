import React from 'react';
import { Dropdown } from 'ming-ui';
import { AS_ABSTRACT_CONTROL, filterAndFormatterControls } from 'src/pages/worksheet/views/util';
import { getIconByType } from 'src/pages/widgetConfig/util';
import cx from 'classnames';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';

// 摘要
export default class Abstract extends React.Component {
  render() {
    const { worksheetControls = [], advancedSetting = {}, handleChange } = this.props;
    const { abstract } = advancedSetting;
    let abstractControls = filterAndFormatterControls({
      controls: worksheetControls.filter(
        item =>
          !SYS.includes(item.controlId) && // 排除系统字段
          !(_.includes([48], item.sourceControlType) && item.type === 30), //排除他表字段 组织角色控件
      ),
      filter: item => _.includes(AS_ABSTRACT_CONTROL, item.type),
    });
    abstractControls = abstractControls.map(it => {
      return {
        ...it,
        iconName: getIconByType((worksheetControls.find(item => item.controlId === it.value) || {}).type, false),
      };
    });
    abstractControls = [{ value: 'clear', text: '清除' }].concat(abstractControls);
    return (
      <React.Fragment>
        <div className="title Font13 bold">{_l('摘要')}</div>
        <div className="settingContent">
          <p className="mTop6 mBottom8 Gray_9e viewSetText">{_l('用于显示长文本，最多可显示3行')}</p>
          <Dropdown
            className={cx('dropAbstract', { placeholder: !abstract })}
            data={abstractControls}
            value={abstract}
            border
            style={{ width: '100%' }}
            onChange={value => {
              if (value === abstract) {
                return;
              }
              if (value === 'clear') {
                handleChange('');
              } else {
                handleChange(value);
              }
            }}
            placeholder={_l('请选择')}
          />
        </div>
      </React.Fragment>
    );
  }
}
