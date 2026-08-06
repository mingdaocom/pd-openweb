import React from 'react';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import DragMask from 'worksheet/common/DragMask';
import { emitter } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import { BASE_PRINT_CONTENT_WIDTH, DEFAULT_FONT_SIZE } from '../../core/config';
import STYLE_PRINT from '../../core/exportWordPrintTemCssString';
import getPrintContent from '../../core/getPrintContent';
import { getFormData } from '../../core/util';
import TableCommon from './TableCommon';
import TableRToC from './TableRToC';
import { getRelationCellPrintData } from './utils';

const BASE_MIN_PICTURE_WIDTH = 169;
const BASE_MIN_WIDTH = 33;
const BASE_ORDER_NUMBER_WIDTH = 50;

export default class RelationTable extends React.Component {
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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (
        !_.isEqual(this.props.controls, prevProps.controls) ||
        this.props.showData !== prevProps.showData ||
        !_.isEqual(this.props.orderNumberCheck, prevProps.orderNumberCheck) ||
        !_.isEqual(this.props.fileStyle, prevProps.fileStyle) ||
        !_.isEqual(this.props.user_info, prevProps.user_info) ||
        !_.isEqual(this.props.printData, prevProps.printData)
      ) {
        this.setData(this.props);
      }
    }

    const { printData } = this.props;
    $('.ant-table').css({
      fontSize: printData.font || DEFAULT_FONT_SIZE,
    });
  }

  componentWillUnmount() {
    emitter.removeListener('TRIGGER_CHANGE_COLUMN_WIDTH_MASK_' + this.mdTabledId, this.showColumnWidthChangeMask);
  }

  setData = props => {
    const {
      dataSource,
      controls,
      allControls,
      contentWidth = BASE_PRINT_CONTENT_WIDTH,
      orderNumberCheck,
      id,
      isShowFn,
      showData,
      fileStyle,
      user_info,
      dataInfo,
      tableList,
      printData,
    } = props;
    const { realShowData, enableEmptyPlaceholder, emptyPlaceholderMode } = printData;
    const contentShowParams = {
      realShowData,
      enableEmptyPlaceholder,
      emptyPlaceholderMode,
    };
    let list = [];
    const scale = contentWidth / BASE_PRINT_CONTENT_WIDTH;
    const minPictureW = Math.round(BASE_MIN_PICTURE_WIDTH * scale);
    const minW = Math.round(BASE_MIN_WIDTH * scale);
    const orderNumberWidth = Math.round(BASE_ORDER_NUMBER_WIDTH * scale);

    if (orderNumberCheck) {
      list = [
        {
          title: _l('序号'),
          dataIndex: 'number',
          className: 'orderNumber',
          width: orderNumberWidth,
          render: (text, record, index) => index + 1,
        },
      ];
    }

    let controlsList = [];
    let sumWidth = orderNumberCheck ? orderNumberWidth : 0;

    controls.map(it => {
      let da = false;

      dataSource.map(o => {
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
              ...dataInfo,
              ...data,
              isRelateMultipleSheet: true,
              value: o[it.controlId],
              showData: showData,
              noUnit: true,
              controls: getFormData(controls, o),
              allControls: getFormData(allControls, o),
              ...contentShowParams,
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

    controlsList.forEach(it => {
      if (it.type !== 22) {
        let isIn = this.isIn(it.controlId);
        let w = this.setDefaultWidth(controlsList, orderNumberCheck, contentWidth);
        let isPicture = this.isAttachments(it);
        let width = isIn
          ? isPicture
            ? Math.max(this.curStylesW(it.controlId), minPictureW)
            : this.curStylesW(it.controlId)
          : isPicture
            ? controlsList.length === 1
              ? contentWidth - orderNumberWidth
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
          render: (text, record) => {
            if ([29].includes(it.type) && !['2', '5', '6'].includes(it.advancedSetting.showtype)) {
              let list = (it.relationControls || []).find(o => o.attribute === 1) || {};

              if (list.type && ![29, 30].includes(list.type)) {
                it = { ...it, sourceControlType: list.type, advancedSetting: list.advancedSetting };
              }
            }

            return getPrintContent({
              ...it,
              ...getRelationCellPrintData({ control: it, dataInfo, tableList, record }),
              fileStyle,
              user_info,
              controls: getFormData(controls, record),
              allControls: getFormData(allControls, record),
              ...contentShowParams,
            });
          },
        });
      }
    });

    list.forEach((l, index) => {
      if (index === 0) return;
      let isPicture = this.isAttachments(l.control);

      l.width = Math.max(Math.floor((l.width * contentWidth) / sumWidth), isPicture ? minPictureW : minW);
    });

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
        console.log(err);
        return;
      }

      const pictureAttachments = attachments.filter(attachment => RegExpValidator.fileIsPicture(attachment.ext));
      const otherAttachments = attachments.filter(attachment => !RegExpValidator.fileIsPicture(attachment.ext));
      has = pictureAttachments.length > 0 || otherAttachments.length > 0;
    });
    return has;
  };

  isAttachments = it => {
    if (!it) return false;
    return [14, 42].includes(it.type) || (it.type === 30 && it.sourceControlType === 14);
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

    list.forEach(it => {
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

  setDefaultWidth = (controls, orderNumberCheck, contentWidth = BASE_PRINT_CONTENT_WIDTH) => {
    const scale = contentWidth / BASE_PRINT_CONTENT_WIDTH;
    const minPictureW = Math.round(BASE_MIN_PICTURE_WIDTH * scale);
    const orderNumberWidth = Math.round(BASE_ORDER_NUMBER_WIDTH * scale);
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
    let width = Math.floor((contentWidth - widthN) / (controls.length - num));

    if (orderNumberCheck) {
      width = Math.floor((contentWidth - orderNumberWidth - widthN) / (controls.length - num));
    }

    return width;
  };

  showColumnWidthChangeMask = ({ columnIndex, columnWidth, defaultLeft, maskMinLeft, callback }) => {
    const { list } = this.state;
    const { contentWidth = BASE_PRINT_CONTENT_WIDTH } = this.props;
    const scale = contentWidth / BASE_PRINT_CONTENT_WIDTH;
    const minPictureW = Math.round(BASE_MIN_PICTURE_WIDTH * scale);
    const minW = Math.round(BASE_MIN_WIDTH * scale);

    if (columnIndex >= list.length - 1) {
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
    const { dataSource, orderNumberCheck, id, style = {}, relationStyleNum, printData, contentWidth } = this.props;
    const { realShowData, enableEmptyPlaceholder, emptyPlaceholderMode } = printData;
    const placeholderMode =
      realShowData && !!Number(enableEmptyPlaceholder) && emptyPlaceholderMode ? emptyPlaceholderMode : '';
    const { list, columnWidthChangeMaskVisible, maskLeft, maskMaxLeft, maskMinLeft, maskOnChange } = this.state;

    if (list.length <= 0 && !orderNumberCheck) {
      return '';
    }

    const TableComponent = relationStyleNum.type === 3 ? TableRToC : TableCommon;
    const tableProps = {
      style: {
        ...STYLE_PRINT.relationPrintTable,
        ...style,
        tableLayout: 'fixed',
      },
      cellPadding: '0',
      cellSpacing: '0',
    };

    return (
      <div className={`sheetViewTable relative id-${this.mdTabledId}-id`}>
        {columnWidthChangeMaskVisible && (
          <DragMask value={maskLeft} min={maskMinLeft} max={maskMaxLeft} onChange={maskOnChange} />
        )}
        <TableComponent
          list={list}
          contentWidth={contentWidth}
          dataSource={dataSource}
          id={id}
          tableProps={tableProps}
          placeholderMode={placeholderMode}
          resizeWidth={this.resizeWidth}
        />
      </div>
    );
  }
}
