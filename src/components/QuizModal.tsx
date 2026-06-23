import { useGameStore } from '../store/gameStore';
import { TERRITORY_MAP } from '../data/mapData';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function QuizModal() {
  const pendingQuestion = useGameStore((s) => s.pendingQuestion);
  const pendingAttack = useGameStore((s) => s.pendingAttack);
  const feedback = useGameStore((s) => s.feedback);
  const answerQuestion = useGameStore((s) => s.answerQuestion);
  const closeFeedback = useGameStore((s) => s.closeFeedback);

  if (!pendingQuestion && !feedback) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box quiz-box">
        {pendingQuestion && !feedback && (
          <>
            <div className="quiz-header">
              {pendingAttack && (
                <p className="quiz-context">
                  Atacando <strong>{TERRITORY_MAP[pendingAttack.targetId]?.name}</strong> a
                  partir de <strong>{TERRITORY_MAP[pendingAttack.sourceId]?.name}</strong>
                </p>
              )}
              <p className="quiz-question">{pendingQuestion.text}</p>
            </div>
            <div className="quiz-alternatives">
              {pendingQuestion.alternatives.map((alt, i) => (
                <button
                  key={i}
                  type="button"
                  className="alt-btn"
                  onClick={() => answerQuestion(i)}
                >
                  <span className="alt-letter">{LETTERS[i]}</span>
                  <span>{alt}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {feedback && (
          <div className={feedback.correct ? 'feedback correct' : 'feedback incorrect'}>
            <h3>{feedback.correct ? 'Resposta correta!' : 'Resposta incorreta'}</h3>
            <p>{feedback.message}</p>
            <button type="button" className="primary-btn" onClick={closeFeedback}>
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
