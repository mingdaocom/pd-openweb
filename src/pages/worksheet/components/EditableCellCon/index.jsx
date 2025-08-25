import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import withClickAway from 'ming-ui/decorators/withClickAway';
import './EditableCellCon.less';

const Con = styled.div`
  .editIcon {
    position: absolute;
    right: 4px;
    top: 4px;
    width: 24px;
    height: 24px;
    border-radius: 3px;
    background: #fff;
    justify-content: center;
    align-items: center;
  }
`;
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
      <Con
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
                if (onClear) {
                  onClear();
                }
              }}
            />
          </span>
        )}
        {/* {!editable && (
          <ReadOnlyTip className="readOnlyTip">
            {_l('当前字段不可编辑')}
          </ReadOnlyTip>
        )} */}
      </Con>
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
