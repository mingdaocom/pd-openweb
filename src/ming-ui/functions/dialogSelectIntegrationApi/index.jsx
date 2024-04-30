import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Dialog, LoadDiv, ScrollView, FunctionWrap, SvgIcon } from 'ming-ui';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import { getRgbaByColor } from 'src/pages/widgetConfig/util';
import './index.less';
import { Tooltip } from 'antd';
import img from 'staticfiles/images/query.png';
import _ from 'lodash';

const empty_list = [
  _l('快递单号查询'),
  _l('企业名称模糊搜索'),
  _l('未来7日天气查询'),
  _l('企业工商信息搜索'),
  _l('商品条码查询'),
  _l('商品条码查询'),
  _l('人脸身份核验'),
  _l('更多…'),
];

const totalItem = [{ id: '', name: _l('全部'), iconName: 'icon-apps' }];
const pageSize = 30;

class SelectIntegrationApi extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      pageIndex: 1,

      childList: [],
      childPageIndex: 1,

      relationId: '',
      keyword: '',

      loading: true,
      parentLoading: false,
      isMore: false,
      childLoading: false,
      isChildMore: false,
      noData: false,
    };
  }

  componentDidMount() {
    const { projectId, appId } = this.props;

    packageVersionAjax
      .getApiList({ companyId: projectId, types: [1, 2], apkId: appId }, { isIntegration: true })
      .then(res => {
        if (!res.length) {
          this.setState({ noData: true, loading: false });
        } else {
          this.setState({ childList: res, childPageIndex: 2 });
          this.getList();
        }
      });
  }

  getList = () => {
    const { projectId, appId } = this.props;
    const { pageIndex, parentLoading, isMore } = this.state;

    // 加载更多
    if (pageIndex > 1 && ((parentLoading && isMore) || !isMore)) {
      return;
    }

    this.setState({ parentLoading: true });

    if (this.postList) {
      this.postList.abort();
    }

    this.postList = packageVersionAjax.getList(
      {
        companyId: projectId,
        pageIndex,
        pageSize,
        apkId: appId,
        types: [1, 2],
      },
      { isIntegration: true },
    );

    this.postList.then(res => {
      this.setState({
        list: pageIndex === 1 ? totalItem.concat(res) : this.state.list.concat(res),
        pageIndex: pageIndex + 1,
        parentLoading: false,
        loading: false,
        isMore: res.length === pageSize,
      });
    });
  };

  getApiList = () => {
    const { projectId, appId } = this.props;
    const { childPageIndex, childLoading, isChildMore, relationId, keyword } = this.state;

    // 加载更多
    if (childPageIndex > 1 && ((childLoading && isChildMore) || !isChildMore)) {
      return;
    }

    this.setState({ childLoading: true });

    if (this.childPostList) {
      this.childPostList.abort();
    }

    this.childPostList = packageVersionAjax.getApiList(
      {
        companyId: projectId,
        apkId: appId,
        pageIndex: childPageIndex,
        pageSize,
        keyword,
        types: [1, 2],
        ...(relationId ? { relationId } : {}),
      },
      { isIntegration: true },
    );

    this.childPostList.then(res => {
      this.setState({
        childList: childPageIndex === 1 ? res : this.state.childList.concat(res),
        childPageIndex: childPageIndex + 1,
        childLoading: false,
        isChildMore: res.length === pageSize,
      });
    });
  };

  handleClick = () => {
    window.open(`${location.origin}/integration`);
  };

  handleScroll = _.throttle(apiName => {
    this[apiName]();
  }, 200);

  handleUpdate = (obj = {}) => {
    this.setState({ childList: [], childPageIndex: 1, ...obj }, this.getApiList);
  };

  renderContent() {
    const {
      noData,
      list = [],
      childList = [],
      loading,
      childLoading,
      pageIndex,
      childPageIndex,
      relationId,
      keyword,
    } = this.state;
    let content = null;

    if (noData) {
      content = (
        <div className="emptyContent">
          <img src={img} width={180} />
          <div className="Font17 Bold mBottom15">{_l('安装预集成的API，或自定义添加')}</div>
          <div className="tagList">
            {empty_list.map((item, index) => (
              <span key={index} className="tagItem">
                {item}
              </span>
            ))}
          </div>
          <div className="emptyBtn ThemeHoverBGColor3" onClick={this.handleClick}>
            <span className="Font14 Bold">
              {_l('去集成中心安装')}
              <i className="icon-launch mLeft10"></i>
            </span>
          </div>
        </div>
      );
    } else {
      content = (
        <div className="selectApiContent">
          <div className="apiGroup">
            <div className="apiGroupContent">
              <ScrollView className="flex" onScrollEnd={() => this.handleScroll('getList')}>
                {list.map((item, index) => (
                  <div
                    key={index}
                    className={cx('groupItem', { active: relationId === item.id })}
                    onClick={() => this.handleUpdate({ relationId: item.id })}
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
                {loading && pageIndex > 1 && <LoadDiv className="mTop15" size="small" />}
              </ScrollView>
            </div>
            <div className="groupBottom" onClick={this.handleClick}>
              {_l('去集成中心添加')}
              <i className="icon-launch mLeft8 Font14"></i>
            </div>
          </div>
          <div className="childListContent">
            {childLoading && childPageIndex === 1 ? (
              <LoadDiv className="mTop15" size="small" />
            ) : (
              <Fragment>
                {_.isEmpty(childList) ? (
                  <div className="emptyChildContent">
                    <span className="emptyIcon">
                      <i className="Gray_bd icon-api" />
                    </span>
                    <span className="Font15 Gray_9e Bold">{_l('暂无可用API')}</span>
                  </div>
                ) : (
                  <ScrollView className="flex" onScrollEnd={() => this.handleScroll('getApiList')}>
                    {childList.map((child, index) => (
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
                    {childLoading && childPageIndex > 1 && <LoadDiv className="mTop15" size="small" />}
                  </ScrollView>
                )}
              </Fragment>
            )}
          </div>
        </div>
      );
    }

    return (
      <Fragment>
        {_.isEmpty(list) ? null : (
          <div className="headerContent">
            <div className="searchBox">
              <i className="icon-search1 Font24" onClick={this.handleUpdate}></i>
              <input
                value={keyword}
                placeholder={_l('搜索API名称')}
                onChange={e => this.setState({ keyword: e.target.value.trim() })}
                onKeyDown={evt => {
                  if (evt.keyCode === 13) {
                    this.handleUpdate();
                  }
                }}
              />
              {keyword && (
                <i
                  className="icon-cancel1 Gray_9e Font15 pointer"
                  onClick={() => this.handleUpdate({ keyword: '' })}
                ></i>
              )}
            </div>
          </div>
        )}
        {content}
      </Fragment>
    );
  }

  render() {
    const { onClose } = this.props;
    const { loading } = this.state;
    return (
      <Dialog
        width={880}
        header={null}
        footer={null}
        visible={true}
        onCancel={onClose}
        className="selectIntegrationApi"
      >
        {loading ? <LoadDiv className="mTop40" /> : this.renderContent()}
      </Dialog>
    );
  }
}

export default props => FunctionWrap(SelectIntegrationApi, { ...props });
