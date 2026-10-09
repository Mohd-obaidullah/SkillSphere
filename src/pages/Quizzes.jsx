import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { profileAPI } from '../services/api';
import { Award, CheckCircle, XCircle, ArrowRight, PlayCircle, Code, Layers, PenTool } from 'lucide-react';

export default function Quizzes() {
  const { state, saveState, addNotification } = useAppContext();
  const quizzes = state.quizzes || [];
  
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResult(false);
    setScore(0);
  };

  const handleSelectOption = (optionIndex) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    let calculatedScore = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    setShowResult(true);

    const passingScore = activeQuiz.questions.length * 0.8; // 80% to pass

    if (calculatedScore >= passingScore) {
      const user = state.currentUser;
      if (!user.verifiedBadges?.includes(activeQuiz.badgeName)) {
        setIsSubmitting(true);
        try {
          const res = await profileAPI.addBadge({ badgeName: activeQuiz.badgeName });
          addNotification("New Badge Earned! 🏆", `You passed the ${activeQuiz.title} test!`, "badge");
          saveState({ ...state, currentUser: res.data });
        } catch (err) {
          console.error("Failed to add badge", err);
          alert(err.response?.data?.msg || 'Failed to award badge');
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setShowResult(false);
  };

  const renderIcon = (iconName) => {
    switch(iconName) {
      case 'code': return <Code className="text-[#C85A32] w-6 h-6" />;
      case 'layers': return <Layers className="text-[#6B46C1] w-6 h-6" />;
      case 'figma': return <PenTool className="text-[#E11D48] w-6 h-6" />;
      default: return <Award className="text-blue-500 w-6 h-6" />;
    }
  };

  return (
    <div className="animate-[fadeIn_0.35s_ease-out_forwards]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-heading text-3xl font-extrabold mb-1">Skill Tests & Badges</h2>
          <p className="text-gray-500 text-sm">Answer questions to prove your skills and earn verified badges.</p>
        </div>
      </div>

      {!activeQuiz ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(q => {
            const hasBadge = state.currentUser?.verifiedBadges?.includes(q.badgeName);
            return (
              <div key={q.id} className="glass-card flex flex-col justify-between group hover:-translate-y-1 transition-transform">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="tag bg-white border border-[rgba(210,200,185,0.5)] text-gray-700 shadow-sm">{q.category}</span>
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-[rgba(210,200,185,0.5)] flex items-center justify-center">
                      {renderIcon(q.icon)}
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2 leading-tight">{q.title}</h3>
                  
                  <div className="flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <Award size={16} className={hasBadge ? "text-[#C85A32]" : "text-gray-400"} />
                    <p className="text-sm text-gray-600 font-medium">Earn: <strong className={hasBadge ? "text-[#C85A32]" : ""}>{q.badgeName}</strong></p>
                  </div>
                  
                  <div className="flex gap-4 text-xs font-semibold text-gray-500 mb-6">
                    <span>{q.questionCount} Questions</span>
                    <span>•</span>
                    <span>{q.duration}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[rgba(210,200,185,0.5)]">
                  {hasBadge ? (
                    <button className="w-full py-2.5 rounded-xl bg-green-50 text-green-700 font-bold border border-green-200 flex items-center justify-center gap-2 cursor-default">
                      <CheckCircle size={18} />
                      Badge Earned
                    </button>
                  ) : (
                    <button className="w-full btn-primary py-2.5 flex items-center justify-center gap-2" onClick={() => startQuiz(q)}>
                      <PlayCircle size={18} />
                      Start Test
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : showResult ? (
        <div className="max-w-2xl mx-auto glass-card text-center animate-[slideUp_0.3s_ease-out]">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#C85A32] to-[#6B46C1] rounded-full flex items-center justify-center mb-6 shadow-xl">
            <Award className="text-white w-10 h-10" />
          </div>
          <h3 className="text-3xl font-extrabold mb-2">Test Complete</h3>
          <p className="text-gray-500 mb-8">{activeQuiz.title}</p>
          
          <div className="text-6xl font-black mb-4 bg-gradient-to-br from-[#C85A32] to-[#6B46C1] text-transparent bg-clip-text">
            {score} / {activeQuiz.questions.length}
          </div>
          
          {score >= activeQuiz.questions.length * 0.8 ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-8">
              <p className="font-bold text-lg mb-1">Congratulations! 🎉</p>
              <p className="text-sm">You passed the test and earned the <strong>{activeQuiz.badgeName}</strong> badge!</p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-8">
              <p className="font-bold text-lg mb-1">Keep trying!</p>
              <p className="text-sm">You need at least {Math.ceil(activeQuiz.questions.length * 0.8)} correct answers to pass and earn the badge.</p>
            </div>
          )}

          <div className="flex justify-center">
            <button className="btn-primary px-8 py-3" onClick={closeQuiz} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Back to Tests'}
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-xl">{activeQuiz.title}</h3>
              <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</p>
            </div>
            <button className="text-gray-400 hover:text-gray-800 transition-colors" onClick={closeQuiz}>Exit</button>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full mb-8 overflow-hidden">
            <div 
              className="h-full bg-[#C85A32] transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="glass-card mb-6 animate-[fadeIn_0.2s_ease-out]">
            <h4 className="text-lg font-semibold mb-6 leading-relaxed">
              {activeQuiz.questions[currentQuestionIndex].question}
            </h4>

            <div className="flex flex-col gap-3">
              {activeQuiz.questions[currentQuestionIndex].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${answers[currentQuestionIndex] === idx ? 'border-[#C85A32] bg-[#C85A32]/5 font-semibold' : 'border-[rgba(210,200,185,0.5)] bg-white/50 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[currentQuestionIndex] === idx ? 'border-[#C85A32]' : 'border-gray-300'}`}>
                      {answers[currentQuestionIndex] === idx && <div className="w-2.5 h-2.5 rounded-full bg-[#C85A32]" />}
                    </div>
                    <span>{opt}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              className="btn-primary flex items-center gap-2 px-8 py-3" 
              onClick={handleNext}
              disabled={answers[currentQuestionIndex] === undefined}
            >
              <span>{currentQuestionIndex === activeQuiz.questions.length - 1 ? 'Submit Test' : 'Next Question'}</span>
              {currentQuestionIndex < activeQuiz.questions.length - 1 && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
