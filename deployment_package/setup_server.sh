#!/bin/bash
set -e

echo "Updating package index..."
sudo apt-get update

echo "Installing Docker..."
sudo apt-get install -y docker.io

echo "Starting Docker..."
sudo systemctl start docker
sudo systemctl enable docker

echo "Adding user to docker group..."
sudo usermod -aG docker ubuntu

echo "Installing Docker Compose..."
# Check if docker-compose exists
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.6/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

echo "Verifying installation..."
docker --version
docker-compose --version

echo "Server setup complete! Please log out and back in for group changes to take effect."
