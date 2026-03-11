import React, { useEffect, useState } from 'react';
import DocumentTitle from 'react-document-title';
import { useSetState } from 'react-use';
import { Form, Popover } from 'antd';
import { createParser } from 'eventsource-parser';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Avatar, Button, Icon, LoadDiv, Qr } from 'ming-ui';
import certificationApi from 'src/api/certification';
import sseAjax from 'src/api/sse';
import Empty from 'src/pages/Admin/common/TableEmpty';
import HelpCollection from 'src/pages/PageHeader/components/CommonUserHandle/HelpCollection';
import { getRequest } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';
import EnterpriseForm from './components/EnterpriseForm';
import { CERT_PAGE_TITLE, CERT_STATUS, ENTERPRISE_TYPE, RESULT_TYPES, SOURCE_TYPE, TYPES } from './constant';
import developerGroupImg from './images/developer-group.png';
import enterpriseImg from './images/enterprise.png';
import personalImg from './images/personal.png';
import { getEnterpriseDefaultFormData, getEnterpriseParams } from './utils';

const Wrapper = styled.div`
  background: var(--color-background-primary);
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .headerBar {
    display: flex;
    align-items: center;
    height: 56px;
    padding: 0 24px;
    box-shadow: 0px 1px 2px 1px rgba(0, 0, 0, 0.16);
    .backBtn {
      width: fit-content;
      font-size: 17px;
      font-weight: 500;
      &:hover {
        color: var(--color-primary);
      }
    }
    .helpWrap {
      width: 72px;
      height: 32px;
      line-height: 32px;
      border-radius: 20px;
      padding-left: 10px;
      margin-right: 20px;
      cursor: pointer;
      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }
  .contentWrap {
    flex: 1;
    overflow: auto;
    .successIcon {
      font-size: 80px;
      color: var(--color-success);
    }
    .certifiedInfo {
      width: 250px;
      background: var(--color-background-secondary);
      border-radius: 5px;
      padding: 24px 0;
      text-align: center;
      margin-top: 30px;
    }
  }

  .explain {
    width: 960px;
    margin: 0 auto;
    background: var(--color-primary-transparent);
    border-radius: 3px;
    padding: 12px 20px;
    margin-top: 20px;
    font-size: 13px;
    color: var(--color-text-title);
  }
  .mTop56 {
    margin-top: 56px;
  }

  .personalContent {
    height: 100%;
    justify-content: center;
    align-items: center;
    .qrWrapper {
      padding: 24px;
      box-shadow: 0px 5px 30px 1px rgba(0, 0, 0, 0.16);
      border-radius: 26px;
      position: relative;
      cursor: pointer;
      &:hover {
        .icon-refresh1 {
          color: var(--color-primary) !important;
        }
      }

      .loadingWrap {
        width: 170px;
        height: 170px;
      }
      .green {
        color: var(--color-success);
      }
      .qrMask {
        position: absolute;
        top: 24px;
        left: 24px;
        width: 170px;
        height: 170px;
        backdrop-filter: blur(3px);
        background-color: rgba(255, 255, 255, 0.8);
        .icon-check_circle {
          color: var(--color-success);
        }
        .icon-refresh1 {
          color: var(--color-text-secondary);
        }
      }
    }
  }
`;

const TypeCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 490px;
  height: 380px;
  padding: 24px;
  cursor: pointer;
  border-radius: 14px;
  &:hover {
    background: var(--color-background-hover);
  }
  img {
    width: 100px;
  }
