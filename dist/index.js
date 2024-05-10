"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.js
const app_1 = require("./app");
const port = process.env.PORT || 4000;
app_1.app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
