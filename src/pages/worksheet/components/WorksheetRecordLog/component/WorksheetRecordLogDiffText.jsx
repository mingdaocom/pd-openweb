import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'ming-ui';
import cx from 'classnames';
import filterXSS from 'xss';
import _ from 'lodash';
import { diffChars } from 'diff';
import WorksheetRecordLogSelectTags from './WorksheetRecordLogSelectTags';
import { browserIsMobile } from 'src/util';
import '../WorksheetRecordLogValue.less';

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
  let diff = null;
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
  if (type === 'rich_text') {
    diff = diffChars(oldValue.replace(/<[^>]+>|&[^>]+;/g, '').trim(), newValue.replace(/<[^>]+>|&[^>]+;/g, '').trim());
  } else {
    diff = diffChars(oldValue, newValue);
  }

  useEffect(() => {
    let textComputeStyle = getComputedStyle(textRef.current);
    let textHeight = Number(textComputeStyle.height.replace('px', ''));
    let lineHeight = Number(textComputeStyle.lineHeight.replace('px', ''));
    if (textHeight > lineHeight * 5) {
      setNeedOpen(true);
    }
  }, []);

  const clickHandle = () => setOpen(!open);
  const closeDialog = () => setDialog(false);

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
        {diff && diff.map((item, index) => (
          <React.Fragment key={`renderDiffText-${item.value}-${index}`}>
            {renderDiffText(item)}
          </React.Fragment>
        ))}
      </div>
      {(needOpen || type === 'rich_text') && (
        <div className="WorksheetRecordLogDiffTextBottomButtons paddingLeft27">
          {needOpen ? (
            <span className="WorksheetRecordLogOpen" onClick={clickHandle}>
              {open ? _l('收起') : _l('展开')}
            </span>
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

export default WorksheetRecordLogDiffText;
