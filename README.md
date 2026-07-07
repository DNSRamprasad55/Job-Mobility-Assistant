# Python File Manipulation

This directory contains `file_manipulation.py`, a simple Python script that demonstrates the standard methods for interacting with files.

## Overview

File handling is an essential part of programming. Python has several built-in functions for creating, reading, updating, and deleting files. 

The primary utility used to interact with files is the `open()` function. It takes two primary parameters:
1. **Filename**: The name or path of the file.
2. **Mode**: How you want to interact with the file.

### Key File Modes

- `"r"` - **Read**: Default mode. Opens a file for reading. Returns an error if the file doesn't exist.
- `"a"` - **Append**: Opens a file for appending data to the end of the file. Creates the file if it does not exist.
- `"w"` - **Write**: Opens a file for writing. *Overwrites* any existing content in the file. Creates the file if it does not exist.
- `"x"` - **Create**: Creates a specified file. Returns an error if the file already exists.

## Running the Example

Navigate to this directory in your terminal and run the script using Python:

```bash
python file_manipulation.py
```

## What the Script Does

The `file_manipulation.py` script showcases real-world examples by executing the following operations in order:

1. **Creates and Writes**: Opens a temporary file (`example.txt`) in write mode (`'w'`) and adds starting text. The `with` statement is used to ensure the file is safely closed when done.
2. **Reads Entire File**: Re-opens `example.txt` in read mode (`'r'`) and prints its entire content to the console at once.
3. **Appends Data**: Opens the file in append mode (`'a'`) and adds a new line without overwriting the previous text.
4. **Reads Line by Line**: Re-opens the file to demonstrate iterating over a file line by line, which is extremely useful for processing large files efficiently.
5. **Deletes File**: Uses the built-in `os` module to safely delete `example.txt`, maintaining a clean workspace.
