import React, { useState } from 'react';
import axiosInstance from '../utils/axios';

const REPORT_REASONS = [
  "Inappropriate content",
  "Harassment or bullying",
  "Spam or misleading",
  "Hate speech",
  "False information",
  "Intellectual property violation",
  "Other"
];

function ReportModal({ isOpen, onClose, postId, onSuccess }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError('Please select a reason for reporting');
      return;
    }

    if (!user || !user.id) {
      setError('You must be logged in to report a post');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const reportData = {
        postId,
        reporterId: user.id,
        reason: selectedReason,
        note: note.trim() || `Reported for ${selectedReason}`
      };

      await axiosInstance.post('/api/reports', reportData);
      
      setIsSubmitting(false);
      setStep(3); // Move to success step
      
      // Call the success callback after a delay
      setTimeout(() => {
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
        // Reset and close modal
        setTimeout(() => {
          resetModal();
          onClose();
        }, 500);
      }, 2000);
      
    } catch (error) {
      setIsSubmitting(false);
      
      // Handle error properly
      if (error.response && typeof error.response.data === 'string') {
        setError(error.response.data);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Failed to submit report. Please try again.');
      }
      
      console.error('Error submitting report:', error);
    }
  };

  const resetModal = () => {
    setSelectedReason('');
    setNote('');
    setError('');
    setStep(1);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl transform transition-all p-6 mx-4 md:mx-0">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === 1 && (
          <>
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Report Post</h3>
              <p className="text-gray-600 mt-1">Why are you reporting this post?</p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleReasonSelect(reason)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span>{reason}</span>
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-center mb-5">
              <button 
                onClick={() => setStep(1)}
                className="mr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-lg font-medium text-gray-900">
                Report for: <span className="text-red-600">{selectedReason}</span>
              </h3>
            </div>

            <div className="mb-5">
              <label htmlFor="note" className="block mb-2 text-sm font-medium text-gray-700">
                Additional Information (optional)
              </label>
              <textarea
                id="note"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="4"
                placeholder="Please provide additional details about your report..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="mr-3 px-4 py-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-5 py-2 rounded-lg text-white ${
                  isSubmitting
                    ? "bg-gray-400"
                    : "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                } transition-colors duration-200 font-medium focus:outline-none`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Report Submitted</h3>
            <p className="text-gray-600 mt-2 mb-6">Thank you for helping keep our community safe.</p>
            <button
              onClick={handleClose}
              className="px-5 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportModal;
