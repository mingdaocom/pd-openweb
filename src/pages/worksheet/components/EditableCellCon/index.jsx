import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import withClickAway from 'ming-ui/decorators/withClickAway';
import styled from 'styled-components';
import './EditableCellCon.less';

const ReadOnlyTip = styled.div`
  display: none;
  border: 2px solid #2d7ff9;
  position: absolute;
  left: 0px;
  right: 0px;
  top: 100%;
  border-top: none;
  margin-top: -2px;
  background: #fff;
  padding: 0 6px;
  color: #9d9d9d;
`;

function EditableCellCon(props) {
  const {
    className,
    style,
    error,
    iconName,
    iconClassName,
    editable,
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
        {/* {!editable && (
          <ReadOnlyTip className="readOnlyTip">
            {_l('当前字段不可编辑')}
          </ReadOnlyTip>
        )} */}
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
