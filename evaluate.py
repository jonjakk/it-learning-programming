
def evaluate(code, maze):
    #Here is where you will evaluate the code and return the results
    #start and end always have to be at the top left and bottom right --> Please check whether its top and top right
    namespace = {'maze': maze, 'start': start, 'end': end}
    exec(code, {}, namespace)
    result = namespace["result"]
    
    #TODO Call to OpenAI to get the feedback and score
    score = 100
    feedback = "Nice work!"
    return result, score, feedback