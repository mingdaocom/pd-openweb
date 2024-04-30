import AllOptionList from './components/AllOptionList';
import EditpublishSet from './components/EditpublishSet';
import AppItemTrash from 'src/pages/worksheet/common/Trash/AppItemTrash';
import LockAppCom from './components/LockApp';
import ManageBackupFiles from './components/appBackupRestore/ManageBackupFiles';
import ExportAppCom from './components/ExportAppCom';
import AppGlobalVariable from './components/AppGlobalVariable';
import ImportUpgrade from './components/ImportUpgrade';
import MultiLingual from './components/MultiLingual';
import Aggregation from './components/Aggregation';
import EntityRelationship from './components/EntityRelationship';

export default {
  options: AllOptionList,
  publish: EditpublishSet,
  recyclebin: AppItemTrash,
  lock: LockAppCom,
  backup: ManageBackupFiles,
  export: ExportAppCom,
  variables: AppGlobalVariable,
  upgrade: ImportUpgrade,
  language: MultiLingual,
  aggregation: Aggregation,
  relationship: EntityRelationship,
};
