import React, { useState } from 'react';
import styled from 'styled-components';
import { Dropdown, Icon, RadioGroup, Switch } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import worksheetApi from 'src/api/worksheet';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';

export const Wrapper = styled.div`
  padding: 35px 40px 32px;
  max-width: 1080px;
  .settingItem {
    display: flex;
    align-items: center;
    margin-top: 24px;
    .labelText {
      width: 120px;
      margin-right: 12px;
    }
  }
`;

const LOCK_TIME = [
  { text: _l('1分钟'), value: '1' },
  { text: _l('2分钟'), value: '2' },
  { text: _l('5分钟'), value: '5' },
  { text: _l('10分钟'), value: '10' },
  { text: _l('15分钟'), value: '15' },
  { text: _l('20分钟'), value: '20' },
  { text: _l('25分钟'), value: '25' },
  { text: _l('30分钟'), value: '30' },
];

const COUNT_DOWN = [
  { text: _l('不显示'), value: '0' },
  { text: _l('前1分钟'), value: '1' },
  { text: _l('前2分钟'), value: '2' },
  { text: _l('前3分钟'), value: '3' },
];

const EXPIRED_RADIO_GROUP = [
  { text: _l('记录未变更时可以继续编辑'), value: '1' },
  { text: _l('不允许继续编辑'), value: '2' },
];

export default function EditProtect(props) {
  const { worksheetInfo, onChange } = props;
  const { projectId, appId, worksheetId, advancedSetting = {} } = worksheetInfo || {};
  const [lock, setLock] = useState(safeParse(advancedSetting.roweditlock) || { isopen: '0' });

  const onEditSetting = data => {
    setLock(data);
    const newAdvancedSetting = { ...advancedSetting, roweditlock: JSON.stringify(data) };

    worksheetApi
      .editWorksheetSetting({
        workSheetId: worksheetId,
        appId,
        projectId,
        advancedSetting: newAdvancedSetting,
        editAdKeys: ['roweditlock'],
      })
      .then(res => {
        if (res) {
          onChange({ ...worksheetInfo, advancedSetting: newAdvancedSetting });
        } else {
          alert(_l('修改失败，请稍后再试'), 2);
        }
      });
  };

  return (
    <Wrapper>
      <div className="flexRow alignItemsCenter">
        <div className="flex bold Font17">{_l('编辑保护')}</div>
        <Switch
          checked={lock.isopen === '1'}
          onClick={() => {
            if (getFeatureStatus(projectId, VersionProductType.editProtect) !== '1') {
              buriedUpgradeVersionDialog(projectId, VersionProductType.editProtect);
              return;
            }
            onEditSetting(
              lock.isopen === '1'
                ? { isopen: '0' }
                : { isopen: '1', expiretime: '10', countdown: '0', expiredaction: '1' },
            );
          }}
        />
        <span className="mLeft8">{lock.isopen === '1' ? _l('启用') : _l('关闭')}</span>
      </div>

      <div className="Gray_9e mTop10">
        {_l(
          '开启后，不能多人同时编辑同一条记录。当有用户在详情页触发编辑时，该记录即进入保护状态，仅当前用户可编辑记录，其他用户仅能查看。当该用户提交记录或超过保护时长，其他用户方可编辑。',
        )}
      </div>

      {lock.isopen === '1' && (
        <React.Fragment>
          <div className="settingItem">
            <div className="labelText flexRow alignItemsCenter">
              <span>{_l('保护时长')}</span>
              <Tooltip
                title={_l(
                  '指开启记录编辑保护模式后，用户长时间无操作时，系统自动退出保护状态的时间。超时后，其他用户可继续编辑记录。',
                )}
                placement="bottom"
              >
                <Icon icon="help" className="Gray_9e Font16 mLeft10" />
              </Tooltip>
            </div>
            <Dropdown
              className="Width300"
              border
              data={['meihua.mingdao.com', 'www.mingdao.com'].includes(location.host) ? LOCK_TIME.slice(2) : LOCK_TIME}
              value={lock.expiretime}
              onChange={value => onEditSetting({ ...lock, expiretime: value })}
            />
          </div>
          <div className="settingItem">
            <div className="labelText">{_l('超时前显示倒计时')}</div>
            <Dropdown
              className="Width300"
              border
              data={COUNT_DOWN}
              value={lock.countdown}
              onChange={value => onEditSetting({ ...lock, countdown: value })}
            />
          </div>
          <div className="settingItem">
            <div className="labelText">{_l('超时后')}</div>
            <RadioGroup
              checkedValue={lock.expiredaction}
              data={EXPIRED_RADIO_GROUP}
              onChange={value => onEditSetting({ ...lock, expiredaction: value })}
            />
          </div>
          <div className="mTop24 Gray_9e">
            <div>{_l('注意：')}</div>
            <div>{_l('仅详情页内编辑才能生效编辑保护；')}</div>
            <div>{_l('触发编辑以记录上方出现“正在修改表单数据…”的蓝色提示为准；')}</div>
            <div>{_l('编辑保护不会拦截行式编辑、公开表单、工作流或通过API修改记录等操作。')}</div>
          </div>
        </React.Fragment>
      )}
    </Wrapper>
  );
}
