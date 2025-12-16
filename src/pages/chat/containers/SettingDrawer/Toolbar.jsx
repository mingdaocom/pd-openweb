import React from 'react';
import styled from 'styled-components';
import { Checkbox, Dropdown, Icon, Switch } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import mingoLogo from '../ChatList/Mingo/images/mingo.png';

const Mingo = styled.div`
  width: 25px;
  height: 25px;
  img {
    border-radius: 50%;
    border: 0.5px solid #eaeaea;
  }
`;

export default props => {
  const { accountSettings, handleChangeAccountSettings, handleSureSettings } = props;
  const {
    isOpenMingoAI,
    isOpenMessage,
    isOpenSearch,
    isShowToolName,
    isOpenMessageList,
    isOpenCommonApp,
    commonAppShowType,
    commonAppOpenType,
    messageListShowType,
  } = accountSettings;
  const isLocal = md.global.Config.IsLocal && !location.hostname.includes('nocoly.com');

  return (
    <div className="flex">
      <div className="Font14 Gray bold">{_l('工具')}</div>
      <div className="Font13 Gray_75 mTop10 mBottom10">{_l('设置在侧边栏中显示的工具')}</div>
      <div className="flexRow alignItemsCenter widthMaxContent mBottom15">
        <Tooltip placement="bottom" title={_l('此工具不允许被关闭')}>
          <div>
            <Switch checked={isOpenMessage} disabled={true} />
          </div>
        </Tooltip>
        <Icon icon="chat-line" className="Font22 Gray_75 mLeft10" />
        <span className="mLeft5 mRight10">{_l('消息')}</span>
      </div>
      <div className="flexRow alignItemsCenter widthMaxContent mBottom15">
        <Switch
          checked={isOpenSearch}
          onClick={value => {
            handleSureSettings('isOpenSearch', !value ? 1 : 0, () => {
              handleChangeAccountSettings({
                isOpenSearch: !value,
              });
            });
          }}
        />
        <Icon icon="search" className="Font22 Gray_75 mLeft10" />
        <span className="mLeft5 mRight10">{_l('超级搜索')}</span>
      </div>
      {!md.global.SysSettings.hideAIBasicFun && !isLocal && (
        <div className="flexRow alignItemsCenter widthMaxContent mBottom15">
          <Switch
            checked={isOpenMingoAI}
            onClick={value => {
              handleSureSettings('isOpenMingoAI', !value ? 1 : 0, () => {
                handleChangeAccountSettings({
                  isOpenMingoAI: !value,
                });
              });
            }}
          />
          <Mingo className="flexRow alignItemsCenter justifyContentCenter mLeft10">
            <img src={mingoLogo} className="w100" />
          </Mingo>
          <span className="mLeft5 mRight10">Mingo</span>
          <Icon icon="ai-l" className="Font18" style={{ color: '#6E09F9' }} />
        </div>
      )}
      {/*
      <div className="flexRow alignItemsCenter widthMaxContent mBottom15">
        <Switch
          checked={isOpenFavorite}
          onClick={value => {
            handleSureSettings('isOpenFavorite', !value ? 1 : 0, () => {
              handleChangeAccountSettings({
                isOpenFavorite: !value,
              });
            });
          }}
        />
        <Icon icon="fav-line" className="Font22 Gray_75 mLeft10" />
        <span className="mLeft5 mRight10">{_l('收藏')}</span>
      </div>
      */}
      <span className="flexRow alignItemsCenter widthMaxContent pointer mTop20">
        <Checkbox
          checked={isShowToolName}
          onClick={value => {
            handleSureSettings('isShowToolName', !value ? 1 : 0, () => {
              handleChangeAccountSettings({
                isShowToolName: !value,
              });
            });
          }}
        >
          {_l('显示工具名称')}
        </Checkbox>
      </span>
      <div className="divider mTop20 mBottom20" />
      <div className="Font14 Gray bold">{_l('快捷方式')}</div>
      <div className="Font13 Gray_75 mTop10 mBottom10">{_l('设置在工具下方显示的快捷方式列表')}</div>
      <div className="flexRow alignItemsCenter widthMaxContent mBottom10">
        <Switch
          checked={isOpenMessageList}
          onClick={value => {
            handleSureSettings('isOpenMessageList', !value ? 1 : 0, () => {
              handleChangeAccountSettings({
                isOpenMessageList: !value,
              });
            });
          }}
        />
        <span className="mLeft10">{_l('消息列表')}</span>
      </div>
      {isOpenMessageList && (
        <div className="mLeft60 mTop10 mBottom20">
          <Dropdown
            className="w100 Gray"
            border
            value={messageListShowType}
            data={[
              { text: _l('新消息在前'), value: 1 },
              { text: _l('置顶消息在前'), value: 2 },
            ]}
            onChange={value => {
              handleSureSettings('messageListShowType', value, () => {
                handleChangeAccountSettings({
                  messageListShowType: value,
                });
              });
            }}
          />
        </div>
      )}
      <div className="flexRow alignItemsCenter widthMaxContent">
        <Switch
          checked={isOpenCommonApp}
          onClick={value => {
            handleSureSettings('isOpenCommonApp', !value ? 1 : 0, () => {
              handleChangeAccountSettings({
                isOpenCommonApp: !value,
              });
            });
          }}
        />
        <span className="mLeft10">{_l('常用应用')}</span>
      </div>
      {isOpenCommonApp && (
        <div className="mLeft60 mTop10">
          <Dropdown
            className="w100 Gray"
            border
            value={commonAppShowType}
            data={[
              { text: _l('显示最近访问的应用'), value: 1 },
              { text: _l('显示收藏的应用'), value: 2 },
            ]}
            onChange={value => {
              handleSureSettings('commonAppShowType', value, () => {
                handleChangeAccountSettings({
                  commonAppShowType: value,
                });
              });
            }}
          />
          <div className="flexRow alignItemsCenter mTop10">
            <div className="mRight10">{_l('打开方式')}</div>
            <Dropdown
              className="flex Gray"
              border
              value={commonAppOpenType}
              data={[
                { text: _l('当前页面打开'), value: 1 },
                { text: _l('新页面打开'), value: 2 },
              ]}
              onChange={value => {
                handleSureSettings('commonAppOpenType', value, () => {
                  handleChangeAccountSettings({
                    commonAppOpenType: value,
                  });
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
