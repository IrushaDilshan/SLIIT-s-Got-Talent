import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";
import { judgeApi } from "../services/judgeApi";

const JudgePanelDashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const loggedInJudge = {
    id: user?.id || 2,
    name: user?.name || user?.email?.split('@')[0] || "Judge",
    role: "Judge",
    panel: "SLIIT Got Talent 2026",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    email: user?.email || "judge@sliit.lk",
  };

  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeContestantId, setActiveContestantId] = useState(null);
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch contestants from API on mount
  useEffect(() => {
    const fetchContestants = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching contestants with token:', token ? 'Present' : 'Missing');
        
        const data = await judgeApi.getContestants({}, token);
        console.log('✅ Contestants fetched:', data);
        
        setContestants(data || []);
        // Set first contestant as active if available
        if (data && data.length > 0) {
          setActiveContestantId(data[0].id);
        }
      } catch (err) {
        console.error('❌ Error fetching contestants:', err);
        setError(err.message || 'Failed to load contestants');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchContestants();
    } else {
      setError('No authentication token available');
      setLoading(false);
    }
  }, [token]);

  // Fetch judge's previously submitted scores on mount
  useEffect(() => {
    const fetchPreviousScores = async () => {
      try {
        console.log('🔄 Fetching judge\'s previous scores...');
        const response = await judgeApi.getScoreboard({}, token);
        console.log('✅ Previous scores fetched:', response);
        
        if (response && Array.isArray(response)) {
          // Convert previous scores to submittedResults format
          const previousScores = {};
          response.forEach((scoreData) => {
            previousScores[scoreData.contestantId] = {
              scoreId: scoreData.scoreId,
              judgeScore: scoreData.totalScore,
              criteria: scoreData.criteria,
            };
          });
          console.log('📊 Loading previous scores into scoreboard:', previousScores);
          setSubmittedResults((prev) => ({ ...prev, ...previousScores }));
        }
      } catch (err) {
        console.warn('⚠️ No previous scores found:', err.message);
        // This is not a fatal error - just means no scores submitted yet
      }
    };

    if (token) {
      fetchPreviousScores();
    }
  }, [token]);

  const [scores, setScores] = useState({});
  const [submittedResults, setSubmittedResults] = useState({});
  const [editingContestants, setEditingContestants] = useState({}); // Track which contestants are being edited

  const criteria = [
    { key: "creativity", label: "Creativity", helper: "Originality & uniqueness", max: 25 },
    { key: "presentation", label: "Presentation", helper: "Stage presence & delivery", max: 25 },
    { key: "skillLevel", label: "Skill Level", helper: "Technical ability", max: 25 },
    { key: "audienceImpact", label: "Audience Impact", helper: "Engagement & overall response", max: 25 },
  ];

  const categories = useMemo(() => {
    const uniqueCategories = Array.isArray(contestants) ? [...new Set(contestants.map((c) => c.category))] : [];
    return ["All", ...uniqueCategories];
  }, [contestants]);

  const filteredContestants = useMemo(() => {
    if (!Array.isArray(contestants)) return [];
    return contestants.filter((contestant) => {
      const matchesCategory = selectedCategory === "All" || contestant.category === selectedCategory;
      const matchesSearch =
        contestant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contestant.category && contestant.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contestant.description && contestant.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [contestants, selectedCategory, searchTerm]);

  const handleScoreChange = (id, field, value) => {
    const score = Math.max(0, Math.min(25, Number(value) || 0));
    setScores((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: score },
    }));
  };

  const calculateJudgeTotal = (id) => {
    const s = scores[id] || {};
    return (s.creativity || 0) + (s.presentation || 0) + (s.skillLevel || 0) + (s.audienceImpact || 0);
  };

  const handleClearScore = async (contestant) => {
    try {
      const submittedResult = submittedResults[contestant.id];
      if (!submittedResult || !submittedResult.scoreId) {
        setMessage("❌ No score found to clear");
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      if (!confirm(`Are you sure you want to clear the score for ${contestant.name}? This action cannot be undone.`)) {
        return;
      }

      console.log('🗑️ Clearing score for contestant:', contestant.id, 'scoreId:', submittedResult.scoreId);
      setMessage("⏳ Clearing score...");

      // Call API to delete the score
      await judgeApi.deleteScore(submittedResult.scoreId, token);

      // Update local state
      setSubmittedResults((prev) => {
        const updated = { ...prev };
        delete updated[contestant.id];
        console.log('🧹 Cleared submitted result from state:', updated);
        return updated;
      });

      // Clear editing state if this contestant was being edited
      setEditingContestants((prev) => {
        const updated = { ...prev };
        delete updated[contestant.id];
        return updated;
      });

      // Clear any pending scores for this contestant
      setScores((prev) => {
        const updated = { ...prev };
        delete updated[contestant.id];
        return updated;
      });

      setMessage(`✅ Score cleared for ${contestant.name}`);
      setTimeout(() => setMessage(""), 3000);

    } catch (err) {
      console.error('❌ Clear failed:', err);
      setMessage(`❌ Error: ${err.message || 'Failed to clear score'}`);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleEditScore = (contestant) => {
    const submittedResult = submittedResults[contestant.id];
    if (!submittedResult || !submittedResult.criteria) {
      setMessage("❌ No score data found to edit");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    // Load the submitted criteria back into the scores state for editing
    setScores((prev) => ({
      ...prev,
      [contestant.id]: { ...submittedResult.criteria },
    }));

    // Mark this contestant as being edited and store the scoreId
    setEditingContestants((prev) => ({
      ...prev,
      [contestant.id]: submittedResult.scoreId,
    }));

    setMessage(`✏️ Loaded score for editing: ${contestant.name}`);
    setTimeout(() => setMessage(""), 2000);
  };

  const handleSubmit = async (contestant) => {
    try {
      // Validate all scores are filled
      const scores_data = scores[contestant.id] || {};
      if (!scores_data.creativity || !scores_data.presentation || !scores_data.skillLevel || !scores_data.audienceImpact) {
        setMessage("❌ Please fill all scoring criteria");
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      const judgeTotal = calculateJudgeTotal(contestant.id);
      
      // Check if this is an update (we have a scoreId from editing)
      const editingScoreId = editingContestants[contestant.id];
      const isUpdate = !!editingScoreId;
      
      // Prepare API payload
      const scoreData = {
        contestantId: contestant.id, // MongoDB ObjectId from API
        creativity: scores_data.creativity,
        presentation: scores_data.presentation,
        skillLevel: scores_data.skillLevel,
        audienceImpact: scores_data.audienceImpact,
        notes: "",
      };

      console.log(`${isUpdate ? '📤 Updating' : '📤 Submitting'} score:`, scoreData);
      setMessage(`⏳ ${isUpdate ? 'Updating' : 'Submitting'} score...`);

      let response;
      if (isUpdate) {
        // Update existing score
        response = await judgeApi.updateScore(editingScoreId, scoreData, token);
      } else {
        // Submit new score
        response = await judgeApi.submitScore(scoreData, token);
      }
      
      console.log('✅ API Response:', response);

      // Update local state only after successful API call
      const newSubmittedResult = {
        scoreId: response.data?.scoreId || editingScoreId,
        judgeScore: judgeTotal,
        criteria: scores_data,
      };
      
      console.log(`📤 Updating submittedResults for contestant ${contestant.id}:`, newSubmittedResult);
      
      setSubmittedResults((prev) => {
        const updated = { ...prev, [contestant.id]: newSubmittedResult };
        console.log('📊 Updated submittedResults state:', updated);
        return updated;
      });

      // Remove from editing state
      setEditingContestants((prev) => {
        const updated = { ...prev };
        delete updated[contestant.id];
        return updated;
      });

      // Clear scores for submitted contestant
      setScores((prev) => {
        const updated = { ...prev };
        delete updated[contestant.id];
        console.log('🧹 Cleared scores for submitted contestant, remaining scores:', updated);
        return updated;
      });

      setMessage(`✅ Score ${isUpdate ? 'updated' : 'submitted'} for ${contestant.name}: ${judgeTotal}/100`);
      
      // Auto-select next contestant
      const currentIndex = filteredContestants.findIndex(c => c.id === contestant.id);
      if (currentIndex < filteredContestants.length - 1) {
        console.log(`➡️ Moving to next contestant (index ${currentIndex + 1})...`);
        setTimeout(() => setActiveContestantId(filteredContestants[currentIndex + 1].id), 1500);
      } else {
        console.log('✅ All visible contestants have been scored!');
      }
      
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error('❌ Submission failed:', err);
      setMessage(`❌ Error: ${err.message || 'Failed to submit score'}`);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  // Calculate scoreboard with proper memoization and debugging
  const scoreboard = useMemo(() => {
    console.log('📊 Recalculating scoreboard - submittedResults:', submittedResults, 'scores state:', scores);
    
    const boardData = (Array.isArray(contestants) ? contestants : [])
      .map((contestant) => {
        // First check if score has been submitted
        const saved = submittedResults[contestant.id];
        // If submitted, use submitted score; otherwise calculate from current scores state
        let judgeScore = 0;
        
        if (saved) {
          judgeScore = saved.judgeScore;
          console.log(`✅ ${contestant.name} - using submitted score:`, judgeScore);
        } else {
          judgeScore = calculateJudgeTotal(contestant.id);
          console.log(`⏳ ${contestant.name} - calculating score:`, judgeScore);
        }
        
        return {
          id: contestant.id,
          name: contestant.name,
          photo: contestant.photo,
          judgeScore: judgeScore,
        };
      })
      .sort((a, b) => b.judgeScore - a.judgeScore);
    
    console.log('🏆 Scoreboard sorted:', boardData);
    return boardData;
  }, [contestants, submittedResults, scores]);

  const activeContestant = Array.isArray(contestants) ? (contestants.find((c) => c.id === activeContestantId) || contestants[0]) : null;
  const activeTotal = activeContestant ? calculateJudgeTotal(activeContestant.id) : 0;
  const isSubmitted = activeContestant ? (submittedResults[activeContestant.id] && !editingContestants[activeContestant.id]) : false;

  return (
    <div style={styles.page}>
      <div style={styles.bgOrbOne} />
      <div style={styles.bgOrbTwo} />

      {message && (
        <div style={styles.toast}>
          {message}
        </div>
      )}

      {loading && (
        <div style={{...styles.toast, background: 'linear-gradient(90deg, #6f4cff, #23c9ff)'}}>
          ⏳ Loading contestants...
        </div>
      )}

      {error && (
        <div style={{...styles.toast, background: 'linear-gradient(90deg, #ff6b6b, #ee5a6f)'}}>
          ❌ {error}
        </div>
      )}

      {!loading && contestants.length === 0 ? (
        <div style={{...styles.toast, background: 'linear-gradient(90deg, #ffa502, #ffb827)'}}>
          ⚠️ No contestants available
        </div>
      ) : (!loading && (
      <div style={styles.shell}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={styles.brandBox}>
            <div style={styles.brandLogo}>SGT</div>
            <div>
              <h2 style={styles.brandTitle}>SLIIT Talent</h2>
              <p style={styles.brandSub}>Judge Panel</p>
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <div style={styles.judgeProfileRow}>
              <img src={loggedInJudge.photo} alt={loggedInJudge.name} style={styles.profileAvatarLarge} />
              <div>
                <h3 style={styles.sidebarJudge}>{loggedInJudge.name}</h3>
                <p style={styles.sidebarMutedSmall}>{loggedInJudge.role}</p>
              </div>
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <h4 style={styles.sidebarLabel}>Live Scoreboard</h4>
            <div style={styles.leaderboardList}>
              {Array.isArray(scoreboard) && scoreboard.map((item, index) => (
                <div key={item.id} style={styles.leaderItem}>
                  <div style={styles.leaderLeft}>
                    <span style={styles.rankText}>#{index + 1}</span>
                    <img src={item.photo} alt={item.name} style={styles.leaderPhoto} />
                    <span style={styles.leaderName}>{item.name}</span>
                  </div>
                  <strong style={styles.leaderScore}>{item.judgeScore}</strong>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={styles.main}>
          {/* HEADER */}
          <header style={styles.topbar}>
            <div>
              <p style={styles.eyebrowTitle}>JUDGE PANEL DASHBOARD</p>
              <h1 style={styles.mainTitle}>Professional Judge Scoring Panel</h1>
            </div>
            <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
              <div style={styles.sessionBadge}>
                <span style={styles.statusDot}></span>
                Session Active
              </div>
              <button
                onClick={() => navigate('/final-result')}
                style={styles.viewResultsBtn}
              >
                📊 View Final Results
              </button>
            </div>
          </header>

          {/* FILTER BAR */}
          <div style={styles.filterBar}>
            <input
              type="text"
              placeholder="Search contestant or performance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.input}
            />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={styles.select}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* FOCUS SCORING AREA */}
          {activeContestant && (
          <div style={styles.focusCard}>
            <div style={styles.focusHeader}>
              <div style={styles.focusProfile}>
                <img src={activeContestant.photo} alt={activeContestant.name} style={styles.avatarHuge} />
                <div>
                  <span style={styles.categoryBadge}>{activeContestant.category}</span>
                  <h2 style={styles.focusName}>{activeContestant.name}</h2>
                  {activeContestant.description && (
                    <p style={styles.focusPerformance}>"{activeContestant.description}"</p>
                  )}
                </div>
              </div>
              <div style={styles.focusTotalBox}>
                <span style={styles.totalLabel}>Total Score</span>
                <span style={{ ...styles.totalValue, color: isSubmitted ? "#50ffa3" : "#fff" }}>
                  {activeTotal}
                </span>
                <span style={styles.totalMax}>/100</span>
              </div>
            </div>

            <div style={styles.criteriaGrid}>
              {criteria.map((criterion) => {
                const val = scores[activeContestant.id]?.[criterion.key] || 0;
                return (
                  <div key={criterion.key} style={styles.criterionBox}>
                    <div style={styles.critTop}>
                      <div>
                        <h4 style={styles.critLabel}>{criterion.label}</h4>
                        <p style={styles.critHelper}>{criterion.helper}</p>
                      </div>
                      <div style={styles.critScoreBadge}>
                        {val} / {criterion.max}
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={val}
                      disabled={isSubmitted}
                      onChange={(e) => handleScoreChange(activeContestant.id, criterion.key, e.target.value)}
                      style={styles.rangeLarge}
                    />

                    {/* Quick Buttons for faster scoring */}
                    {!isSubmitted && (
                      <div style={styles.quickButtons}>
                        {[10, 15, 20, 25].map((num) => (
                          <button
                            key={num}
                            onClick={() => handleScoreChange(activeContestant.id, criterion.key, num)}
                            style={val === num ? styles.quickBtnActive : styles.quickBtn}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={styles.actionArea}>
              {!isSubmitted ? (
                <button
                  style={styles.submitBtn}
                  onClick={() => handleSubmit(activeContestant)}
                >
                  Finalize & Submit Score
                </button>
              ) : (
                <div style={styles.submittedActions}>
                  <div style={styles.submittedStatus}>
                    <span style={styles.checkIcon}>✓</span>
                    Score Submitted Successfully
                  </div>
                  <div style={styles.editClearButtons}>
                    <button
                      style={styles.editBtn}
                      onClick={() => handleEditScore(activeContestant)}
                    >
                      ✏️ Edit Score
                    </button>
                    <button
                      style={styles.clearBtn}
                      onClick={() => handleClearScore(activeContestant)}
                    >
                      🗑️ Clear Score
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* UP NEXT QUEUE */}
          <div>
            <h3 style={styles.queueTitle}>Up Next / Other Contestants</h3>
            <div style={styles.queueGrid}>
              {Array.isArray(filteredContestants) && filteredContestants.map(c => (
                <div 
                  key={c.id}
                  onClick={() => setActiveContestantId(c.id)}
                  style={{
                    ...styles.queueCard,
                    borderColor: activeContestantId === c.id ? "#23c9ff" : "rgba(255,255,255,0.08)",
                    background: activeContestantId === c.id ? "rgba(35, 201, 255, 0.1)" : "rgba(255,255,255,0.03)"
                  }}
                >
                  <img src={c.photo} alt={c.name} style={styles.queueAvatar} />
                  <div>
                    <h4 style={styles.queueName}>{c.name}</h4>
                    <p style={styles.queueSub}>{c.category}</p>
                  </div>
                  {submittedResults[c.id] && <div style={styles.checkIcon}>✓</div>}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      ))}
    </div>
  );
};

// Styling Object
const glass = {
  background: "rgba(16, 22, 45, 0.6)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #070B19 0%, #111832 50%, #0F1322 100%)",
    color: "#ffffff",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    position: "relative",
    padding: "30px",
    overflowX: "hidden"
  },
  bgOrbOne: {
    position: "absolute",
    top: "-10%",
    right: "10%",
    width: "40vw",
    height: "40vw",
    background: "radial-gradient(circle, rgba(111,76,255,0.15) 0%, rgba(0,0,0,0) 70%)",
    zIndex: 0,
    pointerEvents: "none"
  },
  bgOrbTwo: {
    position: "absolute",
    bottom: "-10%",
    left: "-10%",
    width: "50vw",
    height: "50vw",
    background: "radial-gradient(circle, rgba(35,201,255,0.1) 0%, rgba(0,0,0,0) 70%)",
    zIndex: 0,
    pointerEvents: "none"
  },
  toast: {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "linear-gradient(90deg, #12b86d, #0ba35c)",
    padding: "12px 24px",
    borderRadius: "30px",
    fontWeight: "bold",
    zIndex: 100,
    boxShadow: "0 10px 30px rgba(18, 184, 109, 0.3)",
    animation: "fadeIn 0.3s ease"
  },
  shell: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "30px",
    position: "relative",
    zIndex: 2
  },

  sidebar: {
    ...glass,
    borderRadius: "24px",
    padding: "24px",
    height: "fit-content",
    position: "sticky",
    top: "30px"
  },
  brandBox: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "30px"
  },
  brandLogo: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    background: "linear-gradient(135deg, #6f4cff, #23c9ff)",
    color: "#fff"
  },
  brandTitle: { margin: 0, fontSize: "20px", fontWeight: "800" },
  brandSub: { margin: "4px 0 0 0", color: "#8fb6ff", fontSize: "13px", fontWeight: "600" },
  sidebarCard: {
    background: "rgba(255,255,255,0.03)",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "20px"
  },
  judgeProfileRow: { display: "flex", alignItems: "center", gap: "14px" },

  profileAvatarLarge: {
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    objectFit: "cover",
    flexShrink: 0,
    border: "2px solid rgba(255,255,255,0.1)"
  },

  sidebarJudge: { margin: 0, fontSize: "16px", fontWeight: "700" },
  sidebarMutedSmall: { margin: "4px 0 0 0", color: "rgba(255,255,255,0.5)", fontSize: "12px" },
  sidebarLabel: {
    margin: "0 0 16px 0",
    color: "#8fb6ff",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "1px"
  },
  leaderboardList: { display: "flex", flexDirection: "column", gap: "10px" },
  leaderItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    background: "rgba(0,0,0,0.2)",
    borderRadius: "12px"
  },
  leaderLeft: { display: "flex", alignItems: "center", gap: "10px" },
  rankText: { color: "#8fb6ff", fontSize: "12px", fontWeight: "bold", minWidth: "20px" },

  leaderPhoto: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0
  },

  leaderName: { fontSize: "14px", fontWeight: "600" },
  leaderScore: { color: "#23c9ff", fontSize: "16px" },

  main: { display: "flex", flexDirection: "column", gap: "24px" },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "10px"
  },
  eyebrowTitle: {
    margin: 0,
    color: "#8fb6ff",
    fontSize: "13px",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    fontWeight: "600"
  },
  mainTitle: { margin: "6px 0 0 0", fontSize: "32px", fontWeight: "800", letterSpacing: "-0.5px" },
  sessionBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 18px",
    background: "rgba(25, 45, 75, 0.6)",
    border: "1px solid rgba(40, 80, 130, 0.5)",
    borderRadius: "30px",
    color: "#aed4ff",
    fontSize: "14px",
    fontWeight: "600"
  },
  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#50ffa3",
    boxShadow: "0 0 10px rgba(80, 255, 163, 0.6)"
  },

  filterBar: { display: "flex", gap: "12px", marginBottom: "10px" },
  input: {
    flex: 1,
    maxWidth: "350px",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff"
  },
  select: {
    width: "180px",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff"
  },

  focusCard: { ...glass, borderRadius: "24px", padding: "30px", borderTop: "4px solid #6f4cff" },
  focusHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "20px"
  },
  focusProfile: { display: "flex", alignItems: "center", gap: "20px" },

  avatarHuge: {
    width: "86px",
    height: "86px",
    borderRadius: "20px",
    objectFit: "cover",
    flexShrink: 0,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
  },

  categoryBadge: {
    display: "inline-block",
    background: "rgba(35, 201, 255, 0.15)",
    color: "#23c9ff",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "8px"
  },
  focusName: { margin: 0, fontSize: "26px", fontWeight: "800" },
  focusPerformance: { margin: "6px 0 0 0", color: "rgba(255,255,255,0.6)", fontSize: "15px" },
  focusTotalBox: {
    background: "rgba(0,0,0,0.3)",
    padding: "16px 24px",
    borderRadius: "16px",
    textAlign: "right"
  },
  totalLabel: {
    display: "block",
    fontSize: "12px",
    color: "#8fb6ff",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "4px"
  },
  totalValue: { fontSize: "36px", fontWeight: "900" },
  totalMax: { fontSize: "18px", color: "rgba(255,255,255,0.4)" },
  criteriaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    marginBottom: "30px"
  },
  criterionBox: {
    background: "rgba(255,255,255,0.03)",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.05)"
  },
  critTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  critLabel: { margin: 0, fontSize: "16px", fontWeight: "700" },
  critHelper: { margin: "4px 0 0 0", fontSize: "12px", color: "rgba(255,255,255,0.5)" },
  critScoreBadge: {
    background: "rgba(111,76,255,0.2)",
    color: "#dbe0ff",
    padding: "6px 12px",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "14px"
  },
  rangeLarge: {
    width: "100%",
    height: "6px",
    borderRadius: "4px",
    accentColor: "#23c9ff",
    cursor: "pointer",
    marginBottom: "16px"
  },
  quickButtons: { display: "flex", gap: "8px" },
  quickBtn: {
    flex: 1,
    padding: "8px 0",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    transition: "0.2s"
  },
  quickBtnActive: {
    flex: 1,
    padding: "8px 0",
    background: "#6f4cff",
    border: "1px solid #6f4cff",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
  },
  actionArea: { display: "flex", justifyContent: "flex-end" },
  submitBtn: {
    background: "linear-gradient(135deg, #6f4cff, #23c9ff)",
    color: "#fff",
    border: "none",
    padding: "16px 32px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(111,76,255,0.3)"
  },
  submittedBtn: {
    background: "rgba(255,255,255,0.1)",
    color: "#50ffa3",
    border: "1px solid rgba(80,255,163,0.3)",
    padding: "16px 32px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "not-allowed"
  },
  submittedActions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
    width: "100%"
  },
  submittedStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#50ffa3",
    fontSize: "16px",
    fontWeight: "bold"
  },
  editClearButtons: {
    display: "flex",
    gap: "12px",
    width: "100%",
    justifyContent: "center"
  },
  editBtn: {
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 6px 12px rgba(245, 158, 11, 0.3)",
    transition: "all 0.2s ease"
  },
  clearBtn: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 6px 12px rgba(239, 68, 68, 0.3)",
    transition: "all 0.2s ease"
  },
  viewResultsBtn: {
    background: "linear-gradient(135deg, #23c9ff, #6f4cff)",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 8px 15px rgba(35, 201, 255, 0.3)",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap"
  },
  queueTitle: { margin: "10px 0 16px 0", fontSize: "18px", fontWeight: "700" },
  queueGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" },
  queueCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "16px",
    border: "1px solid",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative"
  },

  queueAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    objectFit: "cover",
    flexShrink: 0
  },

  queueName: { margin: 0, fontSize: "14px", fontWeight: "700" },
  queueSub: { margin: "2px 0 0 0", fontSize: "12px", color: "rgba(255,255,255,0.5)" },
  checkIcon: {
    position: "absolute",
    right: "12px",
    background: "#12b86d",
    color: "#fff",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "bold"
  }
};

export default JudgePanelDashboard;