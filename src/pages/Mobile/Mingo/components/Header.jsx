import React, { useEffect, useRef } from 'react';
import { Icon } from 'ming-ui';
import { compatibleMDJS } from 'src/utils/services/project';

const NAVIGATION_SESSION_ID = 'mobile-mingo-navigation';

export function canTakeOverNavigationBar() {
  return typeof window !== 'undefined' && window.isMingDaoApp;
}

export function createNavigationConfig() {
  return {
    nav: {
      back: { visible: true },
      right: [
        {
          mode: 'button',
          icon: 'data:image/svg+xml;base64,PHN2ZyB0PSIxNzg0MTcwNzMyODE5IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjQ2NDA4IiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHBhdGggZD0iTTUxMiA5MzkuNDA4Njk1NjVIMTI1LjMwMTU2NTIyYTQwLjgxNzczOTEzIDQwLjgxNzczOTEzIDAgMCAxLTQwLjcxMDI2MDg3LTQwLjcxMDI2MDg3VjUxMkE0MjcuNDA4Njk1NjUgNDI3LjQwODY5NTY1IDAgMSAxIDUxMiA5MzkuNDA4Njk1NjV6TTM2OS41NjUyMTczOSA0OTEuNTkxNjUyMTdBMjAuNDA4MzQ3ODMgMjAuNDA4MzQ3ODMgMCAwIDAgMzQ5LjIxMjE3MzkxIDUxMnY0MC43MTAyNjA4N2EyMC40MDgzNDc4MyAyMC40MDgzNDc4MyAwIDAgMCAyMC4zNTUxMzA0NCAyMC4zNTYxNzM5MWgxMDEuNTA5NTY1MjJ2MTAxLjUwOTU2NTIyYTIwLjM1NTEzMDQzIDIwLjM1NTEzMDQzIDAgMCAwIDIwLjMwMTkxMzA0IDIwLjM1NTEzMDQzaDQwLjc2MzQ3ODI2YTIwLjQwODM0NzgzIDIwLjQwODM0NzgzIDAgMCAwIDIwLjM1NjE3MzkxLTIwLjM1NTEzMDQzdi0xMDEuNTA5NTY1MjJoMTAxLjUwOTU2NTIyYTIwLjQwODM0NzgzIDIwLjQwODM0NzgzIDAgMCAwIDIwLjQwODM0NzgzLTIwLjM1NjE3MzkxVjUxMmEyMC40MDgzNDc4MyAyMC40MDgzNDc4MyAwIDAgMC0yMC40MDgzNDc4My0yMC40MDgzNDc4M2gtMTAxLjUwOTU2NTIydi0xMDEuNTA5NTY1MjFhMjAuMzU1MTMwNDMgMjAuMzU1MTMwNDMgMCAwIDAtMjAuMzU2MTczOTEtMjAuMzU2MTczOTJoLTQwLjU0OTU2NTIyYTIwLjM1NTEzMDQzIDIwLjM1NTEzMDQzIDAgMCAwLTIwLjMwMTkxMzA0IDIwLjM1NjE3MzkydjEwMS41MDk1NjUyMXoiIHAtaWQ9IjQ2NDA5Ij48L3BhdGg+PC9zdmc+',
          color: md.global.SysSettings.aiBrandThemeColor || '#6e09f9',
        },
        {
          mode: 'button',
          icon: 'data:image/svg+xml;base64,PHN2ZyB0PSIxNzg0MTY5OTk0Nzk1IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjQ1OTg1IiBkYXRhLXNwbS1hbmNob3ItaWQ9ImEzMTN4Lm1hbmFnZV90eXBlX215cHJvamVjdHMuMC5pMS4xZTAwM2E4MVBaZVlObiIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxwYXRoIGQ9Ik01MzQuMDE2IDI5Ny45ODR2MjI0bDE5MiAxMTQuMDA1MzMzLTMyIDU0LjAxNi0yMjQtMTM2LjAyMTMzM3YtMjU2aDY0ek01MTIgODU0LjAxNnExMzkuOTg5MzMzIDAgMjQwLjk4MTMzMy0xMDAuOTkydDEwMC45OTItMjQwLjk4MTMzMy0xMDAuOTkyLTI0MC45ODEzMzRUNTEyIDE3MC4wNjkzMzMgMjcxLjAxODY2NyAyNzEuMDYxMzMzdC0xMDAuOTkyIDI0MC45ODEzMzQgMTAwLjk5MiAyNDAuOTgxMzMzVDUxMiA4NTQuMDE2eiBtMC03NjhxMTc2IDAgMzAxLjAxMzMzMyAxMjUuMDEzMzMzdDEyNS4wMTMzMzQgMzAxLjAxMzMzNC0xMjUuMDEzMzM0IDMwMS4wMTMzMzNUNTEyIDkzOC4wNjkzMzN0LTMwMS4wMTMzMzMtMTI1LjAxMzMzMy0xMjUuMDEzMzM0LTMwMS4wMTMzMzMgMTI1LjAxMzMzNC0zMDEuMDEzMzM0VDUxMiA4Ni4wMTZ6IiBwLWlkPSI0NTk4NiI+PC9wYXRoPjwvc3ZnPg==',
          color: '#757575',
          colorInDark: '#b3b3b3',
        },
      ].filter((_, index) => !window.isIPad || index === 0),
    },
  };
}

function ToolbarActions({ onOpenHistory, onNewChat }) {
  return (
    <div className="toolbarActions flexRow">
      <div className="toolbarIconBtn historyBtn" onClick={onOpenHistory}>
        <Icon icon="access_time" />
      </div>
      <div className="toolbarIconBtn newChatBtn" onClick={onNewChat}>
        <Icon icon="newchat" />
      </div>
    </div>
  );
}

export default function Header({ isChatting, historyVisible, onOpenHistory, onCloseHistory, onFocusInput }) {
  const actionHandlersRef = useRef();

  useEffect(() => {
    actionHandlersRef.current = { historyVisible, onOpenHistory, onCloseHistory, onFocusInput };
  }, [historyVisible, onCloseHistory, onFocusInput, onOpenHistory]);

  useEffect(() => {
    if (!window.isMingDaoApp) return;

    const navigationConfig = createNavigationConfig();

    compatibleMDJS('takeOverNavigationBarItems', {
      sessionId: NAVIGATION_SESSION_ID,
      ...navigationConfig,
      onAction: event => {
        const handlers = actionHandlersRef.current;

        if (event.slot === 'back') {
          if (handlers.historyVisible) {
            handlers.onCloseHistory();
            return;
          }

          compatibleMDJS('back', {});
          return;
        }

        if (event.slot === 'right' && event.action === 'tap') {
          if (event.index === 0) handlers.onFocusInput();
          if (event.index === 1) handlers.onOpenHistory();
        }
      },
    });

    return () => {
      compatibleMDJS('handOverNavigationBarItems', { sessionId: NAVIGATION_SESSION_ID });
    };
  }, []);

  if (window.isMingDaoApp) return null;

  if (isChatting) {
    return (
      <div className="mobileAiHeader flexRow">
        <div className="flex"></div>
        <ToolbarActions onOpenHistory={onOpenHistory} onNewChat={onFocusInput} />
      </div>
    );
  }

  return (
    <div className="mobileAiHomeHeader flexRow">
      <div className="flex"></div>
      <ToolbarActions onOpenHistory={onOpenHistory} onNewChat={onFocusInput} />
    </div>
  );
}
