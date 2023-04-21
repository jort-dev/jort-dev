# Website
This repository contains the code for my website, [jort.dev](https://jort.dev).  
I have copied the design of [jschr.io](https://jschr.io/).

## Setup
The setup instructions assume a fresh [Arch Linux](https://wiki.archlinux.org/) installation.

### Setup Nginx with site

Download [nginx](https://wiki.archlinux.org/title/Nginx):
```shell
sudo pacman -Syu nginx-mainline
```
Enable the service:
```shell
sudo systemctl enable --now nginx
```
A webpage is now live at [localhost](http://localhost).  
It is serving the HTML from the `/usr/share/nginx/html` folder.  
Nginx runs as the `http` user. 
Enable your user and the nginx user to edit the files within this folder:
```shell
sudo chown -R "$USER":http /usr/share/nginx/html
```
Clone this repository within the `/usr/share/nginx/html` folder:
```shell
git clone git@github.com:jort-dev/jort-dev.git /usr/share/nginx/html
```
Make a backup of the default Nginx configuration:
```shell
cp /etc/nginx/nginx.conf /etc/nginx/nginx_conf_backup
```
Update the Nginx configuration at `/etc/nginx/nginx.conf` to match the one from this repository: [conf/nginx.conf](conf/nginx.conf).  

Check the updated config file for errors:
```shell
sudo nginx -t
```
Restart the Nginx service:
```shell
sudo systemctl restart nginx
```

### Setup HTTPS
A domain ending with `.dev` requires HTTPS in the browser.  
Install [Certbot](https://wiki.archlinux.org/title/Certbot):
```shell
sudo pacman -S certbot certbot-nginx
```
Install certificates for all the `server_name` variables in the `server` blocks in the Nginx config:
```shell
sudo certbot --nginx
```
Enable [automatic certificate renewal](https://eff-certbot.readthedocs.io/en/stable/using.html#setting-up-automated-renewal):
```shell
SLEEPTIME=$(awk 'BEGIN{srand(); print int(rand()*(3600+1))}'); echo "0 0,12 * * * root sleep $SLEEPTIME && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null
```
Check the updated config file for errors:
```shell
sudo nginx -t
```
Restart the Nginx service:
```shell
sudo systemctl restart nginx
```







