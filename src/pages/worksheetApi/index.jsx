import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import ajaxRequest from 'src/api/worksheet';
import appManagementAjax from 'src/api/appManagement';
import JsonView from 'react-json-view';
import cx from 'classnames';
import {
  MENU_LIST,
  MENU_LIST_APPENDIX,
  MENU_LIST_APPENDIX_HEADER,
  MENU_LIST_APPROLE,
  OPTIONS_FUNCTION_LIST,
  appInfoParameters,
  sameParameters,
  SIDEBAR_LIST,
  appRoleErrorData,
  appSuccessData,
  AddWorksheetParam,
  ADD_API_CONTROLS,
  ADD_WORKSHEET_SUCCESS,
  WORKSHEETINFO_SUCCESS_DATA,
  LIST_SUCCESS,
  appRoleSuccessData2,
  DATA_RELATIONS_SUCCESS_DATA,
  NUMBER_SUCCESS_DATA,
} from './config';
import homeApp from 'src/api/homeApp';
import { Icon, Dialog, Textarea, LoadDiv, ScrollView, Skeleton } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import noDataImg from './img/lock.png';
import AliasDialog from 'src/pages/FormSet/components/AliasDialog.jsx';
import SvgIcon from 'src/components/SvgIcon';
import MoreOption from './MoreOption';
import processAjax from 'src/pages/workflow/api/process';
import preall from 'src/common/preall';
import SecretKey from './SecretKey';
import styled from 'styled-components';
import { FIELD_TYPE_LIST } from 'src/pages/workflow/WorkflowSettings/enum';
import _ from 'lodash';
import { setFavicon } from 'src/util';

const FIELD_TYPE = FIELD_TYPE_LIST.concat([{ text: _l('对象'), value: 10000006, en: 'object' }]);

const Wrap = styled.div`
  input {
    border: 1px solid #ddd;
    border-radius: 3px;
    height: 36px;
    line-height: 36px;
    padding: 0 6px;
    width: 100%;
    box-sizing: border-box;
    &:focus {
      border: 1px solid #2196f3;
    }
  }
`;
class WorksheetAliasDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { alias: '' };
  }
  componentDidMount() {
    const { alias } = this.props;
    this.setState({
      alias,
    });
  }
  render() {
    const { show, onOk } = this.props;
    const { alias } = this.state;
    return (
      <Dialog
        className=""
        visible={show}
        onCancel={this.props.onClose}
        title={_l('设置工作表别名')}
        onOk={() => {
          onOk(alias);
        }}
      >
        <Wrap>
          <input
            type="text"
            className="name mTop6"
            placeholder={_l('请输入')}
            value={alias}
            onChange={e => {
              this.setState({
                alias: e.target.value.trim(),
              });
            }}
          />
        </Wrap>
      </Dialog>
    );
  }
}

