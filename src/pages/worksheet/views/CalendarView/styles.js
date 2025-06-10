import styled from 'styled-components';

export const Wrap = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;
`;

export const WrapChoose = styled.div`
  width: 200px;
  background: #ffffff;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.24);
  opacity: 1;
  border-radius: 2px;
  padding: 6px 0;
  .setLi {
    height: 36px;
    line-height: 36px;
    padding: 0 16px;
    &:hover {
      background: #f5f5f5;
    }
  }
`;

export const WrapNum = styled.div`
  position: relative;
  width: 20px;
  text-align: center;
  line-height: 20px;
  .txt {
    display: block;
  }
  .add {
    position: absolute;
    left: 50%;
    top: 50%;
    opacity: 0;
    transform: translate(-50%, -50%);
  }
  &.canAdd {
    &:hover {
      .add {
        line-height: 20px;
        opacity: 1;
      }
      .txt {
        opacity: 0;
      }
    }
  }
`; 