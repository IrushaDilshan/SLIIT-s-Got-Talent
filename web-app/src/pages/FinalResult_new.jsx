import React, { useMemo, useState, useRef, useEffect } from "react";
import { judgeApi } from "../services/judgeApi";
import "./FinalResult.css";

const MEDAL = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

function calculateWeighted(contestant) {
  const publicPercent = (contestant.publicVotePercent) || 0;
  const judgePercent = (contestant.judgeScorePercent) || 0;
  return Number((publicPercent * 0.4 + judgePercent * 0.6).toFixed(1));
}

export default function FinalResult() {
  const [contestantsData, setContestantsData] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");
  const [printing, setPrinting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  // Fetch leaderboard data on component mount
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching final leaderboard...');
        
        const response = await judgeApi.getFinalLeaderboard();
        
        console.log('✅ API Response object:', {
          hasResponse: !!response,
          hasData: !!response?.data,
          hasLeaderboard: !!response?.data?.leaderboard,
          leaderboardLength: response?.data?.leaderboard?.length || 'N/A'
        });
        
        let leaderboardArray = [];
        
        if (response && response.data && Array.isArray(response.data.leaderboard)) {
          console.log('📊 Using response.data.leaderboard with', response.data.leaderboard.length, 'items');
          leaderboardArray = response.data.leaderboard;
        } else if (response && Array.isArray(response.leaderboard)) {
          console.log('📊 Using response.leaderboard with', response.leaderboard.length, 'items');
          leaderboardArray = response.leaderboard;
        } else if (Array.isArray(response)) {
          console.log('📊 Response itself is array with', response.length, 'items');
          leaderboardArray = response;
        } else {
          console.warn('⚠️ Could not find leaderboard in response');
          console.warn('Response structure:', JSON.stringify(response).substring(0, 200));
          leaderboardArray = [];
        }
        
        console.log('✅ Final leaderboard array:', leaderboardArray.length, 'contestants');
        
        if (!Array.isArray(leaderboardArray)) {
          throw new Error('Leaderboard is not an array: ' + typeof leaderboardArray);
        }
        
        setContestantsData(leaderboardArray);
        
      } catch (err) {
        console.error('❌ Error fetching final results:', err);
        console.error('❌ Full error:', err);
        setError(err.message || 'Failed to load results');
        setContestantsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const categories = useMemo(() => {
    if (!contestantsData || !Array.isArray(contestantsData) || contestantsData.length === 0) {
      return ["All"];
    }
    try {
      const cats = ["All", ...new Set(contestantsData.map((c) => c?.category).filter(Boolean))];
      console.log('📁 Categories:', cats);
      return cats;
    } catch (e) {
      console.error('❌ Error building categories:', e);
      return ["All"];
    }
  }, [contestantsData]);

  const filtered = useMemo(() =>
    contestantsData.filter((c) => {
      const s = search.toLowerCase();
      return (
        (c.name.toLowerCase().includes(s) || c.category.toLowerCase().includes(s)) &&
        (category === "All" || c.category === category)
      );
    }), [search, category, contestantsData]);

  const ranked = useMemo(() => {
    try {
      console.log('🔄 Recalculating ranked from filtered:', filtered.length, 'items');
      
      if (!filtered || !Array.isArray(filtered)) {
        console.warn('⚠️ Filtered is not an array:', typeof filtered);
        return [];
      }
      
      const result = [...filtered]
        .map((c) => {
          if (!c) {
            console.warn('⚠️ Null contestant in list');
            return null;
          }
          
          // Safely parse criteria - handle both string and object formats
          let criteria = {
            creativity: 0,
            presentation: 0,
            skillLevel: 0,
            audienceImpact: 0,
          };
          
          if (c.criteria) {
            if (typeof c.criteria === 'object') {
              criteria = c.criteria;
            } else if (typeof c.criteria === 'string') {
              // Try to parse if it's a JSON string
              try {
                criteria = JSON.parse(c.criteria);
              } catch (e) {
                console.warn('⚠️ Could not parse criteria string:', c.criteria);
              }
            }
          }
          
          return {
            ...c,
            weightedScore: c.weightedScore || calculateWeighted(c),
            publicPercent: c.publicVotePercent || 0,
            judgePercent: c.judgeScorePercent || 0,
            judgeScore: c.averageJudgeScore || 0,
            maxJudgeScore: c.maxJudgeScore || 100,
            publicVotes: c.publicVotes || 0,
            maxVotes: c.maxVotes || 100,
            creativity: criteria.creativity || 0,
            presentation: criteria.presentation || 0,
            skill: criteria.skillLevel || 0,
            audienceImpact: criteria.audienceImpact || 0,
            color: ["#f472b6", "#a78bfa", "#22d3ee", "#fb923c", "#4ade80", "#60a5fa", "#fbbf24", "#2dd4bf", "#f87171", "#818cf8"][Math.random() * 10 | 0],
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.weightedScore - a.weightedScore);
      
      console.log('✅ Ranked calculation complete:', result.length, 'items');
      return result;
    } catch (err) {
      console.error('❌ Error in ranked calculation:', err);
      return [];
    }
  }, [filtered]);

  const topThree = ranked && Array.isArray(ranked) ? ranked.slice(0, 3) : [];
  const totalVotes = ranked && Array.isArray(ranked) ? ranked.reduce((s, c) => s + (c?.publicVotes || 0), 0) : 0;
  const avgJudge = (ranked && Array.isArray(ranked) && ranked.length > 0)
    ? (ranked.reduce((s, c) => s + (c?.averageJudgeScore || 0), 0) / ranked.length).toFixed(1)
    : 0;

  const pieTotal = (ranked && Array.isArray(ranked)) ? ranked.slice(0, 6).reduce((s, c) => s + (c?.publicVotes || 0), 0) : 0;
  let cum = 0;
  const pieSegments = (ranked && Array.isArray(ranked)) ? ranked.slice(0, 6).map((c) => {
    const pct = pieTotal > 0 ? ((c?.publicVotes || 0) / pieTotal) * 100 : 0;
    const seg = { ...c, start: cum, percent: pct };
    cum += pct;
    return seg;
  }) : [];

  if (loading) {

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  const now = new Date();
  const reportDate = now.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const reportTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div ref={reportRef} style={{ fontFamily: "'Syne', sans-serif", minHeight: "100vh", background: "#07080f", color: "#f1f5f9" }}>
      {/* DEBUG PANEL */}
      <div style={{ 
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.9)',
        border: '1px solid #e879f9',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#f1f5f9',
        zIndex: 9999,
        maxWidth: '300px',
        maxHeight: '200px',
        overflow: 'auto',
        lineHeight: '1.4'
      }}>
        <div style={{ color: '#e879f9', fontWeight: 'bold', marginBottom: '5px' }}>DEBUG</div>
        <div>Loading: {loading.toString()}</div>
        <div>Has Error: {error ? '✓' : '✗'}</div>
        <div>Data Items: {contestantsData.length}</div>
        <div>Active Tab: {activeTab}</div>
        {error && <div style={{ color: '#ef4444', marginTop: '5px' }}>Error: {error}</div>}
      </div>

      <div className="shell">
        {/* HEADER */}
        <div className="header">
          <div>
            <div className="header-event">🎭 SLIIT's Got Talent 2026</div>
            <h1 className="header-title">Final Result Report</h1>
            <p className="header-sub">
              Competition end report with vote analysis, judge score analysis, final ranking,
              weighted scoring, and visual performance insights for all participants.
            </p>
            <div className="header-meta">
              <span className="pill pill-green"><span className="live-dot"></span>Results Finalized</span>
              <span className="pill pill-blue">📊 {ranked.length} Contestants</span>
              <span className="pill pill-purple">⚖️ 40% Public · 60% Judges</span>
            </div>
          </div>

          <div className="header-actions no-print">
            <button className="btn btn-primary" onClick={handlePrint}>
              🖨️ Print / Save PDF
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>
              ↻ Refresh
            </button>
            <div className="report-meta">
              Generated: {reportDate}<br />{reportTime}
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="toolbar no-print">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search contestant or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ minWidth: 180, paddingLeft: 14 }}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* TABS */}
        <div className="tabs no-print">
          {["overview", "charts", "criteria", "ranking"].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "overview" && "📋 Overview"}
              {tab === "charts" && "📊 Charts"}
              {tab === "criteria" && "🎯 Criteria"}
              {tab === "ranking" && "🏆 Full Ranking"}
            </button>
          ))}
        </div>

        {/* STATS */}
        <section className="stats-row fade-in">
          {[
            { icon: "🏆", label: "Top Score", value: ranked[0]?.weightedScore ?? "—", sub: `${ranked[0]?.name ?? ""} leads` },
            { icon: "🗳️", label: "Total Public Votes", value: totalVotes.toLocaleString(), sub: "Audience participation" },
            { icon: "⭐", label: "Avg Judge Score", value: `${avgJudge}/40`, sub: "Panel evaluation avg" },
            { icon: "👥", label: "Finalists", value: ranked.length, sub: "Competing participants" },
          ].map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </section>

        {/* OVERVIEW TAB */}
        {(activeTab === "overview" || printing) && (
          <>
            <section className="podium-section fade-in">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">🥇 Top 3 Podium</div>
                  <div className="card-sub">Final weighted score leaders</div>
                </div>
                <div className="card-body">
                  <div className="podium-stage">
                    {[topThree[1], topThree[0], topThree[2]].map((c, i) => {
                      if (!c) return <div key={i} />;
                      const realRank = i === 1 ? 0 : i === 0 ? 1 : 2;
                      return (
                        <div key={c.contestantId} className={`podium-card p${realRank + 1}`}>
                          {realRank === 0 && <span className="crown">👑</span>}
                          <span className="medal">{MEDAL[realRank]}</span>
                          <div className="p-name">{c.name}</div>
                          <div className="p-cat">{c.category}</div>
                          <div className="p-score" style={{ color: RANK_COLORS[realRank] }}>
                            {c.weightedScore}
                          </div>
                          <div className="p-details">
                            Votes: {c.publicVotes}/{c.maxVotes}<br />
                            Judge: {c.judgeScore}/{c.maxJudgeScore}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">📌 Summary</div>
                  <div className="card-sub">Key result highlights</div>
                </div>
                <div className="card-body">
                  <div className="summary-grid">
                    <div className="sum-box">
                      <div className="sum-label">Winner</div>
                      <div className="sum-val">{ranked[0]?.weightedScore}</div>
                      <div className="sum-desc">{ranked[0]?.name} — {ranked[0]?.category}</div>
                    </div>
                    <div className="sum-box">
                      <div className="sum-label">Best Judge Mark</div>
                      <div className="sum-val">{Math.max(...ranked.map((c) => c.judgeScore))}/40</div>
                      <div className="sum-desc">Highest panel evaluation</div>
                    </div>
                    <div className="sum-box">
                      <div className="sum-label">Most Votes</div>
                      <div className="sum-val">{Math.max(...ranked.map((c) => c.publicVotes))}</div>
                      <div className="sum-desc">Peak audience support</div>
                    </div>
                    <div className="sum-box">
                      <div className="sum-label">Score Model</div>
                      <div className="sum-val">40/60</div>
                      <div className="sum-desc">Public 40% · Judge 60%</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* CHARTS TAB */}
        {(activeTab === "charts" || printing) && (
          <section className="charts-row fade-in">
            {/* Vote Bar */}
            <div className="chart-card">
              <div className="chart-title">📊 Public Votes</div>
              <div className="chart-sub">Top 5 by audience votes</div>
              <div className="bars">
                {ranked.slice(0, 5).map((c) => (
                  <div className="bar-col" key={c.contestantId}>
                    <div className="bar-num">{c.publicVotes}</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${c.publicPercent}%`,
                          background: `linear-gradient(180deg, ${c.color}, ${c.color}88)`,
                        }}
                      />
                    </div>
                    <div className="bar-name">{c.name.split(" ")[0]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Donut */}
            <div className="chart-card">
              <div className="chart-title">🍩 Vote Distribution</div>
              <div className="chart-sub">Top 6 share</div>
              <div className="pie-container">
                <div
                  className="donut"
                  style={{
                    background: `conic-gradient(${pieSegments.map((s) =>
                      `${s.color} ${s.start}% ${s.start + s.percent}%`).join(", ")})`,
                  }}
                >
                  <div className="donut-hole">Vote<br />Share</div>
                </div>
                <div className="legend-list">
                  {pieSegments.map((s) => (
                    <div className="legend-row" key={s.id}>
                      <span className="legend-dot" style={{ background: s.color }} />
                      <span className="legend-name">{s.name.split(" ")[0]}</span>
                      <span className="legend-pct">{s.percent.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trend Sparklines */}
            <div className="chart-card">
              <div className="chart-title">📈 Voting Trends</div>
              <div className="chart-sub">Progress over rounds</div>
              <div className="trend-list">
                {ranked.slice(0, 4).map((c) => (
                  <div className="trend-row" key={c.contestantId}>
                    <div className="trend-info">
                      <div>
                        <div className="trend-name">{c.name}</div>
                        <div className="trend-cat">{c.category}</div>
                      </div>
                      <div className="trend-score">{c.weightedScore}</div>
                    </div>
                    <div className="spark">
                      {/* Generate trend visualization from current data */}
                      {[c.publicVotePercent, c.judgeScorePercent, c.weightedScore * 2.5, Math.round((c.publicVotes / 50)), Math.round((c.averageJudgeScore / 2))].map((v, i) => (
                        <div
                          key={i}
                          className="spark-bar"
                          style={{
                            height: `${(v / 100) * 40}px`,
                            background: `linear-gradient(180deg, ${c.color}, ${c.color}55)`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Judge Bars */}
            <div className="chart-card">
              <div className="chart-title">⭐ Judge Scores</div>
              <div className="chart-sub">Panel evaluation top 5</div>
              <div className="bars">
                {ranked.slice(0, 5).map((c) => (
                  <div className="bar-col" key={c.contestantId}>
                    <div className="bar-num">{c.averageJudgeScore}</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${c.judgePercent}%`,
                          background: "linear-gradient(180deg, #38bdf8, #3b82f6)",
                        }}
                      />
                    </div>
                    <div className="bar-name">{c.name.split(" ")[0]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weighted Bars */}
            <div className="chart-card">
              <div className="chart-title">🏆 Final Weighted Score</div>
              <div className="chart-sub">Combined score top 5</div>
              <div className="bars">
                {ranked.slice(0, 5).map((c) => (
                  <div className="bar-col" key={c.contestantId}>
                    <div className="bar-num">{c.weightedScore}</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${c.weightedScore}%`,
                          background: "linear-gradient(180deg, #e879f9, #a855f7)",
                        }}
                      />
                    </div>
                    <div className="bar-name">{c.name.split(" ")[0]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Votes vs Judge Scatter-like */}
            <div className="chart-card">
              <div className="chart-title">🔀 Votes vs Judge</div>
              <div className="chart-sub">Comparison all contestants</div>
              <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                {ranked.slice(0, 6).map((c) => (
                  <div key={c.contestantId} style={{ fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, color: "#cbd5e1" }}>
                      <span style={{ fontWeight: 700 }}>{c.name.split(" ")[0]}</span>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", color: c.color }}>{c.weightedScore}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <div style={{ flex: c.publicPercent, height: 6, borderRadius: 4, background: c.color + "aa" }} />
                      <div style={{ flex: 100 - c.publicPercent, height: 6, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                      <div style={{ flex: c.judgePercent, height: 6, borderRadius: 4, background: "#38bdf8aa" }} />
                      <div style={{ flex: 100 - c.judgePercent, height: 6, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 2, fontSize: 10, color: "#64748b" }}>
                      <span>Public {c.publicPercent}%</span>
                      <span>Judge {c.judgePercent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CRITERIA TAB */}
        {(activeTab === "criteria" || printing) && (
          <section className="criteria-section fade-in">
            {ranked.slice(0, 8).map((c) => (
              <div key={c.contestantId} className="criteria-row">
                <div className="criteria-top">
                  <span>{c.name} <span style={{ fontWeight: 400, color: "#64748b", fontSize: 12 }}>({c.category})</span></span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", color: c.color }}>{c.averageJudgeScore}/40</span>
                </div>
                <div className="criteria-bars">
                  {[
                    { label: "C", value: c.creativity, color: "#e879f9" },
                    { label: "P", value: c.presentation, color: "#38bdf8" },
                    { label: "S", value: c.skill, color: "#4ade80" },
                    { label: "A", value: c.audienceImpact, color: "#fb923c" },
                  ].map((cr) => (
                    <div className="c-bar-wrap" key={cr.label}>
                      <div
                        className="c-bar-fill"
                        style={{
                          height: `${(cr.value / 10) * 45}px`,
                          background: `linear-gradient(180deg, ${cr.color}, ${cr.color}55)`,
                        }}
                      />
                      <div className="c-bar-label">{cr.label}{cr.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 6 }}>
                  C=Creativity · P=Presentation · S=Skill · A=Audience Impact
                </div>
              </div>
            ))}
          </section>
        )}

        {/* RANKING TABLE */}
        {(activeTab === "ranking" || activeTab === "overview" || printing) && (
          <div className="table-wrap fade-in">
            <div className="table-controls">
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>🏆 Full Ranking Report</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                  Final weighted score — 40% public votes + 60% judge marks
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>
                {ranked.length} contestants · Generated {reportDate}
              </div>
            </div>

            <div className="t-head">
              <div>Rank</div>
              <div>Contestant</div>
              <div>Public Votes</div>
              <div>Judge Score</div>
              <div>Final Score</div>
              <div>Category</div>
              <div>Progress</div>
            </div>

            {ranked.map((c, i) => (
              <div
                className={`t-row ${i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : ""}`}
                key={c.contestantId}
              >
                <div>
                  <div className="rank-num" style={i < 3 ? { color: RANK_COLORS[i], borderColor: RANK_COLORS[i] + "44" } : {}}>
                    {i < 3 ? MEDAL[i] : i + 1}
                  </div>
                </div>

                <div>
                  <div className="c-name">{c.name}</div>
                  <div className="c-sub">Public {c.publicPercent}% · Judge {c.judgePercent}%</div>
                </div>

                <div>
                  <div className="score-big">{c.publicVotes}</div>
                  <div className="score-sub">/ {c.maxVotes} votes</div>
                </div>

                <div>
                  <div className="score-big">{c.averageJudgeScore}</div>
                  <div className="score-sub">/ {c.maxJudgeScore} pts</div>
                </div>

                <div>
                  <div className="score-big" style={{ color: c.color }}>{c.weightedScore}</div>
                  <div className="score-sub">weighted final</div>
                </div>

                <div>
                  <span className="cat-badge">{c.category}</span>
                </div>

                <div className="progress-cell">
                  <div className="progress-labels">
                    <span>0</span>
                    <span>{c.weightedScore}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${c.weightedScore}%` }} />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 14, background: "rgba(232,121,249,0.05)", border: "1px solid rgba(232,121,249,0.12)", fontSize: 12, color: "#94a3b8", lineHeight: 1.8 }}>
              <strong style={{ color: "#f1f5f9" }}>Scoring Methodology:</strong> Final weighted score = (Public Votes / Max Votes × 100) × 0.40 + (Judge Score / Max Judge Score × 100) × 0.60. All scores are normalized to a 100-point scale for fair comparison across categories.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
