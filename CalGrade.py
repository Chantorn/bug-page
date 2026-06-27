def calculate_grade(score):
    if score >= 80:
        return 'A'
    elif score >= 70:
        return 'B'
    elif score >= 60:
        return 'C'
    elif score >= 50:
        return 'D'
    else:
        return 'F'

def main():
    try:
        score = float(input('Input Score: ').strip())
    except ValueError:
        print('Invalid input. Please enter a number.')
        return

    if score < 0 or score > 100:
        print('Score must be between 0 and 100.')
        return

    print(f'Grade {calculate_grade(score)}')

if __name__ == '__main__':
    main()
