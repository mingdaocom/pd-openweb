import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Icon, Dialog, Dropdown, Radio } from 'ming-ui';
import 'src/components/uploadAttachment/uploadAttachment';
import cx from 'classnames';
import noVerifyAjax from 'src/api/noVerify';
import externalPortalAjax from 'src/api/externalPortal';
import { SwitchStyle } from 'src/pages/Role/PortalCon/setting/BaseSet.jsx';
import ReviewFreeByWorksheetWrap from './ReviewFreeByWorksheetWrap';
import ReviewFreeMap from './ReviewFreeMap';
import _ from 'lodash';
const Wrap = styled.div`
  .switchTextP {
    line-height: 40px !important;
  }
  .conditionItemHeader {
    display: flex;
    align-items: center;
    padding-right: 0 !important;
    .relation {
      display: inline-block;
      &:hover {
        background-color: #fff !important;
      }
    }
  }
  .worksheetFilterDateCondition {
    & > div {
      width: 100%;
      display: flex;
      align-items: center;
      .dateValue,
      .dateType,
      .customDate {
        flex: 1;
      }
      .dateValue,
      .customDate {
        margin-left: 10px;
        margin-top: 0 !important;
      }
      .dateValue {
        display: flex;
        align-items: center;
      }
      .dateInputCon .ming.Dropdown {
        height: 34px;
        background: none;
      }
    }
  }
  .conditionValue {
    flex: 1;
    min-width: 0;
  }
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
const list = ['导入Excel数据', '从工作表获取数据'];
export default function ReviewFree(props) {
  const { appId, projectId, onCancel, show, data, onChangePortalVersion, canChooseOtherApp } = props;
  const [cellConfigs, setCellConfigs] = useState([]); //免审名单
  const [controls, setControls] = useState([]);
  const [cells, setCells] = useState([]); //免审文件内容信息
  const [fileUrl, setFileUrl] = useState('');
  const [query, setQuery] = useState();
  const [type, setType] = useState(0); //免审类型 0 = excel ,1= 工作表查询
  const [status, setStatus] = useState(false); //是否开启免审
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
    externalPortalAjax
      .getUserCollect({
        appId,
        getSystem: true,
      })
      .then(res => {
        setControls(res);
      });
  };
  //当前免审名单相关信息
  const getInfo = () => {
    let res = data;
    setFileName(res.fileName);
    setCellConfigs(res.cellConfigs || []);
    setFileUrl(res.fileUrl || '');
    setCanDown(!!res.fileUrl);
    setType(res.type);
    setStatus(res.status);
    setQuery(res.query);
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
    getControls();
  }, []);

  useEffect(() => {
    getPreviewCell();
  }, [fileUrl]);

  const update = () => {
    if (cellConfigs.length <= 0 && status === 0 && type === 0) {
      return alert(_l('还未设置免审'), 3);
    }
    if (status === 0 && type === 1 && (_.get(query, ['configs']) || []).length <= 0) {
      return alert(_l('还未设置免审'), 3);
    }
    let param =
      status === 1
        ? {
            appId,

            status,
          }
        : {
            appId,
            fileUrl,
            fileName,
            cellConfigs,
            type,
            status,
            query: { ..._.pick(query, ['id', 'sourceId', 'items', 'configs', 'templates', 'sourceType']) },
          };
    noVerifyAjax.update(param).then(res => {
      if (res.success) {
        props.setData({
          ...data,
          query,
          fileUrl,
          fileName,
          cellConfigs,
          type,
          status,
        });
        onChangePortalVersion(res.version);
        setCanDown(!!res.fileUrl);
        onCancel();
        props.getInfo();
      } else {
        alert(_l('配置失败，请稍后再试'), 3);
      }
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
        update();
      }}
    >
      <Wrap>
        <p className="Gray_9e pAll0 mBottom2 mTop2 Font14 Gray_75">
          {_l('用户注册时填写的内容如和免审中指定字段内容一致，则无需审核直接访问应用。')}
        </p>
        <SwitchStyle
          className="Hand InlineBlock"
          onClick={() => {
            setStatus(status === 0 ? 1 : 0);
          }}
        >
          <Icon icon={status === 0 ? 'ic_toggle_on' : 'ic_toggle_off'} className="Font40" />
          <div className="switchText switchTextP mLeft8 InlineBlock Gray Hand">
            {status === 0 ? _l('开启') : _l('关闭')}
          </div>
        </SwitchStyle>
        <input id="hideUpload" type="file" className="Hidden" />
        <div className="Hidden" id="upload" />
        {status === 0 && (
          <React.Fragment>
            <p className="pAll0 mTop20 Bold">{_l('数据源')}</p>
            <div className="mBottom18">
              {list.map((o, i) => {
                return (
                  <Radio
                    className="mRight60 pRight10"
                    text={o}
                    checked={i === type}
                    onClick={() => {
                      setType(i);
                    }}
                  />
                );
              })}
            </div>

            {type === 1 ? (
              <ReviewFreeByWorksheetWrap
                query={query}
                appId={appId}
                canChooseOtherApp={canChooseOtherApp}
                projectId={projectId}
                onChange={query => {
                  setQuery(query);
                }}
              />
            ) : !fileUrl ? (
              <div className="listCon">
                <div
                  className="up Hand InlineBlock"
                  onClick={() => {
                    $('#upload').click();
                  }}
                >
                  <Icon className="Font18 TxtMiddle mRight6" type="cloud_upload" />
                  <span>{_l('上传免审配置')}</span>
                </div>
              </div>
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
                      if (!data.fileUrl) {
                        setCellConfigs([]);
                        setCells([]);
                        setFileUrl('');
                        setFileName(''); //免审文件名
                        setCanDown(false);
                      } else {
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
                      }
                    }}
                  >
                    <Icon className="Font18 TxtMiddle Hand" type="trash" /> {_l('删除')}
                  </span>
                </div>
              </React.Fragment>
            )}
            <ReviewFreeMap
              type={type}
              query={query}
              controls={controls || []}
              cell={{
                cells,
                cellConfigs,
              }}
              onChange={obj => {
                if (type === 1) {
                  setQuery({
                    ...query,
                    ...obj,
                  });
                } else {
                  setCellConfigs(obj);
                }
              }}
            />
          </React.Fragment>
        )}
      </Wrap>
    </Dialog>
  );
}
