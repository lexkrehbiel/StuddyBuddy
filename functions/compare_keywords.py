import keywords_all
import sys

# returns percent agreement in sets
# DISCUSSION NEEDED:
    # is the best way to assess this
def compareSets(hypothesis, truth):
    common = set ( hypothesis & truth )
    both = set ( hypothesis | truth )
    return len(common)*1.0 / len(both)

# get the two sets as arguments
user_ans = sys.argv[1];
correct_ans = sys.argv[2];

# get the keywords in the user and correct response
user_keywords = keywords_all.keywords(user_ans)
correct_keywords = keywords_all.keywords(correct_ans)

# compare the two keyword sets
agreement = compareSets(user_keywords, correct_keywords)

# "return" agreement ratio (node.js will look for response on stdout)
print(agreement)
# sys.stdout.flush()
