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
import "../styles/global.css";

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

  let totalProfit = 0;
  let wins = 0;
  let losses = 0;

  const bankrollData = bets.map((bet, i) => {
    totalProfit += Number(bet.profit || 0);
    if (bet.result === "won") wins++;
    if (bet.result === "lost") losses++;
    return { name: i + 1, bankroll: startingBankroll + totalProfit };
  });

  const winRate =
    wins + losses === 0 ? 0 : ((wins / (wins + losses)) * 100).toFixed(1);

  const totalStaked = bets.reduce((a, b) => a + Number(b.stake || 0), 0);
  const roi =
    totalStaked === 0 ? 0 : ((totalProfit / totalStaked) * 100).toFixed(1);

  return (
    <div className="container">
      <div className="header">
        <div className="title">Bet Analytics Dashboard</div>
        <div className="subtitle">Professional Performance Overview</div>
      </div>

      <div className="stats">
        <div className="card">
          <div>Bankroll</div>
          <h2>£{startingBankroll + totalProfit}</h2>
        </div>
        <div className="card">
          <div>Total Profit</div>
          <h2 className={totalProfit >= 0 ? "green" : "red"}>
            £{totalProfit}
          </h2>
        </div>
        <div className="card">
          <div>Win Rate</div>
          <h2>{winRate}%</h2>
        </div>
        <div className="card">
          <div>ROI</div>
          <h2>{roi}%</h2>
        </div>
      </div>

      <div className="chart">
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

      <div className="table">
        {bets.map((bet) => (
          <div key={bet.id} className="table-row">
            <div>{bet.match}</div>
            <div>{bet.odds}</div>
            <div>£{bet.stake}</div>
            <div>£{bet.profit || 0}</div>
            <div>
              <span className={`badge badge-${bet.result}`}>
                {bet.result}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
