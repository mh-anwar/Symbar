symbols = {}


class Trie:
    def __init__(self):
        self.root = {"*": "*"}

    def add_word(self, word):
        curr_node = self.root  # points to the beginning *
        for letter in word:
            if letter not in curr_node:
                curr_node[letter] = {}
            curr_node = curr_node[letter]  # this points to the "previous letter"
        curr_node["*"] = "*"  # after looping through the whole word, add the symbol

    def return_trie(self):
        return self.root


t = Trie()
t.add_word("test")
print(t.return_trie())
"""
with open("./symbol.txt") as file:
    df = file.readlines()
    for line in df:
        line = line.split()
        print(line)
        symbol = line[0]
        line.pop(0)
        for i in range(len(line)):
            print(line[i], len(line[i]))
            for y in range(len(line[i])):
                print(y)
                letter = line[i][y]
                print(y + 1 < len(line[i]))
                if y > 0:
                    symbols.get
                elif y + 1 < len(line[i]):
                    symbols.update({letter: {}})

                    symbols.update({line[i][y - 1]: {letter: {}}})
                else:
                    symbols.update({letter: symbol}) 
print(symbols)
"""
