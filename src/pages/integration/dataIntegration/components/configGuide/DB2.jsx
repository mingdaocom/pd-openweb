import React from 'react';
import './index.less';

export default function DB2Guide(props) {
  const { type } = props;
  return type === 'source' ? (
    <div className="guideContent">
      <p>{_l('你可以把 IBM db2 数据库的数据通过系统实时同步到工作表或者其它数据目的地。')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('支持IBM db2的版本：11.5x')}</li>
        <li>{_l('不支持 DB2 上的 布尔类型')}</li>
        <li>{_l('将数据集成的系统 IP 添加到 DB2 服务器的访问白名单')}</li>
      </ul>

      <h5>{_l('查询数据库版本')}</h5>
      <div className="subTitle">{_l('方法1')}</div>
      <div className="sqlText">
        <div>SELECT * FROM SYSIBMADM.ENV_INST_INFO;</div>
      </div>
      <div className="subTitle">{_l('方法2')}</div>
      <div className="sqlText">
        <div>db2level</div>
      </div>

      <h5>{_l('检查表的 CDC 状态')}</h5>
      <div className="sqlText">
        <div>SELECT TABSCHEMA, TABNAME, CAPTURE</div>
        <div>FROM SYSCAT.TABLES</div>
        <div>WHERE TABSCHEMA = 'schema_name' AND TABNAME = 'table_name';</div>
      </div>
      <p>{_l('如果 CAPTURE 列的值为 "Y"，表示表已处于捕获模式。')}</p>

      <h5>{_l('启用表的CDC')}</h5>
      <div className="sqlText">
        <div>ALTER TABLE schema_name.table_name ACTIVATE NOT LOGGED INITIALLY;</div>
      </div>
      <ul>
        <li>{_l('schema_name 是表所属的模式名称')}</li>
        <li>{_l('table_name 是要启用 CDC 的表的名称')}</li>
      </ul>
      <p>
        {_l('更多配置项参考')}
        <a
          href="https://debezium.io/documentation/reference/stable/connectors/db2.html#setting-up-db2"
          className="mLeft8"
        >
          Debezium Documentation
        </a>
      </p>
    </div>
  ) : null;
}
