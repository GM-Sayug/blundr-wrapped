import Head from 'next/head';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

   function shareToX() {
    const text = `I played ${stats.games} games on Lichess in 2024 and reached a peak rating of ${stats.rating}! Check your #BlundrWrapped here:`;
    const url = "https://blundr-wrapped.vercel.app"; // We will change this to your real URL later
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }
  async function fetchLichessData() {
    if (!username) return alert("Enter a username!");
    setLoading(true);
    
    try {
      // We are fetching the user's profile from Lichess
      const res = await fetch(`https://lichess.org/api/user/${username}`);
      const data = await res.json();
      
      if (data.error) throw new Error("User not found");

      // Creating our "Wrapped" data object
      setStats({
        games: data.count.all,
        winRate: Math.round((data.perfs.blitz?.rating || 0) / 10), // Just a placeholder for demo
        rating: data.perfs.blitz?.rating || "N/A",
        winCount: data.count.win,
        lossCount: data.count.loss
      });
    } catch (err) {
      alert("Could not find that player on Lichess!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden selection:bg-red-500">
      <Head>
        <title>Blundr Wrapped | {username || '2024'}</title>
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {!stats ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-7xl md:text-9xl font-black mb-6 tracking-tighter">
              BLUNDR <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">WRAPPED</span>
            </h1>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <input 
                type="text" 
                placeholder="Lichess Username"
                className="bg-[#18181b] border-2 border-zinc-800 px-6 py-4 rounded-full text-xl focus:border-red-500 outline-none transition-all w-full md:w-80"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <button 
                onClick={fetchLichessData}
                disabled={loading}
                className="bg-white text-black px-10 py-4 rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Go"}
              </button>
            </div>
          </motion.div>
        ) : (
          /* --- THE WRAPPED RESULTS --- */
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-4xl"
          >
            <h2 className="text-4xl font-black mb-12 uppercase tracking-widest text-red-500">
              {username}'s 2024 Legend
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Total Games Played" value={stats.games} desc="Every single one was a masterpiece... or a disaster." accent="text-white" />
              <StatCard title="Peak Blitz Rating" value={stats.rating} desc="The highest heights before the inevitable tilt." accent="text-orange-500" />
              <StatCard title="Total Victories" value={stats.winCount} desc="You actually won some! Well done." accent="text-green-500" />
              <StatCard title="Total Losses" value={stats.lossCount} desc="These are just 'learning opportunities'." accent="text-red-500" />
            </div>
            <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={shareToX}
            className="mt-8 bg-[#1DA1F2] text-white px-10 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 mx-auto"
            >
  Share on X
</motion.button>
            <button 
              onClick={() => setStats(null)}
              className="mt-12 text-zinc-500 hover:text-white transition-colors"
            >
              ← Search another player
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, desc, accent }) {
  return (
    <div className="bg-[#18181b] border border-zinc-800 p-8 rounded-[2rem] text-left">
      <h3 className="text-zinc-500 font-bold mb-2 uppercase text-[10px] tracking-[0.2em]">{title}</h3>
      <div className={`text-5xl font-black mb-2 ${accent}`}>{value}</div>
      <p className="text-zinc-400 text-sm">{desc}</p>
    </div>
  );
}