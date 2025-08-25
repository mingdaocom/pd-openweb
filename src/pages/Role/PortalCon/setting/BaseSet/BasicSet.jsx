import React from 'react';
import { Dialog, Icon, Radio } from 'ming-ui';
import { DIS_SET } from './config';
import { SwitchStyle } from './style';

export default function (props) {
  const { portalSetModel, onChangePortalSet } = props;
  const { noticeScope = {} } = portalSetModel;
  return (
    <>
      <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('功能设置')}</h6>
      <div className="mTop12">
        <SwitchStyle>
          <Icon
            icon={portalSetModel.allowExAccountDiscuss ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="Font32 Hand"
            onClick={() => {
              const { portalSet = {} } = props;
              const { portalSetModel = {} } = portalSet;
              let data = {
                allowExAccountDiscuss: !portalSetModel.allowExAccountDiscuss,
              };
              if (portalSetModel.allowExAccountDiscuss) {
                //关闭外部门户讨论，同时关闭外部门户的消息通知
                data = {
                  ...data,
                  noticeScope: { ...noticeScope, discussionNotice: false },
                };
              }
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  ...data,
                },
              });
            }}
          />
          <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">{_l('允许参与记录讨论')}</div>
        </SwitchStyle>
        <div style={{ 'margin-left': '36px' }}>
          {portalSetModel.allowExAccountDiscuss && (
            <React.Fragment>
              <div className="mTop8 mLeft8">
                {DIS_SET.map((o, i) => {
                  return (
                    <div className="">
                      <Radio
                        className="Font13"
                        text={o}
                        checked={portalSetModel.exAccountDiscussEnum === i}
                        onClick={() => {
                          const { portalSet = {} } = props;
                          const { portalSetModel = {} } = portalSet;
                          if (portalSetModel.exAccountDiscussEnum === i) {
                            return;
                          }
                          Dialog.confirm({
                            title:
                              portalSetModel.exAccountDiscussEnum === 0
                                ? _l('确定切换为不可见内部讨论？')
                                : _l('确定切换为可见全部讨论？'),
                            width: 480,
                            description:
                              portalSetModel.exAccountDiscussEnum === 0 ? (
                                <div className="Font13">
                                  <div>
                                    1、
                                    {_l('切换后，已有的外部讨论内容全部归为内部讨论，外部用户对其不可查看且不能回复；')}
                                  </div>
                                  <div>
                                    2、
                                    {_l(
                                      '切换后，应用成员回复已有讨论，回复内容归属于内部讨论，外部用户不可查看且不能回复',
                                    )}
                                  </div>
                                  <div>
                                    3、
                                    {_l('切换后，讨论分为两个讨论区域，外部用户只能参与外部讨论')}
                                  </div>
                                </div>
                              ) : (
                                <div className="Font13">
                                  <div>
                                    {_l('切换后，外部和内部两个讨论共用一个讨论区，已有的外部和内部讨论内容归在一起')}
                                  </div>
                                </div>
                              ),
                            onOk: () => {
                              const { portalSet = {} } = props;
                              const { portalSetModel = {} } = portalSet;
                              onChangePortalSet({
                                portalSetModel: {
                                  ...portalSetModel,
                                  exAccountDiscussEnum: i,
                                },
                              });
                            },
                          });
                        }}
                      />
                      <p className="Gray_9e mTop6 mLeft30 Font13">
                        {i === 0
                          ? _l('外部用户与成员共用一个讨论区域，可见全部讨论内容')
                          : _l('分为内部和外部两个讨论区，外部用户不可见内部讨论区')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
      <div className="mTop5">
        <SwitchStyle>
          <Icon
            icon={portalSetModel.approved ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="Font32 Hand"
            onClick={() => {
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  approved: !portalSetModel.approved,
                },
              });
            }}
          />
          <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">{_l('允许查看审批流转详情')}</div>
        </SwitchStyle>
      </div>
      <div className="mTop5">
        <SwitchStyle>
          <Icon
            icon={!!portalSetModel.watermark && portalSetModel.watermark !== 0 ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="Font32 Hand"
            onClick={() => {
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  watermark: portalSetModel.watermark === 1 ? 0 : 1,
                },
              });
            }}
          />
          <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">{_l('水印设置')}</div>
        </SwitchStyle>
        {portalSetModel.watermark === 1 && (
          <div style={{ 'margin-left': '44px' }} className="Gray_9e Font13">
            {_l('启用水印配置后，将在外部门户内显示当前使用者的姓名+手机号后4位或邮箱前缀')}
          </div>
        )}
      </div>
    </>
  );
}
