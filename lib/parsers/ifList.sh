#!/bin/bash

array=()
final=()
for iface in $(ifconfig | cut -d ' ' -f1| tr ':' '\n' | awk NF)
do
        if [ $iface != "lo" ]
        then
          array+=("$iface")
        fi
done

for iface in ${array[@]}
do

  status="$(ethtool $iface 2>/dev/null | gawk 'match($0, /Link detected: (.*)$/, a) {print a[1]}')"
  if [ "$status" == "no" ]
  then
    ip='N/A'
  else
    ip="$(ip addr show $iface 2>/dev/null | awk 'match($0, /inet (.*).* brd (.*) scope.*$/, a) {print a[1] "-" a[2]}')"
  fi

  if [ "$status" == "no" ]
  then
    status='0'
  else
    status='1'
  fi

  wire="$(iwconfig $iface 2>/dev/null | awk 'match($0, /(IEEE 802.11)/, a) {print a[1]}')"
  if [ "$wire" == "IEEE 802.11" ]
  then
    wireless='1'
  else
    wireless='0'
  fi

  final+=("$iface:$status:$ip:$wireless")
done

echo ${final[@]}
exit 0
