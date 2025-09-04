import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import filterXSS from 'xss';
import { Button, Checkbox, Dialog, Dropdown, Icon, LoadDiv, Menu, ScrollView, Tooltip } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import { getIconByType } from 'src/pages/widgetConfig/util';
import DropDownItem from './DropDownItem';
import './index.less';

const allowConfigControlTypes = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 19, 23, 24, 26, 27, 28, 29, 33, 36, 41, 46, 48,
];
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
      edited: true, // 不允许非管理员修改配置
      showStar: null, // 依据字段无映射时星号
      errorSkip: [], // 跳过错误数据
      showErrorSkip: false,
      // 用户匹配字段
      userControls: [
        {
          text: _l('姓名'),
          value: 'name',
        },
        {
          text: _l('手机号'),
          value: 'phone',
        },
        {
          text: _l('邮箱'),
          value: 'email',
        },
        {
          text: _l('工号'),
          value: 'jobId',
        },
        {
          text: _l('人员ID'),
          value: 'userId',
        },
      ],
      // 部门匹配字段
      departmentControls: [
        {
          text: _l('名称'),
          value: 'name',
        },
        {
          text: _l('部门系统ID'),
          value: 'depId',
        },
      ],
    };
  }

  request = null;
  cacheSource = null;
  hasRecordId = {};

  componentWillMount() {
    const { appId, worksheetId } = this.props;
    this.getWorksheetInfo({ appId, worksheetId });
  }

  /**
   * 通过API获取模板
   */
  async getWorksheetInfo(args = {}, isRelate) {
    const data = await sheetAjax.getWorksheetInfo({
      ...args,
      getTemplate: true,
    });

    // 过滤掉系统字段
    data.template.controls = data.template.controls.filter(item => !_.includes(ALL_SYS, item.controlId));

    // 处理关联表数据
    if (isRelate) {
      const { worksheetId, name } = data;
      const { worksheetControls, controlMapping } = this.state;

      // 关联表字段
      const controls = data.template.controls
        .filter(item => _.includes([2, 3, 4, 5, 7, 32, 33], item.type))
        .map(item => {
          return {
            text: item.controlName,
            value: item.controlId,
            attribute: item.attribute,
          };
        });

      // 获取标题字段
      const title = controls.find(item => item.attribute == 1);

      // 支持把记录ID作为映射
      controls.unshift(recordObj);

      // 把标题作为关联字段默认映射
      for (const control of worksheetControls.filter(item => item.dataSource == worksheetId)) {
        const mapping = controlMapping.find(item => item.ControlId == control.controlId);
        if (!mapping) continue;

        if (mapping.sourceConfig.controlId) {
          control.sourceConfig = mapping.sourceConfig.controlId;
        } else {
          // 模糊匹配映射字段
          const arr = (mapping.ColumnName || '').split('-');
          const suffix = arr[arr.length - 1].toLowerCase();
          const item = controls.find(item => item.text.toLowerCase() == suffix);
          if (item) {
            control.sourceConfig = item.value;
            mapping.sourceConfig.controlId = item.value;
          } else if (title) {
            // 如果没有，默认选择标题字段作为映射
            control.sourceConfig = title.value;
            mapping.sourceConfig.controlId = title.value;
          }
        }
      }

      this.cacheSource[worksheetId] = { name, controls };
      await new Promise(resolve =>
        this.setState(
          {
            relateSource: this.cacheSource,
            worksheetControls,
          },
          resolve,
        ),
      );
    }

    // 处理导入的数据
    else await this.disposeInitSource(data);
  }

  /**
   * 处理init数据
   */
  async disposeInitSource(data) {
    const { isCharge, appId, worksheetId, selectRow } = this.props;

    const { relateSource, userControls, departmentControls } = this.state;
    const controlMapping = [];
    const relateArr = [];

    // 过滤掉无权限操作的字段
    data.template.controls = (data.template.controls || []).filter(controlItem => {
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

    // 关联控件字段
    for (const controlItem of data.template.controls) {
      const { type, controlName, advancedSetting, controlId, dataSource, appId, workSheetId } = controlItem;

      // 过滤掉不支持匹配映射的字段
      if (!_.includes(allowConfigControlTypes, type)) continue;

      // 过滤掉列表展示关联记录多条
      const isRealtionList = type == 29 && advancedSetting && advancedSetting.showtype == '2';
      if (isRealtionList) continue;

      // 字段名称匹配默认
      const exact = [],
        like = [],
        relations = [];
      let matchId = _.includes([26, 27], type) ? 'name' : '';
      for (const cell of selectRow.cells) {
        const { value } = cell;

        // 成员、部门字段默认匹配
        const isExternal = type === 26 && advancedSetting && advancedSetting.usertype == '2';
        if (value.indexOf(`${controlName}-`) == 0 && _.includes([26, 27], type) && !isExternal && !relations.length) {
          const suffix = value.split(`${controlName}-`)[1];
          const matchList = userControls
            .concat(departmentControls)
            .find(item => item.text.toLowerCase() == suffix.toLowerCase());

          // 成员、部门匹配映射字段，默认为姓名 or 名称
          if (matchList) matchId = matchList.value;
          relations.push(cell);
        }

        // 关联字段默认匹配
        else if (value.indexOf(`${controlName}-`) == 0 && type == 29 && !relations.length) {
          relations.push(cell);
        }

        // 模糊匹配
        else if (value.trim() == controlName.trim()) exact.push(cell);
        else if (value.indexOf(controlName.trim()) > -1) like.push(cell);
      }
      const sameColumn = relations.length ? relations : exact.length ? exact : like;

      // 成员、部门默认匹配字段
      controlItem.matchId = matchId;

      // 设置表格默认值
      controlItem.columnNum = sameColumn.length > 0 ? sameColumn[0].columnNumber + 1 : '';
      controlItem.columnName = sameColumn.length > 0 ? sameColumn[0].value : '';

      // 关联匹配字段
      controlMapping.push({
        ColumnNum: sameColumn.length > 0 ? sameColumn[0].columnNumber + 1 : '',
        ColumnName: sameColumn.length > 0 ? sameColumn[0].value : '',
        ControlId: controlId,

        // 关联表字段
        sourceConfig: {
          // 关联表ID
          worksheetId: type === 29 ? dataSource : '',

          // 关联表字段映射ID
          controlId: '',
        },

        // 成员、部门字段默认匹配字段设为 姓名 or 名称
        matchId,

        // 字段类型
        type,
      });

      // 关联控件
      if (controlItem.type === 29 && !relateArr.find(obj => obj.appId === appId && obj.workSheetId === workSheetId)) {
        relateArr.push({ appId: controlItem.appId, workSheetId: dataSource });
      }
    }

    let fieldsList = data.template.controls
      .filter(
        item =>
          _.includes([2, 3, 4, 5, 7, 33], item.type) ||
          (item.type === 26 && item.enumDefault === 0 && (item.advancedSetting || {}).usertype !== '2'),
      )
      .map(item => {
        return {
          text: item.controlName,
          value: item.controlId,
        };
      });

    // 导入的表格中是否包含记录id列
    this.hasRecordId = _.find(selectRow.cells, rowItem => rowItem.value === recordObj.text) || {};
    fieldsList.push(recordObj);

    const requestData = {
      worksheetId,
      appId,
      accountId: md.global.Account.accountId,
    };

    const configData = await window.mdyAPI('', '', requestData, {
      ajaxOptions: {
        type: 'GET',
        url: `${md.global.Config.WorksheetDownUrl}/ExportExcel/GetConfig`,
      },
      customParseResponse: true,
    });

    // 获取先前保存的导入配置
    let configObjState = {
      errorSkip: configData.data.errorSkip,
      edited: configData.data.edited,
    };

    if (configData.resultCode === 1) {
      let { tigger, repeatConfig, configs } = configData.data;
      repeatConfig = repeatConfig ? repeatConfig : {};
      const currentRepeatItem = _.find(data.template.controls, item => item.controlId === repeatConfig.controlId) || {};

      configObjState = Object.assign({}, configObjState, {
        tigger,
        repeatRecord: repeatConfig.controlId ? true : false,
        showStar: repeatConfig.controlId || null,
      });

      controlMapping.forEach(item => {
        const editItem = _.find(configs, configItem => configItem.controlId === item.ControlId) || {};
        if (editItem.controlId) {
          // 关联表字段
          item.sourceConfig = editItem.sourceConfig;

          // 选项字段
          item.isAddOption = editItem.isAddOption;

          const control = data.template.controls.find(control => control.controlId == item.ControlId);
          if (control && control.type == 29) control.sourceConfig = editItem.sourceConfig.controlId;

          // 成员、部门字段默认匹配映射字段
          const { type, advancedSetting } = item;
          const isExternal = type === 26 && advancedSetting && advancedSetting.usertype == '2';
          if (_.includes([26, 27], type) && !isExternal && editItem.sourceConfig.controlId) {
            item.matchId = editItem.sourceConfig.controlId;
            if (control && _.includes([26, 27], control.type)) control.matchId = item.matchId;
          }
        }
      });

      configObjState.repeatConfig = {
        controlId: repeatConfig.controlId,
        controlName: _.get(currentRepeatItem, 'controlName'),
        handleEnum: repeatConfig.handleEnum,
      };
    }

    // 字段根据表中的顺序进行排序
    const worksheetControls = data.template.controls.sort((a, b) => {
      if (a.row === b.row) {
        return a.col - b.col;
      }
      return a.row - b.row;
    });

    await new Promise(resolve =>
      this.setState(
        {
          worksheetControls,
          controlMapping,
          workSheetProjectId: data.projectId,
          fieldsList,
          ...configObjState,
          loading: false,
        },
        resolve,
      ),
    );

    this.cacheSource = Object.assign({}, relateSource);

    // 获取关联表相关属性
    await Promise.all(
      _.uniqBy(relateArr, o => o.workSheetId).map(item => {
        return this.getWorksheetInfo(
          {
            appId: item.appId,
            worksheetId: item.workSheetId,
            relationWorksheetId: worksheetId,
          },
          true,
        );
      }),
    );
  }

  /**
   * 获取选中 excel字段以后预览呈现的字段值
   */
  getDropShowContent() {
    const { selectRow, importSheetInfo } = this.props;
    const selectRowNumber = selectRow.rowNumber;
    const sheetRows = importSheetInfo.rows;
    const getPreviewContent = (row, columnNumber) => {
      if (!row) return '';
      const previewContent = _.find(row.cells, cellItem => cellItem.columnNumber === columnNumber);
      if (previewContent && previewContent.value) {
        // 当前行的值
        return previewContent.value;
      } else if (row.rowNumber === 10) {
        // 返回空值
        return '';
      } else {
        // 如果当前行为空值，则去下一行寻找
        const nextRow = _.find(sheetRows, rowItem => rowItem.rowNumber === row.rowNumber + 1);
        return getPreviewContent(nextRow, columnNumber);
      }
    };

    // 表格列选择下拉框的值
    const dropDownData = [{ text: _l('请选择'), value: '', previewContent: '' }];
    for (const item of selectRow.cells || []) {
      const nextRow = _.find(sheetRows, rowItem => rowItem.rowNumber === selectRowNumber + 1);
      dropDownData.push({
        text: item.value || '',
        value: item.columnNumber + 1,
        previewContent: nextRow ? getPreviewContent(nextRow, item.columnNumber) : '',
      });
    }
    return dropDownData;
  }

  /**
   * 开始导入
   */
  beginImport = controlMappingFilter => {
    (async () => {
      const { isCharge } = this.props;
      const { tigger, repeatConfig, repeatRecord, worksheetControls, edited, controlMapping, relateSource } =
        this.state;
      let columnContent;
      let fieldContent;
      let repeatModeContent;
      let repeatContent;
      let requiredFiledNoSetArray = [];

      worksheetControls
        .filter(o => o.type !== 30 && o.required === '1')
        .map(o => {
          if (!controlMappingFilter.find(obj => obj.ControlId === o.controlId)) {
            requiredFiledNoSetArray.push(o.controlName);
          }
        });

      // 必填字段未设置
      if (requiredFiledNoSetArray.length) {
        throw _l('请设置“%0”字段的映射关系', requiredFiledNoSetArray.join('、'));
      }

      // 判断是否有匹配字段未选择 或 已删除
      for (const relateMapping of controlMappingFilter) {
        // 判断需要匹配的字段
        const { type, sourceConfig, matchId, ControlId } = relateMapping;
        const { controlName } = worksheetControls.find(item => item.controlId == ControlId) || {};
        // 获取关联表中的字段
        const relationControls = (relateSource[sourceConfig.worksheetId] || {}).controls || [];

        // 未选择匹配字段时的提示信息
        const message = controlName ? `“${controlName}”${_l('的匹配字段未设置')}` : _l('未选择匹配字段');
        if (
          type == 29 &&
          (!sourceConfig ||
            !sourceConfig.controlId ||
            (_.findIndex(relationControls, rel => rel.value === sourceConfig.controlId) === -1 &&
              sourceConfig.controlId !== recordObj.value))
        )
          throw !isCharge && edited ? _l('导入配置存在错误，匹配字段被删除，请联系管理员处理') : message;
        if (type == 26 && !matchId) throw message;
      }

      // 处理重复记录
      if (repeatRecord) {
        if (!repeatConfig.controlId) throw _l('请选择重复记录的依据字段');
        // 依据字段是否删除
        if (
          repeatConfig.controlId !== recordObj.value &&
          _.findIndex(worksheetControls, item => item.controlId === repeatConfig.controlId) === -1
        ) {
          throw !isCharge && edited
            ? _l('导入配置存在错误，依据字段被删除，请联系管理员处理')
            : _l('请设置重复记录的依据字段');
        }

        const currentRepeatItem = _.find(controlMapping, item => item.ControlId === repeatConfig.controlId) || {};
        if (repeatConfig.controlId !== recordObj.value && !_.get(currentRepeatItem, 'ColumnNum')) {
          throw _l('请设置“%0”字段的映射关系', repeatConfig.controlName);
        }

        if (
          repeatConfig.controlId !== recordObj.value &&
          currentRepeatItem.type === 26 &&
          currentRepeatItem.matchId !== 'userId'
        ) {
          throw _l('依据字段“%0“的匹配字段仅限人员ID', repeatConfig.controlName);
        }

        columnContent = `<span class="Gray Bold">【 ${filterXSS(
          repeatConfig.controlId === recordObj.value
            ? recordObj.text
            : _.get(
                _.find(controlMappingFilter, item => item.ControlId === repeatConfig.controlId) || {},
                'ColumnName',
              ),
        )} 】</span>`;

        fieldContent = `<span class="Gray Bold">【 ${filterXSS(
          repeatConfig.controlId === recordObj.value ? recordObj.value : repeatConfig.controlName,
        )} 】</span>`;

        repeatModeContent = `<span class="Gray Bold">${handleEnumText[repeatConfig.handleEnum]}</span>`;

        repeatContent = `<span>${
          repeatConfig.handleEnum === 3
            ? _l('不重复的数据不会作为新记录导入')
            : _l('将所有不重复的数据作为新记录导入工作表')
        }</span>`;
      }

      Dialog.confirm({
        title: _l('数据导入确认'),
        description: (
          <div className="Font14">
            <div
              className="mBottom10 Gray_75"
              dangerouslySetInnerHTML={{
                __html: tigger
                  ? _l('1.导入的数据%0触发工作流%1', '<span class="Gray Bold">', '</span>')
                  : _l('1.导入的数据%0不会触发工作流%1', '<span class="Gray Bold">', '</span>'),
              }}
            />
            {repeatRecord ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: _l(
                    '2.将Excel中%0列与工作表中%1字段逐行对比，%2识别到的重复数据，%3',
                    columnContent,
                    fieldContent,
                    repeatModeContent,
                    repeatContent,
                  ),
                }}
              />
            ) : (
              <div className="Gray_75">{_l('2.不识别重复数据，将Excel中所有数据都作为新记录导入工作表')}</div>
            )}
          </div>
        ),
        onOk: () => this.onImport(controlMappingFilter),
      });
    })().catch(message => alert(message, 3));
  };

  onImport = controlMapping => {
    const { filePath, fileId, fileKey, worksheetId, appId, selectRow, importSheetInfo, onSave, onCancel } = this.props;
    const { workSheetProjectId, repeatRecord, tigger, repeatConfig, userControls, departmentControls, errorSkip } =
      this.state;

    let cellConfigs = controlMapping.map(item => {
      if (_.find(userControls.concat(departmentControls), i => i.value === item.matchId)) {
        item.matchId = item.matchId === 'name' ? '' : item.matchId;
        item.sourceConfig.controlId = '';
      }
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

    const requestData = {
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
      errorSkip,
    };

    window.mdyAPI('', '', requestData, {
      ajaxOptions: { url: `${md.global.Config.WorksheetDownUrl}/ExportExcel/Import` },
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
          <div className="Gray_75 WordBreak">
            {_l(
              '将当前导入配置保存为默认导入方式供所有用户使用，其中字段映射关系不会保存，若Excel列名称和字段名称相同会自动映射对应',
            )}
          </div>
          <Checkbox
            className="mTop20 Gray"
            text={_l('不允许用户修改默认配置')}
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
          errorSkip,
        } = this.state;
        const configsFilter = [];

        for (const controlItem of worksheetControls || []) {
          //新增选项、关联记录匹配字段
          if (_.includes([9, 10, 11, 26, 27, 29], controlItem.type)) {
            const currentItem = _.find(controlMapping, item => item.ControlId === controlItem.controlId);
            if (!currentItem) continue;
            const { ControlId, isAddOption = false, sourceConfig, matchId = '' } = currentItem;
            configsFilter.push({
              controlId: ControlId,
              isAddOption,

              // 是否为成员、部门字段
              sourceConfig: _.includes([26, 27], controlItem.type)
                ? {
                    controlId: matchId,
                    workSheetId: '',
                  }
                : sourceConfig,
            });
          }
        }

        const requestData = {
          projectId: workSheetProjectId,
          worksheetId,
          repeatConfig: repeatRecord ? repeatConfig : null,
          tigger,
          edited,
          configs: configsFilter,
          accountId: md.global.Account.accountId,
          errorSkip,
        };

        window
          .mdyAPI('', '', requestData, {
            ajaxOptions: { url: `${md.global.Config.WorksheetDownUrl}/ExportExcel/SaveConfig` },
            customParseResponse: true,
          })
          .then(res => {
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
    const { repeatRecord, tigger, repeatConfig, fieldsList, controlMapping, edited, errorSkip, showErrorSkip } =
      this.state;
    const controlMappingFilter = controlMapping.filter(item => item.ColumnNum) || [];
    const skipSize = errorSkip.filter(item => item.value).length;
    const list = [
      { text: _l('跳过'), value: 1 },
      { text: _l('覆盖'), value: 2 },
      { text: _l('仅更新，不新增记录'), value: 3 },
    ];
    const ERROR_SKIP = {
      1: { text: _l('必填'), desc: _l('为空') },
      2: { text: _l('数值'), desc: _l('格式错误') },
      3: { text: _l('金额'), desc: _l('格式错误') },
      4: { text: _l('邮箱'), desc: _l('格式错误') },
      5: { text: _l('地区'), desc: _l('未匹配到') },
      6: { text: _l('选项'), desc: _l('未匹配到') },
      7: { text: _l('人员'), desc: _l('未匹配或匹配到多个') },
      8: { text: _l('关联记录'), desc: _l('未匹配或匹配到多个') },
    };
    return (
      <div className="flexRow mTop16">
        <div>
          <div className="flexRow minHeight36" style={{ alignItems: 'center' }}>
            {!repeatRecord && !isCharge && edited ? null : (
              <Checkbox
                text={_l('识别重复记录')}
                checked={repeatRecord}
                disabled={!isCharge && edited}
                onClick={checked => {
                  if (fieldsList.length) {
                    this.setState({ repeatRecord: !checked, showStar: !checked ? repeatConfig.controlId : null });
                  } else {
                    alert(_l('不存在有效的依据字段'), 2);
                  }
                }}
              />
            )}

            {repeatRecord && (
              <Fragment>
                <Dropdown
                  className="mLeft8 repeatConfigDropdown"
                  data={list}
                  value={repeatConfig.handleEnum}
                  disabled={!isCharge && edited}
                  border
                  onChange={handleEnum =>
                    this.setState({ repeatConfig: Object.assign({}, repeatConfig, { handleEnum }) })
                  }
                />
                <div className="mLeft8 Gray">{_l('依据字段')}</div>
                <Dropdown
                  className="mLeft8 repeatConfigDropdown"
                  data={fieldsList}
                  disabled={!isCharge && edited}
                  placeholder={_l('请选择')}
                  value={repeatConfig.controlId}
                  renderTitle={
                    !repeatConfig.controlId
                      ? () => <span className="Gray_9e">{_l('请选择')}</span>
                      : repeatConfig.controlId && !_.find(fieldsList, o => o.value === repeatConfig.controlId)
                        ? () => <span className="repeatConfigError">{_l('已删除')}</span>
                        : () => <span>{_.find(fieldsList, o => o.value === repeatConfig.controlId).text}</span>
                  }
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
                  autoCloseDelay={0}
                  text={
                    <span>
                      {_l(
                        '选择关联表的一个字段作为映射的匹配字段，支持的字段类型包括：文本框、电话号码、邮件地址、证件、自动编号、记录ID、成员单选',
                      )}
                    </span>
                  }
                >
                  <i className="icon-help Gray_9e Font16 mLeft8 LineHeight36" />
                </Tooltip>
              </Fragment>
            )}
          </div>
          <div className="flexRow minHeight36" style={{ alignItems: 'center' }}>
            {!skipSize && !isCharge && edited ? null : (
              <Fragment>
                <Checkbox
                  text={_l('跳过错误数据')}
                  disabled={!isCharge && edited}
                  checked={!!skipSize}
                  onClick={checked =>
                    this.setState({
                      errorSkip: errorSkip.map(item => {
                        item.value = !checked;

                        return item;
                      }),
                    })
                  }
                />
                <Tooltip
                  autoCloseDelay={0}
                  text={
                    <span>
                      {_l('未勾选时，对于错误的数据仅跳过错误字段，其他字段仍然导入。勾选后将跳过整行数据。')}
                    </span>
                  }
                >
                  <i className="icon-help Gray_9e Font16 mLeft5" />
                </Tooltip>
                {!!skipSize && (
                  <div
                    className="mLeft5 relative ThemeColor3 ThemeHoverColor2 pointer"
                    onClick={() => (isCharge || !edited) && this.setState({ showErrorSkip: true })}
                  >
                    {skipSize === errorSkip.length ? _l('全部') : `(${skipSize}/${errorSkip.length})`}
                    {showErrorSkip && (
                      <Menu className="errorSkipDialog" onClickAway={() => this.setState({ showErrorSkip: false })}>
                        <div className="Font14 bold">{_l('设置')}</div>
                        <div className="mTop5">{_l('当数据中存在以下所选错误时，将放弃此行数据导入')}</div>
                        <div className="flexRow mTop10" style={{ alignItems: 'center' }}>
                          <Checkbox
                            text={_l('全选') + `（${skipSize}/${errorSkip.length}）`}
                            checked={!!skipSize}
                            clearselected={!!skipSize && skipSize !== errorSkip.length}
                            onClick={checked =>
                              this.setState({
                                errorSkip: errorSkip.map(item => {
                                  item.value = !checked;

                                  return item;
                                }),
                              })
                            }
                          />
                        </div>
                        {errorSkip.map(o => (
                          <div key={o.key} className="flexRow mTop10" style={{ alignItems: 'center' }}>
                            <Checkbox
                              text={ERROR_SKIP[o.key].text}
                              checked={o.value}
                              onClick={checked =>
                                this.setState({
                                  errorSkip: errorSkip.map(item => {
                                    if (item.key === o.key) {
                                      item.value = !checked;
                                    }

                                    return item;
                                  }),
                                })
                              }
                            />
                            <div className="mLeft20 Gray_9e">{ERROR_SKIP[o.key].desc}</div>
                          </div>
                        ))}
                      </Menu>
                    )}
                  </div>
                )}
              </Fragment>
            )}
            {!tigger && !isCharge && edited ? null : (
              <Checkbox
                className="mLeft20"
                text={_l('触发工作流')}
                disabled={!isCharge && edited}
                checked={tigger}
                onClick={checked => this.setState({ tigger: !checked })}
              />
            )}

            {isCharge && (
              <span
                className="Hand ThemeColor3 Hover_49 mLeft20"
                style={{ height: 18 }}
                onClick={() => this.saveConfig()}
              >
                {_l('保存导入配置')}
              </span>
            )}
          </div>
        </div>

        <div className="flex" />
        <div className="flexColumn">
          <div className="flex" />
          <div className="flexRow">
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
      </div>
    );
  }

  /**
   * 渲染成员、部门、关联表字段
   */
  renderRelateWorksheet(controlItem, isHiddenConfig) {
    const { controlMapping, relateSource, userControls, departmentControls, showStar } = this.state;
    const selectItem = controlMapping.find(item => item.ControlId === controlItem.controlId);
    const worksheetId = selectItem.sourceConfig.worksheetId;

    // 成员、部门字段
    if (_.includes([26, 27], controlItem.type)) {
      const controls = controlItem.type === 26 ? userControls : departmentControls;

      return (
        <div className="flexRow relateBox">
          <Icon className="Font16 Gray_9e" icon={getIconByType(controlItem.type)} />
          <div className="mLeft10 mRight10 flex ellipsis flexRow alignItemsCenter">
            {controlItem.controlName}
            {(showStar === controlItem.controlId || controlItem.required) && <span className="mLeft3 star">*</span>}
          </div>

          {/** 提示文字 */}
          <Tooltip
            autoCloseDelay={0}
            text={
              <span>
                {controlItem.type === 26
                  ? _l('支持的字段类型包括：姓名、手机号、邮箱、工号、人员ID')
                  : _l('支持的字段类型包括：名称、部门系统ID')}
              </span>
            }
          >
            <i className="icon-help Gray_9e Font16" />
          </Tooltip>
          <div className="Gray_9e mLeft5">{_l('匹配：')}</div>

          {/** 匹配字段选择下拉框 */}
          <Dropdown
            disabled={isHiddenConfig}
            menuStyle={{ width: 180 }}
            data={controls}
            value={controlItem.matchId || null}
            isAppendToBody
            onChange={controlId => {
              // 修改映射字段
              const newControlMapping = [...controlMapping];
              const item = newControlMapping.find(item => item.ControlId === controlItem.controlId);
              if (item) item.matchId = controlId;
              controlItem.matchId = controlId;
              this.setState({ controlMapping: newControlMapping });
            }}
          />
        </div>
      );
    }

    // 关联表
    else if (controlItem.type == 29 && relateSource[worksheetId]) {
      const { controls } = relateSource[worksheetId];

      let currentItem = selectItem.sourceConfig.controlId;
      const defaultItem = controls.find(item => item.attribute) || {};
      const currentSourceConfig =
        (_.find(controlMapping, o => o.ControlId === controlItem.controlId) || {}).sourceConfig || {};

      if (!currentItem && defaultItem.value) currentItem = defaultItem.value;
      else if (currentItem !== '') currentItem = null;
      return (
        <div className="flexRow relateBox">
          <Icon className="Font16 Gray_9e" icon={getIconByType(controlItem.type)} />
          <div className="mLeft10 mRight10 flex ellipsis flexRow alignItemsCenter">
            {controlItem.controlName}
            {(showStar === controlItem.controlId || controlItem.required) && <span className="mLeft3 star">*</span>}
          </div>

          {/** 提示文字 */}
          <Tooltip
            autoCloseDelay={0}
            text={
              <span>
                {_l(
                  '选择关联表的一个字段作为映射的匹配字段，支持的字段类型包括：文本框、电话号码、邮件地址、证件、文本拼接、自动编号、记录ID',
                )}
              </span>
            }
          >
            <i className="icon-help Gray_9e Font16" />
          </Tooltip>
          <div className="Gray_9e mLeft5">{_l('匹配：')}</div>

          {/** 匹配字段选择下拉框 */}
          <Dropdown
            disabled={isHiddenConfig}
            menuStyle={{ width: 180 }}
            data={controls}
            value={currentSourceConfig.controlId}
            renderTitle={
              !currentSourceConfig.controlId
                ? () => <span className="Gray_9e">{_l('请选择')}</span>
                : currentSourceConfig.controlId && !_.find(controls, o => o.value === currentSourceConfig.controlId)
                  ? () => <span className="repeatConfigError">{_l('已删除')}</span>
                  : () => <span>{_.find(controls, o => o.value === currentSourceConfig.controlId).text}</span>
            }
            isAppendToBody
            onChange={controlId => {
              // 修改映射字段
              const newControlMapping = [...controlMapping];
              const item = newControlMapping.find(item => item.ControlId === controlItem.controlId);
              if (item) item.sourceConfig.controlId = controlId;
              this.setState({ controlMapping: newControlMapping });
            }}
          />
        </div>
      );
    } else return null;
  }

  render() {
    const { onCancel, isCharge } = this.props;
    const {
      dropDownData,
      controlMapping,
      worksheetControls,
      loading,
      edited,
      showStar,
      userControls,
      departmentControls,
      relateSource,
    } = this.state;
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
                    const { type, advancedSetting } = controlItem;

                    // 是否为关联记录多条，列表展示
                    const isRealtionList = type == 29 && advancedSetting && advancedSetting.showtype == '2';

                    // 不支持映射的字段
                    const notSupport = !_.includes(allowConfigControlTypes, type) || isRealtionList;

                    // 外部成员字段
                    const isExternal = type == 26 && advancedSetting && advancedSetting.usertype == '2';

                    // 是否为关联字段 / 内部成员字段 / 部门字段
                    const isMapping = (type == 29 || (type == 26 && !isExternal) || type === 27) && !notSupport;
                    return (
                      <div className="flexRow mBottom6" key={index}>
                        {/** 左侧 */}
                        <div className="excelControls flex">
                          {!notSupport && (
                            <DropDownItem
                              key={index}
                              listWidth={390}
                              dropDownData={dropDownData}
                              value={_.find(controlMapping, item => item.ControlId === controlItem.controlId).ColumnNum}
                              onChange={value => {
                                // 字段类别
                                const { type, advancedSetting } = controlItem;

                                // 选择的选项
                                const dataItem = _.find(dropDownData, item => item.value === value) || {};
                                let newControlMapping = controlMapping.concat();

                                // 设置选项
                                const control = newControlMapping.find(item => item.ControlId == controlItem.controlId);
                                control.ColumnNum = value;
                                control.ColumnName = dataItem.text || '';

                                // 解析选项名称
                                const dataItemArr = dataItem.text.split('-');
                                const dataItemName = dataItemArr[dataItemArr.length - 1].toLowerCase();

                                // 匹配人员、部门字段
                                const isExternal = type == 26 && advancedSetting && advancedSetting.usertype == '2';
                                if (_.includes([26, 27], type) && !isExternal && !isHiddenConfig) {
                                  const userControl = userControls
                                    .concat(departmentControls)
                                    .find(item => item.text.toLowerCase() == dataItemName);
                                  if (userControl) controlItem.matchId = userControl.value;
                                  // 默认匹配为成员姓名、部门名称
                                  else controlItem.matchId = 'name';

                                  control.matchId = controlItem.matchId;
                                }

                                // 匹配关联表字段
                                if (
                                  type == 29 &&
                                  control.sourceConfig &&
                                  control.sourceConfig.worksheetId &&
                                  !isHiddenConfig
                                ) {
                                  const relationControls =
                                    (relateSource[control.sourceConfig.worksheetId] || {}).controls || [];
                                  const relationControl = relationControls.find(
                                    item => item.text.toLowerCase() == dataItemName,
                                  );

                                  // 关联表中的标题字段
                                  const title = relationControls.find(item => item.attribute == 1);
                                  let sourceControlId = '';

                                  // 模糊匹配字段
                                  if (relationControl) sourceControlId = relationControl.value;
                                  // 默认匹配关联表标题字段
                                  else if (title) sourceControlId = title.value;
                                  // 若标题字段无法匹配，则默认匹配字段为未选择
                                  else sourceControlId = '';

                                  control.sourceConfig.controlId = sourceControlId;
                                }
                                this.setState({ controlMapping: newControlMapping });
                              }}
                            />
                          )}
                        </div>

                        {/** 映射箭头图标 */}
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

                        {/** 右侧 */}
                        <div className="sheetControls flex">
                          {/** 普通字段 */}
                          {!isMapping ? (
                            <div className="controlItem flexRow">
                              <Icon className="Font16 Gray_9e" icon={getIconByType(controlItem.type)} />
                              <span className="mLeft10 ellipsis flex flexRow alignItemsCenter">
                                {controlItem.controlName}
                                {(showStar === controlItem.controlId ||
                                  (controlItem.type !== 30 && controlItem.required === '1')) && (
                                  <span className="mLeft3 star">*</span>
                                )}
                              </span>

                              {/** 单选框 */}
                              {[9, 10, 11].includes(controlItem.type) && !isHiddenConfig && (
                                <Fragment>
                                  <Tooltip
                                    autoCloseDelay={0}
                                    text={_l('勾选后，当匹配不到已有选项时会添加为新的选项。未勾选时，则导入为空')}
                                  >
                                    <i className="icon-help Gray_9e Font16" />
                                  </Tooltip>
                                  <span className="Gray_75 mRight8 mLeft5">{_l('添加选项')}</span>
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

                              {/** 不支持映射的字段 */}
                              {notSupport && <span className="Gray_9e">{_l('不支持')}</span>}

                              {/** 外部成员字段提示 */}
                              {isExternal && <span className="Gray_9e">{_l('外部用户暂只支持通过姓名匹配')}</span>}
                            </div>
                          ) : (
                            // 关联字段
                            this.renderRelateWorksheet(controlItem, isHiddenConfig)
                          )}
                        </div>
                      </div>
                    );
                  })}
                </Fragment>
              )}
            </ScrollView>
          </div>
          {!loading && this.renderFooter()}
        </div>
      </Dialog>
    );
  }
}
