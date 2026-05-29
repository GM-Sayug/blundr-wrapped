import Head from 'next/head';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState('lichess');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  function shareToX() {
    const text = `I played ${stats.games} games on ${stats.platform} and reached a peak rating of ${stats.rating}! Check your #BlundrWrapped:`;
    const url = "https://blundr-wrapped-ey4m.vercel.app"; 
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }

  async function fetchLichessData(user) {
    const userRes = await fetch(`https://lichess.org/api/user/${user}`);
    const userData = await userRes.json();
    
    if (userData.error) throw new Error("Not found on Lichess");

    const totalSeconds = userData.playTime?.total || 0;
    const totalHours = Math.round(totalSeconds / 3600);

    const perfs = userData.perfs || {};
    let favoriteMode = "blitz";
    let highestRating = 0;
    Object.keys(perfs).forEach(mode => {
      if (perfs[mode].rating > highestRating && perfs[mode].games > 5) {
        highestRating = perfs[mode].rating;
        favoriteMode = mode;
      }
    });

    const totalGames = userData.count.all || 1;
    const winRate = Math.round((userData.count.win / totalGames) * 100);

    return {
      platform: "Lichess",
      games: userData.count.all,
      wins: userData.count.win,
      losses: userData.count.loss,
      draws: userData.count.draw,
      winRate: winRate,
      rating: highestRating || "Unrated",
      favoriteMode: favoriteMode.charAt(0).toUpperCase() + favoriteMode.slice(1),
      hoursPlayed: totalHours,
      createdYear: new Date(userData.createdAt).getFullYear(),
      title: userData.title || null,
    };
  }

  async function fetchChessComData(user) {
    // Fetch profile
    const profileRes = await fetch(`https://api.chess.com/pub/player/${user.toLowerCase()}`);
    if (!profileRes.ok) throw new Error("Not found on Chess.com");
    const profileData = await profileRes.json();

    // Fetch stats
    const statsRes = await fetch(`https://api.chess.com/pub/player/${user.toLowerCase()}/stats`);
    const statsData = await statsRes.json();

    // Find highest rating across modes
    let highestRating = 0;
    let favoriteMode = "Blitz";
    let totalGames = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let totalDraws = 0;

    const modes = {
      'chess_blitz': 'Blitz',
      'chess_rapid': 'Rapid',
      'chess_bullet': 'Bullet',
      'chess_daily': 'Daily'
    };

    Object.keys(modes).forEach(key => {
      const mode = statsData[key];
      if (mode) {
        if (mode.last?.rating > highestRating) {
          highestRating = mode.last.rating;
          favoriteMode = modes[key];
        }
        const record = mode.record || {};
        totalWins += record.win || 0;
        totalLosses += record.loss || 0;
        totalDraws += record.draw || 0;
      }
    });

    totalGames = totalWins + totalLosses + totalDraws;
    const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

    return {
      platform: "Chess.com",
      games: totalGames,
      wins: totalWins,
      losses: totalLosses,
      draws: totalDraws,
      winRate: winRate,
      rating: highestRating || "Unrated",
      favoriteMode: favoriteMode,
      hoursPlayed: Math.round(totalGames * 0.1), // Rough estimate
      createdYear: profileData.joined ? new Date(profileData.joined * 1000).getFullYear() : "?",
      title: profileData.title || null,
    };
  }

  async function fetchData() {
    if (!username) return alert("Enter a username!");
    setLoading(true);
    
    try {
      let data;
      if (platform === 'lichess') {
        try {
          data = await fetchLichessData(username);
        } catch {
          // Auto-fallback to Chess.com
          alert("Not found on Lichess, trying Chess.com...");
          data = await fetchChessComData(username);
        }
      } else {
        try {
          data = await fetchChessComData(username);
        } catch {
          // Auto-fallback to Lichess
          alert("Not found on Chess.com, trying Lichess...");
          data = await fetchLichessData(username);
        }
      }
      setStats(data);
    } catch (err) {
      alert("Could not find that player on either platform!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden selection:bg-red-500">
      <Head>
        <title>Blundr Wrapped | {username || '2024'}</title>
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center py-20">
        {!stats ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-red-500 font-mono tracking-[0.3em] uppercase mb-4 text-sm font-bold"
            >
              Your Year in Mistakes
            </motion.p>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-7xl md:text-9xl font-black mb-6 tracking-tighter leading-none"
            >
              BLUNDR <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                WRAPPED
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="max-w-md mx-auto text-zinc-400 mb-10 text-lg leading-relaxed"
            >
              Because anyone can find a brilliancy, but it takes a special kind of talent to hang a Queen in 3 moves.
            </motion.p>

            {/* Platform Toggle */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="inline-flex bg-[#18181b] border border-zinc-800 rounded-full p-1 mb-6"
            >
              <button
                onClick={() => setPlatform('lichess')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
                  platform === 'lichess' 
                    ? 'bg-white text-black' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Lichess
              </button>
              <button
                onClick={() => setPlatform('chesscom')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
                  platform === 'chesscom' 
                    ? 'bg-white text-black' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Chess.com
              </button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col md:flex-row gap-4 justify-center items-center"
            >
              <input 
                type="text" 
                placeholder={`${platform === 'lichess' ? 'Lichess' : 'Chess.com'} Username`}
                className="bg-[#18181b] border-2 border-zinc-800 px-6 py-4 rounded-full text-xl focus:border-red-500 outline-none transition-all w-full md:w-80"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              />
              <button 
                onClick={fetchData}
                disabled={loading}
                className="bg-white text-black px-10 py-4 rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Analyzing..." : "Generate"}
              </button>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="text-zinc-600 text-xs mt-6"
            >
              We&apos;ll auto-search the other platform if not found 🔄
            </motion.p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-6xl"
          >
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 font-mono tracking-[0.3em] uppercase mb-4 text-sm font-bold"
            >
              {stats.platform} • Blundr Wrapped
            </motion.p>
            
            <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter">
              {stats.title && <span className="text-yellow-500">{stats.title} </span>}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                {username}
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard index={0} title="Total Games" value={stats.games.toLocaleString()} desc={`On ${stats.platform} since ${stats.createdYear}.`} accent="text-white" />
              <StatCard index={1} title="Peak Rating" value={stats.rating} desc={`Weapon of choice: ${stats.favoriteMode}`} accent="text-yellow-500" />
              <StatCard index={2} title="Hours Played" value={`${stats.hoursPlayed}h`} desc="Staring at 64 squares like a champion." accent="text-orange-500" />
              <StatCard index={3} title="Victories" value={stats.wins.toLocaleString()} desc="Moments of pure brilliance ✨" accent="text-green-500" />
              <StatCard index={4} title="Defeats" value={stats.losses.toLocaleString()} desc="Character building experiences." accent="text-red-500" />
              <StatCard index={5} title="Win Rate" value={`${stats.winRate}%`} desc={stats.winRate >= 50 ? "You're actually good 👀" : "Room for growth!"} accent="text-blue-500" />
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareToX}
              className="mt-12 bg-[#1DA1F2] text-white px-10 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </motion.button>

            <button 
              onClick={() => { setStats(null); setUsername(''); }}
              className="mt-6 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              ← Search another player
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, desc, accent, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index || 0) * 0.1 }}
      whileHover={{ y: -8 }}
      className="bg-[#18181b] border border-zinc-800 p-8 rounded-[2rem] text-left hover:border-zinc-600 transition-colors"
    >
      <h3 className="text-zinc-500 font-bold mb-3 uppercase text-[10px] tracking-[0.2em]">{title}</h3>
      <div className={`text-5xl font-black mb-3 tracking-tight ${accent}`}>{value}</div>
      <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}