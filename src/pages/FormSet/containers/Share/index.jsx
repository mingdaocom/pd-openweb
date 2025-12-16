import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, LoadDiv, Radio, ScrollView, Switch } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import sheetAjax from 'src/api/worksheet';
import { SHARECARDTYPS } from 'src/components/ShareCardConfig/config';
import SelectExDrop from 'src/pages/Role/PortalCon/components/SelectExDrop';
import ShareCardSetting from './ShareCardSet';

const Container = styled.div`
  padding: 35px 40px 10px;
  max-width: 1080px;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #dddddd;
`;

const Tab = styled.button`
  padding: 16px 40px 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  position: relative;

  &.curTab {
    &::after {
      content: '';
      position: absolute;
      bottom: 0px;
      left: 0;
      right: 0;
      height: 3px;
      background-color: #1677ff;
    }
  }
`;

const TabContent = styled.div`
  padding: 24px 0;
`;

const SettingItem = styled.div``;

const Description = styled.div`
  width: 100%;
  background: #f2fafe;
  border-radius: 3px;
  padding: 10px 12px;
  line-height: 1.5;
  font-size: 13px;
`;

const SubTitle = styled.div`
  font-size: 14px;
`;

const RadioGroup = styled.div``;

const RecordSharing = styled.div`
  .conLine {
    width: 100%;
    height: 0;
    border-bottom: 1px solid #dddddd;
  }
  .ant-select-selector {
    min-height: 36px;
  }
  .wxPublicWrap {
    justify-content: start;
  }
`;

const TYPES = [
  {
    key: 'view',
    lab: _l('视图'),
  },
  {
    key: 'record',
    lab: _l('记录'),
  },
  {
    key: 'discussion',
    lab: _l('讨论消息'),
  },
];

