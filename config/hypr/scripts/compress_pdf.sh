#!/bin/bash
for f in "$@"; do
    gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook \
       -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${f%.pdf}_compressed.pdf" "$f"
done
