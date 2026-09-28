import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ClickAway from 'ming-ui/components/ClickAway';
import './EditableCellCon.less';

const Con = styled.div`
  .editIcon {
    position: absolute;
    right: 4px;
    top: 4px;
    width: 24px;
    height: 24px;
    border-radius: 3px;
    background: var(--color-background-primary);
    justify-content: center;
    align-items: center;
  }
`;

function EditableCellCon(props) {
  const {
    className,
    style,
    iconName,
    iconClassName,
    isediting,
    onIconClick,
    children,
    conRef,
    iconRef,
    hideOutline,
    onClick,
    onClear,
  } = props;
  return (
    <Con
      className={cx('editableCellCon', className, {
        cellControlEdittingStatus: !hideOutline && isediting,
        isediting,
      })}
      ref={conRef}
      style={style}
      onClick={onClick}
    >
      {children}
      {!isediting && (
        <span
          className={cx('editIcon textTertiary hoverColorPrimary', { canClear: !!onClear })}
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
  );
}

const ClickAwayEditableCellCon = ClickAway.wrap(EditableCellCon);

const EditableCellConWrapper = React.forwardRef((props, ref) => {
  const Comp = props.clickAwayWrap ? ClickAwayEditableCellCon : EditableCellCon;
  return <Comp {...props} conRef={ref || props.conRef} />;
});

EditableCellConWrapper.displayName = 'EditableCellConWrapper';

export default EditableCellConWrapper;

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
