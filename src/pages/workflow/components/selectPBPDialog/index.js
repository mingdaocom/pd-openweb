import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Dialog, FunctionWrap, LoadDiv, ScrollView } from 'ming-ui';
import process from '../../api/process';
import processVersion from '../../api/processVersion';
import ajaxRequest from 'src/api/appManagement';
import appManagement from 'src/api/appManagement';

const DialogWrapper = styled(Dialog)`
  .mui-dialog-header {
    display: none;
  }
  .mui-dialog-body {
    padding: 0 !important;
    flex-basis: 600px !important;
    display: flex;
    flex-direction: column;
  }
`;

const NavBox = styled.div`
  width: 250px;
  border-right: 1px solid #e0e0e0;
  padding: 12px 0 24px;
  min-height: 0;
  ul {
    margin: 0 12px;
  }
  li {
    padding: 0 12px;
    height: 36px;
    line-height: 36px;
    display: block;
    cursor: pointer;
    font-size: 13px;
    &:hover {
      background-color: #f5f5f5;
    }
    &.active {
      font-weight: bold;
      background-color: #f5f5f5;
      color: #2196f3;
    }
  }
  .createBtn {
    font-size: 13px;
    font-weight: bold;
    border: 1px solid #ddd;
    border-radius: 16px;
    height: 32px;
    line-height: 32px;
    cursor: pointer;
    margin: 12px 24px 0;
    text-align: center;
  }
`;

const ContentBox = styled.div`
  min-width: 0;
  .searchBox {
    height: 48px;
    border-bottom: 1px solid #eaeaea;
    padding: 0 40px 0 20px;
    input {
      border: 0;
      width: 100%;
      height: 100%;
      padding: 0;
      margin-left: 10px;
    }
  }
  .emptyContent {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    justify-content: center;
    font-size: 15px;
    color: #9e9e9e;
  }
  .listItem {
    margin: 12px 13px;
    padding: 10px 15px;
    cursor: pointer;
    &:hover {
      background-color: #f5f5f5;
    }
    .listItemIcon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      border-radius: 4px;
      background-color: #4c7d9e;
      margin-right: 15px;
      i {
        color: #fff;
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
    const { appId, onClose } = this.props;

    process
      .addProcess({
        companyId: '',
        relationId: appId,
        relationType: 2,
        startEventAppType: 17,
        name: _l('未命名业务流程'),
      })
      .then(res => {
        appManagement.addWorkflow({ projectId: res.companyId, name: _l('未命名业务流程') });
        window.open(`/workflowedit/${res.id}`);
        onClose();
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
      <DialogWrapper width={1000} visible footer={null} onCancel={onClose}>
        {!appList.length && <LoadDiv className="mTop15" />}
        {!!appList.length && (
          <div className="flexRow flex h100">
            <NavBox className="flexColumn">
              <div className="Font14 bold mBottom15 pLeft24">{_l('选择封装业务流程')}</div>
              <ScrollView className="flex">
                <ul>
                  {appList.map((o, index) => (
                    <li
                      key={index}
                      className={cx('ellipsis', { active: o.appId === selectAppId })}
                      onClick={() => {
                        this.setState({ selectAppId: o.appId, list: null });
                        this.getPBCList(o.appId);
                      }}
                    >
                      {o.appName + (o.appId === appId ? `(${_l('本应用')})` : '')}
                    </li>
                  ))}
                </ul>
              </ScrollView>
              <div className="createBtn ThemeHoverColor3 ThemeHoverBorderColor3" onClick={this.createNewPBPFlow}>
                {_l('新建封装业务流程')}
              </div>
            </NavBox>
            <ContentBox className="flexColumn flex">
              <div className="searchBox flexRow alignItemsCenter">
                <i className="icon-search Font18 Gray_9e" />
                <input
                  value={keyword}
                  placeholder={_l('搜索')}
                  onChange={e => this.setState({ keyword: e.target.value })}
                />
                {keyword.trim() && (
                  <i className="icon-cancel Gray_9e Font15 pointer" onClick={() => this.setState({ keyword: '' })}></i>
                )}
              </div>
              {list === null && <LoadDiv className="mTop15" />}
              {list && !list.length && <div className="emptyContent">{_l('暂无数据')}</div>}
              {list && !!list.length && (
                <ScrollView className="flex">
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
                        <i className="Font28 icon-pbc" />
                      </div>
                      <div className="listItemContent flexColumn flex">
                        <div className="Font14 bold ellipsis">{o.title}</div>
                        <div className="Font13 Gray_9e ellipsis">{o.desc}</div>
                      </div>
                      <i
                        className="Font14 icon-task-new-detail ThemeColor3 ThemeHoverColor2 pointer mLeft15"
                        onClick={() => window.open(`/workflowedit/${o.id}`)}
                      />
                    </div>
                  ))}
                </ScrollView>
              )}
            </ContentBox>
          </div>
        )}
      </DialogWrapper>
    );
  }
}

export default props => FunctionWrap(SelectPBPDialog, { ...props });
