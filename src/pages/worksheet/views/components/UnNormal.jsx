import React from 'react';
import styled from 'styled-components';
import alreadyDelete from 'src/pages/worksheet/assets/alreadyDelete.png';
import withoutPermission from 'src/pages/worksheet/assets/withoutPermission.png';

const UnNormalWrap = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;
  .unNormalContent {
    flex:1;
    margin: 15px;
    border-radius: 4px;
    background: #fff;
    justify-content: center;
    align-items: center;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.16);
  }
  .unNormalText {
    margin: 15px 0 20px;
    font-size: 17px;
    color: #333;
  }
  img {
    width: 110px;
  }
`;

const CODE_TYPE = {
  4: {
    src: alreadyDelete,
    text: _l('视图已删除'),
  },
  7: {
    src: withoutPermission,
    text: _l('视图无权限'),
  }
}

const UnNormal = props => {
  const { resultCode } = props;
  const { src, text } = CODE_TYPE[resultCode] || { src: alreadyDelete, text: _l('视图无权限或者已删除') };

  return (
    <UnNormalWrap>
      <div className="unNormalContent flexColumn">
        <img src={src} />
        <p className="unNormalText">{text}</p>
      </div>
    </UnNormalWrap>
  );
};

export default UnNormal;
