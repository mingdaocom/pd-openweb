import React from 'react';
import ReactDom from 'react-dom';
import '../main.css';
import UploadAssistant from '../common/UploadAssistant';

$('html').addClass('APP-react');

const app = <UploadAssistant />;
ReactDom.render(app, document.getElementById('container'));
