import React from 'react';
import { Switch, Route } from 'react-router-dom';
import styled from 'styled-components';
import Notification from './pages/Notification';
import SelectUser from './pages/SelectUser';
const Con = styled.div`
  background: #fff;
  min-height: 100%;
  display: flex;
  flex-direction: column;
`;

export default function Demo(props) {
  return (
    <Con>
      <Switch>
        <Route path="/demo/notification" component={Notification} />
        <Route path="/demo/selectuser" component={SelectUser} />
        <Route path="*" component={() => <span>hello</span>} />
      </Switch>
    </Con>
  );
}
