import React, { useState, useEffect } from 'react';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import { Icon, LoadDiv, MenuItem, Menu } from 'ming-ui';
import styled from 'styled-components';
import SingleFilter from 'src/pages/worksheet/common/WorkSheetFilter/common/SingleFilter';
import {
  SearchWorksheetWrap,
  WorksheetListWrap,
} from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/styled';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import Trigger from 'rc-trigger';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import cx from 'classnames';
import { WIDGETS_TO_API_TYPE_ENUM_N } from 'src/pages/Role/PortalCon/setting/InfoSet';
import SelectWorksheet from 'src/pages/widgetConfig/widgetSetting/components/SearchWorksheet/SelectWorksheet';
import _ from 'lodash';
const typeList = _.keys(WIDGETS_TO_API_TYPE_ENUM_N);
import { getTranslateInfo } from 'src/util';
import { replaceControlsTranslateInfo } from 'worksheet/util';

export default function ReviewFreeByWorksheetWrap(props) {
  const { appId, projectId, onChange, query, canChooseOtherApp } = props;
  const [showMenu, setShowMenu] = useState(false);
  const [visible, setvisible] = useState(false);
  const [sheetList, setSheetList] = useState([]);
  const [sheetId, setSheetId] = useState('');
  const [controls, setControls] = useState([]);
  const [allControls, setAllControls] = useState([]);
  const [sheetName, setSheetName] = useState('');
  const [appName, setAppName] = useState('');
  const [isSheetDelete, setIsSheetDelete] = useState(false);
  const [items, setItems] = useState([]);
  const [originSheetList, setOriginSheetList] = useState([]);
  const [clear, setClear] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    homeAppAjax.getWorksheetsByAppId({ appId, type: 0 }).then(res => {
      res.forEach(sheet => {
        sheet.workSheetName = getTranslateInfo(appId, sheet.workSheetId).name || sheet.workSheetName
      });
      setSheetList(res);
      setOriginSheetList(res);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const { sourceId = '', sourceName = '', templates = {}, items = [], appName } = query || {};
    setSheetId(sourceId);
    setSheetName(sourceName);
    const { controls = [] } = templates;
    setAllControls(controls);
    setIsSheetDelete(!sourceId);
    setControls(
      controls, //.filter(item => typeList.includes(item.type + ''))
    );
    setItems(items);
    setAppName(appName);
  }, [query]);

  useEffect(() => {
    setControlsFn({
      workSheetId: sheetId,
      workSheetName: sheetName,
    });
  }, [sheetId]);

  const handleSearch = _.throttle(value => {
    setSheetList(value ? originSheetList.filter(i => (i.workSheetName || '').indexOf(value) > -1) : originSheetList);
  }, 300);

  const setControlsFn = data => {
    if (!data.workSheetId) return;
    worksheetAjax.getWorksheetInfo({ worksheetId: data.workSheetId, getTemplate: true, appId }).then(res => {
      res.template.controls = replaceControlsTranslateInfo(appId, res.template.controls);
      let da = { sourceId: data.workSheetId, sourceName: res.name, templates: res.template, appName };
      da = clear ? { ...da, configs: [], items: [] } : da;
      onChange({
        ...query,
        ...da,
      });
      setClear(false);
    });
  };
  const renderSearchCom = () => {
    return (
      <React.Fragment>
        <i className="icon icon-add"></i>
        {_l('筛选条件')}
      </React.Fragment>
    );
  };
  if (loading) {
    return <LoadDiv className="mTop10" />;
  }
  return (
    <React.Fragment>
      <SearchWorksheetWrap>
        <SettingItem className="mTop8">
          <div className="settingItemTitle">{_l('工作表')}</div>
          <Trigger
            action={['click']}
            popupVisible={showMenu}
            onPopupVisibleChange={showMenu => {
              setShowMenu(showMenu);
            }}
            popupStyle={{ width: 530 }}
            popup={() => {
              return (
                <WorksheetListWrap>
                  <Menu
                    fixedHeader={
                      <div
                        className="flexRow"
                        style={{
                          padding: '0 16px 0 14px',
                          height: 36,
                          alignItems: 'center',
                          borderBottom: '1px solid #e0e0e0',
                          marginBottom: 5,
                        }}
                      >
                        <i className="icon-search Gray_75 Font14" />
                        <input
                          type="text"
                          autoFocus
                          className="mLeft5 flex Border0 placeholderColor w100"
                          placeholder={_l('搜索')}
                          onChange={evt => handleSearch(evt.target.value.trim())}
                        />
                      </div>
                    }
                  >
                    {sheetList.length > 0 ? (
                      sheetList.map(item => {
                        return (
                          <MenuItem
                            onClick={() => {
                              setClear(true);
                              setSheetId(item.workSheetId);
                              setSheetName(item.workSheetName);
                              setItems([]);
                              setShowMenu(false);
                              setAppName('');
                            }}
                          >
                            {item.workSheetName}
                          </MenuItem>
                        );
                      })
                    ) : (
                      <MenuItem className="Gray_9">{_l('暂无搜索结果')}</MenuItem>
                    )}
                  </Menu>
                  {canChooseOtherApp && (
                    <div
                      className="otherWorksheet"
                      onClick={() => {
                        setShowMenu(false);
                        setvisible(true);
                      }}
                    >
                      {_l('其他应用下的工作表')}
                    </div>
                  )}
                </WorksheetListWrap>
              );
            }}
            popupAlign={{
              points: ['tl', 'bl'],
              offset: [0, 3],
              overflow: {
                adjustX: true,
                adjustY: true,
              },
            }}
          >
            <div className={cx('settingWorksheetInput')}>
              <div className="overflow_ellipsis">
                {sheetName ? (
                  <span className={cx(isSheetDelete ? 'Red' : 'Gray')}>
                    {isSheetDelete ? _l('工作表已删除') : sheetName}
                    {appName && <span>（{appName}）</span>}
                  </span>
                ) : (
                  <span className="Gray_bd">{_l('选择工作表')}</span>
                )}
              </div>
              <div className="edit">
                <i className="icon-arrow-down-border"></i>
              </div>
            </div>
          </Trigger>
        </SettingItem>
        <SettingItem>
          <div className="settingItemTitle">{_l('查询满足以下条件的记录')}</div>
          {sheetId ? (
            <SingleFilter
              canEdit
              feOnly
              id={sheetId}
              projectId={projectId}
              appId={appId}
              showSystemControls
              columns={controls}
              conditions={items}
              from="portal"
              conditionItemForDynamicStyle
              globalSheetControls={allControls}
              onConditionsChange={conditions => {
                const newConditions = conditions.map(item => {
                  return item.isDynamicsource ? { ...item, values: [], value: '' } : item;
                });
                onChange({
                  ...query,
                  items: newConditions,
                });
              }}
              comp={renderSearchCom}
            />
          ) : (
            <div className="addFilterCondition pointer">
              <span
                onClick={e => {
                  if (!sheetId) {
                    alert(_l('请选择工作表'), 3);
                    return;
                  }
                }}
              >
                {renderSearchCom()}
              </span>
            </div>
          )}
        </SettingItem>
      </SearchWorksheetWrap>
      {visible && (
        <SelectWorksheet
          visible={visible}
          appId={appId}
          sheetId={sheetId}
          globalSheetInfo={{ projectId, appId }}
          onClose={() => {
            setvisible(false);
          }}
          onOk={data => {
            setSheetId(data.sheetId);
            setAppName(data.appName);
            setControlsFn({
              workSheetId: data.sheetId,
            });
          }}
        />
      )}
    </React.Fragment>
  );
}
