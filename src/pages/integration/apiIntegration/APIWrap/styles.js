import styled from 'styled-components';

export const Wrap = styled.div`
  .maxWidth100 {
    max-width: 100px;
  }
  width: 800px;
  height: 100%;
  position: fixed;
  z-index: 100;
  right: 0;
  top: 0;
  bottom: 0;
  background: var(--color-background-secondary);
  box-shadow: 0 8px 36px rgb(0 0 0 / 24%);
  .w150 {
    width: 150px !important;
  }
  .conSetting {
    height: 100%;
    overflow: auto;
  }
  .node,
  .closeBtn {
    height: 35px;
  }
`;
