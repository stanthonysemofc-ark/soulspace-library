import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── Curated rotating fallback (client-side safety net) ────────────────────
function getCuratedFallback() {
  const today = new Date()
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const idx = (today.getDay() + Math.floor(today.getTime() / 604800000)) % 7

  const pool = [
    {
      season: 'Ordinary Time',
      gospel: { citation: 'Matthew 5:1-12', title: 'The Beatitudes', text: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they shall be comforted. Blessed are the meek, for they shall inherit the earth. Blessed are those who hunger and thirst for righteousness, for they shall be satisfied. Blessed are the merciful, for they shall receive mercy. Blessed are the pure in heart, for they shall see God. Blessed are the peacemakers, for they shall be called sons of God.' },
      firstReading: { citation: 'Zephaniah 2:3; 3:12-13', text: 'Seek the LORD, all you humble of the land, who do his just commands; seek righteousness; seek humility. For I will leave in your midst a people humble and lowly. They shall seek refuge in the name of the LORD.' },
      psalm: { citation: 'Psalm 146:6-10', response: 'Blessed are the poor in spirit; the kingdom of heaven is theirs.', text: 'The LORD keeps faith forever, secures justice for the oppressed, gives food to the hungry. The LORD sets captives free; the LORD gives sight to the blind.' },
    },
    {
      season: 'Ordinary Time',
      gospel: { citation: 'John 15:9-17', title: 'Love One Another', text: 'As the Father has loved me, so have I loved you. Abide in my love. If you keep my commandments, you will abide in my love. This is my commandment, that you love one another as I have loved you. Greater love has no one than this, that someone lay down his life for his friends.' },
      firstReading: { citation: '1 John 4:7-10', text: 'Beloved, let us love one another, for love is from God, and whoever loves has been born of God and knows God. In this the love of God was made manifest among us, that God sent his only Son into the world, so that we might live through him.' },
      psalm: { citation: 'Psalm 72:1-8', response: 'Lord, every nation on earth will adore you.', text: 'O God, give your judgment to the king; your justice to the son of kings. With justice he will govern your people; your poor with right judgment.' },
    },
    {
      season: 'Ordinary Time',
      gospel: { citation: 'Luke 11:1-4', title: "The Lord's Prayer", text: 'Jesus was praying in a certain place, and when he had finished, one of his disciples said to him, "Lord, teach us to pray." He said to them, "When you pray, say: Father, hallowed be your name, your kingdom come. Give us each day our daily bread and forgive us our sins, for we ourselves forgive everyone in debt to us, and do not subject us to the final test."' },
      firstReading: { citation: 'Genesis 18:20-32', text: 'Abraham drew near to the LORD and said: "Will you sweep away the innocent with the guilty? Suppose there were fifty innocent people in the city; would you wipe out the place, rather than spare it for the sake of the fifty innocent people within it?"' },
      psalm: { citation: 'Psalm 138:1-8', response: 'Lord, on the day I called for help, you answered me.', text: 'I will give thanks to you, O LORD, with all my heart, for you have heard the words of my mouth; in the presence of the angels I will sing your praise.' },
    },
    {
      season: 'Ordinary Time',
      gospel: { citation: 'Mark 12:28-34', title: 'The Greatest Commandment', text: 'One of the scribes asked Jesus, "Which commandment is the first of all?" Jesus answered, "The first is: You shall love the Lord your God with all your heart and with all your soul and with all your mind and with all your strength. The second is: You shall love your neighbour as yourself. There is no other commandment greater than these."' },
      firstReading: { citation: 'Deuteronomy 6:2-6', text: 'Moses spoke to the people, saying: "Hear, O Israel! The LORD is our God, the LORD alone! Therefore, you shall love the LORD, your God, with your whole heart, and with your whole being, and with your whole strength."' },
      psalm: { citation: 'Psalm 18:2-4, 47, 51', response: 'I love you, Lord, my strength.', text: 'I love you, LORD, my strength. LORD, my rock, my fortress, my deliverer. Praised be the LORD, I exclaim! I am safe from my enemies.' },
    },
    {
      season: 'Ordinary Time',
      gospel: { citation: 'Luke 24:13-35', title: 'The Road to Emmaus', text: "That very day, two of Jesus' disciples were going to a village seven miles from Jerusalem called Emmaus, conversing about all the things that had occurred. Jesus himself drew near and walked with them, but their eyes were prevented from recognizing him." },
      firstReading: { citation: 'Acts 2:14, 22-33', text: 'Peter stood up with the Eleven and proclaimed: "Jesus the Nazarene was a man commended to you by God with mighty deeds, wonders, and signs, which God worked through him in your midst."' },
      psalm: { citation: 'Psalm 16:1-11', response: 'Lord, you will show us the path of life.', text: 'Keep me, O God, for in you I take refuge. I bless the LORD who counsels me; even in the night my heart exhorts me. I keep the LORD always before me.' },
    },
    {
      season: 'Ordinary Time',
      gospel: { citation: 'Matthew 14:22-33', title: 'Jesus Walks on Water', text: 'Jesus made the disciples get into a boat while he dismissed the crowds. He went up on the mountain by himself to pray. During the fourth watch of the night, he came toward them walking on the sea. The disciples were terrified and cried out in fear. Jesus immediately said to them, "Take courage, it is I; do not be afraid."' },
      firstReading: { citation: '1 Kings 19:9-13', text: 'At the mountain of God, Horeb, Elijah came to a cave. A strong wind rending the mountains — but the LORD was not in the wind. After the wind an earthquake — but the LORD was not in the earthquake. After the earthquake fire — but the LORD was not in the fire. After the fire there was a tiny whispering sound.' },
      psalm: { citation: 'Psalm 85:9-14', response: 'Lord, let us see your kindness, and grant us your salvation.', text: 'Near indeed is his salvation to those who fear him, glory dwelling in our land. Kindness and truth shall meet; justice and peace shall kiss.' },
    },
    {
      season: 'Ordinary Time',
      gospel: { citation: 'John 6:51-58', title: 'The Bread of Life', text: 'Jesus said to the crowds: "I am the living bread that came down from heaven; whoever eats this bread will live forever; and the bread that I will give is my flesh for the life of the world." Whoever eats my flesh and drinks my blood has eternal life, and I will raise him on the last day. For my flesh is true food, and my blood is true drink.' },
      firstReading: { citation: 'Proverbs 9:1-6', text: 'Wisdom has built her house, she has set up her seven columns; she has spread her table. She calls from the heights: "Let whoever is simple turn in here; come, eat of my food, and drink of the wine I have mixed!"' },
      psalm: { citation: 'Psalm 34:2-3, 10-15', response: 'Taste and see the goodness of the Lord.', text: 'I will bless the LORD at all times; his praise shall be ever in my mouth. Let my soul glory in the LORD; the lowly will hear me and be glad.' },
    },
  ]

  return { dateFormatted, ...pool[idx] }
}

// ── Map a Supabase DB row → component shape ───────────────────────────────
function rowToReadings(row) {
  const dateFormatted = row.date_label ||
    new Date(row.date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })

  return {
    dateFormatted,
    season: row.season || 'Ordinary Time',
    gospel: {
      citation: row.gospel_citation || '',
      title: row.gospel_title || 'Holy Gospel',
      text: row.gospel_text || '',
    },
    firstReading: {
      citation: row.first_citation || '',
      text: row.first_text || '',
    },
    psalm: {
      citation: row.psalm_citation || '',
      response: row.psalm_response || '',
      text: row.psalm_text || '',
    },
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useDailyReadings() {
  const [readings, setReadings] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load(manual = false) {
    if (manual) setLoading(true)

    const todayISO = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"

    // ── Step 1: Query Supabase cache ───────────────────────────────────
    try {
      const { data: cached } = await supabase
        .from('daily_readings')
        .select('*')
        .eq('date', todayISO)
        .maybeSingle()

      if (cached) {
        setReadings(rowToReadings(cached))
        setLoading(false)
        return
      }
    } catch (dbErr) {
      console.warn('[DailyReadings] Supabase query failed:', dbErr)
    }

    // ── Step 2: Call Edge Function to fetch + cache ────────────────────
    try {
      const ctrl = new AbortController()
      const tid = setTimeout(() => ctrl.abort(), 12000)

      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/daily-readings`
      const res = await fetch(fnUrl, {
        method: 'GET',
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        signal: ctrl.signal,
      })
      clearTimeout(tid)

      if (res.ok) {
        const json = await res.json()
        if (json?.data) {
          setReadings(rowToReadings(json.data))
          setLoading(false)
          return
        }
      }
    } catch (fnErr) {
      console.warn('[DailyReadings] Edge Function call failed, using curated fallback:', fnErr?.message || fnErr)
    }

    // ── Step 3: Curated fallback — always works ────────────────────────
    setReadings(getCuratedFallback())
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  return { readings, loading, refetch: () => load(true) }
}
