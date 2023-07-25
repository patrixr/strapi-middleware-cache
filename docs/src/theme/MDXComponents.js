/* eslint-env es6 */

import React from "react";
// Import the original mapper
import MDXComponents from "@theme-original/MDXComponents";
/** Import built-in Docusaurus components at the global level
 * so we don't have to re-import them in every file
 */
import DocCardList from "@theme/DocCardList";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

export default {
  ...MDXComponents,
  DocCardList,
  Tabs,
  TabItem,
};
