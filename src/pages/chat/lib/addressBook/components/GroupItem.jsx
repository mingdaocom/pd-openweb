import React from 'react';
import cx from 'classnames';

export default function GroupItem(props) {
  const { avatar, name, isOpen, groupId, groupMemberCount, isSelected, itemClickHandler } = props;
  const className = cx('list-item Font13 Hand', {
    'Gray_bd disabled': !isOpen,
    ThemeBGColor6: isSelected,
  });
  const style = !isOpen ? { opacity: 0.5 } : null;
  return (
    <div
      className={className}
      onClick={() => {
        itemClickHandler(groupId);
      }}
    >
      <img src={avatar} placeholder={'/staticfiles/images/blank.gif'} className="list-item-avatar" style={style} />
      <span className="list-item-name" title={name}>
        {name}
      </span>
      {isOpen ? null : <span className="pLeft5 group-tip">{_l('(已关闭)')}</span>}
      <span className="Gray_bd pLeft5">{groupMemberCount}</span>
    </div>
  );
}
