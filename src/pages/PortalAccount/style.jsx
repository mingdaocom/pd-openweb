import styled from 'styled-components';

export const FixedContent = styled.div`
  width: 100%;
  box-sizing: border-box;
  height: calc(100% - 80px);
  overflow-y: auto;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 31px;
  .iconInfo {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    text-align: center;
    background-color: #f5f5f5;
    .Font48 {
      font-size: 48px;
    }
    i {
      line-height: 110px;
    }
  }
  .fixeding {
    color: #333;
    font-size: 17px;
    font-weight: 600;
  }
  .fixedInfo {
    color: #9e9e9e;
    font-size: 14px;
  }
  .fixRemark {
    font-size: 13px;
    color: #333;
    font-weight: 600;
  }
`;
