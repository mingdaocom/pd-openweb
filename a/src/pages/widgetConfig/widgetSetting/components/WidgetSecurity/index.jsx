import React, { useEffect, useState, Fragment } from 'react';
import { Tooltip } from 'antd';
import { Checkbox, Icon, Support, UpgradeIcon } from 'ming-ui';
import { SettingItem, EditInfo } from 'src/pages/widgetConfig/styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import { DISPLAY_MASK, CUSTOM_DISPLAY } from 'src/pages/widgetConfig/config/setting';
import MaskSettingDialog from './MaskSettingDialog';
import EncryptSettingDialog from './EncryptSettingDialog';
import styled from 'styled-components';
import { buriedUpgradeVersionDialog, getFeatureStatus } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import cx from 'classnames';
import _ from 'lodash';

const ViewWrap = styled.div`
  display: flex;
  border-radius: 3px;
  border: 1px solid #dddddd;
  margin-top: 8px;
  .viewCon {
    padding: 0 16px;
    background: #fafafa;
    line-height: 34px;
    text-align: center;
    color: #757575;
    border-right: 1px solid #ddd;
  }
`;

export default function ControlMask(props) {
  const { data = {}, encryData = [], globalSheetInfo, onChange } = props;
  const { encryId = '', type } = data;
  const { datamask, masktype } = getAdvanceSetting(data);
  const [visible, setVisible] = useState(false);
  const [encryptVisible, setEncryptVisible] = useState(false);

  const ruleName = _.get(
    _.find(encryData, i => i.encryptRuleId === encryId),
    'name',
  );
  const isDeleteRule = encryId && !ruleName;
  // 旗舰版可用
  const isPayType = getFeatureStatus(globalSheetInfo.projectId, VersionProductType.dataEnctypt) === '2';

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          className="customWidgetCheckbox"
          size="small"
          checked={datamask === '1'}
          onClick={checked => {
            if (!checked) {
              setVisible(true);
            } else {
              onChange(
                handleAdvancedSettingChange(data, {
                  datamask: String(+!checked),
                }),
              );
            }
          }}
        >
          <span style={{ marginRight: '4px' }}>{_l('掩码显示')}</span>
          <Tooltip
            placement="bottom"
            title={_l(
              '将字段值显示为掩码，应用管理员和有解码权限的用户可以点击后解码查看（解码权限需要在用户-角色-字段权限中配置）。在对外公开分享时始终掩盖',
            )}
          >
            <Icon icon="help" className="Font16 Gray_9e" />
          </Tooltip>
        </Checkbox>
      </div>

      {datamask === '1' && (
        <EditInfo style={{ margin: '8px 0' }} onClick={() => setVisible(true)}>
          <div className="text overflow_ellipsis Gray">
            <span className="Bold">{_l('掩码方式： ')}</span>
            {_.get(
              DISPLAY_MASK.concat(CUSTOM_DISPLAY).find(item => item.value === masktype),
              'text',
            )}
          </div>
          <div className="edit">
            <i className="icon-edit"></i>
          </div>
        </EditInfo>
      )}

      {visible && <MaskSettingDialog {...props} onCancel={() => setVisible(false)} />}

      {!_.includes([6, 8], type) && (
        <div className="labelWrap">
          <Checkbox
            className="customWidgetCheckbox"
            size="small"
            checked={encryId}
            onClick={checked => {
              if (!checked) {
                if (isPayType) {
                  buriedUpgradeVersionDialog(globalSheetInfo.projectId, VersionProductType.dataEnctypt);
                  return;
                }
                setEncryptVisible(true);
              } else {
                onChange({ encryId: '' });
              }
            }}
          >
            <span className="mRight5">{_l('数据存储加密')}</span>
            {isPayType && <UpgradeIcon />}
            <Tooltip
              placement="bottom"
              title={
                <span>
                  {_l('对字段数据进行加密存储，保护重要信息。注意：字段加密后。一些使用将会受限。')}
                  <Support type={3} text={_l('了解详情')} href="https://help.mingdao.com/sheet29" />
                </span>
              }
            >
              <Icon icon="help" className="Font16 Gray_9e" />
            </Tooltip>
          </Checkbox>
        </div>
      )}

      {encryId && (
        <ViewWrap>
          <div className="viewCon">{_l('规则')}</div>
          <EditInfo
            onClick={() => {
              if (isPayType) {
                buriedUpgradeVersionDialog(globalSheetInfo.projectId, VersionProductType.dataEnctypt);
                return;
              }
              setEncryptVisible(true);
            }}
            className="flex Border0"
          >
            <div className={cx('text overflow_ellipsis', isDeleteRule ? 'Red' : 'Gray')}>
              {isDeleteRule ? _l('规则已删除') : ruleName}
            </div>
            <div className="edit">
              <i className="icon-edit"></i>
            </div>
          </EditInfo>
        </ViewWrap>
      )}

      {encryptVisible && (
        <EncryptSettingDialog
          {...props}
          encryData={encryData.map(item => ({
            value: item.encryptRuleId,
            text: item.name,
            state: item.state,
            isDefault: item.isDefault,
          }))}
          isDeleteRule={isDeleteRule}
          onCancel={() => setEncryptVisible(false)}
        />
      )}
    </Fragment>
  );
}
