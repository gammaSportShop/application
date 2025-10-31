#!/usr/bin/env bash
set -e
k3d node create agent --cluster shop
kubectl get nodes
