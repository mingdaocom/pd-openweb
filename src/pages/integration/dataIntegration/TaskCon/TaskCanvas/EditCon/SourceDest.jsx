import React, { Component } from 'react';
import { Dropdown, Icon } from 'ming-ui';
import { Tooltip } from 'antd';
import cx from 'classnames';
import DataSourceApi from 'src/pages/integration/api/datasource';
import { WrapL } from './style';
import AddSourceOrDest from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/components/AddSourceOrDest';
import homeAppAjax from 'src/api/homeApp.js';
import appManagementAjax from 'src/api/appManagement.js';
import _ from 'lodash';
import { DATABASE_TYPE, isValidName } from 'src/pages/integration/dataIntegration/constant.js';
import SheetGroupSelect from 'src/pages/integration/dataIntegration/connector/components/OnlySyncStep/SheetGroupSelect.jsx';
import SelectTables from 'src/pages/integration/dataIntegration/components/SelectTables/index.jsx';
import styled from 'styled-components';

const Wrap = styled.div`
  .mTop14 {
    margin-top: 14px;
  }
  .ant-select-disabled.ant-select:not(.ant-select-customize-input) .ant-select-selector {
    background: #fff;
  }
  .ant-select-arrow {
    display: none;
  }
  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    border-radius: 4px;
  }
  .ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
    height: 36px;
  }
`;
const WrapTopic = styled.div`
  .sourceDesInput {
    width: 100%;
    height: 40px;
    background: #f5f5f5;
    border-radius: 4px 4px 4px 4px;
    line-height: 40px;
    border: 1px solid #dedede;
  }
`;

const initData = {
  dbList: [], //数据库列表
  schemaList: [], //schema列表
  sheetList: [], //数据表列表
  appInfo: {},
  worksheetInfo: {},
  childSections: [],
};

