#!/bin/bash

if [ $2 == "1" ]; then
	sudo ifconfig $1 down
	sudo iwconfig $1 mode monitor
	sudo ifconfig $1 up

	while :
	do
		for i in 1 2 3 4 5 6 7 8 9 10 11 12
		do
			sudo iwconfig $1 channel $i
			sleep 10
		done
	done

elif [ $2 == "2" ]; then
	sudo ifconfig $1 down
	sudo iwconfig $1 mode managed
	sudo ifconfig $1 up

fi
