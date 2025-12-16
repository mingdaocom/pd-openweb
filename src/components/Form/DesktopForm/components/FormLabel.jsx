import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { RELATE_RECORD_SHOW_TYPE, RELATION_SEARCH_SHOW_TYPE } from 'worksheet/constants/enum';
import { TITLE_SIZE_OPTIONS } from 'src/pages/widgetConfig/config/setting';
import { isSheetDisplay } from 'src/pages/widgetConfig/util';
import { canSetWidgetStyle, getTitleStyle } from 'src/pages/widgetConfig/util/setting';
import RelationSearchCount from '../../components/RelationSearchCount';
import WidgetsDesc from '../../components/WidgetsDesc';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT, FROM } from '../../core/config';
import { controlState, renderCount } from '../../core/utils';
import { ControlLabel } from '../style';

export default ({
  from,
  recordId,
  item,
  errorItems,
  uniqueErrorItems,
  loadingItems,
  widgetStyle = {},
  disabled,
  updateErrorState = () => {},
}) => {
  const {
    hinttype = '0',
    valuesize = '0',
    titlesize = item.type === 34 ? '1' : '0',
    titlestyle = '0000',
    titlecolor = item.type === 34 ? 'var(--color-text-primary)' : 'var(--color-text-title)',
    allowlink,
    hidetitle,
    required,
  } = item.advancedSetting || {};

  const titleSize = TITLE_SIZE_OPTIONS[titlesize];
  const titleStyle = getTitleStyle(titlestyle);
  const showTitle = _.includes([22, 10010], item.type) ? hidetitle !== '1' && item.controlName : hidetitle !== '1';
  const hintShowAsIcon =
    hinttype === '0'
      ? (recordId && from !== FROM.DRAFT) || item.isSubList || from === FROM.RECORDINFO
      : hinttype === '1';
  const hintShowAsText = hinttype === '0' ? !recordId : hinttype === '2';
  const showDesc = hintShowAsIcon && item.desc && !_.includes([22, 10010], item.type);
  const showOtherIcon = item.type === 45 && allowlink === '1' && item.enumDefault === 1;

  const currentErrorItem = _.find(errorItems.concat(uniqueErrorItems), obj => obj.controlId === item.controlId) || {};
  const errorText = currentErrorItem.errorText || '';
  const isRuleError = currentErrorItem.errorType === FORM_ERROR_TYPE.RULE_ERROR;
  // 强制必填、业务规则报错等只读时依然呈现错误提示
  const isEditable = (item.required && required === '1') || isRuleError || controlState(item, from).editable;
  const isRelateRecordTable =
    item.type === 29 && _.get(item, 'advancedSetting.showtype') === String(RELATE_RECORD_SHOW_TYPE.TABLE);
  const isRelationSearchTable =
    item.type === 51 && _.get(item, 'advancedSetting.showtype') === String(RELATION_SEARCH_SHOW_TYPE.EMBED_LIST);
  let showCount = _.get(item, 'advancedSetting.showcount') !== '1' && !_.get(item, 'advancedSetting.layercontrolid');
  let errorMessage = '';

  if (currentErrorItem.showError && isEditable) {
    if (currentErrorItem.errorType === FORM_ERROR_TYPE.UNIQUE) {
      errorMessage = currentErrorItem.errorMessage || FORM_ERROR_TYPE_TEXT.UNIQUE(item);
    } else {
      errorMessage = errorText || currentErrorItem.errorMessage;
    }
  }

  return (
    <Fragment>
      {errorMessage && (
        <div
          className={cx('customFormErrorMessage', {
            isChildTable: item.type === 34,
            ignoreErrorMessage: currentErrorItem.ignoreErrorMessage,
          })}
        >
          <span>
            {errorMessage}
            <i className="icon-close mLeft6 Bold delIcon" onClick={() => updateErrorState(false, item.controlId)} />
          </span>
          <i className="customFormErrorArrow" />
        </div>
      )}
      <ControlLabel
        className={cx('customFormItemLabel', {
          isRelateRecordTable,
          isRelationSearchTable,
        })}
        disabled={disabled}
        item={item}
        showTitle={showTitle}
        {...widgetStyle}
        titleSize={titleSize}
        titleStyle={titleStyle}
        titleColor={titlecolor}
        valuesize={canSetWidgetStyle(item) ? valuesize : '0'}
        hasContent={showDesc || showOtherIcon || showTitle}
      >
        {loadingItems[item.controlId] ? (
          <div className="requiredBtnBox">
            <i className="icon-loading_button customFormItemLoading Gray_9e" />
          </div>
        ) : (
          item.required &&
          !item.disabled &&
          !isSheetDisplay(item) &&
          !_.includes([51], item.type) &&
          isEditable && (
            <div className="requiredBtnBox">
              <div className="requiredBtn">*</div>
            </div>
          )
        )}

        {item.type !== 34 ? (
          <div title={item.controlName} className="controlLabelName WordBreak">
            {item.controlName}
            {showCount &&
              (item.type === 51 ? <RelationSearchCount control={item} recordId={recordId} /> : renderCount(item))}
          </div>
        ) : (
          <div title={item.controlName} className="controlLabelName flexRow">
            <div className="flex ellipsis">{item.controlName}</div>
            {showCount && renderCount(item)}
          </div>
        )}

        {(item.type === 34 ? hintShowAsIcon && showTitle : hintShowAsIcon) && <WidgetsDesc item={item} from={from} />}

        {item.type === 45 && allowlink === '1' && item.enumDefault === 1 && (
          <Tooltip title={_l('新页面打开')}>
            <Icon
              className="Hand Font16 mLeft3 Gray_9e mTop3"
              icon="launch"
              onClick={() => {
                if (/^https?:\/\/.+$/.test(item.value)) {
                  window.open(item.value);
                }
              }}
            />
          </Tooltip>
        )}
      </ControlLabel>

      {item.type === 34 && !item.isSubList && hintShowAsText && <WidgetsDesc item={item} from={from} />}
    </Fragment>
  );
};
