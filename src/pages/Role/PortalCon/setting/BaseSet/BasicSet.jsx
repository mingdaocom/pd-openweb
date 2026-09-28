import React, { useState } from 'react';
import { Modal, Radio, Switch } from 'ming-ui/antd-components';
import WaterMarkDialog from 'src/pages/Role/PortalCon/components/WaterMarkDialog';
import { DIS_SET } from './config';

// 门户水印仅支持：姓名、手机号、邮箱 + 自定义文本
const PORTAL_WATERMARK_CONTROLS = [
  { controlId: 'fullname', controlName: _l('姓名') },
  { controlId: 'mobilePhone', controlName: _l('手机号') },
  { controlId: 'email', controlName: _l('邮箱') },
];

export default function (props) {
  const { portalSetModel, onChangePortalSet } = props;
  const { noticeScope = {} } = portalSetModel;
  const [showWaterMarkSetting, setShowWaterMarkSetting] = useState(false);
  return (
    <>
      <h6 className="Font16 textPrimary Bold mBottom0 mTop24">{_l('功能设置')}</h6>
      <div className="mTop12">
        <div className="flexRow alignItemsCenter">
          <Switch
            size="small"
            checked={!!portalSetModel.allowExAccountDiscuss}
            onChange={checked => {
              const { portalSet = {} } = props;
              const { portalSetModel = {} } = portalSet;
              let data = {
                allowExAccountDiscuss: checked,
              };

              if (!checked) {
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
          <div className="switchText Font13 LineHeight32 InlineBlock Normal textPrimary mLeft12">
            {_l('允许参与记录讨论')}
          </div>
        </div>
        <div style={{ 'margin-left': '36px' }}>
          {portalSetModel.allowExAccountDiscuss && (
            <React.Fragment>
              <div className="mTop8 mLeft8">
                {DIS_SET.map((o, i) => {
                  return (
                    <div className="">
                      <Radio
                        className="Font13"
                        checked={portalSetModel.exAccountDiscussEnum === i}
                        onChange={() => {
                          const { portalSet = {} } = props;
                          const { portalSetModel = {} } = portalSet;

                          if (portalSetModel.exAccountDiscussEnum === i) {
                            return;
                          }

                          Modal.confirm({
                            title:
                              portalSetModel.exAccountDiscussEnum === 0
                                ? _l('确定切换为不可见内部讨论？')
                                : _l('确定切换为可见全部讨论？'),
                            width: 480,
                            content:
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
                        title={o}
                      >
                        {o}
                      </Radio>
                      <p className="textTertiary mTop6 mLeft30 Font13">
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
        <div className="flexRow alignItemsCenter">
          <Switch
            size="small"
            checked={!!portalSetModel.approved}
            onChange={checked => {
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  approved: checked,
                },
              });
            }}
          />
          <div className="switchText Font13 LineHeight32 InlineBlock Normal textPrimary mLeft12">
            {_l('允许查看审批流转详情')}
          </div>
        </div>
      </div>
      <div className="mTop5">
        <div className="flexRow alignItemsCenter">
          <Switch
            size="small"
            checked={!!portalSetModel.watermark && portalSetModel.watermark !== 0}
            onChange={checked => {
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  watermark: checked ? 1 : 0,
                },
              });
            }}
          />
          <div className="switchText Font13 LineHeight32 InlineBlock Normal textPrimary mLeft12">{_l('屏幕水印')}</div>
        </div>
        {portalSetModel.watermark === 1 && (
          <div style={{ 'margin-left': '44px' }}>
            <div className="textTertiary Font13 mBottom8">
              {_l('启用水印配置后，将在外部门户门户所有页面显示水印。可自定义水印文字')}
            </div>
            <span className="Hand colorPrimary Font13 Bold" onClick={() => setShowWaterMarkSetting(true)}>
              {_l('设置')}
            </span>
          </div>
        )}
      </div>
      <div className="mTop5">
        <div className="flexRow alignItemsCenter">
          <Switch
            size="small"
            checked={!!portalSetModel.editPersonalInfo}
            onChange={checked => {
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  editPersonalInfo: checked,
                },
              });
            }}
          />
          <div className="switchText Font13 LineHeight32 InlineBlock Normal textPrimary mLeft12">
            {_l('允许外部用户修改账号信息')}
          </div>
        </div>
      </div>
      <div className="mTop5">
        <div className="flexRow alignItemsCenter">
          <Switch
            size="small"
            checked={!!portalSetModel.editPersonalExtInfo}
            onChange={checked => {
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  editPersonalExtInfo: checked,
                },
              });
            }}
          />
          <div className="switchText Font13 LineHeight32 InlineBlock Normal textPrimary mLeft12">
            {_l('允许外部用户修改个人扩展信息')}
          </div>
        </div>
      </div>
      {showWaterMarkSetting && (
        <WaterMarkDialog
          visible={showWaterMarkSetting}
          defaultValue={typeof portalSetModel.watermarkTxt === 'string' ? portalSetModel.watermarkTxt : ''}
          controls={PORTAL_WATERMARK_CONTROLS}
          onClose={() => setShowWaterMarkSetting(false)}
          onSave={value => {
            onChangePortalSet({
              portalSetModel: {
                ...portalSetModel,
                watermarkTxt: value,
              },
            });
            setShowWaterMarkSetting(false);
          }}
        />
      )}
    </>
  );
}
