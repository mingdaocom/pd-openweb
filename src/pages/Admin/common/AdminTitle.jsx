import React from 'react';
import PropTypes from 'prop-types';

import DocumentTitle from 'react-document-title';
import Config from '../config';

function AdminTitle({ prefix }) {
  const title = Config.getTitle(prefix);
  return <DocumentTitle title={title} />;
}

AdminTitle.propTypes = {
  prefix: PropTypes.string,
};

AdminTitle.defaultProps = {
  prefix: '',
};

export default AdminTitle;
