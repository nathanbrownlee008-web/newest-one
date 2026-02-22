import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [bets, setBets] = useState([]);
  const startingBankroll = 1000;

  useEffect(() => {
    fetchBets();
  }, []);

  async function fetchBets() {
    const { data } = await supabase
      .from("bets")
      .select("*")
      .order("created_at", { ascending: true });

    setBets(data || []);
  }

  async function addSampleBet() {
    await supabase.from("bets").insert([
      {
        match: "Man City vs Liverpool",
        market: "Over 2.5 Goals",
        odds: 2.1,
        stake: 20,
        result: "pending",
        profit: 0,
        value_rating: 7.5,
        created_at: new Date().toISOString(),
      },
    ]);

    fetchBets();
  }

  let totalProfit = 0;
  let wins = 0;
  let losses = 0;

  const bankrollData = bets.map((bet, index) => {
    totalProfit += Number(bet.profit || 0);

    if (bet.result === "won") wins++;
    if (bet.result === "lost") losses++;

    return {
      name: index + 1,
      bankroll: startingBankroll + totalProfit,
    };
  });

  const winRate =
    wins + losses === 0 ? 0 : ((wins / (wins + losses)) * 100).toFixed(1);

  const totalStaked = bets.reduce(
    (acc, b) => acc + Number(b.stake || 0),
    0
  );

  const roi =
    totalStaked === 0 ? 0 : ((totalProfit / totalStaked) * 100).toFixed(1);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bet Analytics Dashboard</h1>

      <button style={styles.button} onClick={addSampleBet}>
        Add Sample Bet
      </button>

      <div style={styles.statsGrid}>
        <StatBox label="Bankroll" value={`£${startingBankroll + totalProfit}`} />
        <StatBox label="Total Profit" value={`£${totalProfit}`} />
        <StatBox label="Win Rate" value={`${winRate}%`} />
        <StatBox label="ROI" value={`${roi}%`} />
      </div>

      <div style={styles.chartCard}>
        <h3>Bankroll Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={bankrollData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="bankroll" stroke="#22c55e" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.history}>
        <h3>Bet History</h3>
        {bets.map((bet) => (
          <div key={bet.id} style={styles.betCard}>
            <strong>{bet.match}</strong>
            <p>
              {bet.market} | Odds: {bet.odds} | Stake: {bet.stake}
            </p>
            <p>
              Result: {bet.result} | Profit: £{bet.profit || 0}
            </p>
            {bet.value_rating && (
              <span style={styles.valueBadge}>
                Value {bet.value_rating}/10
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={styles.statBox}>
      <p>{label}</p>
      <h2>{value}</h2>
    </div>
  );
}

const styles = {
  container: {
    background: "#0b1a33",
    minHeight: "100vh",
    padding: "40px",
    color: "white",
  },
  title: {
    fontSize: "36px",
    marginBottom: "20px",
  },
  button: {
    background: "#22c55e",
    border: "none",
    padding: "15px 30px",
    borderRadius: "10px",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    marginBottom: "30px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statBox: {
    background: "#162447",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
  },
  chartCard: {
    background: "#162447",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "40px",
  },
  history: {
    marginTop: "20px",
  },
  betCard: {
    background: "#1f4068",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
  },
  valueBadge: {
    background: "#22c55e",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
  },
};
