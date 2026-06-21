import { useState } from 'react'
import { useProfile } from '../../context/ProfileContext'
import Avatar from '../../components/Avatar'

// ─── Mock data ─────────────────────────────────────────────────────────────────

const ATHLETES = {
  2: { id: 2, firstName: 'Taylor', lastName: 'Rodriguez', location: 'Boulder, CO', ftp: 322 },
  3: { id: 3, firstName: 'Sarah',  lastName: 'Chen',      location: 'San Francisco, CA', ftp: 285 },
  4: { id: 4, firstName: 'Marcus', lastName: 'Webb',      location: 'Portland, OR', ftp: 347 },
  5: { id: 5, firstName: 'Emma',   lastName: 'Patel',     location: 'Denver, CO', ftp: 301 },
  6: { id: 6, firstName: 'James',  lastName: 'Okafor',    location: 'Austin, TX', ftp: 389 },
}

const INITIAL_FEED = [
  {
    id: 1,
    athleteId: 2,
    source: 'garmin',
    type: 'Ride',
    title: 'Morning Base Miles',
    postedAt: '2h ago',
    distance: 68.4,
    duration: '2:32:14',
    elevation: 842,
    avgPower: 198,
    normalizedPower: 214,
    tss: 142,
    intensityFactor: 0.66,
    avgHR: 142,
    likes: 14,
    liked: false,
    route: {
      path: 'M35,130 C55,122 78,110 100,96 C122,82 142,70 162,58 C180,48 195,40 208,36 C222,32 234,34 246,40 C258,46 266,56 274,66 C284,78 296,90 312,100 C328,110 346,116 365,118',
      startX: 35, startY: 130, endX: 365, endY: 118,
    },
    comments: [
      { id: 1, athleteId: 3, text: 'Solid Z2 block! Those canyon climbs never get easier.', postedAt: '1h ago' },
      { id: 2, athleteId: 4, text: 'Nice NP for a base ride 💪', postedAt: '45m ago' },
    ],
  },
  {
    id: 2,
    athleteId: 4,
    source: 'garmin',
    type: 'Ride',
    title: '4×8 Threshold Intervals',
    postedAt: '4h ago',
    distance: 42.1,
    duration: '1:18:33',
    elevation: 310,
    avgPower: 261,
    normalizedPower: 298,
    tss: 98,
    intensityFactor: 0.86,
    avgHR: 168,
    likes: 31,
    liked: true,
    route: {
      path: 'M25,88 C55,85 85,82 115,80 C140,79 165,79 190,79 C215,79 240,80 265,80 C290,80 315,82 340,83 C355,83 370,83 375,83',
      startX: 25, startY: 88, endX: 375, endY: 83,
    },
    comments: [
      { id: 3, athleteId: 2, text: 'That IF though 🔥 what zone 4 target?', postedAt: '3h ago' },
    ],
  },
  {
    id: 3,
    athleteId: 6,
    source: 'garmin',
    type: 'Ride',
    title: 'Tuesday Night Worlds',
    postedAt: '6h ago',
    distance: 55.2,
    duration: '1:52:07',
    elevation: 520,
    avgPower: 234,
    normalizedPower: 271,
    tss: 119,
    intensityFactor: 0.70,
    avgHR: 158,
    likes: 47,
    liked: false,
    route: {
      path: 'M200,22 C228,18 262,26 290,46 C316,64 330,88 325,112 C320,132 305,143 280,146 C255,149 228,143 207,133 C185,123 163,110 145,96 C127,82 117,65 122,48 C128,32 148,21 170,18 C183,16 194,19 200,22',
      startX: 200, startY: 22, endX: 200, endY: 22,
    },
    comments: [
      { id: 4, athleteId: 5, text: 'I got dropped on that last sprint haha', postedAt: '5h ago' },
      { id: 5, athleteId: 2, text: 'Should have been there! Next week for sure', postedAt: '4h ago' },
      { id: 6, athleteId: 6, text: 'We\'ll hold your wheel 😂', postedAt: '3h ago' },
    ],
  },
  {
    id: 4,
    athleteId: 3,
    source: 'garmin',
    type: 'Ride',
    title: 'Recovery Spin — Easy Day',
    postedAt: '1d ago',
    distance: 28.6,
    duration: '1:05:40',
    elevation: 180,
    avgPower: 134,
    normalizedPower: 141,
    tss: 40,
    intensityFactor: 0.49,
    avgHR: 118,
    likes: 8,
    liked: false,
    route: {
      path: 'M60,86 C85,84 110,83 138,83 C160,83 182,83 205,83 C228,83 250,84 272,83 C292,83 312,84 335,84 C348,84 358,84 360,84',
      startX: 60, startY: 86, endX: 360, endY: 84,
    },
    comments: [],
  },
]

