import React, { Fragment, memo } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, PopupWrapper } from 'ming-ui';

const MoreButtonWrapper = styled.div`
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #9d9d9d;
  font-size: 18px;
  ${props =>
    props.showType === 'icon'
      ? `
          flex: 1;
          padding: 0 8px;
        `
      : `
          width: 32px;
          height: 32px;
          border-radius: 3px;
          ${props.showType === 'standard' && 'border: 1px solid #DDDDDD;'}
        `}
`;

const MoreButtonPopupContent = styled.div`
  padding: 0 18px 12px;
`;

const MoreButtonPopup = props => {
  const { title, showMore, showType, children } = props;

  const [{ visible }, setState] = useSetState({
    visible: false,
  });

  const handleClose = () => {
    setState({ visible: false });
  };

  const handleClick = () => {
    setState({ visible: true });
  };

  return (
    <Fragment>
      {showMore && (
        <MoreButtonWrapper showType={showType} onClick={handleClick}>
          <Icon icon="more_horiz" />
        </MoreButtonWrapper>
      )}
      <PopupWrapper
        bodyClassName="autoHeightPopupBody"
        title={title}
        visible={visible}
        headerType="withIcon"
        headerTitleAlign="left"
        onClose={handleClose}
      >
        <MoreButtonPopupContent>{children}</MoreButtonPopupContent>
      </PopupWrapper>
    </Fragment>
  );
};

export default memo(MoreButtonPopup);
