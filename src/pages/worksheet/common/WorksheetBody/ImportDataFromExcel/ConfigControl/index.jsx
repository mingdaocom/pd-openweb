import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import sheetAjax from 'src/api/worksheet';
import { Button, Checkbox, Dropdown, LoadDiv, Dialog, ScrollView, Tooltip, Icon } from 'ming-ui';
import './index.less';
import { getIconByType } from 'src/pages/widgetConfig/util';
import DropDownItem from './DropDownItem';

const allowConfigControlTypes = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 19, 23, 24, 26, 27, 28, 29, 33, 41];
const recordObj = {
  text: _l('记录ID'),
  value: 'rowid',
};

const handleEnumText = {
  1: _l('跳过'),
  2: _l('覆盖'),
  3: _l('仅更新'),
};
export default class ConfigControl extends Component {
  static propTypes = {
    appId: PropTypes.string,
    worksheetId: PropTypes.string,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    worksheetId: PropTypes.string,
    selectRow: PropTypes.object,
    onPrevious: PropTypes.func,
    importSheetInfo: PropTypes.object,
    filePath: PropTypes.string,
    fileId: PropTypes.string,
    fileKey: PropTypes.string,
    isCharge: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true, // 获取控件信息
      worksheetControls: [], // 工作表控件
      workSheetProjectId: '', // 工作表所属网络id
      controlMapping: [], // 工作表控件映射 controlId: columnNumber
      showWarningDialog: false, // 警告弹层
      showConfirmDialog: false, // 下一步确认弹层
      mapControlLength: 0, // 映射的字段数
      noMapArray: [], // 没有映射的excel字段名称
      dropDownData: this.getDropShowContent(), // excel下拉选项
      repeatRecord: false,
      tigger: false,
      fieldsList: [],
      repeatConfig: {
        controlId: '', // 需要去重控件id
        controlName: '', // 控件名称
        handleEnum: 1, // 处理方式： 1=跳过 2=新增
      },
      relateSource: {},
      edited: false, //不允许非管理员修改配置
      showStar: null, //依据字段无映射时星号
    };
  }

  request = null;
  cacheSource = null;
  hasRecordId = {};

  componentWillMount() {
    const { appId, worksheetId } = this.props;
    this.getWorksheetInfo(appId, worksheetId);
  }

  /**
   * 获取模板
   */
  getWorksheetInfo(appId, worksheetId, isRelate) {
    sheetAjax
      .getWorksheetInfo({
        appId,
        worksheetId,
        getTemplate: true,
      })
      .then(data => {
        data.template.controls = data.template.controls.filter(
          item => !_.includes(['caid', 'ownerid', 'ctime', 'utime'], item.controlId),
        );

        if (isRelate) {
          this.cacheSource[data.worksheetId] = {
            name: data.name,
            controls: data.template.controls
              .filter(item => _.includes([2, 3, 4, 5, 7, 32, 33], item.type))
              .map(item => {
                return {
                  text: item.controlName,
                  value: item.controlId,
                  attribute: item.attribute,
                };
              }),
          };
          this.setState({ relateSource: this.cacheSource });
        } else {
          this.disposeInitSource(data);
        }
      });
  }

  /**
   * 处理init数据
   */
  disposeInitSource(data) {
    const { isCharge, appId, worksheetId, selectRow } = this.props;
    const { relateSource } = this.state;
    const controlMapping = [];
    const relateArr = [];

    data.template.controls = data.template.controls.filter(controlItem => {
      const fieldPermission = controlItem.fieldPermission || '111';
      const controlPermissions = controlItem.controlPermissions || '111';

      return (
        controlItem.type !== 22 &&
        ((fieldPermission[0] === '1' &&
          fieldPermission[2] === '1' &&
          controlPermissions[0] === '1' &&
          controlPermissions[2] === '1') ||
          isCharge)
      );
    });
    data.template.controls.forEach(controlItem => {
      if (_.includes(allowConfigControlTypes, controlItem.type)) {
        const exact = this.props.selectRow.cells.filter(cellItem => cellItem.value === controlItem.controlName);
        const like = this.props.selectRow.cells.filter(
          cellItem => cellItem.value.indexOf(controlItem.controlName) > -1,
        );
        const sameColumn = exact.length ? exact : like;

        // 关联多条不支持
        if (controlItem.type === 29 && controlItem.enumDefault === 2) {
          return;
        }

        controlMapping.push({
          ColumnNum: sameColumn.length > 0 ? sameColumn[0].columnNumber + 1 : '',
          ColumnName: sameColumn.length > 0 ? controlItem.controlName : '',
          ControlId: controlItem.controlId,
          sourceConfig: {
            worksheetId: controlItem.type === 29 ? controlItem.dataSource : '',
            controlId: '',
          },
        });

        // 关联控件
        if (
          controlItem.type === 29 &&
          !relateArr.find(obj => obj.appId === controlItem.appId && obj.workSheetId === controlItem.workSheetId)
        ) {
          relateArr.push({ appId: controlItem.appId, workSheetId: controlItem.dataSource });
        }
      }
    });
    let fieldsList = data.template.controls
      .filter(item => _.includes([2, 3, 4, 5, 6, 7, 33], item.type))
      .map(item => {
        return {
          text: item.controlName,
          value: item.controlId,
        };
      });

    //是否包含记录id
    this.hasRecordId = _.find(selectRow.cells, rowItem => rowItem.value === recordObj.text) || {};
    if (this.hasRecordId.value) {
      fieldsList.push(recordObj);
    }

    $.ajax({
      type: 'GET',
      url: `${md.global.Config.WorksheetDownUrl}/ExportExcel/GetConfig`,
      data: {
        worksheetId,
        appId,
        accountId: md.global.Account.accountId,
      },
    }).then(configData => {
      let configObjState = {};
      if (configData.resultCode === 1) {
        let { tigger, edited, repeatConfig, configs } = configData.data;
        repeatConfig = repeatConfig ? repeatConfig : {};
        const currentRepeatItem =
          _.find(data.template.controls, item => item.controlId === repeatConfig.controlId) || {};

        configObjState = {
          tigger,
          repeatRecord: repeatConfig.controlId ? true : false,
          edited,
          showStar: repeatConfig.controlId || null,
        };
        //过滤掉删除的依据字段和关联匹配字段
        const configsFilter =
          configs.filter(item => _.findIndex(data.template.controls, con => con.controlId === item.controlId) > -1) ||
          [];
        controlMapping.forEach(item => {
          const editItem = _.find(configsFilter, configItem => configItem.controlId === item.ControlId) || {};
          if (editItem.controlId) {
            item.sourceConfig = editItem.sourceConfig;
            item.isAddOption = editItem.isAddOption;
          }
        });

        if (_.findIndex(data.template.controls, con => con.controlId === repeatConfig.controlId) > -1) {
          configObjState.repeatConfig = {
            controlId: repeatConfig.controlId,
            controlName: _.get(currentRepeatItem, 'controlName'),
            handleEnum: repeatConfig.handleEnum,
          };
        }
      }

      this.setState({
        worksheetControls: data.template.controls.sort((a, b) => {
          if (a.row === b.row) {
            return a.col - b.col;
          }
          return a.row - b.row;
        }),
        controlMapping,
        workSheetProjectId: data.projectId,
        fieldsList,
        ...configObjState,
        loading: false,
      });
    });

    this.cacheSource = Object.assign({}, relateSource);
    _.uniq(relateArr, o => o.workSheetId).forEach(item => {
      this.getWorksheetInfo(item.appId, item.workSheetId, true);
    });
  }

  /**
   * 获取选中 excel字段以后预览呈现的字段值
   */
  getDropShowContent() {
    const { selectRow, importSheetInfo } = this.props;
    const selectRowNumber = selectRow.rowNumber;
    const sheetRows = importSheetInfo.rows;
    const getPreviewContent = (row, columnNumber) => {
      const previewContent = _.find(row.cells, cellItem => cellItem.columnNumber === columnNumber).value;
      if (previewContent) {
        return previewContent;
      } else if (row.rowNumber === 10) {
        return '';
      } else {
        const nextRow = _.find(sheetRows, rowItem => rowItem.rowNumber === row.rowNumber + 1);
        return getPreviewContent(nextRow, columnNumber);
      }
    };
    const dropDownData = selectRow.cells.map(item => {
      const nextRow = _.find(sheetRows, rowItem => rowItem.rowNumber === selectRowNumber + 1);
      return {
        text: item.value,
        value: item.columnNumber + 1,
        previewContent: getPreviewContent(nextRow, item.columnNumber),
      };
    });
    dropDownData.unshift({ text: _l('请选择'), value: '' });
    return dropDownData;
  }

  beginImport = controlMappingFilter => {
    const { tigger, repeatConfig, repeatRecord, worksheetControls, edited, controlMapping, relateSource } = this.state;
    const relateMapping = controlMappingFilter.filter(
      item => item.sourceConfig.worksheetId && !item.sourceConfig.controlId,
    );
    if (repeatRecord) {
      if (!repeatConfig.controlId) {
        alert(_l('请选择重复记录的依据字段'), 3);
        return false;
      } else {
        if (
          repeatConfig.controlId !== recordObj.value &&
          !_.get(_.find(controlMapping, item => item.ControlId === repeatConfig.controlId) || {}, 'ColumnNum')
        ) {
          alert(_l('请设置“%0”字段的映射关系', repeatConfig.controlName), 3);
          return false;
        }
      }
    }

    if (relateMapping.length) {
      alert(_l('他表字段不可为空'), 3);
      return false;
    }

    if (!this.props.isCharge && edited) {
      //依据字段是否删除
      let deleteRepeatName =
        repeatRecord && _.findIndex(worksheetControls, item => item.controlId === repeatConfig.controlId) === -1;
      //关联记录匹配字段是否删除
      let relatedName = false;
      worksheetControls.map(controlItem => {
        if (controlItem.type === 29 && controlItem.enumDefault === 1) {
          controlMapping.map(item => {
            if (item.ControlId === controlItem.controlId && item.sourceConfig.worksheetId) {
              const relationControls = relateSource[item.sourceConfig.worksheetId].controls || [];
              relatedName = _.findIndex(relationControls, rel => rel.value === item.sourceConfig.controlId) === -1;
            }
          });
        }
      });
      if (deleteRepeatName || relatedName) {
        alert(_l('导入配置存在错误，请联系管理员处理'), 3);
        return false;
      }
    }

    Dialog.confirm({
      title: _l('数据导入确认'),
      description: (
        <div className="Font14">
          <div
            className="mBottom10 Gray_75"
            dangerouslySetInnerHTML={{
              __html: _l(
                '1.导入的数据%0',
                `<span class="Gray Bold">${tigger ? _l('触发工作流') : _l('不会触发工作流')}</span>`,
              ),
            }}
          ></div>
          {repeatRecord ? (
            <div
              dangerouslySetInnerHTML={{
                __html: _l(
                  '2.将Excel中%0列与工作表中%1字段逐行对比，%2识别到的重复数据，%3',
                  `<span class="Gray Bold">【 ${
                    repeatConfig.controlId === recordObj.value
                      ? recordObj.text
                      : _.get(
                          _.find(controlMappingFilter, item => item.ControlId === repeatConfig.controlId) || {},
                          'ColumnName',
                        )
                  } 】</span>`,
                  `<span class="Gray Bold">【 ${
                    repeatConfig.controlId === recordObj.value ? recordObj.value : repeatConfig.controlName
                  } 】</span>`,
                  `<span class="Gray Bold">${handleEnumText[repeatConfig.handleEnum]}</span>`,
                  `<span>${
                    repeatConfig.handleEnum === 3
                      ? _l('不重复的数据不会作为新记录导入')
                      : _l('将所有不重复的数据作为新记录导入工作表')
                  }</span>`,
                ),
              }}
            ></div>
          ) : (
            <div className="Gray_75">{_l('2.不识别重复数据，将Excel中所有数据都作为新记录导入工作表')}</div>
          )}
        </div>
      ),
      onOk: () => this.onImport(controlMappingFilter),
    });
  };

  onImport = controlMapping => {
    const { filePath, fileId, fileKey, worksheetId, appId, selectRow, importSheetInfo, onSave, onCancel } = this.props;
    const { workSheetProjectId, repeatRecord, tigger, repeatConfig } = this.state;

    let cellConfigs = controlMapping.map(item => {
      return { ...item, ColumnNum: item.ColumnNum - 1 };
    });

    //记录id
    if (repeatConfig.controlId === recordObj.value) {
      cellConfigs.push({
        ColumnNum: this.hasRecordId.columnNumber,
        ColumnName: recordObj.text,
        ControlId: recordObj.value,
      });
    }

    // 避免重复提交
    if (this.request) return;

    this.request = true;

    onSave(fileKey);

    $.ajax(md.global.Config.WorksheetDownUrl + '/ExportExcel/EntranceWorksheet', {
      type: 'POST',
      data: {
        filePath,
        fileId,
        workSheetId: worksheetId,
        appId,
        accountId: md.global.Account.accountId,
        titleNumber: selectRow.rowNumber,
        cellConfigs,
        projectId: workSheetProjectId,
        sheetNumber: importSheetInfo.sheetNumber,
        randomKey: fileKey,
        repeatConfig: repeatRecord ? repeatConfig : null,
        tigger,
      },
      beforeSend: xhr => {
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      },
    });
    onCancel();
  };

  /**
   * 保存配置
   */
  saveConfig = () => {
    const { worksheetId } = this.props;

    Dialog.confirm({
      title: _l('保存导入配置'),
      description: (
        <div className="Font14">
          <div className="Gray_75">
            {_l(
              '将当前导入配置保存为默认导入方式供所有用户使用，其中字段映射关系不会保存，若Excel列名称和字段名称相同会自动映射对应',
            )}
          </div>
          <Checkbox
            className="mTop20 Gray"
            text={_l('不允许非管理员修改默认配置')}
            defaultChecked={this.state.edited}
            onClick={checked => this.setState({ edited: checked })}
          />
        </div>
      ),
      onOk: () => {
        const {
          edited,
          workSheetProjectId,
          worksheetControls,
          controlMapping,
          repeatConfig,
          tigger,
          repeatRecord,
        } = this.state;
        const configsFilter = [];
        worksheetControls.map(controlItem => {
          //新增选项、关联记录匹配字段
          if (_.includes([9, 10, 11], controlItem.type) || (controlItem.type === 29 && controlItem.enumDefault === 1)) {
            const currentItem = _.find(controlMapping, item => item.ControlId === controlItem.controlId) || {};
            const { ControlId, isAddOption = false, sourceConfig } = currentItem;
            configsFilter.push({
              controlId: ControlId,
              isAddOption,
              sourceConfig,
            });
          }
        });
        $.ajax({
          type: 'POST',
          url: `${md.global.Config.WorksheetDownUrl}/ExportExcel/SaveConfig`,
          data: JSON.stringify({
            projectId: workSheetProjectId,
            worksheetId,
            repeatConfig: repeatRecord ? repeatConfig : null,
            tigger,
            edited,
            configs: configsFilter,
            accountId: md.global.Account.accountId,
          }),
          dataType: 'JSON',
          contentType: 'application/json',
        }).done(res => {
          if (res) {
            alert(_l('保存成功'));
          }
        });
      },
      onCancel: () => {},
    });
  };

  /**
   * 渲染底部
   */
  renderFooter() {
    const { onPrevious, isCharge } = this.props;
    const { repeatRecord, tigger, repeatConfig, fieldsList, controlMapping, edited } = this.state;
    const controlMappingFilter = controlMapping.filter(item => item.ColumnNum) || [];
    const list = [
      { text: _l('跳过'), value: 1 },
      { text: _l('覆盖'), value: 2 },
      { text: _l('仅更新，不新增记录'), value: 3 },
    ];

    return (
      <div className="mTop16">
        {edited && !isCharge ? null : (
          <div className="flexRow LineHeight36">
            <Checkbox
              text={_l('导入触发工作流')}
              checked={tigger}
              onClick={checked => this.setState({ tigger: !checked })}
            />

            <Checkbox
              className="mLeft25"
              text={_l('识别重复记录')}
              checked={repeatRecord}
              onClick={checked => {
                if (fieldsList.length) {
                  this.setState({ repeatRecord: !checked, showStar: !checked ? repeatConfig.controlId : null });
                } else {
                  alert(_l('不存在有效的依据字段'), 2);
                }
              }}
            />
            {repeatRecord && (
              <Fragment>
                <Dropdown
                  className="mLeft8 repeatConfigDropdown"
                  data={list}
                  value={repeatConfig.handleEnum}
                  border
                  onChange={handleEnum =>
                    this.setState({ repeatConfig: Object.assign({}, repeatConfig, { handleEnum }) })
                  }
                />
                <div className="mLeft8 Gray">{_l('依据字段')}</div>
                <Dropdown
                  className="mLeft8 repeatConfigDropdown"
                  data={fieldsList}
                  placeholder={_l('请选择')}
                  value={repeatConfig.controlId ? repeatConfig.controlId : undefined}
                  border
                  onChange={controlId => {
                    this.setState({
                      repeatConfig: Object.assign({}, repeatConfig, {
                        controlId,
                        controlName: fieldsList.find(item => item.value === controlId).text,
                      }),
                      showStar: controlId,
                    });
                  }}
                />
                <Tooltip
                  text={<span>{_l('支持以下字段类型：文本框、电话号码、邮件地址、证件、自动编号、数值、记录ID')}</span>}
                >
                  <i className="icon-workflow_help Gray_9e Font16 mLeft8 LineHeight36" />
                </Tooltip>
              </Fragment>
            )}
          </div>
        )}

        <div className="flexRow mTop12" style={{ alignItems: 'center' }}>
          {isCharge && (
            <span className="Hand ThemeColor3 Hover_49" onClick={() => this.saveConfig()}>
              {_l('保存导入配置')}
            </span>
          )}
          <div className="flex" />
          <Button className="mRight16" size="medium" type="secondary" onClick={onPrevious}>
            {_l('上一步')}
          </Button>
          <Button
            size="medium"
            disabled={!controlMappingFilter.length}
            onClick={() => this.beginImport(controlMappingFilter)}
          >
            {_l('开始导入')}
          </Button>
        </div>
      </div>
    );
  }

  /**
   * 渲染关联表
   */
  renderRelateWorksheet(controlItem, isHiddenConfig) {
    const { controlMapping, relateSource } = this.state;
    const selectItem = controlMapping.find(item => item.ControlId === controlItem.controlId);
    const worksheetId = selectItem.sourceConfig.worksheetId;

    if (!relateSource[worksheetId]) {
      return null;
    }

    let currentItem = selectItem.sourceConfig.controlId;
    const defaultItem = relateSource[worksheetId].controls.find(item => item.attribute) || {};
    if (!currentItem && defaultItem.value) {
      currentItem = defaultItem.value;
      const newControlMapping = controlMapping.concat();
      newControlMapping.forEach(item => {
        if (item.ControlId === controlItem.controlId) {
          item.sourceConfig.controlId = defaultItem.value;
        }
      });
      this.setState({ controlMapping: newControlMapping });
    }

    return (
      <div className="flexRow relateBox">
        <div className="Gray_9e">{_l('关联表：')}</div>
        <div className="mLeft5 mRight10 flex ellipsis">{relateSource[worksheetId].name}</div>
        {isHiddenConfig ? null : (
          <Fragment>
            <Tooltip text={<span>{_l('支持以下字段类型：文本框、电话号码、邮件地址、证件、文本拼接、自动编号')}</span>}>
              <i className="icon-workflow_help Gray_9e Font16" />
            </Tooltip>
            <div className="Gray_9e mLeft5">{_l('匹配字段：')}</div>
            <Dropdown
              menuStyle={{ width: 180 }}
              data={relateSource[worksheetId].controls}
              value={currentItem}
              isAppendToBody
              onChange={controlId => {
                const newControlMapping = controlMapping.concat();
                newControlMapping.forEach(item => {
                  if (item.ControlId === controlItem.controlId) {
                    item.sourceConfig.controlId = controlId;
                  }
                });
                this.setState({ controlMapping: newControlMapping });
              }}
            />
          </Fragment>
        )}
      </div>
    );
  }

  render() {
    const { onCancel, isCharge } = this.props;
    const { dropDownData, controlMapping, worksheetControls, loading, edited, showStar } = this.state;
    const isHiddenConfig = edited && !isCharge;
    return (
      <Dialog
        className="workConfigControl"
        visible={true}
        width="960"
        title={_l('数据导入 - 建立映射（3/3）')}
        footer={null}
        anim={false}
        overlayClosable={false}
        onCancel={onCancel}
      >
        <div className="flexColumn h100">
          <div className="workConfigControlBox flex flexColumn">
            <div className="flexRow bold">
              <div className="flex">{_l('Excel列')}</div>
              <div className="controlSeparate" />
              <div className="flex">{_l('工作表字段')}</div>
            </div>

            <ScrollView className="controlBox flex mTop15">
              {loading ? (
                <LoadDiv className="mTop32" />
              ) : (
                <Fragment>
                  {worksheetControls.map((controlItem, index) => {
                    const notSupport =
                      !_.includes(allowConfigControlTypes, controlItem.type) ||
                      (controlItem.type === 29 && controlItem.enumDefault === 2);
                    return (
                      <div className="flexRow mBottom6" key={index}>
                        <div className="excelControls flex">
                          {!notSupport && (
                            <DropDownItem
                              key={index}
                              listWidth={390}
                              dropDownData={dropDownData}
                              value={_.find(controlMapping, item => item.ControlId === controlItem.controlId).ColumnNum}
                              onChange={value => {
                                let newControlMapping = controlMapping.concat();
                                newControlMapping = newControlMapping.map(item => {
                                  if (item.ControlId === controlItem.controlId) {
                                    return {
                                      ...item,
                                      ColumnNum: value,
                                      ColumnName: _.find(dropDownData, dataItem => dataItem.value === value).text,
                                    };
                                  }
                                  return item;
                                });
                                this.setState({ controlMapping: newControlMapping });
                              }}
                            />
                          )}
                        </div>
                        <div className="controlSeparate">
                          {!notSupport && (
                            <i
                              className={cx(
                                'icon-backspace Font18',
                                (_.find(controlMapping, item => item.ControlId === controlItem.controlId) || {})
                                  .ColumnNum
                                  ? 'ThemeColor3'
                                  : 'Gray_bd',
                              )}
                            />
                          )}
                        </div>
                        <div className="sheetControls flex">
                          <div className="controlItem flexRow">
                            <Icon className="Font16 Gray_9e" icon={getIconByType(controlItem.type)} />
                            <span className="mLeft10 ellipsis flex Relative">
                              {controlItem.controlName}
                              {showStar === controlItem.controlId && <span className="mLeft3 star">*</span>}
                            </span>
                            {(controlItem.type === 9 || controlItem.type === 10 || controlItem.type === 11) &&
                              !isHiddenConfig && (
                                <Fragment>
                                  <span className="Gray_75 mRight8">{_l('允许新增选项')}</span>
                                  <Checkbox
                                    text=""
                                    checked={
                                      !!controlMapping.find(item => item.ControlId === controlItem.controlId)
                                        .isAddOption
                                    }
                                    onClick={checked => {
                                      const newMapping = _.cloneDeep(controlMapping);
                                      newMapping.forEach(item => {
                                        if (item.ControlId === controlItem.controlId) {
                                          item.isAddOption = !checked;
                                        }
                                      });

                                      this.setState({ controlMapping: newMapping });
                                    }}
                                  />
                                </Fragment>
                              )}
                            {controlItem.type === 33 && (
                              <span className="Gray_9e">{_l('不建立映射则按照编号规则自动生成')}</span>
                            )}
                            {notSupport && <span className="Gray_9e">{_l('此字段不支持建立映射')}</span>}
                          </div>
                          {controlItem.type === 29 &&
                            controlItem.enumDefault === 1 &&
                            this.renderRelateWorksheet(controlItem, isHiddenConfig)}
                        </div>
                      </div>
                    );
                  })}
                </Fragment>
              )}
            </ScrollView>
          </div>
          {this.renderFooter()}
        </div>
      </Dialog>
    );
  }
}
