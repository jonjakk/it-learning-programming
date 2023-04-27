
def evaluate(code, maze):
    #Here is where you will evaluate the code and return the results
    #start bottom right, end top left
    namespace = {'maze': maze, 'start': start, 'end': end}
    exec(code, {}, namespace)
    result = namespace["result"]
    
    #TODO Call to OpenAI to get the feedback and score
    score = 100
    feedback = "Nice work!"
    return result, score, feedback