const SUGGESTED = [
  { id: 5, ...ATHLETES[5] },
  { id: 6, ...ATHLETES[6] },
]

// ─── Route map ─────────────────────────────────────────────────────────────────

function RouteMap({ route }) {
  if (!route) return null
  const isLoop = Math.abs(route.startX - route.endX) < 8 && Math.abs(route.startY - route.endY) < 8

  return (
    <div className="w-full rounded-xl overflow-hidden" style={{ height: 152 }}>
      <svg width="100%" height="152" viewBox="0 0 400 152"
        preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>

        {/* Land base */}
        <rect x="0" y="0" width="400" height="152" fill="#E8E2D4" />

        {/* Park / green areas */}
        <rect x="0"   y="0"   width="115" height="86" fill="#C6DBA6" opacity="0.55" />
        <rect x="165" y="96"  width="95"  height="56" fill="#C6DBA6" opacity="0.45" />
        <rect x="310" y="20"  width="90"  height="70" fill="#C6DBA6" opacity="0.40" />

        {/* Water */}
        <rect x="295" y="100" width="105" height="52" fill="#AECDE0" opacity="0.60" />

        {/* City block fills */}
        <rect x="120" y="10" width="40" height="33" rx="1" fill="#DDD8CC" opacity="0.55" />
        <rect x="170" y="10" width="50" height="28" rx="1" fill="#DDD8CC" opacity="0.50" />
        <rect x="122" y="52" width="33" height="38" rx="1" fill="#DDD8CC" opacity="0.48" />
        <rect x="240" y="52" width="45" height="33" rx="1" fill="#DDD8CC" opacity="0.48" />

        {/* Minor road grid */}
        <g stroke="#CEC8BA" strokeWidth="0.8" fill="none">
          <line x1="0"   y1="48"  x2="400" y2="48"  />
          <line x1="0"   y1="100" x2="400" y2="100" />
          <line x1="78"  y1="0"   x2="78"  y2="152" />
          <line x1="160" y1="0"   x2="160" y2="152" />
          <line x1="242" y1="0"   x2="242" y2="152" />
          <line x1="322" y1="0"   x2="322" y2="152" />
        </g>

        {/* Major roads */}
        <g stroke="#BEB8AA" strokeWidth="2" fill="none">
          <line x1="0"   y1="74" x2="400" y2="74"  />
          <line x1="200" y1="0"  x2="200" y2="152" />
        </g>

        {/* Route white halo */}
        <path d={route.path} stroke="white" strokeWidth="6" fill="none"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
        {/* Route line */}
        <path d={route.path} stroke="#00C896" strokeWidth="3.5" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Start pin */}
        <circle cx={route.startX} cy={route.startY} r="7" fill="white" />
        <circle cx={route.startX} cy={route.startY} r="4.5" fill="#00C896" />

        {/* End pin — only show if not a loop */}
        {!isLoop && (
          <>
            <circle cx={route.endX} cy={route.endY} r="7" fill="white" />
            <circle cx={route.endX} cy={route.endY} r="4.5" fill="#0A1628" />
          </>
        )}
      </svg>
    </div>
  )
}

// ─── Stat cell ─────────────────────────────────────────────────────────────────

function StatCell({ label, value, unit }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 px-1">
      <span className="section-title" style={{ fontSize: 9 }}>{label}</span>
      <div className="flex items-baseline gap-0.5">
        <span className="data-value font-bold" style={{ fontSize: 18, color: 'var(--color-text)' }}>{value}</span>
        {unit && <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{unit}</span>}
      </div>
    </div>
  )
}

// ─── Comment row ───────────────────────────────────────────────────────────────

function CommentRow({ comment }) {
  const athlete = ATHLETES[comment.athleteId] ?? { firstName: comment.firstName, lastName: comment.lastName }
  if (!athlete?.firstName) return null
  return (
    <div className="flex items-start gap-2.5">
      <Avatar firstName={athlete.firstName} lastName={athlete.lastName} size={28} bgColor="#0A1628" />
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl px-3 py-2" style={{ backgroundColor: 'rgba(15,31,28,0.04)' }}>
          <span className="text-xs font-semibold">{athlete.firstName} {athlete.lastName}</span>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text)' }}>{comment.text}</p>
        </div>
        <span className="text-[10px] ml-3 mt-0.5 block" style={{ color: 'var(--color-text-muted)' }}>{comment.postedAt}</span>
      </div>
    </div>
  )
}

