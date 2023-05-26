import React from 'react';
import './index.less';

export default function SqlServerGuide(props) {
  const { type } = props;
  return type === 'source' ? (
    <div className="guideContent">
      <p>{_l('你可以把 SQL Server 数据库的数据通过系统实时同步到工作表或者其它数据目的地。')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>
          {_l('支持 SQL Server 的版本')}
          <li>2012, 2014, 2016, 2017, 2019</li>
        </li>
        <li>{_l('在 SQL Server 数据库上启用CDC')}</li>
        <li>{_l('SQL Server代理任务是启动状态')}</li>
        <li>{_l('当前账号是数据库db_owner固定角色的成员')}</li>
        <li>{_l('将系统 IP 添加到 SQL Server 服务器的访问白名单')}</li>
      </ul>

      <h5>{_l('检查 SQL Server 版本')}</h5>
      <div className="sqlText">
        <div>{_l('在 SQL Server 的菜单中找到"帮助-版本"，点击查看对应版本信息。')}</div>
      </div>

      <h5>{_l('确保 SQL Server 代理任务是启动状态')}</h5>
      <div className="sqlText">
        <div>{_l('在 SQL Server Management Studio 里面左下角查看')}</div>
      </div>

      <h5>{_l('运行以下 SQL 语句以在表上启用 CDC')}</h5>
      <div className="sqlText">
        <div>USE MyDB</div>
        <div>GO</div>
        <div>EXEC sys.sp_cdc_enable_table</div>
        <div>@source_schema = N'dbo', -- Specifies the schema of the source table.</div>
        <div>@source_name = N'MyTable', -- Specifies the name of the table that you want to capture.</div>
        <div>
          @role_name = N'MyRole', -- Specifies a role MyRole to which you can add users to whom you want to grant SELECT
          permission on the captured columns of the source table. Users in the sysadmin or db_owner role also have
          access to the specified change tables. Set the value of @role_name to NULL, to allow only members in the
          sysadmin or db_owner to have full access to captured information.
        </div>
        <div>
          @filegroup_name = N'MyDB_CT',-- Specifies the filegroup where SQL Server places the change table for the
          captured table. The named filegroup must already exist. It is best not to locate change tables in the same
          filegroup that you use for source tables.
        </div>
        <div>@supports_net_changes = 0</div>
        <div>GO</div>
      </div>

      <h5>{_l('验证用户是否有权访问 CDC 表')}</h5>
      <div className="sqlText">
        <div>
          --The following example runs the stored procedure sys.sp_cdc_help_change_data_capture on the database MyDB:
        </div>
        <div>USE MyDB;</div>
        <div>GO</div>
        <div>EXEC sys.sp_cdc_help_change_data_capture</div>
        <div>GO</div>
      </div>
      <p>
        {_l(
          '查询返回数据库中为CDC启用并包含调用者有权访问的更改数据的数据库中每个表的配置信息。如果结果为空，请验证用户是否有权同时访问捕获实例和CDC表。',
        )}
      </p>

      <h5>{_l('测试连接')}</h5>
      <p>
        {_l(
          '创建数据源时，检查数据库服务器的连通性、账户密码等正确性、数据库是否可用、以及检查是否可以作为源或者目的地。只有数据源通过全部测试才能够正常使用数据源。',
        )}
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

      <h5>{_l('常见问题')}</h5>
      <div>{_l('创建连接过程出现SSL验证报错，可尝试在 其他连接串参数 增加如下配置')}</div>
      <div className="sqlText">
        <div>encrypt=false</div>
      </div>
    </div>
  ) : (
    <div className="guideContent">
      <p>{_l('你可以将其它数据源的数据实时同步到 SQL Server')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('当前账号是数据库db_owner固定角色的成员')}</li>
        <li>{_l('将系统 IP 添加到 SQL Server 服务器的访问白名单 ')}</li>
      </ul>

      <h5>{_l('检查 SQL Server 版本')}</h5>
      <div className="sqlText">
        <div>{_l('在 SQL Server 的菜单中找到"帮助-版本"，点击查看对应版本信息。')}</div>
      </div>

      <h5>{_l('授予用户查询,插入,更新,删除表权限')}</h5>
      <div className="sqlText">
        <div>GRANT SELECT,INSERT,UPDATE,DELETE ON [TableName] to [DatabaseUserName]</div>
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
