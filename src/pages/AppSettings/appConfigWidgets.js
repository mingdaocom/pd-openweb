import AllOptionList from './components/AllOptionList';
import EditpublishSet from './components/EditpublishSet';
import AppItemTrash from 'src/pages/worksheet/common/Trash/AppItemTrash';
import LockAppCom from './components/LockApp';
import ManageBackupFiles from './components/appBackupRestore/ManageBackupFiles';
import ExportAppCom from './components/ExportAppCom';
import AppGlobalVariable from './components/AppGlobalVariable';
import ImportUpgrade from './components/ImportUpgrade';

export default {
  options: AllOptionList,
  publish: EditpublishSet,
  recyclebin: AppItemTrash,
  lock: LockAppCom,
  backup: ManageBackupFiles,
  export: ExportAppCom,
  variables: AppGlobalVariable,
  upgrade: ImportUpgrade,
};
