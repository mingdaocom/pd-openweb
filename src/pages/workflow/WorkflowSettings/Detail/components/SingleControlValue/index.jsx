import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import 'dialogSelectUser';
import { MultipleDropdown, Dropdown, TagTextarea, CityPicker, Icon } from 'ming-ui';
import { DateTime, DateTimeRange } from 'ming-ui/components/NewDateTimePicker';
import DialogSelectDept from 'dialogSelectDept';
import Tag from '../Tag';
import SelectOtherFields from '../SelectOtherFields';
import { getIcons } from '../../../utils';

export default class SingleControlValue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moreFieldsIndex: '',
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.item.type === 2 && prevProps.item.fieldValue !== this.props.item.fieldValue && this.tagtextarea) {
      const cursor = this.tagtextarea.cmObj.getCursor();

      this.tagtextarea.setValue(this.props.item.fieldValue);
      this.tagtextarea.cmObj.setCursor(cursor);
    }
  }

  /**
   * 更新单个字段的值
   */
  updateSingleControlValue(obj, i) {
    const { updateSource } = this.props;
    const fields = _.cloneDeep(this.props.fields);

    fields[i] = Object.assign({}, fields[i], obj);
    updateSource({ fields });
  }

  /**
   * 渲染选中的单个值
   */
  renderSelectFieldsValue(item, i) {
    return (
      <div
        className={cx('actionControlBox flex ThemeBorderColor3 clearBorderRadius ellipsis actionCustomBox', {
          actionCustomBoxError: !item.nodeName || !item.fieldValueName,
        })}
      >
        <span className="flexRow pTop3">
          <Tag
            flowNodeType={item.nodeTypeId}
            appType={item.nodeAppType || item.appType}
            actionId={item.nodeActionId || item.actionId}
            nodeName={item.nodeName}
            controlId={item.fieldValueId}
            controlName={item.fieldValueName}
            isSourceApp={item.isSourceApp}
          />
        </span>
        <i
          className="icon-delete actionControlDel ThemeColor3"
          onClick={() =>
            this.updateSingleControlValue({ nodeId: '', nodeName: '', fieldValueId: '', fieldValueName: '' }, i)
          }
        />
      </div>
    );
  }

  /**
   * 渲染清空
   */
  renderClear(item, i) {
    return (
      <div className="actionControlBox flex ThemeBorderColor3 clearBorderRadius ellipsis actionCustomBox">
        <span className="flexRow pTop3">
          <div className="flowDetailTagBox">
            <div
              className="flowDetailMemberNodeName ellipsis"
              style={{ paddingRight: 10, borderRadius: 26, borderRightWidth: 1 }}
            >
              <i className="Font14 mRight5 icon-workflow_empty Gray_9e" />
              {_l('清空')}
            </div>
          </div>
        </span>
        <i
          className="icon-delete actionControlDel ThemeColor3"
          onClick={() =>
            this.updateSingleControlValue(
              {
                fieldValue: item.type === 26 || item.type === 27 ? '[]' : '',
                nodeId: '',
                nodeName: '',
                fieldValueId: '',
                fieldValueName: '',
                isClear: false,
              },
              i,
            )
          }
        />
      </div>
    );
  }

  /**
   * 更多节点的值
   */
  renderOtherFields(item, i, customCallback) {
    return (
      <SelectOtherFields
        showClear={this.props.showClear}
        item={item}
        fieldsVisible={this.state.moreFieldsIndex === i}
        processId={this.props.processId}
        selectNodeId={this.props.selectNodeId}
        sourceAppId={this.props.sourceAppId}
        sourceNodeId={this.props.sourceNodeId}
        dataSource={
          item.type === 29 ? (_.find(this.props.controls, obj => obj.controlId === item.fieldId) || {}).dataSource : ''
        }
        handleFieldClick={obj => (customCallback ? customCallback(obj) : this.updateSingleControlValue(obj, i))}
        openLayer={() => this.setState({ moreFieldsIndex: i })}
        closeLayer={() => this.setState({ moreFieldsIndex: '' })}
      />
    );
  }

  /**
   * 验证号码控件  只能输入数字  做最简单验证
   */
  checkPhoneNumberControl(evt, isBlur, i) {
    const num = evt.target.value.replace(/[^\d]/g, '');
    evt.target.value = num;

    if (isBlur) {
      this.updateSingleControlValue({ fieldValue: num }, i);
    }
  }

  /**
   * 成员选择
   */
  selectUser(evt, item, i, unique) {
    $(evt.target).dialogSelectUser({
      title: _l('选择人员'),
      showMoreInvite: false,
      SelectUserSettings: {
        unique,
        filterAccountIds: JSON.parse(item.fieldValue).map(obj => obj.accountId),
        projectId: this.props.companyId,
        dataRange: 2,
        callback: users => {
          const accounts = users.map(obj => {
            return {
              avatar: obj.avatar,
              fullName: obj.fullname,
              accountId: obj.accountId,
            };
          });
          this.updateSingleControlValue(
            {
              fieldValue: unique
                ? JSON.stringify(accounts)
                : JSON.stringify(JSON.parse(item.fieldValue).concat(accounts)),
            },
            i,
          );
        },
      },
    });
  }

  /**
   * 部门选择
   */
  selectDepartment(i, unique) {
    new DialogSelectDept({
      projectId: this.props.companyId,
      selectedDepartment: [],
      unique,
      showCreateBtn: false,
      selectFn: departments => {
        departments = departments.map(obj => {
          return {
            departmentId: obj.departmentId,
            departmentName: obj.departmentName,
          };
        });

        this.updateSingleControlValue({ fieldValue: JSON.stringify(departments) }, i);
      },
    });
  }

  /**
   * 刪除 成员 or 部门
   */
  deleteUserOrDepartment(id, i) {
    const { updateSource } = this.props;
    const fields = _.cloneDeep(this.props.fields);

    fields[i].fieldValue = JSON.parse(fields[i].fieldValue);
    _.remove(fields[i].fieldValue, item => item.accountId === id || item.departmentId === id);
    fields[i].fieldValue = JSON.stringify(fields[i].fieldValue);

    updateSource({ fields });
  }

  /**
   * 验证数值金额控件
   */
  checkNumberControl(evt, isBlur, i) {
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
      this.updateSingleControlValue({ fieldValue: num }, i);
    }
  }

  /**
   * 文本控件选择其他节点对象更新值
   */
  textareaSelectOtherNodeUpdateValue(obj, i) {
    const { updateSource } = this.props;
    const formulaMap = _.cloneDeep(this.props.formulaMap);

    if (obj.isClear) {
      this.updateSingleControlValue(
        { fieldValue: '', nodeId: '', nodeName: '', fieldValueId: '', fieldValueName: '', isClear: true },
        i,
      );
    } else {
      formulaMap[obj.nodeId] = {
        type: obj.nodeTypeId,
        appType: obj.appType,
        actionId: obj.actionId,
        name: obj.nodeName,
        isSourceApp: obj.isSourceApp.toString(),
      };
      formulaMap[obj.fieldValueId] = { type: obj.fieldValueType, name: obj.fieldValueName };

      updateSource({ formulaMap }, () => {
        if (this.tagtextarea) {
          this.tagtextarea.insertColumnTag(`${obj.nodeId}-${obj.fieldValueId}`);
        } else {
          this.updateSingleControlValue(
            { fieldValue: `$${obj.nodeId}-${obj.fieldValueId}$`, fieldValueId: '', nodeAppId: '', isClear: false },
            i,
          );
        }
      });
    }
  }

  render() {
    const { controls, item, i } = this.props;
    const formulaMap = _.cloneDeep(this.props.formulaMap);
    let list = [];

    if (!item.fieldId) {
      return <div className="mTop8 actionControlBox actionDisabled" />;
    }

    if (item.isClear) {
      return (
        <div className="mTop8 flexRow relative">
          {this.renderClear(item, i)}
          {this.renderOtherFields(
            item,
            i,
            item.type !== 2 ? '' : obj => this.textareaSelectOtherNodeUpdateValue(obj, i),
          )}
        </div>
      );
    }

    // 单行文本
    if (item.type === 1) {
      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <input
              type="text"
              className="flex ThemeBorderColor3 actionControlBox clearBorderRadius pTop0 pBottom0 pLeft10 pRight10"
              placeholder={_l('请输入...')}
              defaultValue={item.fieldValue || ''}
              onChange={evt => this.updateSingleControlValue({ fieldValue: evt.currentTarget.value }, i)}
            />
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    // 文本框 || 文本组合 || 自动编号 || 富文本
    if (item.type === 2 || item.type === 32 || item.type === 33 || item.type === 41) {
      return (
        <div className="mTop8 flexRow relative">
          <TagTextarea
            className={cx(
              'flex',
              { minH100: item.fieldId === 'content' },
              {
                smallPadding:
                  item.fieldId !== 'content' && item.fieldValue && item.fieldValue.match(/\$[\w]+-[\w]+\$/g),
              },
            )}
            height={0}
            defaultValue={item.fieldValue}
            getRef={tagtextarea => {
              this.tagtextarea = tagtextarea;
            }}
            renderTag={(tag, options) => {
              const ids = tag.split(/([a-zA-Z0-9#]{24,32})-/).filter(item => item);
              const nodeObj = formulaMap[ids[0]] || {};
              const controlObj = formulaMap[ids[1]] || {};

              return (
                <Tag
                  flowNodeType={nodeObj.type}
                  appType={nodeObj.appType}
                  actionId={nodeObj.actionId}
                  nodeName={nodeObj.name || ''}
                  controlId={ids[1]}
                  controlName={controlObj.name || ''}
                  isSourceApp={nodeObj.isSourceApp === 'true'}
                />
              );
            }}
            onChange={(err, value, obj) => {
              this.updateSingleControlValue({ fieldValue: value, fieldValueId: '', nodeAppId: '' }, i);
            }}
          />
          {this.renderOtherFields(item, i, obj => this.textareaSelectOtherNodeUpdateValue(obj, i))}
        </div>
      );
    }

    // 手机 || 座机
    if (item.type === 3 || item.type === 4) {
      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <input
              type="text"
              className="flex ThemeBorderColor3 actionControlBox clearBorderRadius pTop0 pBottom0 pLeft10 pRight10"
              placeholder={item.type === 3 ? _l('填写手机号') : _l('填写座机号')}
              defaultValue={item.fieldValue || ''}
              onKeyUp={evt => this.checkPhoneNumberControl(evt)}
              onPaste={evt => this.checkPhoneNumberControl(evt)}
              onBlur={evt => this.checkPhoneNumberControl(evt, true, i)}
            />
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    // 邮箱 || 证件
    if (item.type === 5 || item.type === 7) {
      let reg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*\.[\w-]+$/i;
      let placeholder = _l('填写邮箱地址');
      if (item.type === 7) {
        const enumDefault = _.find(controls, obj => obj.controlId === item.fieldId).enumDefault;
        if (enumDefault === 1) {
          reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
          placeholder = _l('填写身份证');
        } else if (enumDefault === 2) {
          reg = /^[a-zA-Z0-9]{5,17}$/;
          placeholder = _l('填写护照');
        } else {
          reg = /.*/;
          placeholder = enumDefault === 3 ? _l('填写港澳通行证') : _l('填写台湾通行证');
        }
      }

      const isError = item.fieldValue ? !reg.test(item.fieldValue) : false;

      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <input
              type="text"
              className={cx(
                'flex ThemeBorderColor3 actionControlBox clearBorderRadius pTop0 pBottom0 pLeft10 pRight10',
                { errorBorder: isError },
              )}
              placeholder={placeholder}
              defaultValue={item.fieldValue || ''}
              onBlur={evt => this.updateSingleControlValue({ fieldValue: evt.target.value.trim() }, i)}
            />
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    // 数值 || 金额 || 公式
    if (item.type === 6 || item.type === 8 || item.type === 31) {
      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <input
              type="text"
              className="flex ThemeBorderColor3 actionControlBox clearBorderRadius pTop0 pBottom0 pLeft10 pRight10"
              placeholder={item.type === 6 ? _l('填写数字') : _l('填写金额')}
              defaultValue={item.fieldValue || ''}
              maxLength={16}
              onKeyUp={evt => this.checkNumberControl(evt)}
              onPaste={evt => this.checkNumberControl(evt)}
              onBlur={evt => this.checkNumberControl(evt, true, i)}
            />
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    // 单选项 || 下拉框 || 检查项
    if (item.type === 9 || item.type === 11 || item.type === 36) {
      list = ((_.find(controls, obj => obj.controlId === item.fieldId) || {}).options || []).map(o => {
        return {
          text: o.value,
          value: o.key,
        };
      });

      if (item.fieldValue) {
        list.unshift({
          text: _l('清除选择'),
          value: '',
        });
      }

      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <Dropdown
              className={cx(
                'flowDropdown flex',
                {
                  actionCustomBoxError: item.fieldValue && !_.find(list, obj => obj.value === item.fieldValue),
                },
                { clearBorderRadius: item.fieldId !== 'folder_stage_id' },
              )}
              data={list}
              value={item.fieldValue || undefined}
              border
              isAppendToBody
              onChange={fieldValue => this.updateSingleControlValue({ fieldValue }, i)}
            />
          )}
          {item.fieldId !== 'folder_stage_id' && this.renderOtherFields(item, i)}
        </div>
      );
    }

    // 多选项
    if (item.type === 10) {
      const label = [];

      list = ((_.find(controls, obj => obj.controlId === item.fieldId) || {}).options || []).map(o => {
        if (_.includes(item.fieldValue.split(','), o.key)) {
          label.push(o.value);
        }
        return {
          label: o.value,
          value: o.key,
        };
      });

      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <MultipleDropdown
              className={cx(
                'flowDropdown flex clearBorderRadius',
                { actionCustomBoxError: item.fieldValue && item.fieldValue.split(',').length !== label.length },
                { flowDropdownNull: !item.fieldValue },
              )}
              value={item.fieldValue.split(',')}
              options={list}
              multipleSelect
              label={label.join('、')}
              multipleLevel={false}
              multipleHideDropdownNav
              onChange={(e, ids) => this.updateSingleControlValue({ fieldValue: ids.join(',') }, i)}
            />
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    // 附件 || 签名 || 特殊数组
    if (item.type === 14 || item.type === 42 || item.type === 10000003) {
      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <div className="actionControlBox flex clearBorderRadius" />
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    // 日期 || 日期时间
    if (item.type === 15 || item.type === 16) {
      const formatText = item.type === 15 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm';

      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <div className="actionControlBox flex ThemeBorderColor3 clearBorderRadius">
              <DateTime
                selectedValue={item.fieldValue ? moment(item.fieldValue) : null}
                timePicker={item.type === 16}
                timeMode="minute"
                onOk={e => this.updateSingleControlValue({ fieldValue: e.format(formatText) }, i)}
                onClear={() => this.updateSingleControlValue({ fieldValue: '' }, i)}
              >
                {item.fieldValue ? (
                  moment(item.fieldValue).format(formatText)
                ) : (
                  <span className="Gray_bd">{_l('请选择日期')}</span>
                )}
              </DateTime>
            </div>
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    // 地区
    if (item.type === 19 || item.type === 23 || item.type === 24) {
      const level = item.type === 19 ? 1 : item.type === 23 ? 2 : 3;

      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <div className="actionControlBox flex ThemeBorderColor3 clearBorderRadius">
              <CityPicker
                level={level}
                defaultValue={item.fieldValue ? JSON.parse(item.fieldValue).value : ''}
                placeholder={item.type === 19 ? _l('省') : item.type === 23 ? _l('省/市') : _l('省/市/县')}
                callback={citys =>
                  this.updateSingleControlValue(
                    {
                      fieldValue: JSON.stringify({
                        id: citys[citys.length - 1].id,
                        value: citys.map(o => o.name).join('/'),
                      }),
                    },
                    i,
                  )
                }
              />
            </div>
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    // 日期段 || 日期时间段
    if (item.type === 17 || item.type === 18) {
      const formatText = item.type === 17 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm';
      const rangeValue = item.fieldValue ? item.fieldValue.split(',') : [];

      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <div className="actionControlBox flex ThemeBorderColor3 clearBorderRadius">
              <DateTimeRange
                selectedValue={rangeValue.length ? [moment(rangeValue[0]), moment(rangeValue[1])] : null}
                timePicker={item.type === 18}
                timeMode="minute"
                placeholder=""
                onOk={e =>
                  this.updateSingleControlValue(
                    { fieldValue: `${e[0].format(formatText)},${e[1].format(formatText)}` },
                    i,
                  )
                }
                onClear={() => this.updateSingleControlValue({ fieldValue: '' }, i)}
              >
                {rangeValue.length ? (
                  `${moment(rangeValue[0]).format(formatText)} ~ ${moment(rangeValue[1]).format(formatText)}`
                ) : (
                  <span className="Gray_bd">{_l('请选择日期')}</span>
                )}
              </DateTimeRange>
            </div>
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    // 人员 || 部门
    if (item.type === 26 || item.type === 27) {
      const unique = (_.find(controls, obj => obj.controlId === item.fieldId) || {}).enumDefault === 0;
      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <div
              className="actionControlBox flex ThemeBorderColor3 clearBorderRadius actionControlUsers"
              onClick={evt => {
                if (item.type === 26) {
                  this.selectUser(evt, item, i, unique);
                } else {
                  this.selectDepartment(i, unique);
                }
              }}
            >
              <ul className="pLeft6 tagWrap">
                {!JSON.parse(item.fieldValue || '[]').length && (
                  <span className="Gray_bd LineHeight34 mLeft4">
                    {item.type === 26 ? _l('选择人员') : _l('选择部门')}
                  </span>
                )}
                {JSON.parse(item.fieldValue || '[]').map((list, index) => {
                  return (
                    <li key={index} className="tagItem flexRow">
                      <span className="tag bold" title={list.fullName || list.departmentName}>
                        {list.fullName || list.departmentName}
                      </span>
                      <span
                        className="delTag"
                        onClick={e => {
                          e.stopPropagation();
                          this.deleteUserOrDepartment(list.accountId || list.departmentId, i);
                        }}
                      >
                        <Icon icon="close" className="pointer" />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    // 等级
    if (item.type === 28) {
      const { options } = _.find(controls, obj => obj.controlId === item.fieldId);

      list = options.map(o => {
        return {
          text: o.value,
          value: o.key,
        };
      });

      if (item.fieldValue) {
        list.unshift({
          text: _l('清除选择'),
          value: '',
        });
      }

      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <Dropdown
              className="flowDropdown flex clearBorderRadius"
              data={list}
              value={item.fieldValue || undefined}
              border
              isAppendToBody
              onChange={fieldValue => this.updateSingleControlValue({ fieldValue }, i)}
            />
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    // 关联
    if (item.type === 29) {
      const relationControls = (_.find(controls, o => o.controlId === item.fieldId) || {}).flowNodeAppDtos || [];
      const relationControlsList = [
        relationControls.map(o => {
          return {
            text: this.renderRelationField(o),
            value: o.nodeId,
          };
        }),
      ];

      if (item.nodeId) {
        relationControlsList[0].unshift({
          text: _l('清除选择'),
          value: '',
        });
      }

      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <Dropdown
              className="flowDropdown flex clearBorderRadius"
              data={relationControlsList}
              value={item.nodeId || undefined}
              border
              isAppendToBody
              placeholder={_l('选择流程中对应此工作表的节点对象')}
              renderTitle={() => this.renderRelationField(_.find(relationControls, o => o.nodeId === item.nodeId))}
              onChange={nodeId => this.updateSingleControlValue({ nodeId }, i)}
            />
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    return null;
  }

  renderRelationField = obj => {
    const { appName, appTypeName, nodeName, nodeTypeId, appType, actionId } = obj || {};

    if (!appName) {
      return <span style={{ color: '#f44336' }}>{_l('节点已删除')}</span>;
    }

    return (
      <Fragment>
        <span className={`${getIcons(nodeTypeId, appType, actionId)} Font16 Gray_9e mRight5`} />
        <span>{nodeName}</span>
        <span className="bold mLeft4 mRight5">{appTypeName}</span>
        <span className="bold">{`“${appName}”`}</span>
      </Fragment>
    );
  };
}
