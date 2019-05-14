#!/bin/bash

array_test=()
for iface in $(ifconfig | cut -d ' ' -f1| tr ':' '\n' | awk NF)
do
        #printf "$iface"
        array_test+=("$iface")
done
echo ${array_test[@]}
exit 0
