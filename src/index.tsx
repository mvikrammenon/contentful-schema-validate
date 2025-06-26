import React from 'react';
import { render } from 'react-dom';
import { SDKProvider } from '@contentful/react-apps-toolkit';

import BentoLayoutValidator from './components/BentoLayoutValidator';
// GlobalStyles from f36-components is usually not needed when using SDKProvider,
// as SDKProvider or the host environment often takes care of base styling.
// If specific global styles are needed, they can be imported from @contentful/f36-components/GlobalStyles
// import { GlobalStyles } from '@contentful/f36-components';


const root = document.getElementById('root');

if (root) {
  render(
    <SDKProvider>
      {/* <GlobalStyles />  // Typically not needed with f36 and SDKProvider */}
      <BentoLayoutValidator />
    </SDKProvider>,
    root
  );
}
