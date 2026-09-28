import React, { Fragment, memo } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { TITLE_SIZE_OPTIONS } from 'src/utils/domain/control/setting';
import { controlState } from 'src/utils/domain/control/state';
import { getTitleStyle, isSheetDisplay } from 'src/utils/domain/control/style';
import { RELATE_RECORD_SHOW_TYPE, RELATION_SEARCH_SHOW_TYPE } from 'src/utils/domain/worksheet/constants';
import RelationSearchCount from '../../components/RelationSearchCount';
import WidgetsDesc from '../../components/WidgetsDesc';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT, FROM } from '../../core/config';
import { isSameRenderValue } from '../../core/renderDataUtils';
import { renderCount } from '../../core/utils';
import { ControlLabel } from '../style';

const getCurrentErrorItem = ({ currentErrorItem, errorItems = [], uniqueErrorItems = [], item = {} }) =>
  currentErrorItem ||
  _.find(errorItems, obj => obj.controlId === item.controlId) ||
  _.find(uniqueErrorItems, obj => obj.controlId === item.controlId) ||
  {};

const getLoading = ({ loading, loadingItems = {}, item = {} }) =>
  _.isUndefined(loading) ? loadingItems[item.controlId] : loading;

const arePropsEqual = (prevProps, nextProps) => {
  const prevError = getCurrentErrorItem(prevProps);
  const nextError = getCurrentErrorItem(nextProps);
  const keys = ['from', 'recordId', 'disabled'];

  return (
    keys.every(key => Object.is(prevProps[key], nextProps[key])) &&
    isSameRenderValue(prevProps.item, nextProps.item) &&
    isSameRenderValue(prevProps.widgetStyle, nextProps.widgetStyle) &&
    Object.is(getLoading(prevProps), getLoading(nextProps)) &&
    isSameRenderValue(prevError, nextError)
  );
};

function FormLabel({
  from,
  recordId,
  item,
  currentErrorItem: currentErrorItemProp,
  errorItems = [],
  uniqueErrorItems = [],
  loading,
  loadingItems = {},
  widgetStyle = {},
  updateErrorState = () => {},
}) {
  const {
    hinttype = '0',
    titlesize = item.type === 34 ? '1' : '0',
    titlestyle = '0000',
    titlecolor = 'var(--color-text-primary)',
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

  const currentErrorItem = getCurrentErrorItem({
    currentErrorItem: currentErrorItemProp,
    errorItems,
    uniqueErrorItems,
    item,
  });
  const isLoading = getLoading({ loading, loadingItems, item });
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
        $item={item}
        $showTitle={showTitle}
        $displayRow={widgetStyle.displayRow}
        $titlewidth_pc={widgetStyle.titlewidth_pc}
        $align_pc={widgetStyle.align_pc}
        $titleSize={titleSize}
        $titlesize={titlesize}
        $titleStyle={titleStyle}
        $titleColor={titlecolor}
        $hasContent={showDesc || showOtherIcon || showTitle}
      >
        {isLoading ? (
          <div className="requiredBtnBox">
            <i className="icon-loading_button customFormItemLoading textTertiary" />
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
              className="Hand Font16 mLeft3 textTertiary mTop3"
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
}

export default memo(FormLabel, arePropsEqual);
