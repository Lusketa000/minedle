#!/bin/bash
set -e

VERSION="1.8.2"
ARCH="linux-amd64"

cd /tmp

curl -fsSLO "https://github.com/prometheus/node_exporter/releases/download/v${VERSION}/node_exporter-${VERSION}.${ARCH}.tar.gz"

tar -xzf "node_exporter-${VERSION}.${ARCH}.tar.gz"

install "node_exporter-${VERSION}.${ARCH}/node_exporter" /usr/local/bin/node_exporter

id -u node_exporter >/dev/null 2>&1 || 
    useradd --no-create-home --shell /usr/sbin/nologin node_exporter

cp /vagrant/scripts/systemd/node-exporter.service /etc/systemd/system/node-exporter.service

systemctl daemon-reload
systemctl enable --now node-exporter

rm -rf "/tmp/node_exporter-${VERSION}.${ARCH}"*
