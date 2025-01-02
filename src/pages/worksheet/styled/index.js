import styled from 'styled-components';

export const FlexCenter = styled.div`
  display: flex;
  align-items: center;
`;

export const TextEllipsis = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const Text = styled.p`
  font-size: 13px;
  color: ${props => (props.color ? props.color : '#151515')};
  text-align: ${props => props.align || 'initial'};
`;

export const Fixed = styled.div`
  position: absolute;
  top: 0;
  right: ${props => (props.right ? 0 : 'initial')};
  left: ${props => (props.left ? 0 : 'initial')};
  bottom: 0;
`;

export const Button = styled.button`
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  padding: 0 32px;
  line-height: 36px;
  height: 36px;
  color: #fff;
  background-color: ${props => props.bgColor || '#2196f3'};
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  border: 1px solid transparent;
`;

export const RevertButton = styled(Button)`
  color: ${props => props.color || '#2196f3'};
  border: 1px solid currentColor;
  background: ${props => props.bgColor || 'transparent'};
  &:hover {
    background-color: #edf7fe;
  }
`;

export const Height100 = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
`;

export const Circle = styled(FlexCenter)`
  width: ${props => props.size || 36}px;
  height: ${props => props.size || 36}px;
  border-radius: 50%;
`;
