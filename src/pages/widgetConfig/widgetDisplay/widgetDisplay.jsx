import React from 'react';
import cx from 'classnames';
import { includes } from 'lodash';
import { NEED_SPECIAL_DISPLAY_CONTROLS } from '../config';
import { enumWidgetType, getAdvanceSetting, getIconByType } from '../util';
import displayTypes from './displayTypes';
import { CommonDisplay } from '../styled';
import Components from './components';
import { getVerifyInfo } from '../util/setting';

export default function WidgetDisplay(props) {
  const { data = {}, activeWidget, allControls, actualControls } = props;
  const { type, required, hint, unit, desc } = data;
  const { prefix, suffix } = getAdvanceSetting(data);

  // 分段字段
  const isSplitLine = type === 22;
  const isActive = data.controlId === (activeWidget || {}).controlId;

  const Component = displayTypes[enumWidgetType[type]];

  const { isValid, text: verifyText } = getVerifyInfo(data, { controls: allControls });
  // 非激活状态或保存后校验字段是否配置正常
  const isInvalid = !isValid && !isActive;
  const controlName = isSplitLine ? data.controlName : data.controlName || _l('字段名称');
  return (
    <div className={cx('contentWrap', { isActive })}>
      {type !== 10010 && (
        <div className="nameAndStatus">
          {required && <div className={cx({ required })}>*</div>}
          {!isSplitLine && <i className={`typeIcon icon-${getIconByType(type)}`}></i>}
          <div className={cx('controlName overflow_ellipsis', { isSplitLine })}>{controlName}</div>
          <Components.WidgetStatus data={data} />
        </div>
      )}
      {includes(NEED_SPECIAL_DISPLAY_CONTROLS, type) ? (
        <Component data={data} controls={actualControls} />
      ) : (
        <CommonDisplay>
          {prefix && <div className="unit prefix">{prefix}</div>}
          {hint && <div className="hint overflow_ellipsis">{hint}</div>}
          {/* 汇总不需要显示单位 */}
          {!includes([37], type) && (suffix || unit) && <div className="unit">{suffix || unit}</div>}
        </CommonDisplay>
      )}
      {isInvalid && <div className="verifyInfo">{verifyText}</div>}
      {/* // 子表的描述走单独样式 备注无描述 */}
      {![34, 10010].includes(type) && desc && !isInvalid && <div className="desc overflow_ellipsis">{desc}</div>}
    </div>
  );
}
