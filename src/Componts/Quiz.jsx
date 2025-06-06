import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";

const Quiz = () => {
  const { subject } = useParams();
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const fetchQuestions = async (level) => {
    setDifficulty(level);
    setLoading(true);
    setError("");
    setQuestions([]);
    setShowResult(false);
    setScore(0);

    try {
      const response = await axios.get("https://quizapi.io/api/v1/questions", {
        headers: {
          "X-Api-Key": "0hLHpPPtI2bxWOhZCjqSMCMjSeC6ZzevOA7nvpQj",
        },
        params: {
          category: subject,
          limit: 25,
          difficulty: level,
        },
      });

      if (!response.data || response.data.length === 0) {
        setError("No questions available for this category and level.");
      } else {
        const modified = response.data.map((q) => ({
          ...q,
          selectedAnswer: null,
        }));
        setQuestions(modified);
      }
    } catch (err) {
      setError("Failed to fetch questions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIndex, optionKey) => {
    if (showResult) return;
    const updated = [...questions];
    updated[qIndex].selectedAnswer = optionKey;
    setQuestions(updated);
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q) => {
      const selected = q.selectedAnswer;
      if (
        selected &&
        q.correct_answers &&
        q.correct_answers[`${selected}_correct`] === "true"
      ) {
        correct++;
      }
    });
    setScore(correct);
    setShowResult(true);
  };

  const allAnswered =
    questions.length > 0 && questions.every((q) => q.selectedAnswer !== null);
  const percentage = Math.round((score / questions.length) * 100);
  const stars = percentage >= 80 ? 3 : percentage >= 50 ? 2 : percentage >= 30 ? 1 : 0;

  const getCorrectAnswerKey = (question) => {
    const correct = Object.keys(question.correct_answers || {}).find(
      (key) => question.correct_answers[key] === "true"
    );
    return correct ? correct.replace("_correct", "") : "";
  };

  const getCorrectAnswerText = (question) => {
    const correctKey = getCorrectAnswerKey(question);
    return question.answers?.[correctKey] || "";
  };

  const handleFinish = () => {
    const result = {
      correct: score,
      total: questions.length,
      stars: stars,
    };
    navigate("/", { state: { lastResult: result } });
  };

  return (
    <div className="container">
      <button className="back-btn" onClick={() => navigate("/")}>← Back to Home</button>
      <h2>{subject} Quiz - {difficulty}</h2>

      {!difficulty && (
        <>
          <p>Select a level to begin:</p>
          <div className="level-buttons">
            <button className="easy-btn" onClick={() => fetchQuestions("Easy")}>Easy</button>
            <button className="medium-btn" onClick={() => fetchQuestions("Medium")}>Medium</button>
            <button className="hard-btn" onClick={() => fetchQuestions("Hard")}>Hard</button>
          </div>
        </>
      )}

      {loading && <p className="loading">Loading questions...</p>}
      {error && <p className="error-msg">{error}</p>}

      {difficulty && !showResult && questions.length > 0 && (
        <div className="question-list">
          {questions.map((q, idx) => (
            <div className="question-card" key={q.id || idx}>
              <h4>Q{idx + 1}. {q.question}</h4>
              <ul className="option-list">
                {Object.entries(q.answers || {}).map(([key, answer]) =>
                  answer ? (
                    <li
                      key={key}
                      className={`option ${q.selectedAnswer === key ? "selected" : ""}`}
                      onClick={() => handleSelect(idx, key)}
                    >
                      {answer}
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          ))}
          {allAnswered && (
            <button className="btn submit-btn" onClick={handleSubmit}>Submit Quiz</button>
          )}
        </div>
      )}

      {showResult && (
        <div className="result-section">
          <div className="score-summary">
            <h3>Quiz Results</h3>
            <p>✅ Correct: {score}</p>
            <p>❌ Wrong: {questions.length - score}</p>
          </div>

          <div className="question-review">
            <h3>Question Review</h3>
            <div className="legend">
              <p><span className="correct-legend">Green</span> = Correct answer</p>
              <p><span className="wrong-legend">Red</span> = Your wrong answer</p>
              <p><span className="actual-correct-legend">Yellow</span> = Correct answer (when you were wrong)</p>
            </div>

            {questions.map((q, idx) => {
              const selected = q.selectedAnswer;
              const isCorrect = selected && q.correct_answers?.[`${selected}_correct`] === "true";
              const correctKey = getCorrectAnswerKey(q);

              return (
                <div
                  className={`review-question-card ${isCorrect ? "correct-question" : "wrong-question"}`}
                  key={q.id || idx}
                >
                  <h4>Q{idx + 1}. {q.question}</h4>
                  <ul className="option-list">
                    {Object.entries(q.answers || {}).map(([key, answer]) =>
                      answer ? (
                        <li
                          key={key}
                          className={`option ${
                            isCorrect && selected === key
                              ? "correct-answer"
                              : !isCorrect && selected === key
                              ? "wrong-answer"
                              : key === correctKey
                              ? "actual-correct"
                              : ""
                          }`}
                        >
                          {answer}
                          {key === correctKey && !isCorrect && (
                            <span className="correct-tag"> (Correct Answer)</span>
                          )}
                        </li>
                      ) : null
                    )}
                  </ul>
                </div>
              );
            })}
          </div>

          <button className="btn home-btn" onClick={handleFinish}>Finish & Go Home</button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
