#!/bin/bash

#Wizard
echo "Is Node.js installed?"
NODE=input

# Install Dependencies
sudo apt update -y
sudo apt install -y build-essential libssl-dev
sudo apt install -y ngrep ettercap-text-only tshark


# Setup Database
sudo apt install -y mariadb-client mariadb-server
echo "Initializing MYSQL Secure installation: "
sleep 2s
mysql_secure_installation
mysqladmin -uroot -p create sheep
echo "GRANT ALL PRIVILEGES ON sheep.* TO 'sheep'@'localhost' IDENTIFIED BY 'sheep';" | mysql -uroot -p


# Install Node
if [[ NODE = false ]]; then
        curl https://raw.githubusercontent.com/creationix/nvm/v0.16.1/install.sh | sh
        source ~/.profile
        VERSION=nvm ls-remote | tail -n 1 | awk '{$1=$1;print substr($1,2)}'
        nvm install $VERSION
        nvm alias default $VERSION
        nvm use default
fi

npm install .
npm install mysql
