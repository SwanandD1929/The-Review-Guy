import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { ChevronLeft, Swords, Award, CheckCircle, Vote } from 'lucide-react';

export default function MovieBattles() {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votedBattles, setVotedBattles] = useState({}); // mapping battleId -> movieIndex voted (1 or 2)

  // Fingerprint for duplicate voting prevention
  const fingerprint = localStorage.getItem('trg_fingerprint') || 'anon';

  const loadBattlesData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMovieBattles();
      setBattles(data || []);

      // Check which battles the user has already voted in
      const votedMap = {};
      data.forEach(b => {
        if (b.votes1 && b.votes1.includes(fingerprint)) {
          votedMap[b.id] = 1;
        } else if (b.votes2 && b.votes2.includes(fingerprint)) {
          votedMap[b.id] = 2;
        }
      });
      setVotedBattles(votedMap);
    } catch (e) {
      console.error("Failed to load battles:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBattlesData();
  }, []);

  const handleVote = async (battleId, movieIndex) => {
    try {
      await apiService.voteMovieBattle(battleId, movieIndex);
      // Reload battles and update voted states
      await loadBattlesData();
    } catch (e) {
      console.error("Failed to submit vote:", e);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const activeBattles = battles.filter(b => (!b.startDate || b.startDate <= today) && (!b.endDate || b.endDate >= today));
  const pastBattles = battles.filter(b => b.endDate && b.endDate < today);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-500 font-mono tracking-widest uppercase">Loading movie battles...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12 text-left">
        
        {/* Header */}
        <div className="border-b border-white/5 pb-6">
          <Link to="/" className="inline-flex items-center space-x-1 text-xs text-gray-400 hover:text-amber-400 transition-colors mb-3">
            <ChevronLeft className="h-3 w-3" />
            <span>Back to Discovery</span>
          </Link>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-wide flex items-center space-x-3 text-white">
            <Swords className="h-8 w-8 sm:h-10 sm:w-10 text-rose-500 animate-pulse" />
            <span>Movie <span className="italic text-rose-500">Battles</span></span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-400 font-light max-w-xl">
            Where epic cinema clashes! Cast your vote on weekly head-to-head match-ups and see real-time community statistics.
          </p>
        </div>

        {/* 1. Active Battles Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-serif text-white tracking-wide flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span>Active Head-To-Head Battles</span>
          </h2>

          {activeBattles.length === 0 ? (
            <div className="glass-card border border-white/5 rounded-3xl p-12 text-center text-gray-500">
              <Swords className="h-10 w-10 mx-auto text-gray-700 mb-3" />
              <p className="text-sm">No battles are currently active. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activeBattles.map((b) => {
                const hasVoted = votedBattles[b.id] !== undefined;
                const v1 = (b.votes1 || []).length;
                const v2 = (b.votes2 || []).length;
                const tot = v1 + v2;
                const p1 = tot > 0 ? Math.round((v1 / tot) * 100) : 50;
                const p2 = tot > 0 ? 100 - p1 : 50;

                return (
                  <div key={b.id} className="glass-card border border-rose-500/10 bg-gradient-to-b from-rose-950/5 via-black/80 to-black p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
                    
                    {/* Versus Cards Container */}
                    <div className="grid grid-cols-2 gap-6 relative">
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <span className="h-10 w-10 rounded-full bg-rose-500 border border-rose-400 text-black flex items-center justify-center font-black tracking-widest text-xs font-mono shadow-2xl scale-110">
                          VS
                        </span>
                      </div>

                      {/* Movie 1 Option */}
                      <div className="space-y-3 text-center flex flex-col items-center">
                        <Link to={`/movie/ext_${b.movie1.tmdb_id}`} className="block group">
                          <img
                            src={b.movie1.poster_url}
                            alt=""
                            className="w-28 sm:w-36 aspect-[2/3] object-cover rounded-2xl border border-white/5 group-hover:border-amber-500/40 transition-colors shadow-lg"
                          />
                          <h4 className="font-bold text-gray-200 mt-2 text-sm group-hover:text-white line-clamp-1">
                            {b.movie1.title}
                          </h4>
                        </Link>
                        {!hasVoted && (
                          <button
                            onClick={() => handleVote(b.id, 1)}
                            className="flex items-center space-x-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl transition-all text-[11px] cursor-pointer"
                          >
                            <Vote className="h-3.5 w-3.5" />
                            <span>Vote Left</span>
                          </button>
                        )}
                      </div>

                      {/* Movie 2 Option */}
                      <div className="space-y-3 text-center flex flex-col items-center">
                        <Link to={`/movie/ext_${b.movie2.tmdb_id}`} className="block group">
                          <img
                            src={b.movie2.poster_url}
                            alt=""
                            className="w-28 sm:w-36 aspect-[2/3] object-cover rounded-2xl border border-white/5 group-hover:border-sky-500/40 transition-colors shadow-lg"
                          />
                          <h4 className="font-bold text-gray-200 mt-2 text-sm group-hover:text-white line-clamp-1">
                            {b.movie2.title}
                          </h4>
                        </Link>
                        {!hasVoted && (
                          <button
                            onClick={() => handleVote(b.id, 2)}
                            className="flex items-center space-x-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-black font-extrabold rounded-xl transition-all text-[11px] cursor-pointer"
                          >
                            <Vote className="h-3.5 w-3.5" />
                            <span>Vote Right</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Vote Results (Visible if voted or ended) */}
                    {hasVoted && (
                      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-2 animate-fadeIn">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className={votedBattles[b.id] === 1 ? 'text-amber-400' : 'text-gray-300'}>
                            {b.movie1.title} {votedBattles[b.id] === 1 && ' (Voted)'}
                          </span>
                          <span className={votedBattles[b.id] === 2 ? 'text-sky-400' : 'text-gray-300'}>
                            {b.movie2.title} {votedBattles[b.id] === 2 && ' (Voted)'}
                          </span>
                        </div>

                        {/* Slider Progress */}
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex">
                          <div className="h-full bg-amber-500" style={{ width: `${p1}%` }} />
                          <div className="h-full bg-sky-500" style={{ width: `${p2}%` }} />
                        </div>
                        
                        <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                          <span>{p1}% ({v1} votes)</span>
                          <span>{tot} total votes</span>
                          <span>{p2}% ({v2} votes)</span>
                        </div>
                      </div>
                    )}

                    <div className="text-center text-[10px] text-gray-500 font-mono">
                      Battle active until: {b.endDate}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Past Battles Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-serif text-white tracking-wide flex items-center space-x-2">
            <Award className="h-5 w-5 text-amber-500" />
            <span>Completed Battles Archive</span>
          </h2>

          {pastBattles.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No past battles logged in history.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {pastBattles.map((b) => {
                const v1 = (b.votes1 || []).length;
                const v2 = (b.votes2 || []).length;
                const tot = v1 + v2;
                const p1 = tot > 0 ? Math.round((v1 / tot) * 100) : 50;
                const p2 = tot > 0 ? 100 - p1 : 50;
                const movie1Wins = v1 > v2;
                const isTie = v1 === v2;

                return (
                  <div key={b.id} className="glass-card border border-white/5 p-4 rounded-2xl text-center space-y-4">
                    <div className="flex items-center justify-center -space-x-3">
                      <div className="relative">
                        <img src={b.movie1.poster_url} className="w-12 h-16 object-cover rounded-lg border border-gray-900" alt="" />
                        {movie1Wins && !isTie && (
                          <div className="absolute -top-2 -left-2 bg-amber-400 text-black p-0.5 rounded-full z-10 shadow-lg">
                            <Award className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <img src={b.movie2.poster_url} className="w-12 h-16 object-cover rounded-lg border border-gray-900" alt="" />
                        {!movie1Wins && !isTie && (
                          <div className="absolute -top-2 -right-2 bg-amber-400 text-black p-0.5 rounded-full z-10 shadow-lg">
                            <Award className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-semibold">
                      <span className={movie1Wins ? 'text-amber-400 font-extrabold' : 'text-gray-400'}>{b.movie1.title}</span>
                      <span className="mx-1.5 text-gray-600">vs</span>
                      <span className={!movie1Wins ? 'text-sky-400 font-extrabold' : 'text-gray-400'}>{b.movie2.title}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                        <div className="h-full bg-amber-500" style={{ width: `${p1}%` }} />
                        <div className="h-full bg-sky-500" style={{ width: `${p2}%` }} />
                      </div>
                      <div className="flex justify-between text-[8px] text-gray-500 font-mono">
                        <span>{p1}%</span>
                        <span>{tot} votes</span>
                        <span>{p2}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
