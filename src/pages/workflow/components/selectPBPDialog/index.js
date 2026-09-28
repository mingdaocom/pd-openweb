import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LoadDiv, ScrollView, SvgIcon } from 'ming-ui';
import { Input, Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import process from '../../api/process';
import processVersion from '../../api/processVersion';
import ajaxRequest from 'src/api/appManagement';
import appManagement from 'src/api/appManagement';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { RELATION_TYPE } from '../../WorkflowSettings/enum';

const PBP_MODAL_STYLES = {
  body: { padding: 0, display: 'flex', flexDirection: 'column' },
  container: { padding: 0, height: 600 },
};

const NavBox = styled.div`
  width: 250px;
  border-right: 1px solid var(--color-border-secondary);
  padding: 12px 0 24px;
  min-height: 0;
  ul {
    margin: 0 12px;
  }
  li {
    padding: 0 12px;
    height: 36px;
    line-height: 36px;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    &:hover {
      background-color: var(--color-background-hover);
    }
    &.active {
      font-weight: bold;
      background-color: var(--color-background-secondary);
      color: var(--color-primary-focus);
    }
  }
  .createBtn {
    font-size: 13px;
    font-weight: bold;
    border: 1px solid var(--color-border-primary);
    border-radius: 16px;
    height: 32px;
    line-height: 32px;
    cursor: pointer;
    margin: 12px 24px 0;
    text-align: center;
  }
  .appIcon {
    width: 24px;
    height: 24px;
    border-radius: 5px;
    overflow: hidden;
    display: inline-flex;
    justify-content: center;
    margin-right: 10px;
  }
`;

const ContentBox = styled.div`
  min-width: 0;
  .searchBox {
    height: 48px;
    padding: 0 40px 0 20px;
  }
  .emptyContent {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    justify-content: center;
    font-size: 15px;
    color: var(--color-text-tertiary);
  }
  .listItem {
    margin: 0 10px;
    padding: 8px 10px;
    cursor: pointer;
    &:hover {
      background-color: var(--color-background-hover);
    }
    .listItemIcon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 4px;
      background-color: #4c7d9e;
      margin-right: 15px;
      i {
        color: var(--color-white);
      }
    }
    .listItemContent {
      min-width: 0;
    }
  }
`;

class SelectPBPDialog extends Component {
  static propTypes = {
    companyId: PropTypes.string,
    appId: PropTypes.string,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  };
  static defaultProps = {
    companyId: '',
    appId: '',
    onOk: () => {},
    onCancel: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      selectAppId: props.appId,
      selectPBCId: '',
      appList: [],
      list: null,
      keyword: '',
    };
    this.requestPending = false;
  }

  componentDidMount() {
    const { appId } = this.props;

    this.getAppList();
    this.getPBCList(appId);
  }

  /**
   * 获取所有的应用
   */
  getAppList() {
    const { companyId, appId } = this.props;

    ajaxRequest.getManagerApps({ projectId: companyId }).then(result => {
      this.setState({ appList: _.sortBy(result, item => (item.appId === appId ? 0 : 1)) });
    });
  }

  /**
   * 根据应用获取PBC列表
   */
  getPBCList(appId) {
    const list = [];

    if (this.ajaxRequest) {
      this.ajaxRequest.abort();
    }

    this.ajaxRequest = processVersion.list({
      relationId: appId,
      processListType: 10,
    });

    this.ajaxRequest.then(result => {
      this.ajaxRequest = null;

      result.forEach(item => {
        item.processList.forEach(o => {
          list.push({ id: o.id, title: o.name, desc: o.explain });
        });
      });

      this.setState({ list });
    });
  }

  /**
   * 新建封装业务流程
   */
  createNewPBPFlow = () => {
    if (this.requestPending) return;

    const { appId, onClose } = this.props;

    this.requestPending = true;
    return process
      .addProcess({
        companyId: '',
        relationId: appId,
        relationType: RELATION_TYPE.APP,
        startEventAppType: 17,
        name: _l('未命名业务流程'),
      })
      .then(res => {
        appManagement.addWorkflow({ projectId: res.companyId, name: _l('未命名业务流程') });
        window.open(pathCompletion(`/workflowedit/${res.id}`));
        onClose();
      })
      .finally(() => {
        this.requestPending = false;
      });
  };

  render() {
    const { appId, onOk, onClose } = this.props;
    const { appList, selectAppId, keyword } = this.state;
    let { list } = this.state;

    if (list && keyword.trim()) {
      list = list.filter(o => o.title.toLowerCase().includes(keyword.toLowerCase()));
    }

    return (
      <Modal width={1000} open footer={null} styles={PBP_MODAL_STYLES} onCancel={onClose}>
        {!appList.length && <LoadDiv className="mTop15" />}
        {!!appList.length && (
          <div className="flexRow flex h100">
            <NavBox className="flexColumn">
              <div className="Font14 bold mBottom15 pLeft24">{_l('选择封装业务流程')}</div>
              <ScrollView className="flex">
                <ul>
                  {(!(list || []).length && keyword.trim()
                    ? appList.filter(o => o.appName.toLowerCase().includes(keyword.toLowerCase()))
                    : appList
                  ).map((o, index) => (
                    <li
                      key={index}
                      className={cx({ active: o.appId === selectAppId })}
                      onClick={() => {
                        this.setState({ selectAppId: o.appId, list: null, keyword: '' });
                        this.getPBCList(o.appId);
                      }}
                    >
                      <div className="appIcon" style={{ background: o.iconColor }}>
                        <SvgIcon url={o.iconUrl} fill="#fff" size={16} className="mTop4" />
                      </div>
                      <div className="ellipsis flex">{o.appName + (o.appId === appId ? `(${_l('本应用')})` : '')}</div>
                    </li>
                  ))}
                </ul>
              </ScrollView>
              <div className="createBtn hoverColorPrimary hoverBorderColorPrimary" onClick={this.createNewPBPFlow}>
                {_l('新建封装业务流程')}
              </div>
            </NavBox>
            <ContentBox className="flexColumn flex">
              <Input
                className="searchBox"
                value={keyword}
                variant="underlined"
                placeholder={_l('搜索')}
                prefix={<i className="icon-search Font18 textTertiary" />}
                suffix={
                  keyword.trim() ? (
                    <i
                      className="icon-cancel textTertiary Font15 pointer"
                      onMouseDown={event => event.preventDefault()}
                      onClick={() => this.setState({ keyword: '' })}
                    />
                  ) : null
                }
                onChange={e => this.setState({ keyword: e.target.value })}
              />
              {list === null && <LoadDiv className="mTop15" />}
              {list && !list.length && <div className="emptyContent">{_l('暂无数据')}</div>}
              {list && !!list.length && (
                <ScrollView className="flex pTop6 pBottom6">
                  {list.map((o, index) => (
                    <div
                      className="listItem flexRow alignItemsCenter"
                      key={index}
                      onClick={() => {
                        onOk({
                          appId: selectAppId,
                          appName: appList.find(item => item.appId === selectAppId).appName,
                          selectPBCId: o.id,
                          selectPBCName: o.title,
                        });
                        onClose();
                      }}
                    >
                      <div className="listItemIcon">
                        <i className="Font24 icon-pbc" />
                      </div>
                      <div className="listItemContent flexColumn flex">
                        <div className="Font14 bold ellipsis">{o.title}</div>
                        <div className="Font13 textTertiary ellipsis">{o.desc}</div>
                      </div>
                      <i
                        className="Font14 icon-task-new-detail colorPrimary hoverColorPrimaryDark pointer mLeft15"
                        onClick={() => window.open(pathCompletion(`/workflowedit/${o.id}`))}
                      />
                    </div>
                  ))}
                </ScrollView>
              )}
            </ContentBox>
          </div>
        )}
      </Modal>
    );
  }
}

export function useSelectPBPDialog() {
  return useFunctionWrapComponent(SelectPBPDialog);
}
