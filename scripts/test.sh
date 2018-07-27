#!/bin/bash
cd /test
PORT=3001 NODE_ENV=test TEST_PATH=$1 npx nodemon global.js --watch /src --watch /test 
