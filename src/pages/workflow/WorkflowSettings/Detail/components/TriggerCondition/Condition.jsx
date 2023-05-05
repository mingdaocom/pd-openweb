import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, CityPicker, Icon } from 'ming-ui';
import { DateTime } from 'ming-ui/components/NewDateTimePicker';
import dialogSelectUser from 'src/components/dialogSelectUser/dialogSelectUser';
import DialogSelectDept from 'src/components/dialogSelectDept';
import cx from 'classnames';
import TagInput from '../TagInput';
import { CONTROLS_NAME, CONDITION_TYPE, DATE_LIST, FORMAT_TEXT } from '../../../enum';
import { getConditionList, getConditionNumber, getFilterText } from '../../../utils';
import ActionFields from '../ActionFields';
import Tag from '../Tag';
import SelectOtherFields from '../SelectOtherFields';
import { Tooltip, TimePicker } from 'antd';
import { selectOrgRole } from 'src/components/DialogSelectOrgRole';
import moment from 'moment';

export default class TriggerCondition extends Component {
  static propTypes = {
    processId: PropTypes.string,
    selectNodeId: PropTypes.string,
    sourceAppId: PropTypes.string,
    isIntegration: PropTypes.bool,
    Header: PropTypes.func,
    isNodeHeader: PropTypes.bool,
    openNewFilter: PropTypes.bool,
    controls: PropTypes.array,
    data: PropTypes.array,
    updateSource: PropTypes.func,
    projectId: PropTypes.string,
    singleCondition: PropTypes.bool,
    isLast: PropTypes.bool,
    addConditions: PropTypes.func,
  };

