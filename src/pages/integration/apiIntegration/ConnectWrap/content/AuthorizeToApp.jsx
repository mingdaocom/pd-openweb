import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { LoadDiv, Checkbox, Dropdown, SvgIcon } from 'ming-ui';
import { TableWrap } from 'src/pages/integration/apiIntegration/style';
import { useSetState } from 'react-use';
import { dialogSelectApp, dialogSelectUser } from 'ming-ui/functions';
import { Table, ConfigProvider } from 'antd';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion.js';
import processAjax from 'src/pages/workflow/api/process.js';
import { NODE_TYPE, USER_TYPE } from 'src/pages/workflow/WorkflowSettings/enum.js';
import Member from 'src/pages/workflow/WorkflowSettings/Detail/components/Member/index.jsx';
const TRIGGER_TYPE = {
  ALLOW: 0,
  ONLY_WORKFLOW: 1,
  NO_ALLOW: 2,
};
const Wrap = styled.div`
  width: 880px;
  margin: 22px auto;
  background: #ffffff;
  padding: 36px 24px 24px;
  // border: 1px solid #dddddd;
  border-radius: 10px;
  .noData {
    text-align: center;
    padding-bottom: 140px;
    .iconCon {
      width: 130px;
      height: 130px;
      line-height: 130px;
      background: #f5f5f5;
      border-radius: 50%;
      margin: 80px auto 0;
      color: #9e9e9e;
    }
  }
  .addButtn {
    padding: 8px 24px;
    background: #2196f3;
    border-radius: 21px;
    color: #fff;
    display: inline-block;
    &:hover {
      background: #1764c0;
    }
  }
`;
const WrapCon = styled.div`
  .owerItem {
    border-radius: 26px;
    background: #f5f5f5;
    height: 26px;
    line-height: 26px;
    display: inline-block;
    position: relative;
    margin-bottom: 4px;
    margin-right: 6px;
    img {
      width: 26px;
      height: 26px;
      background: #ffffff;
      border-radius: 50%;
      overflow: hidden;
    }
    .tagDel {
      display: none;
      right: -5px;
      top: -5px;
      position: absolute;
    }
    &:hover {
      .tagDel {
        display: block;
        color: #757575;
        cursor: pointer;
        &:hover {
          color: red;
        }
      }
    }
  }
  .addBtn {
    width: 26px;
    height: 26px;
    line-height: 26px;
    border: 1px solid #ddd;
    border-radius: 50%;
    display: inline-flex;
    vertical-align: top;
    align-items: center;
    justify-content: center;
  }
  .addApp {
    color: #2196f3;
    &:hover {
      color: #1764c0;
    }
  }
  .ant-table-thead > tr > th {
    color: #757575 !important;
  }
  .iconWrap {
    border-radius: 3px;
    width: 36px;
    height: 36px;
  }
  .ant-table.ant-table-small .ant-table-title,
  .ant-table.ant-table-small .ant-table-footer,
  .ant-table.ant-table-small .ant-table-thead > tr > th,
  .ant-table.ant-table-small .ant-table-tbody > tr > td,
  .ant-table.ant-table-small tfoot > tr > th,
  .ant-table.ant-table-small tfoot > tr > td {
    padding: 15px 8px;
    align-items: center;
    display: flex;
  }
  tr {
    display: flex;
  }
  td,
  th {
    flex: 3;
    &:last-child {
      flex: 1;
    }
  }
  .flowDetailMembers {
    display: inline-block;
  }
  .startConditionWrap {
    position: absolute;
    right: initial;
    width: 200px;
    left: 0;
    z-index: 100;
    padding-bottom: 24px;
    top: 26px;
  }
  ul.flowDetailUserList {
    text-align: left;
    i {
      font-size: 18px;
      display: inline-block;
      vertical-align: top;
      margin-top: 9px;
      margin-right: 5px;
      color: #9e9e9e;
    }
    li {
      &:hover {
        i {
          color: #fff !important;
        }
      }
    }
  }
  .ownerInfo img {
    border-radius: 50%;
  }
  .timeDrop {
    width: 85px;
  }
  .logo {
    border-radius: 7px;
    & > div {
      margin: 0 auto;
    }
  }
  .boderRadAll_7 {
    border-radius: 7px !important;
  }
`;
//授权到应用
function AuthorizeToApp(props) {
  const [{ keywords, optionLoading, loading, info, projectId }, setState] = useSetState({
    keywords: '',
    optionLoading: false,
    loading: true,
    info: {
      errorInterval: 120,
    },
    projectId: props.companyId,
  });
  const getProcessConfigInfo = () => {
    setState({ loading: true });
    processAjax
      .getProcessConfig(
        {
          processId: props.processId,
        },
        { isIntegration: true },
      )
      .then(res => {
        setState({ info: res, loading: false });
      });
  };
  const saveProcessConfigInfo = data => {
    processAjax
      .saveProcessConfig(
        {
          processId: props.processId,
          errorNotifiers: data.errorNotifiers,
          errorInterval: data.errorInterval,
          triggerType: data.triggerType,
        },
        { isIntegration: true },
      )
      .then(res => {
        setState({ info: data });
        props.hasChange();
      });
  };
  useEffect(() => {
    getProcessConfigInfo();
  }, []);
  const columns = [
    {
      title: _l('应用名称'),
      dataIndex: 'name',
      render: (text, record) => {
        return (
          <div className="flexRow alignItemsCenter WordBreak">
            <div className="logo iconWrap flexRow alignItemsCenter" style={{ backgroundColor: record.iconColor }}>
              <SvgIcon url={record.iconUrl} fill={'#fff'} size={28} />
            </div>
            <div className="flex mLeft16 WordBreak">{record.name}</div>
          </div>
        );
      },
    },
    {
      title: _l('创建时间'),
      dataIndex: 'createDate',
      render: (text, record) => {
        return <div className="Gray_75">{record.createDate}</div>;
      },
    },
    {
      title: _l('拥有者'),
      dataIndex: 'owner',
      render: (text, record) => {
        return (
          <div className="flexRow ownerInfo alignItemsCenter WordBreak">
            <img src={record.owner.avatar} width={36} />
            <div className="flex pLeft8 WordBreak">{record.owner.fullName}</div>
          </div>
        );
      },
    },
    {
      title: _l('操作'),
      dataIndex: 'option',
      render: (text, record) => {
        // 安装的不可复制和删除、自定义的可以复制与删除
        return (
          <div className="optionCon">
            <span //data-tip={_l('移除')}
              className="ThemeColor3 Hand"
              onClick={() => {
                if (optionLoading) {
                  return;
                }
                authorizeApp([record.id], 2);
              }}
            >
              {_l('移除')}
            </span>
          </div>
        );
      },
    },
  ];

  const renderNoData = () => {
    return (
      <div className="noData">
        <span className="iconCon InlineBlock TxtCenter ">
          <i className="icon-admin-apps Font56 TxtMiddle" />
        </span>
        <p className="Gray_9e mTop32 mBottom0">{_l('无授权应用')}</p>
        {!keywords && (
          <span
            className="addButtn Bold Hand mTop40 Font15"
            onClick={() => {
              onAddApp();
            }}
          >
            {_l('添加应用')}
          </span>
        )}
      </div>
    );
  };

  const dateArr = [
    { text: _l('始终通知'), value: 0 },
    { text: _l('15分钟'), value: 15 },
    { text: _l('1小时'), value: 60 },
    { text: _l('2小时'), value: 120 },
    { text: _l('6小时'), value: 360 },
    { text: _l('12小时'), value: 720 },
    { text: _l('24小时'), value: 1440 },
  ];
  // 授权
  const authorizeApp = (apkIds, type) => {
    if (optionLoading) {
      return;
    }
    setState({
      optionLoading: true,
    });
    packageVersionAjax
      .authorize(
        {
          companyId: projectId,
          apkIds: apkIds,
          id: props.processId,
          type, //: 1, //1添加 2移除
        },
        { isIntegration: true },
      )
      .then(res => {
        setState({
          optionLoading: false,
        });
        props.onFresh();
      });
  };
  const updateSource = data => {
    saveProcessConfigInfo({ ...info, ...data });
  };

  const onAddApp = () => {
    dialogSelectApp({
      projectId: projectId,
      ajaxFun: 'getManagerApps',
      ajaxParam: { projectId: projectId },
      title: _l('选择授权应用'),
      onOk: selectedList => {
        authorizeApp(
          selectedList.map(o => o.appId),
          1,
        );
      },
    });
  };
  /**
   * 添加普通成员
   */
  const addMembers = evt => {
    evt.stopPropagation();

    dialogSelectUser({
      title: _l('选择人员'),
      showMoreInvite: false,
      SelectUserSettings: {
        selectedAccountIds: info.errorNotifiers.map(item => item.roleId),
        projectId: projectId,
        dataRange: 2,
        unique: false,
        callback: users => {
          const members = users.map(item => {
            return {
              type: USER_TYPE.USER,
              entityId: '',
              entityName: '',
              roleId: item.accountId,
              roleName: item.fullname,
              avatar: item.avatar,
            };
          });
          updateSource({ errorNotifiers: info.errorNotifiers.concat(members) });
        },
      },
    });
  };
  if (loading) {
    return <LoadDiv />;
  }
  return (
    <Wrap className="">
      <WrapCon>
        {/* 只能选择组织下的内部成员；
拥有者可以编辑该连接；
发送失败消息通知和N小时内不发送同类错误通知与现有工作流配置相同； */}
        <p className="title Bold Font15">{_l('拥有者')}</p>
        <div className="owerCon mTop13">
          <Member
            type={NODE_TYPE.MESSAGE}
            accounts={info.errorNotifiers}
            updateSource={({ accounts }) => updateSource({ errorNotifiers: accounts })}
            leastOne
            inline
            chatButton={false}
            companyId={projectId}
          />
          <div
            className="TxtCenter Relative Gray_75 ThemeHoverBorderColor3 ThemeHoverColor3 pointer addBtn mTop12 Block"
            onClick={e => {
              addMembers(e);
            }}
          >
            <i className={'icon-plus Font14'} />
          </div>
        </div>
        <div className="topSet flexRow mTop20 LineHeight36">
          <Checkbox
            size="small"
            text={_l('API 调用失败时发送错误消息通知给拥有者')}
            checked={info.triggerType === TRIGGER_TYPE.ALLOW}
            onClick={() => {
              updateSource({
                triggerType: info.triggerType === TRIGGER_TYPE.ALLOW ? TRIGGER_TYPE.NO_ALLOW : TRIGGER_TYPE.ALLOW,
              });
            }}
          />
          <Dropdown
            className="timeDrop mLeft20"
            menuStyle={{ width: '100%' }}
            data={dateArr}
            value={info.errorInterval}
            border
            onChange={errorInterval => updateSource({ errorInterval: errorInterval })}
          />
          <span className="mLeft16">{_l('内不发送同类错误通知')}</span>
        </div>
        <div className="conList">
          <div className="flexRow mTop30">
            <p className="TxtLeft Font15 Bold flex">{_l('将 API 授权给')}</p>
            {props.list.length > 0 && (
              <span
                className="addApp Bold Hand"
                onClick={() => {
                  onAddApp();
                }}
              >
                + {_l('添加应用')}
              </span>
            )}
          </div>
        </div>
        {props.list.length <= 0 ? (
          renderNoData()
        ) : (
          <TableWrap className="mTop20">
            <ConfigProvider>
              <Table
                rowKey={record => record.groupId}
                columns={columns}
                dataSource={props.list}
                pagination={false}
                showSorterTooltip={false}
                size="small"
              />
              {/* {loading && <LoadDiv />} */}
            </ConfigProvider>
          </TableWrap>
        )}
      </WrapCon>
    </Wrap>
  );
}

export default AuthorizeToApp;
