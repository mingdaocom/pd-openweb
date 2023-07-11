import React, { Component } from 'react';
import { Dropdown, Icon } from 'ming-ui';
import { Tooltip } from 'antd';
import cx from 'classnames';
import Datasource from 'src/pages/integration/api/datasource';
import { WrapL } from './style';
import AddSourceOrDest from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/components/AddSourceOrDest';
import homeAppAjax from 'src/api/homeApp.js';
import appManagementAjax from 'src/api/appManagement.js';
import _ from 'lodash';
import { DATABASE_TYPE, isValidName } from 'src/pages/integration/dataIntegration/constant.js';
import { schemaTypes } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/config.js';
const initData = {
  dbList: [], //数据库列表
  schemaList: [], //schema列表
  sheetList: [], //数据表列表
  appInfo: {},
  worksheetInfo: {},
};
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
      loading: false,
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
          _.get(this.props, ['node', 'nodeConfig', 'config', 'dbName']); //表｜库更改，重新获取数据
      this.setState(
        {
          ...initData,
        },
        () => {
          this.initData(nextProps, isNext);
        },
      );
    }
    if (!_.isEqual(this.props.node, nextProps.node)) {
      this.setState({
        node: nextProps.node,
      });
    }
  }

  initData = async (nextProps, isNext) => {
    const { currentProjectId: projectId, flowId, node = {} } = nextProps || this.props;
    if (['SOURCE_TABLE', 'DEST_TABLE'].includes(node.nodeType)) {
      const { dbName, dsType, className, schema } = _.get(node, ['nodeConfig', 'config']) || {};
      if (!dsType) {
        this.setState({
          ...initData,
        });
        return;
      }
      this.getDatasourceList(node, projectId);
      if (isNext) {
        schemaTypes.includes(className) && schema && this.getSchemasList(projectId);
        !!dbName && this.getSheetList(projectId);
      }
    }
  };

  //应用
  getAppList = projectId => {
    this.setState({
      loading: true,
    });
    appManagementAjax
      .getAppForManager({
        projectId,
      })
      .then(res => {
        this.setState({
          loading: false,
          dbList: res.map(a => {
            return { ...a, text: a.appName, value: a.appId };
          }),
        });
      });
  };
  //表
  getSheetListByAppId = appId => {
    if (!appId) {
      this.setState({
        sheetList: [],
      });
      return;
    }
    this.setState({
      loading: true,
    });
    homeAppAjax
      .getWorksheetsByAppId({
        appId,
      })
      .then(res => {
        const data = res
          .filter(o => o.type === 0) //只能是工作表
          .map(a => {
            return { ...a, text: a.workSheetName, value: a.workSheetId, icon: '' };
          });
        const list = this.filterSheet(data);
        this.setState({
          loading: false,
          sheetList: list,
        });
      });
  };
  //表信息
  getWorksheetInfo = workSheetId => {
    homeAppAjax.getAppItemDetail([workSheetId]).then(res => {
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
    if (dsType === DATABASE_TYPE.APPLICATION_WORKSHEET) {
      appId && this.getAppInfo(appId);
      workSheetId && this.getWorksheetInfo(workSheetId);
    } else {
      if (!datasourceId && !dataDestId) {
        this.setState({
          ...initData,
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
        ...initData,
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
          return { text: a, value: a };
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
        ...initData,
      });
      return;
    }
    if (dsType === DATABASE_TYPE.APPLICATION_WORKSHEET) {
      this.getSheetListByAppId(appId);
    } else {
      this.setState({
        loading: true,
      });
      Datasource.getTables({
        projectId,
        datasourceId,
        schema,
        dbName,
      }).then(res => {
        const data = res.map(a => {
          return { text: a, value: a };
        });
        const list = this.filterSheet(data);
        this.setState({
          loading: false,
          sheetList: list,
        });
      });
    }
  };
  onChangeConfig = (options, cb) => {
    const { onUpdate, node = {} } = this.props;
    let config = {
      ...(_.get(node, 'nodeConfig.config') || {}),
      ...options,
    };
    if ('SOURCE_TABLE' === node.nodeType) {
      config = { ...config, fields: [] };
    } else {
      config = { ...config, fieldsMapping: [] };
    }
    let nodeData = {
      ...node,
      nodeConfig: {
        ...(node.nodeConfig || {}),
        fields: [],
        config,
      },
    };
    onUpdate(nodeData);
    cb && cb();
  };
  filterSheet = (sheetList = []) => {
    const { node = {} } = this.props;
    const { dsType } = _.get(node, ['nodeConfig', 'config']) || {};
    //排除源或者目的地的表
    const data = sheetList
      .filter(it =>
        dsType !== DATABASE_TYPE.APPLICATION_WORKSHEET
          ? true
          : 'DEST_TABLE' !== node.nodeType //当前是否源
          ? ![
              _.get(this.props.list.find(o => 'DEST_TABLE' === o.nodeType) || {}, 'nodeConfig.config.workSheetId'),
            ].includes(it.value)
          : ![
              _.get(this.props.list.find(o => 'SOURCE_TABLE' === o.nodeType) || {}, 'nodeConfig.config.workSheetId'),
            ].includes(it.value),
      )
      .map(o => {
        if (dsType === DATABASE_TYPE.APPLICATION_WORKSHEET) {
          return o;
        } else {
          return {
            ...o,
            disabled: !isValidName(o.text),
          }; //数据库表 不合法的表 不可选
        }
      });

    return 'DEST_TABLE' === node.nodeType //目的地才有新建工作表
      ? [
          {
            iconName: 'add1',
            value: 'add',
            text: dsType === DATABASE_TYPE.APPLICATION_WORKSHEET ? _l('新建工作表') : _l('新建数据表'),
          },
        ].concat(data)
      : data;
  };
  render() {
    const { currentProjectId: projectId, showEdit } = this.props;
    const { node = {} } = this.state;
    const { dbList = [], sheetList = [], schemaList = [], appInfo = {}, worksheetInfo = {}, loading } = this.state;
    const {
      dbName = '',
      appId,
      workSheetId,
      tableName,
      schema,
      dsType,
      className,
    } = _.get(node, ['nodeConfig', 'config']) || {};
    const dbValue = dsType === DATABASE_TYPE.APPLICATION_WORKSHEET ? appId : dbName;
    let dbParam = {
      value: !dbValue ? undefined : dbValue,
      renderValue: dbName || appInfo.name,
    };
    const tbValue = dsType !== DATABASE_TYPE.APPLICATION_WORKSHEET ? tableName : workSheetId;
    let tbParam = {
      value: !tbValue && !tableName ? undefined : tbValue || '',
      renderValue: tableName,
    };
    return (
      <WrapL>
        <div className="title Bold">{_l('数据源')}</div>
        <div className="mTop12">
          <AddSourceOrDest
            {...this.props}
            onUpdate={node => {
              this.setState(
                {
                  ...initData,
                },
                () => {
                  this.props.onUpdate(node);
                },
              );
            }}
            canEdit={true}
          />
        </div>
        {!!dsType && (
          <React.Fragment>
            <div className="title mTop20">
              {dsType === DATABASE_TYPE.APPLICATION_WORKSHEET ? _l('应用') : _l('数据库')}
            </div>
            <Dropdown
              {...dbParam}
              placeholder={_l('请选择')}
              onVisibleChange={visible => {
                if (visible) {
                  dsType === DATABASE_TYPE.APPLICATION_WORKSHEET
                    ? this.getAppList(projectId)
                    : this.getDatasourceList(node, projectId);
                }
              }}
              itemLoading={loading}
              className="mRight12 dropWorksheet"
              onChange={value => {
                this.onChangeConfig(
                  {
                    dbName:
                      dsType !== DATABASE_TYPE.APPLICATION_WORKSHEET
                        ? value
                        : (dbList.find(it => it.value === value) || {}).text,
                    appId: dsType === DATABASE_TYPE.APPLICATION_WORKSHEET ? value : '',
                    tableName: '',
                    schema: '',
                    workSheetId: '',
                    createTable: false, //是否新建工作表
                    isOurCreateTable: false,
                  },
                  () => {
                    this.setState({
                      sheetList: [],
                      appInfo:
                        dsType === DATABASE_TYPE.APPLICATION_WORKSHEET
                          ? dbList.find(it => it.value === value) || {}
                          : {},
                      worksheetInfo: {},
                      schemaList: [],
                    });
                  },
                );
              }}
              border
              openSearch
              cancelAble
              isAppendToBody
              data={dbList}
            />
            {schemaTypes.includes(className) && (
              <React.Fragment>
                <div className="title mTop20">{_l('schema')}</div>
                <Dropdown
                  placeholder={_l('请选择')}
                  value={!schema ? undefined : schema}
                  onVisibleChange={visible => {
                    if (visible) {
                      this.getSchemasList(projectId);
                    }
                  }}
                  className="mRight12 dropWorksheet"
                  onChange={value => {
                    this.onChangeConfig(
                      {
                        schema: value,
                        tableName: '',
                        createTable: false, //是否新建工作表
                        isOurCreateTable: false,
                      },
                      () => {
                        this.setState({
                          worksheetInfo: {},
                          sheetList: [],
                        });
                      },
                    );
                  }}
                  border
                  openSearch
                  cancelAble
                  isAppendToBody
                  data={schemaList}
                />
              </React.Fragment>
            )}
            <div className="title mTop20">
              {dsType === DATABASE_TYPE.APPLICATION_WORKSHEET ? _l('工作表') : _l('数据表')}
            </div>
            <Dropdown
              {...tbParam}
              placeholder={_l('请选择')}
              className="mRight12 dropWorksheet"
              onVisibleChange={visible => {
                if (visible) {
                  this.getSheetList(projectId);
                }
              }}
              renderItem={item => {
                return (
                  <div className={cx('itemText', { disabled: item.disabled })}>
                    {item.text}
                    {item.disabled && (
                      <Tooltip title={_l('名称包含特殊字符，无法同步')} placement="top" zIndex="100000">
                        <Icon icon="info1" className="Gray_bd mLeft5 disabledIcon" />
                      </Tooltip>
                    )}
                  </div>
                );
              }}
              itemLoading={loading}
              onChange={value => {
                if (value === 'add') {
                  if (!dbParam.renderValue) {
                    return alert(_l('请选择相应的表或库'), 2);
                  }
                  this.onChangeConfig(
                    {
                      tableName: '',
                      workSheetId: '',
                      createTable: true,
                      isOurCreateTable: true,
                    },
                    () => {
                      setTimeout(() => {
                        showEdit();
                      }, 500);
                    },
                  );
                } else if (!value) {
                  this.onChangeConfig(
                    {
                      tableName: '',
                      workSheetId: '',
                      createTable: false, //是否新建工作表
                      isOurCreateTable: false,
                    },
                    () => {
                      this.setState({
                        worksheetInfo: {},
                      });
                    },
                  );
                } else {
                  this.onChangeConfig(
                    {
                      tableName:
                        dsType !== DATABASE_TYPE.APPLICATION_WORKSHEET
                          ? value
                          : (sheetList.find(it => it.value === value) || {}).text,
                      workSheetId: dsType === DATABASE_TYPE.APPLICATION_WORKSHEET ? value : '',
                      createTable: false, //是否新建工作表
                      isOurCreateTable: false,
                    },
                    () => {
                      this.setState({
                        worksheetInfo:
                          dsType === DATABASE_TYPE.APPLICATION_WORKSHEET
                            ? sheetList.find(it => it.value === value) || {}
                            : {},
                      });
                      setTimeout(() => {
                        !!value && showEdit();
                      }, 500);
                    },
                  );
                }
              }}
              border
              menuClass={'DEST_TABLE' === node.nodeType ? 'dropWorksheetIntegration' : ''}
              cancelAble
              isAppendToBody
              // openSearch
              data={sheetList}
            />
          </React.Fragment>
        )}
      </WrapL>
    );
  }
}
