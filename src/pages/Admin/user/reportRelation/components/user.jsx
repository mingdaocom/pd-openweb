import React from 'react';
import PropTypes from 'prop-types';

function User(props) {
  const { avatar, fullname, department, job, clickHandler, subTotalCount } = props;
  const _props = clickHandler
    ? {
        onClick: clickHandler,
      }
    : {};
  return (
    <div className="userItem" {..._props}>
      <img src={avatar} className="avatar" />
      <div className="info">
        <div className="name flexRow alignItemsCenter">
          <span className="ellipsis flex">{fullname}</span>
          {subTotalCount && subTotalCount > 0 && props.status !== 1 ? (
            <span className="resignedTag mRight16">{_l('已离职')}</span>
          ) : (
            ''
          )}
        </div>
        <div className="department">{department}</div>
        <div className="job">{job}</div>
      </div>
      {subTotalCount && subTotalCount > 0 ? (
        <div className="subordinateCount">
          <span className="icon-charger Gray_a TxtMiddle Font14" />
          <span className="TxtMiddle Gray mLeft5">{subTotalCount}</span>
        </div>
      ) : props.status !== 1 ? (
        <span className="resignedTag">{_l('已离职')}</span>
      ) : null}
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
