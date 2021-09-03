#/bin/bash

# Helm install various components of Kaverns & Kubernetes using environment variables to determine the deployed domain name

export SVC_NAME=${SERVICENAME:-"caverns"}
export CAVE_1="cave1"
export CAVE_2="cave2"

echo "Using ${SVC_NAME} as name for caverns service"

echo "Installing cavern-service"
helm upgrade kandk cavern_server/ --install --set domain=${DOMAIN} --set caveid="entrance/" --set servicename=${SVC_NAME}

echo "Installing cave1"
helm upgrade cave1 default_cave/ --install --set caveid="${CAVE_1}" --set server="http://${CAVE_1}:3000"

echo "Installing cave2"
helm upgrade cave2 default_cave/ --install --set caveid="${CAVE_2}" --set server="http://${CAVE_2}:3000"

echo "Finished"