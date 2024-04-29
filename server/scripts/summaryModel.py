import sys

def model(title, description):
    # Do analysis of the title and description
    # Find the summary of the complaint
    return "Summary:"

if __name__ == '__main__':
    args = sys.argv[1:]
    
    title = args[0]
    description = args[1]

    result = model(title, description)

    print(result)