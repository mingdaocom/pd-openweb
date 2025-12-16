import React, { useState } from 'react';
import addFriends from 'src/components/addFriends';
import { QUICK_ENTRY_CONFIG } from '../config';
import InstallDialog from './InstallDialog';

// 租住管理首页-快捷入口
export default function QuickEntrance(props) {
  const { projectId } = props;
  const [installType, setType] = useState('');

  const handleActionClick = action => {
    switch (action) {
      case 'addPerson':
        addFriends({
          projectId: projectId,
          fromType: 4,
        });
        break;
      case 'createDepartment':
        location.assign(`/admin/structure/${projectId}/create`);
        break;
      case 'batchImport':
        location.assign(`/admin/structure/${projectId}/importusers`);
        break;
      case 'settingAdmin':
        location.assign(`/admin/sysroles/${projectId}`);
        break;
      case 'completeInfo':
        location.assign(`/admin/sysinfo/${projectId}`);
        break;
      case 'installDesktop':
        setType('desktop');
        break;
      case 'installApp':
        setType('app');
        break;
    }
  };

  return (
    <div className="quickEntry">
      <div className="title bold">{_l('快捷入口')}</div>
      <div className="content">
        <ul>
          {QUICK_ENTRY_CONFIG.map(({ icon, color, title, explain, action }) => (
            <li key={action} onClick={() => handleActionClick(action)}>
              <div className="wrap">
                <div className="iconWrap" style={{ backgroundColor: color }}>
                  <i className={`icon-${icon}`} />
                </div>
                <div className="text">
                  <div className="entryTitle Font14 Bold">{title}</div>
                  <div className="explain">{explain}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <InstallDialog type={installType} projectId={projectId} onClose={() => setType('')} />
    </div>
  );
}
