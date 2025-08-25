import React, { Fragment } from 'react';
import _ from 'lodash';
import { Qr, ScrollView } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { putControlByOrder, replaceHalfWithSizeControls } from 'src/pages/widgetConfig/util';
import { getDateToEn } from 'src/pages/widgetConfig/util/setting';
import RegExpValidator from 'src/utils/expression';
import { dateConvertToUserZone } from 'src/utils/project';
import {
  DEFAULT_FONT_SIZE,
  DefaultNameWidth,
  FONT_STYLE,
  fromType,
  OPERATION_LOG_ACTION,
  RecordTitleFont,
  TitleFont,
  TRIGGER_ACTION,
  typeForCon,
  UN_PRINT_CONTROL,
} from '../config';
import { SYST_PRINT_TXT } from '../config';
import getPrintContent from '../getPrintContent';
import { getFormData, isRelation, sortByShowControls } from '../util';
import STYLE_PRINT from './exportWordPrintTemCssString';
import TableRelation from './relationTable';
import './content.less';

const RELATION_SHOW_TYPES = [
  {
    label: _l('表格'),
    value: 1,
  },
  {
    label: _l('平铺'),
    value: 2,
  },
];

const WORKS_TDS = [
  {
    label: _l('流程节点'),
    width: '20%',
  },
  {
    label: _l('操作人'),
    width: '20%',
  },
  {
    label: _l('操作'),
    width: '12%',
  },
  {
    label: _l('操作时间'),
    width: '22%',
  },
  {
    label: [_l('备注/签名'), _l('备注')],
    width: '26%',
    labelKey: 'approvePosition',
  },
];

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

  componentWillReceiveProps(nextProps) {
    if (_.get(this.props, ['printData', 'shareType']) !== _.get(nextProps, ['printData', 'shareType'])) {
      this.loadWorksheetShortUrl(nextProps);
    }
  }

  loadWorksheetShortUrl = props => {
    let { appId, worksheetId, viewId, rowId, printId, type, printType, isDefault, projectId } = this.props.params;
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
          printId,
        })
        .then(({ shareLink }) => {
          let url = shareLink;

          if (type === typeForCon.PREVIEW && isDefault && printId && printType === 'worksheet') {
            url = url.replace('public/record', 'public/print');
            url = `${url}&&${printId}&&${projectId}`;
          }
          this.setState({
            shareUrl: url,
          });
        });
    } else {
      let url = `${location.origin}${window.subPath || ''}/app/${appId}/${worksheetId}/${viewId || undefined}/row/${
        rowId || rowIdForQr
      }`;
      this.setState({
        shareUrl: url,
      });
    }
  };

  renderControls() {
    const { printData, controls = [] } = this.props;
    let { appId, worksheetId, viewId, rowId, type, from, projectId } = this.props.params;
    const { showData, printOption, rowIdForQr, advanceSettings = [], allControls } = printData;
    const nameWidth = (advanceSettings.find(l => l.key === 'nameWidth') || {}).value || DefaultNameWidth;
    const fileStyle = safeParse((advanceSettings.find(l => l.key === 'atta_style') || {}).value);
    let dataInfo = {
      recordId: rowId || rowIdForQr,
      appId,
      worksheetId,
      projectId,
      viewIdForPermit: viewId,
      controls,
      fileStyle,
      user_info: safeParse((advanceSettings.find(l => l.key === 'user_info') || {}).value),
      allControls,
    };
    const controlData = putControlByOrder(
      replaceHalfWithSizeControls(
        controls
          .filter(l => !l.sectionId || controls.find(o => o.controlId === l.sectionId))
          .filter(o => !UN_PRINT_CONTROL.includes(o.type)),
      ),
    );
    let isHideNull = !showData && !(from === fromType.FORM_SET && type !== typeForCon.PREVIEW);
    const tableList = [];
    let preRelationControls = false;
    const fontType = FONT_STYLE[printData.font || DEFAULT_FONT_SIZE];

    Object.keys(controlData).map(key => {
      const item = controlData[key];

      let isRelationControls = item.length === 1 && isRelation(item[0]);

      if (isRelationControls || [22, 52].includes(item[0].type)) {
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

    const valueWidth = _.floor((728 - nameWidth * 6) / 6);

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
                } catch (err) {
                  console.log(err);
                }
                // 子表records不是数组
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

            return this.renderRelations(item[0], dataInfo);
          }
          let hideNum = 0;
          if ([22, 52].includes(tableData[0][0].type)) {
            let type = tableData[0][0].type;
            let hideTitle = _.get(tableData[0][0], 'advancedSetting.hidetitle') === '1';

            return tableData[0][0].checked ? (
              <p
                style={{
                  lineHeight: 1.5,
                  verticalAlign: top,
                  width: '100%',
                  fontSize: TitleFont[fontType],
                  fontWeight: 'bold',
                  margin: '24px 0 5px',
                  textAlign: type === 52 ? 'center' : 'left',
                }}
              >
                {hideTitle ? '' : tableData[0][0].controlName || ''}
              </p>
            ) : null;
          }
          return (
            <table
              style={{
                ...STYLE_PRINT.table,
                fontSize: printData.font || DEFAULT_FONT_SIZE,
                marginTop: tableIndex === 0 ? 16 : 0,
              }}
              border="0"
              cellPadding="0"
              cellSpacing="0"
            >
              {Array(6)
                .fill(6)
                .map((l, i) => {
                  return (
                    <React.Fragment>
                      <col key={2 * i} width={(2 * i) % 3 === 0 || (2 * i) % 4 === 0 ? nameWidth : valueWidth} />
                      <col
                        key={2 * i + 1}
                        width={(2 * i + 1) % 3 === 0 || (2 * i + 1) % 4 === 0 ? nameWidth : valueWidth}
                      />
                    </React.Fragment>
                  );
                })}
              {Object.keys(tableData).map((key, itemIndex) => {
                const item = tableData[key];
                //一行一个控件的显示
                if (item.length === 1) {
                  const hideTitle = _.get(item[0], 'advancedSetting.hidetitle') === '1';
                  if (isHideNull) {
                    if ([41, 10010, 14, 42].includes(item[0].type) && !item[0].value && !item[0].dataSource) {
                      //富文本、备注、附件、签名，是否空值隐藏0
                      hideNum++;
                      return '';
                    }
                    if ([29, 34].includes(item[0].type)) {
                      //关联表,子表，是否空值隐藏
                      let records = [];
                      try {
                        records = JSON.parse(item[0].value);
                      } catch (err) {
                        console.log(err);
                      }
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

                  /* 备注字段、隐藏标题的富文本、隐藏标题且独占一行显示的mark类型文本 */

                  if (
                    (item[0].type === 10010 && (item[0].value || item[0].dataSource)) ||
                    (item[0].type === 41 && hideTitle) ||
                    (item[0].type === 2 && item[0].enumDefault === 3 && item.length === 1 && hideTitle)
                  ) {
                    return (
                      <Fragment>
                        {!hideTitle && (
                          <tr style={STYLE_PRINT.controlDiv} className="trFlex">
                            <td
                              style={{
                                ...STYLE_PRINT.controlDiv_span,
                                ...STYLE_PRINT.controlDiv_span_title,
                                borderBottom: 'none',
                              }}
                              width={'100%'}
                              colSpan={12}
                              className="printTd"
                            >
                              {item[0].controlName}
                            </td>
                          </tr>
                        )}
                        <tr style={STYLE_PRINT.controlDiv} className="trFlex">
                          <td
                            style={{
                              ...STYLE_PRINT.controlDiv_span,
                              ...STYLE_PRINT.controlDiv_span_value,
                              ...expStyle,
                            }}
                            width={'100%'}
                            colSpan={12}
                            className="printTd"
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
                      </Fragment>
                    );
                  }

                  return item[0].type !== 10010 ? (
                    <tr style={STYLE_PRINT.controlDiv} className="trFlex">
                      <td
                        width={nameWidth}
                        style={{
                          ...STYLE_PRINT.controlDiv_span,
                          ...STYLE_PRINT.controlDiv_span_title,
                          ...expStyle,
                        }}
                      >
                        {hideTitle ? '' : item[0].controlName}
                      </td>
                      {/* 分割线不计算value 走特殊显示方式 */}
                      <td
                        style={{
                          ...STYLE_PRINT.controlDiv_span,
                          ...STYLE_PRINT.controlDiv_span_value,
                          ...expStyle,
                          width: 728 - nameWidth,
                        }}
                        width={728 - nameWidth}
                        colSpan={11}
                        className="printTd"
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
                      <React.Fragment>
                        <tr style={STYLE_PRINT.controlDiv} className="trFlex">
                          {data.map((it, i) => {
                            let span = 12 * (it.size / allCountSize);
                            const hideTitle = _.get(it, 'advancedSetting.hidetitle') === '1';
                            return (
                              <React.Fragment>
                                <td
                                  width={nameWidth}
                                  style={{
                                    ...STYLE_PRINT.controlDiv_span,
                                    ...STYLE_PRINT.controlDiv_span_title,
                                    borderLeft: i === 0 ? 'none' : '0.1px solid rgb(221, 221, 221)',
                                    width: `${nameWidth}px`,
                                    borderBottom: '0.1px solid #ddd',
                                    borderTop: itemIndex === hideNum ? '0.1px solid #ddd' : 'none',
                                  }}
                                >
                                  {hideTitle ? '' : it.controlName || _l('未命名')}
                                </td>
                                <td
                                  style={{
                                    ...STYLE_PRINT.controlDiv_span,
                                    ...STYLE_PRINT.controlDiv_span_value,
                                    overflow: 'hidden',
                                    width:
                                      data.length !== 1
                                        ? `${728 * (it.size / allCountSize) - nameWidth}px`
                                        : `${728 - nameWidth}px`,
                                    borderBottom: '0.1px solid #ddd',
                                    borderTop: itemIndex === hideNum ? '0.1px solid #ddd' : 'none',
                                  }}
                                  width={
                                    data.length !== 1
                                      ? `${728 * (it.size / allCountSize) - nameWidth}`
                                      : 728 - nameWidth
                                  }
                                  colSpan={span - 1}
                                  className={`printTd${it.size}`}
                                >
                                  {getPrintContent({ ...it, showUnit: true, printOption, ...dataInfo })}
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                      </React.Fragment>
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

  renderRelations = (tableList, dataInfo) => {
    const { printData, handChange, params } = this.props;
    const { type, from, projectId } = params;
    const { showData, relationStyle = [], orderNumber = [], advanceSettings = [], allControls } = printData;
    let orderNumberCheck = (orderNumber.find(o => o.receiveControlId === tableList.controlId) || []).checked;
    let relationControls = tableList.relationControls || [];
    let relationsList = tableList.relationsData || {};
    let isHideNull = !showData && !(from === fromType.FORM_SET && type !== typeForCon.PREVIEW);
    let list = relationsList.data || [];
    const fontType = FONT_STYLE[printData.font || DEFAULT_FONT_SIZE];
    const fileStyle = safeParse((advanceSettings.find(l => l.key === 'atta_style') || {}).value);
    const relationFileStyle = _.pickBy(fileStyle, (value, key) => _.startsWith(key, `${tableList.controlId}_`));
    const user_info = safeParse((advanceSettings.find(l => l.key === 'user_info') || {}).value);
    const relationUserInfo = _.pickBy(user_info, (value, key) => _.startsWith(key, `${tableList.controlId}_`));

    //空置隐藏则不显示
    if (isHideNull && list.length <= 0) {
      return '';
    }
    let controls = [];
    let allControlsOfRelation = [];
    if (tableList.showControls && tableList.showControls.length > 0) {
      //数据根据ShowControls处理
      controls = sortByShowControls(tableList);
      allControlsOfRelation = controls;
      //只展示checked
      controls = controls.filter(it => {
        let data = relationControls.find(o => o.controlId === it.controlId) || [];
        if (data.checked && !UN_PRINT_CONTROL.includes(it.type)) {
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
      it => ![41, 22, 45].includes(it.type) && !(it.type === 30 && it.sourceControlType === 41),
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
        relationStyle: data,
      });
    };

    let sign = !relationStyleNum.type || relationStyleNum.type === 1;
    const hideTitle = _.get(tableList, 'advancedSetting.hidetitle') === '1';

    return (
      <React.Fragment>
        <p
          style={{
            ..._.assign(STYLE_PRINT.relationsTitle, sign ? STYLE_PRINT.pRelations : {}),
            fontSize: TitleFont[fontType],
          }}
          className="relationsTitle"
        >
          {hideTitle ? '' : tableList.controlName || _l('未命名')}
          {type !== typeForCon.PREVIEW && (
            <ul
              className="noPrint"
              style={{
                ...STYLE_PRINT.tag,
                float: 'right',
              }}
            >
              {RELATION_SHOW_TYPES.map((l, i) => (
                <li
                  style={{
                    ...STYLE_PRINT.relations_Ul_Li,
                    border: sign === !i ? '0.1px solid #1677ff' : '0.1px solid #bdbdbd',
                    color: sign === !i ? '#1677ff' : '#bdbdbd',
                    zIndex: sign === !i ? 1 : 0,
                  }}
                  onClick={() => setStyle(l.value)}
                >
                  {l.label}
                </li>
              ))}
            </ul>
          )}
        </p>
        {!relationStyleNum.type || relationStyleNum.type === 1 ? (
          // 表格
          <TableRelation
            dataSource={list}
            controls={controls}
            allControls={allControlsOfRelation}
            orderNumberCheck={orderNumberCheck}
            id={tableList.controlId}
            printData={printData}
            handChange={handChange}
            isShowFn={this.isShow}
            showData={isHideNull}
            style={{
              fontSize: printData.font || DEFAULT_FONT_SIZE,
            }}
            fileStyle={relationFileStyle}
            user_info={relationUserInfo}
            dataInfo={_.pick(dataInfo, ['recordId', 'appId', 'worksheetId', 'viewIdForPermit', 'projectId'])}
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
                    fileStyle: relationFileStyle,
                    dataSource: it.type === 47 ? it.dataSource : tableList.controlId,
                    user_info: relationUserInfo,
                    controls: getFormData(controls, o),
                    projectId,
                    allControls: getFormData(allControls, o),
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
                            isRelateMultipleSheet: true,
                            showUnit: true,
                            fileStyle: relationFileStyle,
                            dataSource: it.type === 47 ? it.dataSource : tableList.controlId,
                            user_info: relationUserInfo,
                            controls: getFormData(controls, o),
                            projectId,
                          };

                          if ([29].includes(it.type)) {
                            let list = (it.relationControls || []).find(o => o.attribute === 1) || {};

                            if (list.type && ![29, 30].includes(list.type)) {
                              data.sourceControlType = list.type;
                              data.advancedSetting = list.advancedSetting;
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
                            <tr className="trFlex">
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
                                  verticalAlign: 'top',
                                  paddingLeft: 5,
                                  flex: 1,
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

  signLoadSet = e => {
    $(e.target).attr({
      width: e.target.width,
      height: e.target.height,
    });
  };

  renderApprovalFiles = (files = []) => {
    const images = files.filter(l => RegExpValidator.fileIsPicture(l.ext));
    const others = files.filter(l => !RegExpValidator.fileIsPicture(l.ext));

    return (
      <React.Fragment>
        <div
          style={{
            textAlign: 'center',
            marginTop: 5,
          }}
        >
          {images.map(l => (
            <img
              onLoad={e => {
                let width = e.target.width;
                let height = e.target.height;
                if (width > height) {
                  $(e.target).attr({
                    width: width,
                  });
                } else {
                  $(e.target).attr({
                    height: height,
                  });
                }
              }}
              style={{
                maxWidth: 140,
                maxHeight: 158,
              }}
              src={
                l.previewUrl.indexOf('imageView2') > -1
                  ? l.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/2/w/600/q/90')
                  : `${l.previewUrl}&imageView2/2/w/600/q/90`
              }
            />
          ))}
        </div>
        <div style={{ marginTop: 4, marginBottom: 0 }}>{others.map(l => l.originalFilename + l.ext).join(', ')}</div>
      </React.Fragment>
    );
  };

  renderWorks = (_works = undefined, _name) => {
    const { printData } = this.props;
    const { workflow = [], processName, approvePosition } = printData;
    const works = _works || workflow;
    const visibleItemLength = works.filter(item => item.checked).length;
    const name = _works ? _name : processName;

    const signatures = this.getApprovalSignatures(works.filter(l => l.checked));
    const deep_signatures = _.chunk(signatures, 5);
    const fontType = FONT_STYLE[printData.font || DEFAULT_FONT_SIZE];

    return (
      <div style={{ marginTop: 24 }}>
        {visibleItemLength > 0 && (
          <React.Fragment>
            <div style={{ fontSize: TitleFont[fontType], fontWeight: 'bold', marginBottom: 12 }}>{name}</div>
            <div className="clearfix" style={{ fontSize: printData.font || DEFAULT_FONT_SIZE }}>
              <div>
                <table
                  className="approvalTable"
                  style={{
                    ...STYLE_PRINT.table,
                    width: '100%',
                    borderSpacing: 0,
                    fontSize: 12,
                  }}
                >
                  <tbody>
                    <tr>
                      {WORKS_TDS.map((l, i) => {
                        const workTdExp = i === 0 ? { borderLeft: 0, tableLayout: 'auto' } : {};

                        return (
                          <td
                            style={{
                              ...STYLE_PRINT.worksTable_workPersons_th,
                              ...workTdExp,
                              width: '20%',
                              borderTop: '0.1px solid #ddd',
                              backgroundColor: '#fafafa',
                            }}
                            key={`print-works-thead-${i}`}
                          >
                            {l.labelKey ? l.label[approvePosition] : l.label}
                          </td>
                        );
                      })}
                    </tr>
                    {works.map((item, index) => {
                      return item.workItems.map((workItem, workItemIndex) => {
                        const { workItemLog, signature, operationTime, receiveTime } = workItem;
                        if (!item.checked) return null;
                        const isSysAction = operationTime === receiveTime;
                        return (
                          <tr key={`workflow-tr-${index}-${workItemIndex}`}>
                            {workItemIndex === 0 && (
                              <td
                                style={{
                                  ...STYLE_PRINT.worksTable_workPersons_td,
                                  width: '20%',
                                  borderLeft: 0,
                                  borderBottom: '0.1px solid #ddd',
                                }}
                                rowSpan={item.workItems.length}
                              >
                                {item.flowNode.name}
                                {item.multipleLevelType !== 0 && item.sort && ` (${item.sort})`}
                              </td>
                            )}
                            <td
                              style={{
                                ...STYLE_PRINT.worksTable_workPersons_td,
                                width: '20%',
                                borderBottom: '0.1px solid #ddd',
                              }}
                            >
                              <span style={{ verticalAlign: 'middle' }} className="controlName">
                                {workItem.workItemAccount.fullName}
                                {workItem.principal ? _l('(%0委托)', workItem.principal.fullName) : ''}
                                {workItem.administrator ? _l('(%0操作)', workItem.administrator.fullName) : ''}
                              </span>
                            </td>
                            <td
                              style={{
                                ...STYLE_PRINT.worksTable_workPersons_td,
                                width: '12%',
                                borderBottom: '0.1px solid #ddd',
                              }}
                            >
                              <span style={{ verticalAlign: 'middle' }} className="controlName">
                                {workItem.type === 0
                                  ? TRIGGER_ACTION[Number(item.flowNode.triggerId)] || OPERATION_LOG_ACTION['0']
                                  : workItem.workItemLog &&
                                    (workItem.workItemLog.action === 5 && workItem.workItemLog.actionTargetName
                                      ? _l('退回到%0', workItem.workItemLog.actionTargetName)
                                      : workItem.workItemLog.action === 22 && workItem.type === 3
                                        ? _l('无需填写')
                                        : OPERATION_LOG_ACTION[workItem.workItemLog.action])}
                              </span>
                            </td>
                            <td
                              style={{
                                ...STYLE_PRINT.worksTable_workPersons_td,
                                width: '22%',
                                borderBottom: '0.1px solid #ddd',
                              }}
                            >
                              <span style={{ verticalAlign: 'middle' }} className="controlName">
                                {workItem.operationTime}
                              </span>
                            </td>
                            <td
                              style={{
                                ...STYLE_PRINT.worksTable_workPersons_td,
                                // width: '26%',
                                borderBottom: '0.1px solid #ddd',
                              }}
                            >
                              {item.flowNode.type !== 5 && (
                                <React.Fragment>
                                  <span style={{ verticalAlign: 'middle' }} className="controlName">
                                    {isSysAction ? '' : workItem.opinion}
                                  </span>
                                  {workItemLog &&
                                    workItemLog.fields &&
                                    workItemLog.fields.map(({ name, toValue }) => (
                                      <span>
                                        {name}：{toValue}
                                      </span>
                                    ))}
                                  {signature && !approvePosition ? (
                                    <div
                                      style={STYLE_PRINT.worksTable_workPersons_infoSignature}
                                      className="infoSignature"
                                    >
                                      {signature.server && (
                                        <img src={`${signature.server}`} alt="" srcset="" onLoad={this.signLoadSet} />
                                      )}
                                    </div>
                                  ) : null}
                                  {/* 附件 */}
                                  {workItem.files && this.renderApprovalFiles(workItem.files)}
                                </React.Fragment>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {!!signatures.length && approvePosition > 0 && (
              <React.Fragment>
                <p style={{ marginTop: 20, marginBottom: 10, fontSize: TitleFont[fontType] }}>{_l('签名')}</p>
                <table
                  className="approvalSignatureTable"
                  style={{
                    ...STYLE_PRINT.table,
                    marginTop: 0,
                    marginBottom: 30,
                    width: 'auto',
                  }}
                  border="0"
                  cellPadding="0"
                  cellSpacing="0"
                >
                  {deep_signatures.map((tdList, index) => {
                    return (
                      <tr key={`approvalSignature-${name}-tr-${index}`}>
                        {[0, 1, 2, 3, 4].map(tdItem => (
                          <td
                            width={160}
                            style={{
                              width: 160,
                              height: 45,
                              paddingRight: tdItem === 4 ? 0 : 32,
                              paddingBottom: index + 1 === deep_signatures.length ? 0 : 10,
                            }}
                          >
                            {tdList[tdItem] ? (
                              <div style={STYLE_PRINT.worksTable_workPersons_infoSignature} className="infoSignature">
                                <img src={`${tdList[tdItem].server}`} alt="" srcset="" onLoad={this.signLoadSet} />
                              </div>
                            ) : null}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </table>
              </React.Fragment>
            )}
          </React.Fragment>
        )}
      </div>
    );
  };

  getApprovalSignatures = workList => {
    let signatures = [];
    workList.forEach(item => {
      const signature = _.flatMapDeep(item.workItems, l => {
        return l.signature;
      }).filter(l => l && l.server);
      signatures = signatures.concat(signature);
    });
    return signatures;
  };

  renderApproval = () => {
    const { printData, sheetSwitchPermit, params } = this.props;
    const { viewId } = params;
    const { approval = [] } = printData;
    const visibleItem = approval.filter(item => item.child && item.child.some(l => l.checked));

    if (!isOpenPermit(permitList.approveDetailsSwitch, sheetSwitchPermit, viewId)) {
      return null;
    }

    return (
      <React.Fragment>
        {visibleItem.length > 0 && (
          <React.Fragment>
            {visibleItem.map(item => {
              return (
                <div className="approval">
                  {item.child.map(l => {
                    let _workList = l.processInfo.works.map(m => {
                      return {
                        ...m,
                        checked: l.checked,
                      };
                    });

                    return <React.Fragment>{this.renderWorks(_workList, l.processInfo.processName)}</React.Fragment>;
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
    const list = ['createTime', 'ownerAccount', 'createAccount', 'updateAccount', 'updateTime'];

    return list.filter(o => this.isShow(printData[o], printData[o + 'Checked'])).length;
  };

  isShow = (data, checked) => {
    if (!checked) {
      return false;
    }

    const { printData, params } = this.props;
    const { type, from } = params;
    const { showData } = printData;
    let isHideNull = !showData && !(from === fromType.FORM_SET && type !== typeForCon.PREVIEW);
    // 隐藏字段，只在表单编辑中的新建和编辑不生效，仅保存设置
    return !isHideNull || !!data;
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
    let sysFeild = ['ownerAccount', 'createAccount', 'updateAccount', 'createTime', 'updateTime'].filter(o =>
      this.isShow(printData[o], printData[o + 'Checked']),
    );

    return (
      <p
        className="sysField"
        style={{
          ...STYLE_PRINT.sysField,
          fontSize: printData.font || DEFAULT_FONT_SIZE,
        }}
      >
        {sysFeild.map(it => {
          if (!it) return null;
          const formatText = _.get(
            (printData.advanceSettings || []).find(l => l.key === it),
            'value',
          );
          const isSysFormatTime = _.endsWith(it, 'Time');

          return (
            <span>
              {SYST_PRINT_TXT[it]}
              {isSysFormatTime && formatText ? getDateToEn(formatText, printData[it]) : printData[it]}
            </span>
          );
        })}
      </p>
    );
  };

  render() {
    const { loading, shareUrl } = this.state;
    const { printData, controls, signature } = this.props;
    const { workflow = [], approval = [], attributeName, advanceSettings = [] } = printData;
    const formNameSite = (advanceSettings.find(l => l.key === 'formNameSite') || {}).value || '0';
    const fontType = FONT_STYLE[printData.font || DEFAULT_FONT_SIZE];
    const formNameLeft = this.isShow(printData.formName, printData.formNameChecked && formNameSite === '1');
    const printFormatText = _.get(
      advanceSettings.find(l => l.key === 'printTime'),
      'value',
    );

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
                      <span className="preWrap WordBreak" style={STYLE_PRINT.reqTitle}>
                        {this.isShow(printData.formName, printData.formNameChecked && formNameSite === '0')
                          ? printData.formName
                          : ''}
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
              {formNameLeft && (
                <div style={STYLE_PRINT.fromName} className="generalTitle printFormName">
                  {printData.formName}
                </div>
              )}
              {/* 标题 */}
              <p
                style={{
                  ...STYLE_PRINT.createBy_h6,
                  fontSize: RecordTitleFont[fontType],
                  marginTop: formNameLeft ? 10 : 20,
                }}
                className="generalTitle"
              >
                {printData.titleChecked && attributeName}
              </p>
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
                    marginTop: 40,
                    marginBottom: 30,
                    width: 'auto',
                    boxSizing: 'content-box',
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
                        {[0, 1, 2, 3].map(tdIndex => (
                          <td
                            width={168}
                            style={{
                              width: 168,
                              height: 100,
                              paddingRight: tdIndex === 3 ? 0 : 20,
                            }}
                          >
                            {tdList[tdIndex] ? (
                              <React.Fragment>
                                <div
                                  style={{
                                    fontWeight: 'bold',
                                    height: 20,
                                    fontSize: TitleFont[fontType],
                                  }}
                                >
                                  {_.get(tdList[tdIndex], 'advancedSetting.hidetitle') === '1'
                                    ? ''
                                    : tdList[tdIndex].controlName}
                                </div>
                                <div className="infoSignature">
                                  <img
                                    style={{ marginTop: 20 }}
                                    src={tdList[tdIndex].value}
                                    onLoad={this.signLoadSet}
                                  />
                                </div>
                              </React.Fragment>
                            ) : null}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </table>
              ) : null}
              {(printData.printTime || printData.printAccount) && (
                <p
                  style={{
                    marginTop: 15,
                    textAlign: 'right',
                    width: '100%',
                    fontSize: 13,
                  }}
                  className="printInfo"
                >
                  {printData.printAccount && (
                    <span className="mRight24">
                      {_l('打印人：')}
                      {md.global.Account.fullname}
                    </span>
                  )}
                  {printData.printTime && (
                    <span>
                      {_l('打印时间：')}
                      {printFormatText
                        ? getDateToEn(printFormatText, dateConvertToUserZone(new Date()))
                        : dateConvertToUserZone(new Date())}
                    </span>
                  )}
                </p>
              )}
            </div>
          </ScrollView>
        )}
      </div>
    );
  }
}
