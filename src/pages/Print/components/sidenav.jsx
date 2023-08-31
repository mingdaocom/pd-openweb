import React from 'react';
import cx from 'classnames';
import { Icon, Dropdown, Tooltip, ScrollView, Checkbox, Switch } from 'ming-ui';

import Api from 'api/homeApp';
import { sortByShowControls, getVisibleControls, isVisible, isRelation } from '../util';
import {
  fromType,
  printType,
  typeForCon,
  DEFAULT_FONT_SIZE,
  MIDDLE_FONT_SIZE,
  MAX_FONT_SIZE,
  UNPRINTCONTROL,
} from '../config';

import './sidenav.less';
import moment from 'moment';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import _ from 'lodash';

let sidenavList = [
  'setting', //设置
  'control', //字段
  'workflow', //工作流
  'addition', //附加
];
class Sidenav extends React.Component {
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

  changeSysFn = (id, checked) => {
    const { printData = [], systemControl } = this.props;
    let data = systemControl.filter(control => control.controlId === id);
    let dataN = [];
    systemControl.map(it => {
      if (id !== it.controlId) {
        dataN.push(it);
      } else {
        dataN.push({
          ...data[0],
          checked: checked,
        });
      }
    });
    if (id === 'ownerid') {
      return {
        ...printData,
        ownerAccountChecked: checked,
        systemControl: dataN,
      };
    } else if (id === 'caid') {
      return {
        ...printData,
        createAccountChecked: checked,
        systemControl: dataN,
      };
    } else if (id === 'ctime') {
      return {
        ...printData,
        createTimeChecked: checked,
        systemControl: dataN,
      };
    } else if (id === 'utime') {
      return {
        ...printData,
        updateTimeChecked: checked,
        systemControl: dataN,
      };
    } else if (id === 'uaid') {
      return {
        ...printData,
        updateAccountChecked: checked,
        systemControl: dataN,
      };
    }
  };

  getRelationControlsShowPart = it => {
    const { printData = [] } = this.props;
    const { orderNumber = [] } = printData;
    let orderNumberCheck = (orderNumber.find(o => o.receiveControlId === it.controlId) || []).checked;
    if (it.checked) {
      let controls = [];
      if (it.showControls.length > 0) {
        controls = it.relationControls.filter(o => it.showControls.includes(o.controlId));
      }
      let list = controls.filter(o => o.checked);
      let isCheckPark = list.length < controls.length;
      return isCheckPark ? !!orderNumberCheck || list.length !== 0 : !orderNumberCheck;
    } else {
      return false;
    }
  };

  getIsChecked = it => {
    const { printData = [] } = this.props;
    const { orderNumber = [] } = printData;
    let orderNumberCheck = (orderNumber.find(o => o.receiveControlId === it.controlId) || []).checked;
    let controls = [];
    if (it.showControls.length > 0) {
      controls = it.relationControls.filter(o => it.showControls.includes(o.controlId));
    }
    let list = controls.filter(o => o.checked);
    return list.length >= controls.length && !!orderNumberCheck;
  };

