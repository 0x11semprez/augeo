#!/usr/bin/env python3
"""Dump the readable structure of a devis workbook.

Usage:
    python3 dump_xlsx.py <file.xlsx> [first_row]

Prints the sheet dimension, the full merge list, then one line per row from
`first_row` on: row height, and every non-empty cell as `REF[sNN]='text'`
with shared strings resolved.

Remember the offset: in a *generated* devis every template row N sits at
row N+1, because GenerateXLSX inserts a row at the top for the mentions
banner.
"""

import re
import sys
import zipfile


def shared_strings(zf):
    try:
        data = zf.read("xl/sharedStrings.xml").decode("utf8")
    except KeyError:
        return []
    return [
        "".join(re.findall(r"<t[^>]*>(.*?)</t>", si, re.S))
        for si in re.findall(r"<si>(.*?)</si>", data, re.S)
    ]


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    path = sys.argv[1]
    first_row = int(sys.argv[2]) if len(sys.argv) > 2 else 1

    with zipfile.ZipFile(path) as zf:
        strings = shared_strings(zf)
        sheets = sorted(n for n in zf.namelist() if n.startswith("xl/worksheets/sheet"))
        print("sheets:", sheets)
        data = zf.read(sheets[0]).decode("utf8")

    dimension = re.search(r"<dimension[^>]*/?>", data)
    print("DIM:", dimension.group(0) if dimension else "?")
    merges = re.search(r"<mergeCells.*?</mergeCells>", data, re.S)
    print("MERGES:", re.findall(r'ref="([^"]+)"', merges.group(0)) if merges else [])

    for row in re.finditer(r"<row([^>]*)>(.*?)</row>", data, re.S):
        attrs, body = row.group(1), row.group(2)
        number = int(re.search(r'r="(\d+)"', attrs).group(1))
        if number < first_row:
            continue
        height = re.search(r'ht="([^"]+)"', attrs)
        cells = []
        for cell in re.finditer(r"<c ([^>]*?)(/>|>(.*?)</c>)", body, re.S):
            cell_attrs, cell_body = cell.group(1), cell.group(3) or ""
            ref = re.search(r'r="([^"]+)"', cell_attrs).group(1)
            cell_type = re.search(r't="([^"]+)"', cell_attrs)
            value = re.search(r"<v>(.*?)</v>", cell_body, re.S)
            text = value.group(1) if value else ""
            if cell_type and cell_type.group(1) == "s" and text:
                text = strings[int(text)]
            if cell_type and cell_type.group(1) == "inlineStr":
                text = "".join(re.findall(r"<t[^>]*>(.*?)</t>", cell_body, re.S))
            style = re.search(r's="(\d+)"', cell_attrs)
            if text != "":
                cells.append(f"{ref}[s{style.group(1) if style else '-'}]={text!r}")
        print(f"row {number} ht={height.group(1) if height else '-'}", cells)


if __name__ == "__main__":
    main()
