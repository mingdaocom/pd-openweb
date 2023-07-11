import React from 'react';
import './header.less';
import { Icon, LoadDiv } from 'ming-ui';
import { fromType, typeForCon } from '../config';
import cx from 'classnames';
import Api from 'api/homeApp';
import _ from 'lodash';
import html2canvas from 'html2canvas';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util.js';
import { addBehaviorLog } from 'src/util';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: false,
      isUserAdmin: false,
      exportLoading: false,
    };
  }

  componentWillMount() {
    const { params } = this.props;
    const { type, from, appId, printType } = params;
    if (from === fromType.PRINT && type === typeForCon.NEW && appId && printType !== 'flow') {
      Api.getAppDetail({ appId: appId }, { silent: true }).then(data => {
        this.setState({
          isUserAdmin: canEditApp(data.permissionType, data.isLock), //开发者|管理员
        });
      });
    }
  }

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

    Promise.all(promiseList).then(res => {
      let content = contentNode.innerHTML.replaceAll('figure', 'p');
      let noPrint = document.querySelector('#printContent .noPrint');

      const str = `<!DOCTYPE html>
                      <html lang="en" style="">
                      <head>
                        <meta charset="UTF-8">
                        <title>Document</title>
                      </head>
                      <body class='printTem' id='wordPrintCon' style="width: 800px;color: #333;line-height: 0;margin: 0px;padding: 0px;background-attachment: fixed;-webkit-text-size-adjust: none;line-height: 1.5;">
                        <div style="font-size: 0; line-height: 0;margin: 0; padding: 0;">${
                          noPrint ? content.replace(noPrint.outerHTML, '') : content
                        }</div>
                      </body>
                      </html>`;

      const param = {
        name: printData.name || printData.formName || '打印',
        html: str || '',
      };

      fetch(`${md.global.Config.WorksheetDownUrl}/ExportWord/ToWord`, {
        method: 'POST',
        body: JSON.stringify(param),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      })
        .then(res => res.blob())
        .then(data => {
          this.setState({ exportLoading: false });
          let blobUrl = window.URL.createObjectURL(data);
          const a = document.createElement('a');

          a.download = `${printData.name || printData.formName || '打印'}${new Date().getTime()}`;
          a.href = blobUrl;
          a.click();
        });
    });
  };

  render() {
    const { params, printData, handChange, saveTem, saveFn, downFn, showPdf } = this.props;
    const { printId, type, from, printType, isDefault, worksheetId, rowId } = params;
    const { isEdit, exportLoading, href } = this.state;

    return (
      <div className="headerBox Gray">
        <React.Fragment>
          {from === fromType.FORMSET && (
            <Icon
              icon="knowledge-return"
              className="mRight12 Font16"
              onClick={() => {
                this.props.onCloseFn();
              }}
            />
          )}
          {type === typeForCon.PREVIEW && <span className="Font17 Bold">{_l('预览: %0', printData.name)}</span>}
          {from === fromType.PRINT && type === typeForCon.NEW && <span className="Font17 Bold">{_l('系统打印')}</span>}

          {from === fromType.FORMSET ? (
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
                          ...printData,
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
                  <Icon icon="replay" className=" Font16 mRight10" />
                  {_l('生成失败时，请点击此处刷新试试')}
                </span>
              )}
              <div className="Right">
                {type === typeForCon.PREVIEW &&
                  isDefault &&
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
                      <i className="icon-file_download Gray_9e mRight3 TxtMiddle Font15"></i>
                      {_l('导出word')}
                    </div>
                  ))}

                {from === fromType.PRINT && type === typeForCon.NEW && this.state.isUserAdmin && (
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
                    <div
                      className="printButton Hand InlineBlock bold mLeft20"
                      onClick={() => {
                        addBehaviorLog('printRecord', worksheetId, { printId, rowId }); // 埋点
                        window.print();
                        return false;
                      }}
                    >
                      <i className="icon-print Font15 mRight10"></i>
                      {_l('打印')}
                    </div>
                  </React.Fragment>
                ) : (
                  showPdf && (
                    <div
                      className="saveForDocx Hand InlineBlock Gray_75"
                      onClick={() => {
                        downFn();
                      }}
                    >
                      <i className="icon-new_word Font15 mRight10"></i>
                      {_l('导出为word')}
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
