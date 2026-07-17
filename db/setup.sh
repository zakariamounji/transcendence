#!/bin/bash
set -e

mysqld_safe --datadir='/var/lib/mysql' &

while ! mariadb-admin ping --silent; do
    sleep 1
done

echo "Database is ready. Running configuration queries..."

mariadb -u root -p"1234" <<EOF

CREATE DATABASE IF NOT EXISTS freelancer;

CREATE USER IF NOT EXISTS 'exporter'@'%' IDENTIFIED BY '1234';
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'%';
FLUSH PRIVILEGES;



CREATE USER IF NOT EXISTS 'zakaria'@'%' IDENTIFIED BY '1234';
        

GRANT ALL PRIVILEGES ON freelancer.* TO 'zakaria'@'%';

FLUSH PRIVILEGES;
USE freelancer;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email varchar(255) NOT NULL,
    password varchar(255) NOT NULL
);
INSERT IGNORE INTO users (id, email, password) VALUES 
(1, 'user@gmail.com', '1234567'),
(2, 'zakaria@gmail.com', '1234567');

EOF

mariadb-admin -u root shutdown


exec mysqld_safe

