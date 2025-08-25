import React, { useEffect } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import { DndProvider } from 'react-dnd-latest';
import { useSetState } from 'react-use';
import _ from 'lodash';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import WidgetDisplay from '../widgetDisplay';
import WidgetList from '../widgetList';
import WidgetSetting from '../widgetSetting';
import { DrawerWrap } from '../widgetSetting/content/styled';

const ClickAwayable = createDecoratedComponent(withClickAway);

const originFixedInfo = {
  widgetPanelFixed: true,
  settingPanelFixed: true,
};

export default function Content(props) {
  const { globalSheetInfo = {}, isRecycle, activeWidget = {}, setActiveWidget, styleInfo = {}, setStyleInfo } = props;
  const [fixedInfo, setPanelFixed] = useSetState(originFixedInfo);
  const [{ widgetVisible, settingVisible }, setVisible] = useSetState({
    widgetVisible: false,
    settingVisible: false,
  });

  const { widgetPanelFixed, settingPanelFixed } = fixedInfo;

  useEffect(() => {
    const tempInfo = safeParse(
      window.localStorage.getItem(`worksheetPanelFixed-${globalSheetInfo.worksheetId}`) || '{}',
    );
    const newInfo = !_.isEmpty(tempInfo) ? tempInfo : originFixedInfo;
    setPanelFixed({ ...newInfo });
    if (newInfo.settingPanelFixed) setVisible({ settingVisible: true });
  }, [globalSheetInfo.worksheetId]);

  useEffect(() => {
    const handleKeyDown = e => {
      const { key, metaKey, ctrlKey } = e;
      if (!widgetPanelFixed && (window.isMacOs ? metaKey : ctrlKey) && key === '/') {
        e.preventDefault();
        setVisible({ widgetVisible: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [widgetPanelFixed]);

  useEffect(() => {
    setTimeout(() => {
      if (!_.isEmpty(activeWidget) && !settingVisible) {
        setVisible({ settingVisible: true });
      }
    }, 100);
  }, [activeWidget.controlId]);

  useEffect(() => {
    const handleKeyDown = e => {
      const { code, metaKey, ctrlKey } = e;
      if (!fixedInfo.widgetPanelFixed && (window.isMacOs ? metaKey : ctrlKey) && code === 'Slash') {
        setVisible({ widgetVisible: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const baseProps = {
    ...props,
    ...fixedInfo,
    listPanelVisible: widgetVisible,
    settingPanelVisible: settingVisible,
    setPanelVisible: value => setVisible(value),
    setPanelFixed: key => {
      const obj = { [key]: !fixedInfo[key] };
      setPanelFixed(obj);
      safeLocalStorageSetItem(
        `worksheetPanelFixed-${globalSheetInfo.worksheetId}`,
        JSON.stringify({ ...fixedInfo, ...obj }),
      );

      if (key === 'settingPanelFixed' && !obj[key] && !settingVisible) {
        setTimeout(() => {
          setVisible({ settingVisible: true });
        }, 100);
      }
    },
  };

  const renderWidgetList = () => {
    if (!widgetPanelFixed) {
      return (
        <ClickAwayable
          onClickAway={() => setVisible({ widgetVisible: false })}
          onClickAwayExceptions={['.WidgetListPanelDraw']}
        >
          <DrawerWrap
            width={300}
            className="WidgetListPanelDraw"
            title={null}
            placement="left"
            mask={false}
            zIndex={9}
            visible={widgetVisible}
            getContainer={false}
            closeIcon={null}
            footer={null}
          >
            <WidgetList {...baseProps} />
          </DrawerWrap>
        </ClickAwayable>
      );
    }

    return <WidgetList {...baseProps} />;
  };

  const renderWidgetSetting = () => {
    if (!settingPanelFixed && !isRecycle) {
      return (
        <ClickAwayable
          onClickAway={target => {
            const $el = $(target);
            if (
              $el &&
              ($el.closest('.displayHeader').length || $el.closest('.worksheetConfigHeader').length) &&
              settingVisible
            ) {
              setVisible({ settingVisible: false });
              setActiveWidget({});
              if (styleInfo.activeStatus) {
                setStyleInfo({ activeStatus: false });
              }
            }
          }}
        >
          <DrawerWrap
            width={350}
            title={null}
            className="WidgetSettingPanelDraw"
            placement="right"
            zIndex={9}
            mask={false}
            visible={settingVisible}
            getContainer={false}
            closeIcon={null}
            footer={null}
          >
            <WidgetSetting {...baseProps} />
          </DrawerWrap>
        </ClickAwayable>
      );
    }
    return <WidgetSetting {...baseProps} />;
  };

  return (
    <DndProvider key="config" context={window} backend={HTML5Backend}>
      <div className="customWidgetContainer">
        {renderWidgetList()}
        <WidgetDisplay {...baseProps} />
        {renderWidgetSetting()}
      </div>
    </DndProvider>
  );
}
