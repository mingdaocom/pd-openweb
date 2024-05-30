import React, { useState, useEffect, Fragment } from 'react';
import Trigger from 'rc-trigger';
import { Icon, Menu, MenuItem } from 'ming-ui';
import instance from 'src/pages/workflow/api/instance';
import cx from 'classnames';

export default ({ className, hideIcon = false, archivedId = '', onChange = () => {} }) => {
  const [showList, setShowList] = useState(false);
  const [list, setList] = useState([]);
  const [selectId, setSelectId] = useState(archivedId);
  const onSelect = (item = {}) => {
    setSelectId(item.id);
    onChange(item.id);
    setShowList(false);
  };

  useEffect(() => {
    instance.getArchivedList().then(res => {
      setList(res);
    });
  }, []);

  if (!list.length) return null;

  return (
    <Trigger
      popupVisible={showList}
      onPopupVisibleChange={visible => setShowList(visible)}
      action={['click']}
      popup={() => {
        return (
          <Menu>
            {list.map((item, index) => (
              <MenuItem key={index} disabled={item.id === selectId} onClick={() => onSelect(item)}>
                {item.text}
              </MenuItem>
            ))}
            {selectId && (
              <Fragment>
                <div style={{ height: 1, background: '#bdbdbd' }} />
                <MenuItem onClick={() => onSelect()}>{_l('清除')}</MenuItem>
              </Fragment>
            )}
          </Menu>
        );
      }}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [0, 10],
        overflow: { adjustX: true, adjustY: true },
      }}
    >
      <span
        className={cx(
          'pointer Gray_9e InlineFlex alignItemCenter',
          selectId ? 'ThemeColor3' : 'ThemeHoverColor3',
          className,
        )}
        data-tip={selectId && !showList ? list.find(o => o.id === selectId).text : ''}
      >
        {!hideIcon && <Icon icon="drafts_approval mRight8" className="Font22" />}
        <span className="Font14">{_l('归档')}</span>
      </span>
    </Trigger>
  );
};
