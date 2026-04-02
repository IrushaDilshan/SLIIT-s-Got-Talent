import React, { useMemo, useState, useEffect } from "react";

const JudgePanelDashboard = ({ embedded = false }) => {
  const [loggedInJudge] = useState({
    id: 2,
    name: "Judge Nethmi Fernando",
    role: "Professional Judge",
    panel: "SLIIT Got Talent 2026",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    email: "nethmi.judge@sliit.com",
  });

  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeContestantId, setActiveContestantId] = useState(1);

  // Contestants ලගේ data වලට photo URL එකක් එකතු කරලා තියෙනවා
  const [contestants] = useState([
    {
      id: 1,
      name: "Amandi Perera",
      category: "Singing",
      round: "Semi Final",
      performanceTitle: "Echoes of You",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      status: "Ready for Review",
      timeSlot: "07:30 PM",
    },
    {
      id: 2,
      name: "Kasun Madushan",
      category: "Dancing",
      round: "Semi Final",
      performanceTitle: "Rhythm X Motion",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
      status: "Scoring In Progress",
      timeSlot: "07:45 PM",
    },
    {
      id: 3,
      name: "Nethmi Silva",
      category: "Drama",
      round: "Semi Final",
      performanceTitle: "Silent Stage",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      status: "Ready for Review",
      timeSlot: "08:00 PM",
    },
    {
      id: 4,
      name: "Ravindu Senanayake",
      category: "Beatboxing",
      round: "Semi Final",
      performanceTitle: "Pulse Machine",
      photo: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80",
      status: "Top Rated",
      timeSlot: "08:15 PM",
    },
  ]);

  const [scores, setScores] = useState({});
  const [submittedResults, setSubmittedResults] = useState({});

  const criteria = [
    { key: "creativity", label: "Creativity", helper: "Originality & uniqueness", max: 25 },
    { key: "presentation", label: "Presentation", helper: "Stage presence & delivery", max: 25 },
    { key: "skillLevel", label: "Skill Level", helper: "Technical ability", max: 25 },
    { key: "audienceImpact", label: "Audience Impact", helper: "Engagement & overall response", max: 25 },
  ];

  const categories = ["All", ...new Set(contestants.map((c) => c.category))];

  const filteredContestants = useMemo(() => {
    return contestants.filter((contestant) => {
      const matchesCategory = selectedCategory === "All" || contestant.category === selectedCategory;
      const matchesSearch =
        contestant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contestant.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contestant.performanceTitle.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [contestants, selectedCategory, searchTerm]);

  useEffect(() => {
    if (filteredContestants.length > 0) {
      const isStillInList = filteredContestants.some(c => c.id === activeContestantId);
      if (!isStillInList) {
        setActiveContestantId(filteredContestants[0].id);
      }
    }
  }, [filteredContestants, activeContestantId]);

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

  const handleSubmit = (contestant) => {
    const judgeTotal = calculateJudgeTotal(contestant.id);
    const result = {
      judgeId: loggedInJudge.id,
      contestantId: contestant.id,
      judgeScore: judgeTotal,
      criteria: scores[contestant.id] || {},
    };

    setSubmittedResults((prev) => ({ ...prev, [contestant.id]: result }));
    setMessage(`✅ Score submitted for ${contestant.name}: ${judgeTotal}/100`);
    
    // Auto-select next contestant
    const currentIndex = filteredContestants.findIndex(c => c.id === contestant.id);
    if (currentIndex < filteredContestants.length - 1) {
      setTimeout(() => setActiveContestantId(filteredContestants[currentIndex + 1].id), 1500);
    }
    
    setTimeout(() => setMessage(""), 4000);
  };

  const scoreboard = contestants
    .map((contestant) => {
      const saved = submittedResults[contestant.id];
      return {
        id: contestant.id,
        name: contestant.name,
        photo: contestant.photo,
        judgeScore: saved ? saved.judgeScore : calculateJudgeTotal(contestant.id),
      };
    })
    .sort((a, b) => b.judgeScore - a.judgeScore);

  const activeContestant = contestants.find((c) => c.id === activeContestantId) || contestants[0];
  const activeTotal = calculateJudgeTotal(activeContestant.id);
  const isSubmitted = !!submittedResults[activeContestant.id];

  return (
    <div style={{...styles.page, ...(embedded ? styles.embeddedPage : {})}}>
      {!embedded && <div style={styles.bgOrbOne} />}
      {!embedded && <div style={styles.bgOrbTwo} />}

      {message && (
        <div style={styles.toast}>
          {message}
        </div>
      )}

      <div style={{...styles.shell, ...(embedded ? styles.embeddedShell : {})}}>
        {/* SIDEBAR - Hidden when embedded inside Dashboard */}
        {!embedded && (
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
                {scoreboard.map((item, index) => (
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
        )}

        {/* MAIN CONTENT */}
        <main style={styles.main}>
          {/* HEADER */}
          <header style={styles.topbar}>
            <div>
              <p style={styles.eyebrowTitle}>JUDGE PANEL DASHBOARD</p>
              <h1 style={styles.mainTitle}>Professional Judge Scoring Panel</h1>
            </div>
            <div style={styles.sessionBadge}>
              <span style={styles.statusDot}></span>
              Session Active
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
          <div style={styles.focusCard}>
            <div style={styles.focusHeader}>
              <div style={styles.focusProfile}>
                <img src={activeContestant.photo} alt={activeContestant.name} style={styles.avatarHuge} />
                <div>
                  <span style={styles.categoryBadge}>{activeContestant.category}</span>
                  <h2 style={styles.focusName}>{activeContestant.name}</h2>
                  <p style={styles.focusPerformance}>"{activeContestant.performanceTitle}" • {activeContestant.timeSlot}</p>
                </div>
              </div>
              <div style={styles.focusTotalBox}>
                <span style={styles.totalLabel}>Total Score</span>
                <span style={{...styles.totalValue, color: isSubmitted ? "#50ffa3" : "#fff"}}>{activeTotal}</span>
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
                      <div style={styles.critScoreBadge}>{val} / {criterion.max}</div>
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
                        {[10, 15, 20, 25].map(num => (
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
              <button 
                style={isSubmitted ? styles.submittedBtn : styles.submitBtn}
                onClick={() => handleSubmit(activeContestant)}
                disabled={isSubmitted}
              >
                {isSubmitted ? "Score Submitted Successfully" : "Finalize & Submit Score"}
              </button>
            </div>
          </div>

          {/* UP NEXT QUEUE */}
          <div>
            <h3 style={styles.queueTitle}>Up Next / Other Contestants</h3>
            <div style={styles.queueGrid}>
              {filteredContestants.map(c => (
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
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #070B19 0%, #111832 50%, #0F1322 100%)", color: "#f8fafc", fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", position: "relative", padding: "30px", overflowX: "hidden" },
  embeddedPage: { minHeight: "auto", background: "transparent", padding: "10px", margin: 0 },
  bgOrbOne: { position: "absolute", top: "-10%", right: "10%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(233,69,96,0.15) 0%, rgba(0,0,0,0) 70%)", zIndex: 0, pointerEvents: "none" },
  bgOrbTwo: { position: "absolute", bottom: "-10%", left: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(233,69,96,0.1) 0%, rgba(0,0,0,0) 70%)", zIndex: 0, pointerEvents: "none" },
  toast: { position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg, #12b86d, #0ba35c)", padding: "12px 24px", borderRadius: "30px", fontWeight: "bold", zIndex: 100, boxShadow: "0 10px 30px rgba(18, 184, 109, 0.3)", animation: "fadeIn 0.3s ease" },
  shell: { maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "300px 1fr", gap: "30px", position: "relative", zIndex: 2 },
  embeddedShell: { gridTemplateColumns: "1fr", maxWidth: "1200px" },
  
  sidebar: { ...glass, borderRadius: "24px", padding: "24px", height: "fit-content", position: "sticky", top: "30px" },
  brandBox: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "30px" },
  brandLogo: { width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", background: "linear-gradient(135deg, #e94560, #d1314a)", color: "#fff" },
  brandTitle: { margin: 0, fontSize: "20px", fontWeight: "800", color: "#e94560" },
  brandSub: { margin: "4px 0 0 0", color: "#f8fafc", fontSize: "13px", fontWeight: "600" },
  sidebarCard: { background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "16px", marginBottom: "20px" },
  judgeProfileRow: { display: "flex", alignItems: "center", gap: "14px" },
  
  // Image styles added here 👇
  profileAvatarLarge: { width: "50px", height: "50px", borderRadius: "14px", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,255,0.1)" },
  
  sidebarJudge: { margin: 0, fontSize: "16px", fontWeight: "700" },
  sidebarMutedSmall: { margin: "4px 0 0 0", color: "rgba(255,255,255,0.5)", fontSize: "12px" },
  sidebarLabel: { margin: "0 0 16px 0", color: "#8fb6ff", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" },
  leaderboardList: { display: "flex", flexDirection: "column", gap: "10px" },
  leaderItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "12px" },
  leaderLeft: { display: "flex", alignItems: "center", gap: "10px" },
  rankText: { color: "#e94560", fontSize: "12px", fontWeight: "bold", minWidth: "20px" },
  
  // Leaderboard photo style 👇
  leaderPhoto: { width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 },
  
  leaderName: { fontSize: "14px", fontWeight: "600", color: "#f8fafc" },
  leaderScore: { color: "#e94560", fontSize: "16px" },
  
  main: { display: "flex", flexDirection: "column", gap: "24px" },
  
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "10px" },
  eyebrowTitle: { margin: 0, color: "#e94560", fontSize: "13px", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: "600" },
  mainTitle: { margin: "6px 0 0 0", fontSize: "32px", fontWeight: "800", letterSpacing: "-0.5px", color: "#f8fafc" },
  sessionBadge: { display: "flex", alignItems: "center", gap: "10px", padding: "8px 18px", background: "rgba(25, 45, 75, 0.6)", border: "1px solid rgba(40, 80, 130, 0.5)", borderRadius: "30px", color: "#aed4ff", fontSize: "14px", fontWeight: "600" },
  statusDot: { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#50ffa3", boxShadow: "0 0 10px rgba(80, 255, 163, 0.6)" },

  filterBar: { display: "flex", gap: "12px", marginBottom: "10px" },
  input: { flex: 1, maxWidth: "350px", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" },
  select: { width: "180px", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" },
  
  focusCard: { ...glass, borderRadius: "24px", padding: "30px", borderTop: "4px solid #6f4cff" },
  focusHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "20px" },
  focusProfile: { display: "flex", alignItems: "center", gap: "20px" },
  
  // Huge photo style for focus area 👇
  avatarHuge: { width: "86px", height: "86px", borderRadius: "20px", objectFit: "cover", flexShrink: 0, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" },
  
  categoryBadge: { display: "inline-block", background: "rgba(35, 201, 255, 0.15)", color: "#23c9ff", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", marginBottom: "8px" },
  focusName: { margin: 0, fontSize: "26px", fontWeight: "800" },
  focusPerformance: { margin: "6px 0 0 0", color: "rgba(255,255,255,0.6)", fontSize: "15px" },
  focusTotalBox: { background: "rgba(0,0,0,0.3)", padding: "16px 24px", borderRadius: "16px", textAlign: "right" },
  totalLabel: { display: "block", fontSize: "12px", color: "#8fb6ff", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" },
  totalValue: { fontSize: "36px", fontWeight: "900" },
  totalMax: { fontSize: "18px", color: "rgba(255,255,255,0.4)" },
  criteriaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "30px" },
  criterionBox: { background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.05)" },
  critTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  critLabel: { margin: 0, fontSize: "16px", fontWeight: "700" },
  critHelper: { margin: "4px 0 0 0", fontSize: "12px", color: "rgba(255,255,255,0.5)" },
  critScoreBadge: { background: "rgba(111,76,255,0.2)", color: "#dbe0ff", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px" },
  rangeLarge: { width: "100%", height: "6px", borderRadius: "4px", accentColor: "#23c9ff", cursor: "pointer", marginBottom: "16px" },
  quickButtons: { display: "flex", gap: "8px" },
  quickBtn: { flex: 1, padding: "8px 0", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", cursor: "pointer", transition: "0.2s" },
  quickBtnActive: { flex: 1, padding: "8px 0", background: "#6f4cff", border: "1px solid #6f4cff", borderRadius: "8px", color: "#fff", cursor: "pointer", fontWeight: "bold" },
  actionArea: { display: "flex", justifyContent: "flex-end" },
  submitBtn: { background: "linear-gradient(135deg, #6f4cff, #23c9ff)", color: "#fff", border: "none", padding: "16px 32px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 10px 20px rgba(111,76,255,0.3)" },
  submittedBtn: { background: "rgba(255,255,255,0.1)", color: "#50ffa3", border: "1px solid rgba(80,255,163,0.3)", padding: "16px 32px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "not-allowed" },
  queueTitle: { margin: "10px 0 16px 0", fontSize: "18px", fontWeight: "700" },
  queueGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" },
  queueCard: { display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "16px", border: "1px solid", cursor: "pointer", transition: "all 0.2s ease", position: "relative" },
  
  // Queue profile photo style 👇
  queueAvatar: { width: "42px", height: "42px", borderRadius: "12px", objectFit: "cover", flexShrink: 0 },
  
  queueName: { margin: 0, fontSize: "14px", fontWeight: "700" },
  queueSub: { margin: "2px 0 0 0", fontSize: "12px", color: "rgba(255,255,255,0.5)" },
  checkIcon: { position: "absolute", right: "12px", background: "#12b86d", color: "#fff", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold" }
};

export default JudgePanelDashboard;