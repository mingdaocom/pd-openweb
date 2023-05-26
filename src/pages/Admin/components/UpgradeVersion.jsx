import React from 'react';
import { buriedUpgradeVersionDialog } from 'src/util';

export default function UpgradeVersion(props) {
  const { projectId, featureId } = props;

  return buriedUpgradeVersionDialog(projectId, featureId, 'content');
}
