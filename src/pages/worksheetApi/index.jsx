import React, { Component, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import JsonView from 'react-json-view';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import { Avatar, Dialog, Icon, LoadDiv, ScrollView, Textarea, Tooltip } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import homeApp from 'src/api/homeApp';
import ajaxRequest from 'src/api/worksheet';
import integrationAjax from 'src/pages/integration/api/syncTask';
import processAjax from 'src/pages/workflow/api/process';
import { SHARE_STATE, ShareState, VerificationPass } from 'worksheet/components/ShareState';
import preall from 'src/common/preall';
import AliasDialog from 'src/pages/FormSet/components/AliasDialog';
import { FIELD_TYPE_LIST } from 'src/pages/workflow/WorkflowSettings/enum';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';
import { setFavicon } from 'src/utils/app';
import FiltersGenerate from './components/FiltersGenerate';
import Header from './components/Header';
import RequestFormat from './components/RequestFormat';
import Summary from './components/Summary';
import WorkAliasDialog from './components/WorkAliasDialog';
import {
  appInfoParameters,
  appRoleErrorData,
  appSuccessData,
  ERROR_CODE,
  MENU_LIST_APPENDIX,
  MENU_LIST_APPROLE,
  OPTIONS_FUNCTION_LIST,
  sameParameters,
} from './core/apiV2Config';
import {
  ADD_API_CONTROLS,
  ADD_WORKSHEET_SUCCESS,
  DATA_PIPELINE_FILTERS,
  DATA_PIPELINE_MENUS,
  MENU_LIST_APPENDIX_HEADER,
  WORKSHEETINFO_SUCCESS_DATA,
} from './core/applicationConfig';
import { MENU_LIST_MAP, SIDEBAR_LIST_MAP, TAB_TYPE } from './core/enum';
import noDataImg from './img/lock.png';
import MoreOption from './MoreOption';
import SecretKey from './SecretKey';
import './index.less';

const FIELD_TYPE = FIELD_TYPE_LIST.concat([
  { text: _l('对象'), value: 10000006, en: 'object' },
  { text: _l('文本'), value: 1, en: 'string' },
]);

class WorksheetApi extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selectId: props.isSharePage ? 'summary' : 'authorizationInstr',
      dataApp: {},
      loading: true,
      showMoreOption: false,
      appKey: '',
      authorizes: [],
      addSecretKey: false,
      errorCode: 0, // 1：工作表不存在 2：应用过期
      aliasDialog: { visible: false, type: 'control' },
      templateControls: [],
      sheetSwitchPermit: [],
      appInfo: {},
      whiteListDialog: false,

      showWorksheetAliasDialog: false,
      // 新增 / 编辑选项集参数列表
      addOptionsParams: [],

      // 获取选项集参数列表
      getOptionsParams: [],

      // 封装业务流程
      selectWorkflowId: '',
      pbcList: [],
      workflowInfo: {},
      shareVisible: false,
      dataPipelineList: undefined,
      expandIds: [],
      webhookList: [],
      visibleAppKeys: [],
      visibleSigns: [],
      tabIndex: TAB_TYPE[props.isSharePage ? 'API_V2' : 'APPLICATION'],
      // 工作流别名相关
      workflowAliasDialog: false,
      workflowAlias: '',
    };
    this.canScroll = true;
    this.contentScrollRef = React.createRef();
  }

  componentDidMount() {
    this.getAppInfo();
  }

  get MENU_LIST() {
    const { tabIndex } = this.state;

    return MENU_LIST_MAP[tabIndex] || [];
  }

  getAppInfo() {
    const { isSharePage, shareData = {} } = this.props;

    this.setState({
      loading: true,
    });

    const promiseList = isSharePage
      ? [
          // 获取应用下所有工作表信息
          homeApp.getWorksheetsByAppId({
            appId: this.getId(),
            type: 0,
          }),
          homeApp.getApiInfo({ appId: this.getId() }),

          // 获取选项集参数接口
          ajaxRequest.addOrUpdateOptionSetApiInfo(),
          ajaxRequest.optionSetListApiInfo(),
          processAjax.getProcessListApi({ relationId: this.getId() }),
        ]
      : [
          // 获取应用下所有工作表信息
          homeApp.getWorksheetsByAppId({
            appId: this.getId(),
            type: 0,
          }),
          homeApp.getApiInfo({ appId: this.getId() }),
          // 获取选项集参数接口
          ajaxRequest.addOrUpdateOptionSetApiInfo(),
          ajaxRequest.optionSetListApiInfo(),
          processAjax.getProcessListApi({ relationId: this.getId() }),
          // 获取应用详细信息
          homeApp.getApp(
            {
              appId: this.getId(),
            },
            {
              silent: true,
            },
          ),
          appManagementAjax.getAuthorizes({ appId: this.getId() }),
        ];

    Promise.all(promiseList).then(res => {
      let resArr = isSharePage ? res.concat([undefined, undefined]) : res;
      const [
        worksheetList = [],
        appInfo = {},
        addOptionsParams = [],
        getOptionsParams = [],
        processList = [],
        dataApp = {},
        authorizes = [],
      ] = resArr;

      if (isSharePage) {
        dataApp.iconUrl = shareData.appIcon;
        dataApp.id = shareData.appId;
        dataApp.iconColor = shareData.appIconColor;
        dataApp.name = shareData.appName;
        dataApp.projectId = shareData.projectId;
        dataApp.navColor = shareData.appNavColor;
      }

      setFavicon(dataApp.iconUrl, dataApp.iconColor);

      for (const item of addOptionsParams.requestParams || []) {
        item.required = item.isRequired ? _l('是') : _l('否');
        item.type = item.dataType;
        item.desc = item.description;
      }
      for (const item of getOptionsParams.requestParams || []) {
        item.required = item.isRequired ? _l('是') : _l('否');
        item.type = item.dataType;
        item.desc = item.description;
      }
      if (dataApp.appStatus === 20) {
        this.setState({ errorCode: 2 });
      }
      // else if (worksheetList.length <= 0) {
      //   this.setState({ errorCode: 1 });
      // }
      else {
        this.setState(
          {
            dataApp,
            worksheetList,
            authorizes,
            appInfo,
            addOptionsParams,
            getOptionsParams,
            pbcList: processList.filter(l => l.startAppType !== 7),
            webhookList: processList.filter(l => l.startAppType === 7),
          },
          () => {
            document.title = dataApp.name + ' - ' + _l('API说明');
            if (worksheetList.length > 0) {
              this.getWorksheetApiInfo(worksheetList[0].workSheetId);
            } else {
              this.setState({ loading: false });
            }
          },
        );
      }
    });
  }

  getAuthorizes = () => {
    appManagementAjax.getAuthorizes({ appId: this.getId() }).then(authorizes => {
      this.setState({ authorizes });
    });
  };

  // 获取工作表信息
  getWorksheetApiInfo = worksheetId => {
    const { selectId } = this.state;
    Promise.all([
      // 获取工作表信息
      ajaxRequest.getWorksheetApiInfo({
        worksheetId,
        appId: this.getId(),
      }),

      // 获取工作表信息
      ajaxRequest.getWorksheetInfo({
        worksheetId,
        getTemplate: true,
      }),
    ]).then(result => {
      let [data = [], list = {}] = result;
      const isDataPipeline = selectId.includes('dataPipeline');

      if (list.alias) {
        data = data.map(o => {
          return { ...o, alias: list.alias };
        });
      }

      if (!isDataPipeline) {
        this.MENU_LIST.forEach(item => {
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
      }

      this.setState(
        {
          [isDataPipeline ? 'dataPipelineData' : 'data']: data,
          templateControls: list.template.controls || [],
          sheetSwitchPermit: list.switches,
          loading: false,
          alias: list.alias,
        },
        () => {
          this.scrollToFixedPosition();
        },
      );
    });
  };

  // 获取工作流信息
  getWorkflowApiInfo = processId => {
    processAjax.getProcessApiInfo({ processId, relationId: this.getId() }).then(res => {
      this.setState({ workflowInfo: { ...res, processId } }, () => {
        this.scrollToFixedPosition();
      });
    });
  };

  getDataPipelineWorksheet = () => {
    const { appInfo } = this.state;

    this.setState({ dataPipelineLoading: true });

    integrationAjax
      .list(
        {
          projectId: _.get(appInfo, 'apiResponse.projectId'),
          appId: _.get(appInfo, 'apiResponse.appId'),
          status: 'RUNNING',
          pageSize: 1000,
          pageNo: 0,
          taskType: 1,
        },
        { isAggTable: true },
      )
      .then(res => {
        this.setState({ dataPipelineList: res.content, dataPipelineLoading: false });
      });
  };

  getId() {
    const { isSharePage } = this.props;
    if (isSharePage) {
      return this.props.appId;
    }
    const ids = window.location.pathname.replace(/.*\/worksheetapi\//g, '').split('/');
    return ids[0];
  }

  /**
   * 滚动到固定位置
   */
  scrollToFixedPosition(id) {
    const selectId = (id || this.state.selectId).replace('dataPipeline', '');

    if (!$(`#${selectId}-content`)[0]) return;

    setTimeout(() => {
      this.canScroll = true;
      if (this.contentScrollRef.current) {
        this.contentScrollRef.current.scrollToElement($(`#${selectId}-content`)[0]);
      }
    }, 0);
  }

  /**
   * 设置selectId并滚动(三级工作表需获取数据)
   */
  setSelectId({ selectId, worksheetId, workflowId, expandIds }) {
    this.canScroll = false;
    this.setState(
      { selectId, selectWorkflowId: workflowId, workflowInfo: {}, expandIds: expandIds || this.state.expandIds },
      () => {
        if (worksheetId) {
          this.getWorksheetApiInfo(worksheetId);
          return;
        }
        if (workflowId) {
          this.getWorkflowApiInfo(workflowId);
          return;
        }

        if (selectId === 'dataPipeline' && !this.state.dataPipelineList) {
          this.getDataPipelineWorksheet();
          return;
        }

        this.scrollToFixedPosition();
      },
    );
  }

  /**
   * 渲染二三级工作表
   */
  renderSideItem(props) {
    const { worksheetList = [], selectId, dataPipelineList = [], expandIds = [] } = this.state;
    const type = _.get(props, 'type') || 'worksheetCreateForm';
    const list =
      type === 'dataPipeline' ? this.MENU_LIST.filter(l => DATA_PIPELINE_MENUS.includes(l.id)) : this.MENU_LIST;

    return (type === 'dataPipeline' ? dataPipelineList : worksheetList).map(item => {
      const worksheetId = item.workSheetId || item.worksheetId;
      const isSelect = (expandIds[1] || '').includes(worksheetId);
      const prefix = type === 'dataPipeline' ? type : '';

      return (
        <div key={worksheetId} className="worksheetApiMenu">
          <div
            className="worksheetApiMenuItem overflow_ellipsis"
            onClick={() => {
              let id = prefix + worksheetId + this.MENU_LIST[0].id;
              isSelect
                ? this.setState({ expandIds: [expandIds[0]] })
                : this.setSelectId({
                    selectId: id,
                    worksheetId: worksheetId,
                    expandIds: [expandIds[0], id],
                  });
            }}
          >
            <i className={cx('mRight5 Gray_9e', isSelect ? 'icon-arrow-down' : 'icon-arrow-right-tip')} />
            {item.workSheetName || item.name}
          </div>
          {isSelect
            ? list.map(o => {
                return (
                  <div
                    key={worksheetId + o.id}
                    className={cx('worksheetApiMenuItem pLeft58 overflow_ellipsis', {
                      active: selectId === `${prefix}${worksheetId}${o.id}`,
                    })}
                    onClick={() => this.setSelectId({ selectId: `${prefix}${worksheetId}${o.id}` })}
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
    const { selectId, expandIds = [], tabIndex } = this.state;
    const isOpen = expandIds[0] === 'worksheetCreateForm';

    return (
      <div className="worksheetApiMenu">
        <div
          className="worksheetApiMenuTitle"
          onClick={() => {
            isOpen
              ? this.setState({ expandIds: [] })
              : this.setSelectId({
                  selectId: 'worksheetCreateForm',
                  expandIds: ['worksheetCreateForm'],
                });
          }}
        >
          <i className={cx('mRight5 Gray_9e', isOpen ? 'icon-arrow-down' : 'icon-arrow-right-tip')} />
          {_l('工作表')}
        </div>
        {isOpen && (
          <Fragment>
            {tabIndex === TAB_TYPE.API_V2 && (
              <Fragment>
                {[
                  { id: 'worksheetCreateForm', label: _l('新建工作表') },
                  { id: 'worksheetFormInfo', label: _l('获取工作表结构信息') },
                ].map(({ id, label }) => (
                  <div
                    key={id}
                    className={cx('worksheetApiMenuItem overflow_ellipsis', {
                      active: selectId === id,
                    })}
                    onClick={() => this.setSelectId({ selectId: id })}
                  >
                    {label}
                  </div>
                ))}
              </Fragment>
            )}

            {this.renderSideItem()}
          </Fragment>
        )}
      </div>
    );
  }

  // 渲染聚合表侧栏
  renderDataPipelineSide() {
    const { expandIds = [], dataPipelineLoading } = this.state;
    const isOpen = expandIds[0] === 'dataPipeline';

    return (
      <div className="worksheetApiMenu">
        <div
          className="worksheetApiMenuTitle"
          onClick={() =>
            isOpen
              ? this.setState({ expandIds: [] })
              : this.setSelectId({ selectId: 'dataPipeline', expandIds: ['dataPipeline'] })
          }
        >
          <i className={cx('mRight5 Gray_9e', isOpen ? 'icon-arrow-down' : 'icon-arrow-right-tip')} />
          {_l('聚合表')}
        </div>
        {dataPipelineLoading && <LoadDiv />}
        {isOpen && this.renderSideItem({ type: 'dataPipeline' })}
      </div>
    );
  }

  /**
   * 渲染封装业务流程、webhook侧栏
   */
  renderPBCSide({ type, listKey, title }) {
    const { selectWorkflowId, expandIds = [] } = this.state;
    const isOpen = expandIds[1] === type;

    if (!this.state[listKey].length) return null;

    const list = this.state[listKey];

    return (
      <div className="worksheetApiMenu">
        <div
          className="worksheetApiMenuItem"
          onClick={() => {
            isOpen
              ? this.setState({ expandIds: [] })
              : this.setSelectId({
                  selectId: 'workflowInfo',
                  workflowId: list[0].id,
                  expandIds: [expandIds[0], type],
                });
          }}
        >
          <i className={cx('mRight5 Gray_9e', isOpen ? 'icon-arrow-down' : 'icon-arrow-right-tip')} />
          {title}
        </div>
        {isOpen &&
          list.map(item => {
            return (
              <div
                className={cx('worksheetApiMenuItem pLeft58 overflow_ellipsis', {
                  active: item.id === selectWorkflowId,
                })}
                onClick={() => this.setSelectId({ selectId: 'workflowInfo', workflowId: item.id })}
              >
                {item.name + ' POST'}
              </div>
            );
          })}
      </div>
    );
  }

  /**
   * 渲染工作流侧栏
   */
  renderWorkflow() {
    const { expandIds = [] } = this.state;
    const isOpen = expandIds[0] === 'workflow';
    return (
      <div className="worksheetApiMenu">
        <div
          className="worksheetApiMenuTitle"
          onClick={() => {
            isOpen
              ? this.setState({ expandIds: [], selectId: '' })
              : this.setSelectId({ expandIds: ['workflow'], selectId: 'workflow' });
          }}
        >
          <i className={cx('mRight5 Gray_9e', isOpen ? 'icon-arrow-down' : 'icon-arrow-right-tip')} />
          {_l('工作流')}
        </div>
        {isOpen && (
          <Fragment>
            {[
              { type: 'workflowInfo', listKey: 'pbcList', title: _l('封装业务流程') },
              { type: 'webhook', listKey: 'webhookList', title: _l('Webhook') },
            ].map(item => this.renderPBCSide(item))}
          </Fragment>
        )}
      </div>
    );
  }

  /**
   * 渲染应用角色、筛选侧栏(应用角色为1、筛选为2)
   */
  renderOtherSide(type) {
    const { selectId, addOptionsParams, getOptionsParams, expandIds } = this.state;
    OPTIONS_FUNCTION_LIST[0].data = addOptionsParams.requestParams;
    OPTIONS_FUNCTION_LIST[1].data = getOptionsParams.requestParams;
    OPTIONS_FUNCTION_LIST[2].data = addOptionsParams.requestParams;
    const { title, currentList } = [
      {
        title: _l('应用角色'),
        currentList: MENU_LIST_APPROLE,
      },
      {
        title: _l('筛选'),
        currentList: MENU_LIST_APPENDIX,
      },
      {
        title: _l('选项集'),
        currentList: OPTIONS_FUNCTION_LIST,
      },
    ][type];
    const isOpen = expandIds[0] === currentList[0].id;

    return (
      <div className="worksheetApiMenu">
        <div
          className="worksheetApiMenuTitle Hand"
          onClick={() => {
            let id = currentList[0].id;
            isOpen ? this.setState({ expandIds: [] }) : this.setSelectId({ selectId: id, expandIds: [id] });
          }}
        >
          <i className={cx('mRight5 Gray_9e', isOpen ? 'icon-arrow-down' : 'icon-arrow-right-tip')} />
          {title}
        </div>
        {isOpen
          ? currentList.map(o => {
              return (
                <div
                  key={o.id}
                  className={cx('worksheetApiMenuItem overflow_ellipsis', { active: selectId === o.id })}
                  onClick={() => this.setSelectId({ selectId: o.id })}
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
  renderContent(item, i, type = 'worksheet') {
    const menuList =
      type === 'dataPipeline' ? this.MENU_LIST.filter(l => DATA_PIPELINE_MENUS.includes(l.id)) : this.MENU_LIST;

    return (
      <Fragment key={i + type}>
        {menuList.map((o, i) => {
          const index = _.findIndex(this.MENU_LIST, l => l.id === o.id);
          return (
            <div
              className="flexRow worksheetApiLi"
              key={i + type}
              id={item.worksheetId + this.MENU_LIST[index].id + '-content'}
            >
              {['FieldTable', 'ViewTable'].includes(o.id)
                ? this.renderComparisonTable(item, i, type)
                : this.renderWorksheetCommon(item, index, type)}
            </div>
          );
        })}
      </Fragment>
    );
  }

  /**
   * 渲染应用信息
   */
  renderAppInfo() {
    const { appInfo = {} } = this.state;
    const { apiRequest = {}, apiUrl = '' } = appInfo;
    const url = apiUrl + 'open/app/get';
    return (
      <Fragment>
        <div className="worksheetApiContent1">
          <div className="Font22 bold">{_l('获取应用信息 GET')}</div>
          <input className="mTop24 worksheetApiInput" value={_l('请求URL：') + url} />
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
        {this.renderRightContent({
          data: this.getUrl(url, {
            appKey: apiRequest.appKey || 'YOUR_APP_KEY',
            sign: apiRequest.sign || 'YOUR_SIGN',
          }),
          successData: appSuccessData,
          errorData: appRoleErrorData,
        })}
      </Fragment>
    );
  }

  /**
   * 渲染工作表信息(工作表结构)
   */
  renderWorksheetInfo() {
    const { data = [] } = this.state;
    if (data.length <= 0) {
      return null;
    }
    return (
      <Fragment>
        <div className="worksheetApiContent1">
          <div className="Font22 bold">{_l('获取工作表结构信息 POST')}</div>
          <input
            className="mTop24 worksheetApiInput"
            value={_l('请求URL：') + data[0].apiUrl + 'worksheet/getWorksheetInfo'}
          />
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
          data: {
            appKey: data[0].appKey || 'YOUR_APP_KEY',
            sign: data[0].sign || 'YOUR_SIGN',
            worksheetId: data[0].alias || data[0].worksheetId,
          },
          successData: WORKSHEETINFO_SUCCESS_DATA,
          errorData: appRoleErrorData,
        })}
      </Fragment>
    );
  }

  /**
   * 渲染新建工作表
   */
  renderCreateWorksheet() {
    const { data = [], appInfo } = this.state;
    if (data.length <= 0) {
      return null;
    }
    const sectionIds = _.get(appInfo, 'apiResponse.sections').flatMap(l => {
      let items = l.items.filter(it => it.type === 2);
      if (items.length === 0) return l;

      let items2 = items.map(m => {
        return {
          ...m,
          keyName: `${l.name}-${m.name}`,
        };
      });

      return [l].concat(items2);
    });
    const sectionIdsFlat = sectionIds.map(l => {
      return {
        [l.keyName || l.name]: l.id || l.sectionId,
      };
    });

    let param = [
      {
        name: 'appKey',
        required: _l('是'),
        type: 'string',
        desc: 'AppKey',
      },
      {
        name: 'sign',
        required: _l('是'),
        type: 'string',
        desc: _l('签名'),
      },
      {
        name: 'name',
        required: _l('是'),
        type: 'string',
        desc: _l('工作表名称'),
      },
      {
        name: 'alias',
        required: _l('否'),
        type: 'string',
        desc: _l('别名'),
      },
      {
        name: 'sectionId',
        required: _l('否'),
        type: 'string',
        desc: JSON.stringify(sectionIdsFlat),
      },
      {
        name: 'controls',
        required: _l('是'),
        type: 'list',
        desc: () => {
          return (
            <Fragment>
              <div>{_l('控件数据，传参规范见右侧示例')}</div>
              <div>{_l('controlName：控件名称，必填')}</div>
              <div>{_l('alias：控件别名')}</div>
              <div>
                {_l(
                  'type：控件类型，目前支持控件类型有 2:文本、6:数值、9:单选、10:多选、46:时间、15:日期（年-月-日）、16:日期 （年-月-日 时:分）、26:成员、14:附件、29:关联记录',
                )}
              </div>
              <div>{_l('required：是否必选，true：必填，false：非必填')}</div>
              <div>{_l('attribute：标题字段标识，1:标题，0:非标题，工作表中只能设置一个标题字段')}</div>
              <div>{_l('dot：保留小数位（0-14），控件类型为6:数值,8:金额时填入')}</div>
              <div>
                {_l(
                  'enumDefault：类型为26:成员时，表示成员数量，填入规则 0：单选,1：多选。类型为29:关联记录时，表示关联记录数量，填入规则 1：单条 2：多条',
                )}
              </div>
              <div>{_l('options：选项信息，控件类型为 11:单选,10:多选时填入')}</div>
              <div>{_l('max：等级最大值，控件类型为28:等级时填入,填入规则（0-10）')}</div>
              <div>{_l('dataSource：数据源 id，类型为 29 （关联记录）时传入,表示关联表 id)')}</div>
              <div>
                {_l(
                  'advancedSetting: 类型为15、16 日期时传入，格式{“showtype": “6”}，显示类型 5：年 4：年月 3：年月日 2：年月日时 1：年月日时分 6：年月日时分秒',
                )}
              </div>
              <div>{_l('unit：类型为46时间时传入，1：时分，6：时分秒')}</div>
            </Fragment>
          );
        },
      },
    ];

    return (
      <Fragment>
        <div className="worksheetApiContent1">
          <div className="Font22 bold">{_l('新建工作表 POST')}</div>
          <input
            className="mTop24 worksheetApiInput"
            value={_l('请求URL：') + data[0].apiUrl + 'worksheet/addWorksheet'}
          />
          <div className="flexRow worksheetApiLine flexRowHeight bold mTop25">
            <div className="w32">{_l('参数')}</div>
            <div className="mLeft30 w18">{_l('必选')}</div>
            <div className="mLeft30 w14">{_l('类型')}</div>
            <div className="mLeft30 w36">{_l('说明')}</div>
          </div>
          {param.map(o => {
            return (
              <div key={o.name} className="flexRow worksheetApiLine flexRowHeight">
                <div className="w32">{o.name}</div>
                <div className="mLeft30 w18">{o.required}</div>
                <div className="mLeft30 w14">{o.type}</div>
                <div className="mLeft30 w36">{typeof o.desc === 'function' ? o.desc() : o.desc}</div>
              </div>
            );
          })}
        </div>
        {this.renderRightContent({
          data: {
            appKey: data[0].appKey || 'YOUR_APP_KEY',
            sign: data[0].sign || 'YOUR_SIGN',
            name: data[0].name || 'NAME',
            alias: data[0].alias,
            sectionId: appInfo.apiResponse.sections[0].sectionId || 'sectionId',
            controls: ADD_API_CONTROLS,
          },
          successData: ADD_WORKSHEET_SUCCESS,
          errorData: appRoleErrorData,
        })}
      </Fragment>
    );
  }

  /**
   * 渲染工作流信息
   */
  renderWorkflowInfo() {
    const { workflowInfo, tabIndex, webhookList } = this.state;
    const isWebhook = !!_.find(webhookList, l => l.id === workflowInfo.processId);
    let inputExample = {};
    let outputExample = {};

    const renderInputs = source => {
      return source.map(o => {
        if (o.dataSource && _.find(workflowInfo.inputs, item => item.controlId === o.dataSource).type === 10000007) {
          return null;
        }

        return (
          <Fragment>
            <div key={o.controlId} className="flexRow worksheetApiLine flexRowHeight">
              <div className="w32">
                {o.dataSource && <span className="pLeft20" />}
                {o.alias || o.controlName}
              </div>
              <div className="mLeft30 w18">{o.required ? _l('是') : _l('否')}</div>
              <div className="mLeft30 w14">{FIELD_TYPE.find(obj => obj.value === o.type).text}</div>
              <div className="mLeft30 w36">{o.desc}</div>
            </div>
            {renderInputs(workflowInfo.inputs.filter(item => item.dataSource === o.controlId))}
          </Fragment>
        );
      });
    };
    const renderOutputs = source => {
      return source.map(o => {
        if (o.dataSource && _.find(workflowInfo.outputs, item => item.controlId === o.dataSource).type === 10000007) {
          return null;
        }

        return (
          <Fragment>
            <div key={o.controlId} className="flexRow worksheetApiLine flexRowHeight">
              <div className="w32">
                {o.dataSource && <span className="pLeft20" />}
                {o.alias || o.controlName}
              </div>
              <div className="mLeft30 w36">{o.desc}</div>
            </div>
            {renderOutputs(workflowInfo.outputs.filter(item => item.dataSource === o.controlId))}
          </Fragment>
        );
      });
    };

    if (_.isEmpty(workflowInfo)) return null;

    if (workflowInfo.outType === 1) {
      inputExample['callbackURL'] = '';
    }
    workflowInfo.inputs
      .filter(item => !item.dataSource)
      .forEach(item => {
        inputExample[item.alias || item.controlName] =
          item.value && _.includes([10000003, 10000007, 10000008], item.type)
            ? JSON.parse(item.value)
            : item.value || '';
      });

    workflowInfo.outputs
      .filter(item => !item.dataSource)
      .forEach(item => {
        outputExample[item.alias || item.controlName] =
          item.value && _.includes([10000003, 10000007, 10000008], item.type)
            ? JSON.parse(item.value)
            : item.value || '';
      });

    return (
      <Fragment>
        <div className="worksheetApiContent1">
          <div className="Font22 bold">{workflowInfo.name + ' POST'}</div>
          {/* <div className="Font14 bold mTop20">
            <span className="mRight20 Gray_75">
              {_l('流程ID：')}
              {workflowInfo.processId}
            </span>
            <span className="Gray_75">
              {_l('流程别名：')}
              {workflowAlias}
            </span>
            {tabIndex === TAB_TYPE.APPLICATION && (
              <span
                className="Hand Font13 mLeft20"
                style={{ color: '#1677ff' }}
                onClick={() => this.setState({ workflowAliasDialog: true })}
              >
                {_l('设置')}
              </span>
            )}
          </div> */}
          {tabIndex === TAB_TYPE.API_V2 && (
            <input className="mTop24 worksheetApiInput" value={_l('请求URL：') + workflowInfo.url} />
          )}
          <div className="valignWrapper justifyContentBetween Font17 bold mTop30">
            <span>{_l('请求参数')}</span>
            {/* {tabIndex === TAB_TYPE.APPLICATION && (
              <span className="Hand Font13 mLeft20" style={{ color: '#1677ff' }}>
                {_l('设置参数别名')}
              </span>
            )} */}
          </div>
          <div className="flexRow worksheetApiLine flexRowHeight bold mTop25">
            <div className="w32">{_l('参数')}</div>
            <div className="mLeft30 w18">{_l('必选')}</div>
            <div className="mLeft30 w14">{_l('类型')}</div>
            <div className="mLeft30 w36">{_l('说明')}</div>
          </div>
          {workflowInfo.outType === 1 && (
            <div className="flexRow worksheetApiLine flexRowHeight">
              <div className="w32">callbackURL</div>
              <div className="mLeft30 w18">{_l('否')}</div>
              <div className="mLeft30 w14">{_l('文本')}</div>
              <div className="mLeft30 w36">{_l('用于接受流程执行完毕输出的参数')}</div>
            </div>
          )}
          {renderInputs(workflowInfo.inputs.filter(o => !o.dataSource))}
          {tabIndex === TAB_TYPE.API_V2 && !isWebhook && (
            <Fragment>
              <div className="Font17 bold mTop30">{_l('响应参数')}</div>
              <div className="bold mTop10">
                {workflowInfo.outType === 1
                  ? _l('将向回调地址（请求时附带的参数callbackURL）返回以下内容，如果未附带该参数将不做返回')
                  : _l('将直接向请求地址返回以下参数')}
              </div>
              <div className="flexRow worksheetApiLine flexRowHeight bold mTop25">
                <div className="w32">{_l('参数')}</div>
                <div className="mLeft30 w36">{_l('说明')}</div>
              </div>
              {renderOutputs(workflowInfo.outputs.filter(o => !o.dataSource))}
            </Fragment>
          )}
        </div>
        {/* 修改工作流别名 */}
        {/* {workflowAliasDialog && (
          <WorkAliasDialog
            type="workflow"
            onClose={() => this.setState({ workflowAliasDialog: false })}
            alias={workflowAlias}
            appId={this.getId()}
            updateAlias={alias => {
              this.setState({
                workflowAlias: alias,
                data: this.state.data.map(o => ({ ...o, alias })),
                showWorksheetAliasDialog: false,
              });
            }}
          />
        )} */}

        {this.renderRightContent({ data: inputExample, outputData: outputExample })}
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
        {MENU_LIST_APPROLE.map(({ id, isGet, title, data = [], apiName, successData, errorData }, i) => {
          const url = appInfo.apiUrl + apiName;
          let dataObj = {};
          data.map(({ name, desc, example }) => {
            dataObj[name] = _.includes(['appKey', 'sign'], name)
              ? (this.state.data[0] || {})[name] || { appKey: 'YOUR_APP_KEY', sign: 'YOUR_SIGN' }[name]
              : example || desc;
          });

          return (
            <div className="flexRow worksheetApiLi" id={id + '-content'}>
              <div className="worksheetApiContent1">
                {i === 0 && <div className="Font22 bold mBottom40">{_l('应用角色')}</div>}
                <div className="Font17 bold">{title}</div>
                <input className="mTop24 worksheetApiInput" value={_l('请求URL：') + url} />
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
              {this.renderRightContent({ data: isGet ? this.getUrl(url, dataObj) : dataObj, successData, errorData })}
            </div>
          );
        })}
      </Fragment>
    );
  }

  /**
   * 拼接url
   */
  getUrl(url = '', data = {}) {
    let curUrl = url + '?';
    for (let key in data) {
      curUrl += key + '=' + data[key] + '&';
    }
    curUrl = curUrl.substring(0, curUrl.length - 1);
    return { URL: curUrl };
  }

  onCopy(text) {
    copy(text, { format: 'text/plain' });
    alert(_l('已复制'));
  }

  /**
   * 渲染附录内容
   */
  renderAppendixContent(list) {
    const getWidth = (headerData, key) => _.get(_.find(headerData, headerObj => headerObj.key === key) || {}, 'width');
    const data = list || MENU_LIST_APPENDIX;

    return (
      <Fragment>
        {data.map((o, i) => {
          const headerData = MENU_LIST_APPENDIX_HEADER[o.id] || [];
          const isFirst = !list && i === 0;

          return (
            <div className="flexRow worksheetApiLi" key={i} id={data[i].id + '-content'}>
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
                    <div className="Font15 bold mTop20">{_l('获取地区信息')}</div>
                    <div className="Font14 mTop15">
                      {_l('接口地址：') + __api_server__.main}FixedData/getCitysByParentID
                    </div>
                    <div className="Font14">{_l('提交参数：{"parentId": "国家or省份or城市id", "keywords": ""}')}</div>
                    <div className="Font14">{_l('提交方式：')}POST</div>
                    <div className="Font14">{_l('返回内容：')}JSON</div>
                  </Fragment>
                )}
              </div>

              {isFirst ? (
                this.renderRightContent({
                  data: {
                    controlId: 'ordernumber',
                    dataType: 6,
                    spliceType: 1,
                    filterType: 13,
                    value: '2',
                  },
                })
              ) : o.id === 'AreaInfo' ? (
                <div className="worksheetApiContent2">
                  <div className="Font14 mTop20 White mBottom6">{_l('获取地区信息')}</div>
                  <JsonView
                    src={o.cityData}
                    theme="brewer"
                    displayDataTypes={false}
                    displayObjectSize={false}
                    name={null}
                  />
                </div>
              ) : (
                <div className="worksheetApiContent2" />
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
  renderComparisonTable(item, i, type) {
    const { isSharePage } = this.props;
    const {
      aliasDialog = {},
      templateControls = [],
      showWorksheetAliasDialog,
      alias,
      dialogType,
      dataApp,
      sheetSwitchPermit,
    } = this.state;
    const isFieldTable = i === 0;
    const data = item[this.MENU_LIST[i].type === 'control' ? 'controls' : 'views'];

    return (
      <Fragment>
        <div className="flex worksheetApiContent1">
          {isFieldTable && (
            <React.Fragment>
              <div className="flexRow alignItemsCenter">
                <div className="Font22 bold flex">{item.name}</div>
                {!isSharePage && (
                  <FiltersGenerate
                    controls={templateControls}
                    projectId={dataApp.projectId}
                    appId={this.getId()}
                    sheetSwitchPermit={sheetSwitchPermit}
                  />
                )}
              </div>
              <div className="Font14 bold mTop20 mBottom40">
                <span className="mRight20 Gray_75">{_l('工作表ID：') + item.worksheetId}</span>
                <span className="Gray_75">{_l('工作表别名：') + (alias || '')}</span>
                {!isSharePage && (
                  <span
                    className="Hand Font13 mLeft20"
                    style={{ color: '#1677ff' }}
                    onClick={() => this.setState({ showWorksheetAliasDialog: true, dialogType: type })}
                  >
                    {_l('设置')}
                  </span>
                )}
              </div>
            </React.Fragment>
          )}

          <div className="Font17 bold">
            {this.MENU_LIST[i].title}
            {!isSharePage && (
              <span
                className="Right Hand Font13"
                style={{ color: '#1677ff' }}
                onClick={() => {
                  this.setState({ aliasDialog: { visible: true, type: this.MENU_LIST[i].type }, dialogType: type });
                }}
              >
                {this.MENU_LIST[i].btnText}
              </span>
            )}
          </div>
          <div className="flexRow worksheetApiLine flexRowHeight bold mTop25">
            {this.MENU_LIST[i].fields.map(field => (
              <div key={field.key} className={field.className}>
                {field.text}
              </div>
            ))}
          </div>
          {(isFieldTable ? item.controls : item.views).map((o, index) => {
            return (
              <div key={`${o.controlId || o.viewId}-${index}`} className="flexRow worksheetApiLine flexRowHeight">
                {this.MENU_LIST[i].fields.map(field => (
                  <div key={`data-${field.key}`} className={field.className}>
                    {['controlId', 'viewId'].includes(field.key) && (
                      <React.Fragment>
                        <div>{o[field.key]}</div>
                        {o.alias && <div>({o.alias})</div>}
                      </React.Fragment>
                    )}

                    {field.key === 'numberType' &&
                      _.get(_.find(templateControls, numberType => numberType.controlId === o.controlId) || {}, 'type')}

                    {field.key === 'viewType' && (_.find(VIEW_TYPE_ICON, { id: VIEW_DISPLAY_TYPE[o.type] }) || {}).text}

                    {!['controlId', 'viewId', 'numberType', 'viewType'].includes(field.key) && o[field.key]}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        {aliasDialog.visible && aliasDialog.type === this.MENU_LIST[i].type && dialogType === type && (
          <AliasDialog
            type={this.MENU_LIST[i].type}
            data={data}
            controlTypeList={data}
            worksheetId={item.worksheetId}
            appId={this.getId()}
            onClose={isUpdate => {
              this.setState({ aliasDialog: { visible: false }, dialogType: undefined });
              isUpdate && this.getWorksheetApiInfo(item.worksheetId);
            }}
          />
        )}
        {showWorksheetAliasDialog && dialogType === type && isFieldTable && (
          <WorkAliasDialog
            onClose={() => this.setState({ showWorksheetAliasDialog: false, dialogType: undefined })}
            alias={alias}
            appId={this.getId()}
            worksheetId={item.worksheetId}
            updateAlias={alias => {
              this.setState({
                alias,
                data: this.state.data.map(o => ({ ...o, alias: alias })),
                showWorksheetAliasDialog: false,
                dialogType: undefined,
              });
            }}
          />
        )}
        <div className="worksheetApiContent2" />
      </Fragment>
    );
  }

  /**
   * 授权管理
   */
  renderAuthorizationManagement = () => {
    const { authorizes = [], addSecretKey, visibleAppKeys, visibleSigns } = this.state;

    const renderIconRow = (visibleState, text) => {
      const visible = this.state[visibleState].includes(text);

      return (
        <div className="flexRow alignItemsCenter mTop4">
          <Tooltip text={visible ? _l('隐藏') : _l('显示')}>
            <Icon
              icon={visible ? 'visibility_off' : 'eye_off'}
              className="Font16 pointer Gray_75 ThemeHoverColor2"
              onClick={() => {
                this.setState({
                  [visibleState]: visible
                    ? this.state[visibleState].filter(item => item !== text)
                    : this.state[visibleState].concat(text),
                });
              }}
            />
          </Tooltip>
          <Tooltip text={_l('复制')}>
            <Icon
              icon="copy"
              className="Font16 pointer Gray_75 ThemeHoverColor2 mLeft8"
              onClick={() => this.onCopy(text)}
            />
          </Tooltip>
        </div>
      );
    };

    return (
      <Fragment>
        <div className="worksheetApiContent1">
          <div className="Font22 bold">{_l('授权管理')}</div>
          {authorizes.length > 0 && (
            <div className="flexRow worksheetApiLine flexRowHeight bold mTop25">
              <div className="w14">{_l('名称')}</div>
              <div className="mLeft10 w12">AppKey</div>
              <div className="mLeft10 w26">Sign</div>
              <div className="mLeft10 w18">{_l('授权类型')}</div>
              <div className="mLeft10 w22">{_l('创建者')}</div>
              <div className="mLeft10 w8">{_l('操作')}</div>
            </div>
          )}
          {authorizes.map(o => {
            return (
              <div key={o.appKey} className="flexRow worksheetApiLine flexRowHeight pTop8 pBottom8">
                <div className="w14">{o.name}</div>
                <div className="mLeft10 w12">
                  {visibleAppKeys.includes(o.appKey) && <div>{o.appKey}</div>}
                  <div className="Gray_9e">{o.remark}</div>
                  {renderIconRow('visibleAppKeys', o.appKey)}
                </div>
                <div className="mLeft10 w26">
                  {visibleSigns.includes(o.sign) && <div>{o.sign}</div>}
                  {renderIconRow('visibleSigns', o.sign)}
                </div>
                <div className="mLeft10 w18">
                  <div>
                    {o.status === 2
                      ? _l('授权已关闭')
                      : o.type === 1
                        ? _l('本应用全部接口')
                        : o.type === 2
                          ? _l('本应用只读接口')
                          : _l('自定义')}
                  </div>
                  {o.status !== 2 && o.viewNull && <div>{_l('空视图参数不返回数据')}</div>}
                </div>
                <div className="mLeft10 w22">
                  <div className="flexRow alignItemsCenter">
                    <Avatar src={_.get(o, 'creater.avatar')} size={20} />
                    <div className="mLeft4">{_.get(o, 'creater.fullname')}</div>
                  </div>
                  <div className="mTop4">{o.createTime}</div>
                </div>
                <div className="mLeft10 w8 Relative">
                  <Icon
                    icon="more_horiz"
                    className="Font18 Hand Relative"
                    onClick={() => {
                      this.setState({ showMoreOption: true, appKey: o.appKey });
                    }}
                  />
                  {this.moreOption(o)}
                </div>
              </div>
            );
          })}
          <span
            className="addSecretKey Font14 Hand LineHeight28 mTop20 InlineBlock"
            onClick={() => this.setState({ addSecretKey: true })}
          >
            <Icon icon="add" className="Font18 mRight8" />
            {_l('新建授权密钥')}
          </span>
          {addSecretKey && (
            <SecretKey
              appId={this.getId()}
              getAuthorizes={this.getAuthorizes}
              onClose={() => this.setState({ addSecretKey: false })}
            />
          )}
        </div>
        <div className="worksheetApiContent2" />
      </Fragment>
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
        onClickAwayExceptions={['.mui-dialog-container', '.tencent-captcha__transform']}
        onClickAway={() => this.setState({ showMoreOption: false })}
      />
    );
  };

  /**
   * IP 白名单
   */
  renderWhiteList = () => {
    const { dataApp, whiteListDialog } = this.state;

    return (
      <Fragment>
        <div className="worksheetApiContent1">
          <div className="Font22 bold">{_l('IP 白名单')}</div>
          <div className="mTop24">
            {_l('在 IP 白名单内的 IP 来源地址才能发起请求。未设置则所有 IP 来源都可发起请求。')}
          </div>
          {(dataApp.openApiWhiteList || []).map((ip, index) => {
            return (
              <div className={index === 0 ? 'mTop20' : ''} key={index}>
                {ip}
              </div>
            );
          })}
          <div className="mTop20">
            <span className="addSecretKey Font14 Hand" onClick={() => this.setState({ whiteListDialog: true })}>
              {_l('修改')}
            </span>
          </div>
        </div>
        <div className="worksheetApiContent2" />

        {whiteListDialog && (
          <Dialog
            className="addSheetFieldDialog"
            title={_l('IP 白名单')}
            visible={true}
            width={480}
            onOk={() => {
              const whiteList = _.uniq(
                this.whiteList.value
                  .split('\n')
                  .filter(o => o.trim())
                  .map(o => o.trim()),
              );
              let hasError = false;

              whiteList.forEach(ip => {
                if (!/^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/.test(ip)) {
                  hasError = true;
                }
              });

              if (hasError) {
                alert(_l('请输入正确的 IP 地址'), 2);
              } else {
                homeApp
                  .editWhiteList({ appId: dataApp.id, projectId: dataApp.projectId, whiteIps: whiteList })
                  .then(res => {
                    if (res.data) {
                      this.setState({
                        dataApp: Object.assign({}, dataApp, { openApiWhiteList: whiteList }),
                        whiteListDialog: false,
                      });
                    } else {
                      alert(_l('修改失败'), 2);
                    }
                  });
              }
            }}
            onCancel={() => this.setState({ whiteListDialog: false })}
          >
            <Textarea
              className="w100"
              defaultValue={(dataApp.openApiWhiteList || []).join('\n')}
              minHeight={150}
              maxHeight={400}
              placeholder={_l('请填写 IP 地址，一行一个')}
              spellCheck={false}
              manualRef={whiteList => {
                this.whiteList = whiteList;
              }}
            />
          </Dialog>
        )}
      </Fragment>
    );
  };

  /**
   * 渲染请求内容
   */
  renderPostContent(item, i, otherOptions, rightOptions = {}) {
    if (this.state.data.length <= 0) {
      return null;
    }
    const url = this.state.data[0].apiUrl + this.MENU_LIST[i].apiName;

    return (
      <Fragment>
        {this.renderLeftContent(i)}
        {this.renderRightContent({
          data: this.MENU_LIST[i].isGet
            ? this.getUrl(url, this.setCommonPostParameters(item, otherOptions))
            : this.setCommonPostParameters(item, otherOptions),
          errorData: appRoleErrorData,
          ...rightOptions,
        })}
      </Fragment>
    );
  }

  /**
   * 渲染通用的左内容
   */
  renderLeftContent(i) {
    const { data = [] } = this.state;

    if (data.length <= 0) {
      return null;
    }

    return (
      <div className="worksheetApiContent1">
        <div />
        <div className="Font17 bold">{this.MENU_LIST[i].title}</div>
        <input
          className="mTop24 worksheetApiInput"
          value={_l('请求URL：') + data[0].apiUrl + this.MENU_LIST[i].apiName}
        />
        <div className="flexRow worksheetApiLine flexRowHeight bold mTop25">
          <div className="w32">{_l('参数')}</div>
          <div className="mLeft30 w18">{_l('必选')}</div>
          <div className="mLeft30 w14">{_l('类型')}</div>
          <div className="mLeft30 w36">{_l('说明')}</div>
        </div>
        {this.MENU_LIST[i].data.map(o => {
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
  renderRightContent({ data, successData, errorData, outputData }) {
    return (
      <div className="worksheetApiContent2">
        <div className="mBottom16 Font14 Gray_bd">{_l('提交数据提示')}</div>
        <JsonView src={data} theme="brewer" displayDataTypes={false} displayObjectSize={false} name={null} />
        {successData ? (
          <Fragment>
            <div className="mTop16 mBottom16 Font14 Gray_bd">{_l('返回数据示例')}</div>
            {successData && (
              <JsonView
                src={successData}
                theme="brewer"
                displayDataTypes={false}
                displayObjectSize={false}
                name={_l('成功')}
              />
            )}
            <JsonView
              src={errorData}
              theme="brewer"
              displayDataTypes={false}
              displayObjectSize={false}
              name={_l('失败')}
            />
          </Fragment>
        ) : null}

        {!!outputData && (
          <Fragment>
            <div className="mTop16 mBottom16 Font14 Gray_bd">{_l('返回数据示例')}</div>{' '}
            <JsonView src={outputData} theme="brewer" displayDataTypes={false} displayObjectSize={false} name={null} />
          </Fragment>
        )}
      </div>
    );
  }

  /**
   * 设置通用的请求参数
   */
  setCommonPostParameters(item, otherOptions) {
    return {
      appKey: item.appKey || 'YOUR_APP_KEY',
      sign: item.sign || 'YOUR_SIGN',
      worksheetId: item.alias || item.worksheetId,
      ...otherOptions,
    };
  }

  renderMapItem = o => {
    const { templateControls = [] } = this.state;
    let { relationValue = [], controlId, value, alias } = o;
    let list = {
      controlId: alias || controlId,
      value,
    };
    if (
      _.get(
        _.find(templateControls, item => item.controlId === controlId),
        'type',
      ) === 14
    ) {
      list['editType'] = _l('数据更新类型，0=覆盖，1=新增（默认0:覆盖，新建记录可不传该参数）');
      list['valueType'] = _l(
        '提交值类型，1=外部文件链接，2=文件流字节编码 base64格式 字符串 (默认1,为1时 外部链接放在value参数中，为2时 文件流base64信息放在controlFiles参数中 )',
      );
      list['controlFiles'] = [
        {
          baseFile: _l('base64字符串（文件流字节编码）'),
          fileName: _l('文件名称，带后缀'),
        },
      ];
    }

    if (
      _.includes(
        [9, 10, 11],
        _.get(
          _.find(templateControls, item => item.controlId === controlId),
          'type',
        ),
      )
    ) {
      list['valueType'] = _l(
        '提交值类型，1=不增加选项，2=允许增加选项（默认为1，为1时匹配不到已有选项时传入空，为2时，匹配不到时会创建新选项并写入）',
      );
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

  fillFilters() {
    return new Array(3).fill(1).map((o, i) => {
      return {
        controlId: `control${i + 1}`,
        dataType: 6,
        spliceType: 1,
        filterType: 13,
        value: '2',
      };
    });
  }

  fillControls = (item, isSupportSys = false) => {
    return item.controls
      .filter(o => o.isSupport && (isSupportSys || o.controlId.length > 20 || o.controlId === 'ownerid'))
      .map(o => this.renderMapItem(o));
  };

  renderWorksheetCommon(item, i, type) {
    const specification = this.MENU_LIST[i];
    const rightOptions = {};
    const needFilter = type === 'dataPipeline' && DATA_PIPELINE_FILTERS[specification.id];
    const otherOptions =
      _.omit(specification.requestData, needFilter ? DATA_PIPELINE_FILTERS[specification.id] : []) || {};

    if (needFilter)
      specification.data = specification.data.filter(l => !DATA_PIPELINE_FILTERS[specification.id].includes(l.name));
    if (specification.successData) rightOptions.successData = specification.successData;
    if (specification.errorData) rightOptions.errorData = specification.errorData;
    if (specification.id === 'List') otherOptions.filters = this.fillFilters();
    if (['AddRow', 'AddRows', 'UpdateDetail', 'UpdateDetails'].includes(specification.id)) {
      const controls = this.fillControls(item, specification.id === 'UpdateDetails');
      otherOptions[specification.id === 'AddRows' ? 'rows' : 'controls'] =
        specification.id === 'AddRows' ? [controls] : controls;
    }

    specification.data.forEach(obj => {
      if (
        !_.includes(['appKey', 'sign', 'worksheetId', 'viewId', 'pageSize', 'pageIndex', 'listType'], obj.name) &&
        !otherOptions[obj.name]
      ) {
        if (obj.name === 'control' && specification.id === 'UpdateDetails') return;
        otherOptions[obj.name] = obj.desc;
      }
    });

    return this.renderPostContent(item, i, otherOptions, rightOptions);
  }

  /**
   * scrollView滚动
   */
  scroll = _.throttle(({ scrollTop }) => {
    if (!this.canScroll) {
      return;
    }
    const heightArr = [];
    let totalHeight = 0;
    let isExist = false;

    $('.scrollViewContainer .worksheetApiLi').map((index, el) => {
      heightArr.push({
        id: $(el).attr('id').replace('-content', ''),
        h: $(el).height(),
      });
    });
    heightArr
      .filter(item => item.height > 0)
      .forEach(item => {
        totalHeight += item.h;
        if (!isExist && totalHeight - item.h * 0.3 > scrollTop) {
          isExist = true;
          this.setState({ selectId: item.id });
        }
      });
  }, 300);

  /**
   * 渲染选项集
   */
  renderOptions() {
    const { appInfo = {} } = this.state;
    const { apiRequest = {} } = appInfo;
    return (
      <Fragment>
        {OPTIONS_FUNCTION_LIST.map(({ id, title, data = [], apiName, requestData, successData, errorData }, i) => {
          const url = appInfo.apiUrl + apiName;
          return (
            <div className="flexRow worksheetApiLi" id={id + '-content'}>
              <div className="worksheetApiContent1">
                {i === 0 && <div className="Font22 bold mBottom40">{_l('选项集')}</div>}
                <div className="Font17 bold">{title}</div>
                <input className="mTop24 worksheetApiInput" value={_l('请求URL：') + url} />
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
              {this.renderRightContent({
                data: {
                  ...requestData,
                  appKey: apiRequest.appKey || 'YOUR_APP_KEY',
                  sign: apiRequest.sign || 'YOUR_SIGN',
                },
                successData,
                errorData,
              })}
            </div>
          );
        })}
      </Fragment>
    );
  }

  updateTabIndex = tabIndex => {
    let targetId = '';
    switch (tabIndex) {
      case TAB_TYPE.APPLICATION:
        targetId = 'authorizationInstr';
        break;
      case TAB_TYPE.API_V2:
        targetId = 'summary';
        break;
      default:
        break;
    }
    if (this.contentScrollRef?.current) {
      this.contentScrollRef.current.scrollTo();
    }
    this.setState({
      tabIndex,
      selectId: targetId,
      expandIds: [],
    });
  };

  render() {
    const { data = [], loading, selectId, dataApp, errorCode, appInfo, dataPipelineData = [], tabIndex } = this.state;
    const { isSharePage } = this.props;
    const appId = this.getId();
    const sidebarList = SIDEBAR_LIST_MAP[tabIndex] || [];
    const lang = window.getCurrentLang();

    if (errorCode === 2) {
      return (
        <div className="flexColumn h100">
          <div className="errorBox">
            <span>
              <Icon icon="info" />
            </span>
            {_l('应用已过期，无法使用 API')}
          </div>
        </div>
      );
    }

    if (loading) {
      return <LoadDiv />;
    }

    return (
      <div className="flexColumn h100">
        <Header
          isSharePage={isSharePage}
          data={data}
          dataApp={dataApp}
          appId={appId}
          appInfo={appInfo}
          tabIndex={tabIndex}
          updateTabIndex={this.updateTabIndex}
          getId={this.getId}
        />
        <div className="flex flexRow minHeight0 WhiteBG">
          {tabIndex === TAB_TYPE.API_V3 ? (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              allowTransparency={true}
              allowFullScreen
              src={`${md.global.Config.OpenApiDocUrl}${lang === 'zh-Hans' ? 'zh-Hans/' : 'en/'}?ts=${Date.now()}`}
            />
          ) : (
            <Fragment>
              <div className="worksheetApiSide h100">
                {/* {data.length <= 0 ? (
                  <div className="flexColumn h100">
                    <Skeleton active={true} itemStyle={{ background: '#ddd' }} />
                  </div>
                ) */}
                <ScrollView>
                  {sidebarList.map(({ key, title, render, args }, index) => {
                    return render ? (
                      <Fragment key={index}>{this[render](args)}</Fragment>
                    ) : (
                      <div
                        key={index}
                        className={cx('worksheetApiMenuTitle', { active: selectId === key })}
                        onClick={() => this.setSelectId({ selectId: key })}
                      >
                        {title}
                      </div>
                    );
                  })}
                </ScrollView>
              </div>
              <div className="flex h100 minWidth0">
                <ScrollView ref={this.contentScrollRef} className="worksheetApiScroll" onScrollEnd={this.scroll}>
                  {/* 应用授权 */}
                  {tabIndex === TAB_TYPE.APPLICATION && (
                    <Fragment>
                      {/* 授权管理 */}
                      <div className="flexRow worksheetApiLi" id="authorizationInstr-content">
                        {this.renderAuthorizationManagement()}
                      </div>
                      {/* IP白名单 */}
                      <div className="flexRow worksheetApiLi" id="whiteList-content">
                        {this.renderWhiteList()}
                      </div>
                      <div id="list-content">{data.map((item, i) => this.renderContent(item, i))}</div>
                      <div id="dataPipeline-content">
                        {dataPipelineData.map((item, i) => this.renderContent(item, i, 'dataPipeline'))}
                      </div>
                      {/* <div className="flexRow worksheetApiLi" id="workflowInfo-content">
                          {this.renderWorkflowInfo()}
                        </div> */}
                    </Fragment>
                  )}
                  {/* API 2.0 */}
                  {tabIndex === TAB_TYPE.API_V2 && (
                    <Fragment>
                      {/* 概述 */}
                      <Summary />
                      {/* 请求格式 */}
                      <RequestFormat />
                      {/* 获取应用信息 */}
                      <div className="flexRow worksheetApiLi" id="appInfo-content">
                        {this.renderAppInfo()}
                      </div>
                      {/* 新建工作表 */}
                      <div className="flexRow worksheetApiLi" id="worksheetCreateForm-content">
                        {this.renderCreateWorksheet()}
                      </div>
                      {/* 获取工作表结构信息 */}
                      <div className="flexRow worksheetApiLi" id="worksheetFormInfo-content">
                        {this.renderWorksheetInfo()}
                      </div>
                      <div id="list-content">{data.map((item, i) => this.renderContent(item, i))}</div>
                      <div className="flexRow worksheetApiLi" id="workflowInfo-content">
                        {this.renderWorkflowInfo()}
                      </div>
                      {/** 应用角色 */}
                      {this.renderAppRoleContent()}
                      {/** 筛选(附录) */}
                      {this.renderAppendixContent()}
                      {/** 选项集 */}
                      {this.renderOptions()}
                      {this.renderAppendixContent(ERROR_CODE)}
                    </Fragment>
                  )}
                </ScrollView>
              </div>
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}

const Entry = () => {
  const isSharePage = location.pathname.includes('/public/');
  const pathname = location.pathname.split('/');
  const id = pathname[pathname.length - 1];
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState({});

  useEffect(() => {
    if (!isSharePage) {
      preall({ type: 'function' });
      setLoading(false);
      return;
    }

    const clientId = sessionStorage.getItem(id);
    window.clientId = clientId;

    getEntityShareById({
      clientId,
      langType: getCurrentLangCode(),
    }).then(result => {
      preall({ type: 'function' }, { allowNotLogin: true, requestParams: { projectId: result.data.projectId } });
      setShare(result);
      setLoading(false);
    });
  }, []);

  const getEntityShareById = data => {
    return new Promise(async resolve => {
      const result = await appManagementAjax.getEntityShareById({ id, sourceType: 45, ...data });
      const clientId = _.get(result, 'data.clientId');
      window.clientId = clientId;
      clientId && sessionStorage.setItem(id, clientId);
      resolve(result);
    });
  };

  const renderContent = () => {
    if ([14, 18, 19].includes(share.resultCode)) {
      return (
        <VerificationPass
          validatorPassPromise={(value, captchaResult) => {
            return new Promise(async (resolve, reject) => {
              if (value) {
                getEntityShareById({
                  password: value,
                  ...captchaResult,
                }).then(data => {
                  if (data.resultCode === 1) {
                    setShare(data);
                    resolve(data);
                  } else {
                    reject(SHARE_STATE[data.resultCode]);
                  }
                });
              } else {
                reject();
              }
            });
          }}
        />
      );
    }

    return <ShareState code={share.resultCode} />;
  };

  if (loading) {
    return (
      <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter">
        <LoadDiv />
      </div>
    );
  }

  // 登录打开
  if (!isSharePage) {
    return <WorksheetApi isSharePage={isSharePage} />;
  }

  // 分享打开
  if (share.resultCode === 1) {
    return <WorksheetApi isSharePage={isSharePage} appId={share.data.appId} shareData={share.data} />;
  }

  // 密码验证
  return (
    <div className="flexColumn h100">
      <Header isAuthorization={true} share={share} />
      {renderContent()}
    </div>
  );
};

const root = createRoot(document.getElementById('app'));

root.render(<Entry />);
