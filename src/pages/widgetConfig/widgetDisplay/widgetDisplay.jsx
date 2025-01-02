import React, { Fragment } from 'react';
import cx from 'classnames';
import { includes } from 'lodash';
import { NEED_SPECIAL_DISPLAY_CONTROLS } from '../config';
import {
  enumWidgetType,
  fixedBottomWidgets,
  getAdvanceSetting,
  getIconByType,
  isSheetDisplay,
  supportDisplayRow,
} from '../util';
import displayTypes from './displayTypes';
import { CommonDisplay, TitleContentWrap } from '../styled';
import WidgetStatus from './components/WidgetStatus';
import { getTitleStyle, getVerifyInfo } from '../util/setting';
import { TabHeaderItem } from './displayTabs/tabHeader';
import { TITLE_SIZE_OPTIONS } from '../config/setting';

export default function WidgetDisplay(props) {
  const {
    data = {},
    activeWidget,
    allControls = [],
    actualControls,
    styleInfo: { info = {} } = {},
    fromType,
    commonWidgets = [],
    isTab,
  } = props;
  const { type, sourceControlType, required, hint, unit, desc, strDefault, controlId, fieldPermission = '111' } = data;
  const readOnly = fieldPermission[1] === '0';
  const {
    prefix,
    suffix,
    hidetitle,
    titlesize = '0',
    titlestyle = '0000',
    titlecolor = '#757575',
    showtype,
    customtype,
  } = getAdvanceSetting(data);
  const titleSize = TITLE_SIZE_OPTIONS[titlesize];
  const titleStyle = getTitleStyle(titlestyle);
  const { titlelayout_pc = '1', titlewidth_pc = '100', align_pc = '1' } = info;

  // 分割线字段
  const isSplitLine = type === 22;
  const isSpecialControl = includes([22, 10010], type);
  const isActive = controlId === (activeWidget || {}).controlId;

  // 他表字段
  const showIcon = type === 30 && (strDefault || '')[0] !== '1';

  const Component = displayTypes[enumWidgetType[type]];

  const { isValid, text: verifyText } = getVerifyInfo(data, { controls: allControls });
  // 非激活状态或保存后校验字段是否配置正常
  const isInvalid = !isValid && !isActive;
  const controlName = isSpecialControl ? data.controlName : data.controlName || _l('字段名称');
  const showTitle = isSpecialControl ? hidetitle !== '1' && controlName : hidetitle !== '1';
  // 左右布局(不支持 多条关联记录（列表）、子表、分割线、备注)
  const displayRow = titlelayout_pc === '2' && supportDisplayRow(data);

  const getTitleContent = () => {
    const controlNameCon = (
      <div
        className={cx('controlName', {
          isSplitLine,
          flex: displayRow,
          breakAll: displayRow,
          overflow_ellipsis: !displayRow,
          hideTitle: !showTitle,
        })}
      >
        {controlName}
        {showIcon && <span className="icon-refresh Gray_9e mLeft6"></span>}
      </div>
    );

    if (displayRow) {
      return (
        <div className="titleContent">
          {controlNameCon}
          <WidgetStatus data={data} showTitle={showTitle} />
        </div>
      );
    }
    return (
      <Fragment>
        {controlNameCon}
        <WidgetStatus data={data} showTitle={showTitle} />
      </Fragment>
    );
  };

  // 分割线单独走展示
  if (type === 22) {
    return (
      <TitleContentWrap readOnly={readOnly}>
        <Component {...props} splitWidgets={commonWidgets} />
      </TitleContentWrap>
    );
  }

  // 标签页，标签页表格单独展示
  if (fixedBottomWidgets(data)) {
    return (
      <TitleContentWrap>
        <div className="tabHeaderTileWrap">
          <TabHeaderItem {...props} />
        </div>
        <Component {...props} isTab={true} />
      </TitleContentWrap>
    );
  }

  return (
    <TitleContentWrap
      displayRow={displayRow}
      titleWidth={titlewidth_pc}
      textAlign={align_pc}
      titleStyle={titleStyle}
      titleSize={titleSize}
      titleColor={titlecolor}
      readOnly={readOnly}
    >
      <div className={cx('nameAndStatus', { minHeight18: !isSpecialControl && hidetitle === '1' })}>
        {required && !(_.includes([51], data.type) || isSheetDisplay(data)) && (
          <div className={cx({ required })}>*</div>
        )}
        {customtype === '1' && <i className={cx(`typeIcon icon-custom-01`)}></i>}
        <i className={cx(`typeIcon icon-${getIconByType(type)}`)}></i>

        {getTitleContent()}
      </div>

      <div className={cx('flex', { overflow_ellipsis: !(type === 11 && showtype === '2') })}>
        {includes(NEED_SPECIAL_DISPLAY_CONTROLS, type) ? (
          <Component data={data} controls={actualControls} displayRow={displayRow} fromType={fromType} isTab={isTab} />
        ) : (
          <CommonDisplay>
            {prefix && <div className="unit prefix">{prefix}</div>}
            {hint && <div className="hint overflow_ellipsis">{type === 45 ? _l('编辑状态下不支持查看') : hint}</div>}
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
    </TitleContentWrap>
  );
}
