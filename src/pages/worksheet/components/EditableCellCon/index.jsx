import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import withClickAway from 'ming-ui/decorators/withClickAway';
import './EditableCellCon.less';

function EditableCellCon(props) {
  const {
    className,
    style,
    error,
    iconName,
    iconClassName,
    isediting,
    popupContainer,
    onIconClick,
    children,
    conRef,
    iconRef,
    hideOutline,
    onClick,
    onClear,
  } = props;
  return (
    <Trigger
      zIndex={99}
      popup={<div className="cellControlErrorTip">{error}</div>}
      getPopupContainer={() => popupContainer}
      popupClassName="filterTrigger"
      popupVisible={!!error}
      destroyPopupOnHide
      popupAlign={{
        points: ['tl', 'bl'],
      }}
    >
      <div
        className={cx('editableCellCon', className, {
          cellControlEdittingStatus: !hideOutline && isediting,
          cellControlErrorStatus: !hideOutline && error,
          isediting,
        })}
        ref={conRef}
        style={style}
        onClick={onClick}
      >
        {children}
        {!isediting && (
          <span
            className={cx('editIcon Gray_9e ThemeHoverColor3', { canClear: !!onClear })}
            onClick={e => {
              e.stopPropagation();
              if (onClear) {
                onClear();
              } else {
                onIconClick(e);
              }
            }}
          >
            <i ref={iconRef} className={`editbtn icon icon-${iconName} Font16 Hand ${iconClassName}`} />
            <i
              ref={iconRef}
              className={`clearbtn icon icon-cancel Font16 Hand ${iconClassName}`}
              onClick={e => {
                e.stopPropagation();
                onClear();
              }}
            />
          </span>
        )}
        <span className="ghostAngle"></span>
      </div>
    </Trigger>
  );
}

export default props => {
  const Comp = props.clickAwayWrap ? withClickAway(EditableCellCon) : EditableCellCon;
  return <Comp {...props} />;
};

EditableCellCon.propTypes = {
  className: PropTypes.string,
  iconClassName: PropTypes.string,
  style: PropTypes.shape({}),
  iconName: PropTypes.string,
  isediting: PropTypes.bool,
  onIconClick: PropTypes.func,
  onClick: PropTypes.func,
  onClear: PropTypes.func,
  children: PropTypes.node,
};
