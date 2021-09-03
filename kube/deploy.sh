#/bin/bash

# Helm install various components of Kaverns & Kubernetes using environment variables to determine the deployed domain name

export SVC_NAME=${SERVICENAME:-"caverns"}

echo "Using ${SVC_NAME} as service name for caverns"

echo "Installing cavern-service"
helm upgrade kandk cavern_server/ --install --set domain=${DOMAIN} --set caveid="entrance/" --set servicename=${SVC_NAME}

echo "Installing cave1"
helm upgrade cave1 default_cave/ --install --set caveid="cave1/"

echo "Installing cave2"
helm upgrade cave2 default_cave/ --install --set caveid="cave2/"

echo "Installing monsters into cave 1"
helm upgrade monsters1 monsters/ --install --set server="http://cave1:3000"

echo "Installing monsters into cave 1"
helm upgrade monsters2 monsters/ --install --set server="http://cave2:3000"

echo "Finished"