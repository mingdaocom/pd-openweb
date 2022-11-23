import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import { Icon, Dialog, Checkbox, LoadDiv } from 'ming-ui';
import 'src/components/uploadAttachment/uploadAttachment';
import { importExAccounts } from 'src/api/externalPortal';
import { editIsSendMsgs } from 'src/api/externalPortal';
import { getPssId } from 'src/util/pssId';

const Wrap = styled.div`
  .listCon {
    background: #f8f8f8;
    border-radius: 6px;
    padding: 13px 16px;
    display: flex;
  }
  .down,
  .uploadUser {
    color: #2196f3;
    &:hover {
      color: #1e88e5 !important;
    }
    span {
      display: inline-block;
      vertical-align: middle;
    }
  }
`;
function AddUserDialog(props) {
  const { appId, show, setAddUserDialog, getUserList, changeIsSendMsgs } = props;
  const [isSendMsgs, setIsSend] = useState(props.isSendMsgs); //
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState(''); //文件名
  const [loading, setLoading] = useState(false); //
  /**
   * 创建上传
   */
  const createUploader = () => {
    $('#hideUploadUser').uploadAttachment({
      filterExtensions: 'xlsx,xls,xlsm',
      pluploadID: '#uploadUser',
      multiSelection: false,
      maxTotalSize: 4,
      folder: 'addUser',
      onlyFolder: true,
      onlyOne: true,
      styleType: '0',
      tokenType: 0,
      checkProjectLimitFileSizeUrl: '',
      filesAdded: function () {
        setLoading(true);
      },
      callback: function (attachments) {
        if (attachments.length > 0) {
          const attachment = attachments[0];
          setFileUrl(attachment.serverName + attachment.key);
          setFileName(attachment.originalFileName + attachment.fileExt);
          // update(attachment.serverName + attachment.key);
          setLoading(false);
        }
      },
    });
  };
  useEffect(() => {
    createUploader();
  }, []);

  const update = () => {
    setLoading(true);
    editIsSendMsgs({
      appId,
      isSendMsgs,
    }).then(res => {
      changeIsSendMsgs(isSendMsgs);
      importExAccounts({
        fileUrl: fileUrl,
        appId,
      }).then(
        res => {
          const { existedData = [], success } = res;
          setAddUserDialog(false);
          if (success) {
            getUserList();
          }
          if (existedData.length > 0) {
            return alert(_l('有%0个用户不能重复邀请', existedData.length), 3);
          } else if (success) {
            return alert(_l('邀请成功'));
          } else if (!success) {
            return alert(_l('邀请失败，请稍后再试'), 3);
          }
          setLoading(false);
        },
        () => {
          setLoading(false);
        },
      );
    });
  };
  const downLoadByUrl = url => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Authorization', `md_pss_id ${getPssId()}`);
    xhr.setRequestHeader('AccountId', `${md.global.Account.accountId}`);
    xhr.responseType = 'blob';
    xhr.onload = function (e) {
      if (xhr.status == 200) {
        try {
          let blob = xhr.response;
          let filename = '外部用户导入模板.xlsx';
          let a = document.createElement('a');
          let url = URL.createObjectURL(blob);
          a.href = url;
          a.download = filename;
          a.click();
          window.URL.revokeObjectURL(url);
        } catch (e) {}
      }
    };
    xhr.send();
  };
  return (
    <Dialog
      className=""
      width="580"
      visible={show}
      title={<span className="Font17 Bold">{_l('邀请用户')}</span>}
      okText={loading ? _l('确认邀请...') : _l('确认邀请')}
      onCancel={() => {
        setAddUserDialog(false);
      }}
      onOk={() => {
        if (loading) {
          return;
        }
        if (!fileUrl) {
          return alert(_l('请上传文件'), 3);
        }
        update();
      }}
    >
      <Wrap>
        <input id="hideUploadUser" type="file" className="Hidden" />
        <span id="uploadUser" className="Hidden" />
        <p className="Gray_9e pAll0 mBottom10">
          {_l('上传成功后会发送短信/邮箱邀请用户注册外部门户')}
          <br />
          {_l('Excel表格第一行必须是字段名称，为保证短信发送成功请务必保证手机号真实有效，')}
          <span
            className="Hand down"
            onClick={() => {
              let ajaxUrl = md.global.Config.AjaxApiUrl + 'Download/GetExAccountImportTemplate?appId=' + appId;
              downLoadByUrl(ajaxUrl);
            }}
          >
            {_l('下载模版')}
          </span>
          <br />
        </p>
        {fileUrl ? (
          <React.Fragment>
            <div className="listCon">
              <span className="txt flex flexRow">
                <Icon className="Font18 TxtMiddle" type="new_excel" style={{ color: '#4CAF50' }} />
                <span className="mLeft8 mRight8 flex overflow_ellipsis Font13 WordBreak"> {fileName}</span>
              </span>
            </div>
            <Checkbox
              className="TxtCenter InlineBlock Hand mTop10 Gray_75"
              text={_l('邀请用户并发送短信')}
              checked={isSendMsgs}
              onClick={checked => {
                setIsSend(!isSendMsgs);
              }}
            />
          </React.Fragment>
        ) : (
          <React.Fragment>
            {loading ? (
              <LoadDiv size="small" className="TxtLeft InlineBlock" />
            ) : (
              <React.Fragment>
                <div
                  className="Hand InlineBlock mTop6 uploadUser"
                  onClick={() => {
                    $('#uploadUser').click();
                  }}
                >
                  <Icon className="Font18 TxtMiddle mRight6" type="cloud_upload" />
                  <span className=""> {_l('从Excel导入数据')}</span>
                </div>
              </React.Fragment>
            )}
          </React.Fragment>
        )}
      </Wrap>
    </Dialog>
  );
}
const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AddUserDialog);
