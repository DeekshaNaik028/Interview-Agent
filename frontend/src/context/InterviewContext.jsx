import React, { createContext, useContext, useState, useCallback } from 'react';
import { interviewService } from '@/api';

const InterviewContext = createContext(null);

export const InterviewProvider = ({ children }) => {
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);

  const loadInterview = useCallback(async (interviewId) => {
    const data = await interviewService.getInterview(interviewId);
    setInterview(data);
    return data;
  }, []);

  const startInterview = useCallback(async (interviewId) => {
    const question = await interviewService.startInterview(interviewId);
    setCurrentQuestion(question);
    setIsInterviewActive(true);
    return question;
  }, []);

  const submitAnswer = useCallback(async (answerData) => {
    const response = await interviewService.submitAnswer(answerData);
    
    setAnswers(prev => [...prev, answerData]);
    
    if (response.completed) {
      setIsInterviewActive(false);
      setCurrentQuestion(null);
    } else {
      setCurrentQuestion(response.next_question);
    }
    
    return response;
  }, []);

  const resetInterview = useCallback(() => {
    setInterview(null);
    setCurrentQuestion(null);
    setAnswers([]);
    setIsInterviewActive(false);
  }, []);

  return (
    <InterviewContext.Provider
      value={{
        interview,
        currentQuestion,
        answers,
        isInterviewActive,
        loadInterview,
        startInterview,
        submitAnswer,
        resetInterview,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterviewContext = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterviewContext must be used within InterviewProvider');
  }
  return context;
};