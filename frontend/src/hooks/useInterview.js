import { useState, useCallback } from 'react';
import { interviewService } from '@/api';
import { toast } from 'react-toastify';

export const useInterview = () => {
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchInterview = useCallback(async (interviewId) => {
    try {
      setLoading(true);
      const data = await interviewService.getInterview(interviewId);
      setInterview(data);
      return data;
    } catch (error) {
      toast.error('Failed to fetch interview');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const startInterview = useCallback(async (interviewId) => {
    try {
      setLoading(true);
      const question = await interviewService.startInterview(interviewId);
      setCurrentQuestion(question);
      return question;
    } catch (error) {
      toast.error('Failed to start interview');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (answerData) => {
    try {
      setSubmitting(true);
      const response = await interviewService.submitAnswer(answerData);
      
      if (response.completed) {
        toast.success('Interview completed!');
        setCurrentQuestion(null);
      } else {
        setCurrentQuestion(response.next_question);
      }
      
      return response;
    } catch (error) {
      toast.error('Failed to submit answer');
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const fetchCurrentQuestion = useCallback(async (interviewId) => {
    try {
      const question = await interviewService.getCurrentQuestion(interviewId);
      setCurrentQuestion(question);
      return question;
    } catch (error) {
      console.error('Failed to fetch current question:', error);
      throw error;
    }
  }, []);

  return {
    interview,
    currentQuestion,
    loading,
    submitting,
    fetchInterview,
    startInterview,
    submitAnswer,
    fetchCurrentQuestion,
  };
};
