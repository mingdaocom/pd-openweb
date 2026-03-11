import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Checkbox, Dropdown, Icon } from 'ming-ui';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { APPROVAL_POSITION_OPTION, DEFAULT_FONT_SIZE, fromType, typeForCon } from '../../config';
import { isRelation, isVisible } from '../../util';
import AdditionSetting from './AdditionSetting';
import BasicsSetting from './BasicsSetting';
import ControlsSetting from './ControlsSetting';
import './index.less';

const Setting = [
  {
    label: _l('字段设置'),
    key: 'setting',
    hasCheckAll: false,
    hasExpend: true,
  },
  {
    label: _l('选择打印字段'),
    key: 'control',
    hasCheckAll: true,
    hasExpend: true,
    checkAllKey: 'receiveControlsCheckAll',
  },
  {
    label: _l('审批'),
    key: 'approve',
    hasCheckAll: false,
    hasExpend: false,
  },
  {
    label: _l('流程节点'),
    key: 'workflow',
    hasCheckAll: true,
    hasExpend: true,
    checkAllKey: 'workflowCheckAll',
  },
  {
    label: _l('附加信息'),
    key: 'addition',
    hasCheckAll: false,
    hasExpend: true,
  },
];

class SideNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      isUserAdmin: false,
      receiveControlsCheckAll: false,
      workflowCheckAll: true,
      closeList: [],
      openApprovalList: [],
    };
  }

  getIsChecked = it => {
    const { printData = [] } = this.props;
    const { orderNumber = [] } = printData;
    let orderNumberCheck = (orderNumber.find(o => o.receiveControlId === it.controlId) || []).checked;
    let controls =
      it.showControls.length > 0 ? it.relationControls.filter(o => it.showControls.includes(o.controlId)) : [];
    let list = controls.filter(o => o.checked);

    return list.length >= controls.length && !!orderNumberCheck;
  };

  toggleWorkflowCheckItem(key) {
    const { handChange, printData = [] } = this.props;
    const { workflow = [] } = printData;
    const newWorkflow = workflow.map(item => {
      if (item.flowNode.id === key) {
        item.checked = !item.checked;
      }

      return item;
    });

    handChange({
      workflow: newWorkflow,
    });
  }

  toggleApprovalCheckItem(index, childIndex = undefined) {
    const { handChange, printData = [] } = this.props;
    const { approval = [] } = printData;
    const newApproval = approval.map((item, i) => {
      if (i === index) {
        if (childIndex === undefined) {
          item.checked = !item.checked;
          item.child &&
            item.child.forEach(childData => {
              childData.checked = item.checked;
            });
        } else {
          item.child.forEach((l, m) => {
            if (m === childIndex) l.checked = !l.checked;
          });

          item.checked = item.child.every(l => l.checked);
        }
      }

      return item;
    });

    handChange({
      approval: newApproval,
    });
  }

  renderWorkflow() {
    const { printData = [] } = this.props;
    const { workflow = [] } = printData;

    if (workflow.length <= 0) {
      return null;
    }

    return (
      <div className="controlOption mBottom32">
        {workflow.map(item => (
          <Checkbox
            checked={item.checked}
            key={item.flowNode.id}
            className="mTop12"
            onClick={() => this.toggleWorkflowCheckItem(item.flowNode.id)}
            text={item.flowNode.name}
          />
        ))}
      </div>
    );
  }

  renderApproval() {
    const { openApprovalList } = this.state;
    const { printData } = this.props;
    const { approval = [] } = printData;

    if (!approval.length) {
      return null;
    }

    return (
      <React.Fragment>
        {approval.map((item, index) => {
          const isOpen = !!openApprovalList.find(l => l === item.processId);

          return (
            <div className="approvalItem" key={`printSideNav-approvalItem-${item.processId}`}>
              <div className="approvalItem1Con">
                <Checkbox
                  checked={item.checked}
                  className="approvalItem1ConCheck"
                  onClick={() => this.toggleApprovalCheckItem(index)}
                  text={item.name}
                />
                {item.child && item.child.length > 1 && (
                  <Icon
                    icon={isOpen ? 'expand_less' : 'expand_more'}
                    className="Font18 expand Hand TxtCenter Gray_9e"
                    onClick={() =>
                      this.setState({
                        openApprovalList: isOpen
                          ? openApprovalList.filter(l => l !== item.processId)
                          : openApprovalList.concat(item.processId),
                      })
                    }
                  />
                )}
              </div>
              {item.child && item.child.length > 0 && !isOpen && (
                <React.Fragment>
                  {item.child.map((l, i) => (
                    <div className="approvalItem2Con" key={`printSideNav-approvalItem-${item.processId}-${l.id}`}>
                      <Checkbox
                        checked={l.checked}
                        className="approvalItem2ConCheck"
                        onClick={() => this.toggleApprovalCheckItem(index, i)}
                        text={`${moment(l.createDate).format('YYYY.MM.DD HH:mm:ss')}发起`}
                      />
                    </div>
                  ))}
                </React.Fragment>
              )}
            </div>
          );
        })}
      </React.Fragment>
    );
  }

  updateOrderNumber({ orderIds, checkAll = false, value }) {
    const { printData = [] } = this.props;
    const { orderNumber = [] } = printData;

    return orderNumber.map(it => {
      return {
        ...it,
        checked: checkAll ? value : orderIds.includes(it.receiveControlId) ? !it.checked : it.checked,
      };
    });
  }

  setData = (o, key, isRelationControls) => {
    const { printData = [], handChange } = this.props;
    const { receiveControls = [] } = printData;
    let dataOther = [];
    let isCheck;
    let sectionOrder = [];

    receiveControls.map(item => {
      if (item.controlId === o.controlId) {
        if (isRelationControls) {
          isCheck = this.getIsChecked(o);
        }

        dataOther.push({
          ...item,
          [key]: key === 'checked' && isRelationControls ? !isCheck : !o[key],
          relationControls: !isRelationControls
            ? item.relationControls
            : o.relationControls.map(it => {
                it[key] = key === 'checked' ? !isCheck : !o[key];
                return it;
              }),
        });
        return;
      }

      if (o.type === 52 && key === 'checked' && item.sectionId === o.controlId) {
        let _item = { ...item };
        _item.checked = !item.checked;

        if (isRelation(item)) {
          sectionOrder.push(item.controlId);
          this.setData(item, 'checked', true);
        }

        dataOther.push(_item);
        return;
      }

      dataOther.push(item);
    });

    if (key === 'checked' && o.sectionId) {
      const sectionItems = dataOther.filter(l => l.sectionId === o.sectionId);
      const index = _.findIndex(dataOther, l => l.controlId === o.sectionId);
      dataOther[index].checked = _.some(sectionItems, l => l.checked);
    }

    let list = {
      receiveControls: dataOther,
    };

    if (key === 'checked' && (isRelationControls || sectionOrder.length)) {
      list.orderNumber = this.updateOrderNumber({ orderIds: _.uniq(sectionOrder.concat(o.controlId)) });
    }

    handChange(list);
  };

  setReceiveControls = (o, checked) => {
    const { printData = [] } = this.props;
    const { receiveControls = [] } = printData;

    let isChecked = checked;
    const controls =
      o.showControls.length > 0 ? o.relationControls.filter(it => o.showControls.includes(it.controlId)) : [];

    if (controls.map(o => o.checked).includes(true)) {
      isChecked = true;
    }

    return receiveControls.map(item => {
      return {
        ...item,
        checked: item.controlId === o.controlId ? isChecked : item.checked,
      };
    });
  };

  //全选/取消
  checkAll = isReceiveControls => {
    const { receiveControlsCheckAll, workflowCheckAll } = this.state;
    const { handChange, printData } = this.props;
    const { receiveControls = [], workflow = [], systemControl = [] } = printData;

    if (isReceiveControls) {
      handChange({
        receiveControls: receiveControls.map(it => {
          it.checked = isVisible(it) && !receiveControlsCheckAll;

          if (isRelation(it)) {
            it.relationControls.map(a => {
              a.checked = isVisible(a) && !receiveControlsCheckAll;
              return a;
            });
          }

          return it;
        }),
        systemControl: systemControl.map(it => {
          it.checked = !receiveControlsCheckAll;
          return it;
        }),
        ownerAccountChecked: !receiveControlsCheckAll,
        createAccountChecked: !receiveControlsCheckAll,
        createTimeChecked: !receiveControlsCheckAll,
        updateTimeChecked: !receiveControlsCheckAll,
        updateAccountChecked: !receiveControlsCheckAll,
        orderNumber: this.updateOrderNumber({ checkAll: true, value: !receiveControlsCheckAll }),
      });
      this.setState({
        receiveControlsCheckAll: !receiveControlsCheckAll,
      });
    } else {
      handChange({
        workflow: workflow.map(it => {
          it.checked = !workflowCheckAll;
          return it;
        }),
      });
      this.setState({
        workflowCheckAll: !workflowCheckAll,
      });
    }
  };

  changeCloseList = str => {
    const { closeList } = this.state;

    this.setState({
      closeList: closeList.includes(str) ? closeList.filter(l => l !== str) : closeList.concat(str),
    });
  };

  changeAdvanceSettings = value => {
    const { printData, handChange } = this.props;
    let newValue = _.cloneDeep(printData.advanceSettings);
    const keyIndex = _.findIndex(newValue, l => l.key === value.key);

    if (keyIndex > -1) {
      newValue[keyIndex] = value;
    } else {
      newValue.push(value);
    }

    handChange({
      advanceSettings: newValue,
    });
  };

  isShowSetting = key => {
    const { params, printData, sheetSwitchPermit } = this.props;
    const { type, from, viewId } = params;
    const { workflow = [], approval = [] } = printData;

    switch (key) {
      case 'setting':
        return (
          (type !== typeForCon.PREVIEW && from === fromType.FORM_SET) ||
          (type === typeForCon.NEW && from !== fromType.FORM_SET)
        );
      case 'approve':
        return isOpenPermit(permitList.approveDetailsSwitch, sheetSwitchPermit, viewId) && approval.length > 0;
      case 'workflow':
        return workflow.length > 0;
      default:
        return true;
    }
  };

  renderContentBox = key => {
    const { handChange, params, printData, systemControl, controls = [], signature = [] } = this.props;
    const { closeList = [] } = this.state;
    const hide = closeList.includes(key);

    switch (key) {
      case 'setting':
        return (
          <BasicsSetting
            hide={hide}
            params={params}
            printData={{
              printOption: printData.printOption,
              showData: printData.showData,
              allowDownloadPermission: printData.allowDownloadPermission,
            }}
            printFont={printData.font || DEFAULT_FONT_SIZE}
            nameWidth={(_.find(printData.advanceSettings, l => l.key === 'nameWidth') || {}).value}
            changeAdvanceSettings={this.changeAdvanceSettings}
            handChange={handChange}
          />
        );
      case 'control':
        return (
          <ControlsSetting
            hide={hide}
            signature={signature}
            systemControl={systemControl}
            controls={controls}
            printData={printData}
            handChange={handChange}
            setReceiveControls={this.setReceiveControls}
            setData={this.setData}
            getIsChecked={this.getIsChecked}
            changeAdvanceSettings={this.changeAdvanceSettings}
          />
        );
      case 'approve':
        return this.renderApproval();
      case 'workflow':
        return !hide && this.renderWorkflow();
      case 'addition':
        const formNameSite = ((printData.advanceSettings || []).find(l => l.key === 'formNameSite') || {}).value || '0';
        return (
          <AdditionSetting
            hide={hide}
            handChange={handChange}
            formNameSite={formNameSite}
            shareType={printData.shareType || 0}
            printData={{
              formNameChecked: printData.formNameChecked,
              formName: printData.formName,
              companyNameChecked: printData.companyNameChecked,
              logoChecked: printData.logoChecked,
              qrCode: printData.qrCode,
              titleChecked: printData.titleChecked,
              printTime: printData.printTime,
              printAccount: printData.printAccount,
              advanceSettings: printData.advanceSettings,
            }}
            changeAdvanceSettings={this.changeAdvanceSettings}
          />
        );
    }
  };

  render() {
    const { handChange, printData } = this.props;
    const { approvePosition = 0 } = printData;
    const { closeList = [] } = this.state;
    const settings = Setting.filter(l => this.isShowSetting(l.key));

    return (
      <div className="sidenavBox flexRow">
        <div className="conBox">
          {settings.map((plateItem, plateIndex) => {
            return (
              <React.Fragment key={`sidenavBox-plate-${plateItem.key}`}>
                <div className="plate controlPlate">
                  <div className="caption">
                    <span className="headline">{plateItem.label}</span>
                    {plateItem.hasCheckAll && (
                      <span
                        className="Right Hand Gray_9e chooseBtn"
                        onClick={() => this.checkAll(plateItem.key === 'control')}
                      >
                        {!this.state[plateItem.checkAllKey] ? _l('全选') : _l('取消全选')}
                      </span>
                    )}
                    {plateItem.hasExpend && (
                      <span className="iconBox">
                        <Icon
                          icon={closeList.includes(plateItem.key) ? 'expand_less' : 'expand_more'}
                          className="Font18 expand Hand TxtCenter"
                          onClick={() => this.changeCloseList(plateItem.key)}
                        />
                      </span>
                    )}
                  </div>
                </div>
                {this.renderContentBox(plateItem.key)}
                {['approve', 'workflow'].includes(plateItem.key) && (
                  <React.Fragment>
                    <p className="mTop24 mBottom10">{_l('审批签名位置')}</p>
                    <Dropdown
                      className="w100"
                      border
                      value={approvePosition}
                      data={APPROVAL_POSITION_OPTION}
                      onChange={value =>
                        handChange({
                          approvePosition: value,
                        })
                      }
                    />
                  </React.Fragment>
                )}
                {plateIndex !== settings.length - 1 && <div className="lineBox"></div>}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }
}

export default SideNav;
