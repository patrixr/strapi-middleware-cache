/*
 *
 * HomePage
 *
 */

import React, { memo } from 'react';
import PurgeCacheButton from '../../components/PurgeCacheButton';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';

function HomePage() {
  return (
    <div>
      <h1>{pluginId}&apos;s HomePage</h1>
      <p>Happy coding</p>
      <PurgeCacheButton />
    </div>
  );
}

export default memo(HomePage);
