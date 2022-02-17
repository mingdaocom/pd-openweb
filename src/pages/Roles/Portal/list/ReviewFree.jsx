import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Icon, Dialog, Dropdown } from 'ming-ui';
import 'uploadAttachment';
import cx from 'classnames';
import noVerifyAjax from 'src/api/noVerify';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { getUserCollect } from 'src/api/externalPortal';

const Wrap = styled.div`
  .up {
    color: #2196f3;
    &:hover {
      color: #1e88e5 !important;
    }
    span {
      display: inline-block;
      vertical-align: middle;
    }
  }
  .listCon {
    background: #f8f8f8;
    border-radius: 6px;
    padding: 13px 16px;
    display: flex;
    .act {
      width: 70px;
      display: inline-block;
      float: right;
    }
  }
  .List {
    h6 {
    }
    .listLiHeader {
      color: #9e9e9e;
      font-size: 12px;
    }
    .listLi {
      display: flex;
    }
    .columnTxt {
      flex: 1;
      height: 36px;
      background: #f8f8f8;
      border-radius: 3px;
    }
    .iconBox {
      padding: 0;
      width: 10%;
      text-align: center;
    }
    .Dropdown {
      flex: 1;
      max-width: 45%;
    }
    .Dropdown--input {
      display: flex;
      line-height: 36px;
      padding: 0 10px !important;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 3px;
      .value,
      .Dropdown--placeholder {
        flex: 1;
      }
      i {
        &::before {
          line-height: 36px;
        }
      }
    }
  }
`;
export default function ReviewFree(props) {
  const { appId, onCancel, show } = props;
  const [controls, setControls] = useState([]);
  const [cellConfigs, setCellConfigs] = useState([]); //免审名单
  const [cells, setCells] = useState([]); //免审文件内容信息
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState(''); //免审文件名
  const [uploadLoading, setUploadLoading] = useState(false); //
  const [canDown, setCanDown] = useState(false); //
  const postUploader = () => {
    if (uploadLoading) {
      return;
    }
    $('#hideUpload').uploadAttachment({
      filterExtensions: 'xlsx,xls,xlsm',
      pluploadID: '#upload',
      multiSelection: false,
      maxTotalSize: 4,
      folder: 'reviewFree',
      onlyFolder: true,
      onlyOne: true,
      styleType: '0',
      tokenType: 0,
      checkProjectLimitFileSizeUrl: '',
      filesAdded: function () {
        setUploadLoading(true);
      },
      callback: function (attachments) {
        if (attachments.length > 0) {
          const attachment = attachments[0];
          setFileUrl(attachment.serverName + attachment.key);
          setFileName(attachment.originalFileName + attachment.fileExt);
          setCellConfigs([]);
          setCanDown(false);
        }
      },
    });
  };
  const getControls = () => {
    getUserCollect({
      appId,
      getSystem: true,
    }).then(res => {
      setControls(res);
    });
  };
  //当前免审名单相关信息
  const getInfo = () => {
    noVerifyAjax.get({ appId }).then(res => {
      setFileName(res.fileName);
      setCellConfigs(res.cellConfigs || []);
      setFileUrl(res.fileUrl || '');
      setCanDown(!!res.fileUrl);
    });
  };
  //上传的文件的列信息
  const getPreviewCell = () => {
    if (fileUrl) {
      noVerifyAjax.getPreview({ fileUrl }).then(res => {
        setCells(res[0].cells || []);
      });
    }
  };
  useEffect(() => {
    postUploader();
    getInfo();
    getPreviewCell();
  }, []);
  useEffect(() => {
    getPreviewCell();
    fileUrl && getControls();
  }, [fileUrl]);
  const update = () => {
    noVerifyAjax
      .update({
        appId,
        fileUrl,
        fileName,
        cellConfigs,
      })
      .then(res => {
        setCanDown(!!res.fileUrl);
        onCancel();
      });
  };
  return (
    <Dialog
      className="showReviewFree Hand"
      width="580"
      visible={show}
      title={<span className="Font17 Bold">{_l('配置免审名单')}</span>}
      onCancel={onCancel}
      onOk={() => {
        if (cellConfigs.length <= 0) {
          return alert(_l('请配置映射字段'), 3);
        }
        update();
      }}
    >
      <Wrap>
        <p className="Gray_9e pAll0 mBottom2">{_l('上传Excel配置免审，只要信息匹配成功，访问应用时即可免予审核')}</p>
        <p className="Gray_9e pAll0 mBottom10">
          {_l('Excel表格第一行必须是字段名称，只需上传需要匹配的字段及内容，字段只能是用户列表展示字段。')}
        </p>
        <input id="hideUpload" type="file" className="Hidden" />
        <div className="Hidden" id="upload" />
        {!fileUrl ? (
          <React.Fragment>
            <div
              className="up Hand InlineBlock"
              onClick={() => {
                $('#upload').click();
              }}
            >
              <Icon className="Font18 TxtMiddle mRight6" type="cloud_upload" />
              <span>{_l('上传免审配置')}</span>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="listCon">
              <span className="txt flex flexRow">
                <Icon className="Font18 TxtMiddle" type="new_excel" style={{ color: '#4CAF50' }} />
                <span className="mLeft8 mRight8 flex overflow_ellipsis Font13 WordBreak"> {fileName}</span>
              </span>
              {canDown && (
                <span
                  className="act ThemeColor3 Hand"
                  onClick={() => {
                    let ajaxUrl = md.global.Config.AjaxApiUrl + 'Download/Verify/' + appId;
                    let str = `<form action=${ajaxUrl} method="noVerifyAjax.get" id="forms">
                                  <input type="submit" value="提交"/>
                              </form>`;
                    $('body').append(str);
                    $('#forms').submit().remove();
                  }}
                >
                  <Icon className="Font18 TxtMiddle" type="cloud_download" /> {_l('下载')}
                </span>
              )}
              <span
                className="act ThemeColor3 Hand"
                onClick={() => {
                  $('#upload').click();
                }}
              >
                <Icon className="Font18 TxtMiddle" type="refresh" /> {_l('更新')}
              </span>
              <span
                className="act Red"
                onClick={() => {
                  noVerifyAjax
                    .delete({
                      appId,
                    })
                    .then(res => {
                      setCellConfigs([]);
                      setCells([]);
                      setFileUrl('');
                      setFileName(''); //免审文件名
                      setCanDown(false);
                    });
                }}
              >
                <Icon className="Font18 TxtMiddle Hand" type="trash" /> {_l('删除')}
              </span>
            </div>
            <div className="List mTop32">
              <h6 className="">{_l('配置免审映射字段')}</h6>
              <p className="Gray_9e pAll0 mBottom10">
                {_l(
                  '外部用户注册/登录时收集到的信息会与此名单的字段内容做匹配，完全匹配成功后不需要管理员可直接访问应用',
                )}
              </p>
              <div className="listLiHeader"></div>
              {controls.map((o, i) => {
                const cell = cells.map(item => {
                  return {
                    ...item,
                    value: item.columnNum,
                    text: item.columnName,
                    disabled: cellConfigs.map(o => o.columnNum).includes(item.columnNum),
                  };
                });
                return (
                  <div className="listLi mBottom6" key={i}>
                    <span className="columnTxt InlineBlock LineHeight36">
                      <Icon className="Font18 TxtMiddle Gray_9e mLeft15 mRight8" icon={getIconByType(o.type, false)} />
                      {o.controlName}
                    </span>
                    <span className="iconBox InlineBlock TxtBottom LineHeight36">
                      <Icon className="Font18 ThemeColor3" type="arrow_forward" />
                    </span>
                    <Dropdown
                      key={o.controlId + '_Dropdown'}
                      isAppendToBody
                      data={cell}
                      placeholder={_l('请选择')}
                      value={(cellConfigs.find(item => item.controlId === o.controlId) || {}).columnNum}
                      className={cx('flex InlineBlock')}
                      onChange={newValue => {
                        if (cellConfigs.map(o => o.columnNum).includes(newValue)) {
                          alert(_l('该列已匹配过'), 3);
                          setCellConfigs(cellConfigs);
                          return;
                        }
                        const cellConfigsIds = cellConfigs.map(item => item.controlId);
                        let itemCell = cells
                          .filter(item => !cellConfigs.map(a => a.columnNum).includes(item.columnNum))
                          .find(item => item.columnNum === newValue);
                        let newdata = {
                          controlId: o.controlId,
                          columnName: itemCell.columnName,
                          columnNum: newValue,
                          controlName: o.controlName,
                        };
                        if (cellConfigsIds.includes(o.controlId)) {
                          setCellConfigs(
                            cellConfigs.map(item => {
                              if (item.controlId === o.controlId) {
                                return newdata;
                              } else {
                                return item;
                              }
                            }),
                          );
                        } else {
                          setCellConfigs([...cellConfigs, newdata]);
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        )}
      </Wrap>{' '}
    </Dialog>
  );
}
