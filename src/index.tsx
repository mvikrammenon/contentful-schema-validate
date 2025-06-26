import React from 'react';
import { render } from 'react-dom';
import { SDKProvider } from '@contentful/react-apps-toolkit';

import BentoLayoutValidator from './components/BentoLayoutValidator';
import { GlobalStyles } from '@contentful/forma-36-react-components';

const root = document.getElementById('root');

if (root) {
  render(
    <SDKProvider>
      <GlobalStyles />
      <BentoLayoutValidator />
    </SDKProvider>,
    root
  );
}
