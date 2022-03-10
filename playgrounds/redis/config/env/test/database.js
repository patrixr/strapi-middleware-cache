"use strict";

const { join } = require("path");

module.exports = () => ({
  connection: {
    client: "sqlite",
    connection: {
      filename: join(__dirname, "../../../", ".tmp/tests.db"),
    },
    useNullAsDefault: true,
  },
});
