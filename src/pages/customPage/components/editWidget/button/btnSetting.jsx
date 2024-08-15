import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { Input, Dropdown, Icon, Tooltip } from 'ming-ui';
import { Checkbox, Input as AntdInput, Dropdown as AntdDropdown, Divider, Radio, Space, ConfigProvider } from 'antd';
import styled from 'styled-components';
import cx from 'classnames';
import sheetAjax from 'src/api/worksheet';
import { connect } from 'react-redux';
import SelectWorksheet from 'src/pages/worksheet/components/SelectWorksheet/SelectWorksheet';
import appManagementAjax from 'src/api/appManagement';
import { useSetState } from 'react-use';
import './index.less';
import BtnName from './BtnName';
import LinkPara from '../LinkPara';
import DefaultValue from './DefaultValue';
import FilterData from './FilterData';
import SelectProcess from './SelectProcess';
import ClickConfirm from './ClickConfirm';
import { DropdownContent } from 'src/pages/widgetConfig/styled';
import { replaceControlsTranslateInfo } from 'src/pages/worksheet/util';
import { getTranslateInfo } from 'src/util';
import _ from 'lodash';

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
  .selectActionBox {
    border-radius: 3px;
    padding: 5px 0;
    border: 1px solid #e5e5e5;
    background-color: #fff;
    .ant-radio-group, .ant-space {
      width: 100%;
    }
    .ant-space {
      gap: 0 !important;
    }
    .ant-space-item {
      padding: 7px 10px;
      margin-bottom: 0 !important;
      &:hover {
        background-color: #fafafa;
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
    justify-content: flex-end;
    padding: 10px 24px 2px;
    .iconWrap {
      color: #9d9d9d;
      cursor: pointer;
      display: flex;
      &:hover {
        color: #757575;
      }
    }
  }
  .settingItem {
    margin-top: 20px;
    padding: 0 24px;
    &:first-child {
      margin-top: 0;
    }
    .Dropdown--input {
      background-color: #fff;
    }
    .settingTitle {
      font-weight: bold;
      margin-bottom: 8px;
    }
    .typeSelect {
      font-size: 13px;
      border-radius: 3px;
      padding: 3px;
      background-color: #eff0f0;
      >div {
        height: 25px;
        line-height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .active {
        color: #2196F3 !important;
        border-radius: 3px;
        padding: 3px 0;
        font-weight: bold;
        background-color: #fff;
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
    .ant-checkbox-input, .ant-radio-input {
      position: absolute;
    }
    .ant-input {
      font-size: 13px;
      box-shadow: none;
      padding: 7px 11px;
      border-radius: 3px 0 0 3px !important;
    }
  }
  .customPageBtnSelectIcon {
    .inputWrap {
      display: none;
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
    svgIcon: 'plus'
  },
  {
    text: _l('打开视图'),
    value: 2,
    svgIcon: '1_worksheet'
  },
  {
    text: _l('打开自定义页面'),
    value: 3,
    svgIcon: 'hr_workbench'
  },
  {
    text: _l('打开链接'),
    value: 4,
    svgIcon: '16_5_globe_earth'
  },
  {
    text: _l('扫码'),
    value: 5,
    svgIcon: 'qr_code_19'
  },
  {
    text: _l('调用封装业务流程'),
    value: 6,
    svgIcon: 'custom_actions'
  }
];

const OPEN_MODE = [
  { value: 1, text: _l('当前页面') },
  { value: 2, text: _l('新页面') },
];

const ScanDefaultConfig = {
  qrCodeIsOpen: true,
  barCodeIsOpen: true,
  recordLink: 1,
  otherLink: 0,
  text: 0,
  isFilter: false
};

const ProcessDefaultConfig = {
  clickType: 1,
  confirmMsg: _l('你确认执行此操作吗？'),
  cancelName: _l('取消'),
  sureName: _l('确认')
};

let sheetRequest = null;

function BtnSetting(props) {
  const { activeIndex, appPkg = {}, ids = {}, btnSetting, btnConfig, explain, setBtnSetting, setSetting, onDel, onCopy } = props;
  const { appId, pageId } = ids;
  const [displayType, setDisplayType] = useState('setting');
  const [paras, setParas] = useState(btnSetting.param || []);
  const [sheetLoading, setSheetLoading] = useState(true);

  const projectId = appPkg.projectId || appPkg.id;

  const [dataSource, setDataSource] = useSetState({ worksheets: [], views: [], pages: [], controls: [], inputs: [] });

  const initConfigData = { action: '', viewId: '', openMode: 1, value: '' };

  const { worksheets, views, pages, controls } = dataSource;
  const { name, action, viewId, searchId, filterId, openMode, icon, color, btnId, value, param, config } = btnSetting;

  useEffect(() => {
    setParas(btnSetting.param || []);
  }, [btnSetting.param]);

  useEffect(() => {
    appManagementAjax.getAppForManager({ projectId }).then(data => {
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
    if (value && _.includes([1, 2, 5], action)) {
      if (sheetRequest && sheetRequest.abort) {
        sheetRequest.abort();
      }
      setSheetLoading(true);
      sheetRequest = sheetAjax.getWorksheetInfo({
        worksheetId: value,
        getTemplate: true,
        getViews: true,
        appId,
      });
      sheetRequest.then(res => {
        const { views = [], template = {} } = res;
        const controls = replaceControlsTranslateInfo(appId, value, template.controls);
        setDataSource({
          views: views.map(({ viewId, name, viewType }) => ({ text: getTranslateInfo(appId, null, viewId).name || name, value: viewId, type: viewType })),
          controls
        });
        if (action === 1) {
          setBtnSetting({
            ...btnSetting,
            config: {
              ...config,
              controls
            }
          });
        }
        setSheetLoading(false);
      });
    }
  }, [value, action, activeIndex]);

  const renderConfig = () => {
    // 创建记录
    if (action === 1) {
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
                setBtnSetting({
                  ...btnSetting,
                  btnId: null,
                  value: itemId,
                  config: {
                    ...config,
                    temporaryWriteControls: []
                  }
                });
              }}
            />
          </div>
          {value && !_.isEmpty(controls) && !sheetLoading && (
            <DefaultValue
              appId={appId}
              btnId={btnId}
              worksheetId={value}
              projectId={projectId}
              controls={controls}
              config={config}
              onChangeConfig={(config) => {
                setBtnSetting({ ...btnSetting, config});
              }}
            />
          )}
        </Fragment>
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
            <div className="typeSelect flexRow valignWrapper">
              {OPEN_MODE.map(({ value, text }) => (
                <div
                  key={value}
                  className={cx('flex centerAlign pointer Gray_75', { active: value === openMode })}
                  onClick={() => setBtnSetting({ ...btnSetting, openMode: value })}>
                  {text}
                </div>
              ))}
            </div>
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
            <div className="typeSelect flexRow valignWrapper">
              {OPEN_MODE.map(({ value, text }) => (
                <div
                  key={value}
                  className={cx('flex centerAlign pointer Gray_75', { active: value === openMode })}
                  onClick={() => setBtnSetting({ ...btnSetting, openMode: value })}>
                  {text}
                </div>
              ))}
            </div>
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
            <div className="typeSelect flexRow valignWrapper">
              {OPEN_MODE.concat([{ value: 3, text: _l('弹窗') }]).map(({ value, text }) => (
                <div
                  key={value}
                  className={cx('flex centerAlign pointer Gray_75', { active: value === openMode })}
                  onClick={() => setBtnSetting({ ...btnSetting, openMode: value })}>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </Fragment>
      );
    }
    // 扫码
    if (action === 5) {
      const { qrCodeIsOpen, barCodeIsOpen, recordLink, otherLink, text, placeholder, isFilter } = _.isObject(config) ? config : {};
      return (
        <Fragment>
          <div className="settingItem">
            <div className="settingTitle">{_l('引导文字')}</div>
            <Input
              className="w100"
              value={placeholder}
              onChange={value => {
                setBtnSetting({
                  ...btnSetting,
                  config: {
                    ...config,
                    placeholder: value
                  }
                });
              }}
              placeholder={_l('请输入引导文字')}
            />
          </div>
          <div className="settingItem">
            <div className="settingTitle">{_l('移动端扫码方式')}</div>
            <div className="flexRow">
              <div className="flex">
                <Checkbox
                  checked={qrCodeIsOpen}
                  onChange={(e) => {
                    const { checked } = e.target;
                    if (!checked && !barCodeIsOpen) {
                      return;
                    }
                    setBtnSetting({
                      ...btnSetting,
                      config: {
                        ...config,
                        qrCodeIsOpen: checked
                      }
                    });
                  }}
                >
                  {_l('扫描二维码')}
                </Checkbox>
              </div>
              <div className="flex">
                <Checkbox
                  checked={barCodeIsOpen}
                  onChange={(e) => {
                    const { checked } = e.target;
                    if (!checked && !qrCodeIsOpen) {
                      return;
                    }
                    setBtnSetting({
                      ...btnSetting,
                      config: {
                        ...config,
                        barCodeIsOpen: checked
                      }
                    });
                  }}
                >
                  {_l('扫描条形码')}
                </Checkbox>
              </div>
            </div>
          </div>
          <div className="settingItem">
            <Divider />
          </div>
          <div className="settingItem">
            {_l('获得扫码结果后执行动作')}
          </div>
          {qrCodeIsOpen && (
            <Fragment>
              <div className="settingItem">
                <div className="settingTitle">{_l('记录链接')}</div>
                <Dropdown
                  value={recordLink}
                  data={[
                    {
                      text: _l('打开记录'),
                      value: 1,
                    },
                    {
                      text: _l('无'),
                      value: 0,
                    }
                  ]}
                  onChange={value => {
                    setBtnSetting({
                      ...btnSetting,
                      config: {
                        ...config,
                        recordLink: value
                      }
                    });
                  }}
                  menuStyle={{ width: '100%' }}
                  style={{ width: '100%', background: '#fff' }}
                  border
                />
              </div>
              <div className="settingItem">
                <div className="settingTitle">{_l('其他链接')}</div>
                <Dropdown
                  value={otherLink}
                  data={[
                    {
                      text: _l('打开链接'),
                      value: 1,
                    },
                    {
                      text: _l('无'),
                      value: 0,
                    }
                  ]}
                  onChange={value => {
                    setBtnSetting({
                      ...btnSetting,
                      config: {
                        ...config,
                        otherLink: value
                      }
                    });
                  }}
                  menuStyle={{ width: '100%' }}
                  style={{ width: '100%', background: '#fff' }}
                  border
                />
              </div>
            </Fragment>
          )}
          <div className="settingItem">
            <div className="settingTitle">{_l('文本')}</div>
            <Dropdown
              value={text}
              data={[
                {
                  text: _l('搜索并打开记录'),
                  value: 1,
                },
                {
                  text: _l('调用封装业务流程'),
                  value: 2,
                },
                {
                  text: _l('无'),
                  value: 0,
                }
              ]}
              onChange={value => {
                setBtnSetting({
                  ...btnSetting,
                  config: {
                    ...config,
                    inputs: [],
                    text: value
                  }
                });
              }}
              menuStyle={{ width: '100%' }}
              style={{ width: '100%', background: '#fff' }}
              border
            />
          </div>
          {text === 1 && (
            <Fragment>
              <div className="settingItem">
                <div className="Gray_75">{_l('根据扫码的文本结果搜索数据，搜索到一条时直接打开记录，搜索到多条后进入搜索结果列表。')}</div>
              </div>
              <div className="settingItem">
                <div className="settingTitle Normal">{_l('搜索工作表')}</div>
                <SelectWorksheet
                  dialogClassName={'btnSettingSelectDialog'}
                  worksheetType={0}
                  projectId={projectId}
                  appId={appId}
                  value={value}
                  onChange={(__, itemId) => {
                    setBtnSetting({
                      ...btnSetting,
                      filterId: null,
                      value: itemId,
                      config: {
                        ...config,
                        isFilter: false,
                        filterConditions: []
                      }
                    });
                  }}
                />
              </div>
              <div className="settingItem">
                <div className="settingTitle Normal">{_l('视图')}</div>
                <Dropdown
                  disabled={!value}
                  value={viewId || undefined}
                  data={views.map(item => {
                    return {
                      ...item,
                      disabled: item.type !== 0
                    }
                  })}
                  onChange={value => setBtnSetting({ ...btnSetting, viewId: value })}
                  style={{ width: '100%', background: '#fff' }}
                  menuStyle={{ width: '100%' }}
                  placeholder={_l('选择视图')}
                  border
                />
              </div>
              {!_.isEmpty(controls) && (
                <Fragment>
                  <div className="settingItem">
                    <FilterData
                      projectId={projectId}
                      appId={appId}
                      worksheetId={value}
                      filterId={filterId}
                      controls={controls}
                      config={config}
                      onChangeConfig={(config) => {
                        setBtnSetting({ ...btnSetting, config});
                      }}
                    />
                  </div>
                  <div className="settingItem">
                    <div className="settingTitle Normal">{_l('搜索字段')}</div>
                    <Dropdown
                      value={searchId || undefined}
                      data={controls.filter(c => ![52].includes(c.type)).map(item => {
                        return {
                          text: item.controlName,
                          value: item.controlId
                        }
                      })}
                      onChange={value => {
                        setBtnSetting({ ...btnSetting, searchId: value })
                      }}
                      style={{ width: '100%', background: '#fff' }}
                      menuStyle={{ width: '100%' }}
                      placeholder={_l('选择搜索字段')}
                      border
                    />
                  </div>
                </Fragment>
              )}
            </Fragment>
          )}
          {text === 2 && (
            <Fragment>
              <div className="settingItem">
                <div className="Gray_75">{_l('将扫码的文本结果作为参数传入PBC流程')}</div>
              </div>
              <SelectProcess
                appId={appId}
                projectId={projectId}
                btnSetting={btnSetting}
                setBtnSetting={setBtnSetting}
                setDataSource={setDataSource}
              />
            </Fragment>
          )}
        </Fragment>
      );
    }
    // 调用封装业务流程
    if (action === 6) {
      return (
        <Fragment>
          <ClickConfirm
            config={config}
            btnSetting={btnSetting}
            setBtnSetting={setBtnSetting}
          />
          <SelectProcess
            appId={appId}
            projectId={projectId}
            btnSetting={btnSetting}
            setBtnSetting={setBtnSetting}
            setDataSource={setDataSource}
          />
        </Fragment>
      );
    }
    return null;
  };

  const changeAction = (value) => {
    const data = { ...btnSetting, ...initConfigData, action: value };

    if (value === 5) {
      data.config = {
        ...data.config,
        ...ScanDefaultConfig,
        inputs: [],
      }
    } else if (value === 6) {
      data.config = {
        ...data.config,
        ...ProcessDefaultConfig,
        inputs: [],
      }
    } else {
      data.config = {
        icon: _.get(btnSetting, 'config.icon'),
        iconUrl: _.get(btnSetting, 'config.iconUrl')
      }
    }

    if (_.get(data, ['config', 'isNewBtn'])) {
      const { svgIcon } = _.find(CLICK_ACTION, { value });
      const iconUrl = `${md.global.FileStoreConfig.pubHost}/customIcon/${svgIcon}.svg`;
      delete data.config.isNewBtn;
      data.config = {
        ...data.config,
        icon: svgIcon,
        iconUrl
      }
    }

    setBtnSetting(data);
  }

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
          <div className="iconWrap mRight8" data-tip={_l('复制')} onClick={onCopy}>
            <i className="icon-copy_custom Font20"></i>
          </div>
          <div className="iconWrap" data-tip={_l('删除')} onClick={onDel}>
            <i className="icon-delete_12 Font18"></i>
          </div>
        </div>
      )}
      <div className="settingsBox Relative">
        {displayType === 'setting' ? (
          <Fragment>
            <BtnName
              pageId={pageId}
              projectId={projectId}
              btnSetting={btnSetting}
              btnConfig={btnConfig}
              setBtnSetting={setBtnSetting}
            />
            <div className="settingItem">
              <div className="settingTitle">{_l('操作')}</div>
              {action ? (
                <Dropdown
                  value={action}
                  data={CLICK_ACTION}
                  onChange={value => {
                    changeAction(value);
                  }}
                  menuStyle={{ width: '100%' }}
                  style={{ width: '100%', background: '#fff' }}
                  placeholder={_l('选择执行操作')}
                  border
                />
              ) : (
                <div className="selectActionBox">
                  <Radio.Group onChange={e => { changeAction(e.target.value) }} value={action}>
                    <Space direction="vertical">
                      {CLICK_ACTION.map(item => (
                        <Radio key={item.value} value={item.value}>{item.text}</Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                </div>
              )}
            </div>
            {action && renderConfig()}
          </Fragment>
        ) : (
          <div className="settingItem mTop24">
            <div className="settingTitle">{_l('文本')}</div>
            <Input style={{ width: '100%' }} value={explain} onChange={value => setSetting({ explain: value })} />
          </div>
        )}
      </div>
    </BtnSettingWrap>
  );
}

export default connect(state => ({ appPkg: state.appPkg }))(BtnSetting);
