import sys
import random

def model(description):
    # Do analysis here
    return random.randint(0,99);


if __name__ == "__main__":
    args = sys.argv[1:]

    # Take the arguments from command line
    description = args[0];

    # Call the model
    result = model(description)
    
    # Print the result
    print(result)