// ─── Activity card ─────────────────────────────────────────────────────────────

function ActivityCard({ post, following, onToggleFollow, onToggleLike, onAddComment }) {
  const athlete = ATHLETES[post.athleteId]
  const [showComments, setShowComments] = useState(post.comments.length > 0)
  const [commentText, setCommentText]   = useState('')

  if (!athlete) return null

  function submitComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    onAddComment(post.id, commentText.trim())
    setCommentText('')
  }

  return (
    <div className="card p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        <Avatar firstName={athlete.firstName} lastName={athlete.lastName} size={40} bgColor="#0A1628" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{athlete.firstName} {athlete.lastName}</span>
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {athlete.location} · {post.postedAt}
          </p>
        </div>
        <button
          onClick={() => onToggleFollow(athlete.id)}
          className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors shrink-0"
          style={following
            ? { backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)', border: 'var(--border)' }
            : { backgroundColor: 'var(--color-accent)', color: '#0A1628' }
          }
        >
          {following ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Title */}
      <div className="px-5 pb-3 flex items-center gap-2">
        <h3 className="font-semibold text-base">{post.title}</h3>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
          style={{ backgroundColor: 'rgba(0,200,150,0.10)', color: '#00A87E' }}>
          {post.type}
        </span>
      </div>

      {/* Route map */}
      <div className="px-5 pb-3">
        <RouteMap route={post.route} />
      </div>

      {/* Stats */}
      <div className="px-5 pb-1" style={{ borderTop: 'var(--border)', borderBottom: 'var(--border)' }}>
        <div className="grid grid-cols-6 gap-0 divide-x" style={{ '--tw-divide-opacity': 1 }}>
          <div style={{ borderRight: 'var(--border)' }}>
            <StatCell label="Distance" value={post.distance} unit="km" />
          </div>
          <div className="pl-3" style={{ borderRight: 'var(--border)' }}>
            <StatCell label="Time" value={post.duration} />
          </div>
          <div className="pl-3" style={{ borderRight: 'var(--border)' }}>
            <StatCell label="Elev" value={post.elevation} unit="m" />
          </div>
          <div className="pl-3" style={{ borderRight: 'var(--border)' }}>
            <StatCell label="Avg W" value={post.avgPower} unit="w" />
          </div>
          <div className="pl-3" style={{ borderRight: 'var(--border)' }}>
            <StatCell label="NP" value={post.normalizedPower} unit="w" />
          </div>
          <div className="pl-3">
            <StatCell label="TSS" value={post.tss} />
          </div>
        </div>
      </div>

      {/* Like / comment bar */}
      <div className="flex items-center gap-1 px-4 py-2.5">
        <button
          onClick={() => onToggleLike(post.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          style={post.liked
            ? { backgroundColor: 'rgba(232,85,85,0.08)', color: '#E85555' }
            : { backgroundColor: 'rgba(15,31,28,0.04)', color: 'var(--color-text-muted)' }
          }
        >
          <span style={{ fontSize: 13 }}>{post.liked ? '♥' : '♡'}</span>
          {post.likes}
        </button>
        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          style={{ backgroundColor: 'rgba(15,31,28,0.04)', color: 'var(--color-text-muted)' }}
        >
          <span style={{ fontSize: 13 }}>💬</span>
          {post.comments.length}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-5 pb-4 pt-1 space-y-3" style={{ borderTop: 'var(--border)' }}>
          {post.comments.map(c => <CommentRow key={c.id} comment={c} />)}

          {/* Add comment */}
          <form onSubmit={submitComment} className="flex items-center gap-2 mt-1">
            <Avatar firstName="Nick" lastName="Olsen" size={28} bgColor="#0A1628" />
            <div className="flex-1 flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)' }}>
              <input
                className="flex-1 text-xs outline-none bg-transparent"
                placeholder="Add a comment…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                style={{ color: 'var(--color-text)' }}
              />
              {commentText.trim() && (
                <button type="submit"
                  className="text-[11px] font-semibold shrink-0"
                  style={{ color: 'var(--color-accent)' }}>
                  Post
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

// ─── Suggested athlete card ────────────────────────────────────────────────────

function SuggestedAthlete({ athlete, following, onToggle }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar firstName={athlete.firstName} lastName={athlete.lastName} size={36} bgColor="#0A1628" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{athlete.firstName} {athlete.lastName}</p>
        <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>{athlete.location}</p>
      </div>
      <button
        onClick={() => onToggle(athlete.id)}
        className="text-xs font-medium px-3 py-1 rounded-full transition-colors shrink-0"
        style={following
          ? { backgroundColor: 'rgba(15,31,28,0.06)', color: 'var(--color-text-muted)', border: 'var(--border)' }
          : { backgroundColor: 'var(--color-accent)', color: '#0A1628' }
        }
      >
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

// ─── Main section ──────────────────────────────────────────────────────────────

export default function SocialSection() {
  const { profile } = useProfile()

  const [feed, setFeed]           = useState(INITIAL_FEED)
  const [following, setFollowing] = useState(new Set([2, 4, 6])) // athleteIds you follow

  function toggleFollow(athleteId) {
    setFollowing(prev => {
      const next = new Set(prev)
      next.has(athleteId) ? next.delete(athleteId) : next.add(athleteId)
      return next
    })
  }

  function toggleLike(postId) {
    setFeed(prev => prev.map(p =>
      p.id !== postId ? p : { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
    ))
  }

  function addComment(postId, text) {
    setFeed(prev => prev.map(p =>
      p.id !== postId ? p : {
        ...p,
        comments: [...p.comments, {
          id: Date.now(),
          athleteId: 'me',
          firstName: profile.firstName,
          lastName: profile.lastName,
          text,
          postedAt: 'just now',
        }],
      }
    ))
  }

  const suggestedAthletes = Object.values(ATHLETES).filter(a => !following.has(a.id))

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100%' }}>
      <div className="max-w-4xl mx-auto px-6 py-6 flex gap-6 items-start">

        {/* ── Feed ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Post your ride CTA */}
          <div className="card p-0 overflow-hidden">
            {/* Compose row */}
            <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: 'var(--border)' }}>
              <Avatar
                firstName={profile.firstName} lastName={profile.lastName}
                avatarUrl={profile.avatarUrl} size={40} bgColor="#0A1628"
              />
              <div className="flex-1 rounded-full px-4 py-2.5 cursor-pointer text-sm select-none"
                style={{ border: 'var(--border)', backgroundColor: 'rgba(15,31,28,0.03)', color: 'var(--color-text-muted)' }}>
                Share a ride or thought…
              </div>
            </div>
            {/* Garmin sync row */}
            <div className="flex items-center gap-3 px-5 py-3.5" style={{ backgroundColor: 'rgba(26,111,216,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg"
                style={{ backgroundColor: 'rgba(26,111,216,0.12)' }}>
                ⌚
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Garmin Connect</p>
                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Sync your latest activity to share with followers
                </p>
              </div>
              <button
                className="text-xs font-semibold px-4 py-2 rounded-full shrink-0 transition-opacity hover:opacity-85"
                style={{ backgroundColor: '#1B6FD8', color: '#fff' }}>
                Sync now
              </button>
            </div>
          </div>

          {/* Activity cards */}
          {feed.map(post => (
            <ActivityCard
              key={post.id}
              post={post}
              following={following.has(post.athleteId)}
              onToggleFollow={toggleFollow}
              onToggleLike={toggleLike}
              onAddComment={addComment}
            />
          ))}
        </div>

        {/* ── Sidebar ── */}
        <div className="w-64 shrink-0 space-y-4">

          {/* Your stats this week */}
          <div className="card px-4 py-4">
            <p className="section-title mb-3">Your week</p>
            <div className="space-y-2.5">
              {[
                { label: 'Rides',    value: '3' },
                { label: 'Distance', value: '142 km' },
                { label: 'TSS',      value: '318' },
                { label: 'Elevation', value: '2,840 m' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                  <span className="data-value text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested athletes */}
          {suggestedAthletes.length > 0 && (
            <div className="card px-4 py-4">
              <p className="section-title mb-3">Suggested Athletes</p>
              <div className="space-y-4">
                {suggestedAthletes.map(a => (
                  <SuggestedAthlete
                    key={a.id}
                    athlete={a}
                    following={following.has(a.id)}
                    onToggle={toggleFollow}
                  />
                ))}
              </div>
            </div>
          )}

          {/* People you follow */}
          <div className="card px-4 py-4">
            <p className="section-title mb-3">Following</p>
            <div className="space-y-4">
              {[...following].map(id => {
                const a = ATHLETES[id]
                if (!a) return null
                return (
                  <div key={id} className="flex items-center gap-2.5">
                    <Avatar firstName={a.firstName} lastName={a.lastName} size={30} bgColor="#0A1628" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{a.firstName} {a.lastName}</p>
                      <p className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>{a.location}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
