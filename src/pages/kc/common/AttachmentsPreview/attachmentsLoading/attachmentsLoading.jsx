import React from 'react';
import './attachmentsLoading.css';

class AttachmentsLoading extends React.Component {
  render() {
    return (
      <div className="attachmentsLoading">
        <div className="bounceWrap">
          <div className="bounce" />
          <div className="bounce" />
          <div className="bounce" />
          <div className="bounce" />
          <div className="bounce" />
          <div className="bounce" />
        </div>
      </div>
    );
  }
}

export default AttachmentsLoading;
