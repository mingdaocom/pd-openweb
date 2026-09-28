import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { func, shape, string } from 'prop-types';
import { Input, Menu } from 'ming-ui/antd-components';
import { getIconByType } from 'src/utils/domain/control/metadata';
import '../WorkSheetFilter.less';

export default function SelectControls(props) {
  const { style, maxHeight, footer, className, filterColumnClassName, selected = [], onAdd = () => {} } = props;
  const inputRef = useRef(null);
  const [keyword, setKeyword] = useState('');
  const controls = keyword
    ? props.controls.filter(c => c.controlName.toLowerCase().indexOf(keyword.toLowerCase()) > -1)
    : props.controls;
  const menuItems = controls.flatMap((control, index) => {
    const controlItem = {
      key: control.controlId,
      title: control.controlName,
      icon: (
        <i
          className={cx(
            'Font16 icon textTertiary',
            `icon-${getIconByType(control.originType === 37 ? 37 : control.type)}`,
          )}
        />
      ),
      label: <span className="ellipsis">{control.controlName}</span>,
      onClick: () => {
        onAdd(control);
        setKeyword('');
      },
    };

    return control.segmentation && index > 0
      ? [{ key: `${control.controlId}-divider`, type: 'divider', className: 'mTop8 mBottom8' }, controlItem]
      : [controlItem];
  });

  useEffect(() => {
    // 延迟聚焦，防止页面重排，导致外层滚动条跳动
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cx('addFilterPopup', className)} style={style}>
      <div className="columnsFilter">
        <Input
          style={{ '--hap-input-padding-block': '10px' }}
          ref={inputRef}
          className="flex"
          variant="borderless"
          prefix={<i className="icon-search textTertiary Font18" />}
          placeholder={_l('搜索字段')}
          value={keyword}
          onChange={event => setKeyword(event.target.value)}
        />
      </div>
      {controls.length ? (
        <Menu
          className={cx('worksheetFilterColumnOptionList', filterColumnClassName)}
          items={menuItems}
          selectedKeys={_.castArray(selected)}
          style={{ ...style, maxHeight: maxHeight ? maxHeight - 90 : undefined }}
        />
      ) : (
        <div className="tip TxtCenter">{keyword ? _l('没有搜索结果') : _l('没有更多字段')}</div>
      )}
      {footer}
    </div>
  );
}

SelectControls.propTypes = {
  style: shape({}),
  classNamePopup: string,
  filterColumnClassName: string,
  onAdd: func,
};
