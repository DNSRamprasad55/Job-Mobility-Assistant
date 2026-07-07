def add(a, b):
    return a + b

if __name__ == "__main__":
    num1 = int(input("Enter first integer: "))
    num2 = int(input("Enter second integer: "))
    result = add(num1, num2)
    print(f"The sum of {num1} and {num2} is {result}")
