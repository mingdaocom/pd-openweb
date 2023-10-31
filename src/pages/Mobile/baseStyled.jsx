
import styled from 'styled-components';
import { Modal } from 'antd-mobile';

export const ModalWrap = styled(Modal)`
  height: 95% !important;
  overflow: hidden;
  border-top-right-radius: 15px;
  border-top-left-radius: 15px;

  .am-modal-body {
    text-align: left;
  }
  &.full {
    height: 100% !important;
    border-top-right-radius: 0;
    border-top-left-radius: 0;
  }
`;

