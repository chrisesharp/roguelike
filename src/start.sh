#!/bin/bash

if [ "$ROLE" == "MONSTERS" ]
then
    node ./dist/start-monsters.js
else
    node ./dist/start-server.js
fi
