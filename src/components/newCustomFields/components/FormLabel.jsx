import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';
import { RELATE_RECORD_SHOW_TYPE, RELATION_SEARCH_SHOW_TYPE } from 'worksheet/constants/enum';
import { TITLE_SIZE_OPTIONS } from 'src/pages/widgetConfig/config/setting';
import { canSetWidgetStyle, getTitleStyle } from 'src/pages/widgetConfig/util/setting';
import { browserIsMobile } from 'src/utils/common';
import { isSheetDisplay } from '../../../pages/widgetConfig/util';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT, FROM } from '../tools/config';
import { controlState, renderCount } from '../tools/utils';
import RelationSearchCount from './RelationSearchCount';
import WidgetsDesc from './WidgetsDesc';

const ControlLabel = styled.div`
  ${({ displayRow, isMobile, titlewidth_app = '100', titlewidth_pc = '100' }) => {
    if (displayRow) {
      if (isMobile) {
        return `width: ${titlewidth_app}px !important;`;
      }
      return !isMobile ? `width:${titlewidth_pc}px !important;` : '';
    }
  }}
  ${({ hasContent, displayRow, titlewidth_pc }) => {
    if (displayRow && hasContent) {
      return titlewidth_pc === '0' ? 'width: auto !important;padding-right: 10px;' : 'padding-right: 10px;';
    }
  }}
  ${({ displayRow }) => (displayRow ? 'padding-top: 6px !important;padding-bottom: 6px !important;' : '')}
  line-height: ${({ valuesize }) => {
    const valueHeight = valuesize !== '0' ? (parseInt(valuesize) - 1) * 2 + 40 : 36;
    return `${valueHeight - 12}px !important`;
  }}
  ${({ item, isMobile, showTitle }) =>
    item.type === 34 && showTitle
      ? isMobile
        ? 'margin-bottom: 6px;margin-top:20px;'
        : 'maxWidth: calc(100% - 140px);margin-top:20px;'
      : 'min-height: 0px !important;'}
  .controlLabelName {
    ${({ displayRow, isMobile, align_app = '1', align_pc = '1', showTitle }) => {
      if (displayRow) {
        if (isMobile) {
          return align_app === '1' ? 'text-align: left;' : 'text-align: right;flex: 1;';
        }
        if (!showTitle) {
          return 'display: none;';
        }
        return !isMobile && align_pc === '1' ? 'text-align: left;' : 'text-align: right;flex: 1;';
      } else {
        if (!showTitle) {
          return 'visibility: hidden;';
        }
      }
    }}
    font-size: ${props => props.titleSize};
    color: ${props => props.titleColor};
    ${props => props.titleStyle || ''};
  }
  .requiredBtnBox .customFormItemLoading {
    line-height: ${({ valuesize }) => {
      const valueHeight = valuesize !== '0' ? (parseInt(valuesize) - 1) * 2 + 40 : 36;
      return `${valueHeight - 12}px !important`;
    }};
  }
  &.isRelateRecordTable,
  &.isRelationSearchTable {
    .controlLabelName {
      margin: 14px 0 0;
      font-size: 15px;
      color: #151515;
    }
    .descBoxInfo {
      margin: 14px 0 0;
    }
  }
`;

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
    titlecolor = item.type === 34 ? '#151515' : '#757575',
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
  const isMobile = browserIsMobile();

  if (currentErrorItem.showError && isEditable) {
    if (currentErrorItem.errorType === FORM_ERROR_TYPE.UNIQUE) {
      errorMessage = currentErrorItem.errorMessage || FORM_ERROR_TYPE_TEXT.UNIQUE(item);
    } else {
      errorMessage = errorText || currentErrorItem.errorMessage;
    }
  }

  if (isMobile && !showTitle) {
    return (
      <div className={cx({ 'customFormItemLabel mTop20': item.type === 34 })}>
        {!item.showTitle && item.required && !item.disabled && isEditable && (
          <span
            style={{
              margin: item.desc && !_.includes([FROM.H5_ADD], from) ? '0px 0px 0px -8px' : '0px 0px 0px -13px',
              top: item.desc && !_.includes([FROM.H5_ADD], from) ? '9px' : '15px',
              color: '#f44336',
              position: 'absolute',
            }}
          >
            *
          </span>
        )}

        {item.desc && !_.includes([FROM.H5_ADD], from) && (
          <Tooltip
            text={
              <span
                className="Block"
                style={{
                  maxWidth: 230,
                  maxHeight: 200,
                  overflowY: 'auto',
                  color: '#fff',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {item.desc}
              </span>
            }
            action={['click']}
            popupPlacement={'topLeft'}
            offset={[-12, 0]}
            autoCloseDelay={0}
          >
            <i className="icon-info_outline pointer Font16 Gray_9e mBottom10" />
          </Tooltip>
        )}

        {!item.showTitle && errorMessage && (
          <div className={cx('customFormErrorMessage', { ignoreErrorMessage: currentErrorItem.ignoreErrorMessage })}>
            <span>
              {errorMessage}
              <i className="icon-close mLeft6 Bold delIcon" onClick={() => updateErrorState(false, item.controlId)} />
            </span>
            <i className="customFormErrorArrow" />
          </div>
        )}
      </div>
    );
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
        isMobile={isMobile}
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
          <div
            title={item.controlName}
            className="controlLabelName flexRow"
            style={isMobile ? { paddingRight: recordId ? 100 : 40 } : {}}
          >
            <div className="flex ellipsis">{item.controlName}</div>
            {showCount && renderCount(item)}
          </div>
        )}

        {(item.type === 34 ? hintShowAsIcon && showTitle : hintShowAsIcon) && <WidgetsDesc item={item} from={from} />}

        {item.type === 45 && allowlink === '1' && item.enumDefault === 1 && (
          <Tooltip text={<span>{_l('新页面打开')}</span>}>
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
