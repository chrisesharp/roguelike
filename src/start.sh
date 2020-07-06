#!/bin/bash

if [ "$ROLE" == "MONSTERS" ]
then
    node ./src/start-monsters.js
else
    node ./src/start-server.js
fi