import styled from 'styled-components';

export const Wrap = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

export const LoginDialog = styled.div`
  border-radius: 12px;
  padding: 40px 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 320px;
`;

export const LoginTitle = styled.div`
  font-size: 18px;
  color: #333;
  margin-bottom: 30px;
`;

export const ReturnButton = styled.button`
  background-color: #2196f3;
  border: none;
  border-radius: 8px;
  padding: 14px 40px;
  font-size: 16px;
  margin-bottom: 15px;
  transition: background-color 0.3s;

  &:active {
    background-color: #1976d2;
  }
`;

export const HintText = styled.div`
  color: #999;
`;
