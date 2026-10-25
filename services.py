from decimal import Decimal
from core.models import ExamAttempt


def calculate_score(attempt: ExamAttempt):
    total_score = Decimal('0.00')

    for answer in attempt.answers.select_related('question'):
        if answer.answer == answer.question.correct_answer:
            total_score += answer.question.score

    attempt.total_score = total_score
    attempt.active = False
    attempt.save()

    return total_score