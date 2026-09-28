import styled, { createGlobalStyle } from 'styled-components';

export const MobileMingoGlobalStyle = createGlobalStyle`
  html.mobileMingoPage,
  body.mobileMingoPage,
  html.mobileMingoPage #app {
    background: var(--color-background-primary) !important;
    ${props => (props.$embeddedInApp ? 'padding-bottom: 0;' : '')}
  }
`;

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  background: var(--color-background-primary);
  display: flex;
  flex-direction: column;
  --color-mingo: var(--color-primary);
  --mobile-mingo-bottom-inset: ${props => `${props.$safeAreaBottom + (props.$showAiGeneratedNotice ? 18 : 0)}px`};
  --mobile-mingo-welcome-bottom-gap: ${props => (props.$showAiGeneratedNotice ? '12px' : '20px')};
  --mobile-mingo-composer-bottom-gap: ${props => (props.$showAiGeneratedNotice ? '12px' : '16px')};
  --mobile-mingo-recording-glow-offset: ${props => `${props.$safeAreaBottom / 2}px`};
  --mobile-mingo-recording-glow-size: ${props => `${props.$safeAreaBottom}px`};
  ${() => (md.global.SysSettings.aiBrandThemeColor ? `--color-mingo: ${md.global.SysSettings.aiBrandThemeColor};` : '')}
  .mobileAiHeader {
    height: 58px;
    flex-shrink: 0;
    padding: 8px 16px;
    align-items: center;
    .icon {
      font-size: 22px;
      color: var(--color-text-primary);
    }
  }
  .mobileAiHomeHeader {
    height: 46px;
    flex-shrink: 0;
    padding: 0 16px;
    align-items: center;
  }
  .mingoProjectSelect {
    min-width: 0;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  .toolbarActions {
    flex-shrink: 0;
    margin-left: 12px;
    align-items: center;
    .toolbarIconBtn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 16px;
      &:first-child {
        margin-left: 0;
      }
    }
    .toolbarIconBtn .icon {
      font-size: 26px;
    }
    .historyBtn .icon {
      color: var(--color-text-secondary);
    }
    .newChatBtn .icon {
      color: var(--color-mingo);
    }
  }
  .agentContent {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;

    .agentMessageRow {
      margin-bottom: 16px;
    }
  }
  .mobileMingoBody {
    flex: 1;
    min-height: 0;
    display: flex;
  }
  .agentComposerArea {
    position: relative;
    z-index: 1;
    background: var(--color-background-primary);
    padding-bottom: calc(var(--mobile-mingo-composer-bottom-gap) + var(--mobile-mingo-bottom-inset));
  }
  .agentSelectionBar {
    position: relative;
    z-index: 1;
    background: var(--color-background-primary);
    padding-bottom: calc(var(--mobile-mingo-composer-bottom-gap) + var(--mobile-mingo-bottom-inset));
  }
  .mobileMingoMain {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .historyAside {
    display: none;
  }
  @media (min-width: 701px) {
    .historyAside {
      display: block;
      width: 280px;
      flex: 0 0 280px;
      min-height: 0;
    }
    .toolbarActions .historyBtn {
      display: none;
    }
  }
  @media (min-width: 801px) {
    .historyAside {
      width: 300px;
      flex-basis: 300px;
    }
  }
`;

export const AiGeneratedNotice = styled.div`
  position: absolute;
  z-index: 1;
  right: 0;
  bottom: ${props => `${props.$safeAreaBottom}px`};
  left: 0;
  display: flex;
  justify-content: center;
  color: var(--color-text-tertiary);
  font-size: 12px;
  line-height: 18px;
  pointer-events: none;
`;

export default Wrapper;