  static defaultProps = {
    processId: '',
    selectNodeId: '',
    sourceAppId: '',
    Header: () => null,
    isNodeHeader: false,
    openNewFilter: false,
    controls: [],
    data: [],
    updateSource: () => {},
    projectId: '',
    singleCondition: false,
    isLast: false,
    addConditions: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      showControlsIndex: '',
      moreFieldsIndex: '',
      controlsData: this.getFieldData(props.controls),
    };
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (!_.isEqual(nextProps.controls, this.props.controls)) {
      this.setState({ controlsData: this.getFieldData(nextProps.controls) });
    }
  }

  cacheCityPickerData = [];

  /**
   * 获取字段
   */
  getFieldData(controls) {
    const { isNodeHeader } = this.props;
    let data;

    if (isNodeHeader) {
      data = controls.map(obj => {
        return {
          text: obj.nodeName,
          id: obj.nodeId,
          nodeTypeId: obj.nodeTypeId,
          appName: obj.appName,
          appType: obj.appType,
          appTypeName: obj.appTypeName,
          actionId: obj.actionId,
          isSourceApp: obj.isSourceApp,
          items: obj.controls.map(o => {
            return {
              type: o.type,
              value: o.controlId,
              field: CONTROLS_NAME[o.type],
              text: o.controlName,
            };
          }),
        };
      });
    } else {
      data = controls.map(item => {
        return {
          text: this.renderTitle(item),
          value: item.controlId,
          searchText: item.controlName,
        };
      });
    }

    return data;
  }

  /**
   * dropdown title
   */
  renderTitle(item) {
    return (
      <Fragment>
        <span className="Gray_9e mRight5">[{CONTROLS_NAME[item.type]}]</span>
        <Tooltip title={item.controlName ? null : `ID：${item.controlId}`}>
          <span style={{ color: item.controlName ? '#333' : '#f44336' }}>{item.controlName || _l('字段已删除')}</span>
        </Tooltip>
      </Fragment>
    );
  }

  /**
   * 渲染单个条件
   */
  renderItem(item, i, j, hasOr, hasAnd) {
    const { singleCondition, controls, isNodeHeader, openNewFilter, isLast } = this.props;
    let controlNumber;
    let conditionData = [];
    let conditionIndex;
    let single;
    const switchConditionId = id => {
      switch (id) {
        case '15':
          return '37';
        case '16':
          return '38';
        case '17':
          return '41';
        case '18':
          return '39';
      }
    };

    if (isNodeHeader) {
      controls.forEach(obj => {
        if (obj.nodeId === item.nodeId) {
          single = _.find(obj.controls, o => o.controlId === item.filedId);
        }
      });
    } else {
      single = _.find(controls, o => o.controlId === item.filedId);
    }

    const showType = _.get(single || {}, 'advancedSetting.showtype');
    const unit = _.get(single || {}, 'unit');

    if (item.filedId) {
      conditionData = getConditionList(item.filedTypeId, item.enumDefault).ids.map((id, index) => {
        if (item.conditionId === id || switchConditionId(item.conditionId) === id) {
          controlNumber = getConditionNumber(id);
        }

        if (
          (_.includes([15, 16], item.filedTypeId) || (item.filedTypeId === 38 && item.enumDefault === 2)) &&
          ((item.conditionId === '15' && id === '37') ||
            (item.conditionId === '16' && id === '38') ||
            (item.conditionId === '17' && id === '41') ||
            (item.conditionId === '18' && id === '39'))
        ) {
          conditionIndex = index;
        }

        return {
          text: getFilterText(single || {}, id),
          value: id,
        };
      });
    }

    // 处理老的日期条件
    if (typeof conditionIndex === 'number') {
      conditionData[conditionIndex].text = conditionData[conditionIndex].text + `（新版比较到时间）`;
      conditionData.splice(conditionIndex, 0, {
        text: CONDITION_TYPE[item.conditionId] + `（旧版比较到日期）`,
        value: item.conditionId,
        disabled: true,
      });
    }

    return (
      <div key={i + '-' + j} className="mTop15 triggerConditionItem">
        {this.renderControls(item, i, j)}

        <div className="mTop10">
          <Dropdown
            className={cx('flowDropdown fixedHeight Width200')}
            isAppendToBody
            menuClass="flowTriggerDropdown"
            data={conditionData}
            value={item.conditionId || undefined}
            border
            placeholder={_l('请选择')}
            disabled={!item.filedId}
            renderTitle={() =>
              item.conditionId && (
                <span>
                  {getFilterText(single || {}, item.conditionId) + (typeof conditionIndex === 'number' ? '*' : '')}
                </span>
              )
            }
            onChange={conditionId => this.switchCondition(conditionId, i, j)}
          />
        </div>
        <div className="mTop10 relative flexRow">
          {this.renderItemValue(item, controlNumber, i, j, showType, unit)}
          {(item.conditionId === '1' ||
            item.conditionId === '3' ||
            item.conditionId === '5' ||
            item.conditionId === '6') && (
            <span
              className="triggerTipIcon ThemeColor3 Block tip-bottom-left"
              data-tip={_l('当选择多个值，则表示是其中任何一个值时，即符合条件')}
            >
              <i className="icon-info Font16" />
            </span>
          )}
          {(item.conditionId === '2' || item.conditionId === '4') && (
            <span
              className="triggerTipIcon ThemeColor3 Block tip-bottom-left"
              data-tip={_l('当选择多个值，则表示不是其中所有值时，才符合条件')}
            >
              <i className="icon-info Font16" />
            </span>
          )}
        </div>
        {hasAnd ? (
          <div className="triggerConditionBtn mTop15">
            {singleCondition ? (
              <Fragment>
                {i === 0 && this.props.data.length === 1 && (
                  <span className="ThemeBorderColor3" onClick={() => this.addAndCondition(i)}>
                    + {_l('且')}
                  </span>
                )}
                {j === 0 && i === this.props.data.length - 1 && (
                  <span className="ThemeBorderColor3" onClick={this.addOrCondition}>
                    + {_l('或')}
                  </span>
                )}
              </Fragment>
            ) : (
              <Fragment>
                <span className="ThemeBorderColor3" onClick={() => this.addAndCondition(i)}>
                  + {_l('且')}
                </span>
                {hasOr && (isLast || !openNewFilter) && (
                  <span className="ThemeBorderColor3" onClick={this.addOrCondition}>
                    + {_l('或')}
                  </span>
                )}
              </Fragment>
            )}
          </div>
        ) : (
          <div className="Font13 Gray_9e mTop15">{_l('且')}</div>
        )}

        {hasAnd && !hasOr && !openNewFilter && (
          <div className="Font14 triggerConditionSplit mTop15">
            <span>{_l('或')}</span>
          </div>
        )}
      </div>
    );
  }

  /**
   * 渲染控件选择器
   */
  renderControls(item, i, j) {
    const { isNodeHeader } = this.props;
    const { showControlsIndex, controlsData } = this.state;

    return (
      <div className="relative">
        {isNodeHeader ? (
          <div
            className="ming Dropdown pointer flowDropdown flowDropdownBorder"
            onClick={event => {
              if ($(event.target).closest('.ant-tooltip').length) return;

              this.setState({ showControlsIndex: `${i}-${j}` });
            }}
          >
            <div className="Dropdown--input Dropdown--border">
              <span className="value">
                {item.filedId ? (
                  <Tag
                    flowNodeType={item.nodeType}
                    appType={item.appType}
                    actionId={item.actionId}
                    nodeName={item.nodeName}
                    controlId={item.filedId}
                    controlName={item.filedValue}
                  />
                ) : (
                  <div className="Gray_9e">{_l('请选择')}</div>
                )}
              </span>
              <i className="ming Icon icon-default icon icon-arrow-down-border mLeft8 Gray_9e" />
            </div>
          </div>
        ) : (
          <Dropdown
            className="flowDropdown"
            isAppendToBody
            data={controlsData}
            value={item.filedId}
            border
            openSearch
            placeholder={_l('请选择')}
            disabledClickElement=".ant-tooltip"
            renderTitle={() =>
              item.filedId &&
              this.renderTitle({ type: item.filedTypeId, controlName: item.filedValue, controlId: item.filedId })
            }
            onChange={filedId => this.switchField({ i, j, filedId })}
          />
        )}
        <i className="icon-delete2 Font16 ThemeColor3 triggerTipIcon" onClick={() => this.deleteCondition(i, j)} />

        {showControlsIndex === `${i}-${j}` && (
          <ActionFields
            className="actionFields"
            noItemTips={_l('没有可用的字段')}
            condition={controlsData}
            openSearch
            handleFieldClick={({ fieldValueId, nodeId, nodeName, nodeTypeId, appType, actionId }) => {
              this.switchField({
                i,
                j,
                filedId: fieldValueId,
                nodeId,
                nodeName,
                nodeType: nodeTypeId,
                appType,
                actionId,
              });
              this.setState({ showControlsIndex: '' });
            }}
            onClose={() => this.setState({ showControlsIndex: '' })}
          />
        )}
      </div>
    );
  }

  /**
   * 切换字段
   */
  switchField = ({ filedId, i, j, nodeId = '', nodeName = '', nodeType = -1, appType = -1, actionId = '' }) => {
    const data = _.cloneDeep(this.props.data);
    const { controls, updateSource, isNodeHeader, selectNodeId } = this.props;
    let single;

    if (isNodeHeader) {
      controls.forEach(obj => {
        if (obj.nodeId === nodeId) {
          single = _.find(obj.controls, o => o.controlId === filedId);
        }
      });
    } else {
      single = _.find(controls, item => item.controlId === filedId);
    }

    data[i][j] = {
      filedId,
      filedTypeId: single.type,
      filedValue: single.controlName,
      nodeId: nodeId || selectNodeId,
      nodeName,
      nodeType,
      appType,
      actionId,
      enumDefault: single.enumDefault,
      conditionId: (getConditionList(single.type, single.enumDefault) || {}).defaultConditionId,
      conditionValues: [],
    };

    updateSource(data);
  };

  /**
   * 删除条件
   */
  deleteCondition = (i, j) => {
    const data = _.cloneDeep(this.props.data);
    const { updateSource } = this.props;

    data[i].splice(j, 1);

    if (!data[i].length) {
      data.splice(i, 1);
    }

    updateSource(data);
  };

  /**
   * 渲染单个条件的值
   */
  renderItemValue(item, controlNumber = 0, i, j, showType, unit) {
    const { isNodeHeader, projectId } = this.props;

    if (_.isEmpty(item)) {
      return <div className="flex triggerConditionNum triggerConditionDisabled" />;
    }

    if (controlNumber === 0) return null;

    const { filedId, filedTypeId, conditionValues, enumDefault, conditionId } = item;

    // 文本 || 手机号码 || 电话号码 || 邮箱 || 证件  || 关联单条 || 文本组合 || 自动编号 || api查询
    if (
      filedTypeId === 1 ||
      filedTypeId === 2 ||
      filedTypeId === 3 ||
      filedTypeId === 4 ||
      filedTypeId === 5 ||
      filedTypeId === 7 ||
      filedTypeId === 29 ||
      filedTypeId === 32 ||
      filedTypeId === 33 ||
      filedTypeId === 50
    ) {
      return (
        <div className="flex relative flexRow">
          {conditionValues[0] && conditionValues[0].controlId ? (
            this.renderSelectFieldsValue(conditionValues[0], i, j)
          ) : (
            <TagInput
              disable={_.includes(['9', '10', '33', '34', '43'], item.conditionId) && filedTypeId === 29}
              className="flex clearBorderRadius"
              tags={conditionValues.map(obj => obj.value)}
              createTag={val => this.updateConditionValue({ value: val, i, j })}
              delTag={val => this.updateConditionValue({ value: val, i, j })}
            />
          )}

          {this.renderOtherFields(item, i, j)}
        </div>
      );
    }

    // 数字 || 金额 || 公式 || 日期公式时长
    if (filedTypeId === 6 || filedTypeId === 8 || filedTypeId === 31 || (filedTypeId === 38 && enumDefault === 1)) {
      return (
        <div className="flex">
          <div className="flexRow relative">
            {conditionValues[0] && conditionValues[0].controlId ? (
              this.renderSelectFieldsValue(conditionValues[0], i, j)
            ) : (
              <input
                key={filedId + conditionId}
                type="text"
                className="triggerConditionNum flex ThemeBorderColor3 clearBorderRadius"
                defaultValue={conditionValues[0] ? conditionValues[0].value : ''}
                onKeyUp={evt => this.clearNoNum(evt)}
                onPaste={evt => this.clearNoNum(evt)}
                onBlur={evt => this.clearNoNum(evt, true, i, j)}
              />
            )}
            {this.renderOtherFields(item, i, j)}
            {controlNumber > 1 && <div className="Font13 mLeft10 Gray_9e LineHeight36">{_l('至')}</div>}
          </div>

          {controlNumber > 1 && (
            <div className="mTop10 flexRow relative">
              {conditionValues[1] && conditionValues[1].controlId ? (
                this.renderSelectFieldsValue(conditionValues[1], i, j, true)
              ) : (
                <input
                  key={filedId + conditionId}
                  type="text"
                  className="triggerConditionNum flex ThemeBorderColor3 clearBorderRadius"
                  defaultValue={conditionValues[1] ? conditionValues[1].value : ''}
                  onKeyUp={evt => this.clearNoNum(evt)}
                  onPaste={evt => this.clearNoNum(evt)}
                  onBlur={evt => this.clearNoNum(evt, true, i, j, true)}
                />
              )}
              {this.renderOtherFields(item, i, j, true)}
            </div>
          )}
        </div>
      );
    }

    // 单选 || 多选 || 下拉 || 等级 || 日期公式加减
    if (
      filedTypeId === 9 ||
      filedTypeId === 10 ||
      filedTypeId === 11 ||
      filedTypeId === 28 ||
      (filedTypeId === 38 && enumDefault === 2)
    ) {
      const { controls } = this.props;
      let options;
      let data;

      if (!conditionValues[0] || !conditionValues[0].controlId) {
        if (isNodeHeader) {
          controls.forEach(obj => {
            if (obj.nodeId === item.nodeId) {
              options = (_.find(obj.controls, o => o.controlId === filedId) || {}).options;
            }
          });
        } else {
          options = (_.find(controls, obj => obj.controlId === filedId) || {}).options;
        }

        options = options || [];
        data = options.map(opts => {
          return {
            text: opts.value,
            value: opts.key,
            disabled: !!_.find(conditionValues, obj => obj.value.key === opts.key),
          };
        });
      }

      return (
        <div className="flex relative flexRow">
          {conditionValues[0] && conditionValues[0].controlId ? (
            this.renderSelectFieldsValue(conditionValues[0], i, j)
          ) : (
            <Dropdown
              className="flowDropdown flex flowDropdownTags clearBorderRadius"
              isAppendToBody
              data={data}
              value=""
              placeholder={_l('请选择')}
              border
              onChange={key =>
                this.updateConditionValue({
                  value: _.find(options, opts => opts.key === key),
                  i,
                  j,
                  isSingle: _.includes(['9', '10'], item.conditionId) && _.includes([9, 11], filedTypeId),
                })
              }
              renderTitle={() => this.renderDropdownTagList(conditionValues, i, j)}
            />
          )}

          {this.renderOtherFields(item, i, j)}
        </div>
      );
    }

    // 日期 || 日期时间
    if (filedTypeId === 15 || filedTypeId === 16) {
      const mode = { 3: 'date', 4: 'month', 5: 'year' };
      const dateList = [];
      const showTimePicker = filedTypeId === 16 && !_.includes(['9', '10'], item.conditionId);
      const timeMode =
        _.includes(['ctime', 'utime'], filedId) || showType === '6' ? 'second' : showType === '2' ? 'hour' : 'minute';
      let formatString = timeMode === 'second' ? 'YYYY-MM-DD HH:mm:ss' : FORMAT_TEXT[showType] || 'YYYY-MM-DD HH:mm:ss';

      // 不显示时间的时候去除 时分秒
      if (!showTimePicker) {
        formatString = formatString.split(' ')[0];
      }

      DATE_LIST.forEach((item, i) => {
        if (i % 3 === 0) {
          dateList.push([item]);
        } else {
          dateList[dateList.length - 1].push(item);
        }
      });

      // 显示类型是年月
      if (showType === '4') {
        _.remove(dateList, (o, index) => _.includes([0, 1], index));
      }

      // 显示类型是年
      if (showType === '5') {
        _.remove(dateList, (o, index) => _.includes([0, 1, 2, 3], index));
      }

      if (_.includes(['9', '10', '17', '18', '39', '40', '41', '42'], item.conditionId)) {
        return (
          <div className="flex">
            <div className="flexRow relative">
              {conditionValues[0] && conditionValues[0].controlId ? (
                this.renderSelectFieldsValue(conditionValues[0], i, j)
              ) : (
                <Dropdown
                  className="flowDropdown flex clearBorderRadius"
                  data={dateList}
                  value={conditionValues[0] && conditionValues[0].type ? conditionValues[0].type : undefined}
                  border
                  renderTitle={
                    !conditionValues[0] || !conditionValues[0].type
                      ? () => <span className="Gray_9e">{_l('请选择')}</span>
                      : () => <span>{DATE_LIST.find(o => o.value === conditionValues[0].type).text}</span>
                  }
                  onChange={type =>
                    this.updateConditionDateValue({
                      type,
                      value: type === 20 ? '' : DATE_LIST.find(obj => obj.value === type).text,
                      i,
                      j,
                    })
                  }
                />
              )}
              {this.renderOtherFields(item, i, j)}
            </div>

            {conditionValues[0] && conditionValues[0].type === 20 && (
              <div className="mTop10 triggerConditionNum triggerConditionDate ThemeBorderColor3">
                <DateTime
                  selectedValue={
                    conditionValues[0] && conditionValues[0].value ? moment(conditionValues[0].value) : null
                  }
                  mode={mode[showType]}
                  timePicker={showTimePicker}
                  timeMode={timeMode}
                  allowClear={false}
                  onOk={e => this.updateConditionDateValue({ value: e.format(formatString), i, j })}
                >
                  {conditionValues[0] && conditionValues[0].value
                    ? moment(conditionValues[0].value).format(formatString)
                    : ''}
                  <i className="icon-bellSchedule Font14 Gray_9e" />
                </DateTime>
              </div>
            )}
          </div>
        );
      }

      return (
        <div className="flex">
          <div className="flexRow relative">
            {conditionValues[0] && conditionValues[0].controlId ? (
              this.renderSelectFieldsValue(conditionValues[0], i, j)
            ) : (
              <div className="flex triggerConditionNum triggerConditionDate ThemeBorderColor3 clearBorderRadius">
                <DateTime
                  selectedValue={
                    conditionValues[0] && conditionValues[0].value ? moment(conditionValues[0].value) : null
                  }
                  mode={mode[showType]}
                  timePicker={showTimePicker}
                  timeMode={timeMode}
                  allowClear={false}
                  onOk={e => this.updateConditionDateValue({ value: e.format(formatString), i, j })}
                >
                  {conditionValues[0] && conditionValues[0].value
                    ? moment(conditionValues[0].value).format(formatString)
                    : ''}
                  <i className="icon-bellSchedule Font14 Gray_9e" />
                </DateTime>
              </div>
            )}
            {this.renderOtherFields(item, i, j)}
            {controlNumber > 1 && <div className="Font13 mLeft10 Gray_9e LineHeight36">{_l('至')}</div>}
          </div>

          {controlNumber > 1 && (
            <div className="mTop10 flexRow relative">
              {conditionValues[1] && conditionValues[1].controlId ? (
                this.renderSelectFieldsValue(conditionValues[1], i, j, true)
              ) : (
                <div className="flex triggerConditionNum triggerConditionDate ThemeBorderColor3 clearBorderRadius">
                  <DateTime
                    selectedValue={
                      conditionValues[1] && conditionValues[1].value ? moment(conditionValues[1].value) : null
                    }
                    mode={mode[showType]}
                    timePicker={showTimePicker}
                    timeMode={timeMode}
                    allowClear={false}
                    onOk={e => this.updateConditionDateValue({ value: e.format(formatString), i, j, second: true })}
                  >
                    {conditionValues[1] && conditionValues[1].value
                      ? moment(conditionValues[1].value).format(formatString)
                      : ''}
                    <i className="icon-bellSchedule Font14 Gray_9e" />
                  </DateTime>
                </div>
              )}
              {this.renderOtherFields(item, i, j, true)}
            </div>
          )}
        </div>
      );
    }

    // 地区
    if (filedTypeId === 19 || filedTypeId === 23 || filedTypeId === 24) {
      const level = filedTypeId === 19 ? 1 : filedTypeId === 23 ? 2 : 3;
      return (
        <div className="flex relative flexRow">
          {conditionValues[0] && conditionValues[0].controlId ? (
            this.renderSelectFieldsValue(conditionValues[0], i, j)
          ) : (
            <div
              className={cx('flex triggerConditionNum triggerConditionList ThemeBorderColor3 clearBorderRadius', {
                pTop2: conditionValues.length,
              })}
            >
              <CityPicker
                level={level}
                callback={citys => {
                  this.cacheCityPickerData = citys;
                  level === citys.length && this.updateConditionValue({ value: citys, i, j });
                }}
                handleClose={() =>
                  this.cacheCityPickerData.length &&
                  this.updateConditionValue({ value: this.cacheCityPickerData, i, j })
                }
              >
                {!conditionValues.length ? (
                  <div className="Gray_bd pLeft10 pRight10">
                    {filedTypeId === 19 ? _l('省') : filedTypeId === 23 ? _l('省/市') : _l('省/市/县')}
                  </div>
                ) : (
                  <ul className="pLeft6 tagWrap">
                    {conditionValues.map((list, index) => {
                      return (
                        <li key={index} className="tagItem flexRow">
                          <span className="tag" title={list.value.value}>
                            {list.value.value}
                          </span>
                          <span
                            className="delTag"
                            onClick={e => {
                              e.stopPropagation();
                              this.updateConditionValue({ value: list.value.key, i, j });
                            }}
                          >
                            <Icon icon="close" className="pointer" />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CityPicker>
            </div>
          )}

          {this.renderOtherFields(item, i, j)}
        </div>
      );
    }

    // 人员 || 部门 || 组织角色
    if (filedTypeId === 26 || filedTypeId === 27 || filedTypeId === 48 || filedTypeId === 10000001) {
      return (
        <div className="flex relative flexRow">
          {conditionValues[0] && conditionValues[0].controlId ? (
            this.renderSelectFieldsValue(conditionValues[0], i, j)
          ) : (
            <div
              className={cx('flex triggerConditionNum triggerConditionList ThemeBorderColor3 clearBorderRadius', {
                pTop2: conditionValues.length,
              })}
              onClick={evt => {
                if (_.includes([26, 10000001], filedTypeId)) {
                  this.selectUser(
                    evt,
                    conditionValues,
                    i,
                    j,
                    _.includes(['9', '10'], item.conditionId) && enumDefault === 0,
                  );
                } else if (filedTypeId === 27) {
                  this.selectDepartment(
                    conditionValues,
                    i,
                    j,
                    _.includes(['9', '10'], item.conditionId) && enumDefault === 0,
                  );
                } else {
                  this.selectRole(
                    conditionValues,
                    i,
                    j,
                    _.includes(['9', '10'], item.conditionId) && enumDefault === 0,
                  );
                }
              }}
            >
              {!conditionValues.length ? (
                <div className="Gray_bd pLeft10 pRight10">
                  {_.includes([26, 10000001], filedTypeId)
                    ? _l('请选择人员')
                    : filedTypeId === 27
                    ? _l('请选择部门')
                    : _l('请选择组织角色')}
                </div>
              ) : (
                <ul className="pLeft6 tagWrap">
                  {conditionValues.map((list, index) => {
                    return (
                      <li key={index} className="tagItem flexRow">
                        <span className="tag" title={list.value.value}>
                          {list.value.value}
                        </span>
                        <span
                          className="delTag"
                          onClick={e => {
                            e.stopPropagation();
                            this.updateConditionValue({ value: list.value.key, i, j });
                          }}
                        >
                          <Icon icon="close" className="pointer" />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {this.renderOtherFields(item, i, j)}
        </div>
      );
    }

    // 时间
    if (filedTypeId === 46) {
      const timeFormat = unit === '1' ? 'HH:mm' : 'HH:mm:ss';

      return (
        <div className="flex">
          <div className="flexRow relative">
            {conditionValues[0] && conditionValues[0].controlId ? (
              this.renderSelectFieldsValue(conditionValues[0], i, j)
            ) : (
              <div className="flex triggerConditionNum triggerConditionDate ThemeBorderColor3 clearBorderRadius">
                <TimePicker
                  className="triggerConditionTime"
                  showNow={false}
                  bordered={false}
                  allowClear={false}
                  suffixIcon={<i className="icon-access_time Font14 Gray_9e" />}
                  inputReadOnly
                  placeholder=""
                  format={timeFormat}
                  value={
                    conditionValues[0] && conditionValues[0].value ? moment(conditionValues[0].value, timeFormat) : null
                  }
                  onChange={(time, timeString) => this.updateConditionDateValue({ value: timeString, i, j })}
                />
              </div>
            )}
            {this.renderOtherFields(item, i, j)}
            {controlNumber > 1 && <div className="Font13 mLeft10 Gray_9e LineHeight36">{_l('至')}</div>}
          </div>

          {controlNumber > 1 && (
            <div className="mTop10 flexRow relative">
              {conditionValues[1] && conditionValues[1].controlId ? (
                this.renderSelectFieldsValue(conditionValues[1], i, j, true)
              ) : (
                <div className="flex triggerConditionNum triggerConditionDate ThemeBorderColor3 clearBorderRadius">
                  <TimePicker
                    className="triggerConditionTime"
                    showNow={false}
                    bordered={false}
                    allowClear={false}
                    suffixIcon={<i className="icon-access_time Font14 Gray_9e" />}
                    inputReadOnly
                    placeholder=""
                    format={timeFormat}
                    value={
                      conditionValues[1] && conditionValues[1].value
                        ? moment(conditionValues[1].value, timeFormat)
                        : null
                    }
                    onChange={(time, timeString) =>
                      this.updateConditionDateValue({ value: timeString, i, j, second: true })
                    }
                  />
                </div>
              )}
              {this.renderOtherFields(item, i, j, true)}
            </div>
          )}
        </div>
      );
    }
  }

  /**
   * 清除不是数字的字符
   */
  clearNoNum = (evt, isBlur, i, j, second = false) => {
    let num = evt.target.value
      .replace(/[^-\d.]/g, '')
      .replace(/^\./g, '')
      .replace(/^-/, '$#$')
      .replace(/-/g, '')
      .replace('$#$', '-')
      .replace(/^-\./, '-')
      .replace('.', '$#$')
      .replace(/\./g, '')
      .replace('$#$', '.');

    if (isBlur && (num === '.' || num === '-')) {
      num = '';
    }

    evt.target.value = num;

    if (isBlur) {
      this.updateConditionValue({ value: num, i, j, second });
    }
  };

  /**
   * 渲染标签式下拉选择
   */
  renderDropdownTagList(conditionValues, i, j) {
    return (
      <div className="flex triggerConditionNum triggerConditionDropdown">
        {!conditionValues.length ? (
          <div className="Gray_bd pLeft10 pRight10">{_l('请选择')}</div>
        ) : (
          <ul className="pLeft6 tagWrap">
            {conditionValues.map((list, index) => {
              return (
                <li key={index} className="tagItem flexRow">
                  <span className="tag" title={list.value.value}>
                    {list.value.value}
                  </span>
                  <span
                    className="delTag"
                    onClick={e => {
                      e.stopPropagation();
                      this.updateConditionValue({ value: list.value.key, i, j });
                    }}
                  >
                    <Icon icon="close" className="pointer" />
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  /**
   * 成员选择
   */
  selectUser(evt, users, i, j, unique) {
    dialogSelectUser({
      title: _l('选择人员'),
      showMoreInvite: false,
      SelectUserSettings: {
        filterResigned: false,
        filterAccountIds: unique ? [] : users.map(item => item.value.key),
        projectId: this.props.projectId,
        dataRange: 2,
        unique,
        includeSystemField: true,
        filterSystemAccountId: ['user-self', 'user-sub'],
        callback: users => {
          this.updateConditionValue({ value: users, i, j, isSingle: unique });
        },
      },
    });
  }

  /**
   * 部门选择
   */
  selectDepartment(oldDepartments, i, j, unique) {
    new DialogSelectDept({
      projectId: this.props.projectId,
      selectedDepartment: [],
      unique,
      showCreateBtn: false,
      selectFn: departments => {
        if (!unique) {
          const oldIds = oldDepartments.map(item => item.value.key);
          _.remove(departments, item => _.includes(oldIds, item.departmentId));
        }

        this.updateConditionValue({ value: departments, i, j, isSingle: unique });
      },
    });
  }

  /**
   * 组织角色选择
   */
  selectRole(oldRoles, i, j, unique) {
    selectOrgRole({
      projectId: this.props.projectId,
      unique,
      onSave: roles => {
        if (!unique) {
          const oldIds = oldRoles.map(item => item.value.key);
          _.remove(roles, item => _.includes(oldIds, item.organizeId));
        }

        this.updateConditionValue({ value: roles, i, j, isSingle: unique });
      },
    });
  }

  /**
   * 更新筛选条件的值
   */
  updateConditionValue = ({ value, i, j, second, isSingle }) => {
    const data = _.cloneDeep(this.props.data);
    const { updateSource } = this.props;
    const { filedTypeId } = data[i][j];

    // 文本 || 手机号码 || 电话号码 || 邮箱 || 证件  || 关联单条 || 文本组合 || 自动编号 || api查询
    if (
      filedTypeId === 1 ||
      filedTypeId === 2 ||
      filedTypeId === 3 ||
      filedTypeId === 4 ||
      filedTypeId === 5 ||
      filedTypeId === 7 ||
      filedTypeId === 29 ||
      filedTypeId === 32 ||
      filedTypeId === 33 ||
      filedTypeId === 50
    ) {
      if (_.includes(data[i][j].conditionValues.map(obj => obj.value), value)) {
        _.remove(data[i][j].conditionValues, obj => obj.value === value);
      } else {
        data[i][j].conditionValues.push({ value });
      }
    }

    // 数字 || 金额  || 公式 || 日期公式时长
    if (
      filedTypeId === 6 ||
      filedTypeId === 8 ||
      filedTypeId === 31 ||
      (filedTypeId === 38 && typeof second === 'boolean')
    ) {
      data[i][j].conditionValues[!second ? 0 : 1] = { value };
    }

    // 单选 || 多选 || 下拉 || 等级 || 日期公式加减
    if (filedTypeId === 9 || filedTypeId === 10 || filedTypeId === 11 || filedTypeId === 28 || filedTypeId === 38) {
      if (typeof value === 'string') {
        _.remove(data[i][j].conditionValues, obj => obj.value.key === value);
      } else if (isSingle) {
        data[i][j].conditionValues = [{ value }];
      } else {
        data[i][j].conditionValues.push({ value });
      }
    }

    // 地区
    if (filedTypeId === 19 || filedTypeId === 23 || filedTypeId === 24) {
      if (typeof value === 'string') {
        _.remove(data[i][j].conditionValues, obj => obj.value.key === value);
      } else {
        const key = value[value.length - 1].id;
        const isExist = _.find(data[i][j].conditionValues, obj => obj.value.key === key);

        if (!isExist) {
          data[i][j].conditionValues.push({ value: { key, value: value.map(item => item.name).join('/') } });
        }
      }
    }

    // 人员 || 部门 || 组织角色
    if (_.includes([26, 27, 48, 10000001], filedTypeId)) {
      const KEY = {
        26: { id: 'accountId', name: 'fullname' },
        27: { id: 'departmentId', name: 'departmentName' },
        48: { id: 'organizeId', name: 'organizeName' },
        10000001: { id: 'accountId', name: 'fullname' },
      };

      if (typeof value === 'string') {
        _.remove(data[i][j].conditionValues, obj => obj.value.key === value);
      } else if (isSingle) {
        data[i][j].conditionValues = [
          { value: { key: (value[0] || {})[KEY[filedTypeId].id], value: (value[0] || {})[KEY[filedTypeId].name] } },
        ];
      } else {
        value.forEach(item => {
          data[i][j].conditionValues.push({
            value: { key: item[KEY[filedTypeId].id], value: item[KEY[filedTypeId].name] },
          });
        });
      }
    }

    updateSource(data);
  };

  /**
   * 切换条件
   */
  switchCondition = (conditionId, i, j) => {
    const data = _.cloneDeep(this.props.data);
    const { updateSource } = this.props;

    data[i][j].conditionId = conditionId;
    data[i][j].conditionValues = [];
    updateSource(data);
  };

  /**
   * 更新日期类型筛选条件的值
   */
  updateConditionDateValue = ({ value, i, j, type = 20, second = false }) => {
    const data = _.cloneDeep(this.props.data);
    const { updateSource } = this.props;

    data[i][j].conditionValues[!second ? 0 : 1] = { type, value };
    updateSource(data);
  };

  /**
   * 更多节点的值
   */
  renderOtherFields(item, i, j, second = false) {
    const { processId, selectNodeId, sourceAppId, isIntegration, controls } = this.props;
    const { moreFieldsIndex } = this.state;
    let dataSource = '';

    if (item.filedTypeId === 29) {
      controls.forEach(obj => {
        if (obj.controls) {
          obj.controls.forEach(o => {
            if (o.controlId === item.filedId) {
              dataSource = o.dataSource;
            }
          });
        } else if (obj.controlId === item.filedId) {
          dataSource = obj.dataSource;
        }
      });
    }

    return (
      <SelectOtherFields
        isFilter={true}
        item={Object.assign({}, item, { type: item.filedTypeId })}
        fieldsVisible={moreFieldsIndex === `${i}-${j}-${second}`}
        processId={processId}
        selectNodeId={selectNodeId}
        sourceAppId={sourceAppId}
        isIntegration={isIntegration}
        conditionId={item.conditionId}
        dataSource={dataSource}
        handleFieldClick={obj => this.updateDynamicConditionValue({ ...obj, i, j, second })}
        openLayer={() => this.setState({ moreFieldsIndex: `${i}-${j}-${second}` })}
        closeLayer={() => this.setState({ moreFieldsIndex: '' })}
      />
    );
  }

  /**
   * 更新筛选条件的动态值
   */
  updateDynamicConditionValue = ({
    actionId,
    appType,
    fieldValueId,
    fieldValueName,
    nodeId,
    nodeName,
    nodeTypeId,
    i,
    j,
    second,
    isDel,
  }) => {
    const data = _.cloneDeep(this.props.data);
    const { updateSource } = this.props;

    // 先清除固定值的项
    _.remove(data[i][j].conditionValues, obj => obj && !obj.controlId);

    if (isDel) {
      if (data[i][j].conditionValues.length > 1) {
        delete data[i][j].conditionValues[!second ? 0 : 1];
      } else {
        data[i][j].conditionValues = [];
      }
    } else {
      data[i][j].conditionValues[!second ? 0 : 1] = {
        actionId,
        appType,
        controlId: fieldValueId,
        controlName: fieldValueName,
        nodeId,
        nodeName,
        nodeType: nodeTypeId,
      };
    }

    updateSource(data);
  };

  /**
   * 渲染选中的单个值
   */
  renderSelectFieldsValue(item, i, j, second) {
    return (
      <div
        className={cx('actionControlBox flex ThemeBorderColor3 clearBorderRadius ellipsis actionCustomBox', {
          actionCustomBoxError: !item.nodeName || !item.controlName,
        })}
      >
        <span className="flexRow pTop3">
          <Tag
            flowNodeType={item.nodeType}
            appType={item.appType}
            actionId={item.actionId}
            nodeName={item.nodeName}
            controlId={item.controlId}
            controlName={item.controlName}
          />
        </span>
        <i
          className="icon-delete actionControlDel ThemeColor3"
          onClick={() => this.updateDynamicConditionValue({ ...item, i, j, second, isDel: true })}
        />
      </div>
    );
  }

  /**
   * 添加且条件
   */
  addAndCondition = i => {
    const data = _.cloneDeep(this.props.data);
    const { updateSource } = this.props;

    data[i].push({});
    updateSource(data);
  };

  /**
   * 添加或条件
   */
  addOrCondition = () => {
    const { data, updateSource, openNewFilter, addConditions } = this.props;

    if (openNewFilter) {
      addConditions();
    } else {
      updateSource(_.cloneDeep(data).concat([[{}]]));
    }
  };

  render() {
    const { Header, data } = this.props;

    return (
      <Fragment>
        <Header />
        <div className="flowDetailTrigger">
          {data.map((item, i) =>
            item.map((source, j) => this.renderItem(source, i, j, i === data.length - 1, j === item.length - 1)),
          )}
        </div>
      </Fragment>
    );
  }
}
