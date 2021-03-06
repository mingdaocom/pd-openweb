import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../redux/actions';
import { Icon, Dialog, Checkbox, LoadDiv } from 'ming-ui';

const Wrap = styled.div`
  textarea {
    padding: 12px 30px 12px 12px;
    resize: none;
    width: 432px;
    height: 360px;
    background: #ffffff;
    border: 1px solid #2196f3;
    border-radius: 5px;
  }
`;
function SearchTelsDialog(props) {
  const { portal = {}, show, setShow, setTelFilters, getList } = props;
  const [tels, setTels] = useState(portal.telFilters || '');
  const onChange = value => {
    setTels(value);
  };
  return (
    <Dialog
      className=""
      width="480"
      visible={show}
      title={<span className="Font17 Bold">{_l('批量搜索手机号')}</span>}
      okText={_l('确定')}
      onCancel={() => {
        setShow(false);
      }}
      onOk={() => {
        setTelFilters(tels);
        getList();
        setShow(false);
      }}
    >
      <Wrap>
        <p className="Gray_9e pAll0 mBottom10">{_l('通过手机号批量搜索用户，每个手机号占一行')}</p>
        <textarea onChange={e => onChange(e.target.value)} value={tels} />
      </Wrap>
    </Dialog>
  );
}
const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SearchTelsDialog);
