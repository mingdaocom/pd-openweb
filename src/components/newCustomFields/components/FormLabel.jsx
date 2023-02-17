import React, { Fragment } from 'react';
import { Tooltip } from 'ming-ui';
import cx from 'classnames';
import { controlState, renderCount } from '../tools/utils';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT, FROM } from '../tools/config';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
import RefreshBtn from './RefreshBtn';
import WidgetsDesc from './WidgetsDesc';

export default ({
  from,
  worksheetId,
  recordId,
  item,
  errorItems,
  uniqueErrorItems,
  loadingItems,
  updateErrorState = () => {},
  handleChange = () => {},
}) => {
  const currentErrorItem = _.find(errorItems.concat(uniqueErrorItems), obj => obj.controlId === item.controlId) || {};
  const errorText = currentErrorItem.errorText || '';
  const isEditable = controlState(item, from).editable;
  const showTitle = _.includes([22, 10010], item.type)
    ? (item.advancedSetting || {}).hidetitle !== '1' && item.controlName
    : (item.advancedSetting || {}).hidetitle !== '1';
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
      <Fragment>
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
          >
            <i className="icon-workflow_error pointer Font16 Gray_9e mBottom10" />
          </Tooltip>
        )}

        {!item.showTitle && errorMessage && (
          <div className="customFormErrorMessage">
            <span>
              {errorMessage}
              <i className="icon-close mLeft6 Bold delIcon" onClick={() => updateErrorState(false, item.controlId)} />
            </span>
            <i className="customFormErrorArrow" />
          </div>
        )}
      </Fragment>
    );
  }

  return (
    <Fragment>
      <div
        className={cx(
          'customFormItemLabel',
          item.type === 22 || item.type === 34
            ? `Gray Font15 ${item.type === 34 ? 'mTop20' : 'mTop10'}`
            : 'Gray_75 Font13',
        )}
      >
        {item.required && !item.disabled && isEditable && (
          <div className="Absolute" style={{ margin: '3px 0px 0px -8px', top: 0, color: '#f44336' }}>
            *
          </div>
        )}

        {errorMessage && (
          <div className="customFormErrorMessage">
            <span>
              {errorMessage}
              <i className="icon-close mLeft6 Bold delIcon" onClick={() => updateErrorState(false, item.controlId)} />
            </span>
            <i className="customFormErrorArrow" />
          </div>
        )}

        <div title={item.controlName} className={cx({ hideTitleLabel: !showTitle })}>
          {item.controlName}
          {renderCount(item)}
        </div>

        {(recordId || item.isSubList) && <WidgetsDesc item={item} from={from} />}

        {from !== FROM.DRAFT && !_.get(window, 'shareState.isPublicView') && (
          <RefreshBtn worksheetId={worksheetId} recordId={recordId} item={item} onChange={handleChange} />
        )}

        <div className={cx('mLeft6', { Hidden: !loadingItems[item.controlId] })}>
          <i className="icon-loading_button customFormItemLoading Gray_9e" />
        </div>
      </div>

      {item.type === 34 && !item.isSubList && !recordId && <WidgetsDesc item={item} from={from} />}
    </Fragment>
  );
};
