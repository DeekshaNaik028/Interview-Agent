import React from 'react';
import { MessageSquare } from 'lucide-react';
import './QuestionDisplay.css';

export const QuestionDisplay = ({ question, questionNumber, totalQuestions }) => {
  if (!question) {
    return (
      <div className="question-display-empty">
        <MessageSquare size={48} />
        <p>Loading question...</p>
      </div>
    );
  }

  return (
    <div className="question-display">
      <div className="question-header">
        <span className="question-number">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className={`question-badge question-badge-${question.difficulty}`}>
          {question.difficulty}
        </span>
      </div>
      <div className="question-content">
        <h2 className="question-text">{question.question_text}</h2>
      </div>
      <div className="question-footer">
        <span className="question-round">{question.round_type} Round</span>
      </div>
    </div>
  );
};
