import React, { Fragment, useState } from 'react';
import { Radio } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import DoubleConfirmDialog from './DoubleConfirmDialog';

const FilterTextCon = styled.div`
  width: 100%;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: 3px;
  padding: 8px 16px 10px;
  box-sizing: border-box;
  color: var(--color-text-title);
  margin-top: 10px;
  display: flex;

  .txtFilter {
    flex: 1;
    font-size: 13px;
    color: var(--color-text-title);
    line-height: 20px;

    p {
      line-height: 22px;
      padding: 0;
      margin: 0;
      display: flex;

      .titleTxt {
        width: 100px;
        font-size: 13px;
        line-height: 22px;
        display: inline-block;
      }

      .txt {
        flex: 1;
        font-weight: 500;
        font-size: 13px;
      }
    }
  }

  .editFilter {
    width: 20px;

    &:hover {
      color: var(--color-primary) !important;
    }
  }

  .editWorkflow {
    width: auto;
    color: var(--color-primary);
  }
`;

export default function ClickConfirm(props) {
  const { config, btnSetting, setBtnSetting } = props;
  const { clickType, confirmMsg, sureName, cancelName } = _.isObject(config) ? config : {};
  const [visible, setVisible] = useState(false);
  return (
    <Fragment>
      <div className="settingItem">
        <div className="settingTitle">{_l('点击后')}</div>
        <Radio.Group
          value={clickType}
          onChange={e => {
            setBtnSetting({
              ...btnSetting,
              config: {
                ...config,
                clickType: e.target.value,
              },
            });
          }}
        >
          <Radio value={1} className="Font13">
            {_l('立即执行')}
          </Radio>
          <Radio value={2} className="Font13">
            {_l('需要二次确认')}
          </Radio>
        </Radio.Group>
      </div>
      {clickType === 2 && (
        <div className="settingItem mTop12">
          <FilterTextCon>
            <div className="txtFilter">
              <p>
                <span className="titleTxt textPrimary">{_l('提示文字')}</span>
                <span className="txt textPrimary breakAll">{confirmMsg}</span>
              </p>
              <p className="mTop5">
                <span className="titleTxt textPrimary">{_l('确认按钮文字')}</span>
                <span className="txt textPrimary breakAll">{sureName}</span>
              </p>
              <p className="mTop5">
                <span className="titleTxt textPrimary">{_l('取消按钮文字')}</span>
                <span className="txt textPrimary breakAll">{cancelName}</span>
              </p>
            </div>
            <Icon
              icon="hr_edit"
              className="textTertiary Font18 editFilter Hand"
              onClick={() => {
                setVisible(true);
              }}
            />
          </FilterTextCon>
        </div>
      )}
      {visible && (
        <DoubleConfirmDialog
          doubleConfirm={{
            confirmMsg,
            sureName,
            cancelName,
          }}
          setValue={data => {
            const { doubleConfirm = {}, showDoubleConfirmDialog } = data;
            setBtnSetting({
              ...btnSetting,
              config: {
                ...config,
                confirmMsg: doubleConfirm.confirmMsg,
                sureName: doubleConfirm.sureName,
                cancelName: doubleConfirm.cancelName,
              },
            });
            setVisible(showDoubleConfirmDialog);
          }}
          showDoubleConfirmDialog={visible}
        />
      )}
    </Fragment>
  );
}
