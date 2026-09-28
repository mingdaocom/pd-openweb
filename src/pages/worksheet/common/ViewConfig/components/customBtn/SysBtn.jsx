import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Switch } from 'ming-ui/antd-components';

const Wrap = styled.div`
  border: 1px solid var(--color-border-primary);
  opacity: 1;
  border-radius: 6px;
  margin-top: 13px;
  .actionLi {
    border-bottom: 1px solid var(--color-border-secondary);
    padding: 0 20px 0 26px;
    height: 44px;
    &:last-child {
      border-bottom: 0;
    }
    icon {
    }
  }
`;
const actions = [
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
    icon: 'trash',
  },
];

export default function ActionBtn(props) {
  return (
    <React.Fragment>
      <p className="Bold textSecondary Font13 mTop25 mBottom0">{_l('系统操作')}</p>
      <Wrap>
        {actions
          .filter(o => (props.isListOption ? !['share'].includes(o.value) : !['edit', 'export'].includes(o.value)))
          .map(o => {
            const data = props.data || [];
            return (
              <div className="flexRow alignItemsCenter actionLi">
                <Icon className={cx('Font18 mRight12', o.value !== 'delete' ? 'textSecondary' : 'Red')} type={o.icon} />
                <span className="flex Bold Font13">{o.text}</span>
                <Switch
                  size="mini"
                  checked={!data.includes(o.value)}
                  onChange={() => {
                    props.onChange(
                      JSON.stringify(data.includes(o.value) ? data.filter(it => o.value !== it) : data.concat(o.value)),
                    );
                  }}
                />
              </div>
            );
          })}
      </Wrap>
    </React.Fragment>
  );
}
