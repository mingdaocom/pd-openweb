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
      <h5>{_l('其他连接器选项')}</h5>
      <p>
        {_l(
          '如果数据源的连接器选项配置和数据库服务器配置不一致时，可能会出现同步错误或者创建同步任务失败的情况。此时可尝试添加额外的连接器选项参数配置。',
        )}
        <a
          href="https://ververica.github.io/flink-cdc-connectors/master/content/connectors/mysql-cdc%28ZH%29.html#id6"
          target="_blank"
          className="mLeft8"
        >
          {_l('查看连接器选项')}
        </a>
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
