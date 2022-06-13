import json

new = {}
file = open("./symbols.txt")
lines = file.readlines()

for line in lines:
    line = line.split()
    symbol = line[0]
    new.update({symbol: [x for x in line if x != symbol]})

print(new)
