import PropTypes from 'prop-types';
import { VERSION_STATUS } from './constants';
import { CHANGE_STATUS } from './contrast/constants';

const versionChangePropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  sourceId: PropTypes.string,
  name: PropTypes.string.isRequired,
  action: PropTypes.oneOf(Object.values(CHANGE_STATUS)).isRequired,
});

const accountPropType = PropTypes.shape({
  accountId: PropTypes.string,
  fullname: PropTypes.string,
  fullName: PropTypes.string,
});

const versionPropType = PropTypes.shape({
  id: PropTypes.string,
  versionId: PropTypes.string,
  version: PropTypes.string,
  versionNo: PropTypes.string,
  minimumVersion: PropTypes.string,
  contrastId: PropTypes.string,
  status: PropTypes.oneOf(Object.values(VERSION_STATUS)),
  description: PropTypes.string,
  creator: accountPropType,
  createTime: PropTypes.string,
  reviewer: accountPropType,
  reviewTime: PropTypes.string,
  remark: PropTypes.string,
  app: PropTypes.shape({
    appId: PropTypes.string,
    appName: PropTypes.string,
    name: PropTypes.string,
    iconUrl: PropTypes.string,
    avatar: PropTypes.string,
    iconColor: PropTypes.string,
    color: PropTypes.string,
    icon: PropTypes.string,
  }),
  changes: PropTypes.objectOf(PropTypes.arrayOf(versionChangePropType)),
});

export default versionPropType;
