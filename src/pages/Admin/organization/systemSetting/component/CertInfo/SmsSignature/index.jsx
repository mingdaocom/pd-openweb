import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Dialog, Icon, LoadDiv, Menu, MenuItem, VerifyPasswordConfirm } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import certificationApi from 'src/api/certification';
import ListContainer from '../components/ListContainer';
import { AddOrEditSignDialog } from './AddOrEditSign';
import { TestSmsDialog } from './TestSmsDialog';

const SIGN_STATUS = {
  REVIEWING: 1,
  SUCCESS: 2,
  FAIL: 3,
};

const MENU_LIST = [
  { key: 'smsTest', text: _l('短信测试') },
  { key: 'setDefault', text: _l('设为默认') },
  { key: 'switch', text: _l('停用') },
  { key: 'edit', text: _l('编辑') },
  { key: 'delete', text: _l('删除') },
];

export default function SmsSignature(props) {
  const { authType, projectId } = props;
  const [signList, setSignList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupVisibleId, setPopupVisibleId] = useState('');

  useEffect(() => {
    getSignList();
  }, []);

  const getSignList = () => {
    setLoading(true);
    certificationApi
      .getSmsSignatures({ projectId })
      .then(res => {
        setSignList(res || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const onMenuClick = (key, item) => {
    setPopupVisibleId('');
    switch (key) {
      case 'smsTest':
        TestSmsDialog({ signId: item.id, signName: item.signName, projectId });
        break;
      case 'setDefault':
        certificationApi.setDefaultSmsSignature({ id: item.id, projectId }).then(res => {
          if (res) {
            alert(_l('设置成功'));
            setSignList(signList.map(sign => ({ ...sign, isDefault: sign.id === item.id })));
          } else {
            alert(_l('设置失败'), 2);
          }
        });
        break;
      case 'switch':
        certificationApi.disableSmsSignature({ id: item.id, projectId, disable: !item.disable }).then(res => {
          if (res) {
            alert(_l('设置成功'));
            setSignList(signList.map(sign => (sign.id === item.id ? { ...sign, disable: !item.disable } : sign)));
          } else {
            alert(_l('设置失败'), 2);
          }
        });
        break;
      case 'edit':
        AddOrEditSignDialog({ signInfo: item, projectId, onSuccess: getSignList });
        break;
      case 'delete':
        Dialog.confirm({
          title: <span className="Red">{_l('您确定删除签名？')}</span>,
          width: 560,
          buttonType: 'danger',
          okText: _l('删除'),
          description: _l(
            '删除后，有使用此签名的外部门户/公开表单/工作流短信发送还是用此签名，需要联系应用管理员修改签名。',
          ),
          onOk: () => {
            VerifyPasswordConfirm.confirm({
              onOk: () => {
                certificationApi.removeSmsSignature({ id: item.id, projectId }).then(res => {
                  if (res) {
                    alert(_l('删除成功'));
                    setSignList(signList.filter(sign => sign.id !== item.id));
                  } else {
                    alert(_l('删除失败'), 2);
                  }
                });
              },
            });
          },
        });
        break;
      default:
        break;
    }
  };

  if ([0, 1].includes(authType) && !window.platformENV.isOverseas && !window.platformENV.isLocal) {
    return (
      <Fragment>
        <div className="bold mBottom16">{_l('短信签名')}</div>
        <div className="textSecondary">{_l('尚未完成企业身份认证，完成认证后即可配置，目前仅可使用平台默认签名')}</div>
      </Fragment>
    );
  }

  const renderItem = item => {
    return (
      <div className="w100">
        <div className="flexRow alignItemsCenter">
          <div className="flex">
            <span className={cx('Font15 bold', { textDisabled: item.disable })}>{item.signName}</span>
            {item.isDefault && <span className="textSecondary mLeft8">{_l('默认')}</span>}
            {item.disable && <span className="failColor mLeft8">{_l('停用')}</span>}
          </div>
          <div className="TxtRight bold Font12">
            {item.auditStatus === SIGN_STATUS.SUCCESS && <span className="successColor">{_l('审核通过')}</span>}
            {item.auditStatus === SIGN_STATUS.REVIEWING && <span className="colorPrimary">{_l('审核中')}</span>}
            {item.auditStatus === SIGN_STATUS.FAIL && (
              <div className="flexRow alignItemsCenter">
                <span className="failColor">{_l('审核未通过，您可以重新编辑提交审核')}</span>
                <Tooltip title={item.auditRemark}>
                  <Icon className="failColor mLeft4 pointer Font16" icon="info" />
                </Tooltip>
              </div>
            )}
          </div>
        </div>

        <div className="flexRow alignItemsCenter">
          <div className="flex">
            {/* 私有非平台版不显示认证主体 */}
            {window.platformENV.isPlatform && (
              <div className="textSecondary flex mTop10">{_l('认证主体：') + item.enterpriseInfo?.companyName}</div>
            )}
            <div className="textSecondary flex mTop10">{_l('申请人：') + item.operator?.fullname}</div>
          </div>
          <Trigger
            popupVisible={popupVisibleId === item.id}
            onPopupVisibleChange={visible => setPopupVisibleId(visible ? item.id : '')}
            action={['click']}
            popupAlign={{
              points: ['tr', 'br'],
              offset: [0, 5],
              overflow: { adjustX: true, adjustY: true },
            }}
            popup={
              <Menu style={{ position: 'unset' }}>
                {MENU_LIST.map(menu => {
                  if (item.auditStatus === SIGN_STATUS.SUCCESS && menu.key === 'edit') {
                    return null;
                  }

                  if (item.auditStatus === SIGN_STATUS.FAIL && ['smsTest', 'setDefault', 'switch'].includes(menu.key)) {
                    return null;
                  }

                  if (item.isDefault && menu.key === 'setDefault') {
                    return null;
                  }

                  return (
                    <MenuItem
                      key={menu.key}
                      onClick={() => onMenuClick(menu.key, item)}
                      className={{ Red: menu.key === 'delete' }}
                    >
                      {menu.key === 'switch' ? (item.disable ? _l('启用') : _l('停用')) : menu.text}
                    </MenuItem>
                  );
                })}
              </Menu>
            }
          >
            <div className={cx('mTop10', { Visibility: item.auditStatus === SIGN_STATUS.REVIEWING })}>
              <Icon icon="moreop" className="Font20 textTertiary pointer ThemeHoverColor3" />
            </div>
          </Trigger>
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      <div className="flexRow alignItemsCenter mBottom10">
        <div className="bold flex">{_l('短信签名')}</div>
        <div className="addBtn" onClick={() => AddOrEditSignDialog({ projectId, onSuccess: getSignList })}>
          <Icon icon="add" />
          <span className="bold">{_l('添加')}</span>
        </div>
      </div>

      {loading ? (
        <LoadDiv className="mTop16" />
      ) : (
        <Fragment>
          <div className="textSecondary mBottom20">
            {signList.length
              ? _l(
                  '审核通过后，公开表单、外部门户及工作流短信通知节点可以使用此签名，审核失败后可修改签名信息重新提交申请',
                )
              : _l('尚未添加短信签名，目前仅可使用平台默认签名')}
          </div>
          <ListContainer list={signList} renderItem={renderItem} />
        </Fragment>
      )}
    </Fragment>
  );
}
