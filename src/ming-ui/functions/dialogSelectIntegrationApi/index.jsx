import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Dialog, LoadDiv, ScrollView, FunctionWrap, SvgIcon } from 'ming-ui';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import { getRgbaByColor } from 'src/pages/widgetConfig/util';
import './index.less';
import { Tooltip } from 'antd';
import _ from 'lodash';

const LINK_TYPES = [
  { text: _l('自定义'), value: 1 },
  { text: _l('安装'), value: 2 },
  { text: _l('授权'), value: 3 },
];
const totalItem = [{ id: '', name: _l('全部'), iconName: 'icon-apps' }];
const pageSize = 1000;
const pageIndex = 1;

class SelectIntegrationApi extends Component {
  constructor(props) {
    super(props);
    this.state = {
      linkList: [],
      apiList: [],
      relationId: '',
      keyword: '',
      apiKeyword: '',
      linkLoading: false,
      apiLoading: false,
      linkType: 1, // 1: 自定义，2: 安装，3: 授权
    };
  }

  componentDidMount() {
    this.getLinkList();
  }

  /**
   * 获取链接列表
   */
  getLinkList = () => {
    const { projectId, appId } = this.props;
    const { linkType, keyword, relationId, linkLoading } = this.state;

    if (linkLoading) return;

    if (this.postList) {
      this.postList.abort();
    }

    this.setState({ linkLoading: true });

    if (linkType === 3) {
      this.postList = packageVersionAjax.getInstallList(
        {
          companyId: projectId,
          pageIndex,
          pageSize,
          keyword,
          hasAuth: true,
          isOwner: false,
          apkId: appId,
        },
        { isIntegration: true },
      );
    } else {
      this.postList = packageVersionAjax.getList(
        {
          companyId: projectId,
          pageIndex,
          pageSize,
          keyword,
          apkId: appId,
          types: [linkType],
        },
        { isIntegration: true },
      );
    }

    this.postList.then(res => {
      const resultList = (linkType === 3 || keyword ? [] : totalItem).concat(res);
      this.setState(
        {
          linkList: resultList,
          pageIndex: pageIndex + 1,
          linkLoading: false,
          isMore: res.length === pageSize,
          relationId:
            relationId && _.find(res, r => r.id === relationId) ? relationId : _.get(_.head(resultList), 'id') || '',
        },
        () => {
          this.getApiList();
        },
      );
    });
  };

  /**
   * 获取api列表
   */
  getApiList = () => {
    const { projectId, appId } = this.props;
    const { relationId, apiKeyword, apiLoading, linkType } = this.state;

    if (apiLoading) return;

    if (this.apiPostList) {
      this.apiPostList.abort();
    }

    this.setState({ apiLoading: true });

    this.apiPostList = packageVersionAjax.getApiList(
      {
        companyId: projectId,
        apkId: appId,
        pageIndex,
        pageSize,
        keyword: apiKeyword,
        types: [linkType],
        ...(relationId ? { relationId } : {}),
      },
      { isIntegration: true },
    );

    this.apiPostList.then(res => {
      this.setState({
        apiList: res,
        apiLoading: false,
      });
    });
  };

  handleClick = () => {
    window.open(`${location.origin}/integration`);
  };

  handleSearch = type => {
    if (type === 'link') {
      this.getLinkList();
    } else {
      this.getApiList();
    }
  };

  renderSearch(type) {
    const keyName = type === 'link' ? 'keyword' : 'apiKeyword';

    return (
      <div className={cx('searchBox', { searchLink: type === 'link' })}>
        <i className="icon-search Font18" onClick={() => this.handleSearch(type)}></i>
        <input
          value={this.state[keyName]}
          placeholder={_l('搜索')}
          onChange={e => this.setState({ [keyName]: e.target.value.trim() })}
          onKeyDown={evt => {
            if (evt.keyCode === 13) {
              this.handleSearch(type);
            }
          }}
        />
        {this.state[keyName] && (
          <i
            className="icon-cancel1 Gray_9e Font15 pointer"
            onClick={() => this.setState({ [keyName]: '' }, () => this.handleSearch(type))}
          ></i>
        )}
      </div>
    );
  }

