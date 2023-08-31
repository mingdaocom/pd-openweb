import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import dialogSelectUser from 'src/components/dialogSelectUser/dialogSelectUser';
import { MultipleDropdown, Dropdown, TagTextarea, CityPicker, Icon, QiniuUpload } from 'ming-ui';
import { DateTime, DateTimeRange } from 'ming-ui/components/NewDateTimePicker';
import DialogSelectDept from 'src/components/dialogSelectDept';
import Tag from '../Tag';
import SelectOtherFields from '../SelectOtherFields';
import { getIcons } from '../../../utils';
import { previewQiniuUrl } from 'src/components/previewAttachments';
import { TimePicker } from 'antd';
import { FORMAT_TEXT } from '../../../enum';
import { formatResponseData } from 'src/components/UploadFiles/utils';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { selectOrgRole } from 'src/components/DialogSelectOrgRole';
import moment from 'moment';

export default class SingleControlValue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moreFieldsIndex: '',
      isUploading: false,
    };

    // 缓存当前的附件的量
    if (props.item.fieldId === 'attachments' && props.item.fieldValue) {
      this.cacheFile = safeParse(props.item.fieldValue, 'array');
    }
  }

  cacheFile = [];

  componentWillReceiveProps(nextProps) {
    if (nextProps.item.fieldId !== this.props.item.fieldId) {
      this.cacheFile = [];
    }
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
    const { item, updateSource } = this.props;
    const fields = _.cloneDeep(this.props.fields);

    fields[i] = Object.assign({}, fields[i], obj);

    if (item.type === 10000008) {
      fields.forEach(o => {
        if (o.dataSource === item.fieldId) {
          o.fieldValue = '';
          o.nodeId = '';
          o.nodeName = '';
          o.fieldValueId = '';
          o.fieldValueName = '';
        }
      });
    }

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
        showCurrent={this.props.showCurrent}
        item={item}
        fieldsVisible={this.state.moreFieldsIndex === i}
        processId={this.props.processId}
        selectNodeId={this.props.selectNodeId}
        sourceAppId={this.props.sourceAppId}
        sourceNodeId={this.props.sourceNodeId}
        isIntegration={this.props.isIntegration}
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
    dialogSelectUser({
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
  selectDepartment(item, i, unique) {
    new DialogSelectDept({
      projectId: this.props.companyId,
      selectedDepartment: [],
      unique,
      showCreateBtn: false,
      selectFn: departments => {
        if (!unique) {
          const oldIds = JSON.parse(item.fieldValue).map(item => item.departmentId);
          _.remove(departments, item => _.includes(oldIds, item.departmentId));
        }

        departments = departments.map(obj => {
          return {
            departmentId: obj.departmentId,
            departmentName: obj.departmentName,
          };
        });

        this.updateSingleControlValue(
          {
            fieldValue: unique
              ? JSON.stringify(departments)
              : JSON.stringify(JSON.parse(item.fieldValue).concat(departments)),
          },
          i,
        );
      },
    });
  }

  /**
   * 组织角色选择
   */
  selectRole(item, i, unique) {
    selectOrgRole({
      projectId: this.props.companyId,
      unique,
      onSave: roles => {
        if (!unique) {
          const oldIds = JSON.parse(item.fieldValue || '[]').map(item => item.organizeId);
          _.remove(roles, item => _.includes(oldIds, item.organizeId));
        }

        roles = roles.map(item => {
          return {
            organizeId: item.organizeId,
            organizeName: item.organizeName,
          };
        });

        this.updateSingleControlValue(
          {
            fieldValue: unique
              ? JSON.stringify(roles)
              : JSON.stringify(JSON.parse(item.fieldValue || '[]').concat(roles)),
          },
          i,
        );
      },
    });
  }

  /**
   * 刪除 成员 or 部门 or 组织角色
   */
  deleteTags(id, i) {
    const { updateSource } = this.props;
    const fields = _.cloneDeep(this.props.fields);

    fields[i].fieldValue = JSON.parse(fields[i].fieldValue);
    _.remove(fields[i].fieldValue, item => item.accountId === id || item.departmentId === id || item.organizeId);
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

  /**
   * 预览附件
   */
  previewAttachments(file) {
    if (file.serverName) {
      previewQiniuUrl(file.url, {
        ext: File.GetExt(file.fileExt),
        name: file.originalFileName,
      });
    } else {
      previewAttachments({
        attachments: [Object.assign({}, file, { path: file.privateDownloadUrl })],
        callFrom: 'player',
      });
    }
  }

  renderRelationField = obj => {
    const { appName, appTypeName, nodeId, nodeName, nodeTypeId, appType, actionId } = obj || {};

    if (nodeId && !nodeName) {
      return <span style={{ color: '#f44336' }}>{_l('节点已删除')}</span>;
    }

    return (
      <Fragment>
        <span className={`${getIcons(nodeTypeId, appType, actionId)} Font16 Gray_9e mRight5`} />
        <span>{nodeName}</span>
        <span className="bold mLeft4 mRight5">{appTypeName}</span>
        {appName && <span className="bold">{`“${appName}”`}</span>}
      </Fragment>
    );
  };

  render() {
    const { controls, item, i } = this.props;
    const { isUploading } = this.state;
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

    // 文本框 || 文本组合 || 自动编号 || 富文本 || API查询
    if (item.type === 2 || item.type === 32 || item.type === 33 || item.type === 41 || item.type === 50) {
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

    // 单选项 || 下拉框 || 检查项 || 外部门户角色
    if (item.type === 9 || item.type === 11 || item.type === 36 || item.type === 44) {
      const disabledOtherFields = _.includes(['folder_stage_id', 'portal_role', 'portal_status'], item.fieldId);

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
                { clearBorderRadius: !disabledOtherFields },
              )}
              data={list}
              value={item.fieldValue || undefined}
              border
              isAppendToBody
              onChange={fieldValue => this.updateSingleControlValue({ fieldValue }, i)}
            />
          )}
          {!disabledOtherFields && this.renderOtherFields(item, i)}
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

    // 附件
    if (item.type === 14) {
      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : item.fieldId === 'attachments' ? (
            <Fragment>
              <QiniuUpload
                className="workflowFileUpload"
                options={{ max_file_size: '50m', chunk_size: '50m' }}
                onUploaded={(up, file, response) => {
                  this.setState({ isUploading: false });
                  up.disableBrowse(false);

                  const currentTotalSize = this.cacheFile
                    .map(o => parseInt(o.fileSize || o.filesize))
                    .reduce((o, count) => count + o, 0);

                  if (currentTotalSize + parseInt(file.size) > 50 * 1024 * 1024) {
                    alert(_l('部分附件上传失败，总大小超过50MB'), 2);
                    return;
                  }

                  this.cacheFile.push(formatResponseData(file, decodeURIComponent(JSON.stringify(response))));
                  this.updateSingleControlValue({ fieldValue: JSON.stringify(this.cacheFile) }, i);
                }}
                onAdd={(up, files) => {
                  this.setState({ isUploading: true });
                  up.disableBrowse();
                }}
                onError={(up, err, errTip) => {
                  alert(errTip, 2);
                }}
              />

              <div className="actionControlBox flex clearBorderRadius pLeft10 pRight10 actionControlUsers">
                {JSON.parse(item.fieldValue || '[]').map((o, fileIndex) => {
                  const ext = File.GetExt(o.fileExt || o.ext);
                  return (
                    <div
                      key={fileIndex}
                      className="InlineFlex boderRadAll_3 GrayBG alignItemsCenter mRight10 mTop3 mBottom3 pRight5 TxtTop relative"
                      style={{ height: 28, zIndex: 2 }}
                    >
                      {File.isPicture('.' + ext) ? (
                        <img
                          src={o.previewUrl ? o.previewUrl : o.serverName + o.key}
                          style={{ height: 28 }}
                          // onClick={() => this.previewAttachments(o)}
                        />
                      ) : (
                        <span
                          className={`fileIcon fileIcon-${ext}`}
                          style={{ width: 24, height: 28 }}
                          // onClick={() => this.previewAttachments(o)}
                        />
                      )}
                      <span className="ThemeHoverColor3 pointer">
                        <span className="ellipsis InlineBlock mLeft5" style={{ maxWidth: 200 }}>
                          {o.originalFileName || o.originalFilename}
                        </span>
                        .{ext}
                      </span>
                      <Icon
                        icon="close"
                        className="pointer Gray_9e ThemeHoverColor3 mLeft10"
                        onClick={() => {
                          const newFieldValue = JSON.parse(item.fieldValue);

                          _.remove(newFieldValue, (obj, objIndex) => objIndex === fileIndex);

                          this.cacheFile = newFieldValue;
                          this.updateSingleControlValue({ fieldValue: JSON.stringify(newFieldValue) }, i);
                        }}
                      />
                    </div>
                  );
                })}
                {!JSON.parse(item.fieldValue || '[]').length && !isUploading && (
                  <span className="Gray_bd LineHeight34">{_l('选择附件')}</span>
                )}
                {isUploading && <span className="Gray_9e LineHeight34">{_l('上传中...')}</span>}
              </div>
            </Fragment>
          ) : (
            <div className="actionControlBox flex clearBorderRadius" />
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    // 日期 || 日期时间
    if (item.type === 15 || item.type === 16) {
      const showType =
        _.get(
          _.find(controls, obj => obj.controlId === item.fieldId),
          'advancedSetting.showtype',
        ) || 1;
      const mode = { 3: 'date', 4: 'month', 5: 'year' };
      const timeMode = { 1: 'minute', 2: 'hour', 6: 'second' };

      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <div className="actionControlBox flex ThemeBorderColor3 clearBorderRadius actionControlBoxClear">
              <DateTime
                selectedValue={item.fieldValue ? moment(item.fieldValue) : null}
                timePicker={item.type === 16}
                mode={mode[showType]}
                timeMode={timeMode[showType]}
                allowClear={false}
                onOk={e => this.updateSingleControlValue({ fieldValue: e.format(FORMAT_TEXT[showType]) }, i)}
              >
                {item.fieldValue ? (
                  moment(item.fieldValue).format(FORMAT_TEXT[showType])
                ) : (
                  <span className="Gray_bd">{_l('请选择日期')}</span>
                )}
              </DateTime>
              {item.fieldValue && (
                <Icon
                  icon="cancel1"
                  className="Font16 Gray_9e ThemeHoverColor3 Absolute"
                  style={{ top: 9, right: 10 }}
                  onClick={() => this.updateSingleControlValue({ fieldValue: '' }, i)}
                />
              )}
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

    // 地区
    if (item.type === 19 || item.type === 23 || item.type === 24) {
      const level = item.type === 19 ? 1 : item.type === 23 ? 2 : 3;
      const cityText = safeParse(item.fieldValue || '{}').value || '';

      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <div className="actionControlBox flex ThemeBorderColor3 clearBorderRadius actionControlBoxClear">
              <CityPicker
                level={level}
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
              >
                {cityText ? (
                  <span>{cityText}</span>
                ) : (
                  <span className="Gray_bd">
                    {item.type === 19 ? _l('省') : item.type === 23 ? _l('省/市') : _l('省/市/县')}
                  </span>
                )}
              </CityPicker>
              {cityText && (
                <Icon
                  icon="cancel1"
                  className="Font16 Gray_9e ThemeHoverColor3 Absolute"
                  style={{ top: 9, right: 10 }}
                  onClick={() => this.updateSingleControlValue({ fieldValue: '' }, i)}
                />
              )}
            </div>
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    // 人员 || 部门 || 组织角色
    if (item.type === 26 || item.type === 27 || item.type === 48) {
      const unique = (_.find(controls, obj => obj.controlId === item.fieldId) || {}).enumDefault === 0;
      const TYPES = {
        26: {
          name: 'fullName',
          id: 'accountId',
          placeholder: _l('选择人员'),
        },
        27: {
          name: 'departmentName',
          id: 'departmentId',
          placeholder: _l('选择部门'),
        },
        48: {
          name: 'organizeName',
          id: 'organizeId',
          placeholder: _l('选择组织角色'),
        },
      };

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
                } else if (item.type === 27) {
                  this.selectDepartment(item, i, unique);
                } else {
                  this.selectRole(item, i, unique);
                }
              }}
            >
              <ul className="pLeft6 tagWrap">
                {!JSON.parse(item.fieldValue || '[]').length && (
                  <span className="Gray_bd LineHeight34 mLeft4">{TYPES[item.type].placeholder}</span>
                )}
                {JSON.parse(item.fieldValue || '[]').map((list, index) => {
                  return (
                    <li key={index} className="tagItem flexRow">
                      <span className="tag bold" title={list[TYPES[item.type].name]}>
                        {list[TYPES[item.type].name]}
                      </span>
                      <span
                        className="delTag"
                        onClick={e => {
                          e.stopPropagation();
                          this.deleteTags(list[TYPES[item.type].id], i);
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

    // 关联 || 对象数组
    if (item.type === 29 || item.type === 10000008) {
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
              renderTitle={() =>
                this.renderRelationField(_.find(relationControls, o => o.nodeId === item.nodeId) || item)
              }
              onChange={nodeId => this.updateSingleControlValue({ nodeId }, i)}
            />
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    // 签名 || 数组 || 普通数组
    if (item.type === 42 || item.type === 10000003 || item.type === 10000007) {
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

    // 时间
    if (item.type === 46) {
      const lang = getCookie('i18n_langtag') || getNavigatorLang();
      const timeFormat = item.unit === '1' ? 'HH:mm' : 'HH:mm:ss';

      return (
        <div className="mTop8 flexRow relative">
          {item.fieldValueId ? (
            this.renderSelectFieldsValue(item, i)
          ) : (
            <div className="actionControlBox flex ThemeBorderColor3 clearBorderRadius">
              <TimePicker
                className="triggerConditionTime"
                showNow={false}
                bordered={false}
                suffixIcon={null}
                clearIcon={<Icon icon="cancel1" className="Font16 Gray_9e ThemeHoverColor3" />}
                inputReadOnly
                placeholder={_l('请选择时间')}
                format={timeFormat}
                value={item.fieldValue ? moment(item.fieldValue, timeFormat) : null}
                onChange={(time, timeString) => this.updateSingleControlValue({ fieldValue: timeString }, i)}
              />
            </div>
          )}
          {this.renderOtherFields(item, i)}
        </div>
      );
    }

    return null;
  }
}
