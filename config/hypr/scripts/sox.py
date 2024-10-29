"""
sox.py Sox converter.

@history
 2024-10-24 wangxq Created.

Copyright (c) 2024~ wangxq.
"""

import os
import re
import subprocess
import sys

CONVERTER = {
    "r8000c1i16": {
        "suffix": "_r8000_c1_i16",
        "param": {
            "gopts": "",
            "ifopts": "",
            "ofopts": "-r 8000 -c 1 -e signed-integer -b 16",
        },
        "ext_type": ("wav", "pcm", "raw"),
    },
    "r8000c2i16": {
        "suffix": "_r8000_c2_i16",
        "param": {
            "gopts": "",
            "ifopts": "",
            "ofopts": "-r 8000 -c 2 -e signed-integer -b 16",
        },
        "ext_type": ("wav", "pcm", "raw"),
    },
    "r16000c1i16": {
        "suffix": "_r16000_c1_i16",
        "param": {
            "gopts": "",
            "ifopts": "",
            "ofopts": "-r 16000 -c 1 -e signed-integer -b 16",
        },
        "ext_type": ("wav", "pcm", "raw"),
    },
    "r16000c2i16": {
        "suffix": "_r16000_c2_i16",
        "param": {
            "gopts": "",
            "ifopts": "",
            "ofopts": "-r 16000 -c 2 -e signed-integer -b 16",
        },
        "ext_type": ("wav", "pcm", "raw"),
    },
    "r44100c1i16": {
        "suffix": "_r44100_c1_i16",
        "param": {
            "gopts": "",
            "ifopts": "",
            "ofopts": "-r 44100 -c 1 -e signed-integer -b 16",
        },
        "ext_type": ("wav", "pcm", "raw"),
    },
    "r44100c2i16": {
        "suffix": "_r44100_c2_i16",
        "param": {
            "gopts": "",
            "ifopts": "",
            "ofopts": "-r 44100 -c 2 -e signed-integer -b 16",
        },
        "ext_type": ("wav", "pcm", "raw"),
    },
    "r48000c1i16": {
        "suffix": "_r48000_c1_i16",
        "param": {
            "gopts": "",
            "ifopts": "",
            "ofopts": "-r 48000 -c 1 -e signed-integer -b 16",
        },
        "ext_type": ("wav", "pcm", "raw"),
    },
    "r48000c2i16": {
        "suffix": "_r48000_c2_i16",
        "param": {
            "gopts": "",
            "ifopts": "",
            "ofopts": "-r 48000 -c 2 -e signed-integer -b 16",
        },
        "ext_type": ("wav", "pcm", "raw"),
    },
    "raw": {
        "suffix": "",
        "param": {"gopts": "--magic", "ifopts": "", "ofopts": "-t raw"},
        "ext_type": ["wav"],
    },
}


def get_file_ext(file):
    parts = file.split(".")
    if len(parts) < 2:
        return None
    ext = str.lower(parts[-1])
    return ext


def find_uri_not_in_use(new_uri):
    i = 1
    while os.path.isfile(new_uri):
        new_uri = new_uri.split(".")
        new_uri[-2] = new_uri[-2] + "_" + str(i)
        new_uri = ".".join(new_uri)
        i = i + 1
    return new_uri


def change_uri(old_path, suffix, new_extension):
    if suffix:
        old_path = re.sub(
            r"[_][r][0-9]{4,5}[_][c][0-9][_][i,u][0-9]{1,2}", "", old_path
        )  # "_r8000_c1_i16" [_r]^\d{4,5}[_c]^\d{1}^[a-z]{1}^\d{1,2}
    split_ver = old_path.split(".")
    split_ver[-2] = f"{split_ver[-2]}{suffix}"
    split_ver[-1] = new_extension
    return ".".join(split_ver)


# class Converter(object):
#     def __init__(self):
#         pass


def convert(convert_type, file):
    converter = CONVERTER[convert_type]

    in_ext_type = get_file_ext(file)

    if in_ext_type not in ["raw", "pcm", "wav"]:
        return

    if convert_type in ["raw", "pcm"] and in_ext_type in ["raw", "pcm"]:
        return

    if convert_type == "raw":
        out_ext_type = "raw"
    else:
        out_ext_type = "wav"

    if in_ext_type == "raw" or in_ext_type == "pcm":
        gopts = ""
        ifopts = f"{converter['param']['ofopts']} -t raw"
        ofopts = ""
    else:
        gopts = converter["param"]["gopts"]
        ifopts = converter["param"]["ifopts"]
        ofopts = converter["param"]["ofopts"]

    suffix = converter["suffix"]

    out_uri = find_uri_not_in_use(change_uri(file, suffix, out_ext_type))

    process = subprocess.Popen(
        f"exec sox {gopts} {ifopts} '{file}' {ofopts} '{out_uri}'", shell=True
    )

    process.wait()


def main():
    args = sys.argv
    for file in args[2:]:
        convert(args[1], file)


if __name__ == "__main__":
    main()