  render() {
    const { onClose } = this.props;
    const { linkList = [], apiList = [], linkLoading, apiLoading, relationId, linkType } = this.state;

    return (
      <Dialog
        width={880}
        header={null}
        footer={null}
        visible={true}
        onCancel={onClose}
        className="selectIntegrationApi"
      >
        <div className="selectApiContent">
          <div className="linkContent">
            <div className="title">{_l('选择API')}</div>
            <div className="linkBox">
              {LINK_TYPES.map(l => (
                <div
                  className={cx('linkItem', { active: linkType === l.value })}
                  onClick={() =>
                    this.setState(
                      {
                        linkType: l.value,
                        pageIndex: 1,
                        keyword: '',
                        apiKeyword: '',
                        relationId: '',
                        apiList: [],
                        linkList: [],
                      },
                      () => {
                        this.getLinkList();
                      },
                    )
                  }
                >
                  {l.text}
                </div>
              ))}
            </div>

            {this.renderSearch('link')}

            <div className="apiGroup">
              {linkLoading ? (
                <LoadDiv className="mTop15" size="small" />
              ) : _.isEmpty(linkList) ? (
                <div className="emptyChildContent emptyLink">
                  <span className="emptyIcon">
                    <i className="Gray_bd icon-connect" />
                  </span>
                  <span className="Font15 Gray_9e Bold">{_l('暂无可用连接')}</span>
                </div>
              ) : (
                <ScrollView className="apiGroupContent">
                  {linkList.map((item, index) => (
                    <div
                      key={index}
                      className={cx('groupItem', { active: relationId === item.id })}
                      onClick={() => this.setState({ relationId: item.id }, () => this.getApiList())}
                    >
                      {item.iconName && item.id ? (
                        <img src={item.iconName} />
                      ) : (
                        <div className="defaultApi">
                          <i className="icon-connect"></i>
                        </div>
                      )}
                      <span className="ellipsis">{item.name}</span>
                    </div>
                  ))}
                </ScrollView>
              )}
            </div>
            <div className="groupBottom" onClick={this.handleClick}>
              {_l('去集成中心添加')}
              <i className="icon-launch mLeft8 Font14"></i>
            </div>
          </div>

          <div className="apiContent">
            {this.renderSearch('api')}
            {apiLoading ? (
              <LoadDiv className="mTop15" size="small" />
            ) : (
              <Fragment>
                {_.isEmpty(apiList) ? (
                  <div className="emptyChildContent">
                    <span className="emptyIcon">
                      <i className="Gray_bd icon-api" />
                    </span>
                    <span className="Font15 Gray_9e Bold">{_l('暂无可用API')}</span>
                  </div>
                ) : (
                  <div className="childListContent">
                    <ScrollView className="flex">
                      {apiList.map((child, index) => (
                        <div
                          key={index}
                          className="childItem"
                          onClick={() => {
                            this.props.onOk(child.id);
                            this.props.onClose();
                          }}
                        >
                          <div
                            className="iconWrap"
                            style={{ backgroundColor: getRgbaByColor(child.iconColor || '#757575', '0.08') }}
                          >
                            <SvgIcon url={child.iconName} fill={child.iconColor} size={32} />
                            <Tooltip placement="bottom" title={(child.apiPackage || {}).name}>
                              {(child.apiPackage || {}).iconName ? (
                                <img src={child.apiPackage.iconName} />
                              ) : (
                                <div className="defaultIcon">
                                  <i className="icon-connect"></i>
                                </div>
                              )}
                            </Tooltip>
                          </div>
                          <div className="iconDesc">
                            <span className="Bold Font14 ellipsis">{child.name}</span>
                            {child.explain && (
                              <span className="Font12 mTop8 Gray_a ellipsis" title={child.explain}>
                                {child.explain}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </ScrollView>
                  </div>
                )}
              </Fragment>
            )}
          </div>
        </div>
      </Dialog>
    );
  }
}

export default props => FunctionWrap(SelectIntegrationApi, { ...props });
