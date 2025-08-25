import React from 'react';
import cx from 'classnames';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { Icon, LoadDiv } from 'ming-ui';
import { addBehaviorLog } from 'src/utils/project';
import { fromType, typeForCon } from '../config';
import './header.less';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: false,
      exportLoading: false,
    };
  }

  componentWillMount() {}

  richTextImgHandle = () => {
    let richTextImgList = document.querySelectorAll('#printContent .richText img');

    if (richTextImgList.length > 0 && !$(richTextImgList[0]).attr('data-handleflag')) {
      richTextImgList.forEach((e, index) => {
        index === 0 && $(e).attr('data-handleflag', true);

        if (e.clientWidth < 450) return;

        $(e).attr({
          width: 400,
          style: `${$(e).attr('style') || ''}width: ${e.clientWidth}px`,
        });
      });
    }
  };

  exportWord = () => {
    this.richTextImgHandle();
    const { printData } = this.props;
    let contentNode = document.getElementById('printContent').cloneNode(true);
    let statisticsCardList = document.querySelectorAll('#printContent .statisticsCard');
    let contentCardList = contentNode.querySelectorAll('.statisticsCard');
    let width = 621;
    let height = 400;
    let scaleBy = 2;
    let promiseList = [];

    statisticsCardList.forEach((ele, index) => {
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      canvas.width = width * scaleBy;
      canvas.height = height * scaleBy;
      context.scale(scaleBy, scaleBy);

      let promise = html2canvas(ele, {
        backgroundColor: null,
        allowTaint: true,
        tainttest: false,
        scale: scaleBy,
        logging: false,
        width: width,
        height: height,
        canvas: canvas,
        useCORS: true,
        scrollY: 0,
      }).then(canvasData => {
        let imgEle = document.createElement('img');
        imgEle.src = canvasData.toDataURL('image/jpeg');
        imgEle.width = 400;
        let oldNode = contentCardList[index];
        oldNode.parentNode.appendChild(imgEle);
        oldNode.parentNode.removeChild(oldNode);

        return contentNode;
      });

      promiseList.push(promise);
    });

    Promise.all(promiseList).then(() => {
      let content = (contentNode.innerHTML || '').replace(/figure/g, 'p');
      let noPrint = document.querySelector('#printContent .noPrint');

      const str = `<!DOCTYPE html>
                      <html lang="en" style="">
                      <head>
                        <meta charset="UTF-8">
                        <title>Document</title>
                      </head>
                      <body class='printTem' id='wordPrintCon' style="width: 800px;color: #151515;line-height: 0;margin: 0px;padding: 0px;background-attachment: fixed;-webkit-text-size-adjust: none;line-height: 1.5;">
                        <div style="font-size: 0; line-height: 0;margin: 0; padding: 0;">${
                          noPrint ? content.replace(noPrint.outerHTML, '') : content
                        }</div>
                      </body>
                      </html>`;

      const param = {
        name: printData.name || printData.formName || '打印',
        html: str || '',
      };

      window
        .mdyAPI('', '', param, {
          ajaxOptions: {
            url: `${md.global.Config.WorksheetDownUrl}/ExportWord/ToWord`,
            responseType: 'blob',
          },
          customParseResponse: true,
        })
        .then(data => {
          this.setState({ exportLoading: false });
          const fileName = `${printData.name || printData.formName || '打印'}${new Date().getTime()}`;
          saveAs(data, fileName);
        });
    });
  };

  handlePrint = () => {
    const { params } = this.props;
    const { printId, worksheetId, rowId } = params;

    addBehaviorLog('printRecord', worksheetId, { printId, rowId }); // 埋点

    if (window.isSafari) {
      const printContentHtml = document.querySelector('.printContent').outerHTML;
      const printFrame = document.createElement('iframe');
      printFrame.name = 'printFrame';
      printFrame.style.cssText = 'position: absolute; top: -1000000px; width: 100%; height: 100%;';
      document.body.appendChild(printFrame);
      const frameDoc = printFrame.contentWindow || printFrame.contentDocument.document || printFrame.contentDocument;
      frameDoc.document.open();
      frameDoc.document.write(`<html><head></head><body>${printContentHtml}</body></html>`);
      frameDoc.document.close();

      if (!window.onafterprint) {
        const mediaQueryCallback = function (mql) {
          if (!mql.matches && printFrame) {
            document.body.removeChild(printFrame);
          }
        };
        const mediaQueryList = window.frames[printFrame.name].matchMedia('print');
        mediaQueryList.addListener(mediaQueryCallback);
        window.frames[printFrame.name].focus();
        window.frames[printFrame.name].onfocus = function () {
          return mediaQueryCallback(mediaQueryList);
        };
      }

      window.frames[printFrame.name].print();
      return false;
    }

    window.print();
    return false;
  };

  render() {
    const { params, printData, handChange, saveTem, saveFn, downFn, showPdf, isHaveCharge } = this.props;
    const { type, from, isDefault, fileTypeNum } = params;
    const { isEdit, exportLoading } = this.state;
    const allowDown = isHaveCharge || !printData.allowDownloadPermission;

    return (
      <div className={cx('headerBox Gray', { flexCenter: type === typeForCon.PREVIEW })}>
        <React.Fragment>
          {from === fromType.FORM_SET && (
            <Icon
              icon="backspace"
              className="mRight12 Font16"
              onClick={() => {
                this.props.onCloseFn();
              }}
            />
          )}
          {type === typeForCon.PREVIEW && (
            <span className="Font17 Bold flex overflow_ellipsis">{_l('预览: %0', printData.name)}</span>
          )}
          {from === fromType.PRINT && type === typeForCon.NEW && (
            <span className="Font17 Bold flex">{_l('系统打印')}</span>
          )}
          {from === fromType.FORM_SET ? (
            // 字段编辑=》打印模板
            <React.Fragment>
              {type === typeForCon.NEW && <span className="Font17 Bold">{_l('新建模板')}</span>}
              {type === typeForCon.EDIT && <span className="Font17 Bold">{_l('编辑模板')}</span>}
              {type !== typeForCon.PREVIEW && (
                <React.Fragment>
                  {isEdit ? (
                    <input
                      type="text"
                      placeholder={_l('请输入模板名称')}
                      className="tepName"
                      value={printData.name}
                      autoFocus
                      onChange={e => {
                        handChange({
                          name: e.target.value,
                        });
                      }}
                      onBlur={() => {
                        this.setState({
                          isEdit: false,
                        });
                      }}
                    />
                  ) : (
                    <div
                      className={cx('tepName InlineBlock', { noName: !printData.name })}
                      onClick={() => {
                        this.setState({
                          isEdit: true,
                        });
                      }}
                    >
                      {printData.name || _l('请输入模板名称')}
                    </div>
                  )}
                </React.Fragment>
              )}
              <div className="Right">
                {type !== typeForCon.PREVIEW && (
                  <React.Fragment>
                    <div
                      className="saveButton InlineBlock Hand Bold"
                      onClick={() => {
                        // saveTem();
                        if (!printData.name) {
                          alert(_l('请输入模板名称'), 3);
                          return;
                        }
                        saveFn();
                      }}
                    >
                      {_l('保存')}
                    </div>
                  </React.Fragment>
                )}
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {showPdf && (
                <span
                  className="refreshPdf"
                  onClick={() => {
                    $('.iframeDiv').attr('src', $('.iframeDiv').attr('src'));
                  }}
                >
                  <Icon icon="rotate" className=" Font16 mRight10" />
                  {_l('生成失败时，请点击此处刷新试试')}
                </span>
              )}
              <div className="Right">
                {type === typeForCon.PREVIEW &&
                  isDefault &&
                  allowDown &&
                  (exportLoading ? (
                    <div className="InlineBlock Gray_75">
                      <LoadDiv size="small" className="mRight5 InlineBlock" />
                      {_l('正在导出')}
                    </div>
                  ) : (
                    <div
                      className="exportForWord InlineBlock Gray_75 Hand"
                      onClick={() => this.setState({ exportLoading: true }, this.exportWord)}
                    >
                      <i className="icon-download Gray_9e mRight3 TxtMiddle Font15"></i>
                      {_l('导出Word')}
                    </div>
                  ))}

                {from === fromType.PRINT && type === typeForCon.NEW && this.props.isUserAdmin && (
                  <span
                    className="btn Gray Hand mLeft20"
                    onClick={() => {
                      saveTem();
                    }}
                  >
                    {_l('保存为打印模板')}
                  </span>
                )}
                {isDefault ? (
                  <React.Fragment>
                    <div className="printButton Hand InlineBlock bold mLeft20" onClick={this.handlePrint}>
                      <i className="icon-print Font15 mRight10"></i>
                      {_l('打印')}
                    </div>
                  </React.Fragment>
                ) : (
                  showPdf &&
                  allowDown && (
                    <div
                      className="saveForDocx Hand InlineBlock Gray_75"
                      onClick={() => {
                        downFn();
                      }}
                    >
                      <i className={` Font15 mRight10 ${fileTypeNum === 5 ? 'icon-new_excel' : 'icon-new_word'}`}></i>
                      {fileTypeNum === 5 ? _l('导出为excel') : _l('导出为word')}
                    </div>
                  )
                )}
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      </div>
    );
  }
}

export default Header;
