import styled from 'styled-components';

export const SandboxPageScroll = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: var(--color-background-primary);
`;

export const SandboxPage = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 1100px;
  height: 100%;
  min-height: 640px;
  background-color: var(--color-background-primary);
`;

export const SandboxPageContent = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  padding: 24px 24px 0;
  flex-direction: column;
`;
