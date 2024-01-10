mkdir -p /home/troot/{bin,sbin,usr/bin,usr/{bin,include,local,lib/{gcc,python3.10,x86_64-linux-gnu}},lib,lib64,home/me,proc,home/usercmp,tmp/tsx-1003,mnt,temp,var,etc/ssl,dev,root}
cp /etc/resolv.conf /home/troot/etc/
mknod -m 666 /home/troot/dev/null c 1 3
cp ~/.bashrc /home/troot/home/usercmp 
cp -r ~/.nvm /home/troot/home/usercmp 
