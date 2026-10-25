
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { authenticatedFetch } from "../../../services/api";
import "./StudentTakeExamPage.css";

type Question = {
  id: number;
  exam: number;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  score: string | number;
};

type SavedAnswer = {
  id: number;
  attempt: number;
  question: number;
  answer: number;
};

type ExamAttempt = {
  id: number;
  end_at: string;
  active: boolean;
  total_score: string | number;
};

type ListResponse<T> = T[] | { results: T[] };

type LocationState = {
  attemptId?: number;
  endAt?: string;
};

function getItems<T>(data: ListResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "detail" in error &&
    typeof error.detail === "string"
  ) {
    return error.detail;
  }

  return "Something went wrong. Please try again.";
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export default function StudentTakeExamPage() {
  const { examId: examIdParam } = useParams();
  const examId = Number(examIdParam);

  const location = useLocation();
  const navigate = useNavigate();

  const { attemptId, endAt } = (location.state ?? {}) as LocationState;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [savedAnswers, setSavedAnswers] = useState<
    Record<number, SavedAnswer>
  >({});

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingQuestionId, setSavingQuestionId] = useState<number | null>(
    null,
  );
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");
  const [finishError, setFinishError] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const finishingRef = useRef(false);
  const answersRef = useRef<Record<number, number>>({});

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!Number.isFinite(examId) || examId <= 0 || !attemptId || !endAt) {
      setError(
        "Exam session information is missing. Please open the exam from the exams page.",
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadExam() {
      try {
        const [questionData, answerData, attempt] = await Promise.all([
          authenticatedFetch<ListResponse<Question>>("/core/question/"),
          authenticatedFetch<ListResponse<SavedAnswer>>(
            "/core/exam/answers/",
          ),
          authenticatedFetch<ExamAttempt>(
            `/core/exam/attempt/${attemptId}/`,
          ),
        ]);

        if (cancelled) return;

        if (!attempt.active) {
          setResult(String(attempt.total_score));
          return;
        }

        const examQuestions = getItems(questionData).filter(
          (question) => question.exam === examId,
        );

        const existingAnswers = getItems(answerData).filter(
          (answer) => answer.attempt === attemptId,
        );

        const answerMap: Record<number, number> = {};
        const savedMap: Record<number, SavedAnswer> = {};

        for (const answer of existingAnswers) {
          answerMap[answer.question] = answer.answer;
          savedMap[answer.question] = answer;
        }

        setQuestions(examQuestions);
        setAnswers(answerMap);
        answersRef.current = answerMap;
        setSavedAnswers(savedMap);
        setRemainingSeconds(
          Math.max(
            0,
            Math.floor(
              (new Date(attempt.end_at).getTime() - Date.now()) / 1000,
            ),
          ),
        );
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadExam();

    return () => {
      cancelled = true;
    };
  }, [examId, attemptId, endAt]);

  const finishExam = useCallback(async () => {
    if (!attemptId || finishingRef.current || result !== null) return;

    finishingRef.current = true;
    setFinishing(true);
    setFinishError("");

    try {
      const currentAnswers = answersRef.current;
      const pendingQuestions = Object.entries(currentAnswers).filter(
        ([questionId, answer]) => {
          const saved = savedAnswers[Number(questionId)];
          return !saved || saved.answer !== answer;
        },
      );

      for (const [questionId, answer] of pendingQuestions) {
        const numericQuestionId = Number(questionId);
        const saved = savedAnswers[numericQuestionId];

        if (saved) {
          await authenticatedFetch<SavedAnswer>(
            `/core/exam/answers/${saved.id}/`,
            {
              method: "PATCH",
              body: JSON.stringify({ answer }),
            },
          );
        } else {
          const created = await authenticatedFetch<SavedAnswer>(
            "/core/exam/answers/",
            {
              method: "POST",
              body: JSON.stringify({
                attempt: attemptId,
                question: numericQuestionId,
                answer,
              }),
            },
          );

          setSavedAnswers((previous) => ({
            ...previous,
            [numericQuestionId]: created,
          }));
        }
      }

      const response = await authenticatedFetch<{
        detail: string;
        total_score: string;
      }>(`/core/exam/attempt/${attemptId}/finish_exam/`, {
        method: "POST",
      });

      setResult(response.total_score);
    } catch (err: unknown) {
      finishingRef.current = false;
      setFinishError(getErrorMessage(err));
    } finally {
      setFinishing(false);
    }
  }, [attemptId, result, savedAnswers]);

  useEffect(() => {
    if (loading || result !== null || !attemptId || !endAt) return;

    const updateTimer = () => {
      const seconds = Math.max(
        0,
        Math.floor((new Date(endAt).getTime() - Date.now()) / 1000),
      );

      setRemainingSeconds(seconds);

      if (seconds <= 0) {
        void finishExam();
      }
    };

    updateTimer();

    const intervalId = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(intervalId);
  }, [loading, result, attemptId, endAt, finishExam]);

  async function selectAnswer(questionId: number, answer: number) {
    if (finishing || result !== null || remainingSeconds <= 0) return;

    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));

    answersRef.current = {
      ...answersRef.current,
      [questionId]: answer,
    };

    setSavingQuestionId(questionId);
    setError("");

    try {
      const saved = savedAnswers[questionId];

      if (saved) {
        const updated = await authenticatedFetch<SavedAnswer>(
          `/core/exam/answers/${saved.id}/`,
          {
            method: "PATCH",
            body: JSON.stringify({ answer }),
          },
        );

        setSavedAnswers((previous) => ({
          ...previous,
          [questionId]: updated,
        }));
      } else {
        const created = await authenticatedFetch<SavedAnswer>(
          "/core/exam/answers/",
          {
            method: "POST",
            body: JSON.stringify({
              attempt: attemptId,
              question: questionId,
              answer,
            }),
          },
        );

        setSavedAnswers((previous) => ({
          ...previous,
          [questionId]: created,
        }));
      }
    } catch (err: unknown) {
      setError(
        `Could not save your answer: ${getErrorMessage(err)}`,
      );
    } finally {
      setSavingQuestionId(null);
    }
  }

  if (loading) {
    return (
      <main className="take-exam-page">
        <p className="take-exam-status">Loading exam...</p>
      </main>
    );
  }

  if (result !== null) {
    return (
      <main className="take-exam-page">
        <section className="take-exam-result">
          <h1>Exam Finished</h1>
          <p>Your exam has been submitted.</p>
          <div className="take-exam-score">
            <span>Your score</span>
            <strong>{result}</strong>
          </div>
          <button
            type="button"
            onClick={() => navigate("/student/results")}
          >
            View My Results
          </button>
        </section>
      </main>
    );
  }

  if (error && questions.length === 0) {
    return (
      <main className="take-exam-page">
        <section className="take-exam-status take-exam-error">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => navigate("/student/exams")}
          >
            Back to Exams
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="take-exam-page">
      <header className="take-exam-header">
        <div>
          <h1>Take Exam</h1>
          <p>Answer the questions before time runs out.</p>
        </div>

        <div className="take-exam-timer">
          <span>Time remaining</span>
          <strong>{formatTime(remainingSeconds)}</strong>
        </div>
      </header>

      {error && <p className="take-exam-message error">{error}</p>}

      {questions.length === 0 ? (
        <section className="take-exam-content">
          <p className="take-exam-status">
            No questions have been added to this exam yet.
          </p>
        </section>
      ) : (
        <section className="take-exam-content">
          <div className="take-exam-progress">
            <span>
              Answered {Object.keys(answers).length} of {questions.length}
            </span>
          </div>

          {questions.map((question, index) => {
            const options = [
              question.option_1,
              question.option_2,
              question.option_3,
              question.option_4,
            ];

            return (
              <article className="take-exam-question" key={question.id}>
                <h2>
                  {index + 1}. {question.question}
                </h2>

                <div className="take-exam-options">
                  {options.map((option, optionIndex) => {
                    const optionValue = optionIndex + 1;

                    return (
                      <label
                        className={`take-exam-option ${
                          answers[question.id] === optionValue
                            ? "selected"
                            : ""
                        }`}
                        key={optionValue}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={optionValue}
                          checked={answers[question.id] === optionValue}
                          disabled={finishing || remainingSeconds <= 0}
                          onChange={() =>
                            void selectAnswer(question.id, optionValue)
                          }
                        />
                        <span className="take-exam-option-number">
                          {optionValue}
                        </span>
                        <span>{option || "—"}</span>
                      </label>
                    );
                  })}
                </div>

                {savingQuestionId === question.id && (
                  <p className="take-exam-saving">Saving answer...</p>
                )}
              </article>
            );
          })}

          <footer className="take-exam-footer">
            <p>
              {Object.keys(answers).length < questions.length
                ? "Some questions are unanswered."
                : "All questions have been answered."}
            </p>

            {finishError && (
              <p className="take-exam-message error">{finishError}</p>
            )}

            <button
              type="button"
              onClick={() => void finishExam()}
              disabled={finishing}
            >
              {finishing ? "Submitting..." : "Finish Exam"}
            </button>
          </footer>
        </section>
      )}
    </main>
  );
}
