# Website
This repository contains the code for my website, [jort.dev](https://jort.dev).  
I was inspired by the design of [jschr.io](https://jschr.io/).

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


## Server setup
This section describes various parts of how to set up the server the site is hosted on.

### Auto-mount disks
* Identify the disks with `lsblk`.  
* With `ntfs-3g` installed, [label](https://wiki.archlinux.org/title/Persistent_block_device_naming#by-label) the disks.  
* Edit the `/etc/fstab` file as seen [here](https://wiki.archlinux.org/title/Fstab#Usage). Use `auto` as type.  
* Test the fstab configuration by running `sudo mount -a`. The disks should now be mounted at the defined paths.  

### Setup plex
Follow the instructions on the [Arch Wiki](https://wiki.archlinux.org/title/Plex) and [here](https://gist.github.com/pjobson/3811b73740a3a09597511c18be845a6c).  
As mount point, I created the directory `/mount`, in which I created a folder `old_hdd`, to which I mounted the HDD.
On the HDD is a folder for plex: `plex`
I followed the permission instructions for the plex folder and all its parent folders: 
 * `/media`
 * `/media/old_hdd`
 * `/media/old_hdd/plex`


### Secure server
The server is constantly under attack, see:
```shell
journalctl -u sshd | grep Failed
```
To protect against attacks, we are going to use `fail2ban`.  
Below explaination is also found on the [wiki](https://wiki.archlinux.org/title/Fail2ban).  

To automatically ban IP addresses with suspicious behaviour:
```shell
sudo pacman -S fail2ban
sudo mkdir /etc/fail2ban
sudo vim /etc/fail2ban/jail.local
```
Enter the following configuration in the jail.local file:
```conf
[DEFAULT]
bantime = 1d

[sshd]
enabled = true
```
Start the banning service:
```shell
sudo systemctl enable --now fail2ban
```

The better solution against attacks is to only allow public and private key connections instead of passwords.


## Ideas
* project overview like https://flathub.org/


# Troubleshooting
## Can SSH in server, but server itself cannot access internet
### Symptoms
* Can SSH in server locally and remotely
* dhcpcd is running (systemctl list-unit-files)
* Can't ping google.com or install packages etc
* Can ping 8.8.8.8
* /etc/resolv.conf is empty or only contains comments
* Hostnames are correctly configures in /etc/hosts and /etc/hostname (they are the same)

### Solution
Because 8.8.8.8 is pingable, internet drivers are working.
When pinging google.com etc, a DNS server is used to determine the IP behind google.com.
Google.com cannot be accessed, so there must be something wrong with the DNS servers.

ChatGTP solution:  
Add `nameserver 8.8.8.8` to `/etc/resolv.conf`, and then run `sudo systemctl restart systemd-resolved`.

Old Solution:  
openresolv automatically copies an IP from /etc/dhcpcd.conf to /etc/resolv.conf.
/etc/resolv.conf was empty, so this did not happen.
For me, openresolv was somehow uninstalled, probably during a system update.
To fix: manually populate openresolv.
In /etc/dhcpcd.conf, the static domain_name_server=192.168.1.1
So in /etc/openresolv. I added: nameserver 192.168.1.1
This gets reset when dhcpcd is restarted, so I installed the openresolv package, which populates the file automatically.

## Nginx shows default page
This happens when Nginx is updated. To fix, do a force pull:
```shell
git fetch --all
git reset --hard origin/master
```