let schemaTypes = [];
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
      childSections: [],
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
    if (schemaTypes.length <= 0) {
      const schemaTypesData = await DataSourceApi.getTypes({
        onlyCreated: false,
        onlyRelatedTask: false,
        projectId,
      });
      schemaTypes = schemaTypesData.filter(o => o.hasSchema).map(o => o.className);
    }
    const isKafka = _.get(node, 'nodeConfig.config.dsType') === 'KAFKA';
    if (isKafka) {
      return;
    }
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
        !!dbName && dsType === DATABASE_TYPE.APPLICATION_WORKSHEET && this.getSheetList();
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
  getSheetListByAppId = () => {
    const { node, childSections = [], appInfo = {} } = this.state;
    let { appId, appSectionId } = _.get(node, ['nodeConfig', 'config']) || {};
    if (!appId) {
      this.setState({
        sheetList: [],
      });
      return;
    }
    this.setState({
      loading: true,
    });
    const { sections = [] } = appInfo;
    let childSectionsWorkSheetInfo = [];

    if (appSectionId) {
      const data =
        childSections.find(o => o.appSectionId === appSectionId) ||
        sections.find(o => o.appSectionId === appSectionId) ||
        {};
      childSectionsWorkSheetInfo = data.workSheetInfo || [];
      childSectionsWorkSheetInfo = childSectionsWorkSheetInfo.concat(
        ...(data.childSections || []).map(it => it.workSheetInfo),
      );
    } else {
      sections.forEach(o => {
        childSectionsWorkSheetInfo = childSectionsWorkSheetInfo.concat(
          ...(o.childSections || []).map(it => it.workSheetInfo),
          ...o.workSheetInfo,
        );
      });
    }

    const data = (childSectionsWorkSheetInfo || [])
      .filter(o => o.type === 0) //只能是工作表
      .map(a => {
        return { ...a, text: a.workSheetName, value: a.workSheetId, icon: '' };
      });
    const list = this.filterSheet(data);
    this.setState({
      loading: false,
      sheetList: list,
    });
  };
  //表信息
  getWorksheetInfo = (workSheetId, cb) => {
    homeAppAjax.getAppItemDetail([workSheetId]).then(res => {
      cb && cb(res[0]);
      this.setState({
        worksheetInfo: res[0],
      });
    });
  };
  //应用信息
  getAppInfo = appId => {
    homeAppAjax
      .getApp({
        appId,
        getSection: true,
      })
      .then(res => {
        const { sections } = res;
        let childSections = [];
        sections.map(o => {
          childSections = childSections.concat(o.childSections);
        });
        this.setState({
          appInfo: { ..._.cloneDeep(res), appName: res.name },
          childSections,
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
      DataSourceApi.getDatabases({
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
    DataSourceApi.getSchemas({
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
  getSheetList = () => {
    let { appId, dsType } = _.get(this.state.node, ['nodeConfig', 'config']) || {};
    if (dsType === DATABASE_TYPE.APPLICATION_WORKSHEET) {
      if (!appId) {
        this.setState({
          ...initData,
        });
        return;
      }
      this.getSheetListByAppId(appId);
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
  getAllSource = () => {
    const { node = {}, list } = this.props;
    const idsMD = list
      .filter(
        o =>
          ['DEST_TABLE', 'SOURCE_TABLE'].includes(o.nodeType) &&
          _.get(o, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET &&
          !!_.get(o, 'nodeConfig.config.workSheetId') &&
          node.nodeId !== o.nodeId,
      )
      .map(o => _.get(o, 'nodeConfig.config.workSheetId'));
    const allDBs = list.filter(
      o =>
        ['DEST_TABLE', 'SOURCE_TABLE'].includes(o.nodeType) &&
        _.get(o, 'nodeConfig.config.dsType') !== DATABASE_TYPE.APPLICATION_WORKSHEET &&
        !!_.get(o, 'nodeConfig.config.tableName') &&
        node.nodeId !== o.nodeId,
    );
    const idsDB = allDBs.map(o => {
      return `${_.get(o, 'nodeConfig.config.dsType')}-${_.get(o, 'nodeConfig.config.dbName')}-${
        _.get(o, 'nodeConfig.config.schema') || 'schema'
      }-${_.get(o, 'nodeConfig.config.tableName')}`;
    });
    const dBs = list
      .filter(
        o =>
          ['DEST_TABLE', 'SOURCE_TABLE'].includes(o.nodeType) &&
          _.get(o, 'nodeConfig.config.dsType') !== DATABASE_TYPE.APPLICATION_WORKSHEET &&
          o.nodeId !== node.nodeId,
      )
      .map(
        o =>
          `${_.get(o, 'nodeConfig.config.dsType')}-${_.get(o, 'nodeConfig.config.dbName')}-${
            _.get(o, 'nodeConfig.config.schema') || 'schema'
          }`,
      );
    const sourceTables = list
      .filter(
        o =>
          ['DEST_TABLE', 'SOURCE_TABLE'].includes(o.nodeType) &&
          _.get(o, 'nodeConfig.config.dsType') !== DATABASE_TYPE.APPLICATION_WORKSHEET &&
          !!_.get(o, 'nodeConfig.config.tableName') &&
          o.nodeId !== node.nodeId,
      )
      .map(o => _.get(o, 'nodeConfig.config.tableName'));

    return { idsMD, idsDB, dBs, sourceTables };
  };

  filterSheet = (sheetList = [], withoutAdd) => {
    const { node = {} } = this.props;
    const { dsType } = _.get(node, ['nodeConfig', 'config']) || {};
    const { idsMD, idsDB } = this.getAllSource();
    //排除当前画布已经配置过的源或者目的地表 =>表不重复
    const data = sheetList
      .filter(it =>
        dsType !== DATABASE_TYPE.APPLICATION_WORKSHEET
          ? !idsDB.includes(
              `${_.get(node, 'nodeConfig.config.dsType')}-${_.get(node, 'nodeConfig.config.dbName')}-${
                _.get(node, 'nodeConfig.config.schema') || 'schema'
              }-${it.value}`,
            )
          : !idsMD.includes(it.value),
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
    return withoutAdd
      ? data
      : 'DEST_TABLE' === node.nodeType //目的地才有新建工作表
      ? [
          {
            iconName: 'add1',
            value: 'add',
            text: dsType === DATABASE_TYPE.APPLICATION_WORKSHEET ? _l('新建工作表') : _l('新建数据表'),
          },
        ].concat(data)
      : data;
  };

  onChangeTables = value => {
    const { showEdit } = this.props;
    const { node = {} } = this.state;
    const { sheetList = [], appInfo = {} } = this.state;
    const { dbName = '', appId, dsType, appSectionId } = _.get(node, ['nodeConfig', 'config']) || {};
    const dbValue = dsType === DATABASE_TYPE.APPLICATION_WORKSHEET ? appId : dbName;
    let dbParam = {
      value: !dbValue ? undefined : dbValue,
      renderValue: dbName || appInfo.name,
    };

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
      let dataConfig = {};
      if (dsType === DATABASE_TYPE.APPLICATION_WORKSHEET) {
        if (!appSectionId) {
          const { sections = [] } = appInfo;
          const { childSections = [] } = this.state;
          const section = childSections.find(o => o.workSheetInfo.map(a => a.workSheetId).includes(value));
          dataConfig = {
            appSectionId: section
              ? section.appSectionId
              : (sections.find(o => o.workSheetInfo.map(a => a.workSheetId).includes(value)) || {}).appSectionId,
          };
        }
      }
      this.onChangeConfig(
        {
          tableName:
            dsType !== DATABASE_TYPE.APPLICATION_WORKSHEET
              ? value
              : (sheetList.find(it => it.value === value) || {}).text,
          workSheetId: dsType === DATABASE_TYPE.APPLICATION_WORKSHEET ? value : '',
          createTable: false, //是否新建工作表
          isOurCreateTable: false,
          ...dataConfig,
        },
        () => {
          this.setState({
            worksheetInfo:
              dsType === DATABASE_TYPE.APPLICATION_WORKSHEET ? sheetList.find(it => it.value === value) || {} : {},
          });
          setTimeout(() => {
            !!value && showEdit();
          }, 500);
        },
      );
    }
  };
  render() {
    const { currentProjectId: projectId } = this.props;
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
      appSectionId,
      datasourceId,
      dataDestId,
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
    if ('DEST_TABLE' === node.nodeType) {
      tbParam.searchNull = () => {
        return (
          <div
            className="ThemeColor3 Hand"
            onClick={() => {
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
            }}
          >
            <Icon icon="add1" className="Font12 mRight10 ThemeColor3" />
            <span className="mLeft10">
              {dsType === DATABASE_TYPE.APPLICATION_WORKSHEET ? _l('新建工作表') : _l('新建数据表')}
            </span>
          </div>
        );
      };
    }

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
        {!!dsType &&
          (['kafka'].includes(className) ? (
            <WrapTopic>
              <div className="title mTop20">
                <div className="title mTop20">{_l('主题表达式')} (topic)</div>
                <div className="sourceDesInput mTop12 pLeft12">{dbName}</div>
              </div>
            </WrapTopic>
          ) : (
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
                      appSectionId: undefined,
                    },
                    () => {
                      this.setState(
                        {
                          sheetList: [],
                          appInfo: {},
                          worksheetInfo: {},
                          schemaList: [],
                        },
                        () => {
                          !!value && dsType === DATABASE_TYPE.APPLICATION_WORKSHEET && this.getAppInfo(value);
                        },
                      );
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
                  <div className="title mTop20">schema</div>
                  <Dropdown
                    placeholder={_l('请选择')}
                    value={!schema ? undefined : schema}
                    renderValue={schema}
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
              {dsType === DATABASE_TYPE.APPLICATION_WORKSHEET && (
                <React.Fragment>
                  <div className="title mTop20">{_l('分组')}</div>
                  <SheetGroupSelect
                    hideTitle
                    key={appId}
                    className={'selectGroupDropWorksheet dropWorksheet w100'}
                    suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                    appId={appId}
                    value={appSectionId}
                    onChange={appSectionId => {
                      this.onChangeConfig(
                        {
                          tableName: '',
                          appSectionId,
                          workSheetId: '',
                          createTable: false, //是否新建工作表
                          isOurCreateTable: false,
                        },
                        () => {
                          this.setState({
                            sheetList: [],
                            worksheetInfo: {},
                          });
                        },
                      );
                    }}
                  />
                </React.Fragment>
              )}
              <div className="title mTop20">
                {dsType === DATABASE_TYPE.APPLICATION_WORKSHEET ? _l('工作表') : _l('数据表')}
              </div>
              {dsType !== DATABASE_TYPE.APPLICATION_WORKSHEET ? (
                <Wrap>
                  <SelectTables
                    key={node.nodeId}
                    className={cx('selectItem boderRadAll_4 mTop14 w100', {
                      disabled: schemaTypes.includes(className) ? !dbName || !schema : !dbName,
                    })}
                    value={!tableName ? undefined : tableName}
                    options={this.filterSheet(sheetList, true)}
                    onChangeOptions={sheetList => this.setState({ sheetList })}
                    onChangeTable={data => this.onChangeTables(_.get(data, 'value'))}
                    projectId={this.props.currentProjectId}
                    datasourceId={datasourceId || dataDestId}
                    dbName={dbName}
                    schema={schema}
                    isMultiple={false}
                    disabled={schemaTypes.includes(className) ? !dbName || !schema : !dbName}
                    suffixIcon={<Icon icon="arrow-down-border Font14" />}
                    placeholder={_l('请选择')}
                    allowCreate={'DEST_TABLE' === node.nodeType}
                    createText={_l('新建数据表')}
                    onAdd={() => {
                      this.onChangeTables('add');
                    }}
                    isSameDbObj={this.getAllSource().dBs.includes(`${dsType}-${dbName}-${schema || 'schema'}`)}
                    sourceTables={this.getAllSource().sourceTables}
                  />
                </Wrap>
              ) : (
                <Dropdown
                  {...tbParam}
                  placeholder={_l('请选择')}
                  className="mRight12 dropWorksheet"
                  onVisibleChange={visible => {
                    if (visible) {
                      this.getSheetList();
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
                  onChange={this.onChangeTables}
                  renderTitle={() => {
                    return (
                      <div className="flexRow alignItemsCenter">
                        <div className="flex overflow_ellipsis WordBreak" style={{ maxWidth: 446 }}>
                          {tbParam.renderValue}
                        </div>
                        {dsType === DATABASE_TYPE.APPLICATION_WORKSHEET &&
                          !_.get(node, 'nodeConfig.config.createTable') && (
                            <Icon
                              icon="task-new-detail"
                              className="mLeft10 Font12 ThemeColor3 ThemeHoverColor2 Hand"
                              onClick={e => {
                                e.stopPropagation();
                                if (!_.get(worksheetInfo, 'sectionId')) {
                                  this.getWorksheetInfo(workSheetId, worksheetInfo => {
                                    window.open(
                                      !_.get(worksheetInfo, 'sectionId')
                                        ? `/app/${dbValue}`
                                        : `/app/${dbValue}/${_.get(worksheetInfo, 'sectionId')}/${tbValue}`,
                                    );
                                  });
                                } else {
                                  window.open(`/app/${dbValue}/${worksheetInfo.sectionId}/${tbValue}`);
                                }
                              }}
                            />
                          )}
                      </div>
                    );
                  }}
                  border
                  menuClass={'dropWorksheetIntegration'}
                  cancelAble
                  isAppendToBody
                  openSearch
                  data={sheetList}
                />
              )}
            </React.Fragment>
          ))}
      </WrapL>
    );
  }
}
