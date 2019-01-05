#!/bin/bash
set -ev

if [ -z "$TRAVIS_TAG" ] 
then
	if [ "$TRAVIS_OS_NAME" == "osx" ] 
	then
		echo "PLATFORM: osx"
		npm run makeosx
	else
		echo "PLATFORM: linux"
		npm run make
		mkdir MyRPC_deb
		cd MyRPC_deb
		mkdir usr && mkdir DEBIAN
		cd usr && mkdir share && cd share
		mkdir applications && cd applications
		echo "[Desktop Entry]
Version=1.1
Name=MyRPC
Comment=Easily set your Discord status to anything!
Exec=/usr/share/myrpc/MyRPC
Path=/usr/share/myrpc/
Icon=/usr/share/myrpc/resources/app/src/assets/icons/512x512.png
Terminal=false
Type=Application
Categories=Utility;" > myrpc.desktop
		cd ../../../DEBIAN
		echo "Package: myrpc
Maintainer: Kyle Smith <kyleafmine [at] gmail.com>
Architecture: amd64
Version: 1.1
Description: Easily set your Discord status to anything!" > control
		cd ../..
		cp -r out/MyRPC-linux-x64 MyRPC_deb/usr/share/myrpc
		dpkg -b MyRPC_deb
		mv MyRPC_deb.deb MyRPC_x64.deb
	fi
fi