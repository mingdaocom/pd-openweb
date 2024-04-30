import React from 'react';
import { Icon, Dropdown, RadioGroup, Dialog, Tooltip } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';
import cx from 'classnames';
import ChooseWidget from './ChooseWidget';
import styled from 'styled-components';
import Input from '../components/Inputs';
import { DEF_TYPES, DEF_R_TYPES } from 'src/pages/worksheet/common/CreateCustomBtn/config.js';
import _ from 'lodash';
import {
  formatControlsBySectionId,
  getSectionId,
  getRealData,
  canNotForCustomWrite,
} from 'src/pages/worksheet/common/CreateCustomBtn/utils.js';
import { noWriteTypes } from '../config';
import { isRelateRecordTableControl } from 'worksheet/util';

const Wrap = styled.div`
  .controlname {
    width: 200px;
    &.isChild {
      margin-left: 24px;
      width: 176px;
    }
  }
  .actionListBox {
    width: 110px;
  }
  .valueDef {
    flex: 1;
    .inputDef {
      width: 100%;
      .optionsCon {
        border-radius: 4px;
        padding: 0 10px;
        border: 1px solid #ccc;
        background: #ffffff;
        height: 36px;
        line-height: 36px;
        width: 100%;
        position: relative;
        .txt {
          display: block;
          width: 100%;
          line-height: 36px;
          height: 100%;
        }
      }
      .datePicker {
        position: absolute;
        z-index: 1;
      }
      .settingItemTitle {
        display: none;
      }
      & > div {
        margin-top: 0;
      }
      &.notOther {
        & > div {
          & > div {
            & > div:nth-child(1) {
              width: calc(100%) !important;
              border-radius: 4px !important;
            }
          }
        }
        .tagInputarea .tagInputareaIuput,
        .CityPicker-input-container input {
          border-radius: 4px !important;
        }
        .ant-input {
          width: calc(100%) !important;
          border-radius: 4px !important;
          &:hover {
            border-color: #ccc !important;
          }
        }
        .ant-input:focus,
        .ant-input-focused {
          border-color: #2196f3 !important;
          box-shadow: none !important;
        }
        .selectOtherFieldContainer {
          display: none;
          & > div {
            display: none;
          }
        }
      }
    }
  }
`;
class AppointDialog extends React.Component {
  state = {
    showAppointDialog: this.props.showAppointDialog,
    writeObject: this.props.writeObject || 1,
    writeType: this.props.writeType || 1,
    addRelationControlId: this.props.addRelationControlId || '',
    writeControls: this.props.writeControls || [],
    writeControlsClone: this.props.writeControls || [],
    showChooseWidgetDialog: false,
    widgetList: this.props.widgetList || [],
    clickType: this.props.clickType,
    showErrerDialog: false,
    errerDialogTitle: '',
    errerDialogTxt: '',
  };

  componentDidMount() {
    $('.Radio').attr('title', '');
    $(document).find('.iconErr').click();
  }

  isOnlyRead = type => {
    return noWriteTypes.indexOf(type) >= 0;
  };

  getControlEffect = it => {
    return this.isOnlyRead(it.type) ? 1 : it.required ? 3 : 2;
  };

  handDel = item => {
    const controls = this.state.writeObject !== 1 ? this.props.relationControls : this.state.widgetList;
    const list = getRealData(
      controls.find(o => o.controlId === item.controlId),
      controls.filter(o => this.state.writeControls.map(it => it.controlId).includes(o.controlId)),
      controls,
      false,
    );
    const ids = list.map(o => o.controlId);
    this.setState({
      writeControls: this.state.writeControls.filter(o => ids.includes(o.controlId)),
    });
  };

  renderErrerDialog = () => {
    return (
      <Dialog
        title={this.state.errerDialogTitle}
        okText={_l('确定')}
        confirm="danger"
        className="errerDialogForAppoint"
        headerClass=""
        bodyClass=""
        onCancel={() => {
          this.setState({
            showErrerDialog: false,
          });
        }}
        onOk={() => {
          this.setState({
            showErrerDialog: false,
          });
        }}
        visible={this.state.showErrerDialog}
        updateTrigger="fasle"
      >
        {this.state.errerDialogTxt}
      </Dialog>
    );
  };

