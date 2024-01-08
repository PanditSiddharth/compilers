#!/bin/bash

echo "Enter commands separated by spaces:"
read -r -a commands_input

troot="/home/troot"
output_file="output.txt"

for cmd in "${commands_input[@]}"; do
    # Check if the command exists in the troot/bin, troot/usr/bin, or troot/sbin
    if [[ -f "$troot/bin/$cmd" || -f "$troot/usr/bin/$cmd" || -f "$troot/sbin/$cmd" ]]; then
        echo "$cmd is already usable."
    else
        pathtobin=$(command -v "$cmd")
        if [[ -n "$pathtobin" ]]; then
            if [[ -e "/usr/bin/$cmd" ]]; then
                cp "$pathtobin" "$troot/usr/bin/$cmd"
                if [[ "$cmd" == "bash" && -e "/usr/bin/$cmd" ]]; then
                     cp "$pathtobin" "$troot/bin/$cmd"
                elif [[ "$cmd" == "sh" && -e "/usr/bin/$cmd" ]]; then
                     cp "$pathtobin" "$troot/bin/$cmd"
                elif [[ "$cmd" == "zsh" && -e "/usr/bin/$cmd" ]]; then
                     cp "$pathtobin" "$troot/bin/$cmd"
                elif [[ "$cmd" == "dash" && -e "/usr/bin/$cmd" ]]; then
                     cp "$pathtobin" "$troot/bin/$cmd"
                elif [[ "$cmd" == "rdash" && -e "/usr/bin/$cmd" ]]; then
                     cp "$pathtobin" "$troot/bin/$cmd"
                fi
            elif [[ -e "/bin/$cmd" ]]; then
                cp "$pathtobin" "$troot/bin/$cmd"
            elif [[ -e "/sbin/$cmd" ]]; then
                cp "$pathtobin" "$troot/sbin/$cmd"
            elif command -v "$cmd" &>/dev/null; then
                cp "$pathtobin" "$troot/$(command -v $cmd)"
            fi

            ldd_output=$(ldd "$pathtobin" 2>/dev/null)
            libMatches=$(echo "$ldd_output" | grep -oE '/lib[^ ]*')
            for line in $libMatches; do
                if [[ ! -e "$troot/lib/$(basename "$line")" ]]; then
                    cp "$line" "$troot/lib/"
                fi
            done

            > "$output_file"

            lib64Matches=$(echo "$ldd_output" | grep -oE '/lib64[^ ]*')
            for line in $lib64Matches; do
                if [[ ! -e "$troot/lib64/$(basename "$line")" ]]; then
                    cp "$line" "$troot/lib64/"
                fi
            done

            > "$output_file"
        else
            echo "$cmd not found."
        fi
    fi
done

