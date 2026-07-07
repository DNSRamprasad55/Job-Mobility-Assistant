import os

def create_and_write():
    # 'w' mode opens for writing, creates file if it doesn't exist.
    # The 'with' statement ensures the file is automatically closed.
    with open('example.txt', 'w') as file:
        file.write("Hello, this is a file manipulation example in Python.\n")
        file.write("This line was added using the 'w' (write) mode.\n")
    print("File 'example.txt' created and written to.")

def append_to_file():
    # 'a' mode opens for appending, adding to the end without removing existing text.
    with open('example.txt', 'a') as file:
        file.write("This line was appended using the 'a' (append) mode.\n")
    print("Content appended to 'example.txt'.")

def read_from_file():
    # 'r' mode opens for reading. Default mode.
    try:
        with open('example.txt', 'r') as file:
            content = file.read()
            print("\n--- File Content ---")
            print(content)
            print("--------------------\n")
    except FileNotFoundError:
        print("File 'example.txt' does not exist.")

def read_line_by_line():
    # It's better to read line-by-line for large files to save memory.
    try:
        with open('example.txt', 'r') as file:
            print("--- Reading Line by Line ---")
            for index, line in enumerate(file, 1):
                # .strip() removes the trailing newline character
                print(f"Line {index}: {line.strip()}")
            print("----------------------------\n")
    except FileNotFoundError:
        print("File 'example.txt' does not exist.")

def delete_file():
    # os.remove() deletes the specified file path.
    if os.path.exists('example.txt'):
        os.remove('example.txt')
        print("File 'example.txt' has been deleted.")
    else:
        print("The file does not exist.")

if __name__ == "__main__":
    print("Starting Python File Manipulation Demo...\n")
    create_and_write()
    read_from_file()
    append_to_file()
    read_line_by_line()
    #delete_file()