  renderDefCom = (item, index, writeControls, data) => {
    if (!DEF_TYPES.concat(DEF_R_TYPES).includes(data.type)) {
      return;
    }
    const { writeObject } = this.state;
    const { currentSheetInfo } = this.props;
    const SheetInfo = currentSheetInfo; // 动态默认值 =>当前主记录字段
    let advancedSetting = { ..._.omit(data.advancedSetting, ['dynamicsrc', 'defaultfunc']), defaulttype: '' };
    if (data.type === 34 && item.defsource) {
      //子表 defaulttype: '0'
      advancedSetting = { ...advancedSetting, defaulttype: '0' };
    }
    //填写本标
    return (
      <div
        className={cx('inputDef', {
          notOther: (writeObject === 1 && !DEF_R_TYPES.includes(data.type)) || data.type === 34, ////日期 成员（常规）有动态默认值 填写时间 填写人 //子表不需要支持查询工作表
        })}
      >
        <Input
          item={item}
          data={{
            ...data,
            advancedSetting: {
              ...advancedSetting,
              defsource: item.defsource,
            },
          }}
          writeObject={writeObject}
          allControls={_.get(SheetInfo, ['template', 'controls']) || []}
          onChange={(d, isOptions) => {
            const { advancedSetting = {} } = d;
            let { defsource } = advancedSetting;
            if (isOptions) {
              defsource = d;
            }
            const newCopyCells = writeControls;
            newCopyCells[index].defsource = defsource;
            this.setState({
              writeControls: newCopyCells,
              writeControlsClone: newCopyCells,
            });
          }}
          titleControl={(_.get(data, ['relationControls']) || []).find(o => o.attribute === 1)} //关联表的标题字段
          globalSheetInfo={_.pick(SheetInfo, ['appId', 'groupId', 'name', 'worksheetId', 'projectId'])}
        />
      </div>
    );
  };

