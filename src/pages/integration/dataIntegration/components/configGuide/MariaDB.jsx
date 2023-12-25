import React from 'react';
import './index.less';

export default function MariaDBGuide(props) {
  const { type } = props;
  return type === 'source' ? (
    <div className="guideContent">
      <p>{_l('你可以把 MariaDB 数据库的数据通过系统实时同步到工作表或者其它数据目的地。')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li className="pointer textUnderline" onClick={() => document.getElementById('versionId').scrollIntoView()}>
          {_l('支持MariaDB的版本: 10.3及以上')}
        </li>
        <li className="pointer textUnderline" onClick={() => document.getElementById('binLogId').scrollIntoView()}>
          {_l('需要开启Binlog并设置为ROW模式')}
        </li>
        <li className="pointer textUnderline" onClick={() => document.getElementById('authId').scrollIntoView()}>
          {_l('授权MariaDB账户对应的权限')}
        </li>
        <li
          className="pointer textUnderline"
          onClick={() => document.getElementById('communicationId').scrollIntoView()}
        >
          {_l('确保数据库可以与数据集成通信')}
        </li>
      </ul>

      <h5 id="versionId">{_l('检查 MariaDB 版本')}</h5>
      <div className="sqlText">
        <div>{`mysql> mysql -V;`}</div>
      </div>

      <h5 id="binLogId">{_l('检查Binlog是否开启')}</h5>
      <div className="sqlText">
        <div>{`mysql> select @@log_bin;`}</div>
      </div>
      <p>
        {_l(
          '如果该语句返回值为1，说明BinLog是激活的。如果返回值为0，这意味着BinLog被禁用。要启用它，请遵循下面的步骤。',
        )}
      </p>

      <h5>{_l('开启Binlog')}</h5>
      <div className="subTitle">{_l('1. 登陆到MariaDB服务器编辑配置文件')}</div>
      <div className="sqlText">
        <div>sudo nano /etc/mysql/my.cnf</div>
      </div>
      <p className="subTitle">{_l('2. 检查配置文件')}</p>
      <div>{_l('在配置文件中检查是否符合以下内容，不符合的需要修改')}</div>
      <div className="sqlText">
        <div>[mysqld]</div>
        <div>binlog_format=ROW</div>
        <div>binlog_row_image=FULL</div>
        <div>
          expire_logs_days=3 -- The retention period (`expire_log_days`) can also be set in seconds by using the
          command: `binlog_expire_logs_seconds=259200`
        </div>
        <div>log_bin=mysql-binlog -- For ubuntu, use: `/var/log/mysql/mysql-bin.log`</div>
        <div>server-id=1 -- (only in the case of ubuntu)</div>
        <div>log_slave_updates=1</div>
      </div>
      <div className="subTitle">{_l('3. 如果修改过配置文件，需要重启MariaDB服务器')}</div>
      <div className="sqlText">
        <div>service mysql restart</div>
      </div>
      <p>{_l('重启后再次检查binlog状态')}</p>

      <h5 id="authId">{_l('授权MariaDB账户对应的权限')}</h5>
      <div className="subTitle">{_l('1. 创建用户，也可以用已有用户')}</div>
      <div className="sqlText">
        <div>{`mysql> CREATE USER '${_l('用户名')}'@'%' IDENTIFIED BY '${_l('密码')}';`}</div>
      </div>
      <p>{_l('如果已有账号可以直接进行赋权')}</p>
      <div className="subTitle">{_l('2. 赋权')}</div>
      <div className="sqlText">
        <div>GRANT SELECT, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO '{_l('用户名')}' ;</div>
      </div>
      <div>{_l('如果是已有用户，可以通过以下命令查询权限')}</div>
      <div className="sqlText">
        <div>SHOW GRANTS FOR {_l("'用户名'@'主机'")} ;</div>
      </div>
      <p>{_l('如果权限不足，可以按照上方赋权重新增加对应权限')}</p>
      <div>{_l('需要包含的权限')}</div>
      <ul>
        <li>SELECT</li>
        <li>SHOW</li>
        <li>DATABASES</li>
        <li>REPLICATION SLAVE</li>
        <li>REPLICATION CLIENT</li>
      </ul>
      <div>{_l('扩展：撤销用户的权限')}</div>
      <div className="sqlText">
        <div>EVOKE REPLICATION SLAVE ON *.* FROM {_l("'用户名'@'%'")} ;</div>
      </div>
      <p>
        {_l('更多配置项参考')}
        <a
          href="https://debezium.io/documentation/reference/stable/connectors/mysql.html#setting-up-mysql"
          className="mLeft8"
        >
          Debezium Documentation
        </a>
      </p>

      <h5 id="communicationId">{_l('确保数据库可以与数据集成通信')}</h5>
      <div className="subTitle">{_l('1. 编辑MariaDB服务器的配置文件')}</div>
      <div className="sqlText">
        <div>sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf</div>
      </div>
      <div className="subTitle">{_l('2. 找到 [mysqld] 部分，添加下方语句')}</div>
      <div className="sqlText">
        <div>{_l('bind-address = 0.0.0.0 [这里是系统白名单，在左侧配置信息底部显示]')}</div>
      </div>
      <p>{_l('也可以通过数据库服务器添加全局性的访问白名单')}</p>

      <h5>{_l('测试连接')}</h5>
      <p>
        {_l(
          '测试连接创建数据源时，检查数据库服务器的连通性、账户密码等正确性、数据库是否可用、以及检查是否可以作为源或者目的地。只有数据源通过全部测试才能够正常使用数据源。',
        )}
      </p>

      <h5>{_l('其他连接器选项')}</h5>
      <p>
        {_l(
          '如果数据源的连接器选项配置和数据库服务器配置不一致时，可能会出现同步错误或者创建同步任务失败的情况。此时可尝试添加额外的连接器选项参数配置。',
        )}
        <a
          href="https://ververica.github.io/flink-cdc-connectors/master/content/connectors/mysql-cdc%28ZH%29.html#id6"
          className="mLeft8"
        >
          {_l('查看连接器选项')}
        </a>
      </p>

      <h5>{_l('指定当前MariaDB服务器的时区')}</h5>
      <div className="sqlText">
        <div>server-time-zone=Asia/Shanghai</div>
      </div>
      <p>{_l('以“Asia/Shanghai”时区举例，这里填入数据库服务器对应的时区信息')}</p>

      <h5>{_l('常见问题')}</h5>
      <div>
        {_l('报错内容是')} Access denied; you need (at least one of) the SUPER, REPLICATION CLIENT privilege(s) for this
        operation
      </div>
      <div className="sqlText">
        <div className="whiteSpaceNormal">
          {_l('1 没有开启权限，尝试重新赋予用户 REPLICATION SLAVE, REPLICATION CLIENT 权限')}
        </div>
        <div className="whiteSpaceNormal">
          {_l(
            '2 说明：这两个权限在 MariaDB 复制环境中起着不同的作用，REPLICATION SLAVE 用于连接和同步数据，而 REPLICATION CLIENT 则用于复制监控和管理操作。通常，在配置从服务器时，需要授予用户同时具备这两个权限才能正常进行复制。',
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="guideContent">
      <p>{_l('你可以将其它数据源的数据实时同步到 MariaDB')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('检查是否有对应数据库的全部权限')}</li>
        <li>{_l('确保数据库可以与数据集成通信')}</li>
      </ul>

      <h5>{_l('给用户赋权')}</h5>
      <div className="sqlText">
        <div>GRANT SELECT, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO '{_l('用户名')}' ;</div>
      </div>

      <h5>{_l('如果是已有用户，可以通过以下命令查询权限')}</h5>
      <div className="sqlText">
        <div>SHOW GRANTS FOR {_l("'用户名'@'主机'")} ;</div>
      </div>
      <p>{_l('如果权限不足，可以按照上方赋权重新增加对应权限')}</p>

      <h5>{_l('测试连接')}</h5>
      <p>
        {_l(
          '测试连接创建数据源时，检查数据库服务器的连通性、账户密码等正确性、数据库是否可用、以及检查是否可以作为源或者目的地。只有数据源通过全部测试才能够正常使用数据源。',
        )}
      </p>
    </div>
  );
}