@preall
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
      addSecretKey: false,
      isError: false,
      showAliasDialog: false,
      numberTypeList: [],
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
      menuList: MENU_LIST,
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
      homeApp.getApp(
        {
          appId: this.getId(),
        },
        {
          silent: true,
        },
      ),
      // 获取应用下所有工作表信息
      homeApp.getWorksheetsByAppId({
        appId: this.getId(),
        type: 0,
      }),
      appManagementAjax.getAuthorizes({ appId: this.getId() }),
      homeApp.getApiInfo({ appId: this.getId() }),

      // 获取选项集参数接口
      ajaxRequest.addOrUpdateOptionSetApiInfo(),
      ajaxRequest.optionSetListApiInfo(),
      processAjax.getProcessListApi({ relationId: this.getId() }),
    ]).then(res => {
      const [
        dataApp = {},
        worksheetList = [],
        authorizes = [],
        appInfo = {},
        addOptionsParams = [],
        getOptionsParams = [],
        pbcList = [],
      ] = res;
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
      if (worksheetList.length <= 0) {
        this.setState({ isError: true });
      } else {
        this.setState(
          {
            dataApp,
            worksheetList,
            authorizes,
            appInfo,
            addOptionsParams,
            getOptionsParams,
            pbcList,
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

  // 获取工作表信息
  getWorksheetApiInfo = worksheetId => {
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
      if (!!list.alias) {
        data = data.map(o => {
          return { ...o, alias: list.alias };
        });
      }
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
      this.setState({ data, numberTypeList: list.template.controls || [], loading: false, alias: list.alias, menuList: MENU_LIST }, () => {
        this.scrollToFixedPosition();
      });
    });
  };

  // 获取工作流信息
  getWorkflowApiInfo = processId => {
    processAjax.getProcessApiInfo({ processId }).then(res => {
      this.setState({ workflowInfo: res }, () => {
        this.scrollToFixedPosition();
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
  setSelectId({ selectId, worksheetId, workflowId }) {
    this.canScroll = false;
    this.setState({ selectId, selectWorkflowId: workflowId, workflowInfo: {} }, () => {
      if (worksheetId) {
        this.getWorksheetApiInfo(worksheetId);
        return;
      }
      if (workflowId) {
        this.getWorkflowApiInfo(workflowId);
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
              this.setSelectId({ selectId: id, worksheetId: item.workSheetId });
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
                    className={cx('worksheetApiMenuItem pLeft58 overflow_ellipsis', {
                      active: selectId === item.workSheetId + o.id,
                    })}
                    onClick={() => this.setSelectId({ selectId: item.workSheetId + o.id })}
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
      _.findIndex(worksheetList, i => selectId.indexOf(i.workSheetId) > -1) > -1 ||
      ['worksheetFormInfo', 'worksheetCreateForm'].indexOf(selectId) > -1;
    return (
      <div className="worksheetApiMenu">
        <div className="worksheetApiMenuTitle" onClick={() => this.setSelectId({ selectId: 'worksheetCreateForm' })}>
          <i className={cx('mRight5 Gray_9e', isOpen ? 'icon-arrow-down' : 'icon-arrow-right-tip')} />
          {_l('工作表')}
        </div>
        {isOpen ? (
          <Fragment>
            <div
              className={cx('worksheetApiMenuItem overflow_ellipsis', { active: selectId === 'worksheetCreateForm' })}
              onClick={() => this.setSelectId({ selectId: 'worksheetCreateForm' })}
            >
              {_l('新建工作表')}
            </div>
            <div
              className={cx('worksheetApiMenuItem overflow_ellipsis', { active: selectId === 'worksheetFormInfo' })}
              onClick={() => this.setSelectId({ selectId: 'worksheetFormInfo' })}
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
   * 渲染封装业务流程侧栏
   */
  renderPBCSide() {
    const { pbcList, selectId, selectWorkflowId } = this.state;
    const isOpen = selectId === 'workflowInfo';

    if (!pbcList.length) return null;

    return (
      <div className="worksheetApiMenu">
        <div
          className="worksheetApiMenuTitle"
          onClick={() => this.setSelectId({ selectId: 'workflowInfo', workflowId: pbcList[0].id })}
        >
          <i className={cx('mRight5 Gray_9e', isOpen ? 'icon-arrow-down' : 'icon-arrow-right-tip')} />
          {_l('封装业务流程')}
        </div>
        {isOpen &&
          pbcList.map(item => {
            return (
              <div
                className={cx('worksheetApiMenuItem overflow_ellipsis', { active: item.id === selectWorkflowId })}
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
   * 渲染应用角色、筛选侧栏(应用角色为1、筛选为2)
   */
  renderOtherSide(type) {
    const { selectId, addOptionsParams, getOptionsParams } = this.state;
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
    const isOpen = _.findIndex(currentList, i => selectId === i.id) > -1;

    return (
      <div className="worksheetApiMenu">
        <div
          className="worksheetApiMenuTitle Hand"
          onClick={() => {
            let id = currentList[0].id;
            this.setSelectId({ selectId: id });
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
            appKey: apiRequest.appKey || 'APPKEY',
            sign: apiRequest.sign || 'SIGN',
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
            appKey: data[0].appKey || 'APPKEY',
            sign: data[0].sign || 'SIGN',
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
        desc: _l('控件数据'),
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
                <div className="mLeft30 w36">{o.desc}</div>
              </div>
            );
          })}
        </div>
        {this.renderRightContent({
          data: {
            appKey: data[0].appKey || 'APPKEY',
            sign: data[0].sign || 'SIGN',
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
    const { data = [], workflowInfo } = this.state;
    let inputExample = { appKey: data[0].appKey || 'APPKEY', sign: data[0].sign || 'SIGN' };
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
          <input className="mTop24 worksheetApiInput" value={_l('请求URL：') + workflowInfo.url} />
          <div className="Font17 bold mTop30">{_l('请求参数')}</div>
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
          {workflowInfo.outType === 1 && (
            <div className="flexRow worksheetApiLine flexRowHeight">
              <div className="w32">callbackURL</div>
              <div className="mLeft30 w18">{_l('否')}</div>
              <div className="mLeft30 w14">{_l('文本')}</div>
              <div className="mLeft30 w36">{_l('用于接受流程执行完毕输出的参数')}</div>
            </div>
          )}
          {renderInputs(workflowInfo.inputs.filter(o => !o.dataSource))}
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
        </div>
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
          data.map(({ name, desc }) => {
            dataObj[name] = _.includes(['appKey', 'sign'], name)
              ? (this.state.data[0] || {})[name] || name.toUpperCase()
              : desc;
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
                    <div className="Font15 bold mTop20">{_l('获取地区信息')}</div>
                    <div className="Font14 mTop15">
                      {_l('接口地址：') + __api_server__.main}FixedData/getCitysByParentID
                    </div>
                    <div className="Font14">{_l('提交参数：{"parentId": "省份or城市id", "keywords": ""}')}</div>
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
  renderTable(item, i) {
    const { showAliasDialog, numberTypeList = [], showWorksheetAliasDialog, alias } = this.state;

    return (
      <Fragment>
        <div className="flex worksheetApiContent1">
          <div className="Font22 bold">{item.name}</div>
          <div className="Font14 bold mTop20">
            <span className="mRight20 Gray_75">{_l('工作表ID：') + item.worksheetId}</span>
            <span className="Gray_75">{_l('工作表别名：') + (alias || '')}</span>
            <span
              className="Hand Font13 mLeft20"
              style={{ color: '#2196F3' }}
              onClick={() => {
                this.setState({
                  showWorksheetAliasDialog: true,
                });
              }}
            >
              {_l('设置')}
            </span>
          </div>
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
            <div className="w22">{_l('字段ID')}</div>
            <div className="mLeft30 w18">{_l('字段名称')}</div>
            <div className="mLeft30 w14">{_l('类型')}</div>
            <div className="mLeft30 w14">{_l('控件类型编号')}</div>
            <div className="mLeft30 w32">{_l('说明')}</div>
          </div>
          {item.controls.map((o, i) => {
            return (
              <div key={`${o.controlId}-${i}`} className="flexRow worksheetApiLine flexRowHeight">
                <div className="w22">
                  {o.controlId} {o.alias && <div>({o.alias})</div>}
                </div>
                <div className="mLeft30 w18">{o.controlName}</div>
                <div className="mLeft30 w14">{o.type}</div>
                <div className="mLeft30 w14">
                  {_.get(_.find(numberTypeList, numberType => numberType.controlId === o.controlId) || {}, 'type')}
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
        {showWorksheetAliasDialog && (
          <WorksheetAliasDialog
            show={showWorksheetAliasDialog}
            onClose={() => {
              this.setState({ showWorksheetAliasDialog: false });
            }}
            alias={alias}
            onOk={alias => {
              ajaxRequest
                .updateWorksheetAlias({
                  appId: this.getId(),
                  worksheetId: item.worksheetId,
                  alias,
                })
                .then(res => {
                  if (res === 0) {
                    this.setState({
                      alias,
                      data: this.state.data.map(o => {
                        return { ...o, alias: alias };
                      }),
                      showWorksheetAliasDialog: false,
                    });
                  } else if (res === 3) {
                    alert(_l('工作表别名格式不匹配'), 3);
                  } else if (res === 2) {
                    alert(_l('工作表别名已存在，请重新输入'), 3);
                  } else {
                    alert(_l('别名修改失败'), 3);
                  }
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
    const { authorizes = [], addSecretKey } = this.state;

    return (
      <Fragment>
        <div className="worksheetApiContent1">
          <div className="Font22 bold">{_l('授权管理')}</div>
          {authorizes.length > 0 && (
            <div className="flexRow worksheetApiLine flexRowHeight bold mTop25">
              <div className="w25">AppKey</div>
              <div className="mLeft30 w25">SecretKey</div>
              <div className="mLeft30 w25">Sign</div>
              <div className="mLeft30 w30">{_l('授权类型')}</div>
              <div className="mLeft30 w8">{_l('操作')}</div>
            </div>
          )}
          {authorizes.map((o, i) => {
            return (
              <div key={o.appKey} className="flexRow worksheetApiLine flexRowHeight pTop8 pBottom8">
                <div className="w25">
                  <div>{o.appKey}</div>
                  <div className="Gray_9e">{o.remark}</div>
                </div>
                <div className="mLeft30 w25">{o.secretKey}</div>
                <div className="mLeft30 w25">{o.sign}</div>
                <div className="mLeft30 w30">
                  <div>
                    {o.status === 2 ? _l('授权已关闭') : o.type === 1 ? _l('本应用全部接口') : _l('本应用只读接口')}
                  </div>
                  {o.status !== 2 && o.viewNull && <div>{_l('空视图参数不返回数据')}</div>}
                </div>
                <div className="mLeft30 w8 Relative">
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
        onClickAwayExceptions={['.mui-dialog-container']}
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
    return (
      <Fragment>
        {this.renderLeftContent(i)}
        {this.renderRightContent({
          data: this.setCommonPostParameters(item, otherOptions),
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
    const { data, menuList  } = this.state;

    return (
      <div className="worksheetApiContent1">
        <div />
        <div className="Font17 bold">{MENU_LIST[i].title}</div>
        <input className="mTop24 worksheetApiInput" value={_l('请求URL：') + data[0].apiUrl + MENU_LIST[i].apiName} />
        <div className="flexRow worksheetApiLine flexRowHeight bold mTop25">
          <div className="w32">{_l('参数')}</div>
          <div className="mLeft30 w18">{_l('必选')}</div>
          <div className="mLeft30 w14">{_l('类型')}</div>
          <div className="mLeft30 w36">{_l('说明')}</div>
        </div>
        {menuList[i].data.map(o => {
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
      appKey: item.appKey || 'APPKEY',
      sign: item.sign || 'SIGN',
      worksheetId: item.alias || item.worksheetId,
      ...otherOptions,
    };
  }

  renderMapItem = o => {
    const { numberTypeList = [] } = this.state;
    let { relationValue = [], controlId, value, alias } = o;
    let list = {
      controlId: alias || controlId,
      value,
    };
    if (
      _.get(
        _.find(numberTypeList, item => item.controlId === controlId),
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
          _.find(numberTypeList, item => item.controlId === controlId),
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

  /**
   * 新建行记录
   */
  renderAddRow(item, i) {
    return this.renderPostContent(
      item,
      i,
      {
        controls: item.controls
          .filter(o => o.isSupport && (o.controlId.length > 20 || o.controlId === 'ownerid'))
          .map(o => this.renderMapItem(o)),
        triggerWorkflow: true,
      },
      {
        successData: ADD_WORKSHEET_SUCCESS,
      },
    );
  }

  /**
   * 批量新建行记录
   */
  renderAddRows(item, i) {
    return this.renderPostContent(
      item,
      i,
      {
        rows: [
          item.controls
            .filter(o => o.isSupport && (o.controlId.length > 20 || o.controlId === 'ownerid'))
            .map(o => this.renderMapItem(o)),
        ],
        triggerWorkflow: true,
      },
      {
        successData: NUMBER_SUCCESS_DATA,
      },
    );
  }

  /**
   * 获取行记录详情
   */
  renderGetDetail(item, i) {
    return this.renderPostContent(
      item,
      i,
      {
        rowId: _l('行记录ID'),
        getSystemControl: _l('是否获取系统字段，默认false'),
      },
      { successData: LIST_SUCCESS },
    );
  }

  /**
   * 获取行记录详情 post
   */
  renderGetDetailPost(item, i) {
    return this.renderPostContent(
      item,
      i,
      {
        rowId: _l('行记录ID'),
        getSystemControl: _l('是否获取系统字段，默认false'),
      },
      { successData: LIST_SUCCESS },
    );
  }
  /**
   * 获取行记录分享链接
   */
  renderGetRowShareLink(item, i) {
    let otherOptions = {
      rowId: _l('行记录ID'),
      visibleFields: [_l('可见字段ID')],
      validTime: _l('有效时间'),
      password: _l('密码'),
    };
    return this.renderPostContent(item, i, otherOptions, {
      successData: {
        data: _l('链接地址'),
        success: true,
        error_code: 1,
      },
    });
  }

  /**
   * 更新行记录详情
   */
  renderUpdateDetail(item, i) {
    return this.renderPostContent(
      item,
      i,
      {
        rowId: _l('行记录ID'),
        controls: item.controls
          .filter(o => o.isSupport && (o.controlId.length > 20 || o.controlId === 'ownerid'))
          .map(o => this.renderMapItem(o)),
        triggerWorkflow: true,
      },
      { successData: appRoleSuccessData2 },
    );
  }

  /**
   * 批量更新行记录详情
   */
  renderUpdateDetails(item, i) {
    return this.renderPostContent(
      item,
      i,
      {
        rowIds: [_l('行记录ID'), _l('行记录ID')],
        control: item.controls.filter(o => o.isSupport).map(o => this.renderMapItem(o))[0],
        triggerWorkflow: true,
      },
      { successData: appRoleSuccessData2 },
    );
  }

  /**
   * 删除行记录
   */
  renderDel(item, i) {
    return this.renderPostContent(
      item,
      i,
      {
        rowId: _l('行记录ID，多个用逗号(,)隔开'),
        triggerWorkflow: true,
      },
      { successData: appRoleSuccessData2 },
    );
  }

  /**
   * 获取关联记录
   */
  renderRelation(item, i) {
    let otherOptions = {};
    MENU_LIST[i].data.forEach(obj => {
      if (!_.includes(['appKey', 'sign', 'worksheetId'], obj.name)) {
        otherOptions[obj.name] = obj.desc;
      }
    });
    return this.renderPostContent(item, i, otherOptions, { successData: DATA_RELATIONS_SUCCESS_DATA });
  }

  /**
   * 获取工作表行记录总数
   */
  renderTotalNum(item, i) {
    let otherOptions = {
      viewId: _l('视图ID'),
      keywords: _l('关键词'),
      filters: [
        {
          controlId: 'string',
          dataType: 1,
          spliceType: 0,
          filterType: 0,
          dateRange: 0,
          dateRangeType: 0,
          value: 'string',
          values: ['string'],
          minValue: 'string',
          maxValue: 'string',
          isAsc: true,
          dynamicSource: [
            {
              rcid: 'string',
              cid: 'string',
              staticValue: 'string',
              isAsync: true,
            },
          ],
          advancedSetting: {
            additionalProp1: 'string',
            additionalProp2: 'string',
            additionalProp3: 'string',
          },
        },
      ],
    };
    return this.renderPostContent(item, i, otherOptions, {
      successData: NUMBER_SUCCESS_DATA,
    });
  }

  /**
   * 获取列表
   */
  renderList(item, i) {
    let otherOptions = {
      viewId: _l('视图ID,可为空'),
      pageSize: 50,
      pageIndex: 1,
      listType: 0,
    };

    MENU_LIST[i].data.forEach(obj => {
      if (!_.includes(['appKey', 'sign', 'worksheetId', 'viewId', 'pageSize', 'pageIndex', 'listType'], obj.name)) {
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

    return this.renderPostContent(item, i, otherOptions, { successData: LIST_SUCCESS });
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
    heightArr
      .filter(item => item.height > 0)
      .forEach(item => {
        totalHeight += item.h;
        if (!isExist && totalHeight - item.h * 0.3 > obj.position) {
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
              {this.renderRightContent({ data: requestData, successData, errorData })}
            </div>
          );
        })}
      </Fragment>
    );
  }

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
                  backgroundColor: dataApp.iconColor,
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
                      onClick={() => this.setSelectId({ selectId: key })}
                    >
                      {title}
                    </div>
                  );
                })}
                {this.renderWorksheetSide()}

                {this.renderPBCSide()}

                {/** 应用角色 */}
                {this.renderOtherSide(0)}

                {/** 筛选 */}
                {this.renderOtherSide(1)}

                {/** 选项集 */}
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
                  <div className="worksheetApiContent1">
                    <div className="Font22 bold">{_l('概述')}</div>
                    <div className="Font14 mTop15">
                      {_l(
                        '该%0 API提供了一个简单的方法来整合您的%0与任何外部系统的数据。API严格遵循REST语义，使用JSON编码对象，并依赖标准HTTP代码来指示操作结果。',
                        dataApp.name,
                      )}
                    </div>
                  </div>
                  <div className="worksheetApiContent2" />
                </div>
                <div className="flexRow worksheetApiLi" id="requestFormat-content">
                  <div className="worksheetApiContent1">
                    <div className="Font22 bold">{_l('请求格式')}</div>
                    <div className="Font14 mTop15">{_l('对于 GET 请求，所有参数通过拼接在 URL 之后传递。')}</div>
                    <div className="Font14 mTop10">
                      {_l(
                        '对于 POST 请求，请求的主体必须是 JSON 格式，而且 HTTP header 的 Content-Type 需要设置为 application/json。',
                      )}
                    </div>
                  </div>
                  <div className="worksheetApiContent2" />
                </div>
                <div className="flexRow worksheetApiLi" id="authorizationInstr-content">
                  {this.renderAuthorizationManagement()}
                </div>
                <div className="flexRow worksheetApiLi" id="whiteList-content">
                  {this.renderWhiteList()}
                </div>
                <div className="flexRow worksheetApiLi" id="appInfo-content">
                  {this.renderAppInfo()}
                </div>
                <div className="flexRow worksheetApiLi" id="worksheetCreateForm-content">
                  {this.renderCreateWorksheet()}
                </div>
                <div className="flexRow worksheetApiLi" id="worksheetFormInfo-content">
                  {this.renderWorksheetInfo()}
                </div>

                <div className="flexRow worksheetApiLi" id="workflowInfo-content">
                  {this.renderWorkflowInfo()}
                </div>

                <div id="list-content">{data.map((item, i) => this.renderContent(item, i))}</div>

                {/** 应用角色 */}
                {this.renderAppRoleContent()}

                {/** 筛选(附录) */}
                {this.renderAppendixContent()}

                {/** 选项集 */}
                {this.renderOptions()}
              </ScrollView>
            )}
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<WorksheetApi />, document.getElementById('app'));
