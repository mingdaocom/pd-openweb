import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';
import RelationSearchCount from '../../components/RelationSearchCount';
import WidgetsDesc from '../../components/WidgetsDesc';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT, FROM } from '../../core/config';
import { HAVE_VALUE_STYLE_WIDGET } from '../../core/enum';
import { controlState, renderCount } from '../../core/utils';
import { TITLE_SIZE_OPTIONS } from '../tools/config';
import { getTitleStyle, isSheetDisplay } from '../tools/utils';

const ControlLabel = styled.div`
  ${({ displayRow, titlewidth_app = '100' }) => {
    if (displayRow) {
      return `width: ${titlewidth_app}px !important;`;
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
  ${({ item, showTitle }) =>
    item.type === 34 && showTitle ? 'margin-bottom: 6px;margin-top:20px;' : 'min-height: 0px !important;'}
  ${({ withSearchInput,showTitle }) =>
    withSearchInput && showTitle ? 'margin-bottom: 6px;margin-top:10px;' : 'min-height: 0px !important;'}
  .controlLabelName {
    ${({ displayRow, align_app = '1', showTitle }) => {
      if (displayRow) {
        return align_app === '1' ? 'text-align: left;' : 'text-align: right;flex: 1;';
      } else {
        if (!showTitle) {
          return 'visibility: hidden;';
        }
      }
    }}
    font-size: ${props => props.titleSize || '0.8em'};
    color: ${props => props.titleColor || 'var(--gray-75)'};
    ${props => props.titleStyle || ''};
  }
  .requiredBtnBox .customFormItemLoading {
    line-height: ${({ valuesize }) => {
      const valueHeight = valuesize !== '0' ? (parseInt(valuesize) - 1) * 2 + 40 : 36;
      return `${valueHeight - 12}px !important`;
    }};
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
  formDisabled,
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
    showtype,
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
  const isEditable = (item.required && required === '1') || controlState(item, from).editable;
  const withSearchInput =
    [29, 51].includes(item.type) &&
    disabled &&
    formDisabled &&
    item.enumDefault === 2 &&
    (parseInt(showtype, 10) === 1 ||
      (_.includes([FROM.H5_ADD, FROM.H5_EDIT, FROM.RECORDINFO, FROM.DRAFT], from) && parseInt(showtype, 10) === 2));

  let showCount = _.get(item, 'advancedSetting.showcount') !== '1' && !_.get(item, 'advancedSetting.layercontrolid');
  let errorMessage = '';

  if (currentErrorItem.showError && isEditable) {
    if (currentErrorItem.errorType === FORM_ERROR_TYPE.UNIQUE) {
      errorMessage = currentErrorItem.errorMessage || FORM_ERROR_TYPE_TEXT.UNIQUE(item);
    } else {
      errorMessage = errorText || currentErrorItem.errorMessage;
    }
  }

  if (!showTitle) {
    return (
      <div className={cx({ 'customFormItemLabel mTop20': item.type === 34 })}>
        {!item.showTitle && item.required && !item.disabled && isEditable && (
          <span
            style={{
              margin: item.desc && !_.includes([FROM.H5_ADD], from) ? '0px 0px 0px -8px' : '0px 0px 0px -13px',
              top: item.desc && !_.includes([FROM.H5_ADD], from) ? '9px' : '15px',
              color: 'var(--color-error)',
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
          >
            <i className="icon-workflow_error pointer Font16 Gray_9e mBottom10" />
          </Tooltip>
        )}

        {!item.showTitle && errorMessage && (
          <div className="customFormErrorMessage">
            <span>{errorMessage}</span>
            <i className="customFormErrorArrow" />
          </div>
        )}
      </div>
    );
  }

  return (
    <Fragment>
      {errorMessage && (
        <div className={cx('customFormErrorMessage', { isChildTable: item.type === 34 })}>
          <span>{errorMessage}</span>
          <i className="customFormErrorArrow" />
        </div>
      )}
      <ControlLabel
        className="customFormItemLabel"
        disabled={disabled}
        item={item}
        showTitle={showTitle}
        {...widgetStyle}
        titleSize={titleSize}
        titleStyle={titleStyle}
        titleColor={titlecolor}
        valuesize={_.includes(HAVE_VALUE_STYLE_WIDGET, item.type) ? valuesize : '0'}
        hasContent={showDesc || showOtherIcon || showTitle}
        withSearchInput={withSearchInput}
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
            style={{ paddingRight: recordId ? 100 : 40 }}
          >
            <div className="flex ellipsis">{item.controlName}</div>
            {showCount && renderCount(item)}
          </div>
        )}

        {hintShowAsIcon && <WidgetsDesc item={item} from={from} />}

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
