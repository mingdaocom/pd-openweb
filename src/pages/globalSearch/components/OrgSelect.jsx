import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Input } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getCurrentProjectId } from '../utils';
import './OrgSelect.less';

const OrgSelectCon = styled.div`
  .orgShowCon {
    padding: 0 14px;
    border: 1px solid #dddddd;
    border-radius: 14px;
    height: 28px;
    line-height: 28px;
    display: flex;
    align-items: center;
    cursor: pointer;
    max-width: 287px;
  }
  .orgShowCon:hover {
    border-color: #1677ff;
    color: #1677ff;
  }
  .mLeft9 {
    margin-left: 9px !important;
  }
`;

const ALL_ORG = { companyName: '全部组织', projectId: 'all' };

export default function OrgSelect(props) {
  const { currentProjectId, needAll = false, onChange, style = {}, filterFucntion = l => l } = props;

  const [orgList, setOrgList] = useState(md.global.Account.projects || []);
  const [selected, setSelected] = useState(undefined);
  const [search, setSearch] = useState(undefined);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let current = currentProjectId || getCurrentProjectId();

    setSelected(needAll ? ALL_ORG : _.find(orgList, { projectId: current }));
    setOrgList((needAll ? [ALL_ORG] : []).concat(md.global.Account.projects));
  }, [needAll]);

  useEffect(() => {
    let current = currentProjectId || getCurrentProjectId();
    setSelected(_.find(orgList, { projectId: current }) || ALL_ORG);
  }, [currentProjectId]);

  const onClick = item => {
    setSelected(item);
    setVisible(false);
    onChange(item.projectId);
  };

  const searchHandle = value => {
    let list = md.global.Account.projects;
    setSearch(value);
    if (!value || !value.trim()) {
      setOrgList(list);
      return;
    }
    list = list.filter(l => l.companyName.indexOf(value.trim()) > -1);
    setOrgList(needAll ? [ALL_ORG].concat(list) : list);
  };

  if (md.global.Account.projects.length === 0) return <span />;

  return (
    <OrgSelectCon className="Font12 Bold" style={style}>
      <Trigger
        className="orgSelectTrigger"
        popupVisible={visible}
        onPopupVisibleChange={visible => setVisible(visible)}
        action={['click']}
        popupAlign={{ points: ['tl', 'bl'] }}
        popup={
          <div className="orgDrowSelectCon">
            <div className="orgSearchCon">
              <Icon icon="search Font16 Gray_9d" />
              <Input placeholder={_l('搜索')} className="flex" value={search} onChange={searchHandle} />
              <Tooltip title={_l('记录仅支持单个组织搜索，且不支持外部协作组织')}>
                <Icon icon="info_outline" className="Font14 Gray_9d" />
              </Tooltip>
            </div>
            <ul className="orgList">
              {orgList.filter(filterFucntion).map(item => {
                return (
                  <li
                    className={cx('orgListItem overflow_ellipsis', {
                      active: selected ? selected.projectId === item.projectId : false,
                    })}
                    key={`orgListItem-${item.projectId}`}
                    onClick={() => onClick(item)}
                  >
                    {item.companyName}
                  </li>
                );
              })}
              {orgList.filter(filterFucntion).length === 0 && (
                <span className="orgListItem Gray_9">{_l('暂无搜索结果')}</span>
              )}
            </ul>
          </div>
        }
      >
        <div className="orgShowCon">
          <span className="ellipsis">{selected && selected.companyName}</span>{' '}
          <Icon icon="expand_more" className="Font20 Gray_bd mLeft9" />
        </div>
      </Trigger>
    </OrgSelectCon>
  );
}
