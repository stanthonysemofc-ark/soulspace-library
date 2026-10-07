import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ── Curated rotating fallback pool (7 entries, one per weekday slot) ──────
function getCuratedReading(dateStr: string) {
  const d = new Date(dateStr)
  const dayOfWeek = d.getUTCDay()
  const weekOfYear = Math.floor(
    (d.getTime() - new Date(Date.UTC(d.getUTCFullYear(), 0, 1)).getTime()) / 604800000
  )
  const idx = (dayOfWeek + weekOfYear) % 7

  const pool = [
    {
      season: 'Ordinary Time',
      gospel_citation: 'Matthew 5:1-12',
      gospel_title: 'The Beatitudes',
      gospel_text: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they shall be comforted. Blessed are the meek, for they shall inherit the earth. Blessed are those who hunger and thirst for righteousness, for they shall be satisfied. Blessed are the merciful, for they shall receive mercy. Blessed are the pure in heart, for they shall see God. Blessed are the peacemakers, for they shall be called sons of God. Blessed are those who are persecuted for righteousness\' sake, for theirs is the kingdom of heaven.',
      first_citation: 'Zephaniah 2:3; 3:12-13',
      first_text: 'Seek the LORD, all you humble of the land, who do his just commands; seek righteousness; seek humility. For I will leave in your midst a people humble and lowly. They shall seek refuge in the name of the LORD.',
      psalm_citation: 'Psalm 146:6-10',
      psalm_response: 'Blessed are the poor in spirit; the kingdom of heaven is theirs.',
      psalm_text: 'The LORD keeps faith forever, secures justice for the oppressed, gives food to the hungry. The LORD sets captives free; the LORD gives sight to the blind.',
    },
    {
      season: 'Ordinary Time',
      gospel_citation: 'John 15:9-17',
      gospel_title: 'Love One Another',
      gospel_text: 'As the Father has loved me, so have I loved you. Abide in my love. If you keep my commandments, you will abide in my love. This is my commandment, that you love one another as I have loved you. Greater love has no one than this, that someone lay down his life for his friends.',
      first_citation: '1 John 4:7-10',
      first_text: 'Beloved, let us love one another, for love is from God, and whoever loves has been born of God and knows God. In this the love of God was made manifest among us, that God sent his only Son into the world, so that we might live through him.',
      psalm_citation: 'Psalm 72:1-8',
      psalm_response: 'Lord, every nation on earth will adore you.',
      psalm_text: 'O God, give your judgment to the king; your justice to the son of kings. With justice he will govern your people; your poor with right judgment.',
    },
    {
      season: 'Ordinary Time',
      gospel_citation: 'Luke 11:1-4',
      gospel_title: 'The Lord\'s Prayer',
      gospel_text: 'Jesus was praying in a certain place, and when he had finished, one of his disciples said to him, "Lord, teach us to pray, as John taught his disciples." He said to them, "When you pray, say: Father, hallowed be your name, your kingdom come. Give us each day our daily bread and forgive us our sins for we ourselves forgive everyone in debt to us, and do not subject us to the final test."',
      first_citation: 'Genesis 18:20-32',
      first_text: 'Abraham drew near to the LORD and said: "Will you sweep away the innocent with the guilty? Suppose there were fifty innocent people in the city; would you wipe out the place, rather than spare it for the sake of the fifty innocent people within it?"',
      psalm_citation: 'Psalm 138:1-8',
      psalm_response: 'Lord, on the day I called for help, you answered me.',
      psalm_text: 'I will give thanks to you, O LORD, with all my heart, for you have heard the words of my mouth; in the presence of the angels I will sing your praise.',
    },
    {
      season: 'Ordinary Time',
      gospel_citation: 'Mark 12:28-34',
      gospel_title: 'The Greatest Commandment',
      gospel_text: 'One of the scribes asked Jesus, "Which commandment is the first of all?" Jesus answered, "The first is: You shall love the Lord your God with all your heart and with all your soul and with all your mind and with all your strength. The second is this: You shall love your neighbour as yourself. There is no other commandment greater than these."',
      first_citation: 'Deuteronomy 6:2-6',
      first_text: 'Moses spoke to the people, saying: "Fear the LORD, your God, and keep all his statutes and commandments. Hear, O Israel! The LORD is our God, the LORD alone! Therefore, you shall love the LORD, your God, with your whole heart, and with your whole being, and with your whole strength."',
      psalm_citation: 'Psalm 18:2-4, 47, 51',
      psalm_response: 'I love you, Lord, my strength.',
      psalm_text: 'I love you, LORD, my strength. LORD, my rock, my fortress, my deliverer. Praised be the LORD, I exclaim! I am safe from my enemies.',
    },
    {
      season: 'Ordinary Time',
      gospel_citation: 'Luke 24:13-35',
      gospel_title: 'The Road to Emmaus',
      gospel_text: 'That very day, the first day of the week, two of Jesus\' disciples were going to a village seven miles from Jerusalem called Emmaus, conversing about all the things that had occurred. Jesus himself drew near and walked with them, but their eyes were prevented from recognizing him.',
      first_citation: 'Acts 2:14, 22-33',
      first_text: 'Peter stood up with the Eleven and proclaimed: "Jesus the Nazarene was a man commended to you by God with mighty deeds, wonders, and signs, which God worked through him in your midst, as you yourselves know."',
      psalm_citation: 'Psalm 16:1-11',
      psalm_response: 'Lord, you will show us the path of life.',
      psalm_text: 'Keep me, O God, for in you I take refuge. I bless the LORD who counsels me; even in the night my heart exhorts me. I keep the LORD always before me.',
    },
    {
      season: 'Ordinary Time',
      gospel_citation: 'Matthew 14:22-33',
      gospel_title: 'Jesus Walks on Water',
      gospel_text: 'Jesus made the disciples get into a boat while he dismissed the crowds. He went up on the mountain by himself to pray. Meanwhile the boat, already a few miles offshore, was being tossed about by the waves, for the wind was against it. During the fourth watch of the night, he came toward them walking on the sea.',
      first_citation: '1 Kings 19:9-13',
      first_text: 'At the mountain of God, Horeb, Elijah came to a cave where he took shelter. A strong and heavy wind was rending the mountains — but the LORD was not in the wind. After the wind there was an earthquake — but the LORD was not in the earthquake. After the earthquake there was fire — but the LORD was not in the fire. After the fire there was a tiny whispering sound.',
      psalm_citation: 'Psalm 85:9-14',
      psalm_response: 'Lord, let us see your kindness, and grant us your salvation.',
      psalm_text: 'Near indeed is his salvation to those who fear him, glory dwelling in our land. Kindness and truth shall meet; justice and peace shall kiss.',
    },
    {
      season: 'Ordinary Time',
      gospel_citation: 'John 6:51-58',
      gospel_title: 'The Bread of Life',
      gospel_text: 'Jesus said to the crowds: "I am the living bread that came down from heaven; whoever eats this bread will live forever; and the bread that I will give is my flesh for the life of the world." Whoever eats my flesh and drinks my blood has eternal life, and I will raise him on the last day. For my flesh is true food, and my blood is true drink.',
      first_citation: 'Proverbs 9:1-6',
      first_text: 'Wisdom has built her house, she has set up her seven columns; she has spread her table. She calls from the heights: "Let whoever is simple turn in here; come, eat of my food, and drink of the wine I have mixed!"',
      psalm_citation: 'Psalm 34:2-3, 10-15',
      psalm_response: 'Taste and see the goodness of the Lord.',
      psalm_text: 'I will bless the LORD at all times; his praise shall be ever in my mouth. Let my soul glory in the LORD; the lowly will hear me and be glad.',
    },
  ]

  const e = pool[idx]
  const label = d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  })
  return { ...e, date_label: label }
}

