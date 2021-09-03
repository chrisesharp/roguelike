#/bin/bash

# Helm install various components of Kaverns & Kubernetes using environment variables to determine the deployed domain name

echo "Uninstalling cave1"
helm uninstall cave1 
echo "Uninstalling cave2"
helm uninstall cave2
echo "Uninstalling kandk"
helm uninstall kandk
echo "Finished" 