const SharingSettings = props => {
  const { worksheetId, worksheetInfo, onChange, worksheetControls } = props;
  const { views = [], appId } = worksheetInfo;
  const [activeTab, setActiveTab] = useState('view');
  const [isView, setIsView] = useState(false);
  const [info, setInfo] = useState({
    loading: true,
  });

  useEffect(() => {
    setIsView(false);
  }, [activeTab]);

  useEffect(() => {
    if (!worksheetId) return;
    getSwitchData();
  }, [worksheetId]);

  const getSwitchData = () => {
    sheetAjax.getSwitch({ worksheetId }).then(res => {
      let data = res;
      setInfo({
        loading: false,
        data,
      });
    });
  };

  const edit = data => {
    sheetAjax
      .batchEditSwitch({
        worksheetId,
        switchList: [data],
      })
      .then(res => {
        if (res) {
          setInfo({
            ...info,
            data: info.data.map(o => {
              if (o.type === data.type) {
                return { ...o, ...data };
              } else {
                return o;
              }
            }),
          });
        } else {
          alert(_l('修改失败，请稍后再试！'), 2);
        }
      });
  };

  const onChangeSetting = data => {
    sheetAjax
      .editWorksheetSetting({ workSheetId: worksheetId, appId, advancedSetting: data, editAdKeys: Object.keys(data) })
      .then(res => {
        if (!res) {
          alert(_l('修改失败，请稍后再试'), 2);
          return;
        } else {
          const { advancedSetting = {} } = worksheetInfo;
          let newValues = { ...advancedSetting, ...data };
          onChange({ ...worksheetInfo, advancedSetting: newValues });
        }
      });
  };

  const renderCon = () => {
    switch (activeTab) {
      case 'discussion':
        return (
          <>
            <Description className="Gray">
              <div>
                <span className="Bold">{_l('默认规则：')}</span>
                {_l(
                  '基于应用成员协作便利考量，若在讨论中 @用户，则表示期望被 @者知晓当前数据。此时即便被 @人无当前视图或记录权限，只要拥有工作表权限，就能通过消息链接以只读形式查看记录。',
                )}
              </div>
              <div className="mTop10">
                <span className="Bold">{_l('可选配置：')}</span>
                {_l(
                  '若您希望对@消息也严格按照权限控制，可设置为不允许查看。此时当用户无视图权限或记录权限，将无法查看记录。',
                )}
              </div>
              <div className="mTop10">
                {_l('备注：此配置对关注者的新讨论通知，和成员字段【加人时发送通知】中的消息链接同样生效')}
              </div>
            </Description>
            <SubTitle className="Bold Font14 mTop24">{_l('当被@用户没有记录查看权限时')}</SubTitle>
            <RadioGroup className="flexColumn mTop20">
              <Radio
                text={_l('如果用户有工作表权限，允许以只读方式查看记录（默认）')}
                checked={props?.worksheetInfo?.advancedSetting?.discusspermission !== '2'}
                onClick={() => onChangeSetting({ discusspermission: '' })}
              />
              <Radio
                className="mTop20"
                text={_l('不允许查看')}
                checked={props?.worksheetInfo?.advancedSetting?.discusspermission === '2'}
                onClick={() => onChangeSetting({ discusspermission: '2' })}
              />
            </RadioGroup>
          </>
        );
      default:
        const data = info?.data.find(o => o.type === (activeTab === 'view' ? 20 : 30)) || {};
        const isSharingEnabled = data.state;
        return (
          <RecordSharing>
            <p className="Gray Bold">
              {activeTab === 'view'
                ? _l('允许将视图对外公开分享，获得链接的所有人都可以查看视图和视图下的全部记录')
                : _l('允许将记录对外公开分享，获得链接的所有人都可以查看记录')}
            </p>
            <SettingItem className="flexRow alignItemsCenter mTop20">
              <Switch
                // size="small"
                checked={isSharingEnabled}
                onClick={() => {
                  edit({
                    ...data,
                    state: !isSharingEnabled,
                  });
                }}
              />
              <span className="mLeft5 Bold">{isSharingEnabled ? _l('开启') : _l('关闭')}</span>
            </SettingItem>
            {isSharingEnabled && (
              <>
                <div className="conLine mTop24" />
                <SettingItem>
                  <SubTitle className="mTop24 Bold">{_l('使用范围')}</SubTitle>
                  <RadioGroup className="flexRow alignItemsCenter mTop18">
                    <Radio
                      className="InlineFlex"
                      text={_l('有分享权限的用户')}
                      checked={data?.roleType !== 100}
                      onClick={() => {
                        edit({
                          ...data,
                          roleType: 0,
                        });
                      }}
                    />
                    <Radio
                      className="InlineFlex alignItemsCenter mLeft50"
                      title={_l('仅系统角色')}
                      text={
                        <span className="InlineFlex alignItemsCenter">
                          {_l('仅系统角色')}
                          <Tooltip placement="bottom" title={_l('包含管理员、运营者、开发者')}>
                            <Icon icon="info_outline" className="Gray_9e Font16 mLeft5 InlineFlex" />
                          </Tooltip>
                        </span>
                      }
                      checked={data?.roleType === 100}
                      onClick={() => {
                        edit({
                          ...data,
                          roleType: 100,
                        });
                      }}
                    />
                  </RadioGroup>
                </SettingItem>
                <SettingItem>
                  <div className="con">
                    <SubTitle className="mTop24 Bold">{_l('允许分享的视图')}</SubTitle>
                    <RadioGroup className="flexRow alignItemsCenter mTop18">
                      <Radio
                        className="InlineFlex"
                        text={_l('所有视图')}
                        checked={data?.viewIds?.length <= 0 && !isView}
                        onClick={() => {
                          edit({
                            ...data,
                            viewIds: [],
                          });
                          setIsView(false);
                        }}
                      />
                      <Radio
                        className="InlineFlex mLeft50"
                        text={_l('指定视图')}
                        checked={data?.viewIds?.length > 0 || isView}
                        onClick={() => {
                          edit({
                            ...data,
                            viewIds: [],
                          });
                          setIsView(true);
                        }}
                      />
                    </RadioGroup>
                    {(data?.viewIds?.length > 0 || isView) && (
                      <SelectExDrop
                        className="mTop8"
                        noTxt={_l('无相关数据')}
                        max={100000}
                        // key={JSON.stringify(data.viewIds)}
                        values={data?.viewIds || []}
                        keyId="viewId"
                        name="name"
                        controls={views.filter(l => l.viewId !== l.worksheetId)}
                        onChange={viewIds => {
                          edit({ ...data, viewIds: viewIds });
                        }}
                      />
                    )}
                  </div>
                </SettingItem>
                <div className="conLine mTop24" />
                <SettingItem>
                  <SubTitle className="mTop24 Bold">{_l('分享卡片设置')}</SubTitle>
                  <div className="mTop25">
                    <ShareCardSetting
                      worksheetInfo={worksheetInfo}
                      defaultValue={{
                        title: activeTab === 'view' ? _l('表名称-视图名称') : _l('未命名'),
                      }}
                      key={worksheetId + activeTab}
                      worksheetId={worksheetId}
                      appId={appId}
                      type={activeTab === 'view' ? SHARECARDTYPS.VIEW : SHARECARDTYPS.RECORD}
                      titleTxt={_l('标题')}
                      titlePlaceholder={activeTab === 'view' ? _l('默认：表名称-视图名称') : _l('默认使用记录标题')}
                      desTxt={_l('描述')}
                      canUseControl={activeTab !== 'view'}
                      //标题支持文本、数值、金额、邮箱、文本组合
                      controls={worksheetControls.filter(o => [2, 6, 8, 5, 32].includes(o.type))}
                      showTips={false}
                      showBaseImg={activeTab !== 'view'}
                      autoSave
                    />
                  </div>
                </SettingItem>
              </>
            )}
          </RecordSharing>
        );
    }
  };

  if (info.loading) return <LoadDiv />;

  return (
    <ScrollView>
      <Container className="w100 h100">
        <div className="flexRow">
          <span className="Font17 Bold flex Height36">{_l('公开分享')}</span>
        </div>
        <Tabs>
          {TYPES.map(o => {
            return (
              <Tab
                className={cx('Bold Font14 hoverText', activeTab === o.key ? 'ThemeColor3 curTab' : 'Gray_75')}
                onClick={() => setActiveTab(o.key)}
              >
                {o.lab}
              </Tab>
            );
          })}
        </Tabs>
        <TabContent>{renderCon()}</TabContent>
      </Container>
    </ScrollView>
  );
};

export default SharingSettings;
