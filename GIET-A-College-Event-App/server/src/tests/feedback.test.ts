import mongoose from 'mongoose';
import { submitFeedback, getEventFeedback } from '../controllers/feedbackController';
import Feedback from '../models/Feedback';

describe('Feedback Controller Tests', () => {
  it('should have submitFeedback method', () => {
    expect(typeof submitFeedback).toBe('function');
  });

  it('should have getEventFeedback method', () => {
    expect(typeof getEventFeedback).toBe('function');
  });
});
