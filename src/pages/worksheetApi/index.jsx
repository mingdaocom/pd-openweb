import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import ScrollView from 'ming-ui/components/ScrollView';
import LoadDiv from 'ming-ui/components/LoadDiv';
import ajaxRequest from 'src/api/worksheet';
import appManagementAjax from 'src/api/appManagement';
import JsonView from 'react-json-view';
import cx from 'classnames';
import {
  MENU_LIST,
  MENU_LIST_APPENDIX,
  MENU_LIST_APPENDIX_HEADER,
  MENU_LIST_APPROLE,
  appInfoParameters,
  sameParameters,
  SIDEBAR_LIST,
  appRoleErrorData,
  appSuccessData,
} from './config';
import homeApp from 'src/api/homeApp';
import { Icon } from 'ming-ui';
import color from 'color';
import { navigateTo } from 'src/router/navigateTo';
import Skeleton from 'src/router/Application/Skeleton';
import noDataImg from './img/lock.png';
import AliasDialog from 'src/pages/FormSet/components/AliasDialog.jsx';
import SvgIcon from 'src/components/SvgIcon';
import MoreOption from './MoreOption';

class WorksheetApi extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selectId: 'summary',
      dataApp: {},
      loading: true,
      showMoreOption: false,
      appKey: '',
      authorizes: [],
      addLoading: false,
      isError: false,
      showAliasDialog: false,
      numberTypeList: [],
      appInfo: {},
    };
    this.canScroll = true;
  }

  componentDidMount() {
    this.getAppInfo();
  }

  getAppInfo() {
    this.setState({
      loading: true,
    });
    Promise.all([
      // 获取应用详细信息
      homeApp
        .getAppDetail(
          {
            appId: this.getId(),
          },
          {
            silent: true,
          },
        )
        .then(),
      // 获取应用下所有工作表信息
      homeApp
        .getWorksheetsByAppId({
          appId: this.getId(),
          type: 0,
        })
        .then(),
      appManagementAjax.getAuthorizes({ appId: this.getId() }).then(),
      homeApp.getApiInfo({ appId: this.getId() }).then(),
    ]).then(res => {
      const [dataApp = [], worksheetList = [], authorizes = [], appInfo = {}] = res;
      if (worksheetList.length <= 0) {
        this.setState({ isError: true });
      } else {
        this.setState(
          {
            dataApp,
            worksheetList,
            authorizes,
            appInfo,
          },
          () => {
            document.title = dataApp.name + _l(' API说明');
            this.getWorksheetApiInfo(worksheetList[0].workSheetId);
          },
        );
      }
    });
  }

  getAuthorizes = () => {
    appManagementAjax.getAuthorizes({ appId: this.getId() }).then(authorizes => {
      this.setState({
        authorizes,
      });
    });
  };

  addAuthorizes = () => {
    const { authorizes } = this.state;
    this.setState({
      addLoading: true,
    });
    appManagementAjax.addAuthorize({ appId: this.getId() }).then(data => {
      this.setState({
        addLoading: false,
        authorizes: authorizes.concat(data),
      });
    });
  };

  // 获取工作表信息
  getWorksheetApiInfo = worksheetId => {
    Promise.all([
      ajaxRequest
        .getWorksheetApiInfo({
          worksheetId,
          appId: this.getId(),
        })
        .then(),
      ajaxRequest
        .getWorksheetInfo({
          worksheetId,
          getTemplate: true,
        })
        .then(),
    ]).then(result => {
      const [data = [], list = {}] = result;
      this.setState({ data, numberTypeList: list.template.controls || [], loading: false }, () => {
        this.scrollToFixedPosition();
      });
      MENU_LIST.forEach(item => {
        if (item.id === 'List') {
          item.data.forEach(obj => {
            if (obj.name === 'viewId') {
              obj.desc = data[0].views.map(o => {
                return {
                  [o.name]: o.viewId,
                };
              });
            }
          });
        }
      });
    });
  };

  getId() {
    const ids = window.location.pathname.replace(/.*\/worksheetapi\//g, '').split('/');
    return ids[0];
  }

  /**
   * 滚动到固定位置
   */
  scrollToFixedPosition(id) {
    const selectId = id || this.state.selectId;
    setTimeout(() => {
      this.canScroll = true;
      $('.worksheetApiScroll').nanoScroller({ scrollTo: $(`#${selectId}-content`) });
    }, 0);
  }

  /**
   * 设置selectId并滚动(三级工作表需获取数据)
   */
  setSelectId(selectId, worksheetId) {
    this.canScroll = false;
    this.setState({ selectId }, () => {
      if (worksheetId) {
        this.getWorksheetApiInfo(worksheetId);
        return;
      }
      this.scrollToFixedPosition();
    });
  }

  /**
   * 渲染二三级工作表
   */
  renderSideItem() {
    const { worksheetList = [], selectId } = this.state;
    return worksheetList.map(item => {
      const isSelect = selectId.indexOf(item.workSheetId) > -1;
      return (
        <div key={item.workSheetId} className="worksheetApiMenu">
          <div
            className="worksheetApiMenuItem overflow_ellipsis"
            onClick={() => {
              let id = item.workSheetId + MENU_LIST[0].id;
              this.setSelectId(id, item.workSheetId);
            }}
          >
            <i className={cx('mRight5 Gray_9e', isSelect ? 'icon-arrow-down' : 'icon-arrow-right-tip')} />
            {item.workSheetName}
          </div>
          {isSelect
            ? MENU_LIST.map(o => {
                return (
                  <div
                    key={item.workSheetId + o.id}
                    className={cx('worksheetApiMenuItem pLeft58', { active: selectId === item.workSheetId + o.id })}
                    onClick={() => this.setSelectId(item.workSheetId + o.id)}
                  >
                    {o.title}
                  </div>
                );
              })
            : null}
        </div>
      );
    });
  }

  /**
   * 渲染工作表侧栏
   */
  renderWorksheetSide() {
    const { worksheetList = [], selectId } = this.state;
    const isOpen =
      _.findIndex(worksheetList, i => selectId.indexOf(i.workSheetId) > -1) > -1 || selectId === 'worksheetFormInfo';
    return (
      <div className="worksheetApiMenu">
        <div className="worksheetApiMenuTitle" onClick={() => this.setSelectId('worksheetFormInfo')}>
          <i className={cx('mRight5 Gray_9e', isOpen ? 'icon-arrow-down' : 'icon-arrow-right-tip')} />
          {_l('工作表')}
        </div>
        {isOpen ? (
          <Fragment>
            <div
              className={cx('worksheetApiMenuItem', { active: selectId === 'worksheetFormInfo' })}
              onClick={() => this.setSelectId('worksheetFormInfo')}
            >
              {_l('获取工作表结构信息')}
            </div>
            {this.renderSideItem()}
          </Fragment>
        ) : null}
      </div>
    );
  }

  /**
   * 渲染应用角色、筛选侧栏(应用角色为1、筛选为2)
   */
  renderOtherSide(type) {
    const { selectId } = this.state;
    const currentList = type === 1 ? MENU_LIST_APPROLE : MENU_LIST_APPENDIX;
    const isOpen = _.findIndex(currentList, i => selectId === i.id) > -1;

    return (
      <div className="worksheetApiMenu">
        <div
          className="worksheetApiMenuTitle Hand"
          onClick={() => {
            let id = currentList[0].id;
            this.setSelectId(id);
          }}
        >
          <i className={cx('mRight5 Gray_9e', isOpen ? 'icon-arrow-down' : 'icon-arrow-right-tip')} />
          {type === 1 ? _l('应用角色') : _l('筛选')}
        </div>
        {isOpen
          ? currentList.map(o => {
              return (
                <div
                  key={o.id}
                  className={cx('worksheetApiMenuItem', { active: selectId === o.id })}
                  onClick={() => this.setSelectId(o.id)}
                >
                  {o.title}
                </div>
              );
            })
          : null}
      </div>
    );
  }

  /**
   * 渲染内容
   */
  renderContent(item, i) {
    return (
      <Fragment key={i}>
        {MENU_LIST.map((o, i) => (
          <div className="flexRow worksheetApiLi" key={i} id={item.worksheetId + MENU_LIST[i].id + '-content'}>
            {this['render' + o.id](item, i)}
          </div>
        ))}
      </Fragment>
    );
  }

  /**
   * 渲染应用信息
   */
  renderAppInfo() {
    const { appInfo = {} } = this.state;
    const { apiRequest = {}, apiUrl = '' } = appInfo;
    return (
      <Fragment>
        <div className="flex worksheetApiContent1">
          <div className="Font22 bold">{_l('获取应用信息 GET')}</div>
          <div className="mTop24 worksheetApiBorder">{_l('请求URL：') + apiUrl + 'open/app/get'}</div>
          <div className="flexRow worksheetApiLine flexRowHeight bold mTop25">
            <div className="w32">{_l('参数')}</div>
            <div className="mLeft30 w18">{_l('必选')}</div>
            <div className="mLeft30 w14">{_l('类型')}</div>
            <div className="mLeft30 w36">{_l('说明')}</div>
          </div>
          {appInfoParameters.map(o => {
            return (
              <div key={o.name} className="flexRow worksheetApiLine flexRowHeight">
                <div className="w32">{o.name}</div>
                <div className="mLeft30 w18">{o.required}</div>
                <div className="mLeft30 w14">{o.type}</div>
                <div className="mLeft30 w36">{o.desc}</div>
              </div>
            );
          })}
        </div>
        {this.renderRightContent(
          {
            appKey: apiRequest.appKey,
            sign: apiRequest.sign,
          },
          appSuccessData,
          appRoleErrorData,
        )}
      </Fragment>
    );
  }

  /**
   * 渲染工作表信息(工作表结构)
   */
  renderWorksheetInfo() {
    const { data = [] } = this.state;
    return (
      <Fragment>
        <div className="flex worksheetApiContent1">
          <div className="Font22 bold">{_l('获取工作表结构信息 POST')}</div>
          <div className="mTop24 worksheetApiBorder">
            {_l('请求URL：') + data[0].apiUrl + 'worksheet/getWorksheetInfo'}
          </div>
          <div className="flexRow worksheetApiLine flexRowHeight bold mTop25">
            <div className="w32">{_l('参数')}</div>
            <div className="mLeft30 w18">{_l('必选')}</div>
            <div className="mLeft30 w14">{_l('类型')}</div>
            <div className="mLeft30 w36">{_l('说明')}</div>
          </div>
          {sameParameters.map(o => {
            return (
              <div key={o.name} className="flexRow worksheetApiLine flexRowHeight">
                <div className="w32">{o.name}</div>
                <div className="mLeft30 w18">{o.required}</div>
                <div className="mLeft30 w14">{o.type}</div>
                <div className="mLeft30 w36">{o.desc}</div>
              </div>
            );
          })}
        </div>
        {this.renderRightContent({
          appKey: data[0].appKey,
          sign: data[0].sign,
          worksheetId: data[0].worksheetId,
        })}
      </Fragment>
    );
  }

  /**
   * 渲染应用角色
   */
  renderAppRoleContent() {
    const { appInfo = {} } = this.state;
    return (
      <Fragment>
        {MENU_LIST_APPROLE.map(({ id, title, data = [], apiName, successData, errorData }, i) => {
          let dataObj = {};
          data.map(({ name, desc }) => {
            dataObj[name] = _.includes(['appkey, sign'], name) ? (this.state.data[0] || {})[name] : desc;
          });

          return (
            <div className="flexRow worksheetApiLi" id={id + '-content'}>
              <div className="flex worksheetApiContent1">
                {i === 0 && <div className="Font22 bold mBottom40">{_l('应用角色')}</div>}
                <div className="Font17 bold">{title}</div>
                <div className="mTop24 worksheetApiBorder">{_l('请求URL：') + appInfo.apiUrl + apiName}</div>
                <div className="flexRow worksheetApiLine flexRowHeight bold mTop25">
                  <div className="w32">{_l('参数')}</div>
                  <div className="mLeft30 w18">{_l('必选')}</div>
                  <div className="mLeft30 w14">{_l('类型')}</div>
                  <div className="mLeft30 w36">{_l('说明')}</div>
                </div>
                {data.map(o => {
                  return (
                    <div key={o.name} className="flexRow worksheetApiLine flexRowHeight">
                      <div className="w32">{o.name}</div>
                      <div className="mLeft30 w18">{o.required}</div>
                      <div className="mLeft30 w14">{o.type}</div>
                      <div className="mLeft30 w36">{o.desc}</div>
                    </div>
                  );
                })}
              </div>
              {this.renderRightContent(dataObj, successData, errorData)}
            </div>
          );
        })}
      </Fragment>
    );
  }

  /**
   * 渲染附录内容
   */
  renderAppendixContent() {
    const getWidth = (headerData, key) => _.get(_.find(headerData, headerObj => headerObj.key === key) || {}, 'width');

    return (
      <Fragment>
        {MENU_LIST_APPENDIX.map((o, i) => {
          const headerData = MENU_LIST_APPENDIX_HEADER[o.id] || [];
          const isFirst = i === 0;

          return (
            <div className="flexRow worksheetApiLi" key={i} id={MENU_LIST_APPENDIX[i].id + '-content'}>
              <div className="flex worksheetApiContent1">
                {isFirst && <div className="Font22 bold mBottom40">{_l('附录')}</div>}

                <div className="Font17 bold">{o.title}</div>

                {!!headerData.length && (
                  <div className="flexRow worksheetApiLine flexRowHeight bold mTop25">
                    {headerData.map((header, headerIdx) => (
                      <div className={cx(`w${header.width}`, { mLeft30: headerIdx > 0 })}>{header.title}</div>
                    ))}
                  </div>
                )}

                {o.data.map((child, childIdx) => {
                  return (
                    <div key={`${child.id}-${childIdx}`} className="flexRow worksheetApiLine flexRowHeight">
                      <div className={cx(`w${getWidth(headerData, 'name')}`)}>{child.name}</div>
                      {child.required && (
                        <div className={cx(`mLeft30 w${getWidth(headerData, 'required')}`)}>{child.required}</div>
                      )}
                      {child.type && <div className={cx(`mLeft30 w${getWidth(headerData, 'type')}`)}>{child.type}</div>}
                      <div className={cx(`mLeft30 w${getWidth(headerData, 'desc')}`)}>
                        {child.desc}
                        {child.linkid && (
                          <a className="ThemeColor3" onClick={() => this.scrollToFixedPosition(child.linkid)}>
                            {_l('附录')}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}

                {o.id === 'AreaInfo' && (
                  <Fragment>
                    <div className="Font15 bold mTop20">{_l('获取一级省份信息')}</div>
                    <div className="Font14 mTop15">{_l('接口地址：') + __api_server__}FixedData/LoadProvince</div>
                    <div className="Font14">{_l('提交方式：')}POST</div>
                    <div className="Font14">{_l('返回内容：')}JSON</div>

                    <div className="Font15 bold mTop40">{_l('获取二三级 城市/区县信息')}</div>
                    <div className="Font14 mTop15">{_l('接口地址：') + __api_server__}FixedData/LoadCityCountyById</div>
                    <div className="Font14">{_l('提交参数：{"id": "省份or城市id"}')}</div>
                    <div className="Font14">{_l('提交方式：')}POST</div>
                    <div className="Font14">{_l('返回内容：')}JSON</div>
                  </Fragment>
                )}
              </div>

              {isFirst ? (
                this.renderRightContent({
                  controlId: 'ordernumber',
                  dataType: 6,
                  spliceType: 1,
                  filterType: 13,
                  value: '2',
                })
              ) : o.id === 'AreaInfo' ? (
                <div className="flex worksheetApiContent2">
                  <div className="Font14 White mBottom6">{_l('获取一级省份信息')}</div>
                  <JsonView
                    src={o.provinceData}
                    theme="brewer"
                    displayDataTypes={false}
                    displayObjectSize={false}
                    name={null}
                  />

                  <div className="Font14 mTop40 White mBottom6">{_l('获取二三级 城市/区县信息')}</div>
                  <JsonView
                    src={o.cityData}
                    theme="brewer"
                    displayDataTypes={false}
                    displayObjectSize={false}
                    name={null}
                  />
                </div>
              ) : (
                <div className="flex worksheetApiContent2" />
              )}
            </div>
          );
        })}
      </Fragment>
    );
  }

  /**
   * 对照表
   */
  renderTable(item, i) {
    const { showAliasDialog, numberTypeList = [] } = this.state;
    return (
      <Fragment>
        <div className="flex worksheetApiContent1">
          <div className="Font22 bold">{item.name}</div>
          <div className="Font17 bold mTop40">
            {MENU_LIST[0].title}{' '}
            <span
              className="Right Hand Font13"
              style={{ color: '#2196F3' }}
              onClick={() => {
                this.setState({
                  showAliasDialog: !showAliasDialog,
                });
              }}
            >
              {_l('设置字段别名')}
            </span>
          </div>
          <div className="flexRow worksheetApiLine flexRowHeight bold mTop25">
            <div className="w22">{_l('控件ID')}</div>
            <div className="mLeft30 w18">{_l('字段名称')}</div>
            <div className="mLeft30 w14">{_l('类型')}</div>
            <div className="mLeft30 w14">{_l('控件类型编号')}</div>
            <div className="mLeft30 w32">{_l('说明')}</div>
          </div>
          {item.controls.map((o, i) => {
            return (
              <div key={`${o.controlId}-${i}`} className="flexRow worksheetApiLine flexRowHeight">
                <div className="w22">{o.controlId}</div>
                <div className="mLeft30 w18">{o.controlName}</div>
                <div className="mLeft30 w14">{o.type}</div>
                <div className="mLeft30 w14">
                  {_.get(
                    _.find(numberTypeList, numberType => (numberType.alias || numberType.controlId) === o.controlId) ||
                      {},
                    'type',
                  )}
                </div>
                <div className="mLeft30 w32">{o.desc}</div>
              </div>
            );
          })}
        </div>
        {showAliasDialog && (
          <AliasDialog
            showAliasDialog={showAliasDialog}
            list={this.state.data[0].controls}
            worksheetId={item.worksheetId}
            appId={this.getId()}
            setFn={data => {
              this.setState(
                {
                  showAliasDialog: data.showAliasDialog,
                },
                () => {
                  this.getWorksheetApiInfo(item.worksheetId);
                },
              );
            }}
          />
        )}
        <div className="flex worksheetApiContent2" />
      </Fragment>
    );
  }

  /**
   * 授权管理
   */
  renderAuthorizationManagement = () => {
    const { authorizes = [] } = this.state;
    return (
      <Fragment>
        <div className="flex worksheetApiContent1">
          <div className="Font22 bold">{_l('授权管理')}</div>
          {authorizes.length > 0 && (
            <div className="flexRow worksheetApiLine flexRowHeight bold mTop25">
              <div className="w25">AppKey</div>
              <div className="mLeft30 w25">SecretKey</div>
              <div className="mLeft30 w30">Sign</div>
              <div className="mLeft30 w12">{_l('授权类型')}</div>
              <div className="mLeft30 w12">{_l('备注')}</div>
              <div className="mLeft30 w8">{_l('操作')}</div>
            </div>
          )}
          {authorizes.map((o, i) => {
            let str = '';
            switch (o.dispalyType) {
              case 2:
                str = _l('未启用');
                break;
              case 3:
                str = _l('全部');
                break;
              case 4:
                str = _l('只读');
                break;
            }
            return (
              <div key={o.appKey} className="flexRow worksheetApiLine flexRowHeight">
                <div className="w25">{o.appKey}</div>
                <div className="mLeft30 w25">{o.secretKey}</div>
                <div className="mLeft30 w30">{o.sign}</div>
                <div className="mLeft30 w12">{str}</div>
                <div className="mLeft30 w12">{o.remark}</div>
                <div className="mLeft30 w8 Relative">
                  {!o.default && ( // 固定数据不能操作
                    <React.Fragment>
                      <Icon
                        icon="moreop"
                        className="Font18 Hand Relative"
                        onClick={() => {
                          this.setState({ showMoreOption: true, appKey: o.appKey });
                        }}
                      />
                      {this.moreOption(o)}
                    </React.Fragment>
                  )}
                </div>
              </div>
            );
          })}
          <span
            className="addSecretKey Font14 Hand LineHeight28 mTop20 InlineBlock"
            onClick={() => {
              this.addAuthorizes();
            }}
          >
            <Icon icon="add" className="Font18 mRight8" />
            SecretKey
          </span>
          {this.loadingDia()}
        </div>
        <div className="flex worksheetApiContent2" />
      </Fragment>
    );
  };

  loadingDia = () => {
    if (!this.state.addLoading) {
      return;
    }
    return (
      <div className="loadingDia">
        <LoadDiv className="loading" /> {_l('正在生成SecretKey...')}
      </div>
    );
  };

  moreOption = data => {
    const { showMoreOption, appKey = '' } = this.state;
    if (!showMoreOption || appKey !== data.appKey) {
      return;
    }
    return (
      <MoreOption
        getAuthorizes={() => this.getAuthorizes()}
        showMoreOption={this.state.showMoreOption}
        appId={this.getId()}
        data={data}
        setFn={showMoreOption => {
          this.setState({
            showMoreOption: showMoreOption,
          });
        }}
        onClickAwayExceptions={['.setDescDialog']}
        onClickAway={() => this.setState({ showMoreOption: false })}
      />
    );
  };

  /**
   * 渲染请求内容
   */
  renderPostContent(item, i, otherOptions) {
    return (
      <Fragment>
        {this.renderLeftContent(i)}
        {this.renderRightContent(this.setCommonPostParameters(item, otherOptions))}
      </Fragment>
    );
  }

  /**
   * 渲染通用的左内容
   */
  renderLeftContent(i) {
    const { data } = this.state;

    return (
      <div className="flex worksheetApiContent1">
        <div></div>
        <div className="Font17 bold">{MENU_LIST[i].title}</div>
        <div className="mTop24 worksheetApiBorder">{_l('请求URL：') + data[0].apiUrl + MENU_LIST[i].apiName}</div>
        <div className="flexRow worksheetApiLine flexRowHeight bold mTop25">
          <div className="w32">{_l('参数')}</div>
          <div className="mLeft30 w18">{_l('必选')}</div>
          <div className="mLeft30 w14">{_l('类型')}</div>
          <div className="mLeft30 w36">{_l('说明')}</div>
        </div>
        {MENU_LIST[i].data.map(o => {
          return (
            <div key={o.name} className="flexRow worksheetApiLine flexRowHeight">
              <div className="w32">{o.name}</div>
              <div className="mLeft30 w18">{o.required}</div>
              <div className="mLeft30 w14">{o.type}</div>
              <div className="mLeft30 w36">
                {typeof o.desc === 'object' ? JSON.stringify(o.desc) : o.desc}
                {o.linkid && (
                  <a className="ThemeColor3" onClick={() => this.scrollToFixedPosition(o.linkid)}>
                    {_l('附录')}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /**
   * 渲染通用的右内容
   */
  renderRightContent(data, successData, errorData) {
    return (
      <div className="flex worksheetApiContent2">
        <div className="mBottom16 Font14 Gray_bd">{_l('提交数据提示')}</div>
        <JsonView src={data} theme="brewer" displayDataTypes={false} displayObjectSize={false} name={null} />
        {successData ? (
          <Fragment>
            <div className="mTop16 mBottom16 Font14 Gray_bd">{_l('返回数据示例')}</div>
            <JsonView
              src={successData}
              theme="brewer"
              displayDataTypes={false}
              displayObjectSize={false}
              name={_l('成功')}
            />
            <JsonView
              src={errorData}
              theme="brewer"
              displayDataTypes={false}
              displayObjectSize={false}
              name={_l('失败')}
            />
          </Fragment>
        ) : null}
      </div>
    );
  }

  /**
   * 设置通用的请求参数
   */
  setCommonPostParameters(item, otherOptions) {
    return {
      appKey: item.appKey,
      sign: item.sign,
      worksheetId: item.worksheetId,
      ...otherOptions,
    };
  }

  renderMapItem = o => {
    const { numberTypeList = [] } = this.state;
    let { relationValue = [], controlId, value } = o;
    let list = {
      controlId,
      value,
    };
    if (
      _.get(
        _.find(numberTypeList, item => (item.alias || item.controlId) === controlId),
        'type',
      ) === 14
    ) {
      list['editType'] = '数据更新类型，0=覆盖，1=新增（默认0:覆盖，新建记录可不传该参数）';
      list['valueType'] =
        '提交值类型，1=外部文件链接，2=文件流字节编码 base64格式 字符串 (默认1,为1时 外部链接放在value参数中，为2时 文件流base64信息放在controlFiles参数中 )';
      list['controlFiles'] = [
        {
          baseFile: 'base64字符串（文件流字节编码）',
          fileName: '文件名称，带后缀',
        },
      ];
    }

    if (
      _.includes(
        [9, 10, 11],
        _.get(
          _.find(numberTypeList, item => (item.alias || item.controlId) === controlId),
          'type',
        ),
      )
    ) {
      list['valueType'] =
        '提交值类型，1=不增加选项，2=允许增加选项（默认为1，为1时匹配不到已有选项时传入空，为2时，匹配不到时会创建新选项并写入）';
    }

    return relationValue.length <= 0
      ? list
      : {
          ...list,
          relationValue: {
            rowIds: relationValue.rowIds,
            isAdd: relationValue.isAdd,
          },
        };
  };

  /**
   * 新建行记录
   */
  renderAddRow(item, i) {
    return this.renderPostContent(item, i, {
      controls: item.controls.filter(o => o.isSupport).map(o => this.renderMapItem(o)),
    });
  }

  /**
   * 批量新建行记录
   */
  renderAddRows(item, i) {
    return this.renderPostContent(item, i, {
      rows: [item.controls.filter(o => o.isSupport).map(o => this.renderMapItem(o))],
    });
  }

  /**
   * 获取行记录详情
   */
  renderGetDetail(item, i) {
    return this.renderPostContent(item, i, { rowId: _l('行记录ID') });
  }

  /**
   * 获取行记录详情 post
   */
  renderGetDetailPost(item, i) {
    return this.renderPostContent(item, i, { rowId: _l('行记录ID') });
  }

  /**
   * 更新行记录详情
   */
  renderUpdateDetail(item, i) {
    return this.renderPostContent(item, i, {
      rowId: _l('行记录ID'),
      controls: item.controls.filter(o => o.isSupport).map(o => this.renderMapItem(o)),
    });
  }

  /**
   * 批量更新行记录详情
   */
  renderUpdateDetails(item, i) {
    return this.renderPostContent(item, i, {
      rowIds: 'list[string]',
      control: item.controls.filter(o => o.isSupport).map(o => this.renderMapItem(o))[0],
    });
  }

  /**
   * 删除行记录
   */
  renderDel(item, i) {
    return this.renderPostContent(item, i, { rowId: _l('行记录ID，多个用逗号(,)隔开') });
  }

  /**
   * 获取相关记录
   */
  renderRelation(item, i) {
    let otherOptions = {};
    MENU_LIST[i].data.forEach(obj => {
      if (!_.includes(['appKey', 'sign', 'worksheetId'], obj.name)) {
        otherOptions[obj.name] = obj.desc;
      }
    });
    return this.renderPostContent(item, i, otherOptions);
  }

  /**
   * 获取列表
   */
  renderList(item, i) {
    let otherOptions = {
      viewId: _l('视图ID,可为空'),
      pageSize: 50,
      pageIndex: 1,
    };

    MENU_LIST[i].data.forEach(obj => {
      if (!_.includes(['appKey', 'sign', 'worksheetId', 'viewId', 'pageSize', 'pageIndex'], obj.name)) {
        otherOptions[obj.name] = obj.desc;
      }
    });
    otherOptions['filters'] = new Array(3).fill(1).map((o, i) => {
      return {
        controlId: `control${i + 1}`,
        dataType: 6,
        spliceType: 1,
        filterType: 13,
        value: '2',
      };
    });

    return this.renderPostContent(item, i, otherOptions);
  }

  /**
   * scrollView滚动
   */
  scroll = _.throttle((evt, obj) => {
    if (!this.canScroll) {
      return;
    }
    const heightArr = [];
    let totalHeight = 0;
    let isExist = false;

    $('.nano-content .worksheetApiLi').map((index, el) => {
      heightArr.push({
        id: $(el).attr('id').replace('-content', ''),
        h: $(el).height(),
      });
    });
    heightArr.forEach(item => {
      totalHeight += item.h;
      if (!isExist && totalHeight - item.h * 0.3 > obj.position) {
        isExist = true;
        this.setState({ selectId: item.id });
      }
    });
  }, 300);

  render() {
    const { data = [], loading, selectId, dataApp, isError } = this.state;

    if (isError) {
      return (
        <div className="flexColumn h100">
          <div className="errorBox">
            <span>
              <Icon icon="info" />
            </span>
            {_l('无法配置，请先创建工作表')}
          </div>
        </div>
      );
    }

    if (loading) {
      return <LoadDiv />;
    }

    return (
      <div className="flexColumn h100">
        <header className="worksheetApiHeader flexRow pLeft30">
          {data && (
            <React.Fragment>
              <span
                className="appIconWrapIcon"
                style={{
                  backgroundColor: color(dataApp.iconColor),
                }}
                onClick={() => {
                  navigateTo(`/app/${this.getId()}`);
                }}
              >
                <SvgIcon url={dataApp.iconUrl} fill="#fff" size={24} addClassName="mTop3" />
              </span>
              <span
                className="appName Hand bold mRight5"
                onClick={() => {
                  navigateTo(`/app/${this.getId()}`);
                }}
              >
                {dataApp.name}
              </span>
            </React.Fragment>
          )}
          {_l('API说明')}
        </header>
        <div className="flex flexRow">
          <div className="worksheetApiSide h100">
            {data.length <= 0 ? (
              <div className="flexColumn h100">
                <Skeleton active={true} itemStyle={{ background: '#ddd' }} />
              </div>
            ) : (
              <ScrollView>
                {SIDEBAR_LIST.map(({ key, title }) => {
                  return (
                    <div
                      className={cx('worksheetApiMenuTitle', { active: selectId === key })}
                      onClick={() => this.setSelectId(key)}
                    >
                      {title}
                    </div>
                  );
                })}
                {this.renderWorksheetSide()}
                {this.renderOtherSide(1)}
                {this.renderOtherSide(2)}
              </ScrollView>
            )}
          </div>
          <div className="flex h100">
            {data.length <= 0 ? (
              <div className="TxtCenter TxtMiddle noDataApi" style={{ paddingTop: $(document).height() / 3 }}>
                <img src={noDataImg} alt={_l('您不是应用的管理员，无权访问此页面')} width="130" />
                <p className="pTop30 Gray_75 Font17">{_l('您不是应用的管理员，无权访问此页面')}</p>
              </div>
            ) : (
              <ScrollView className="worksheetApiScroll" updateEvent={this.scroll}>
                <div className="flexRow worksheetApiLi" id="summary-content">
                  <div className="flex worksheetApiContent1">
                    <div className="Font22 bold">{_l('概述')}</div>
                    <div className="Font14 mTop15">
                      {_l(
                        '该%0 API提供了一个简单的方法来整合您的%0与任何外部系统的数据。API严格遵循REST语义，使用JSON编码对象，并依赖标准HTTP代码来指示操作结果。',
                        dataApp.name,
                      )}
                    </div>
                  </div>
                  <div className="flex worksheetApiContent2" />
                </div>
                <div className="flexRow worksheetApiLi" id="authorizationInstr-content">
                  {this.renderAuthorizationManagement()}
                </div>
                <div className="flexRow worksheetApiLi" id="appInfo-content">
                  {this.renderAppInfo()}
                </div>
                <div className="flexRow worksheetApiLi" id="worksheetFormInfo-content">
                  {this.renderWorksheetInfo()}
                </div>
                <div id="list-content">{data.map((item, i) => this.renderContent(item, i))}</div>
                {this.renderAppRoleContent()}
                {this.renderAppendixContent()}
              </ScrollView>
            )}
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<WorksheetApi />, document.getElementById('app'));
