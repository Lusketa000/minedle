Vagrant.configure("2") do |config|
    config.vm.boot_timeout = 600
    config.vm.define "reverse-proxy" do |client|
        client.vm.box = "ubuntu/focal64"
        client.vm.hostname = "reverse-proxy"
        client.vm.network "forwarded_port", guest: 80, host: 80, host_ip: "0.0.0.0"
        client.vm.network "private_network", ip: "10.20.30.1", netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
        client.vm.provider "virtualbox" do |vb|
			vb.customize ["modifyvm", :id, "--ioapic", "on"]
			vb.customize ["modifyvm", :id, "--paravirt-provider", "hyperv"]
            vb.gui = true
            vb.memory = "1024"
            vb.cpus = 1
            vb.name = "reverse-proxy"
            end
        client.vm.provision "shell", inline: <<-SHELL
            apt-get update
            apt-get install -y curl
            apt-get install -y nginx

            cp /vagrant/reverse-proxy/nginx/nginx.conf \
            /etc/nginx/sites-available/site.conf

            chmod 644 /etc/nginx/sites-available/site.conf

            rm -f /etc/nginx/sites-enabled/default

            ln -sf /etc/nginx/sites-available/site.conf \
                /etc/nginx/sites-enabled/site.conf

            nginx -t
            systemctl enable nginx
            systemctl restart nginx

            bash /vagrant/scripts/install-node-exporter.sh
        SHELL
    end

    config.vm.define "frontend" do |client|
        client.vm.box = "ubuntu/focal64"
        client.vm.hostname = "frontend"
        client.vm.network "private_network", ip: "10.20.30.2", netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
        client.vm.provider "virtualbox" do |vb|
			vb.customize ["modifyvm", :id, "--ioapic", "on"]
			vb.customize ["modifyvm", :id, "--paravirt-provider", "hyperv"]
            vb.gui = true
            vb.memory = "1024"
            vb.cpus = 1
            vb.name = "frontend"
            end
        client.vm.provision "shell", inline: <<-SHELL
            apt-get update
            apt-get install -y curl
            apt-get install -y nginx

            # Frontend
            mkdir -p /var/www/frontend
            cp -r /vagrant/frontend/app/. /var/www/frontend/

            # Nginx
            cp /vagrant/frontend/nginx/nginx.conf \
            /etc/nginx/sites-available/site.conf

            chmod 644 /etc/nginx/sites-available/site.conf

            rm -f /etc/nginx/sites-enabled/default

            ln -sf /etc/nginx/sites-available/site.conf \
                /etc/nginx/sites-enabled/site.conf

            nginx -t
            systemctl enable nginx
            systemctl restart nginx

            bash /vagrant/scripts/install-node-exporter.sh
        SHELL
    end

    config.vm.define "backend" do |client|
        client.vm.box = "ubuntu/focal64"
        client.vm.hostname = "backend"
        client.vm.network "private_network", ip: "10.20.30.3", netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
        client.vm.provider "virtualbox" do |vb|
			vb.customize ["modifyvm", :id, "--ioapic", "on"]
			vb.customize ["modifyvm", :id, "--paravirt-provider", "hyperv"]
            vb.gui = true
            vb.memory = "1024"
            vb.cpus = 1
            vb.name = "backend"
            end
        client.vm.provision "shell", inline: <<-SHELL
            apt-get -y update
            apt-get install -y net-tools curl
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs

            # Backend
            mkdir -p /var/www/backend
            cp -r /vagrant/backend/. /var/www/backend/
            
            cd /var/www/backend
            npm install

            # Systemd
            cp /vagrant/backend/systemd/backend.service /etc/systemd/system/backend.service

            systemctl daemon-reload
            systemctl enable backend
            systemctl restart backend

            bash /vagrant/scripts/install-node-exporter.sh
        SHELL
    end

    config.vm.define "database" do |client|
        client.vm.box = "ubuntu/focal64"
        client.vm.hostname = "database"
        client.vm.network "private_network", ip: "10.20.30.4", netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
        client.vm.provider "virtualbox" do |vb|
			vb.customize ["modifyvm", :id, "--ioapic", "on"]
			vb.customize ["modifyvm", :id, "--paravirt-provider", "hyperv"]
            vb.gui = true
            vb.memory = "1024"
            vb.cpus = 1
            vb.name = "database"
            end
        client.vm.provision "shell", inline: <<-SHELL
            apt-get -y update
            apt-get install -y curl
            apt-get install -y net-tools mysql-server
            sed -i 's/127.0.0.1/0.0.0.0/g' /etc/mysql/mysql.conf.d/mysqld.cnf
            systemctl restart mysql

            if [ -f /vagrant/database/init.sql ]; then
                mysql < /vagrant/database/init.sql
                echo "Database carregado"
            else
                echo "sql não encontrado"
            fi

            bash /vagrant/scripts/install-node-exporter.sh
        SHELL
    end

    config.vm.define "prometheus" do |client|
        client.vm.box = "ubuntu/focal64"
        client.vm.hostname = "prometheus"

        client.vm.network "private_network",
            ip: "10.20.30.5",
            netmask: "255.255.255.0",
            virtualbox__intnet: "intnet1"

        # Acesso à interface pelo computador host
        client.vm.network "forwarded_port",
            guest: 9090,
            host: 9090,
            host_ip: "127.0.0.1"

        client.vm.provider "virtualbox" do |vb|
            vb.customize ["modifyvm", :id, "--ioapic", "on"]
            vb.customize ["modifyvm", :id, "--paravirt-provider", "hyperv"]
            vb.gui = true
            vb.memory = "1024"
            vb.cpus = 1
            vb.name = "prometheus"
        end

        client.vm.provision "shell", inline: <<-SHELL
            set -e

            apt-get update
            apt-get install -y curl tar

            # Usuário e diretórios
            id -u prometheus >/dev/null 2>&1 || useradd --no-create-home --shell /usr/sbin/nologin prometheus

            mkdir -p /etc/prometheus /var/lib/prometheus

            # Baixar o Prometheus
            VERSION="2.55.1"
            cd /tmp

            curl -fsSLO "https://github.com/prometheus/prometheus/releases/download/v${VERSION}/prometheus-${VERSION}.linux-amd64.tar.gz"

            tar -xzf "prometheus-${VERSION}.linux-amd64.tar.gz"

            cd "prometheus-${VERSION}.linux-amd64"

            install prometheus /usr/local/bin/prometheus
            install promtool /usr/local/bin/promtool

            # Copiar as configurações do Prometheus
            cp /vagrant/prometheus/prometheus.yml /etc/prometheus/prometheus.yml
            cp /vagrant/prometheus/alert_rules.yml /etc/prometheus/alert_rules.yml
            cp /vagrant/prometheus/recording_rules.yml /etc/prometheus/recording_rules.yml
            cp /vagrant/prometheus/systemd/prometheus.service /etc/systemd/system/prometheus.service

            # Permissões
            chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus

            # Validar a configuração e iniciar
            /usr/local/bin/promtool check config /etc/prometheus/prometheus.yml

            systemctl daemon-reload
            systemctl enable prometheus
            systemctl restart prometheus

            # Instalar Node Exporter também nesta VM
            bash /vagrant/scripts/install-node-exporter.sh
        SHELL
    end

    config.vm.define "grafana" do |grafana|
        grafana.vm.box = "ubuntu/focal64"
        grafana.vm.hostname = "grafana"

        grafana.vm.network "private_network",
            ip: "10.20.30.6",
            virtualbox__intnet: "intnet1"

        grafana.vm.network "forwarded_port",
            guest: 3000,
            host: 3000,
            host_ip: "127.0.0.1"

        grafana.vm.provider "virtualbox" do |vb|
            vb.name = "grafana"
            vb.memory = 1024
            vb.cpus = 1
            vb.gui = true
        end

        grafana.vm.provision "shell", inline: <<-SHELL
            apt-get update
            apt-get install -y apt-transport-https wget gpg

            mkdir -p /etc/apt/keyrings
            wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor --yes -o /etc/apt/keyrings/grafana.gpg

            echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" > /etc/apt/sources.list.d/grafana.list

            apt-get update
            apt-get install -y grafana

            systemctl enable grafana-server
            systemctl start grafana-server
        SHELL
    end
end