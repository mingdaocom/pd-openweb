import React from 'react';
import sheetAjax from 'src/api/worksheet';
import { renderCellText } from 'worksheet/components/CellControls';
import './content.less';
import cx from 'classnames';
import { getPrintContent, sortByShowControls, getVisibleControls, isRelation } from '../util';
import TableRelation from './relationTable';
import { ScrollView } from 'ming-ui';
import {
  TYPE_ACTION,
  TRIGGER_ACTION,
  OPERATION_LOG_ACTION,
  fromType,
  printType,
  typeForCon,
  DEFAULT_FONT_SIZE,
  UNPRINTCONTROL,
} from '../config';
import { putControlByOrder, replaceHalfWithSizeControls } from 'src/pages/widgetConfig/util';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import { SYSTOPRINTTXT } from '../config';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import _ from 'lodash';

export default class Con extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      shareUrl: '',
    };
  }
  componentDidMount() {
    this.loadWorksheetShortUrl();
    const { printData } = this.props;
    $('.ant-table').css({
      fontSize: printData.font || DEFAULT_FONT_SIZE,
    });
  }
  componentDidUpdate() {
    const { printData } = this.props;
    $('.ant-table').css({
      fontSize: printData.font || DEFAULT_FONT_SIZE,
    });
  }
  componentWillReceiveProps(nextProps, nextState) {
    if (_.get(this.props, ['printData', 'shareType']) !== _.get(nextProps, ['printData', 'shareType'])) {
      this.loadWorksheetShortUrl(nextProps);
    }
  }
  loadWorksheetShortUrl = props => {
    let { appId, worksheetId, viewId, rowId, printId, type, from, printType, isDefault, projectId } = this.props.params;
    const { printData } = props || this.props;
    const { shareType = 0, rowIdForQr } = printData;
    // shareType 0 普通=>记录分享 1 对内=>记录详情
    if (shareType === 0) {
      sheetAjax
        .getWorksheetShareUrl({
          worksheetId,
          appId,
          viewId,
          rowId: rowId || rowIdForQr,
          objectType: 2,
        })
        .then(shareUrl => {
          let url = shareUrl;
          if (
            from === fromType.PRINT &&
            type === typeForCon.PREVIEW &&
            isDefault &&
            printId &&
            printType === 'worksheet'
          ) {
            url = shareUrl.replace(/worksheetshare/, 'printshare');
            url = `${url}&&${printId}&&${projectId}`;
          }
          this.setState({
            shareUrl: `${__api_server__.main}code/CreateQrCodeImage?url=${encodeURIComponent(url)}`,
          });
        });
    } else {
      viewId = !viewId ? undefined : viewId;
      let url = `${location.origin}${window.subPath || ''}/app/${appId}/${worksheetId}/${viewId}/row/${
        rowId || rowIdForQr
      }`;
      this.setState({
        shareUrl: `${__api_server__.main}code/CreateQrCodeImage?url=${encodeURIComponent(url)}`,
      });
    }
  };

  renderControls() {
    const { params, printData, controls = [] } = this.props;
    let { appId, worksheetId, viewId, rowId, type, from } = this.props.params;
    const { showData, printOption, rowIdForQr } = printData;
    let dataInfo = {
      recordId: rowId || rowIdForQr,
      appId,
      worksheetId,
      viewIdForPermit: viewId,
      controls,
    };
    const controlData = putControlByOrder(
      replaceHalfWithSizeControls(getVisibleControls(controls).filter(o => !UNPRINTCONTROL.includes(o.type))),
    );
    let isHideNull = !showData && !(from === fromType.FORMSET && type !== typeForCon.PREVIEW);
    return (
      <div className="listControls mTop18" style={{ fontSize: printData.font || DEFAULT_FONT_SIZE }}>
        {Object.keys(controlData).map(key => {
          const item = controlData[key];
          //一行一个控件的显示
          if (item.length === 1) {
            //是否空值隐藏
            if (isHideNull) {
              if ([41, 10010, 14, 42].includes(item[0].type) && !item[0].value) {
                //富文本、备注、附件、签名，是否空值隐藏
                return '';
              }
              if ([29, 34].includes(item[0].type)) {
                //关联表,子表，是否空值隐藏
                let records = [];
                try {
                  records = JSON.parse(item[0].value);
                } catch (err) {}
                if (records.length <= 0) {
                  return '';
                }
              }
            }
            if (
              (!this.isShow(
                getPrintContent({ ...item[0], showData: isHideNull, noUnit: true, ...dataInfo }),
                item[0].checked,
              ) &&
                item[0].type !== 22) ||
              (item[0].type === 22 && !item[0].checked)
            ) {
              return '';
            }
            let isRelationControls = isRelation(item[0]);
            //关联表多行列表/子表打印
            if (isRelationControls) {
              return this.renderRelations(item[0]);
            }
            return (
              <div className={cx('controlDiv', { splitLine: item[0].type === 22, remark: item[0].type === 10010 })}>
                <div>
                  {/* 备注字段无标题 */}
                  {item[0].type !== 10010 && <span className="title">{item[0].controlName}</span>}
                  {/* 分段不计算value 走特殊显示方式 */}
                  {item[0].type !== 22 && (
                    <span className={cx('value', { value2: item[0].type === 2 })}>
                      {getPrintContent({ ...item[0], showUnit: true, showData: isHideNull, printOption, ...dataInfo })}
                    </span>
                  )}
                </div>
              </div>
            );
          } else {
            //一行多个控件的显示
            let data = item.filter(it =>
              this.isShow(getPrintContent({ ...it, showData: isHideNull, noUnit: true, ...dataInfo }), it.checked),
            );
            if (data.length > 0) {
              return (
                <div className="controlDiv">
                  {data.map((it, i) => {
                    return (
                      <div
                        className={cx('half', {
                          // borderR: i == 0
                        })}
                        style={{ width: `${(it.size / 12) * 100}%` }}
                      >
                        <span className="title">{it.controlName || _l('未命名')}</span>
                        <span className={cx('value', { value2: it.type === 2 })}>
                          {getPrintContent({ ...it, showUnit: true, printOption, ...dataInfo })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            }
          }
        })}
      </div>
    );
  }

  renderRelations = tableList => {
    const { printData, handChange, params } = this.props;
    const { printId, type, from, printType, isDefault, worksheetId } = params;
    const {
      showData,
      receiveControls = [],
      relations = [],
      controlStyles = [],
      relationStyle = [],
      orderNumber = [],
    } = printData;
    let orderNumberCheck = (orderNumber.find(o => o.receiveControlId === tableList.controlId) || []).checked;
    let relationControls = tableList.relationControls || [];
    let relationsList = tableList.relationsData || {};
    let isHideNull = !showData && !(from === fromType.FORMSET && type !== typeForCon.PREVIEW);
    let list = relationsList.data || [];
    //空置隐藏则不显示
    if (isHideNull && list.length <= 0) {
      return '';
    }
    let controls = [];
    if (tableList.showControls && tableList.showControls.length > 0) {
      //数据根据ShowControls处理
      controls = getVisibleControls(sortByShowControls(tableList));
      //只展示checked
      controls = controls.filter(it => {
        let data = relationControls.find(o => o.controlId === it.controlId) || [];
        if (data.checked && !UNPRINTCONTROL.includes(o.type)) {
          return it;
        }
      });
      //controls数据以relations为准
      controls = controls.map(it => {
        let { template = [] } = relationsList;
        let { controls = [] } = template;
        if (controls.length > 0) {
          let data = controls.find(o => o.controlId === it.controlId) || [];
          return {
            ...it,
            ...data,
            checked: it.checked, //relations 中的checked 是错的
          };
        } else {
          return it;
        }
      });
    }
    //关联表富文本不不显示 分段 嵌入不显示 扫码47暂不支持关联表显示(表单配置处隐藏了)
    controls = controls.filter(
      it => ![41, 22, 45, 47].includes(it.type) && !(it.type === 30 && it.sourceControlType === 41),
    );
    let relationStyleNum = relationStyle.find(it => it.controlId === tableList.controlId) || [];
    let setStyle = type => {
      let data = [];
      let isData = relationStyle.map(it => it.controlId).includes(tableList.controlId);
      if (isData) {
        relationStyle.map(it => {
          if (it.controlId === tableList.controlId) {
            data.push({
              ...it,
              type: type,
            });
          } else {
            data.push(it);
          }
        });
      } else {
        data = relationStyle;
        data.push({
          controlId: tableList.controlId,
          type: type,
        });
      }
      handChange({
        ...printData,
        relationStyle: data,
      });
    };
    // let dataInfo = {
    //   recordId: rowId,
    //   appId,
    //   worksheetId,
    //   viewIdForPermit: viewId,
    //   controls,
    // };
    return (
      <React.Fragment>
        <p className={cx('relationsTitle Font15', { tableP: !relationStyleNum.type || relationStyleNum.type === 1 })}>
          {tableList.controlName || _l('未命名')}
          {type !== typeForCon.PREVIEW && (
            <ul>
              <li
                className={cx({ current: !relationStyleNum.type || relationStyleNum.type === 1 })}
                onClick={() => {
                  setStyle(1);
                }}
              >
                {_l('表格')}
              </li>
              <li
                className={cx({ current: !(!relationStyleNum.type || relationStyleNum.type === 1) })}
                onClick={() => {
                  setStyle(2);
                }}
              >
                {_l('平铺')}
              </li>
            </ul>
          )}
        </p>
        {!relationStyleNum.type || relationStyleNum.type === 1 ? (
          // 表格
          <TableRelation
            dataSource={list}
            controls={controls}
            orderNumberCheck={orderNumberCheck}
            id={tableList.controlId}
            printData={printData}
            handChange={handChange}
            isShowFn={this.isShow}
            showData={isHideNull}
          />
        ) : (
          // 平铺
          <React.Fragment>
            <div className="relationsList">
              {list.map((o, i) => {
                if (controls.length <= 0) {
                  return '';
                }
                return (
                  <div className="listCon" style={{ fontSize: printData.font || DEFAULT_FONT_SIZE }}>
                    {orderNumberCheck && (
                      <h5 style={{ fontSize: printData.font || DEFAULT_FONT_SIZE }}>
                        {tableList.sourceEntityName || _l('记录')} {i + 1}
                      </h5>
                    )}
                    {controls.map(it => {
                      let data = {
                        ...it,
                        value: o[it.controlId],
                        isRelateMultipleSheet: true,
                        showUnit: true,
                      };
                      if ([29].includes(it.type)) {
                        let list = (it.relationControls || []).find(o => o.attribute === 1) || {};
                        if (list.type && ![29, 30].includes(list.type)) {
                          data = { ...data, sourceControlType: list.type, advancedSetting: list.advancedSetting };
                        }
                      }
                      if (
                        !this.isShow(
                          getPrintContent({
                            ...data,
                            showData: isHideNull,
                            noUnit: true,
                          }),
                          true,
                        )
                      ) {
                        return;
                      }
                      return (
                        <div className={cx('relationsListLi', {})}>
                          <span className="title">{it.controlName || _l('未命名')}</span>
                          <span className="value">
                            {getPrintContent({
                              ...data,
                              // ...{
                              //   controls: relationControls.map(it => {
                              //     return { ...it, value: o[it.controlId] };
                              //   }),
                              //   recordId: it.rowid,
                              //   worksheetId: it.wsid,

                              //   // viewIdForPermit: viewId,
                              // },
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  };

  renderWorks = (_works=undefined, _name) => {
    const { printData } = this.props;
    const { workflow = [], processName } = printData;
    let works = _works ? _works : workflow;
    const visibleItemLength = works.filter(item => item.checked).length;
    let name = _works ? _name : processName;
    return (
      <div className="worksTable">
        {visibleItemLength ? <div className="Font15 bold mBottom12">{name}</div> : null}
        {works.map((item, index) => (
          <div
            className="workDetail clearfix "
            key={index}
            style={{ display: item.checked ? 'block' : 'none', fontSize: printData.font || DEFAULT_FONT_SIZE }}
          >
            <div className="workName mTop0">{item.flowNode.name}</div>
            <div className="workPersons">
              <table className="mBottom16">
                <tbody>
                  <tr>
                    <th style={{ width: '25%' }}>{TYPE_ACTION[item.workItems[0].type]}</th>
                    <th style={{ width: '22%' }}>{_l('操作')}</th>
                    <th style={{ width: '19%' }}>{_l('操作时间')}</th>
                    <th>{_l('备注')}</th>
                  </tr>
                  {item.workItems.map((workItem, workItemIndex) => {
                    const { workItemLog, signature } = workItem;
                    return (
                      <tr key={workItemIndex}>
                        <td>
                          <span className="controlName TxtMiddle">{workItem.workItemAccount.fullName}</span>
                        </td>
                        <td>
                          <span className="controlName TxtMiddle">
                            {workItem.type === 0
                              ? TRIGGER_ACTION[Number(item.flowNode.triggerId)]
                              : workItem.workItemLog && OPERATION_LOG_ACTION[workItem.workItemLog.action]}
                          </span>
                        </td>
                        <td>
                          <span className="controlName TxtMiddle">{workItem.operationTime}</span>
                        </td>
                        <td>
                          <span className="controlName TxtMiddle">{workItem.opinion}</span>
                          {workItemLog &&
                            workItemLog.fields &&
                            workItemLog.fields.map(({ name, toValue }) => <span>{_l('%0: %1', name, toValue)}</span>)}
                          <br />
                          {signature ? (
                            <div className="infoSignature">
                              {signature.server && <img src={`${signature.server}`} alt="" srcset="" height="100" />}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  renderApproval = () => {
    const { printData, sheetSwitchPermit, params } = this.props;
    const {viewId} = params;
    const { approval = [] } = printData;

    const visibleItem = approval.filter(item => item.child.some(l=>l.checked));
    if(!isOpenPermit(permitList.approveDetailsSwitch, sheetSwitchPermit, viewId)) {
      return null;
    }
    return (
      <React.Fragment>
        {visibleItem.length>0 && (
          <React.Fragment>
            {
              visibleItem.map((item, index) => {
                return (
                  <div className='approval'>
                    {item.child.map(l=>{
                      let _workList = l.processInfo.works.map(m => {
                        return {
                          ...m,
                          checked: l.checked
                        }
                      })
                      return this.renderWorks(_workList, l.processInfo.processName )
                    })}
                  </div>
                )
              })
            }
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }

  getNumSys = () => {
    const { printData } = this.props;
    let num = 0;
    ['createTime', 'ownerAccount', 'createAccount', 'updateTime'].map(o => {
      if (this.isShow(printData[o], printData[o + 'Checked'])) {
        num = num + 1;
      }
    });
    return num;
  };

  isShow = (data, checked) => {
    if (!checked) {
      return false;
    }
    const { printData, params } = this.props;
    const { type, from } = params;
    const { showData } = printData;
    let isHideNull = !showData && !(from === fromType.FORMSET && type !== typeForCon.PREVIEW);
    // 隐藏字段，只在表单编辑中的新建和编辑不生效，仅保存设置
    return (!isHideNull || (data && isHideNull)) && checked;
  };

  render() {
    const { loading, shareUrl } = this.state;
    const { params, printData, controls, signature } = this.props;
    const { receiveControls = [], workflow = [], showData, approval=[], attributeName } = printData;
    return (
      <div className="flex">
        {loading ? (
          <LoadDiv className="mTop64" />
        ) : (
          <ScrollView>
            <div className="printContent flex clearfix pTop20" id="printContent">
              {this.isShow(printData.companyName, printData.companyNameChecked) && (
                <h5 className="companyName">
                  {
                    printData.companyName // 公司名称
                  }
                </h5>
              )}
              {(printData.logoChecked || printData.formNameChecked || printData.qrCode) && (
                <div className="titleContent clearfix mBottom25">
                  <span className="logo">
                    {this.isShow(printData.projectLogo, printData.logoChecked) && (
                      <img src={printData.projectLogo} alt="" height={60} />
                    )}
                  </span>
                  <span className="font22 reqTitle">
                    {this.isShow(printData.formName, printData.formNameChecked) ? printData.formName : ''}
                  </span>
                  <span className="qrCode">
                    {this.isShow(shareUrl, printData.qrCode) && <img src={shareUrl} alt="" height={80} />}
                  </span>
                </div>
              )}
              <div className="createBy">
                {/* 标题 */}
                <h6 className="Font18">{printData.titleChecked && attributeName}</h6>
                {this.getNumSys() > 0 && (
                  <div className="mTop10 sysBox">
                    {this.getNumSys() >= 4 ? (
                      <React.Fragment>
                        <span className="mBottom10 TxtLeft">
                          {_l('拥有者：')}
                          {printData.ownerAccount}
                        </span>
                        <div className="clear"></div>
                        <span className="TxtLeft">
                          {_l('创建者：')}
                          {printData.createAccount}
                        </span>
                        <span className="TxtCenter ">
                          {_l('创建时间：')}
                          {printData.createTime}
                        </span>
                        <span className="TxtRight">
                          {_l('最近修改时间：')}
                          {printData.updateTime}
                        </span>
                      </React.Fragment>
                    ) : (
                      <div className={`sysBox${this.getNumSys()}`}>
                        {['ownerAccount', 'createAccount', 'createTime', 'updateTime'].map(o => {
                          if (this.isShow(printData[o], printData[o + 'Checked'])) {
                            return (
                              <span>
                                {SYSTOPRINTTXT[o]}
                                {printData[o]}
                              </span>
                            );
                          }
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {_.isEmpty(controls) ? undefined : this.renderControls()}
              {/* 工作流 */}
              {workflow.length > 0 && this.renderWorks()}
              {approval.length>0 && this.renderApproval()}
              {/* 签名字段 */}
              {signature.length > 0 && signature.filter(item => item.checked).length > 0 ? (
                <div className="flexRow mTop50 pBottom30 signatureContentWrapper">
                  {signature
                    .filter(item => this.isShow(item.value, item.checked))
                    .map(item => (
                      <div key={item.controlId}>
                        <div className="bold">{item.controlName}</div>
                        <img className="mTop10" src={item.value} />
                      </div>
                    ))}
                </div>
              ) : null}
              {printData.printTime && (
                <div className="clearfix createBy  mTop15">
                  <span className="Right">
                    {_l('打印时间：')}
                    {moment().format('YYYY-MM-DD HH:mm:ss')}
                  </span>
                </div>
              )}
            </div>
          </ScrollView>
        )}
      </div>
    );
  }
}
