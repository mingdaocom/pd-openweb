import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, LoadDiv, Radio, Support } from 'ming-ui';
import certificationApi from 'src/api/certification';

const ListWrapper = styled.div`
  min-height: 200px;
  max-height: 300px;
  overflow: auto;
  .empty {
    height: 200px;
  }
  .ming.Radio {
    display: flex;
    align-items: center;
    width: 100%;
    .Radio-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`;

export default function SmsSignSet(props) {
  const { onOk = () => {}, sign, suffix, projectId } = props;
  const [visible, setVisible] = useState(false);
  const [signature, setSignature] = useState(sign);
  const [signList, setSignList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSignList();
  }, []);

  const onSave = () => {
    onOk(signature);
    setVisible(false);
  };

  const getSignList = () => {
    setLoading(true);

    certificationApi
      .getListSmsSignatures({ projectId })
      .then(res => {
        const platformList = (_.get(md, 'global.Config.DefaultSmsProvider') || []).map((item, index) => ({
          id: index + 1,
          signName: item,
        }));
        setSignList([...(res || []), ...platformList]);
        if (!sign) {
          const defaultSign = res.length ? _.find(res, { isDefault: true })?.signName : platformList[0]?.signName;
          setSignature(defaultSign);
          onOk(defaultSign);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <Fragment>
      {!sign && loading ? (
        <LoadDiv />
      ) : (
        <div>
          {sign && <span className="mRight12">{sign}</span>}
          <span className="ThemeColor3 ThemeHoverColor2 pointer" onClick={() => setVisible(true)}>
            {sign ? _l('修改') : _l('设置')}
          </span>
        </div>
      )}

      {visible && (
        <Dialog
          visible
          width={600}
          title={_l('设置短信签名')}
          onCancel={() => setVisible(false)}
          onOk={onSave}
          footerLeftElement={() => {
            return !loading && !!signList.length ? (
              <div
                className="ThemeColor3 ThemeHoverColor2 pointer LineHeight36"
                onClick={() => window.open(`/admin/certinfo/${projectId}`)}
              >
                {_l('添加短信签名')}
              </div>
            ) : null;
          }}
        >
          {loading ? (
            <LoadDiv className="mTop10" />
          ) : (
            <Fragment>
              {!window.platformENV.isOverseas && !window.platformENV.isLocal && (
                <Fragment>
                  <div className="textSecondary">
                    {_l(
                      '自定义签名到达率受运营商风控等因素影响，若实际到达率不佳，建议您可以尝试切换到平台默认提供的签名。',
                    )}
                  </div>
                  <div className="mTop8 textSecondary">
                    <span>
                      {_l(
                        '注意：运营商新规，短信内容不能带有链接/域名/联系方式等引流信息，否则极大概率短信被运营商所拦截。',
                      )}
                    </span>
                    <Support
                      type={3}
                      href="https://help.mingdao.com/workflow/sms-failure#regulation"
                      text={_l('了解内容规范')}
                    />
                  </div>
                </Fragment>
              )}

              <ListWrapper>
                {!signList.length ? (
                  <div className="flexColumn justifyContentCenter alignItemsCenter empty">
                    <div className="textSecondary">
                      <span>{_l('暂无短信签名,请先前往')}</span>
                      <span
                        className="ThemeColor3 ThemeHoverColor2 pointer"
                        onClick={() => window.open(`/admin/certinfo/${projectId}`)}
                      >
                        {_l('组织后台')}
                      </span>
                      <span>{_l('添加签名')}</span>
                    </div>
                  </div>
                ) : (
                  signList.map(item => {
                    const text =
                      item.id.toString().length === 24 || window.platformENV.isOverseas || window.platformENV.isLocal
                        ? item.signName
                        : item.signName + (item.id === 1 ? _l('（官方平台签名）') : _l('（短信供应商签名）'));
                    return (
                      <div className="mTop16" key={item.id}>
                        <Radio
                          text={text}
                          checked={signature === item.signName}
                          onClick={() => setSignature(item.signName)}
                        />
                        {suffix &&
                          !window.platformENV.isOverseas &&
                          !window.platformENV.isLocal &&
                          item.id === 2 &&
                          signature === item.signName && (
                            <div className="mTop10 mLeft30 textSecondary">
                              {_l('发送效果：【吉信通】 您的验证码是123456，感谢您的使用（发自：%0）', suffix)}
                            </div>
                          )}
                      </div>
                    );
                  })
                )}
              </ListWrapper>
            </Fragment>
          )}
        </Dialog>
      )}
    </Fragment>
  );
}
