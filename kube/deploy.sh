#/bin/bash

# Helm install various components of Kaverns & Kubernetes using environment variables to determine the deployed domain name

echo "Creating cavern-service configmap"
oc apply -f caves-configmap.yaml
echo "Installing cavern-service"
helm upgrade cavern-service cavern_server/ --install
echo "Installing entrance"
helm upgrade entrance entrance/ --install --set domain=${DOMAIN}
echo "Installing cave1"
helm upgrade cave1 default_cave/ --install --set caveid="cave1/"
echo "Installing cave2"
helm upgrade cave2 default_cave/ --install --set caveid="cave1/"
echo "Installing monsters"
helm upgrade monsters monsters/ --install --set server="http://cave1:3000"
echo "Finished"