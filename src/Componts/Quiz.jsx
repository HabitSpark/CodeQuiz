import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";
import codingVideo from "../assets/coding.mp4"; // your background video

const Quiz = () => {
  const { subject } = useParams();
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [attempted, setAttempted] = useState([]);

  const fetchQuestions = async (level) => {
    setDifficulty(level);
    setLoading(true);
    setError("");
    setQuestions([]);
    setShowResult(false);
    setScore(0);
    setCurrentQIndex(0);
    setAttempted([]);
    setShowReview(false);

    try {
      const response = await axios.get("https://quizapi.io/api/v1/questions", {
        headers: {
          "X-Api-Key": "0hLHpPPtI2bxWOhZCjqSMCMjSeC6ZzevOA7nvpQj",
        },
        params: {
          category: subject,
          limit: 20,
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
        setAttempted(new Array(modified.length).fill(false));
      }
    } catch (err) {
      setError("Failed to fetch questions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!difficulty || showResult || currentQIndex >= questions.length) return;

    let seconds =
      difficulty.toLowerCase() === "easy"
        ? 45
        : difficulty.toLowerCase() === "medium"
        ? 30
        : 20;

    setTimeLeft(seconds);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setAttempted((prevAttempts) => {
            const newAttempts = [...prevAttempts];
            newAttempts[currentQIndex] = true;
            return newAttempts;
          });
          setTimeout(() => {
            setCurrentQIndex((prev) => prev + 1);
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQIndex, difficulty, showResult]);

  const handleSelect = (qIndex, optionKey) => {
    if (showResult || attempted[qIndex]) return;
    const updated = [...questions];
    updated[qIndex].selectedAnswer = optionKey;
    setQuestions(updated);

    setAttempted((prev) => {
      const newAttempts = [...prev];
      newAttempts[qIndex] = true;
      return newAttempts;
    });

    setTimeout(() => {
      setCurrentQIndex((prev) => prev + 1);
    }, 300);
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      const selected = q.selectedAnswer;
      if (
        attempted[i] &&
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
    questions.length > 0 && attempted.every((a) => a === true);
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
    <div className="quiz-app-container">
      {/* 🔹 Background Video */}
      <div className="background-media">
        <video autoPlay loop muted playsInline className="bg-video">
          <source src={codingVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="bg-overlay"></div>
      </div>

      {/* 🔹 Foreground Content */}
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

        {difficulty && !showResult && questions.length > 0 && currentQIndex < questions.length && (
          <div className="question-card current-question">
            <h4>Q{currentQIndex + 1}. {questions[currentQIndex]?.question}</h4>
            <p className="timer">⏱ Time Left: {timeLeft}s</p>
            <ul className="option-list">
              {Object.entries(questions[currentQIndex]?.answers || {}).map(
                ([key, answer]) =>
                  answer ? (
                    <li
                      key={key}
                      className={`option ${
                        questions[currentQIndex].selectedAnswer === key ? "selected" : ""
                      }`}
                      onClick={() => handleSelect(currentQIndex, key)}
                    >
                      {answer}
                    </li>
                  ) : null
              )}
            </ul>
          </div>
        )}

        {/* Show Submit Button after all questions */}
        {currentQIndex >= questions.length && !showResult && (
          <button className="btn submit-btn" onClick={handleSubmit}>View Results</button>
        )}

        {/* Show Summary Only */}
        {showResult && !showReview && (
          <div className="result-section">
            <div className="score-summary">
              <h3>Quiz Completed</h3>
              <p>✅ Correct: {score}</p>
              <p>❌ Wrong: {questions.length - score}</p>
              <button className="btn" onClick={() => setShowReview(true)}>View Detailed Review</button>
            </div>
          </div>
        )}

        {/* Show Detailed Review After Clicking "View Detailed Review" */}
        {showResult && showReview && (
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
    </div>
  );
};

export default Quiz;
