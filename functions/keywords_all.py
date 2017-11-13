import nltk

lemmatizer = nltk.WordNetLemmatizer()
stemmer = nltk.stem.porter.PorterStemmer()

from nltk.corpus import stopwords
stopwords = stopwords.words('english')

def normalise(word):
    """Normalises words to lowercase and stems and lemmatizes it."""
    word = word.lower()
    word = stemmer.stem(word)
    word = lemmatizer.lemmatize(word)
    return word

def acceptable_word(word):
    """Checks conditions for acceptable word: length, stopword."""
    accepted = bool(2 <= len(word) <= 40
        and word.lower() not in stopwords)
    return accepted


def get_terms(toks):
    ans = set()
    for word,tag in toks:
        if acceptable_word(word):
            ans.add( normalise(word) )
    return ans

def keywords(txt):
    toks = nltk.word_tokenize(txt)
    postoks = nltk.tag.pos_tag(toks)
    terms = get_terms(postoks)
    return set(terms)
