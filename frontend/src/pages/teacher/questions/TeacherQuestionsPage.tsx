
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authenticatedFetch } from "../../../services/api";
import "./TeacherQuestionsPage.css";

type Exam = {
  id: number;
  name: string;
};

type Question = {
  id: number;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  score: string | number;
  correct_answer: string;
  exam: number | Exam;
};

type ListResponse<T> = T[] | { results: T[] };

function getItems<T>(data: ListResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

const answerOptions = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
  { value: "4", label: "Option 4" },
];

export default function TeacherQuestionsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examId, setExamId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [score, setScore] = useState("1");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("1");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [examData, questionData] = await Promise.all([
          authenticatedFetch<ListResponse<Exam>>("/core/exam/"),
          authenticatedFetch<ListResponse<Question>>("/core/question/"),
        ]);

        const examList = getItems(examData);
        setExams(examList);
        setQuestions(getItems(questionData));

        if (examList.length > 0) {
          setExamId(String(examList[0].id));
        }
      } catch {
        setError("Could not load exams and questions.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  async function handleCreateQuestion(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const text = questionText.trim();
    const filledOptions = options.map((option) => option.trim());
    const numericScore = Number(score);

    if (!examId || !text || creating) {
      return;
    }

    if (filledOptions.some((option) => !option)) {
      setError("Please fill in all four options.");
      return;
    }

    if (!Number.isFinite(numericScore) || numericScore <= 0) {
      setError("Score must be greater than zero.");
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const question = await authenticatedFetch<Question>(
        "/core/question/",
        {
          method: "POST",
          body: JSON.stringify({
            exam: Number(examId),
            question: text,
            option_1: filledOptions[0],
            option_2: filledOptions[1],
            option_3: filledOptions[2],
            option_4: filledOptions[3],
            score: numericScore,
            correct_answer: Number(correctAnswer),
          }),
        },
      );

      setQuestions((current) => [...current, question]);
      setQuestionText("");
      setScore("1");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("1");
      setSuccess("Question created successfully.");
    } catch (err) {
      console.error("Create question error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not create the question.",
      );
    } finally {
      setCreating(false);
    }
  }

  function getExamName(exam: number | Exam) {
    if (typeof exam === "object") {
      return exam.name;
    }

    return exams.find((item) => item.id === exam)?.name ?? "Exam";
  }

  return (
    <section className="teacher-questions-page">
      <div className="teacher-questions-heading">
        <div>
          <h2>Questions</h2>
          <p>Create and manage questions for your exams.</p>
        </div>

        <Link to="/teacher/dashboard" className="teacher-questions-back">
          Back to Dashboard
        </Link>
      </div>

      <section className="teacher-questions-panel">
        <h3>Create a Question</h3>

        <form
          className="teacher-question-form"
          onSubmit={handleCreateQuestion}
        >
          <label className="teacher-question-field">
            <span>Exam</span>
            <select
              value={examId}
              onChange={(event) => setExamId(event.target.value)}
              required
            >
              {exams.length === 0 && (
                <option value="">No exams available</option>
              )}

              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </label>

          <label className="teacher-question-field">
            <span>Question</span>
            <textarea
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              placeholder="Enter the question..."
              rows={3}
              required
            />
          </label>

          <label className="teacher-question-field">
            <span>Score</span>
            <input
              type="number"
              min="0.01"
              step="any"
              value={score}
              onChange={(event) => setScore(event.target.value)}
              required
            />
          </label>

          <div className="teacher-question-options">
            <h4>Answer Options</h4>

            {options.map((option, index) => (
              <label className="teacher-question-field" key={index}>
                <span>Option {index + 1}</span>
                <input
                  type="text"
                  value={option}
                  onChange={(event) => {
                    setOptions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item,
                      ),
                    );
                  }}
                  placeholder={`Enter option ${index + 1}`}
                  required
                />
              </label>
            ))}
          </div>

          <label className="teacher-question-field">
            <span>Correct Answer</span>
            <select
              value={correctAnswer}
              onChange={(event) => setCorrectAnswer(event.target.value)}
            >
              {answerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p className="teacher-question-message error">{error}</p>
          )}

          {success && (
            <p className="teacher-question-message success">{success}</p>
          )}

          <button type="submit" disabled={creating || exams.length === 0}>
            {creating ? "Creating..." : "Create Question"}
          </button>
        </form>
      </section>

      <section className="teacher-questions-panel">
        <div className="teacher-questions-list-heading">
          <h3>Your Questions</h3>
          <span>{questions.length} questions</span>
        </div>

        {loading ? (
          <p className="teacher-questions-empty">Loading questions...</p>
        ) : questions.length === 0 ? (
          <p className="teacher-questions-empty">
            No questions found. Create your first question above.
          </p>
        ) : (
          <div className="teacher-question-list">
            {questions.map((question) => (
              <article className="teacher-question-card" key={question.id}>
                <div className="teacher-question-card-heading">
                  <h4>{question.question}</h4>
                  <span>{question.score} points</span>
                </div>

                <p className="teacher-question-exam">
                  Exam: {getExamName(question.exam)}
                </p>

                <p className="teacher-question-correct">
                  Correct answer:{" "}
                  {answerOptions.find(
                    (option) => option.value === question.correct_answer,
                  )?.label ?? question.correct_answer}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
