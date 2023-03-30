import React from 'react';
import './index.less';

export default function MariaDBGuide(props) {
  const { type } = props;
  return type === 'source' ? (
    <div className="guideContent">
      <p>{_l('你可以把 MariaDB 数据库的数据通过系统实时同步到工作表或者其它数据目的地。')}</p>

      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>
          {_l('支持MariaDB的版本')}
          <li>{_l('10.3及以上')}</li>
        </li>
        <li>{_l('需要开启Binlog')}</li>
        <li>{_l('将系统 IP 添加到 MariaDB 服务器的访问白名单 ')}</li>
        <li>{_l('授权MariaDB账户对应的权限')}</li>
        <li>{_l('将系统 IP 添加到 MariaDB 服务器的访问白名单 ')}</li>
      </ul>

      <h5>{_l('检查MariaDB版本')}</h5>
      <div className="sqlText">
        <div>{`MariaDB > status`}</div>
      </div>

      <h5>{_l('检查Binlog是否开启')}</h5>
      <div className="sqlText">
        <div>{`MariaDB> select @@log_bin;`}</div>
      </div>
      <p>
        {_l(
          '如果该语句返回值为1，说明BinLog是激活的。如果返回值为0，这意味着BinLog被禁用。要启用它，请遵循下面的步骤。',
        )}
      </p>

      <h5>{_l('开启Binlog')}</h5>
      <div>1. {_l('登陆到MariaDB服务器')}</div>
      <div>2. {_l('编辑MariaDB服务器的配置文件')}</div>
      <div className="sqlText">
        <div>sudo nano /etc/mysql/my.cnf</div>
      </div>
      <div>3. {_l('在配置文件中检查是否符合以下内容，不符合的需要修改')}</div>
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
      <div>4. {_l('保存文件或者退出')}</div>
      <div className="sqlText">
        <div>{_l('保存所做的修改，按下Ctrl+O。')}</div>
        <div>{_l('退出，按下Ctrl+X。')}</div>
      </div>
      <div>5. {_l('重启MariaDB服务器')}</div>
      <div className="sqlText">
        <div>systemctl restart mariadb</div>
      </div>
      <div>6. {_l('重启后，再次登陆到MariaDB服务器，检查Binlog状态')}</div>
      <div className="sqlText">
        <div>{`MariaDB> select @@log_bin;`}</div>
      </div>

      <h5>{_l('授权MariaDB账户对应的权限')}</h5>
      <div>1. {_l('对于某个数据库赋于select权限')}</div>
      <div className="sqlText">
        <div>
          {`GRANT SELECT, SHOW VIEW, CREATE ROUTINE, LOCK TABLES ON <DATABASE_NAME>.<TABLE_NAME> TO 'user' IDENTIFIED BY 'password';`}
        </div>
      </div>
      <div>2. {_l('或者给予全局权限')}</div>
      <div className="sqlText">
        <div>
          GRANT RELOAD, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'user' IDENTIFIED BY 'password';
        </div>
      </div>

      <h5>{_l('将系统 IP 添加到了 MariaDB 服务器的访问白名单')}</h5>
      <div>1. {_l('编辑MariaDB服务器的配置文件')}</div>
      <div className="sqlText">
        <div>sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf</div>
      </div>
      <div>2. {_l('找到 [mysqld] 部分，添加下方语句')}</div>
      <div className="sqlText">
        <div>bind-address = 0.0.0.0</div>
      </div>
      <div>3. {_l('保存所做的修改')}</div>
      <div className="sqlText">
        <div>{_l('按下Ctrl+O')}</div>
      </div>

      <h5>{_l('测试连接')}</h5>
      <p>
        {_l(
          '创建数据源时，检查数据库服务器的连通性、账户密码等正确性、数据库是否可用、以及检查是否可以作为源或者目的地。只有数据源通过全部测试才能够正常使用数据源。',
        )}
      </p>
    </div>
  ) : (
    <div className="guideContent">
      <p>{_l('你可以将其它数据源的数据实时同步到 MariaDB')}</p>

      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('检查是否有对应数据库的全部权限')}</li>
        <li>{_l('将系统 IP 添加到 MariaDB 服务器的访问白名单 ')}</li>
      </ul>

      <h5>{_l('授权MariaDB账户对应的权限')}</h5>
      <div>1. {_l('对于某个数据库赋于全部权限')}</div>
      <div className="sqlText">
        <div>
          {`GRANT SELECT, SHOW VIEW, CREATE ROUTINE, LOCK TABLES ON <DATABASE_NAME>.<TABLE_NAME> TO 'user' IDENTIFIED BY 'password';`}
        </div>
      </div>
      <div>2. {_l('或者可以赋予全局权限')}</div>
      <div className="sqlText">
        <div>
          GRANT RELOAD, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'user' IDENTIFIED BY 'password';
        </div>
      </div>

      <h5>{_l('将系统 IP 添加到了 MariaDB 服务器的访问白名单')}</h5>
      <div>1. {_l('编辑MariaDB服务器的配置文件')}</div>
      <div className="sqlText">
        <div>sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf</div>
      </div>
      <div>2. {_l('找到 [mysqld] 部分，添加下方语句')}</div>
      <div className="sqlText">
        <div>bind-address = 0.0.0.0</div>
      </div>
      <div>3. {_l('保存所做的修改')}</div>
      <div className="sqlText">
        <div>{_l('按下Ctrl+O')}</div>
      </div>

      <h5>{_l('测试连接')}</h5>
      <p>
        {_l(
          '创建数据源时，检查数据库服务器的连通性、账户密码等正确性、数据库是否可用、以及检查是否可以作为源或者目的地。只有数据源通过全部测试才能够正常使用数据源。',
        )}
      </p>
    </div>
  );
}
