Vagrant.configure("2") do |config|
    config.vm.boot_timeout = 600
    config.vm.define "reverse-proxy" do |client|
        client.vm.box = "ubuntu/focal64"
        client.vm.hostname = "reverse-proxy"
        client.vm.network "forwarded_port", guest: 80, host: 8080, host_ip: "0.0.0.0"
        client.vm.network "private_network", ip: "10.20.30.1", netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
        client.vm.provider "virtualbox" do |vb|
            #vb.customize ["modifyvm", :id, "--appendconfig", "nopti nospectre_v2 nospectre_v1 irqpoll"]
			#vb.customize ["storagectl", :id, "--name", "SATA Controller", "--hostiocache", "on"]
			vb.customize ["modifyvm", :id, "--ioapic", "on"]
			vb.customize ["modifyvm", :id, "--paravirt-provider", "hyperv"]
            vb.gui = true
            vb.memory = "1024"
            vb.cpus = 1
            vb.name = "reverse-proxy"
            end
        client.vm.provision "shell", inline: <<-SHELL
            apt-get update
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
        SHELL
    end

    config.vm.define "frontend" do |client|
        client.vm.box = "ubuntu/focal64"
        client.vm.hostname = "frontend"
        client.vm.network "private_network", ip: "10.20.30.2", netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
        client.vm.provider "virtualbox" do |vb|
            #vb.customize ["modifyvm", :id, "--appendconfig", "nopti nospectre_v2 nospectre_v1 irqpoll"]
			#vb.customize ["storagectl", :id, "--name", "SATA Controller", "--hostiocache", "on"]
			vb.customize ["modifyvm", :id, "--ioapic", "on"]
			vb.customize ["modifyvm", :id, "--paravirt-provider", "hyperv"]
            vb.gui = true
            vb.memory = "1024"
            vb.cpus = 1
            vb.name = "frontend"
            end
        client.vm.provision "shell", inline: <<-SHELL
            apt-get update
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
        SHELL
    end

    config.vm.define "backend" do |client|
        client.vm.box = "ubuntu/focal64"
        client.vm.hostname = "backend"
        client.vm.network "private_network", ip: "10.20.30.3", netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
        client.vm.provider "virtualbox" do |vb|
            #vb.customize ["modifyvm", :id, "--appendconfig", "nopti nospectre_v2 nospectre_v1 irqpoll"]
			#vb.customize ["storagectl", :id, "--name", "SATA Controller", "--hostiocache", "on"]
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

        SHELL
    end

    config.vm.define "database" do |client|
        client.vm.box = "ubuntu/focal64"
        client.vm.hostname = "database"
        client.vm.network "private_network", ip: "10.20.30.4", netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
        client.vm.provider "virtualbox" do |vb|
            #vb.customize ["modifyvm", :id, "--appendconfig", "nopti nospectre_v2 nospectre_v1 irqpoll"]
			#vb.customize ["storagectl", :id, "--name", "SATA Controller", "--hostiocache", "on"]
			vb.customize ["modifyvm", :id, "--ioapic", "on"]
			vb.customize ["modifyvm", :id, "--paravirt-provider", "hyperv"]
            vb.gui = true
            vb.memory = "1024"
            vb.cpus = 1
            vb.name = "database"
            end
        client.vm.provision "shell", inline: <<-SHELL
            apt-get -y update
            apt-get install -y net-tools mysql-server
            sed -i 's/127.0.0.1/0.0.0.0/g' /etc/mysql/mysql.conf.d/mysqld.cnf
            systemctl restart mysql

            if [ -f /vagrant/init.sql ]; then
                mysql < /vagrant/init.sql
                echo "Database carregado"
            else
                echo "sql não encontrado"
            fi

        SHELL
    end
end