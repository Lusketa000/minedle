Vagrant.configure("2") do |config|
    config.vm.define "reverse-proxy" do |client|
        client.vm.box = "bento/ubuntu-26.04"
        client.vm.hostname = "reverse-proxy"
        client.vm.network "forwarded_port", guest: 80, host: 8080, host_ip: "0.0.0.0"
        client.vm.network "private_network", ip: "10.20.30.1", netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
        client.vm.provider "virtualbox" do |vb|
            vb.memory = "1024"
            vb.cpus = 1
            vb.name = "reverse-proxy"
            end
        client.vm.provision "shell", inline: <<-SHELL
            apt-get update
            apt-get install -y nginx

            cp /vagrant/vm1/nginx.conf \
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
        client.vm.box = "bento/ubuntu-26.04"
        client.vm.hostname = "frontend"
        client.vm.network "private_network", ip: "10.20.30.2", netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
        client.vm.provider "virtualbox" do |vb|
            vb.memory = "1024"
            vb.cpus = 1
            vb.name = "frontend"
            end
        client.vm.provision "shell", inline: <<-SHELL
            sudo apt-get -y update
            sudo apt-get install -y net-tools nginx

        SHELL
    end

    config.vm.define "backend" do |client|
        client.vm.box = "bento/ubuntu-26.04"
        client.vm.hostname = "backend"
        client.vm.network "private_network", ip: "10.20.30.3", netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
        client.vm.provider "virtualbox" do |vb|
            vb.memory = "1024"
            vb.cpus = 1
            vb.name = "backend"
            end
        client.vm.provision "shell", inline: <<-SHELL
            sudo apt-get -y update
            # instalar node e fastify

        SHELL
    end

    config.vm.define "database" do |client|
        client.vm.box = "bento/ubuntu-26.04"
        client.vm.hostname = "database"
        client.vm.network "private_network", ip: "10.20.30.4", netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
        client.vm.provider "virtualbox" do |vb|
            vb.memory = "1024"
            vb.cpus = 1
            vb.name = "database"
            end
        client.vm.provision "shell", inline: <<-SHELL
            sudo apt-get -y update
            # instalar mysql

        SHELL
    end
end