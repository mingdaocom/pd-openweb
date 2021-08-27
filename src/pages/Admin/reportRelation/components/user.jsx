import React from 'react';
import PropTypes from 'prop-types';

function User(props) {
  const { avatar, fullname, department, job, subordinates, clickHandler } = props;
  const _props = clickHandler ? {
    onClick: clickHandler,
  } : {};
  return (
    <div className='userItem' {..._props }>
      <img src={avatar} className='avatar' />
      <div className='info'>
        <div className='name'>{fullname}</div>
        <div className='department'>{department}</div>
        <div className='job'>{job}</div>
      </div>
      {subordinates && subordinates.length ?
        <div className='subordinateCount'>
          <span className='icon-charger Gray_a TxtMiddle Font14' />
          <span className='TxtMiddle Gray mLeft5'>{subordinates.length}</span>
        </div>
        : null}
    </div>
  );
}

User.propTypes = {
  avatar: PropTypes.string,
  fullname: PropTypes.string,
  department: PropTypes.string,
  job: PropTypes.string,
  subordinates: PropTypes.arrayOf(PropTypes.string),
  clickHandler: PropTypes.func,
};

export default User;
