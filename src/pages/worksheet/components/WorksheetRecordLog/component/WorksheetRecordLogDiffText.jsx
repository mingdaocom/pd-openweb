import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog } from 'ming-ui';
import cx from 'classnames';
import filterXSS from 'xss';
import _ from 'lodash';
import { diffChars } from 'diff';
import WorksheetRecordLogSelectTags from './WorksheetRecordLogSelectTags';
import { browserIsMobile } from 'src/util';
import '../WorksheetRecordLogValue.less';

const TEXT_MAX_LENGTH = 500;

const renderDiffText = props => {
  return (
    <span
      className={cx({
        added: props.added,
        removed: props.removed,
      })}
    >
      {props.value}
    </span>
  );
};

function WorksheetRecordLogDiffText(props) {
  const { oldValue, newValue, type = 'text', control } = props;
  const [open, setOpen] = useState(false);
  const [needOpen, setNeedOpen] = useState(false);
  const [dialog, setDialog] = useState(false);
  const textRef = useRef(null);
  const isMobile = browserIsMobile();
  const [diffCount, setDiffCount] = useState(1);

  let diff = null;
  let _oldValue = oldValue.slice(0, TEXT_MAX_LENGTH);
  let _newValue = newValue.slice(0, TEXT_MAX_LENGTH);
  if (type === 'rich_text') {
    diff = diffChars(
      _oldValue.replace(/<[^>]+>|&[^>]+;/g, '').trim(),
      _newValue.replace(/<[^>]+>|&[^>]+;/g, '').trim(),
    );
  } else {
    diff = diffChars(_oldValue, _newValue);
  }
  const [diff2, setDiff2] = useState(diff);

  if (control && control.enumDefault === 2) {
    return (
      <WorksheetRecordLogSelectTags
        type="rect"
        oldValue={[oldValue]}
        newValue={[newValue]}
        needPreview={false}
        control={control}
      />
    );
  }

  useEffect(() => {
    let textComputeStyle = getComputedStyle(textRef.current);
    let textHeight = Number(textComputeStyle.height.replace('px', ''));
    let lineHeight = Number(textComputeStyle.lineHeight.replace('px', ''));
    if (textHeight > lineHeight * 5) {
      setNeedOpen(true);
    }
  }, []);

  const clickHandle = sign => {
    if (sign === 0) {
      setOpen(false);
      return;
    }
    if (sign === 1) {
      if(oldValue.length > diffCount*500 || newValue.length > diffCount*500) {
        let _diff = null;
        setOpen(true);
        let preDiffCount = diffCount;
        setDiffCount(preDiffCount + 1);
        let _oldValue = oldValue.slice(preDiffCount * 500, (preDiffCount + 1) * 500);
        let _newValue = newValue.slice(preDiffCount * 500, (preDiffCount + 1) * 500);
        if (type === 'rich_text') {
          _diff = diff2.concat(
            diffChars(_oldValue.replace(/<[^>]+>|&[^>]+;/g, '').trim(), _newValue.replace(/<[^>]+>|&[^>]+;/g, '').trim()),
          );
        } else {
          _diff = diff2.concat(diffChars(_oldValue, _newValue));
        }
        setDiff2(_diff);
      } else {
        setOpen(true);
      }
    }
  };
  const closeDialog = () => setDialog(false);

  let renderDiff = useMemo(() => {
    if (!diff2) return null;
    return diff2.map((item, index) => (
      <React.Fragment key={`renderDiffText-${item.value}-${index}`}>{renderDiffText(item)}</React.Fragment>
    ));
  }, [diff2]);

  return (
    <React.Fragment>
      <div
        ref={textRef}
        className={cx(`WorksheetRecordLogDiffText paddingLeft27`, {
          mobileLogDiffText: isMobile,
          height100: isMobile && needOpen && !open,
          noHeight: isMobile && needOpen && open,
          ellipsis5: needOpen && !open,
        })}
      >
        {renderDiff}
      </div>
      {(needOpen || type === 'rich_text') && (
        <div className="WorksheetRecordLogDiffTextBottomButtons paddingLeft27">
          {needOpen ? (
            <div>
              {open && (
                <span className="WorksheetRecordLogOpen mRight25" onClick={() => clickHandle(0)}>
                  {_l('收起')}
                </span>
              )}
              {(oldValue.length > diffCount * 500 || newValue.length > diffCount * 500 || !open) && (
                <span className="WorksheetRecordLogOpen" onClick={() => clickHandle(1)}>
                  {_l('查看更多')}
                </span>
              )}
            </div>
          ) : (
            <span></span>
          )}
          {type === 'rich_text' ? (
            <span className={cx('WorksheetRecordLogOpen', { hideEle: isMobile })} onClick={() => setDialog(true)}>
              {_l('以富文本查看')}
            </span>
          ) : (
            <span></span>
          )}
        </div>
      )}
      {type === 'rich_text' && (
        <Dialog
          title={
            <div className="richTextHeader">
              <div className="leftCon">
                <div className="title">{_l('修改前')}</div>
              </div>
              <div className="rightCon">
                <div className="title">{_l('修改后')}</div>
              </div>
            </div>
          }
          style={{ width: '90%', height: '90%', minHeight: '90%' }}
          className="richTextDiffDialog"
          visible={dialog}
          onCancel={closeDialog}
        >
          <div className="richTextContent flexRow flex">
            <div className="leftCon">
              <div className="contentCon" dangerouslySetInnerHTML={{ __html: filterXSS(oldValue) }} />
            </div>
            <div className="rightCon">
              <div className="contentCon" dangerouslySetInnerHTML={{ __html: filterXSS(newValue) }} />
            </div>
          </div>
        </Dialog>
      )}
    </React.Fragment>
  );
}

export default React.memo(WorksheetRecordLogDiffText, (prevProps, nextProps) => {
  let preType = prevProps.type || 'text';
  let nextType = prevProps.type || 'text';

  if (
    preType === nextType &&
    _.isEqual(prevProps.control, nextProps.control) &&
    prevProps.oldValue === nextProps.oldValue &&
    prevProps.newValue === nextProps.newValue
  ) {
    return true;
  }
  return false;
});