  renderLi = (list, filterSection = true) => {
    const { handChange, printData = [], systemControl } = this.props;
    const { receiveControls = [] } = printData;
    let listData = (list || []).filter(o => !UNPRINTCONTROL.includes(o.type));

    return (
      <React.Fragment>
        {listData
          .filter(l => !l.sectionId || !filterSection)
          .map(it => {
            let isRelationControls = isRelation(it);
            let isClearselected = isRelationControls && this.getRelationControlsShowPart(it);
            let sectionLi = [];
            let isChecked = !isRelationControls ? it.checked : this.getIsChecked(it);
            if (it.type === 52) {
              sectionLi = listData.filter(l => l.sectionId === it.controlId);
              isChecked = sectionLi.every(l => l.checked);
              isClearselected = isChecked ? false : sectionLi.some(l => l.checked);
            }

            return (
              <div
                className={cx('Relative', {
                  mLeft25: !!it.sectionId,
                })}
              >
                <Checkbox
                  checked={isChecked}
                  clearselected={isClearselected}
                  key={it.controlId}
                  className="mTop12"
                  onClick={() => {
                    let printDataN = printData;
                    if (it.controlId === 'ownerid') {
                      printDataN = this.changeSysFn('ownerid', !printData.ownerAccountChecked);
                      handChange(printDataN);
                    } else if (it.controlId === 'caid') {
                      printDataN = this.changeSysFn('caid', !printData.createAccountChecked);
                      handChange(printDataN);
                    } else if (it.controlId === 'ctime') {
                      printDataN = this.changeSysFn('ctime', !printData.createTimeChecked);
                      handChange(printDataN);
                    } else if (it.controlId === 'utime') {
                      printDataN = this.changeSysFn('utime', !printData.updateTimeChecked);
                      handChange(printDataN);
                    } else if (it.controlId === 'uaid') {
                      printDataN = this.changeSysFn('uaid', !printData.updateAccountChecked);
                      handChange(printDataN);
                    } else {
                      this.setData(it, 'checked', isRelationControls);
                    }
                  }}
                  text={it.controlName || _l('未命名')}
                />
                {(isRelationControls || it.type === 52) && (
                  <div className={it.type === 52 ? '' : 'mLeft24'}>
                    <Icon
                      icon={it.expand ? 'expand_less' : 'expand_more'}
                      className="Font18 moreList Hand TxtCenter TxtBottom"
                      onClick={() => {
                        this.setData(it, 'expand');
                      }}
                    />
                    {it.expand && isRelationControls && this.renderLirelation(it)}
                    {it.expand && it.type === 52 && (
                      <div className="Relative sectionLiCon">{this.renderLi(sectionLi, false)}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </React.Fragment>
    );
  };

  renderLirelation = list => {
    const { handChange, printData = [] } = this.props;
    const { receiveControls = [], orderNumber = [], relations = [] } = printData;
    let controls = [];
    if (list.showControls.length > 0) {
      controls = getVisibleControls(sortByShowControls(list));
      let relationsList = list.relationsData || {};
      //controls type数据以relations为准
      controls = controls.map(it => {
        let { template = [] } = relationsList;
        let { controls = [] } = template;
        if (controls.length > 0) {
          let data = controls.find(o => o.controlId === it.controlId) || {};
          let { sourceControlType } = data;
          return {
            ...it,
            sourceControlType,
          };
        } else {
          return it;
        }
      });
    }
    //关联表富文本不不显示 分割线 ,OCR ,条码不显示
    controls = controls.filter(
      it => ![...UNPRINTCONTROL, 41, 22, 47].includes(it.type) && !(it.type === 30 && it.sourceControlType === 41),
    );
    let orderNumberList = orderNumber.find(it => it.receiveControlId === list.controlId) || [];
    return (
      <React.Fragment>
        <Checkbox
          checked={orderNumberList.checked}
          key={`${orderNumberList.receiveControlId}-0`}
          className="mTop12"
          onClick={() => {
            handChange({
              ...this.setReceiveControls(list, !orderNumberList.checked),
              orderNumber: orderNumber.map(it => {
                if (it.receiveControlId === list.controlId) {
                  return { ...it, checked: !it.checked };
                } else {
                  return it;
                }
              }),
            });
          }}
          text={_l('序号')}
        />
        {controls.map(it => {
          return (
            <Checkbox
              checked={it.checked}
              key={it.controlId}
              className="mTop12"
              onClick={() => {
                let dataOther = [];
                let dataOtherRelation = [];
                let datarelation = controls.filter(control => control.controlId === it.controlId);
                let isChecked = false;
                controls.map(item => {
                  if (item.controlId === it.controlId) {
                    dataOtherRelation.push({
                      ...datarelation[0],
                      checked: !it.checked,
                    });
                    if (!it.checked) {
                      isChecked = !it.checked;
                    }
                  } else {
                    dataOtherRelation.push(item);
                    if (item.checked) {
                      isChecked = item.checked;
                    }
                  }
                  if (orderNumberList.checked) {
                    isChecked = orderNumberList.checked;
                  }
                });
                receiveControls.map(item => {
                  if (item.controlId === list.controlId) {
                    dataOther.push({
                      ...list,
                      checked: isChecked,
                      relationControls: dataOtherRelation,
                    });
                  } else {
                    dataOther.push(item);
                  }
                });
                handChange({
                  ...printData,
                  receiveControls: dataOther,
                });
              }}
              text={it.controlName || _l('未命名')}
            />
          );
        })}
      </React.Fragment>
    );
  };

  toggleWorkflowCheckItem(key) {
    const { handChange, printData = [], systemControl } = this.props;
    const { workflow = [] } = printData;
    const newWorkflow = workflow.map(item => {
      if (item.flowNode.id === key) {
        item.checked = !item.checked;
      }
      return item;
    });
    handChange({
      ...printData,
      workflow: newWorkflow,
    });
  }

  toggleApprovalCheckItem(index, childIndex = undefined) {
    const { handChange, printData = [], systemControl } = this.props;
    const { approval = [] } = printData;
    const newApproval = approval.map((item, i) => {
      if (childIndex === undefined && i === index) {
        let _checked = !item.checked;
        item.checked = _checked;
        item.child.forEach(childData => {
          childData.checked = _checked;
        });
      } else if (childIndex !== undefined && i === index) {
        item.child = item.child.map((l, m) => {
          if (m === childIndex) {
            l.checked = !l.checked;
          }
          return l;
        });
        item.checked = item.child.every(l => l.checked === true);
      }
      return item;
    });
    handChange({
      ...printData,
      approval: newApproval,
    });
  }

  renderWorkflow() {
    const { handChange, printData = [], systemControl } = this.props;
    const { workflow = [] } = printData;
    if (workflow.length <= 0 || this.state.closeList.includes('workflow')) {
      return '';
    }
    return (
      <div className="controlOption mBottom32">
        {workflow.map(item => (
          <Checkbox
            checked={item.checked}
            key={item.flowNode.id}
            className="mTop12"
            onClick={() => {
              this.toggleWorkflowCheckItem(item.flowNode.id);
            }}
            text={item.flowNode.name}
          />
        ))}
      </div>
    );
  }

  renderApproval() {
    const { openApprovalList } = this.state;
    const { printData, handChange } = this.props;
    const { approval = [] } = printData;
    if (approval.length <= 0 || this.state.closeList.includes('workflow')) {
      return '';
    }

    return (
      <React.Fragment>
        {approval.map((item, index) => {
          return (
            <div className="approvalItem">
              <div className="approvalItem1Con">
                <Checkbox
                  checked={item.checked}
                  key={item.processId}
                  className="approvalItem1ConCheck"
                  onClick={() => {
                    this.toggleApprovalCheckItem(index);
                  }}
                  text={item.name}
                />
                <Icon
                  icon={openApprovalList.find(l => l === item.processId) ? 'expand_less' : 'expand_more'}
                  className="Font18 expand Hand TxtCenter Gray_9e"
                  onClick={() => {
                    if (item.child.length < 2) return;
                    if (openApprovalList.find(l => l === item.processId)) {
                      this.setState({
                        openApprovalList: openApprovalList.filter(l => l !== item.processId),
                      });
                    } else {
                      this.setState({
                        openApprovalList: openApprovalList.concat(item.processId),
                      });
                    }
                  }}
                />
              </div>
              {item.child.length > 0 && !openApprovalList.find(l => l === item.processId) && (
                <React.Fragment>
                  {item.child.map((l, i) => (
                    <div className="approvalItem2Con">
                      <Checkbox
                        checked={l.checked}
                        key={l.id}
                        className="approvalItem2ConCheck"
                        onClick={() => {
                          this.toggleApprovalCheckItem(index, i);
                        }}
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

  setData = (o, key, isRelationControls) => {
    const { printData = [], handChange } = this.props;
    const { receiveControls = [], workflow = [], orderNumber = [] } = printData;
    let data = receiveControls.filter(control => control.controlId === o.controlId);
    let dataOther = [];
    let isCheck;
    let isSection = o.type === 52 && key === 'checked';
    receiveControls.map(item => {
      if (item.controlId === o.controlId) {
        if (!isRelationControls) {
          dataOther.push({
            ...data[0],
            [key]: !o[key],
          });
        } else {
          isCheck = this.getIsChecked(o);
          dataOther.push({
            ...data[0],
            [key]: key === 'checked' ? !isCheck : !o[key],
            relationControls: o.relationControls.map(it => {
              it[key] = key === 'checked' ? !isCheck : !o[key];
              return it;
            }),
          });
        }
      } else {
        let _item = { ...item };
        if (isSection && item.sectionId === o.controlId) {
          _item.checked = !item.checked;
        }
        dataOther.push(_item);
      }
    });
    let list = {
      ...printData,
      receiveControls: dataOther,
    };
    if (key === 'checked' && isRelationControls) {
      list = {
        ...list,
        orderNumber: orderNumber.map(it => {
          if (it.receiveControlId === o.controlId) {
            return { ...it, checked: !isCheck };
          } else {
            return it;
          }
        }),
      };
    }

    handChange(list);
  };

  setReceiveControls = (o, checked) => {
    const { printData = [] } = this.props;
    let isChecked = false;
    if (checked) {
      isChecked = checked;
    }
    let controls = [];
    if (o.showControls.length > 0) {
      controls = o.relationControls.filter(it => o.showControls.includes(it.controlId));
    }
    if (controls.map(o => o.checked).includes(true)) {
      isChecked = true;
    }
    const { receiveControls = [] } = printData;
    let data = receiveControls.filter(control => control.controlId === o.controlId);
    let dataOther = [];
    receiveControls.map(item => {
      if (item.controlId === o.controlId) {
        dataOther.push({
          ...data[0],
          checked: isChecked,
        });
      } else {
        dataOther.push(item);
      }
    });
    let list = {
      ...printData,
      receiveControls: dataOther,
    };
    return list;
  };
  //全选/取消
  checkAll = isReceiveControls => {
    const { receiveControlsCheckAll, workflowCheckAll } = this.state;
    const { handChange, printData } = this.props;
    const { receiveControls = [], workflow = [], systemControl = [], orderNumber = [] } = printData;
    if (isReceiveControls) {
      handChange({
        ...printData,
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
        orderNumber: orderNumber.map(it => {
          return {
            ...it,
            checked: !receiveControlsCheckAll,
          };
        }),
      });
      this.setState({
        receiveControlsCheckAll: !receiveControlsCheckAll,
      });
    } else {
      handChange({
        ...printData,
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
    let { closeList } = this.state;
    let i = closeList.indexOf(str);
    if (i >= 0) {
      closeList.splice(i, 1);
    } else {
      closeList = closeList.concat(str);
    }
    this.setState({
      closeList,
    });
  };

  renderCheckboxCon = (key, text, tip) => {
    const { printData, handChange } = this.props;
    return (
      <div className="mTop15">
        <Checkbox
          checked={printData[key]}
          className="InlineBlock"
          onClick={() => {
            handChange({
              ...printData,
              [key]: !printData[key],
            });
          }}
          text={text}
        />
        <Tooltip popupPlacement="right" text={<span>{tip}</span>}>
          <div className="Gray_9e help InlineBlock TxtTop mLeft5">
            <Icon icon="help" className="Font14" />
          </div>
        </Tooltip>
      </div>
    );
  };

  renderBtnSetting = () => {
    return (
      <React.Fragment>
        {this.renderCheckboxCon(
          'printOption',
          _l('打印未选中的项'),
          _l('开启后，平铺类型的选项字段会打印没有选中的选项'),
        )}
        {this.renderCheckboxCon('showData', _l('打印空字段'), _l('开启后，没有内容的字段会显示并可以打印'))}
      </React.Fragment>
    );
  };
  renderDrop = () => {
    const { printData, handChange } = this.props;
    return (
      <div className="TxtTop">
        <span className="TxtMiddle">{_l('文字大小')}</span>
        <Dropdown
          className="forSizeText mLeft12"
          value={printData.font || DEFAULT_FONT_SIZE}
          onChange={value => {
            handChange({
              ...printData,
              font: value,
            });
          }}
          data={[
            { text: _l('标准'), value: DEFAULT_FONT_SIZE },
            { text: _l('中'), value: MIDDLE_FONT_SIZE },
            { text: _l('大'), value: MAX_FONT_SIZE },
          ]}
        />
      </div>
    );
  };

  render() {
    const {
      handChange,
      params,
      printData,
      systemControl,
      controls = [],
      signature = [],
      saveTem,
      sheetSwitchPermit,
    } = this.props;
    const { printId, type, from, printType, isDefault, viewId } = params;
    const { receiveControls = [], workflow = [], shareType = 0, approval = [] } = printData;
    const { receiveControlsCheckAll, workflowCheckAll, closeList = [] } = this.state;
    return (
      <div className="sidenavBox flexRow">
        <div className="conBox">
          {((type !== typeForCon.PREVIEW && from === fromType.FORMSET) ||
            (type === typeForCon.NEW && from !== fromType.FORMSET)) && (
            <React.Fragment>
              <div className="plate">
                <div className="plate controlPlate">
                  <div className="caption">
                    <span className="headline">{_l('设置')}</span>
                    <span className="iconBox">
                      <Icon
                        icon={closeList.includes('setting') ? 'expand_less' : 'expand_more'}
                        className="Font18 expand Hand TxtCenter"
                        onClick={() => {
                          this.changeCloseList('setting');
                        }}
                      />
                    </span>
                  </div>
                  {!closeList.includes('setting') && (
                    <div className="mTop20">
                      {this.renderDrop()}
                      {this.renderBtnSetting()}
                    </div>
                  )}
                </div>
              </div>
              <div className="lineBox"></div>
            </React.Fragment>
          )}
          <div className="plate controlPlate">
            <div className="caption">
              <span className="headline">{_l('字段')}</span>
              <span
                className="Right Hand Gray_9e chooseBtn"
                onClick={() => {
                  this.checkAll(true);
                }}
              >
                {!receiveControlsCheckAll ? _l('全选') : _l('取消全选')}
              </span>
              <span className="iconBox">
                <Icon
                  icon={closeList.includes('control') ? 'expand_less' : 'expand_more'}
                  className="Font18 expand Hand TxtCenter"
                  onClick={() => {
                    this.changeCloseList('control');
                  }}
                />
              </span>
            </div>
            {!closeList.includes('control') && (
              <React.Fragment>
                <p className="Bold mTop15 Gray_9e">{_l('系统字段')}</p>
                {this.renderLi(systemControl)}
                <p className="mTop20 Bold Gray_9e">{_l('表单字段')}</p>
                {this.renderLi(getVisibleControls(controls))}
                {signature.length > 0 && <p className="mTop20 Bold Gray_9e">{_l('手写签名')}</p>}
                {this.renderLi(signature)}
              </React.Fragment>
            )}
          </div>
          <div className="lineBox"></div>
          {isOpenPermit(permitList.approveDetailsSwitch, sheetSwitchPermit, viewId) && approval.length > 0 && (
            <React.Fragment>
              <div className="plate pBottom20">
                <p className="headline Bold">{_l('审批')}</p>
                {this.renderApproval()}
              </div>
            </React.Fragment>
          )}
          {workflow.length > 0 && (
            <React.Fragment>
              <div className="plate">
                <div className="caption">
                  <span className="headline">{_l('流程节点')}</span>
                  <span
                    className="Right Hand Gray_9e chooseBtn"
                    onClick={() => {
                      this.checkAll();
                    }}
                  >
                    {!workflowCheckAll ? _l('全选') : _l('取消全选')}
                  </span>
                  <span className="iconBox">
                    <Icon
                      icon={closeList.includes('workflow') ? 'expand_less' : 'expand_more'}
                      className="Font18 expand Hand TxtCenter"
                      onClick={() => {
                        this.changeCloseList('workflow');
                      }}
                    />
                  </span>
                </div>
                {!closeList.includes('workflow') && this.renderWorkflow()}
              </div>
              <div className="lineBox"></div>
            </React.Fragment>
          )}
          <div className="plate pBottom20">
            <div className="caption">
              <span className="headline">{_l('附加信息')}</span>
              <span className="iconBox">
                <Icon
                  icon={closeList.includes('addition') ? 'expand_less' : 'expand_more'}
                  className="Font18 expand Hand TxtCenter"
                  onClick={() => {
                    this.changeCloseList('addition');
                  }}
                />
              </span>
            </div>
            {!closeList.includes('addition') && (
              <React.Fragment>
                <Checkbox
                  checked={printData.formNameChecked}
                  className="mTop12"
                  onClick={() => {
                    handChange({
                      ...printData,
                      formNameChecked: !printData.formNameChecked,
                    });
                  }}
                  text={_l('表单名称')}
                />
                {printData.formNameChecked && (
                  <input
                    type="text"
                    value={printData.formName}
                    onChange={e => {
                      handChange({
                        ...printData,
                        formName: e.target.value,
                      });
                    }}
                  />
                )}
                <Checkbox
                  checked={printData.companyNameChecked}
                  className="mTop12"
                  onClick={() => {
                    handChange({
                      ...printData,
                      companyNameChecked: !printData.companyNameChecked,
                    });
                  }}
                  text={_l('公司名称')}
                />
                <Checkbox
                  checked={printData.logoChecked}
                  className="mTop12"
                  onClick={() => {
                    handChange({
                      ...printData,
                      logoChecked: !printData.logoChecked,
                    });
                  }}
                  text={
                    <span>
                      {_l('企业Logo')}
                      <Tooltip popupPlacement="top" text={<span>{_l('在企业管理后台中设置')}</span>}>
                        <Icon icon="help" className="Font13 mLeft8 Gray_bd" />
                      </Tooltip>
                    </span>
                  }
                />
                <Checkbox
                  checked={printData.qrCode}
                  className="mTop12"
                  onClick={() => {
                    handChange({
                      ...printData,
                      qrCode: !printData.qrCode,
                    });
                  }}
                  text={_l('二维码')}
                />
                {printData.qrCode && (
                  <Dropdown
                    className="forSizeText forQrCode"
                    value={shareType}
                    onChange={value => {
                      handChange({
                        ...printData,
                        shareType: value,
                      });
                    }}
                    data={[
                      { text: _l('对外公开分享链接'), value: 0 },
                      { text: _l('内部成员访问链接'), value: 1 },
                    ].filter(o => !md.global.Account.isPortal || (md.global.Account.isPortal && o.value !== 1))} //外部门户没有内部成员访问链接
                  />
                )}
                <Checkbox
                  checked={printData.titleChecked}
                  className="mTop12"
                  onClick={() => {
                    handChange({
                      ...printData,
                      titleChecked: !printData.titleChecked,
                    });
                  }}
                  text={_l('记录标题')}
                />
                <Checkbox
                  checked={printData.printTime}
                  className="mTop12 mBottom20"
                  onClick={() => {
                    handChange({
                      ...printData,
                      printTime: !printData.printTime,
                    });
                  }}
                  text={_l('打印时间')}
                />
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Sidenav;
