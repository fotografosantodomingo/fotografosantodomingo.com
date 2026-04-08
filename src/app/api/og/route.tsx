import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Fotógrafo Profesional'
  const subtitle = searchParams.get('subtitle') || 'Santo Domingo · República Dominicana'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c4a6e 100%)',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative circles */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.05)',
            top: '-150px',
            right: '-150px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.05)',
            bottom: '-100px',
            left: '-100px',
          }}
        />

        {/* Camera icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            fontSize: '40px',
          }}
        >
          📸
        </div>

        {/* Brand name */}
        <div
          style={{
            color: '#7dd3fc',
            fontSize: '20px',
            fontWeight: 400,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          BABULA SHOTS
        </div>

        {/* Main title */}
        <div
          style={{
            color: '#ffffff',
            fontSize: title.length > 30 ? '48px' : '56px',
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '900px',
            marginBottom: '20px',
          }}
        >
          {title}
        </div>

        {/* Subtitle / location */}
        <div
          style={{
            color: '#94a3b8',
            fontSize: '28px',
            textAlign: 'center',
          }}
        >
          {subtitle}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #0ea5e9 0%, #6366f1 50%, #0ea5e9 100%)',
          }}
        />

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '40px',
            color: '#475569',
            fontSize: '18px',
          }}
        >
          fotografosantodomingo.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
