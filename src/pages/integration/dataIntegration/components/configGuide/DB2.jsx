import React from 'react';
import './index.less';

export default function DB2Guide(props) {
  const { type } = props;
  return type === 'source' ? (
    <div className="guideContent">
      <p>{_l('你可以把 IBM DB2 数据库作为源数据，同步数据到工作表或者其它数据目的地。')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('数据库版本：11.5x')}</li>
        <li>{_l('不支持 DB2 上的 布尔类型')}</li>
      </ul>

      <h5>{_l('DB2作为源增量读取时，对于数据表需要执行')}</h5>
      <div className="sqlText">
        <div>{_l('ALTER TABLE <模型名称>.<表名称> DATA CAPTURE CHANGES')}</div>
      </div>

      <h5>{_l('DB2数据库在DDL事件后，需要执行存储过程')}</h5>
      <div className="sqlText">
        <div>{_l("CALL SYSPROC.ADMIN_CMD('REORG TABLE <模型名称>.<表名称>')")}</div>
      </div>

      <h5>{_l('不支持 DB2 上的 布尔类型')}</h5>
      <p>
        {_l(
          '目前，Db2上的SQL Replication不支持BOOLEAN，所以Debezium不能在这些表中执行CDC。考虑使用其他类型来代替BOOLEAN类型',
        )}
      </p>

      <h5>{_l('测试连接')}</h5>
      <p>
        {_l(
          '创建数据源时，检查数据库服务器的连通性、账户密码等正确性、数据库是否可用、以及检查是否可以作为源或者目的地。只有数据源通过全部测试才能够正常使用数据源。',
        )}
      </p>
    </div>
  ) : null;
}
