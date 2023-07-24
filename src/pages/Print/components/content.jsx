import React from 'react';
import sheetAjax from 'src/api/worksheet';
import './content.less';
import { getPrintContent, sortByShowControls, getVisibleControls, isRelation } from '../util';
import TableRelation from './relationTable';
import { ScrollView, Qr } from 'ming-ui';
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
import { SYSTOPRINTTXT } from '../config';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import _ from 'lodash';
import moment from 'moment';
import STYLE_PRINT from './exportWordPrintTemCssString';

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
        .then(({ shareLink }) => {
          let url = shareLink;
          if (
            from === fromType.PRINT &&
            type === typeForCon.PREVIEW &&
            isDefault &&
            printId &&
            printType === 'worksheet'
          ) {
            url = url.replace('public/record', 'public/print');
            url = `${url}&&${printId}&&${projectId}`;
          }
          this.setState({
            shareUrl: url,
          });
        });
    } else {
      viewId = !viewId ? undefined : viewId;
      let url = `${location.origin}${window.subPath || ''}/app/${appId}/${worksheetId}/${viewId}/row/${
        rowId || rowIdForQr
      }`;
      this.setState({
        shareUrl: url,
      });
    }
  };

  renderControls() {
    const { printData, controls = [] } = this.props;
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
    const tableList = [];
    let preRelationControls = false;
    let colNum = 1;

    Object.keys(controlData).map(key => {
      const item = controlData[key];

      let isRelationControls = item.length === 1 && isRelation(item[0]);

      if (item.length > colNum) {
        colNum = item.length;
      }

      if (isRelationControls || item[0].type === 22) {
        tableList.push([item]);
        preRelationControls = true;
      } else if (tableList.length === 0 || preRelationControls) {
        tableList[tableList.length] = [item];
        preRelationControls = false;
      } else {
        tableList[tableList.length - 1].push(item);
        preRelationControls = false;
      }
    });

    return (
      <React.Fragment>
        {tableList.map((tableData, tableIndex) => {
          let isRelationControls = tableData.length === 1 && isRelation(tableData[0][0]);
          //关联表多行列表/子表打印
          if (isRelationControls) {
            const item = tableData[0];
            if (isHideNull) {
              if ([29, 34, 51].includes(item[0].type)) {
                //关联表,子表，是否空值隐藏
                let records = [];
                try {
                  records = JSON.parse(item[0].value);
                } catch (err) {}
                if (records.length <= 0) {
                  return null;
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
              return null;
            }

            return this.renderRelations(item[0]);
          }
          let hideNum = 0;
          if (tableData[0][0].type === 22) {
            return tableData[0][0].checked ? (
              <p
                style={{
                  lineHeight: 1.5,
                  verticalAlign: top,
                  width: '100%',
                  borderBottom: '0.1px solid rgb(117, 117, 117)',
                  fontSize: 15,
                  fontWeight: 'bold',
                  margin: '24px 0 5px',
                }}
              >
                {tableData[0][0].controlName || ''}
              </p>
            ) : null;
          }
          return (
            <table
              style={{
                ...STYLE_PRINT.table,
                fontSize: printData.font || DEFAULT_FONT_SIZE,
                marginTop: tableIndex === 0 ? 18 : 0,
              }}
              border="0"
              cellPadding="0"
              cellSpacing="0"
            >
              {Object.keys(tableData).map((key, itemIndex) => {
                const item = tableData[key];
                //一行一个控件的显示
                if (item.length === 1) {
                  if (isHideNull) {
                    if ([41, 10010, 14, 42].includes(item[0].type) && !item[0].value) {
                      //富文本、备注、附件、签名，是否空值隐藏0
                      hideNum++;
                      return '';
                    }
                    if ([29, 34].includes(item[0].type)) {
                      //关联表,子表，是否空值隐藏
                      let records = [];
                      try {
                        records = JSON.parse(item[0].value);
                      } catch (err) {}
                      if (records.length <= 0) {
                        hideNum++;
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
                    hideNum++;
                    return '';
                  }
                  let expStyle = {
                    borderBottom: '0.1px solid #ddd',
                    borderTop: itemIndex === hideNum ? '0.1px solid #ddd' : 'none',
                  };

                  return item[0].type !== 10010 || item[0].value ? (
                    <tr style={STYLE_PRINT.controlDiv}>
                      {/* 备注字段无标题 */}
                      {item[0].type !== 10010 && (
                        <td
                          width="78"
                          style={{
                            ...STYLE_PRINT.controlDiv_span,
                            ...STYLE_PRINT.controlDiv_span_title,
                            ...expStyle,
                          }}
                        >
                          {item[0].controlName}
                        </td>
                      )}
                      {/* 分割线不计算value 走特殊显示方式 */}
                      <td
                        style={{
                          ...STYLE_PRINT.controlDiv_span,
                          ...STYLE_PRINT.controlDiv_span_value,
                          ...expStyle,
                        }}
                        width={item[0].type !== 10010 ? '650' : '100%'}
                        colSpan={item[0].type !== 10010 ? colNum * 2 - 1 : colNum * 2}
                      >
                        {getPrintContent({
                          ...item[0],
                          showUnit: true,
                          showData: isHideNull,
                          printOption,
                          ...dataInfo,
                        })}
                      </td>
                    </tr>
                  ) : null;
                } else {
                  //一行多个控件的显示
                  let data = item.filter(it =>
                    this.isShow(
                      getPrintContent({ ...it, showData: isHideNull, noUnit: true, ...dataInfo }),
                      it.checked,
                    ),
                  );

                  let allCountSize = _.sum(data.map(item => item.size));

                  if (data.length > 0) {
                    return (
                      <tr style={STYLE_PRINT.controlDiv}>
                        {data.map((it, i) => {
                          return (
                            <React.Fragment>
                              <td
                                style={{
                                  ...STYLE_PRINT.controlDiv_span,
                                  ...STYLE_PRINT.controlDiv_span_title,
                                  borderLeft: i === 0 ? 'none' : '0.1px solid rgb(221, 221, 221)',
                                  width: '78px',
                                  borderBottom: '0.1px solid #ddd',
                                  borderTop: itemIndex === hideNum ? '0.1px solid #ddd' : 'none',
                                }}
                              >
                                {it.controlName || _l('未命名')}
                              </td>
                              <td
                                style={{
                                  ...STYLE_PRINT.controlDiv_span,
                                  ...STYLE_PRINT.controlDiv_span_value,
                                  overflow: 'hidden',
                                  width:
                                    data.length !== 1
                                      ? `${728 * (it.size / allCountSize) - 78}px`
                                      : 'calc(100% - 78px)',
                                  borderBottom: '0.1px solid #ddd',
                                  borderTop: itemIndex === hideNum ? '0.1px solid #ddd' : 'none',
                                }}
                                width={data.length !== 1 ? `${728 * (it.size / allCountSize) - 78}` : '650'}
                                colSpan={Math.round((colNum * 2 - data.length) * (it.size / allCountSize))}
                              >
                                {getPrintContent({ ...it, showUnit: true, printOption, ...dataInfo })}
                              </td>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    );
                  } else {
                    hideNum++;
                    return null;
                  }
                }
              })}
            </table>
          );
        })}
      </React.Fragment>
    );
  }

  renderRelations = tableList => {
    const { printData, handChange, params } = this.props;
    const { type, from } = params;
    const { showData, relationStyle = [], orderNumber = [] } = printData;
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
    //关联表富文本不不显示 分割线 嵌入不显示 扫码47暂不支持关联表显示(表单配置处隐藏了)
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
    let sign = !relationStyleNum.type || relationStyleNum.type === 1;
    return (
      <React.Fragment>
        <p
          style={_.assign(STYLE_PRINT.relationsTitle, STYLE_PRINT.Font15, sign ? STYLE_PRINT.pRelations : {})}
          className="relationsTitle"
        >
          {tableList.controlName || _l('未命名')}
          {type !== typeForCon.PREVIEW && (
            <ul
              className="noPrint"
              style={{
                ...STYLE_PRINT.tag,
                float: 'right',
              }}
            >
              <li
                style={{
                  ...STYLE_PRINT.relations_Ul_Li,
                  border: sign ? '0.1px solid #2196f3' : '0.1px solid #bdbdbd',
                  color: sign ? '#2196f3' : '#bdbdbd',
                  zIndex: sign ? 1 : 0,
                }}
                onClick={() => {
                  setStyle(1);
                }}
              >
                {_l('表格')}
              </li>
              <li
                style={{
                  ...STYLE_PRINT.relations_Ul_Li,
                  border: !sign ? '0.1px solid #2196f3' : '0.1px solid #bdbdbd',
                  color: !sign ? '#2196f3' : '#bdbdbd',
                  zIndex: !sign ? 1 : 0,
                }}
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
            style={{
              fontSize: printData.font || DEFAULT_FONT_SIZE,
            }}
          />
        ) : (
          // 平铺
          <React.Fragment>
            <div style={{ marginBottom: 24 }}>
              {list.map((o, i) => {
                if (controls.length <= 0) {
                  return '';
                }
                let controlList = controls.filter(it => {
                  let data = {
                    ...it,
                    value: o[it.controlId],
                    isRelateMultipleSheet: true,
                    showUnit: true,
                  };
                  return this.isShow(
                    getPrintContent({
                      ...data,
                      showData: isHideNull,
                      noUnit: true,
                    }),
                    true,
                  );
                });

                return (
                  <React.Fragment>
                    {orderNumberCheck && (
                      <h5
                        style={{
                          ...STYLE_PRINT.relationsList_listCon_h5,
                          fontSize: printData.font || DEFAULT_FONT_SIZE,
                        }}
                      >
                        {tableList.sourceEntityName || _l('记录')} {i + 1}
                      </h5>
                    )}
                    {controlList.length > 0 && (
                      <table
                        width="100%"
                        style={{
                          ...STYLE_PRINT.table,
                          fontSize: printData.font || DEFAULT_FONT_SIZE,
                        }}
                        border="0"
                        cellPadding="0"
                        cellSpacing="0"
                      >
                        {controlList.map((it, index) => {
                          let data = {
                            ...it,
                            value: o[it.controlId],
                            isRelateMultipleSheet: it.type !== 14,
                            showUnit: true,
                          };
                          if ([29].includes(it.type)) {
                            let list = (it.relationControls || []).find(o => o.attribute === 1) || {};
                            if (list.type && ![29, 30].includes(list.type)) {
                              data = { ...data, sourceControlType: list.type, advancedSetting: list.advancedSetting };
                            }
                          }
                          let expStyle =
                            index + 1 === controlList.length
                              ? {
                                  borderBottom: '0.1px solid #ddd',
                                  paddingBottom: 10,
                                }
                              : {
                                  paddingTop: 5,
                                };
                          return (
                            <tr>
                              <td
                                style={{
                                  ...STYLE_PRINT.controlDiv_span_title,
                                  ...expStyle,
                                }}
                              >
                                {it.controlName || _l('未命名')}
                              </td>
                              <td
                                style={{
                                  ...expStyle,
                                  whiteSpace: 'pre-wrap',
                                }}
                              >
                                {getPrintContent(data)}
                              </td>
                            </tr>
                          );
                        })}
                      </table>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  };

  renderWorks = (_works = undefined, _name) => {
    const { printData } = this.props;
    const { workflow = [], processName } = printData;
    let works = _works ? _works : workflow;
    const visibleItemLength = works.filter(item => item.checked).length;
    let name = _works ? _name : processName;
    return (
      <div style={{ marginTop: 24 }}>
        {visibleItemLength ? <div style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 12 }}>{name}</div> : null}
        {works.map((item, index) => (
          <div
            className="clearfix"
            key={index}
            style={{ display: item.checked ? 'block' : 'none', fontSize: printData.font || DEFAULT_FONT_SIZE }}
          >
            <div style={{ marginTop: 0 }}>{item.flowNode.name}</div>
            <div style={{ marginTop: 10 }}>
              <table
                style={{
                  ...STYLE_PRINT.table,
                  marginBottom: 16,
                  width: '100%',
                  borderSpacing: 0,
                  fontSize: 12,
                }}
              >
                <tbody>
                  <tr>
                    <th
                      style={{
                        ...STYLE_PRINT.worksTable_workPersons_th,
                        width: '25%',
                        borderTop: '0.1px solid #333',
                        backgroundColor: '#fafafa',
                        borderLeft: 0,
                      }}
                    >
                      {TYPE_ACTION[item.workItems[0].type]}
                    </th>
                    <th
                      style={{
                        ...STYLE_PRINT.worksTable_workPersons_th,
                        width: '22%',
                        borderTop: '0.1px solid #333',
                        backgroundColor: '#fafafa',
                      }}
                    >
                      {_l('操作')}
                    </th>
                    <th
                      style={{
                        ...STYLE_PRINT.worksTable_workPersons_th,
                        width: '19%',
                        borderTop: '0.1px solid #333',
                        backgroundColor: '#fafafa',
                      }}
                    >
                      {_l('操作时间')}
                    </th>
                    <th
                      style={{
                        ...STYLE_PRINT.worksTable_workPersons_th,
                        borderTop: '0.1px solid #333',
                        backgroundColor: '#fafafa',
                      }}
                    >
                      {_l('备注')}
                    </th>
                  </tr>
                  {item.workItems.map((workItem, workItemIndex) => {
                    const { workItemLog, signature } = workItem;
                    return (
                      <tr key={workItemIndex}>
                        <td
                          style={{
                            ...STYLE_PRINT.worksTable_workPersons_td,
                            width: '25%',
                            borderLeft: 0,
                            borderBottom:
                              workItemIndex + 1 === item.workItems.length ? '0.1px solid #333' : '0.1px solid #ddd',
                          }}
                        >
                          <span style={{ verticalAlign: 'middle' }} className="controlName">
                            {workItem.workItemAccount.fullName}
                          </span>
                        </td>
                        <td
                          style={{
                            ...STYLE_PRINT.worksTable_workPersons_td,
                            width: '22%',
                            borderBottom:
                              workItemIndex + 1 === item.workItems.length ? '0.1px solid #333' : '0.1px solid #ddd',
                          }}
                        >
                          <span style={{ verticalAlign: 'middle' }} className="controlName">
                            {workItem.type === 0
                              ? TRIGGER_ACTION[Number(item.flowNode.triggerId)]
                              : workItem.workItemLog &&
                                (workItem.workItemLog.action === 5 && workItem.workItemLog.actionTargetName
                                  ? _l('退回到%0', workItem.workItemLog.actionTargetName)
                                  : OPERATION_LOG_ACTION[workItem.workItemLog.action])}
                          </span>
                        </td>
                        <td
                          style={{
                            ...STYLE_PRINT.worksTable_workPersons_td,
                            width: '19%',
                            borderBottom:
                              workItemIndex + 1 === item.workItems.length ? '0.1px solid #333' : '0.1px solid #ddd',
                          }}
                        >
                          <span style={{ verticalAlign: 'middle' }} className="controlName">
                            {workItem.operationTime}
                          </span>
                        </td>
                        <td
                          style={{
                            ...STYLE_PRINT.worksTable_workPersons_td,
                            borderBottom:
                              workItemIndex + 1 === item.workItems.length ? '0.1px solid #333' : '0.1px solid #ddd',
                          }}
                        >
                          <span style={{ verticalAlign: 'middle' }} className="controlName">
                            {workItem.opinion}
                          </span>
                          {workItemLog &&
                            workItemLog.fields &&
                            workItemLog.fields.map(({ name, toValue }) => <span>{_l('%0: %1', name, toValue)}</span>)}
                          <br />
                          {signature ? (
                            <div style={STYLE_PRINT.worksTable_workPersons_infoSignature} className="infoSignature">
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
    const { viewId } = params;
    const { approval = [] } = printData;

    const visibleItem = approval.filter(item => item.child.some(l => l.checked));
    if (!isOpenPermit(permitList.approveDetailsSwitch, sheetSwitchPermit, viewId)) {
      return null;
    }
    return (
      <React.Fragment>
        {visibleItem.length > 0 && (
          <React.Fragment>
            {visibleItem.map((item, index) => {
              return (
                <div className="approval">
                  {item.child.map(l => {
                    let _workList = l.processInfo.works.map(m => {
                      return {
                        ...m,
                        checked: l.checked,
                      };
                    });
                    return this.renderWorks(_workList, l.processInfo.processName);
                  })}
                </div>
              );
            })}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  };

  getNumSys = () => {
    const { printData } = this.props;
    let num = 0;
    ['createTime', 'ownerAccount', 'createAccount', 'updateAccount', 'updateTime'].map(o => {
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

  createByNeedWrap = () => {
    const { printData } = this.props;
    let createSign =
      this.isShow(printData.createAccount, printData.createAccountChecked) &&
      this.isShow(printData.createTime, printData.createTimeChecked);
    let updateSign =
      this.isShow(printData.updateAccount, printData.updateAccountChecked) &&
      this.isShow(printData.updateTime, printData.updateTimeChecked);
    if (createSign && updateSign) {
      return false;
    } else if (createSign && this.isShow(printData.ownerAccount, printData.ownerAccountChecked)) {
      return true;
    } else if (updateSign && this.getNumSys() % 2 === 1) {
      return true;
    }
    return false;
  };

  renderSysTable = () => {
    const { printData } = this.props;
    let sysFeild = ['ownerAccount', 'createAccount', 'createTime', 'updateAccount', 'updateTime'].filter(o =>
      this.isShow(printData[o], printData[o + 'Checked']),
    );
    let hasCreateGroup = sysFeild.includes('createAccount') && sysFeild.includes('createTime');
    let hasUpdateGroup = sysFeild.includes('updateAccount') && sysFeild.includes('updateTime');
    let trGroup = _.chunk(
      _.flatMap(sysFeild, (item, index) => {
        if (
          index === 0 &&
          ((sysFeild[index + 1] === 'createAccount' && hasCreateGroup) ||
            (sysFeild[index + 1] === 'updateAccount' && hasUpdateGroup))
        ) {
          return [item, undefined];
        } else {
          return item;
        }
      }),
      2,
    );

    return (
      <table
        style={{
          ...STYLE_PRINT.table,
          marginTop: 10,
          fontSize: 13,
        }}
        border="0"
        cellPadding="0"
        cellSpacing="0"
      >
        {trGroup.map(trList => {
          return (
            <tr>
              {trList.map(it => {
                return (
                  <td style={{ width: '50%' }}>
                    {it ? (
                      <span
                        style={{
                          display: 'inline-block',
                          paddingBottom: '10px',
                        }}
                      >
                        {SYSTOPRINTTXT[it]}
                        {printData[it]}
                      </span>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </table>
    );
  };

  render() {
    const { loading, shareUrl } = this.state;
    const { printData, controls, signature } = this.props;
    const { workflow = [], approval = [], attributeName } = printData;
    return (
      <div className="flex">
        {loading ? (
          <LoadDiv className="mTop64" />
        ) : (
          <ScrollView>
            <div className="printContent flex clearfix pTop20" id="printContent">
              {this.isShow(printData.companyName, printData.companyNameChecked) && (
                <p style={STYLE_PRINT.companyName}>
                  {
                    printData.companyName // 公司名称
                  }
                </p>
              )}
              {(printData.logoChecked || printData.formNameChecked || printData.qrCode) && (
                <table style={STYLE_PRINT.table} border="0" cellPadding="0" cellSpacing="0">
                  <tr>
                    <td
                      style={{
                        width: '33.3%',
                      }}
                    >
                      <span style={{ flex: 1, paddingTop: 10 }}>
                        {this.isShow(printData.projectLogo, printData.logoChecked) && (
                          <img src={printData.projectLogo} alt="" height={60} style={STYLE_PRINT.img} />
                        )}
                      </span>
                    </td>
                    <td style={{ width: '33.3%', textAlign: 'center' }}>
                      <span style={STYLE_PRINT.reqTitle}>
                        {this.isShow(printData.formName, printData.formNameChecked) ? printData.formName : ''}
                      </span>
                    </td>
                    <td style={{ width: '33.3%', textAlign: 'right' }}>
                      <span style={{ flex: 1, textAlign: 'right' }}>
                        {this.isShow(shareUrl, printData.qrCode) && <Qr content={shareUrl} width={80} height={80} />}
                      </span>
                    </td>
                  </tr>
                </table>
              )}
              {/* 标题 */}
              <p style={STYLE_PRINT.createBy_h6}>{printData.titleChecked && attributeName}</p>
              {this.getNumSys() > 0 && this.renderSysTable()}
              {_.isEmpty(controls) ? undefined : this.renderControls()}
              {/* 工作流 */}
              {workflow.length > 0 && this.renderWorks()}
              {approval.length > 0 && this.renderApproval()}
              {/* 签名字段 */}
              {signature.length > 0 && signature.filter(item => item.checked).length > 0 ? (
                <table
                  style={{
                    ...STYLE_PRINT.table,
                    marginTop: 50,
                    marginBottom: 30,
                    width: 'auto',
                    marginLeft: 56,
                  }}
                  border="0"
                  cellPadding="0"
                  cellSpacing="0"
                >
                  {_.chunk(
                    signature.filter(item => this.isShow(item.value, item.checked)),
                    4,
                  ).map((tdList, index) => {
                    return (
                      <tr key={`signature-tr-${index}`} style={{ verticalAlign: 'top' }}>
                        <td
                          width={168}
                          style={{
                            width: 168,
                            height: 100,
                          }}
                        >
                          {tdList[3] ? (
                            <React.Fragment>
                              <div style={{ fontWeight: 'bold' }}>{tdList[3].controlName}</div>
                              <img style={{ marginTop: 10, width: '168px' }} src={tdList[3].value} />
                            </React.Fragment>
                          ) : null}
                        </td>
                        <td
                          width={168}
                          style={{
                            width: 168,
                            height: 100,
                          }}
                        >
                          {tdList[2] ? (
                            <React.Fragment>
                              <div style={{ fontWeight: 'bold' }}>{tdList[2].controlName}</div>
                              <img style={{ marginTop: 10, width: '168px' }} src={tdList[2].value} />
                            </React.Fragment>
                          ) : null}
                        </td>
                        <td
                          width={168}
                          style={{
                            width: 168,
                            height: 100,
                          }}
                        >
                          {tdList[1] ? (
                            <React.Fragment>
                              <div style={{ fontWeight: 'bold' }}>{tdList[1].controlName}</div>
                              <img style={{ marginTop: 10, width: '168px' }} src={tdList[1].value} />
                            </React.Fragment>
                          ) : null}
                        </td>
                        <td
                          width={168}
                          style={{
                            width: 168,
                            height: 100,
                          }}
                        >
                          {tdList[0] ? (
                            <React.Fragment>
                              <div style={{ fontWeight: 'bold' }}>{tdList[0].controlName}</div>
                              <img style={{ marginTop: 10, width: '168px' }} src={tdList[0].value} />
                            </React.Fragment>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </table>
              ) : null}
              {printData.printTime && (
                <p
                  style={{
                    marginTop: 15,
                    textAlign: 'right',
                    width: '100%',
                  }}
                >
                  {_l('打印时间：')}
                  {moment().format('YYYY-MM-DD HH:mm:ss')}
                </p>
              )}
            </div>
          </ScrollView>
        )}
      </div>
    );
  }
}
