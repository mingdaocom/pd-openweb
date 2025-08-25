import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';

const ViewMoreLink = styled.div`
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s ease;
  height: 40px;
  line-height: 40px;
`;

const ViewMore = ({ onClick, disabled }) => {
  return (
    <ViewMoreLink
      className={cx('w100 Gray_75 TxtCenter Bold Font13 ', { 'ThemeHoverColor3 Hand': !disabled })}
      onClick={onClick}
    >
      {_l('查看更多')}
    </ViewMoreLink>
  );
};

export default ViewMore;
