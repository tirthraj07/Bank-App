import sys
import random

def model(title, description):
    # Do analysis here
    # Call the model here
    return random.randint(0,99);


if __name__ == "__main__":
    args = sys.argv[1:]

    # Take the arguments from command line
    title = args[0]
    description = args[1]

    # Call the model
    result = model(title, description)
    
    # Print the result
    print(result)

