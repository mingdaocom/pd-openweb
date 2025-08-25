import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Icon from 'ming-ui/components/Icon';

function SiderTabItem(props) {
  const { name, isActive, clickHandler, icon, tip } = props;
  const cls = cx('list-item', {
    'list-item-active': isActive,
  });
  const style = icon ? { overflow: 'visible' } : {};
  return (
    <React.Fragment>
      <div className={cls} onClick={clickHandler} style={style}>
        {name}
        {icon ? (
          <span className="tip-bottom mLeft5 LineHeight16 item-tip" data-tip={tip}>
            <Icon icon={icon} className="Font16" />
          </span>
        ) : null}
      </div>
    </React.Fragment>
  );
}

SiderTabItem.propTypes = {
  name: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  clickHandler: PropTypes.func.isRequired,

  icon: PropTypes.string,
  tip: PropTypes.string,
};

export default SiderTabItem;
