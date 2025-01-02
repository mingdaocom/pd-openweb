import React from 'react';
import { getPrintContent } from '../util';
import { DEFAULT_FONT_SIZE } from '../config';
import _ from 'lodash';
import STYLE_PRINT from './exportWordPrintTemCssString';
import RegExpValidator from 'src/util/expression';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';
import DragMask from 'worksheet/common/DragMask';
import { v4 as uuidv4 } from 'uuid';
import { emitter } from 'worksheet/util';

let minPictureW = 169;
let minW = 33;

export default class TableRelation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      columnWidthChangeMaskVisible: false,
    };
    this.mdTabledId = props.id || uuidv4();
  }
  componentDidMount() {
    this.setData(this.props);
    const { printData } = this.props;
    $('.ant-table').css({
      fontSize: printData.font || DEFAULT_FONT_SIZE,
    });
    emitter.addListener('TRIGGER_CHANGE_COLUMN_WIDTH_MASK_' + this.mdTabledId, this.showColumnWidthChangeMask);
  }

  componentDidUpdate() {
    const { printData } = this.props;
    $('.ant-table').css({
      fontSize: printData.font || DEFAULT_FONT_SIZE,
    });
  }

  componentWillReceiveProps = function (nextProps) {
    if (
      !_.isEqual(nextProps.controls, this.props.controls) ||
      nextProps.showData !== this.props.showData ||
      !_.isEqual(nextProps.orderNumberCheck, this.props.orderNumberCheck) ||
      !_.isEqual(nextProps.fileStyle, this.props.fileStyle) ||
      !_.isEqual(nextProps.user_info, this.props.user_info)
    ) {
      this.setData(nextProps);
    }
  };

  componentWillUnmount() {
    emitter.removeListener('TRIGGER_CHANGE_COLUMN_WIDTH_MASK_' + this.mdTabledId, this.showColumnWidthChangeMask);
  }

  setData = props => {
    const { printData, dataSource, controls, orderNumberCheck, id, isShowFn, showData, fileStyle, user_info } = props;
    let list = [];

    if (orderNumberCheck) {
      list = [
        {
          title: _l('序号'),
          dataIndex: 'number',
          className: 'orderNumber',
          width: 50,
          render: (text, record, index) => index + 1,
        },
      ];
    }

    let controlsList = [];
    let sumWidth = 50;
    controls.map(it => {
      let da = false;
      dataSource.map((o, i) => {
        if (da) {
          return;
        }
        let data = {
          ...it,
          value: o[it.controlId],
        };
        if (
          isShowFn(
            getPrintContent({
              ...data,
              isRelateMultipleSheet: true,
              value: o[it.controlId],
              showData: showData,
              noUnit: true,
            }),
            true,
          )
        ) {
          da = true;
        }
      });
      if (da || !showData) {
        controlsList.push(it);
      }
    });

    controlsList.map(it => {
      if (it.type !== 22) {
        let isIn = this.isIn(it.controlId);
        let w = this.setDefaultWidth(controlsList, orderNumberCheck);
        let isPicture = this.isAttachments(it);
        let width = isIn
          ? isPicture
            ? Math.max(this.curStylesW(it.controlId), minPictureW)
            : this.curStylesW(it.controlId)
          : isPicture
          ? controlsList.length === 1
            ? 678
            : minPictureW
          : w;
        //不显示分割线
        sumWidth += width;
        list.push({
          title: [6, 8, 20, 31, 37].includes(it.type)
            ? `${it.controlName || _l('未命名')}`
            : it.controlName || _l('未命名'),
          type: it.type,
          dataIndex: `${it.controlId}-${id}`,
          className: `${it.controlId}-${id}`,
          width,
          controlId: it.controlId,
          control: it,
          render: (text, record, index) => {
            if ([29].includes(it.type) && !['2', '5', '6'].includes(it.advancedSetting.showtype)) {
              let list = (it.relationControls || []).find(o => o.attribute === 1) || {};

              if (list.type && ![29, 30].includes(list.type)) {
                it = { ...it, sourceControlType: list.type, advancedSetting: list.advancedSetting };
              }
            }

            return getPrintContent({
              ...it,
              isRelateMultipleSheet: true,
              value: record[it.controlId],
              fileStyle,
              user_info,
              dataSource: id,
            });
          },
        });
      }
    });

    list.forEach((l, index) => {
      if(index === 0) return;

      l.width = Math.floor(l.width * 728 / sumWidth);
    })

    this.setState({
      list: list,
    });
  };

  hasPicture = id => {
    const { dataSource } = this.props;
    let has = false;
    dataSource.map(it => {
      let attachments;
      try {
        attachments = JSON.parse(it[id]);
      } catch (err) {
        return;
      }
      const pictureAttachments = attachments.filter(attachment => RegExpValidator.fileIsPicture(attachment.ext));
      const otherAttachments = attachments.filter(attachment => !RegExpValidator.fileIsPicture(attachment.ext));
      has = pictureAttachments.length > 0 || otherAttachments.length > 0;
    });
    return has;
  };

  isAttachments = it => {
    return it.type === 14 || (it.type === 30 && it.sourceControlType === 14);
  };

  resizeWidth = (controlId, w) => {
    const { handChange } = this.props;
    const { list } = this.state;
    let n = list.findIndex(it => it.controlId === controlId);
    let width = list[n].width;
    let nextControl = list[n + 1];
    let nextWidth = nextControl.width;
    let data = [];
    let sumW = _.sum(list.map(it => it.width));

    list.map(it => {
      if (it.controlId === controlId) {
        data.push({
          ...it,
          width: w,
        });
      } else {
        if (it.controlId === nextControl.controlId) {
          data.push({
            ...it,
            width: width + nextWidth - w,
          });
        } else {
          data.push(it);
        }
      }
    });

    if (sumW !== _.sum(data.map(it => it.width))) {
      return;
    }

    this.setState(
      {
        list: data,
      },
      () => {
        let data = [];
        data = this.changeData(nextControl.controlId, width + nextWidth - w, this.changeData(controlId, w));
        handChange({
          controlStyles: data,
        });
      },
    );
  };

  changeData = (controlId, w, dataList) => {
    const { printData, id } = this.props;
    let { controlStyles = [] } = printData;
    let data = [];
    if (dataList) {
      controlStyles = dataList;
    }
    //存的时候 `${controlId}-${id}`
    let isData = controlStyles.map(it => it.controlId).includes(`${controlId}-${id}`);
    if (isData) {
      controlStyles.map(it => {
        if (it.controlId === `${controlId}-${id}`) {
          data.push({
            controlId: it.controlId,
            width: w,
          });
        } else {
          data.push(it);
        }
      });
    } else {
      data = controlStyles;
      data.push({
        controlId: `${controlId}-${id}`,
        width: w,
      });
    }
    return data;
  };

  isIn = controlId => {
    const { printData, id } = this.props;
    const { controlStyles = [] } = printData;
    let list = controlStyles.map(o => o.controlId);

    return list.includes(`${controlId}-${id}`) || list.includes(controlId);
  };

  curStylesW = controlId => {
    const { printData, id } = this.props;
    const { controlStyles = [] } = printData;
    let o = controlStyles.find(s => s.controlId === `${controlId}-${id}`);
    o = !o ? controlStyles.find(o => o.controlId === controlId) || {} : o; //兼容之前老数据

    return o.width;
  };

  setDefaultWidth = (controls, orderNumberCheck) => {
    let widthN = 0;
    let num = 0;
    controls.map(it => {
      let width = 0;
      //是否附件且有内容
      let isType14 = this.isAttachments(it);

      if (this.isIn(it.controlId)) {
        width = isType14 ? Math.max(this.curStylesW(it.controlId), minPictureW) : this.curStylesW(it.controlId);
        widthN = widthN + width;
        num = num + 1;
      } else {
        if (isType14) {
          width = minPictureW;
          widthN = widthN + width;
          num = num + 1;
        }
      }
    });
    // 728总宽度 50序号宽度
    let width = Math.floor((728 - widthN) / (controls.length - num));

    if (orderNumberCheck) {
      width = Math.floor((728 - 50 - widthN) / (controls.length - num));
    }

    return width;
  };

  showColumnWidthChangeMask = ({ columnIndex, columnWidth, defaultLeft, maskMinLeft, callback }) => {
    const { list } = this.state;

    if (columnIndex === list.length - 1) {
      return;
    }

    const min = this.isAttachments(list[columnIndex]) ? minPictureW : minW;
    const nextMin = this.isAttachments(list[columnIndex + 1]) ? minPictureW : minW;
    this.setState({
      columnWidthChangeMaskVisible: true,
      maskLeft: defaultLeft,
      maskMinLeft: maskMinLeft || defaultLeft - (columnWidth - min),
      maskMaxLeft: defaultLeft + list[columnIndex + 1].width - nextMin,
      maskOnChange: left => {
        this.setState({
          columnWidthChangeMaskVisible: false,
        });
        const newWidth = columnWidth + (left - defaultLeft);
        callback(newWidth);
      },
    });
  };

  render() {
    const { dataSource, orderNumberCheck, id, style = {} } = this.props;
    const { list, columnWidthChangeMaskVisible, maskLeft, maskMaxLeft, maskMinLeft, maskOnChange } = this.state;

    if (list.length <= 0 && !orderNumberCheck) {
      return '';
    }

    return (
      <div className={`sheetViewTable relative id-${this.mdTabledId}-id`}>
        {columnWidthChangeMaskVisible && (
          <DragMask value={maskLeft} min={maskMinLeft} max={maskMaxLeft} onChange={maskOnChange} />
        )}
        <table
          className="printRelationTable"
          style={{
            ...STYLE_PRINT.relationPrintTable,
            ...style,
            tableLayout: 'fixed',
          }}
          cellPadding="0"
          cellSpacing="0"
        >
          <tr>
            {list.map((item, index) => {
              const borderLeftNone = index === 0 ? { borderLeft: 'none' } : {};
              return item.dataIndex === 'number' ? (
                <td
                  style={{
                    width: item.width,
                    minWidth: item.width,
                    ...STYLE_PRINT.relationPrintTable_Tr_Th,
                    ...borderLeftNone,
                    padding: '5px',
                  }}
                >
                  {_l('序号')}
                </td>
              ) : (
                <td style={{ ...STYLE_PRINT.relationPrintTable_Tr_Th, ...borderLeftNone, width: item.width }}>
                  <BaseColumnHead
                    disableSort={true}
                    className={`ant-table-cell ${item.className}`}
                    style={{ width: item.width, padding: '5px' }}
                    control={item.control}
                    columnIndex={index}
                    updateSheetColumnWidths={({ controlId, value }) => {
                      this.resizeWidth(controlId, value);
                    }}
                  />
                </td>
              );
            })}
          </tr>
          {dataSource.map((item, i) => {
            return (
              <tr key={`print-relation-tr-${id}-${item.rowid}`}>
                {list.map((column, index) => {
                  const borderLeftNone = index === 0 ? { borderLeft: 'none' } : {};

                  return (
                    <td
                      style={{
                        width: column.width,
                        ...STYLE_PRINT.relationPrintTable_Tr_Td,
                        ...borderLeftNone,
                        borderBottomColor: index + 1 === column.length ? '#000' : '#ddd',
                      }}
                      className="WordBreak"
                      key={`print-relation-tr-${id}-${item.rowid}-${column.controlId}`}
                    >
                      {column.render(item[column.dataIndex], item, i)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </table>
      </div>
    );
  }
}