  renderAppointFilters = () => {
    const dataControls = formatControlsBySectionId(
      this.state.writeObject !== 1 ? this.props.relationControls : this.state.widgetList,
    );
    const sectionIds = getSectionId(dataControls);
    //计算出有效的writeControls
    let writeControls = [];
    dataControls.map(o => {
      let data = this.state.writeControls.find(it => it.controlId === o.controlId);
      if (!!data) {
        if (!!o.sectionId) {
          writeControls.push(dataControls.find(it => it.controlId === o.sectionId));
        }
        writeControls.push(data);
      }
    });
    writeControls = _.union(writeControls, 'controlId');
    if (this.state.writeType === 1 && writeControls.length > 0) {
      return (
        <Wrap className="appointFiltersList">
          <div className="headerCon flexRow">
            <span className="Gray_75 controlname ">{_l('字段')}</span>
            <span className="Gray_75 actionListBox pLeft10">{_l('属性')}</span>
            <span className="Gray_75 Width250 InlineBlock valueDef">{_l('默认值')}</span>
          </div>
          <div className="appointList">
            {writeControls.map((item, index) => {
              const writeControlsData = _.find(dataControls, items => items.controlId === item.controlId);
              if (!writeControlsData) {
                return '';
              }
              const type = writeControlsData.type;
              const controlName = writeControlsData.controlName;
              let canNotForWrite = canNotForCustomWrite(writeControlsData);
              if (sectionIds.includes(item.controlId)) {
                return (
                  <div className="itemBox mTop10">
                    <Icon icon={getIconByType(type)} className={cx('Font14 Gray_9e mRight15')} />
                    <span className="">{controlName}</span>
                  </div>
                );
              }
              return (
                <div className="itemBox mTop10">
                  <span
                    className={cx('widget controlname Gray Font13 WordBreak overflow_ellipsis Relative', {
                      isErr: canNotForWrite,
                      isChild: !!writeControlsData.sectionId,
                    })}
                  >
                    <Icon icon={getIconByType(type)} className={cx('Font14 Gray_9e mRight15')} />
                    <span className="">{controlName || (type === 22 ? _l('分段') : _l('备注'))}</span>
                    {canNotForWrite && (
                      <Tooltip
                        tooltipClass="pointTooltip"
                        action={['click']}
                        popupPlacement="bottomRight"
                        offset={[14, 0]}
                        text={<span style={{ color: '#fff' }}>{_l('该字段不支持自定义填写')}</span>}
                      >
                        <Icon icon="error_outline" className={cx('Font14 Red mRight15 iconErr')} />
                      </Tooltip>
                    )}
                  </span>

                  <Dropdown
                    border
                    isAppendToBody
                    className="actionListBox "
                    value={item.type}
                    key={item.controlId + '_Dropdown_'}
                    // 1：只读 2：填写 3：必填
                    data={[_l('只读'), _l('填写'), _l('必填')].map((o, i) => {
                      return {
                        text: o,
                        value: i + 1,
                        disabled:
                          (this.isOnlyRead(type) && i > 0) ||
                          canNotForWrite ||
                          (([49, 21, 43].includes(type) || isRelateRecordTableControl(writeControlsData)) && i > 1), //api查询,自由连接,文本识别 屏蔽必填
                      };
                    })}
                    onChange={newValue => {
                      //OCR 只读 编辑
                      if (this.isOnlyRead(type) || ([43].includes(type) && [3].includes(newValue))) {
                        return;
                      }
                      const newCopyCells = writeControls;
                      newCopyCells[index].type = newValue;
                      this.setState({
                        writeControls: newCopyCells,
                        writeControlsClone: newCopyCells,
                      });
                    }}
                  />
                  <span className={cx('Width250 InlineBlock valueDef', {})}>
                    {this.renderDefCom(item, index, writeControls, writeControlsData)}
                  </span>

                  <Icon
                    icon="hr_delete"
                    className="Font18 editAppointFilters Hand Gray_9e mLeft8"
                    onClick={() => {
                      this.handDel(item);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </Wrap>
      );
    }
    return '';
  };

  render = () => {
    const {
      btnId,
      workflowType,
      clickType,
      writeControls,
      writeObject,
      relationControl,
      writeType,
      addRelationControlId,
      relationControls,
      setValue,
      updateRelationControl,
    } = this.props;
    const dataCon = this.state.writeObject === 1 ? this.state.widgetList : relationControls;
    return (
      <React.Fragment>
        <Dialog
          title={_l('设置填写内容%02060')}
          okText={_l('确定')}
          cancelText={_l('取消')}
          width={630}
          className={cx('appointDialog', { noOverFlow: this.state.writeType !== 1 })}
          okDisabled={
            !!(
              (this.state.writeObject === 2 && relationControl === '') ||
              (this.state.writeType === 1 && this.state.writeControls.length <= 0) ||
              (this.state.writeType === 2 && this.state.addRelationControlId === '')
            )
          }
          onCancel={() => {
            const value = {
              ...this.props,
              showAppointDialog: false,
              writeObject: writeObject,
              writeType: writeType,
              addRelationControlId: addRelationControlId,
              writeControls: writeControls,
              clickType:
                (writeObject === 2 && relationControl === '') ||
                (writeType === 1 && writeControls.length <= 0) ||
                (writeType === 2 && addRelationControlId === '')
                  ? 1
                  : clickType,
              workflowType: !btnId ? 2 : workflowType,
            };
            setValue(value);
          }}
          onOk={() => {
            if (
              (this.state.writeObject === 2 && relationControl === '') ||
              (this.state.writeType === 1 && this.state.writeControls.length <= 0) ||
              (this.state.writeType === 2 && this.state.addRelationControlId === '')
            ) {
              // alert(_l('请填写新建关联记录'));
              return;
            }
            const value = {
              ...this.state,
              showAppointDialog: false,
              writeObject: this.state.writeObject,
              writeType: this.state.writeType,
              addRelationControlId: this.state.addRelationControlId,
              writeControls: this.state.writeControls.filter(o => ![52].includes(o.type)),
              workflowType: !btnId ? 2 : workflowType,
            };
            setValue(value);
          }}
          visible={this.state.showAppointDialog}
        >
          <div className="appointCon">
            <p className="Gray_9e Font14">{_l('用户点击按钮后，立即弹出对话框并填写指定的内容')}</p>
            <p className="Gray Font13 mTop32 Bold500">{_l('填写对象%02061')}</p>
            <RadioGroup
              className="mTop10"
              data={[
                {
                  value: 1,
                  text: _l('当前记录'),
                },
                {
                  value: 2,
                  text: _l('关联记录（单条）%02062'),
                  disabled: this.props.cannotRelate,
                },
              ]}
              size="small"
              onChange={value => {
                if (value === this.state.writeObject) return;
                this.setState(
                  {
                    writeObject: value, // 对象 1：本记录 2：关联记录
                    writeControls: [], // 填写控件 type - 1：只读 2：填写 3：必填
                    addRelationControlId: '', // 新建关联记录ID
                    writeControlsClone: [],
                  },
                  () => {
                    value === 1 && updateRelationControl('');
                  },
                );
              }}
              checkedValue={this.state.writeObject}
            />
            {this.state.writeObject === 2 && (
              <div className="contectBox">
                <span className="titleLeft Font13 Gray">{_l('关联字段')}</span>
                <Dropdown
                  border
                  placeholder={_l('请选择')}
                  className="contectInput"
                  value={relationControl === '' ? undefined : relationControl}
                  data={this.state.widgetList
                    .filter(item => item.type === 29 && item.enumDefault === 1)
                    .map(item => {
                      return {
                        value: item.controlId,
                        text: item.controlName,
                        controltype: item.type,
                      };
                    })}
                  onChange={value => {
                    if (value === relationControl) return;
                    this.setState(
                      {
                        writeControls: [], // 填写控件 type - 1：只读 2：填写 3：必填
                        addRelationControlId: '', // 新建关联记录ID
                        writeControlsClone: [],
                      },
                      () => {
                        updateRelationControl(value);
                      },
                    );
                  }}
                />
              </div>
            )}
            <p className="Gray Font13 mTop32 Bold500">{_l('填写内容%02063')}</p>
            <RadioGroup
              className="mTop10"
              data={[
                {
                  value: 1,
                  text: _l('填写指定字段'),
                },
                {
                  value: 2,
                  text: _l('新建关联记录%02064'),
                  disabled: this.props.cannotRelate,
                },
              ]}
              size="small"
              onChange={value => {
                if (this.state.writeType === value) return;
                this.setState({
                  writeType: value,
                  writeControls: [], // 填写控件 type - 1：只读 2：填写 3：必填
                  addRelationControlId: '', // 新建关联记录ID
                  writeControlsClone: [],
                });
              }}
              checkedValue={this.state.writeType}
            />
            {this.renderAppointFilters()}
            {this.state.writeType === 1 && (
              <div
                className="noAppointFilter"
                onClick={() => {
                  this.setState({
                    showChooseWidgetDialog: true,
                  });
                }}
              >
                <i className="icon icon-add Font16"></i>
                {_l('选择填写字段')}
              </div>
            )}
            {this.state.showChooseWidgetDialog && (
              <ChooseWidget
                {...this.props}
                {...this.state}
                isOnlyRead={this.isOnlyRead}
                hideFn={() => {
                  this.setState({
                    showChooseWidgetDialog: false,
                  });
                }}
                SwitchFn={writeControls => {
                  this.setState({
                    writeControls,
                  });
                }}
              />
            )}
            {this.state.writeType === 2 && (
              <div className="contectBox">
                <span className="titleLeft Font13 Gray">{_l('关联字段')}</span>
                <Dropdown
                  border
                  placeholder={_l('请选择')}
                  className="contectInput"
                  value={this.state.addRelationControlId === '' ? undefined : this.state.addRelationControlId}
                  data={dataCon
                    .filter(item => item.type === 29)
                    .map(item => {
                      return {
                        value: item.controlId,
                        text: item.controlName,
                        controltype: item.type,
                      };
                    })}
                  onChange={value => {
                    this.setState({
                      addRelationControlId: value,
                    });
                  }}
                />
              </div>
            )}
          </div>
        </Dialog>
        {this.state.showErrerDialog && this.renderErrerDialog()}
      </React.Fragment>
    );
  };
}

export default AppointDialog;
