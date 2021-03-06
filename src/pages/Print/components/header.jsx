import React from 'react';
import './header.less';
import { Icon, Dropdown, Tooltip, Switch } from 'ming-ui';
import { fromType, printType, typeForCon, DEFAULT_FONT_SIZE, MIDDLE_FONT_SIZE, MAX_FONT_SIZE } from '../config';
import cx from 'classnames';
import Api from 'api/homeApp';
// import * as htmlDocx from 'html-docx-js/dist/html-docx';
// import {cssStr} from './wordcss';
// const juice = require('juice');
// import html2canvas from 'html2canvas';
// const jsPDF = require('jspdf');
class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: false,
      isUserAdmin: false,
    };
  }
  componentWillMount() {
    const { params } = this.props;
    const { type, from, appId, printType } = params;
    if (from === fromType.PRINT && type === typeForCon.NEW && appId && printType !== 'workflow') {
      Api.getAppDetail({ appId: appId }, { silent: true }).then(data => {
        this.setState({
          isUserAdmin: data.permissionType >= 100,
        });
      });
    }
    // document.querySelectorAll('img').forEach(e => {
    //   e.setAttribute('crossOrigin', 'anonymous');
    //   let src = e.getAttribute('src');
    //   e.setAttribute('src', `${__api_server__.main}File/ImageConvert?path=` + encodeURIComponent(src));
    // });
  }

  // genScreenshot = () => {
  //   const $wrap = document.getElementById('printContent');
  //   try {
  //     let width = $wrap.offsetWidth;
  //     let height = $wrap.offsetHeight;
  //     let canvas = document.createElement('canvas');
  //     let context = canvas.getContext('2d');
  //     let scaleBy = 2;
  //     canvas.width = width * scaleBy;
  //     canvas.height = height * scaleBy;
  //     context.scale(scaleBy, scaleBy);
  //     html2canvas($wrap, {
  //       backgroundColor: null,
  //       allowTaint: true,
  //       tainttest: false,
  //       scale: scaleBy,
  //       logging: false,
  //       width: width,
  //       height: height,
  //       canvas: canvas,
  //       useCORS: true,
  //     }).then(canvasData => {
  //       let pageData = canvasData.toDataURL('image/jpeg', 1.0);
  //       let pdf = new jsPDF('', 'pt', 'a4');
  //       let contentWidth = canvasData.width;
  //       let contentHeight = canvasData.height;
  //       //??????pdf??????html???????????????canvas??????;
  //       let pageHeight = (contentWidth / 592.28) * (841.89);
  //       //?????????pdf???html????????????
  //       let leftHeight = contentHeight;
  //       //????????????
  //       let position = 0;
  //       //a4????????????[595.28,841.89]???html???????????????canvas???pdf??????????????????
  //       let imgWidth = 595.28;
  //       let imgHeight = (592.28 / contentWidth) * contentHeight;
  //       //???????????????????????????????????????html?????????????????????????????????pdf???????????????(841.89)
  //       //??????????????????pdf????????????????????????????????????
  //       if (leftHeight < pageHeight) {
  //         pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
  //       } else {
  //         while (leftHeight > 0) {
  //           pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
  //           leftHeight -= pageHeight;
  //           position -= 841.89;
  //           //?????????????????????
  //           if (leftHeight > 0) {
  //             pdf.addPage();
  //           }
  //         }
  //       }
  //       pdf.save('content.pdf');
  //     });
  //   } catch (error) {
  //     alert(_l('????????????'));
  //   }
  // };

  render() {
    const { params, printData, handChange, saveTem, saveFn, downFn, showPdf } = this.props;
    const { printId, type, from, printType, isDefault } = params;
    const { isEdit } = this.state;
    return (
      <div className="headerBox Gray">
        <React.Fragment>
          {from === fromType.FORMSET && type !== typeForCon.PREVIEW && (
            <Icon
              icon="knowledge-return"
              className="mRight12 Font16"
              onClick={() => {
                this.props.onCloseFn();
              }}
            />
          )}
          {type === typeForCon.PREVIEW && <span className="Font17 Bold">{_l('??????: %0', printData.name)}</span>}
          {from === fromType.PRINT && type === typeForCon.NEW && <span className="Font17 Bold">{_l('????????????')}</span>}

          {from === fromType.FORMSET ? (
            // ????????????=???????????????
            <React.Fragment>
              {type === typeForCon.NEW && <span className="Font17 Bold">{_l('????????????')}</span>}
              {type === typeForCon.EDIT && <span className="Font17 Bold">{_l('????????????')}</span>}
              {type !== typeForCon.PREVIEW && (
                <React.Fragment>
                  {isEdit ? (
                    <input
                      type="text"
                      placeholder={_l('?????????????????????')}
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
                      {printData.name || _l('?????????????????????')}
                    </div>
                  )}
                </React.Fragment>
              )}
              <div className="Right">
                {type === typeForCon.PREVIEW ? (
                  <Icon
                    icon="clear_1"
                    className=" Font24"
                    onClick={() => {
                      this.props.onCloseFn();
                    }}
                  />
                ) : (
                  <React.Fragment>
                    <div
                      className="saveButton InlineBlock Hand Bold"
                      onClick={() => {
                        // saveTem();
                        if (!printData.name) {
                          alert(_l('?????????????????????'), 3);
                          return;
                        }
                        saveFn();
                      }}
                    >
                      {_l('??????')}
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
                  {_l('?????????????????????????????????????????????')}
                </span>
              )}
              <div className="Right">
                {from === fromType.PRINT && type === typeForCon.NEW && this.state.isUserAdmin && (
                  <span
                    className="btn Gray Hand"
                    onClick={() => {
                      saveTem();
                    }}
                  >
                    {_l('?????????????????????')}
                  </span>
                )}
                {isDefault ? (
                  <React.Fragment>
                    {/* <div className="saveForPDF InlineBlock Hand mRight30" onClick={(e) => {
                      e.preventDefault();
                      let convertImagesToBase64 = (content) => {
                        let regularImages = content.querySelectorAll("img");
                        let canvas = document.createElement('canvas');
                        let ctx = canvas.getContext('2d');
                        [].forEach.call(regularImages, (imgElement) => {
                          // preparing canvas for drawing
                          ctx.clearRect(0, 0, canvas.width, canvas.height);
                          imgElement.setAttribute("crossOrigin",'Anonymous')
                          canvas.width = imgElement.width;
                          canvas.height = imgElement.height;

                          ctx.drawImage(imgElement, 0, 0);
                          // by default toDataURL() produces png image, but you can also export to jpeg
                          // checkout function's documentation for more details
                          let dataURL = canvas.toDataURL();
                          imgElement.setAttribute('src', dataURL);
                        })
                        canvas.remove();
                      }
                      let content = document.getElementById('printContent').innerHTML;
                      convertImagesToBase64(document.getElementById('printContent'));
                      const str = `<!DOCTYPE html>
                                            <html lang="en">
                                            <head>
                                              <meta charset="UTF-8">
                                              <title>Document</title>
                                            </head>
                                            <body class='printTem' id='wordPrintCon'>
                                              ${content}
                                            </body>
                                            </html>`
                      let converted = htmlDocx.asBlob(juice.inlineContent(str, cssStr), { orientation: 'portrait', margins: { top: 720 } });
                      saveAs(converted, `${printData.name || _l('????????????')}.docx`);
                  }}>
                    <i className="icon-new_word"></i>
                    {_l('?????????word')}
                  </div> */}
                    {/* <div
                      className="printButton Hand InlineBlock bold mRight15"
                      onClick={() => {
                        this.genScreenshot();
                      }}
                    >
                      <i className="icon-print Font15 mRight10"></i>
                      {_l('???pdf')}
                    </div> */}
                    <div
                      className="printButton Hand InlineBlock bold mLeft20"
                      onClick={() => {
                        window.print();
                        return false;
                      }}
                    >
                      <i className="icon-print Font15 mRight10"></i>
                      {_l('??????')}
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
                      {_l('?????????word')}
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
