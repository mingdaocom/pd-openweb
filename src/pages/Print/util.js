import React from 'react';
import cx from 'classnames';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import { SYSTEM_CONTROL_WITH_UAID } from 'src/pages/widgetConfig/config/widget';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/setting.js';
import { getSwitchItemNames } from 'src/pages/widgetConfig/util';
import { SYST_PRINT, FILTER_SYS, USER_CONTROLS } from './config';
import { RichText } from 'ming-ui';
import _ from 'lodash';
import Embed from 'src/components/newCustomFields/widgets/Embed';
import BarCode from 'src/components/newCustomFields/widgets/BarCode';
import { getBarCodeValue, controlState } from 'src/components/newCustomFields/tools/utils';
import { parseDataSource } from 'src/pages/widgetConfig/util/setting.js';
import STYLE_PRINT from './components/exportWordPrintTemCssString';
import RegExpValidator from 'src/util/expression'; /*
  获取控件呈现内容
  sourceControlType: 他表字段type
  valueItem: 他表字段valueItem；[valueItem, valueItem]
  */
export const getPrintContent = (item, sourceControlType, valueItem, relationItemKey) => {
  let value = sourceControlType ? valueItem : item.value;
  let type = sourceControlType || item.type;
  let printOption = item.printOption;
  let dataItem = {
    ...item,
    value: value,
    //系统字段type处理
    type:
      type === 0
        ? ['ownerid', 'caid'].includes(item.controlId)
          ? 26
          : ['ctime', 'utime'].includes(item.controlId)
          ? 16
          : type
        : type,
  };

  switch (type) {
    case 36:
      const { showtype } = getAdvanceSetting(item);
      if (_.includes(['1', '2'], showtype)) {
        const itemnames = getSwitchItemNames(item, { needDefault: true });
        return _.get(
          _.find(itemnames, i => i.key === value),
          'value',
        );
      }
      return (
        <React.Fragment>
          <span style={{ fontSize: 10 }}>{value === '1' ? '☑ ' : '☐ '}</span>
          {item.hint}
        </React.Fragment>
      );
    //☑和☐
    case 6:
    case 8:
    case 20:
    case 31:
    case 37:
      if (item.noUnit) {
        return renderCellText(dataItem, { noUnit: item.noUnit });
      }
      // let _value = renderCellText(dataItem, { noUnit: !item.showUnit });
      let _value = renderCellText(dataItem);
      //带单位
      if (item.showUnit) {
        return _value;
      } else {
        return <div style={{ textAlign: item.isRelateMultipleSheet ? 'right' : 'left' }}>{_value}</div>;
      }
    case 14:
      const fileStyle = item.fileStyle || {};
      const id = item.isRelateMultipleSheet ? `${item.dataSource}_${item.controlId}` : item.controlId;

      return value ? renderRecordAttachments(value, item.isRelateMultipleSheet, fileStyle[id]) : '';
    case 28:
      return value
        ? _.get(
            _.find(getAdvanceSetting(item, 'itemnames') || [], i => i.key === `${value}`),
            'value',
          ) || _l('%0 级', value)
        : '';
    case 51:
      if (item.advancedSetting && !['2', '5', '6'].includes(item.advancedSetting.showtype) !== '2') {
        let records = [];
        try {
          records = JSON.parse(value);
        } catch (err) {
          return null;
        }
        let list = (dataItem.relationControls || []).find(o => o.attribute === 1) || [];
        if (list.type && ![29, 30, dataItem.sourceControlType].includes(list.type)) {
          dataItem = { ...dataItem, sourceControlType: list.type };
        }
        // 1 卡片 2 列表 3 文本
        if (item.advancedSetting && item.advancedSetting.showtype === '3') {
          //下拉 显示关联表名称
          if (item.isRelateMultipleSheet && records.length <= 0) {
            return '';
          }

          let titleControl = item.relationControls.find(l => l.attribute === 1) || item.relationControls[0] || {};

          return (
            <span className="relaList">
              {records
                .map(
                  l =>
                    renderCellText({ ...titleControl, value: l[titleControl.controlId] }) ||
                    l[titleControl.controlId] ||
                    _l('未命名'),
                )
                .join(', ')}
            </span>
          );
        }
        //关联表内除标题字段外的其他字段
        let showControlsList = [];
        item.showControls.map(o => {
          let data = (item.relationControls || []).find(it => it.controlId === o && it.attribute !== 1);
          if (data) {
            showControlsList.push(data);
          }
        });
        //关联表的标题字段
        let coverCidData = item.coverCid
          ? (item.relationControls || []).filter(o => item.coverCid === o.controlId)
          : [];
        //平铺的关联表多条显示除了附件外的前三个
        showControlsList = showControlsList.filter(o => o.type !== 14).splice(0, 3);
        // 1 卡片 显示关联表名称
        return _.isArray(records) && records.length > 0 ? (
          <table className="relaList" style={STYLE_PRINT.table} border="0" cellPadding="0" cellSpacing="0">
            <tbody>
              {records.map((da, i) => {
                let data = da;
                let coverCid = coverCidData.length > 0 ? coverCidData[0].controlId || '' : '';
                let cover = coverCid ? JSON.parse(data[coverCid] || '[]') : [];
                let coverData = cover.length > 0 ? cover[0] : '';
                let list = (item.relationControls || []).find(o => o.attribute === 1) || {};

                return (
                  <tr>
                    <td className="listTextDiv">
                      {list.type === 38
                        ? renderCellText(item.controls.find(it => it.attribute === 1))
                        : renderCellText({
                            ...dataItem,
                            type:
                              list.type && ![29, 30, item.sourceControlType].includes(list.type)
                                ? list.type
                                : item.sourceControlType,
                            value: data[list.controlId],
                          }) || _l('未命名')}
                      {showControlsList.map(it => {
                        if (it.type === 41 || it.type === 22) {
                          return '';
                        }
                        // 若设置不显示无内容字段=>计算内容
                        if (
                          item.showData &&
                          !getPrintContent(
                            {
                              ...it,
                              isRelateMultipleSheet: true,
                              showUnit: true,
                              printOption: false,
                              fileStyle: item.fileStyle,
                            },
                            it.type,
                            data[it.controlId],
                          )
                        ) {
                          return '';
                        }
                        return (
                          <div>
                            {it.controlName || _l('未命名')}
                            {' : '}
                            <div className="listRight">
                              {/* 关联表单选多选不需要特殊处理 printOption: false */}
                              {getPrintContent(
                                {
                                  ...it,
                                  isRelateMultipleSheet: true,
                                  showUnit: true,
                                  printOption: false,
                                  fileStyle: item.fileStyle,
                                },
                                it.type,
                                data[it.controlId],
                              ) || ''}
                            </div>
                          </div>
                        );
                      })}
                    </td>
                    {coverData && coverData.previewUrl && RegExpValidator.fileIsPicture(coverData.ext) && (
                      <td width="100px">
                        <img
                          style={{
                            width: 100,
                            height: 100,
                            verticalAlign: 'middle',
                          }}
                          className="cover thumbnail"
                          role="presentation"
                          src={
                            RegExpValidator.fileIsPicture(coverData.ext)
                              ? coverData.previewUrl.indexOf('imageView2') > -1
                                ? coverData.previewUrl.replace(
                                    /imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/,
                                    'imageView2/1/w/76/h/76/q/90',
                                  )
                                : `${coverData.previewUrl}&imageView2/1/w/76/h/76/q/90`
                              : coverData.previewUrl
                          }
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null;
      } else {
        return value;
      }
    case 29:
      if (item.advancedSetting && !['2', '5', '6'].includes(item.advancedSetting.showtype)) {
        //非列表
        let records = [];
        try {
          records = JSON.parse(value);
        } catch (err) {}
        let list = (dataItem.relationControls || []).find(o => o.attribute === 1) || [];

        if (list.type && ![29, 30, dataItem.sourceControlType].includes(list.type)) {
          dataItem = { ...dataItem, sourceControlType: list.type };
        }
        // 公式
        if (list.type === 53) {
          dataItem.enumDefault2 = list.enumDefault2;
        }

        // 1 卡片 2 列表 3 下拉
        if (item.advancedSetting && item.advancedSetting.showtype === '3') {
          //下拉 显示关联表名称
          if (records.length <= 0) {
            return '';
          }

          if (
            !item.isRelateMultipleSheet &&
            [11, 26].includes(dataItem.sourceControlType) &&
            dataItem.enumDefault === 2
          ) {
            dataItem = { ...dataItem, enumDefault: 1 };
          }

          return (
            <span className="relaList">
              {item.isRelateMultipleSheet ? (records[0] || {}).name : renderCellText(dataItem)}
            </span>
          );
        }
        //按文本形式 显示关联表标题字段（卡片，下拉）/数量（列表）
        if (item.isRelateMultipleSheet) {
          if (records.length <= 0) return '';
          const enumDefault = dataItem.type === 29 ? 1 : dataItem.enumDefault;

          return renderCellText({
            ...dataItem,
            enumDefault,
            advancedSetting: _.assign(
              item.advancedSetting,
              enumDefault === 1 ? _.get(item, 'sourceControl.advancedSetting') : {},
            ),
          });
        }
        //关联表内除标题字段外的其他字段
        let showControlsList = [];
        item.showControls.map(o => {
          let data = (item.relationControls || []).find(it => it.controlId === o && it.attribute !== 1);
          if (data) {
            showControlsList.push(data);
          }
        });
        //关联表的标题字段
        let coverCidData = item.coverCid
          ? (item.relationControls || []).filter(o => item.coverCid === o.controlId)
          : [];
        //平铺的关联表多条显示除了附件外的前三个
        showControlsList = showControlsList.filter(o => o.type !== 14);
        // 1 卡片 显示关联表名称
        return _.isArray(records) && records.length > 0 ? (
          <table className="relaList" style={STYLE_PRINT.table} border="0" cellPadding="0" cellSpacing="0">
            <tbody>
              {records.map((da, i) => {
                let data = JSON.parse(da.sourcevalue || '[]');
                let coverCid = coverCidData.length > 0 ? coverCidData[0].controlId || '' : '';
                let cover = coverCid ? JSON.parse(data[coverCid] || '[]') : [];
                let coverData = cover.length > 0 ? cover[0] : '';
                const type =
                  list.type && ![29, 30, item.sourceControlType].includes(list.type)
                    ? list.type
                    : item.sourceControlType;

                return (
                  <tr>
                    <td className="listTextDiv">
                      {list.type === 38
                        ? renderCellText(item.controls.find(it => it.attribute === 1))
                        : renderCellText({
                            ...dataItem,
                            type: type,
                            value:
                              type === 27 && da.name
                                ? JSON.stringify(safeParse(da.name, 'array').filter(l => !l.isDelete))
                                : da.name,
                          }) || _l('未命名')}
                      {showControlsList.map(it => {
                        if (it.type === 41 || it.type === 22) {
                          return '';
                        }
                        // 若设置不显示无内容字段=>计算内容
                        if (
                          item.showData &&
                          !getPrintContent(
                            {
                              ...it,
                              isRelateMultipleSheet: true,
                              showUnit: true,
                              printOption: false,
                              fileStyle: item.fileStyle,
                            },
                            it.type,
                            data[it.controlId],
                          )
                        ) {
                          return '';
                        }
                        return (
                          <div>
                            {it.controlName || _l('未命名')}
                            {' : '}
                            <div className="listRight">
                              {/* 关联表单选多选不需要特殊处理 printOption: false */}
                              {getPrintContent(
                                {
                                  ...it,
                                  isRelateMultipleSheet: true,
                                  showUnit: true,
                                  printOption: false,
                                  fileStyle: item.fileStyle,
                                },
                                it.type,
                                data[it.controlId],
                              ) || ''}
                            </div>
                          </div>
                        );
                      })}
                    </td>
                    {coverData && coverData.previewUrl && (
                      <td width="100px">
                        <img
                          style={{
                            width: 100,
                            height: 100,
                            verticalAlign: 'middle',
                          }}
                          className="cover thumbnail"
                          role="presentation"
                          src={
                            RegExpValidator.fileIsPicture(coverData.ext)
                              ? coverData.previewUrl.indexOf('imageView2') > -1
                                ? coverData.previewUrl.replace(
                                    /imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/,
                                    'imageView2/1/w/76/h/76/q/90',
                                  )
                                : `${coverData.previewUrl}&imageView2/1/w/76/h/76/q/90`
                              : coverData.previewUrl
                          }
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null;
      } else {
        // 关联表列表 显示表数量
        return value;
      }
    case 34: // 子表
      return value;
    case 42: {
      return value ? (
        <img
          src={value}
          style={{ maxHeight: 45, maxWidth: 160 }}
          onLoad={e => {
            $(e.target).attr({
              width: e.target.width,
              height: e.target.height,
            });
          }}
        />
      ) : (
        ''
      );
    }
    case 45: {
      return value && dataItem.enumDefault !== 3 ? (
        <Embed {...dataItem} formData={dataItem.controls} from="print" appId={item.appId} />
      ) : (
        ''
      );
    }
    case 47: {
      let barCodeData = { ...dataItem, formData: dataItem.controls };
      const { enumDefault, enumDefault2, dataSource, recordId, appId, worksheetId, viewIdForPermit, viewId, isView } =
        barCodeData;
      if (
        !getBarCodeValue({
          data: barCodeData.formData,
          control: { enumDefault, enumDefault2, dataSource: parseDataSource(dataSource) },
          codeInfo: { recordId, appId, worksheetId, viewId: viewId || viewIdForPermit },
        })
      ) {
        return '';
      }
      return <BarCode {...barCodeData} />;
    }
    case 41:
    case 10010:
      return (type === 41 ? value : value || item.dataSource) ? (
        <RichText data={value || item.dataSource} className="richText" disabled={true} />
      ) : (
        ''
      );
    case 30: {
      if (item.sourceControlType <= 0) {
        return '';
      }

      const showContent = getPrintContent(
        _.assign({}, item, _.pick(item.sourceControl, ['options'])),
        item.sourceControlType,
        value,
      );

      return showContent || '';
    }
    case 9: // OPTIONS 单选 平铺
    case 10: // MULTI_SELECT 多选
      if (!printOption || (type === 10 && _.get(item, ['advancedSetting', 'checktype']) === '1')) {
        return renderCellText(dataItem);
      } else {
        let selectedKeys = [];
        try {
          selectedKeys = JSON.parse(dataItem.value);
        } catch (err) {}
        return dataItem.options.map(o => {
          let str = '';
          if (type === 10 && o.hide && !selectedKeys.includes(o.key)) return null;

          if (selectedKeys.includes(o.key)) {
            str = type === 10 ? <i className={cx('InlineBlock', { zoomIcon: type === 10 })}>{'☑'}</i> : '■';
          } else {
            str = type === 10 ? <i className={cx('InlineBlock', { zoomIcon: type === 10 })}>{'☐'}</i> : '□';
          }
          return (
            <span className="InlineBlock pTop0 pBottom0" style={{ marginRight: 14 }}>
              <b className="InlineBlock TxtTop TxtCenter">{str}</b>
              {o.value}
            </span>
          );
        });
      }
    case 27: // 部门层级
      const { advancedSetting = {} } = dataItem;
      const _valueParse = safeParse(dataItem.value, 'array').filter(l => !l.isDelete);
      let textList = _valueParse.map(item => {
        const pathValue =
          advancedSetting.allpath === '1'
            ? (item.departmentPath || []).sort((a, b) => b.depth - a.depth).map(i => i.departmentName)
            : [];
        return pathValue.concat([item.departmentName]).join('/');
      });
      return textList.join('，');
    case 35:
      return typeof dataItem.value === 'undefined' ||
        dataItem.value === '' ||
        dataItem.value === '[]' ||
        dataItem.value === '["",""]' ||
        dataItem.value === null
        ? ''
        : renderCellText(dataItem) || _l('未命名');
    case 26: // 成员字段
      let parsedData = safeParse(value, 'array');
      const userKey = item.isRelateMultipleSheet ? `${item.dataSource}_${item.controlId}` : item.controlId;
      const userConfig = _.get(dataItem, `user_info.${userKey}`) || {};

      if (!_.isArray(parsedData)) {
        parsedData = [parsedData];
      }

      const textValue = parsedData
        .filter(user => !!user)
        .map(user => {
          const ext = USER_CONTROLS.map(l => (userConfig[l.controlId] ? user[l.controlId] || '' : ''))
            .filter(l => !!l)
            .join(';');

          return user.fullname + (ext ? `(${ext})` : '');
        })
        .join('、');

      return textValue;
    default:
      return renderCellText(dataItem);
  }
};

const getPictureImageUrl = data => {
  return data.previewUrl.indexOf('imageView2') > -1
    ? data.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/2/w/600/q/90')
    : `${data.previewUrl}${data.ext !== '.svg' ? '&imageView2/2/w/600/q/90' : ''}`;
};

// 附件的显示 fileStyle 0 缩略图 1 名称 默认0
export const renderRecordAttachments = (value, isRelateMultipleSheet, fileStyle = '0') => {
  let attachments;
  try {
    attachments = JSON.parse(value);
  } catch (err) {
    return <span className="mBottom5 InlineBlock" dangerouslySetInnerHTML={{ __html: '&nbsp;' }}></span>;
  }

  if (attachments.length <= 0) {
    return '';
  }

  const showPic = fileStyle === '0';
  const pictureAttachments = showPic
    ? attachments.filter(attachment => RegExpValidator.fileIsPicture(attachment.ext))
    : [];
  const otherAttachments = showPic
    ? attachments.filter(attachment => !RegExpValidator.fileIsPicture(attachment.ext))
    : attachments;

  return (
    <React.Fragment>
      {!!pictureAttachments.length &&
        (isRelateMultipleSheet ? (
          <div className={cx('recordAttachmentPictures', { bottomNoLine: !otherAttachments.length })}>
            {[
              ...new Array(
                isRelateMultipleSheet ? pictureAttachments.length : Math.ceil(pictureAttachments.length / 2) * 2,
              ),
            ].map((a, index) => (
              <div>
                {pictureAttachments[index] && (
                  <div
                    className="imgCon"
                    style={{
                      textAlign: 'center',
                      marginTop: index === 0 ? 0 : 5,
                    }}
                  >
                    <img
                      className="relationAttachmentPictures"
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
                      src={getPictureImageUrl(pictureAttachments[index])}
                      alt=""
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <table
            style={{
              ...STYLE_PRINT.table,
              width: 620,
              tableLayout: 'fixed',
            }}
            className={cx('recordAttachments', { isMultiple: isRelateMultipleSheet })}
          >
            <tbody
              style={{
                marginTop: -4,
                overflow: 'hidden',
                marginBottom: !otherAttachments.length ? -9 : 0,
                width: '100%',
              }}
            >
              {[...new Array(Math.ceil(pictureAttachments.length / 2))].map((a, index) => (
                <tr>
                  {[0, 1].map(i => (
                    <td width="50%" style={{ textAlign: 'center', border: 'none' }}>
                      {pictureAttachments[index * 2 + i] && (
                        <img
                          style={{
                            border: 'none',
                            maxHeight: 158,
                            maxWidth: '100%',
                          }}
                          src={getPictureImageUrl(pictureAttachments[index * 2 + i])}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      {isRelateMultipleSheet ? (
        <div className="recordAttachmentPictures">
          {otherAttachments.map(item => (
            <div className="pictureAttachment onlyText">
              <p className="imageAttachmentName ellipsis preWrap"> {item.originalFilename + item.ext} </p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ ...STYLE_PRINT.p, marginTop: 4, marginBottom: 0 }}>
          {otherAttachments.map(item => item.originalFilename + item.ext).join(' ; ')}
        </p>
      )}
    </React.Fragment>
  );
};

export const isVisible = (control, useControlPermissions = false) => {
  const fieldPermission = control.fieldPermission || '111';
  const controlPermission = !useControlPermissions || _.get(control, 'controlPermissions[0]') === '1';

  return fieldPermission[0] === '1' && controlPermission;
};

export const getVisibleControls = (controls, useControlPermissions = false) => {
  return controls.filter(control => isVisible(control, useControlPermissions));
};

//规则计算=>隐藏处理
export const getShowControl = (controls = []) => {
  if (controls.length <= 0) {
    return [];
  }
  let list = controls.map(control => {
    let { fieldPermission = '111' } = control;
    const [visible, editable, canAdd] = fieldPermission.split('');
    if (visible === '0') {
      return {
        ...control,
        checked: false,
      };
    } else {
      return control;
    }
  });
  return list;
};

// 关联表控件根据showControls排序
export const sortByShowControls = list => {
  let controls = [];
  list.showControls.map(id => {
    let l = list.relationControls.find(it => id === it.controlId);
    if (l && isVisible(l)) {
      controls.push(l);
    }
  });
  return controls;
};

//处理打印数据
export const getControlsForPrint = (receiveControls, relationMaps = {}, needVisible, additional) => {
  let controls = getShowControl(receiveControls)
    .filter(
      o => ![43, 49].includes(o.type) && !FILTER_SYS.includes(o.controlId) && (needVisible || controlState(o).visible),
    )
    .map(control => {
      const extendAttr = {};
      let _control = (_.get(additional, 'info.template.controls') || []).find(m => m.controlId === control.controlId);

      if (_control) {
        extendAttr.advancedSetting = _control.advancedSetting;
      }

      //关联表数据处理
      if (((control.type === 29 && control.enumDefault === 2) || control.type === 34) && control.checked) {
        extendAttr.relationControls = getShowControl(
          _.get(relationMaps[control.controlId], 'template.controls') || control.relationControls,
        );
        extendAttr.relationsData = relationMaps[control.controlId];
      }

      return {
        ...control,
        ...extendAttr,
      };
    });

  controls = controls.sort((a, b) => {
    if (a.row === b.row) {
      return a.col - b.col;
    } else {
      return a.row - b.row;
    }
  });
  // 模版打印/配置（新建模版）=> 不考虑显隐设置
  //系统打印需要根据用户权限显示
  return controls;
};

export const SYST_PRINTData = data => {
  return SYSTEM_CONTROL_WITH_UAID.map(o => {
    return { ...o, checked: data[SYST_PRINT[o.controlId]] };
  });
};

export const isRelation = control => {
  return (
    ([29, 51].includes(control.type) && ['2', '5', '6'].includes(_.get(control, 'advancedSetting.showtype'))) ||
    control.type === 34
  );
};

export const useUserPermission = control => {
  const [isHiddenOtherViewRecord] = (control.strDefault || '000').split('');
  return !!+isHiddenOtherViewRecord;
};
