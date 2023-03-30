import React from 'react';
import './index.less';

export default function MongoDBGuide(props) {
  const { type } = props;
  return type === 'source' ? (
    <div className="guideContent">
      <p>{_l('你可以把 MongoDB 数据库的数据通过系统实时同步到工作表或者其它数据目的地。')}</p>

      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('MongoDB 版本 >= 3.6')}</li>
        <li>
          {_l('启用 Change Streams')}
          <li>{_l('Change Streams仅支持副本集和分片群集模式，且必须使用副本集协议版本1（pv1）')}</li>
          <li>
            {_l('更多条件参考：')}
            <a href="https://docs.mongoing.com/change-streams#fu-ben-ji-xie-yi-ban-ben" target="_blank">
              https://docs.mongoing.com/change-streams#fu-ben-ji-xie-yi-ban-ben
            </a>
          </li>
        </li>
        <li>{_l('将系统 IP 添加到 MongoDB 服务器的访问白名单')}</li>
      </ul>

      <h5>{_l('测试连接')}</h5>
      <p>
        {_l(
          '创建数据源时，检查数据库服务器的连通性、账户密码等正确性、数据库是否可用、以及检查是否可以作为源或者目的地。只有数据源通过全部测试才能够正常使用数据源。',
        )}
      </p>
    </div>
  ) : (
    <div className="guideContent">
      <p>{_l('你可以将其它数据源的数据实时同步到 MongoDB')}</p>

      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('具有数据库的写入权限')}</li>
        <li>{_l('将系统 IP 添加到 MongoDB 服务器的访问白名单')}</li>
      </ul>

      <h5>{_l('创建用户并且赋予写入数据库权限')}</h5>
      <div className="sqlText">
        <div>mongo</div>
        <div>use admin</div>
        <div>db.auth('root','root')</div>
        <div>use mall</div>
        <div>{`db.createUser({user:'root',pwd:'yourpassword',roles:[{role:'readWrite',db:'mall'}]})`}</div>
      </div>

      <div>{_l('权限规则')}</div>
      <div className="sqlText">
        <div>read：{_l('允许用户读取指定数据库;')}</div>
        <div>readWrite：{_l('允许用户读写指定数据库 ')}</div>
        <div>dbAdmin：{_l('允许用户在指定数据库中执行管理函数，如索引创建、删除，查看统计或访问system.profile;')}</div>
        <div>userAdmin：{_l('允许用户向system.users集合写入，可以找指定数据库里创建、删除和管理用户;')}</div>
        <div>clusterAdmin：{_l('只在admin数据库中可用，赋予用户所有分片和复制集相关函数的管理权限; ')}</div>
        <div>readAnyDatabase：{_l('只在admin数据库中可用，赋予用户所有数据库的读权限; ')}</div>
        <div>readWriteAnyDatabase：{_l('只在admin数据库中可用，赋予用户所有数据库的读写权限;')}</div>
        <div>userAdminAnyDatabase：{_l('只在admin数据库中可用，赋予用户所有数据库的userAdmin权限; ')}</div>
        <div>dbAdminAnyDatabase：{_l('只在admin数据库中可用，赋予用户所有数据库的dbAdmin权限; ')}</div>
        <div>root：{_l('只在admin数据库中可用。超级账号，超级权限。')}</div>
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
