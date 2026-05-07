import React from 'react';
import cx from 'classnames';
import { OptionWrap } from './styled';

export default props => {
  const { companyId, onChange } = props;
  const { projects } = md.global.Account;
  return (
    <div className="flexColumn mBottom20">
      <div className="Font14 bold mBottom15">{_l('组织')}</div>
      <div>
        {[
          {
            companyName: _l('全部'),
            projectId: undefined,
          },
          ...projects,
        ].map(item => (
          <OptionWrap
            key={item.projectId}
            className={cx('item', { checked: companyId === item.projectId })}
            onClick={() => onChange({ companyId: item.projectId })}
          >
            {item.companyName}
          </OptionWrap>
        ))}
      </div>
    </div>
  );
};
