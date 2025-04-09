import React, { useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import { Icon, Dialog, Checkbox, LoadDiv, QiniuUpload } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import _ from 'lodash';
import { saveAs } from 'file-saver';
import { useSetState } from 'react-use';
import cx from 'classnames';

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
  const [isSendMsgs, setIsSend] = useState(props.isSendMsgs);
  const [{ file, fileUrl }, setState] = useSetState({ file: null, fileUrl: '' });
  const [loading, setLoading] = useState(false);

  const update = () => {
    setLoading(true);
    externalPortalAjax
      .editIsSendMsgs({
        appId,
        isSendMsgs,
      })
      .then(res => {
        changeIsSendMsgs(isSendMsgs);
        externalPortalAjax
          .importExAccounts({
            fileUrl: fileUrl,
            appId,
          })
          .then(
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
    window
      .mdyAPI(
        '',
        '',
        {},
        {
          ajaxOptions: {
            responseType: 'blob',
            type: 'GET',
            url: url,
          },
          customParseResponse: true,
        },
      )
      .then(data => {
        let filename = `${_l('外部用户导入模板')}.xlsx`;
        saveAs(data, filename);
      });
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
                <span className="mLeft8 mRight8 flex overflow_ellipsis Font13 WordBreak"> {(file || {}).name}</span>
              </span>
            </div>
            <Checkbox
              className="TxtCenter InlineBlock Hand mTop10 Gray_75"
              text={
                <span>
                  {_l('邀请用户并发送短信/邮箱')}
                  {(!_.get(md, 'global.Config.IsLocal') || _.get(md, 'global.Config.IsPlatformLocal')) &&
                    _l(
                      '（短信%0/条、邮箱%1/封，自动从企业账户扣除。）',
                      _.get(md, 'global.PriceConfig.SmsPrice'),
                      _.get(md, 'global.PriceConfig.EmailPrice'),
                    )}
                </span>
              }
              checked={isSendMsgs}
              onClick={checked => {
                setIsSend(!isSendMsgs);
              }}
            />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <QiniuUpload
              className={cx('Hand InlineBlock mTop6 uploadUser')}
              options={{
                filters: {
                  mime_types: [{ extensions: 'xlsx,xls,xlsm' }],
                },
                max_file_size: '4m',
              }}
              onAdd={(up, files) => {
                if (loading) return;
                setLoading(true);
                up.disableBrowse();
              }}
              onBeforeUpload={(up, file) => {
                setState({ file });
              }}
              onUploaded={(up, file, response) => {
                up.disableBrowse(false);
                setLoading(false);
                setState({
                  file: file,
                  fileUrl: file.serverName + file.key,
                });
              }}
              onError={() => {
                alert(_l('文件上传失败'), 2);
                setLoading(false);
                setState({
                  file: {},
                  fileUrl: '',
                });
              }}
            >
              {loading ? (
                <LoadDiv className="mTop6" />
              ) : (
                <React.Fragment>
                  <Icon className="Font18 TxtMiddle mRight6" type="cloud_upload" />
                  <span className=""> {_l('从Excel导入数据')}</span>
                </React.Fragment>
              )}
            </QiniuUpload>
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
