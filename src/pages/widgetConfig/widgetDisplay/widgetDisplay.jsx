import React, { Fragment } from 'react';
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
  const { type, sourceControlType, required, hint, unit, desc, strDefault } = data;
  const { prefix, suffix, hidetitle } = getAdvanceSetting(data);

  // 分段字段
  const isSplitLine = type === 22;
  const isSpecialControl = includes([22, 10010], type);
  const isActive = data.controlId === (activeWidget || {}).controlId;

  // 他表字段
  const showIcon = type === 30 && (strDefault || '')[0] !== '1';

  const Component = displayTypes[enumWidgetType[type]];

  const { isValid, text: verifyText } = getVerifyInfo(data, { controls: allControls });
  // 非激活状态或保存后校验字段是否配置正常
  const isInvalid = !isValid && !isActive;
  const controlName = isSpecialControl ? data.controlName : data.controlName || _l('字段名称');
  const showTitle = isSpecialControl ? hidetitle !== '1' && controlName : hidetitle !== '1';
  return (
    <div className={cx('contentWrap', { isActive })}>
      <div className={cx('nameAndStatus', { minHeight18: !isSpecialControl && hidetitle === '1' })}>
        {required && <div className={cx({ required })}>*</div>}
        {showTitle && (
          <Fragment>
            {!isSplitLine && <i className={`typeIcon icon-${getIconByType(type)}`}></i>}
            <div className={cx('controlName overflow_ellipsis', { isSplitLine })}>
              {controlName}
              {showIcon && <span className="icon-refresh Gray_9e mLeft6"></span>}
            </div>
          </Fragment>
        )}
        <Components.WidgetStatus data={data} showTitle={showTitle} />
      </div>
      {includes(NEED_SPECIAL_DISPLAY_CONTROLS, type) ? (
        <Component data={data} controls={actualControls} />
      ) : (
        <CommonDisplay>
          {prefix && <div className="unit prefix">{prefix}</div>}
          {hint && <div className="hint overflow_ellipsis">{hint}</div>}
          {/* 汇总、时间不需要显示单位 */}
          {!includes([37, 46], type) && !includes([37, 46], sourceControlType) && (suffix || unit) && (
            <div className="unit">{suffix || unit}</div>
          )}
        </CommonDisplay>
      )}
      {isInvalid && <div className="verifyInfo">{verifyText}</div>}
      {/* // 子表的描述走单独样式 备注无描述 */}
      {![34, 10010].includes(type) && desc && !isInvalid && <div className="desc overflow_ellipsis">{desc}</div>}
    </div>
  );
}