// ── Fetch live readings from a public source ──────────────────────────────
async function fetchLiveReadings(dateStr: string) {
  // Try Universalis (reliable, structured JSON for today)
  const [year, month, day] = dateStr.split('-')
  const url = `https://universalis.com/${year}${month}${day}/jsonpmass.json`

  const ctrl = new AbortController()
  const tid = setTimeout(() => ctrl.abort(), 10000)

  try {
    const res = await fetch(url, { signal: ctrl.signal })
    clearTimeout(tid)
    if (!res.ok) return null

    const data = await res.json()
    // Universalis wraps readings in Mass.reading1, Mass.gospel etc.
    const mass = data?.Mass
    if (!mass) return null

    const gospel = mass.gospel
    const reading1 = mass.reading1
    const psalm = mass.psalm

    if (!gospel?.text) return null

    return {
      season: data.day?.season || 'Ordinary Time',
      gospel_citation: gospel.ref || '',
      gospel_title: gospel.heading || 'Holy Gospel',
      gospel_text: (gospel.text || '').replace(/<[^>]+>/g, '').trim(),
      first_citation: reading1?.ref || '',
      first_text: (reading1?.text || '').replace(/<[^>]+>/g, '').trim(),
      psalm_citation: psalm?.ref || '',
      psalm_response: (psalm?.response || '').replace(/<[^>]+>/g, '').trim(),
      psalm_text: (psalm?.text || '').replace(/<[^>]+>/g, '').trim(),
    }
  } catch {
    clearTimeout(tid)
    return null
  }
}

// ── Main handler ───────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  const todayUTC = new Date().toISOString().slice(0, 10) // e.g. "2026-10-07"

  // 1. Check if we already cached today
  const { data: existing } = await supabase
    .from('daily_readings')
    .select('*')
    .eq('date', todayUTC)
    .maybeSingle()

  if (existing) {
    return Response.json({ source: 'cache', data: existing }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }

  // 2. Fetch live
  let payload = await fetchLiveReadings(todayUTC)
  let source = 'live'

  // 3. Fall back to curated pool
  if (!payload) {
    payload = getCuratedReading(todayUTC)
    source = 'curated'
  }

  const row = {
    date: todayUTC,
    date_label: payload.date_label ?? new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }),
    ...payload,
    fetched_at: new Date().toISOString(),
  }

  // 4. Cache to Supabase
  const { error } = await supabase
    .from('daily_readings')
    .upsert(row, { onConflict: 'date' })

  if (error) {
    return Response.json({ error: error.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  return Response.json({ source, data: row }, {
    headers: { 'Access-Control-Allow-Origin': '*' }
  })
})
