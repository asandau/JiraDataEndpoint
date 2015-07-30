#!/bin/bash

npm install

export SERVERPATH=$(pwd)
sed "s=SERVERPLACEHOLDER=$SERVERPATH=g" jiradataendpoint.tmp > jiradataendpoint

cp jiradataendpoint /etc/init.d/jiradataendpoint
chmod 777 /etc/init.d/jiradataendpoint

service jiradataendpoint start