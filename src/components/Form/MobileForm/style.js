import styled from 'styled-components';

// 选项胶囊
export const CustomOptionCapsule = styled.span`
  position: relative;
  display: inline-block;
  ${props =>
    props.inPopup
      ? 'padding: 2px 0 2px 18px;'
      : 'padding: 2px 12px 2px 30px;border-radius: 16px;border: 1px solid var(--gray-e0);'}
  word-break: break-all;
  white-space: pre-wrap;

  &::after {
    content: '';
    position: absolute;
    left: ${props => (props.inPopup ? '0' : '12px')};
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.tagColor || 'var(--gray-f3)'};
  }
`;
