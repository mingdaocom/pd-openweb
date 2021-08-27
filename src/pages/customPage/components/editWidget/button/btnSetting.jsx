import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { Button, Input, Dropdown, Icon } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import sheetAjax from 'src/api/worksheet';
import { connect } from 'react-redux';
import SelectWorksheet from 'src/pages/worksheet/components/SelectWorksheet/SelectWorksheet';
import { getWorksheetsByAppId } from 'src/api/homeApp';
import { getAppForManager } from 'src/api/appManagement';
import { useSetState } from 'react-use';
import { COLORS, ICONS } from './config';
import './index.less';
import LinkPara from '../LinkPara';

const BtnSettingWrap = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 360px;
  background-color: #f8f8f8;
  padding: 16px 0;
  .btnDisplayTab {
    display: flex;
    padding: 0 24px;
    li {
      flex: 1;
      padding-bottom: 16px;
      text-align: center;
      border-bottom: 3px solid #eee;
      transition: all 0.25s;
      cursor: pointer;
      &.active {
        color: #2196f3;
        border-bottom-color: #2196f3;
      }
    }
  }
  .settingsBox {
    flex: 1;
    overflow-y: auto;
  }
  .delBtn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid #e5e5e5;
    .iconWrap {
      color: #9d9d9d;
      cursor: pointer;
      &:hover {
        color: #757575;
      }
    }
  }
  .settingItem {
    margin-top: 20px;
    padding: 0 24px;
    .Dropdown--input {
      background-color: #fff;
    }
    .settingTitle {
      font-weight: bold;
      margin-bottom: 8px;
    }
    .openMode {
      display: flex;
      border: 1px solid #ddd;
      border-radius: 3px;
      li {
        flex: 1;
        color: #9e9e9e;
        background-color: #eee;
        transition: all 0.25s;
        cursor: pointer;
        line-height: 34px;
        text-align: center;
        &:first-child {
          border-right: 1px solid #ddd;
        }
        &.active {
          color: #2196f3;
          background-color: #fff;
        }
      }
    }
    .colorsWrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      li {
        position: relative;
        width: 24px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        border-radius: 50%;
        cursor: pointer;
        &:not(.isCurrentColor):hover {
          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.2);
          }
        }
        & > .icon {
          color: #fff;
        }
      }
    }
    .iconsWrap {
      flex-wrap: wrap;
      display: flex;
      align-items: center;
      li {
        width: 36px;
        text-align: center;
        margin-right: 3px;
        border-radius: 3px;
        cursor: pointer;
        color: #9e9e9e;
        &.isCurrent {
          color: #fff;
        }
        & > .icon {
          font-size: 24px;
          line-height: 36px;
        }
      }
    }
  }
