with open("./test_symbols.txt") as file:
    df = file.readlines()
    for line in df:
        line = line.split()
        print(line)
        symbol = line[0]
        line.pop[0]
        for i in range(len(line)):
            print(i)
            print(line[i])
