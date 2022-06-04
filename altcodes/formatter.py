# Format data from altcode files (from websites)
from numpy import full


file = open("./letters.txt", "r")
lines = file.readlines()
print("[")
for line in lines:
    alt_code = []
    for i in line:
        if i.isdigit():
            alt_code.append(i)
    full_code = "".join(alt_code)

    print("'&#{};',".format(full_code))
print("]")
