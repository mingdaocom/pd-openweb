import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import { Icon } from 'ming-ui';
import cx from 'classnames';

const SwitchStyle = styled.div`
  display: inline-block;
  .switchText {
    margin-right: 6px;
    line-height: 24px;
  }
  .icon {
    vertical-align: middle;
    &-ic_toggle_on {
      color: #00c345;
    }
    &-ic_toggle_off {
      color: #bdbdbd;
    }
  }
`;
const Wrap = styled.div`
  border: 1px solid #dddddd;
  opacity: 1;
  border-radius: 6px;
  margin-top: 13px;
  .actionLi {
    border-bottom: 1px solid #eaeaea;
    padding: 0 20px 0 26px;
    height: 44px;
    &:last-child {
      border-bottom: 0;
    }
    icon {
    }
  }
`;
const acitions = [
  {
    text: _l('编辑'),
    value: 'edit',
    icon: 'edit',
  },
  {
    text: _l('复制'),
    value: 'copy',
    icon: 'copy',
  },
  {
    text: _l('分享'),
    value: 'share',
    icon: 'share',
  },
  {
    text: _l('导出'),
    value: 'export',
    icon: 'download',
  },
  {
    text: _l('打印'),
    value: 'print',
    icon: 'print',
  },
  {
    text: _l('删除'),
    value: 'delete',
    icon: 'delete2',
  },
];

export default function ActionBtn(props) {
  return (
    <React.Fragment>
      <p className="Bold Gray_75 Font13 mTop25 mBottom0">{_l('系统操作')}</p>
      <Wrap>
        {acitions
          .filter(o => (props.isListOption ? !['share'].includes(o.value) : !['edit', 'export'].includes(o.value)))
          .map(o => {
            const data = props.data || [];
            return (
              <div className="flexRow alignItemsCenter actionLi">
                <Icon className={cx('Font18 mRight12', o.value !== 'delete' ? 'Gray_75' : 'Red')} type={o.icon} />
                <span className="flex Bold Font13">{o.text}</span>
                <SwitchStyle>
                  <Icon
                    icon={!data.includes(o.value) ? 'ic_toggle_on' : 'ic_toggle_off'}
                    className="Font30 Hand"
                    onClick={() => {
                      props.onChange(
                        JSON.stringify(
                          data.includes(o.value) ? data.filter(it => o.value !== it) : data.concat(o.value),
                        ),
                      );
                    }}
                  />
                </SwitchStyle>
              </div>
            );
          })}
      </Wrap>
    </React.Fragment>
  );
}