`;
const Tab = [
  { text: _l('设置按钮'), type: 'setting' },
  { text: _l('卡片说明'), type: 'explain' },
];
const CLICK_ACTION = [
  {
    text: _l('创建记录'),
    value: 1,
  },
  {
    text: _l('打开视图'),
    value: 2,
  },
  {
    text: _l('打开自定义页面'),
    value: 3,
  },
  {
    text: _l('打开链接'),
    value: 4,
  },
];

const OPEN_MODE = [
  { value: 1, text: _l('当前页面') },
  { value: 2, text: _l('新页面') },
];

function BtnSetting(props) {
  const { appPkg = {}, ids = {}, btnSetting, explain, setBtnSetting, setSetting, onSave, onDel } = props;
  const { appId } = ids;
  const [displayType, setDisplayType] = useState('setting');
  const [paras, setParas] = useState(btnSetting.param || []);
  const projectId = appPkg.projectId || appPkg.id;

  const [dataSource, setDataSource] = useSetState({ worksheets: [], views: [], pages: [] });

  const initConfigData = { action: '', viewId: '', openMode: 1, value: '' };

  const { worksheets, views, pages } = dataSource;
  const { name, action, viewId, openMode, icon, color, value } = btnSetting;

  useEffect(() => {
    setParas(btnSetting.param || []);
  }, [btnSetting.param]);

  useEffect(() => {
    getAppForManager({ projectId }).then(data => {
      if (Array.isArray(data)) {
        let sheets = [];
        let pageList = [];
        _.forEach(data, ({ workSheetInfo }) => {
          _.forEach(workSheetInfo, item => {
            if (item.type === 1) pageList.push(item);
            sheets.push(item);
          });
        });
        setDataSource({
          worksheets: sheets.map(({ workSheetId: worksheetId, workSheetName: worksheetName }) => ({
            value: worksheetId,
            text: worksheetName,
          })),
          pages: pageList.map(({ workSheetName, workSheetId }) => ({ text: workSheetName, value: workSheetId })),
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!value || !_.includes([2], action)) return;
    sheetAjax
      .getWorksheetInfo({
        worksheetId: value,
        getTemplate: true,
        getViews: true,
        appId,
      })
      .then(res => {
        const { views = [] } = res;
        setDataSource({ views: views.map(({ viewId, name }) => ({ text: name, value: viewId })) });
      });
  }, [value, action]);

  const renderConfig = () => {
    // 创建记录
    if (action === 1) {
      return (
        <div className="settingItem">
          <div className="settingTitle">{_l('工作表')}</div>
          <SelectWorksheet
            dialogClassName={'btnSettingSelectDialog'}
            worksheetType={0}
            projectId={projectId}
            appId={appId}
            value={value}
            onChange={(__, itemId) => {
              setBtnSetting({ ...btnSetting, value: itemId });
            }}
          />
        </div>
      );
    }
    // 打开视图
    if (action === 2) {
      return (
        <Fragment>
          <div className="settingItem">
            <div className="settingTitle">{_l('工作表')}</div>
            <SelectWorksheet
              dialogClassName={'btnSettingSelectDialog'}
              worksheetType={0}
              projectId={projectId}
              appId={appId}
              value={value}
              onChange={(__, itemId) => {
                setBtnSetting({ ...btnSetting, value: itemId });
              }}
            />
          </div>
          <div className="settingItem">
            <div className="settingTitle">{_l('视图')}</div>
            <Dropdown
              disabled={!value}
              value={viewId || undefined}
              data={views}
              onChange={value => setBtnSetting({ ...btnSetting, viewId: value })}
              style={{ width: '100%', background: '#fff' }}
              menuStyle={{ width: '100%' }}
              placeholder={_l('选择视图')}
              border
            />
          </div>
          <div className="settingItem">
            <div className="settingTitle">{_l('打开方式')}</div>
            <ul className="openMode">
              {OPEN_MODE.map(({ value, text }) => (
                <li
                  key={value}
                  className={cx({ active: value === openMode })}
                  onClick={() => setBtnSetting({ ...btnSetting, openMode: value })}>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </Fragment>
      );
    }
    // 打开自定义页面
    if (action === 3) {
      return (
        <Fragment>
          <div className="settingItem">
            <div className="settingTitle">{_l('页面')}</div>
            <SelectWorksheet
              dialogClassName={'btnSettingSelectDialog'}
              worksheetType={1}
              projectId={projectId}
              appId={appId}
              value={value}
              onChange={(__, itemId) => {
                setBtnSetting({ ...btnSetting, value: itemId });
              }}
            />
          </div>
          <div className="settingItem">
            <div className="settingTitle">{_l('打开方式')}</div>
            <ul className="openMode">
              {OPEN_MODE.map(({ value, text }) => (
                <li
                  key={value}
                  className={cx({ active: value === openMode })}
                  onClick={() => setBtnSetting({ ...btnSetting, openMode: value })}>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </Fragment>
      );
    }
    // 打开链接
    if (action === 4) {
      return (
        <Fragment>
          <div className="settingItem">
            <div className="settingTitle">{_l('链接')}</div>
            <Input
              style={{ width: '100%' }}
              value={value}
              onChange={value => setBtnSetting({ ...btnSetting, value })}
              placeholder={_l('请输入链接地址')}
            />
            {value && (
              <LinkPara
                paras={paras}
                setParas={param => {
                  setParas(param);
                  setBtnSetting({ ...btnSetting, param });
                }}
              />
            )}
          </div>
          <div className="settingItem">
            <div className="settingTitle">{_l('打开方式')}</div>
            <ul className="openMode">
              {OPEN_MODE.concat([{ value: 3, text: _l('弹窗') }]).map(({ value, text }) => (
                <li
                  key={value}
                  className={cx({ active: value === openMode })}
                  onClick={() => setBtnSetting({ ...btnSetting, openMode: value })}>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </Fragment>
      );
    }
    return null;
  };
  return (
    <BtnSettingWrap>
      <ul className="btnDisplayTab">
        {Tab.map(({ text, type }) => (
          <li key={type} className={cx({ active: displayType === type })} onClick={() => setDisplayType(type)}>
            {text}
          </li>
        ))}
      </ul>
      {displayType === 'setting' && (
        <div className="delBtn">
          <div className="text Gray_75">{_l('设置 “按钮”')}</div>
          <div className="iconWrap" data-tip={_l('删除')} onClick={onDel}>
            <i className="icon-delete_12 Font18"></i>
          </div>
        </div>
      )}
      <div className="settingsBox">
        {displayType === 'setting' ? (
          <Fragment>
            <div className="settingItem">
              <div className="settingTitle">{_l('按钮名称')}</div>
              <Input style={{ width: '100%' }} value={name} onChange={name => setBtnSetting({ ...btnSetting, name })} />
            </div>
            <div className="settingItem">
              <div className="settingTitle">{_l('操作')}</div>
              <Dropdown
                value={action}
                data={CLICK_ACTION}
                onChange={value => setBtnSetting({ ...btnSetting, ...initConfigData, action: value })}
                menuStyle={{ width: '100%' }}
                style={{ width: '100%', background: '#fff' }}
                placeholder={_l('选择执行操作')}
                border
              />
            </div>
            {action && renderConfig()}
            <div className="settingItem">
              <div className="settingTitle">{_l('颜色')}</div>
              <ul className="colorsWrap">
                {COLORS.map(item => (
                  <li
                    key={item}
                    className={cx({ isCurrentColor: item === color })}
                    style={{ backgroundColor: item }}
                    onClick={() => setBtnSetting({ ...btnSetting, color: item })}>
                    {item === color && <Icon icon="hr_ok" />}
                  </li>
                ))}
              </ul>
            </div>
            <div className="settingItem">
              <div className="settingTitle">{_l('图标')}</div>
              <ul className="iconsWrap">
                {ICONS.map(item => {
                  let isCurrent = icon === item;
                  return (
                    <li
                      key={item}
                      style={{ backgroundColor: isCurrent ? color : 'transparent' }}
                      className={cx({ isCurrent })}
                      onClick={() => setBtnSetting({ ...btnSetting, icon: icon === item ? '' : item })}>
                      <Icon icon={item} />
                    </li>
                  );
                })}
              </ul>
            </div>
          </Fragment>
        ) : (
          <div className="settingItem">
            <div className="settingTitle">{_l('文本')}</div>
            <Input style={{ width: '100%' }} value={explain} onChange={value => setSetting({ explain: value })} />
          </div>
        )}
      </div>
    </BtnSettingWrap>
  );
}

export default connect(state => ({ appPkg: state.appPkg }))(BtnSetting);
