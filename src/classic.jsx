import React from 'react';
import {createRoot} from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
import LegacyApp from './LegacyApp';
import './styles.css';
createRoot(document.getElementById('root')).render(<HashRouter><div style={{background:'#e3eddb',padding:10,textAlign:'center',fontSize:12,position:'relative',zIndex:50}}>Original English demo workspace · <a href="/">Return to AcreWise 2.0 ↗</a></div><LegacyApp/></HashRouter>);
