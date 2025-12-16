import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { func, shape, string } from 'prop-types';
import { Input, Menu, MenuItem } from 'ming-ui';
import { VerticalMiddle } from 'worksheet/components/Basics';
import { getIconByType } from 'src/pages/widgetConfig/util';
import '../WorkSheetFilter.less';

export default function SelectControls(props) {
  const {
    style,
    maxHeight,
    footer,
    className,
    filterColumnClassName,
    selected = [],
    onAdd = () => {},
    onClose = () => {},
  } = props;
  const inputRef = useRef(null);
  const [keyword, setKeyword] = useState('');
  const controls = keyword
    ? props.controls.filter(c => c.controlName.toLowerCase().indexOf(keyword.toLowerCase()) > -1)
    : props.controls;

  useEffect(() => {
    // 延迟聚焦，防止页面重排，导致外层滚动条跳动
    if (inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className={cx('addFilterPopup', className)} style={style}>
      <div className="columnsFilter">
        <i className="icon-search"></i>
        <Input
          placeholder={_l('搜索字段')}
          manualRef={inputRef}
          value={keyword}
          onChange={() => {
            setKeyword(inputRef.current.value);
          }}
        />
      </div>
      <Menu
        className={cx('worksheetFilterColumnOptionList', filterColumnClassName)}
        onClickAwayExceptions={['.columnsFilter']}
        onClickAway={() => {
          setKeyword('');
          onClose();
        }}
        style={{ ...style, maxHeight: maxHeight ? maxHeight - 90 : undefined }}
      >
        {controls.length ? (
          controls.map((c, i) => (
            <MenuItem
              className={cx({ segmentationLine: 'segmentation' in c, selected: _.includes(selected, c.controlId) })}
              title={c.controlName}
              onClick={() => {
                onAdd(c);
                setKeyword('');
              }}
              key={i}
            >
              <VerticalMiddle>
                <i className={cx('Font16 icon', `icon-${getIconByType(c.originType === 37 ? 37 : c.type)}`)}></i>
                <span className="ellipsis">{c.controlName}</span>
              </VerticalMiddle>
            </MenuItem>
          ))
        ) : (
          <div className="tip TxtCenter">{keyword ? _l('没有搜索结果') : _l('没有更多字段')}</div>
        )}
      </Menu>
      {footer}
    </div>
  );
}

SelectControls.propTypes = {
  style: shape({}),
  classNamePopup: string,
  filterColumnClassName: string,
  onAdd: func,
  onClose: func,
};