`;

export default function Certification(props) {
  const { certSource, projectId } = _.get(props, 'match.params');
  const { type, returnUrl } = getRequest();
  const [currentPage, setCurrentPage] = useState(
    certSource === 'personal' ? 'personal' : ['upgrade', 'update', 'add'].includes(type) ? 'enterprise' : '',
  );
  const [formData, setFormData] = useSetState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  const [certStatus, setCertStatus] = useState('');
  const [personalLoading, setPersonalLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(true);
  const [certState, setCertState] = useState('');
  const [token, setToken] = useState('');
  const [certInfo, setCertInfo] = useState({});
  const [controller, setController] = useState(null);

  const [form] = Form.useForm();

  const currentProject = projectId ? getCurrentProject(projectId) || {} : {};

  useEffect(() => {
    switch (currentPage) {
      case 'enterprise':
        !!currentProject.projectId && getCertFailedInfo();
        break;
      case 'personal':
        setPersonalLoading(true);
        certificationApi.checkIsCert({ projectId, authType: 1, certSource: SOURCE_TYPE[certSource] }).then(res => {
          res ? setCurrentPage('certified') : getAndCheckCertState();
        });
        break;
      case 'certified':
        certificationApi.getCertInfo({ projectId, certSource: SOURCE_TYPE[certSource], authType: 2 }).then(res => {
          res && setCertInfo(res);
        });
        break;
      default:
        break;
    }

    if (currentPage !== 'personal') {
      controller && controller.abort();
      setController(null);
    }
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 'personal') {
      const interval = setInterval(() => {
        if (certStatus === CERT_STATUS.USED && token) {
          certificationApi.getFaceCertResult({ token }).then(res => {
            res === 0 && setCertStatus(CERT_STATUS.EXPIRED);
            res === 1 && setCurrentPage('certified');
          });
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentPage, certStatus, token]);

  useEffect(() => {
    checkFaceCert();
  }, [controller, certState]);

  const getAndCheckCertState = () => {
    setQrLoading(true);
    setCertStatus(CERT_STATUS.NORMAL);

    certificationApi.getFaceCertUrl({ state: certState, projectId, certSource: SOURCE_TYPE[certSource] }).then(res => {
      if (res) {
        setCertState(res);
        setPersonalLoading(false);
        setQrLoading(false);
        setController(new AbortController());
      }
    });
  };

  const checkFaceCert = async () => {
    if (!controller || !certState) return;

    const parser = createParser(event => {
      if (event.type === 'event') {
        const data = safeParse(event.data) || {};
        data.state !== certStatus && setCertStatus(data.state);
        if (data.state === CERT_STATUS.USED) {
          setToken(data.token);
        }
      }
    });

    const resp = await sseAjax.checkFaceCertSSE(
      { state: certState },
      { abortController: controller, isReadableStream: true },
    );

    const reader = resp.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const result = new TextDecoder().decode(value);
        parser.feed(result);
      }
    } finally {
      setController(null);
      reader.releaseLock();
    }
  };

  const getCertFailedInfo = () => {
    certificationApi.getCertFailedInfo({ authType: 2, certSource: SOURCE_TYPE[certSource], projectId }).then(res => {
      if (res) {
        const defaultValues = getEnterpriseDefaultFormData(res.enterpriseInfo);
        setFormData(defaultValues);
      }
    });
  };

  const maskIdNumber = data => {
    return data ? data.slice(0, 2) + '*'.repeat(data.length - 4) + data.slice(-2) : '';
  };

  const onSubmit = () => {
    form.validateFields().then(() => {
      const { enterpriseType, legalName, person } = formData;

      if (person !== legalName) {
        alert(_l('法定代表人姓名不一致'), 3);
        return;
      }

      const data = {
        certSource: SOURCE_TYPE[certSource],
        entityId: projectId,
        isUpgrade: type === 'upgrade',
        ...getEnterpriseParams(formData),
      };

      setSubmitLoading(true);
      certificationApi[type === 'update' ? 'renewEnterpriseCertification' : 'enterpriseCertification'](data)
        .then(data => {
          const errorMsg = {
            [ENTERPRISE_TYPE.ENTERPRISE]: {
              4: _l('企业统一信用代码不一致'),
              5: _l('公司名称不一致'),
              15: _l('营业执照超过有效期'),
            },
            [ENTERPRISE_TYPE.GOVERNMENT]: {
              4: _l('社会信用代码不一致'),
              5: _l('单位名称不一致'),
              15: _l('证书超过有效期'),
            },
            [ENTERPRISE_TYPE.SOCIAL_ORGANIZATION]: {
              4: _l('组织信用代码不一致'),
              5: _l('组织名称不一致'),
              15: _l('证书超过有效期'),
            },
          };
          switch (data) {
            case 1:
              alert(_l('认证信息已提交'));
              setCurrentPage('success');
              break;
            case 4:
            case 5:
            case 15:
              alert(errorMsg[enterpriseType][data] + _l(',错误码:%0', data), 2);
              break;
            default:
              alert((RESULT_TYPES[data] || _l('提交失败')) + _l(',错误码:%0', data), 2);
          }
        })
        .finally(() => setSubmitLoading(false));
    });
  };

  return (
    <Wrapper>
      <DocumentTitle title={CERT_PAGE_TITLE[currentPage] || _l('认证')} />
      <div className="headerBar">
        <div
          className="backBtn flexRow alignItemsCenter pointer h100"
          onClick={() => {
            if (
              currentPage === 'success' ||
              !currentPage ||
              certSource === 'personal' ||
              ['upgrade', 'update', 'add'].includes(type)
            ) {
              returnUrl && (location.href = decodeURIComponent(returnUrl));
            } else {
              setCurrentPage('');
            }
          }}
        >
          <Icon icon="backspace" className="Font20" />
          <div className="mLeft16">{!currentPage ? _l('身份认证') : _l('返回')}</div>
        </div>
        <div className="flex" />
        {!md.global.SysSettings.hideHelpTip && (
          <Trigger
            action={['click']}
            popupVisible={helpVisible}
            onPopupVisibleChange={visible => setHelpVisible(visible)}
            popup={<HelpCollection hapAIPosition="top" updatePopupVisible={visible => setHelpVisible(visible)} />}
            popupAlign={{
              points: ['tr', 'br'],
              offset: [40, 9],
              overflow: { adjustX: true, adjustY: true },
            }}
          >
            <div className="helpWrap" onClick={() => setHelpVisible(true)}>
              <Icon icon="help" className="Font20 textSecondary TxtMiddle" />
              <span className="textSecondary mLeft5 TxtMiddle">{_l('帮助')}</span>
            </div>
          </Trigger>
        )}

        <Avatar src={md.global.Account.avatar} size={30} />
      </div>

      <div className="contentWrap">
        {certSource === 'project' && !currentProject.projectId ? (
          <Empty
            className="pTop0 h100"
            detail={{
              icon: 'icon-task_custom_ic_task_internet',
              desc: _l('您的账号不是该组织成员'),
            }}
          />
        ) : (
          <React.Fragment>
            {!currentPage && (
              <div className="h100 flexRow alignItemsCenter justifyContentCenter">
                {TYPES.map(item => (
                  <TypeCard key={item.key} onClick={() => setCurrentPage(item.key)}>
                    <img src={item.key === 'enterprise' ? enterpriseImg : personalImg} />
                    <div className="mTop32 Font24 bold nowrap">{item.text}</div>
                    <div className="textSecondary Font16 mTop20">{item.description}</div>
                    <div className="textSecondary Font16">
                      {item.key === 'enterprise'
                        ? _l('使用短信自定义签名等功能时需要完成企业认证')
                        : _l('（仅支持大陆身份证认证）')}
                    </div>
                  </TypeCard>
                ))}
              </div>
            )}

            {currentPage === 'enterprise' && (
              <React.Fragment>
                <div className="explain">
                  {_l(
                    '请上传您有效的企业相关证书，以及与证书一致的法定代表人身份证人像面与国徽面，并输入与身份证一致的实名制手机号，系统会自动进行匹配认证并保证您的隐私安全，若信息正确但未能有效通过认证，可联系在线客服或专属顾问',
                  )}
                </div>
                <EnterpriseForm form={form} formData={formData} setFormData={setFormData} />
                <div className="flexRow justifyContentCenter mTop56 mBottom32">
                  <Button loading={submitLoading} onClick={onSubmit}>
                    {_l('提交')}
                  </Button>
                </div>
              </React.Fragment>
            )}

            {currentPage === 'personal' && (
              <div className="personalContent flexColumn">
                {personalLoading ? (
                  <LoadDiv />
                ) : (
                  <React.Fragment>
                    <div className="Font28 bold mBottom24">{_l('个人认证')}</div>
                    <div className="Font17 textSecondary mBottom40">{_l('使用微信扫一扫，快速完成人脸识别')}</div>
                    <div
                      className="qrWrapper"
                      onClick={() => {
                        controller && controller.abort();
                        setController(null);
                        getAndCheckCertState();
                      }}
                    >
                      {qrLoading ? (
                        <div className="loadingWrap flexRow alignItemsCenter justifyContentCenter">
                          <LoadDiv />
                        </div>
                      ) : (
                        <Qr
                          content={`${md.global.Config.WebUrl}identityAuth?certState=${certState}`}
                          width={170}
                          height={170}
                        />
                      )}

                      {certStatus !== CERT_STATUS.NORMAL && (
                        <div className="qrMask flexColumn alignItemsCenter justifyContentCenter">
                          <Icon
                            icon={certStatus !== CERT_STATUS.EXPIRED ? 'check_circle' : 'refresh1'}
                            className="Font40"
                          />
                          <div className="Font12 mTop4">
                            {certStatus === CERT_STATUS.EXPIRED ? _l('二维码失效') : _l('扫码成功')}
                          </div>
                        </div>
                      )}

                      <div className="flexRow justifyContentCenter alignItemsCenter mTop20">
                        <Icon icon="wechat" className="Font20 green" />
                        <span className="mLeft8">{_l('微信扫码')}</span>
                      </div>
                    </div>
                  </React.Fragment>
                )}
              </div>
            )}

            {['certified', 'success'].includes(currentPage) && (
              <div className="h100 flexColumn justifyContentCenter alignItemsCenter">
                <Icon icon="gpp_good" className="successIcon" />
                <div className="Font24 bold mTop16">
                  {currentPage === 'success' ? _l('认证成功') : _l('个人认证已通过')}
                </div>

                {currentPage === 'certified' && (
                  <div className="certifiedInfo">
                    <div className="bold">{_l('您的认证信息:')}</div>
                    <div className="mTop20">{_l('大陆身份证')}</div>
                    <div className="mTop20">{maskIdNumber(_.get(certInfo, 'personalInfo.idNumber'))}</div>
                  </div>
                )}

                {certSource === 'market' && (
                  <Popover placement="right" content={<img src={developerGroupImg} width={260} />}>
                    <div className="mTop16 colorPrimary pointer">{_l('开发者交流群')}</div>
                  </Popover>
                )}
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </Wrapper>
  );
}
