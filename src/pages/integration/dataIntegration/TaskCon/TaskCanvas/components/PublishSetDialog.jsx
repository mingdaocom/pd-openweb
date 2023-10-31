import React, { useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Dialog, Dropdown, Checkbox, Tooltip, Icon } from 'ming-ui';
import _ from 'lodash';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { Input } from 'antd';
import cx from 'classnames';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import Ajax from 'src/api/account.js';
import 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/style.less';
import { encrypt } from 'src/util';
import captcha from 'src/components/captcha';

const Wrap = styled.div`
  .ming.Dropdown,
  .dropdownTrigger {
    min-width: 80px;
    max-width: 200px;
  }
  .ming.Item .Item-content .itemText {
    padding-left: 10px;
  }
`;

export default function PublishSetDialog(props) {
  const { onClose, onOk } = props;
  const [{ value, writeMode, isCleanDestTableData, password, fieldForIdentifyDuplicate, loading }, setState] =
    useSetState({
      value: !!props.fieldForIdentifyDuplicate
        ? _.get(
            props.controls.find(o => o.id === _.get(props, 'fieldForIdentifyDuplicate.id')),
            'id',
          )
        : undefined,
      writeMode: !!props.writeMode ? props.writeMode : undefined,
      isCleanDestTableData: !!props.isCleanDestTableData,
      password: '',
      fieldForIdentifyDuplicate: !!props.fieldForIdentifyDuplicate
        ? props.controls.find(o => o.id === _.get(props, 'fieldForIdentifyDuplicate.id'))
        : {},
      loading: false,
    });
  const checkAccountPw = () => {
    if (loading) {
      return;
    }
    if (!!value && !writeMode) {
      return alert(_l('请选择目标字段的处理方式'), 2);
    }
    const doAction = () => {
      // 进入下一步
      onOk({
        fieldForIdentifyDuplicate,
        writeMode,
        isCleanDestTableData,
      });
      onClose();
    };
    if (!isCleanDestTableData) {
      doAction();
    } else {
      if (!password) {
        return alert(_l('请输入密码'), 2);
      }
      const throttled = function (res) {
        if (res.ret !== 0) {
          return;
        }
        Ajax.checkAccount({
          ticket: res.ticket,
          randStr: res.randstr,
          captchaType: md.staticglobal.getCaptchaType(),
          password: encrypt(password),
        })
          .then(data => {
            if (data === 1) {
              doAction();
            } else if (data === 6) {
              return alert(_l('密码错误'), 2);
            } else if (data === 8) {
              return alert(_l('验证码错误'), 2);
            } else {
              return alert(_l('操作失败'), 2);
            }
          })
          .fail();
      };

      if (md.staticglobal.getCaptchaType() === 1) {
        new captcha(throttled);
      } else {
        new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), throttled).show();
      }
    }
  };
  return (
    <Dialog
      visible
      title={_l('更新发布')}
      width={552}
      className="publishSetDialog"
      showCancel={true}
      okText={loading ? _l('更新发布...') : _l('更新发布')}
      onOk={() => {
        checkAccountPw();
      }}
      onCancel={() => {
        onClose();
      }}
    >
      <Wrap>
        <p className="Gray_75">{_l('此操作会重新同步全量数据')}</p>
        <h5 className="Bold mTop32 Font14">{_l('识别重复数据')}</h5>
        <p className="mBottom12 Gray_9e">{_l('未选择目标字段时, 会根据数据源的主键字段判断重复')}</p>
        <div className="flexRow alignItemsCenter">
          <span className="">{_l('在同步时，依据目标字段')}</span>
          <Dropdown
            isAppendToBody
            cancelAble
            className="controlDrop mLeft10 mRight10"
            menuStyle={{ width: '100%' }}
            data={props.controls.map(o => {
              return { text: o.alias || o.name, icon: getIconByType(o.mdType, false), value: o.id };
            })}
            renderTitle={() => {
              const info = props.controls.find(o => o.id === value) || {};
              return (
                <React.Fragment>
                  <Icon className="Gray_9e" icon={getIconByType(info.mdType, false)} /> {info.alias || info.name}
                </React.Fragment>
              );
            }}
            renderItem={o => {
              return <span className="mLeft10">{o.text}</span>;
            }}
            menuClass={'dropWorksheetIntegration'}
            value={value}
            border
            onChange={value => {
              setState({ value, fieldForIdentifyDuplicate: props.controls.find(o => o.id === value) || {} });
            }}
          />
          <span className="">{_l('识别重复，并')}</span>
          <Dropdown
            className="controlDrop mLeft10 mRight10"
            menuStyle={{ width: '100%' }}
            data={[
              { text: _l('跳过'), value: 'SKIP' },
              { text: _l('覆盖'), value: 'OVERWRITE' },
            ]}
            value={writeMode}
            border
            onChange={writeMode => {
              setState({ writeMode });
            }}
          />
          <Tooltip text={_l('“覆盖”会导致数据同步变慢')} popupPlacement="top">
            <Icon icon="info_outline" className="Gray_bd mLeft5 Font18" />
          </Tooltip>
        </div>
        <h5 className="Bold mTop25 Font14">{_l('其他配置')}</h5>
        <div className="">
          <Checkbox
            size="small"
            checked={isCleanDestTableData}
            onClick={() => {
              setState({
                isCleanDestTableData: !isCleanDestTableData,
              });
            }}
            text={_l('在本次同步数据之前，彻底清空目标表数据')}
          />
        </div>
        {isCleanDestTableData && (
          <div>
            <p className="mTop15 mBottom7">{_l('当前用户登录密码')}</p>
            <Input.Password
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              className={cx('password')}
              value={password}
              placeholder={_l('请输入密码确认授权')}
              autoComplete="new-password"
              onChange={e => {
                let value = e.target.value;
                setState({
                  password: value,
                });
              }}
            />
          </div>
        )}
      </Wrap>
    </Dialog>
  );
}
