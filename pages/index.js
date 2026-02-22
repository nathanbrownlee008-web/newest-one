import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [bets, setBets] = useState([])

  async function fetchBets() {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setBets(data)
  }

  async function addSampleBet() {
    const { error } = await supabase
      .from('bets')
      .insert([
        {
          match: 'Arsenal vs Chelsea',
          market: 'Over 2.5 Goals',
          odds: 1.85,
          stake: 10,
          result: 'pending',
          bet_date: new Date().toISOString()
        }
      ])

    if (!error) fetchBets()
    else alert(error.message)
  }

  useEffect(() => {
    fetchBets()
  }, [])

  return (
    <div style={{
      background: '#0b1a33',
      minHeight: '100vh',
      color: 'white',
      padding: '40px',
      fontFamily: 'Arial'
    }}>
      <h1 style={{ fontSize: '40px' }}>Top Daily Tips</h1>

      <button
        onClick={addSampleBet}
        style={{
          background: '#22c55e',
          border: 'none',
          padding: '15px 30px',
          fontSize: '18px',
          color: 'white',
          borderRadius: '10px',
          cursor: 'pointer',
          marginBottom: '30px'
        }}
      >
        Add Sample Bet
      </button>

      <div>
        {bets.map((bet) => (
          <div key={bet.id} style={{
            background: '#132a4f',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            <strong>{bet.match}</strong><br/>
            {bet.market} | Odds: {bet.odds} | Stake: {bet.stake} | {bet.result}
          </div>
        ))}
      </div>
    </div>
  )
}
