import React from 'react';
import { Switch, Route } from 'react-router-dom';
import styled from 'styled-components';
import SingleView from './pages/SingleViewDemo';
import Share from './pages/Share';
import Qr from './pages/Qr';
import SliderDemo from './pages/SliderDemo';
import Trash from './pages/Trash';
import Playground from './pages/Playground';

const Con = styled.div`
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export default function Demo(props) {
  return (
    <Con>
      <Switch>
        <Route path="/demo/singleview" component={SingleView} />
        <Route path="/demo/share" component={Share} />
        <Route path="/demo/qr" component={Qr} />
        <Route path="/demo/slider" component={SliderDemo} />
        <Route path="/demo/trash" component={Trash} />
        <Route path="/demo/play" component={Playground} />
        <Route path="*" component={() => <span>hello</span>} />
      </Switch>
    </Con>
  );
}
