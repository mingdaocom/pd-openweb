import React from 'react';

const Section = props => {
  const { children } = props;
  return <div className="customFieldsContainer">{children}</div>;
};

export default Section;
