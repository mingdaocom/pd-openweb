import React from 'react';
import './index.less';

export default function MingDaoYunGuide(props) {
  const { type } = props;
  return type === 'source' ? (
    <div className="guideContent">
      <p>{_l('你可以把 工作表 作为源数据，同步数据到工作表或者其它数据目的地。')}</p>
      <h5>{_l('选择应用')}</h5>
      <p className="indent">
        {_l('同步前需要选择要同步到的目标应用，只能从当前用户是应用管理员和开发者的应用中选取。')}
      </p>
    </div>
  ) : (
    <div className="guideContent">
      <p>{_l('你可以把工作表或者其它数据源的数据，通过系统实时同步到 工作表')}</p>
      <h5>{_l('选择应用')}</h5>
      <p className="indent">{_l('只能从当前用户是应用管理员和开发者的应用中选取。')}</p>
    </div>
  );
}
