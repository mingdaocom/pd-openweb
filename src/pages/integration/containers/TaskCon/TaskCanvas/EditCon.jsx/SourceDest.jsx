import React, { Component } from 'react';
import { Dropdown } from 'ming-ui';
import Datasource from 'src/pages/integration/api/datasource';
import { WrapL } from './style';
import AddSourceOrDest from 'src/pages/integration/containers/TaskCon/TaskCanvas/components/AddSourceOrDest';
import homeAppAjax from 'src/api/homeApp.js';
import appManagementAjax from 'src/api/appManagement.js';
import _ from 'lodash';
import { getNodeInfo } from 'src/pages/integration/containers/TaskCon/TaskCanvas/util.js';
export default class SourceDest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      node: props.node,
      dbList: [], //数据库列表
      schemaList: [], //schema列表
      sheetList: [], //数据表列表
      appInfo: {},
      worksheetInfo: {},
    };
  }
  componentDidMount() {
    this.initData(this.props, true);
  }
  componentWillReceiveProps(nextProps, nextState) {
    if (
      _.get(nextProps, ['node', 'nodeConfig', 'config', 'dsType']) !==
        _.get(this.props, ['node', 'nodeConfig', 'config', 'dsType']) ||
      _.get(nextProps, ['node', 'nodeId']) !== _.get(this.props, ['node', 'nodeId'])
    ) {
      const isNext =
        _.get(nextProps, ['node', 'nodeConfig', 'config', 'appId']) !==
          _.get(this.props, ['node', 'nodeConfig', 'config', 'appId']) ||
        _.get(nextProps, ['node', 'nodeConfig', 'config', 'dbName']) !==
          _.get(this.props, ['node', 'nodeConfig', 'config', 'dbName']);
      this.setState(
        {
          node: nextProps.node,
        },
        () => {
          this.initData(nextProps, isNext);
        },
      );
    }
  }

  initData = async (nextProps, isNext) => {
    const { currentProjectId: projectId, flowId, node = {} } = nextProps || this.props;
    const data = await getNodeInfo(projectId, flowId, node.nodeId);
    console.log(data); //测试
    if (['SOURCE_TABLE', 'DEST_TABLE'].includes(node.nodeType)) {
      const { dbName, dsType } = _.get(node, ['nodeConfig', 'config']) || {};
      if (!dsType) {
        this.setState({
          dbList: [], //数据库列表
          schemaList: [], //schema列表
          sheetList: [], //数据表列表
        });
        return;
      }
      this.getDatasourceList(node, projectId);
      if (isNext) {
        node.nodeType === 'SOURCE_TABLE' &&
          ['pgsql', 'sqlserver'].includes(dbName) && //只要数据库是pgsql 、sqlserver这两种这里就显示这个配置
          this.getSchemasList(projectId);
        !!dbName && this.getSheetList(projectId);
      }
    }
  };

  //应用
  getAppList = projectId => {
    appManagementAjax
      .getAppForManager({
        projectId,
      })
      .then(res => {
        this.setState({
          dbList: res.map(a => {
            return { ...a, text: a.appName, value: a.appId };
          }),
        });
      });
  };
  //表
  getSheetListByAppId = appId => {
    homeAppAjax
      .getWorksheetsByAppId({
        appId,
      })
      .then(res => {
        this.setState({
          sheetList: res
            .filter(o => o.type === 0) //只能是工作表
            .map(a => {
              return { ...a, text: a.workSheetName, value: a.workSheetId, icon: '' };
            }),
        });
      });
  };
  //表信息
  getWorksheetInfo = worksheetId => {
    homeAppAjax.getAppItemDetail([worksheetId]).then(res => {
      this.setState({
        worksheetInfo: res[0],
      });
    });
  };
  //应用信息
  getAppInfo = appId => {
    homeAppAjax
      .getAppInfo({
        appId,
      })
      .then(res => {
        this.setState({
          appInfo: { ...res, id: res.appId, name: res.appName },
        });
      });
  };

  //获取数据源对应数据库列表
  getDatasourceList = (node, projectId) => {
    let { datasourceId, dataDestId, dbName, dsType, appId, workSheetId } = _.get(node, ['nodeConfig', 'config']) || {};
    datasourceId = datasourceId || dataDestId;
    if (dsType === 'MING_DAO_YUN') {
      appId && this.getAppInfo(appId);
      workSheetId && this.getWorksheetInfo(workSheetId);
    } else {
      if (!datasourceId && !dataDestId) {
        this.setState({
          dbList: [],
          schemaList: [], //schema列表
          sheetList: [], //数据表列表
        });
        return;
      }
      Datasource.getDatabases({
        projectId,
        datasourceId,
      }).then(res => {
        this.setState({
          dbList: res.map(a => {
            return { text: a, value: a };
          }),
          // schemaList: [], //schema列表
          // sheetList: [], //数据表列表
        });
      });
    }
  };
  //获取数据源对应Schemas列表
  getSchemasList = projectId => {
    let { datasourceId, dataDestId, dbName, dsType } = _.get(this.state.node, ['nodeConfig', 'config']) || {};
    datasourceId = datasourceId || dataDestId;
    if (!dbName) {
      this.setState({
        dbList: [],
        schemaList: [], //schema列表
        sheetList: [], //数据表列表
      });
      return;
    }
    Datasource.getSchemas({
      projectId,
      datasourceId,
      dbName,
    }).then(res => {
      this.setState({
        schemaList: res.map(a => {
          return { ...a, text: a.name, value: a.id };
        }),
        sheetList: [], //数据表列表
      });
    });
  };
  //获取数据源对应数据表列表
  getSheetList = projectId => {
    let { datasourceId, dataDestId, dbName, appId, workSheetId, dsType, schema } =
      _.get(this.state.node, ['nodeConfig', 'config']) || {};
    datasourceId = datasourceId || dataDestId;
    if (!dbName && !appId) {
      this.setState({
        dbList: [],
        schemaList: [], //schema列表
        sheetList: [], //数据表列表
      });
      return;
    }
    if (dsType === 'MING_DAO_YUN') {
      this.getSheetListByAppId(appId);
    } else {
      Datasource.getTables({
        projectId,
        datasourceId,
        schema,
        dbName,
      }).then(res => {
        this.setState({
          sheetList: res.map(a => {
            return { text: a, value: a };
          }),
        });
      });
    }
  };
  onChangeConfig = (options, cb) => {
    const { onUpdate, node = {} } = this.props;
    let nodeData = {
      ...node,
      nodeConfig: {
        ...(node.nodeConfig || {}),
        config: {
          ...(_.get(node, 'nodeConfig.config') || {}),
          ...options,
        },
      },
    };
    this.setState(
      {
        node: nodeData,
      },
      () => {
        onUpdate(nodeData);
        cb && cb();
      },
    );
  };
  render() {
    const { node = {}, addSheet, currentProjectId: projectId } = this.props;
    const { dbList = [], sheetList = [], schemaList = [], appInfo = {}, worksheetInfo = {} } = this.state;
    const { dbName = '', appId, workSheetId, tableName, schema, dsType } = _.get(node, ['nodeConfig', 'config']) || {};
    let dbParam = {
      value: !(dsType === 'MING_DAO_YUN' ? appId : dbName) ? undefined : dsType === 'MING_DAO_YUN' ? appId : dbName,
    };
    if (dsType === 'MING_DAO_YUN') {
      dbParam = { ...dbParam, renderValue: appInfo.name };
    }
    let tbParam = {
      value: !(dsType !== 'MING_DAO_YUN' ? tableName : workSheetId)
        ? undefined
        : dsType !== 'MING_DAO_YUN'
        ? tableName
        : workSheetId,
    };
    if (dsType === 'MING_DAO_YUN') {
      tbParam = { ...tbParam, renderValue: worksheetInfo.workSheetName };
    }
    return (
      <WrapL>
        <div className="title Bold">{_l('数据源')}</div>
        <div className="mTop12">
          <AddSourceOrDest {...this.props} />
        </div>
        {!!dsType && (
          <React.Fragment>
            <div className="title mTop20">{dsType === 'MING_DAO_YUN' ? _l('应用') : _l('数据库')}</div>
            <Dropdown
              {...dbParam}
              disabled
              placeholder={_l('请选择')}
              onVisibleChange={visible => {
                if (dbList.length <= 0) {
                  this.getAppList(projectId);
                }
              }}
              className="mRight12 dropWorksheet"
              onChange={value => {
                this.onChangeConfig(
                  {
                    dbName: dsType !== 'MING_DAO_YUN' ? value : (dbList.find(it => it.value === value) || {}).text,
                    appId: dsType === 'MING_DAO_YUN' ? value : '',
                    tableName: '',
                    schema: '',
                    appInfo: dsType === 'MING_DAO_YUN' ? dbList.find(it => it.value === value) || {} : {},
                  },
                  () => {
                    if (['pgsql', 'sqlserver'].includes(value)) {
                      //只要数据库是pgsql 、sqlserver这两种这里就显示这个配置
                      this.getSchemasList(projectId);
                    } else {
                      this.getSheetList(projectId);
                    }
                  },
                );
              }}
              border
              openSearch
              // cancelAble
              isAppendToBody
              data={dbList}
            />
            {['pgsql', 'sqlserver'].includes(dbName) && (
              //只要数据格式是pgsql 、sqlserver这两种这里就显示这个配置
              <React.Fragment>
                <div className="title mTop20">{_l('schema')}</div>
                <Dropdown
                  disabled
                  placeholder={_l('请选择')}
                  value={!schema ? undefined : schema}
                  className="mRight12 dropWorksheet"
                  onChange={value => {
                    this.onChangeConfig(
                      {
                        schema: value,
                        tableName: '',
                      },
                      () => {
                        this.getSheetList(projectId);
                      },
                    );
                  }}
                  border
                  openSearch
                  // cancelAble
                  isAppendToBody
                  data={schemaList}
                />
              </React.Fragment>
            )}
            <div className="title mTop20">{dsType === 'MING_DAO_YUN' ? _l('工作表') : _l('数据表')}</div>
            <Dropdown
              {...tbParam}
              disabled
              placeholder={_l('请选择')}
              className="mRight12 dropWorksheet"
              onVisibleChange={visible => {
                if (sheetList.length <= 0) {
                  this.getSheetListByAppId(appId);
                }
              }}
              onChange={value => {
                if (value === 'add') {
                  addSheet();
                } else {
                  this.onChangeConfig({
                    tableName:
                      dsType !== 'MING_DAO_YUN' ? value : (sheetList.find(it => it.value === value) || {}).text,
                    workSheetId: dsType === 'MING_DAO_YUN' ? value : '',
                  });
                }
              }}
              border
              // openSearch
              menuClass={'DEST_TABLE' === node.nodeType ? 'dropWorksheetIntegration' : ''}
              // cancelAble
              isAppendToBody
              data={
                'DEST_TABLE' === node.nodeType //目的地才有新建工作表
                  ? [{ iconName: 'add1', value: 'add', text: '新建工作表' }].concat(sheetList)
                  : sheetList
              }
            />
          </React.Fragment>
        )}
      </WrapL>
    );
  }
}
