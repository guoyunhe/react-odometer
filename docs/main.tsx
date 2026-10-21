import React from 'react';
import { createRoot } from 'react-dom/client';

import { Docs } from './Docs';

import './style.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Docs />
  </React.StrictMode>,
);
