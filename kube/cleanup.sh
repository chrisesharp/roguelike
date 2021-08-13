#/bin/bash

# Helm install various components of Kaverns & Kubernetes using environment variables to determine the deployed domain name

echo "Removing cavern-service configmap"
oc delete -f caves-configmap.yaml
echo "Uninstalling monsters"
helm uninstall monsters
echo "Uninstalling cavern-service"
helm uninstall cavern-service
echo "Uninstalling entrance"
helm uninstall entrance 
echo "Uninstalling cave1"
helm uninstall cave1 
echo "Uninstalling cave2"
helm uninstall cave2
echo "Finished"