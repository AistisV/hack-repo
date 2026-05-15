import React, { useState, useEffect } from 'react';

export default function Screen_FreeTier({ url, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modifiedHtml, setModifiedHtml] = useState('');
  const [activeTab, setActiveTab] = useState('visibility');

  const changes = [
    {
      id: 'h1',
      tab: 'visibility',
      title: "Semantic H1 Optimization",
      description: "Injected high-intent keywords into your main headline to ensure AI crawlers immediately identify your core value proposition.",
      logic: "AI models prioritize the <h1> tag for entity classification."
    },
    {
      id: 'schema',
      tab: 'schema',
      title: "JSON-LD Entity Graph",
      description: "Injected Schema.org markup that defines your company as a 'SoftwareApplication'.",
      logic: "Structured data is the primary source for Google AI (SGE)."
    }
  ];

  useEffect(() => {
    const fetchAndModify = async () => {
      try {
        setLoading(true);
        setError(null);

        let targetUrl = url.trim();
        if (!targetUrl) throw new Error("Empty URL");
        if (!/^https?:\/\//i.test(targetUrl)) targetUrl = 'https://' + targetUrl;

        const proxies = [
          `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
          `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
        ];

        const fetchHTML = async (proxyUrl) => {
          const res = await fetch(proxyUrl);
          if (!res.ok) throw new Error(`Proxy failed`);
          return await res.text();
        };

        let rawHtml = await Promise.any(proxies.map(p => fetchHTML(p)));
        
        // --- High-res Wix Image Upgrade ---
        rawHtml = rawHtml.replace(/w_\d+,h_\d+,al_c,q_80,usm_0.66_1.00_0.01,blur_2/g, 'w_1920,h_1080,al_c,q_90');

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');

        // Magic Base Tag
        const base = doc.createElement('base');
        base.href = targetUrl;
        doc.head.insertBefore(base, doc.head.firstChild);

        // Anti-Frame-Busting & Reveal Trigger
        const antiBust = doc.createElement('script');
        antiBust.textContent = `
          window.onbeforeunload = function() { return false; };
          Object.defineProperty(window, 'top', { get: function() { return window; } });
          Object.defineProperty(window, 'parent', { get: function() { return window; } });
          
          // Force reveal logic: Find everything hidden and show it
          const forceShow = () => {
             document.querySelectorAll('*').forEach(el => {
                const s = el.getAttribute('style') || '';
                if (s.includes('opacity: 0') || s.includes('visibility: hidden')) {
                   // Only force if it looks like content (has text or is an image)
                   if (el.innerText.trim().length > 0 || el.tagName === 'IMG' || el.tagName === 'SVG') {
                      el.style.opacity = '1';
                      el.style.visibility = 'visible';
                      el.style.transform = 'none';
                   }
                }
             });
          };
          window.addEventListener('load', () => {
             setTimeout(forceShow, 500);
             setTimeout(forceShow, 2000); // Second pass for late Wix loads
          });
        `;
        doc.head.insertBefore(antiBust, doc.head.firstChild);

        const style = doc.createElement('style');
        style.textContent = `
          /* Force core containers */
          #site-root, #SITE_CONTAINER, .site-root {
            opacity: 1 !important;
            visibility: visible !important;
            display: block !important;
          }

          /* Hide known intrusive overlays only */
          #WIX_ADS, .wix-ads, #SITE_LOADER, [id*="preloader"] {
            display: none !important;
          }

          ::-webkit-scrollbar { display: none; }
        `;
        doc.head.appendChild(style);

        setModifiedHtml(doc.documentElement.outerHTML);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAndModify();
  }, [url]);

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', background: '#0a0907', overflow: 'hidden' }}>
      
      {/* Background Mirror Site (Full Screen, No Scaling) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, color: '#f4efe6' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(255,42,50,0.1)', borderTopColor: '#ff2a32', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: '#544e46' }}>ESTABLISHING LIVE MIRROR...</div>
          </div>
        ) : error ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
             <div style={{ maxWidth: 420, padding: 40, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,42,50,0.3)', borderRadius: 24, color: '#f4efe6', textAlign: 'center', backdropFilter: 'blur(20px)' }}>
                <h3 style={{ fontSize: 24, fontFamily: "'DM Serif Display', serif", marginBottom: 12 }}>Connection Lost</h3>
                <p style={{ fontSize: 14, color: '#8a8378', lineHeight: 1.6, marginBottom: 24 }}>{error}</p>
                <button onClick={() => window.location.reload()} style={{ background: '#ff2a32', color: '#fff', border: 0, padding: '14px 28px', borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}>RETRY</button>
             </div>
          </div>
        ) : (
          <iframe 
            key={url}
            srcDoc={modifiedHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Mirror Site"
            sandbox="allow-same-origin allow-scripts allow-popups"
          />
        )}
      </div>

      {/* Floating Sidebar */}
      <div style={{ 
        position: 'absolute', 
        top: 24, 
        left: 24, 
        bottom: 24, 
        width: 380, 
        zIndex: 10, 
        background: 'rgba(10,9,7,0.85)', 
        backdropFilter: 'blur(32px) saturate(180%)',
        border: '1px solid rgba(244,239,230,0.08)', 
        borderRadius: 24, 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        color: '#f4efe6'
      }}>
        
        <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(244,239,230,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(244,239,230,0.1)', borderRadius: 8, width: 32, height: 32, color: '#cdc6ba', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>←</button>
            <img src="/logo.svg" alt="Visibly" style={{ height: 24, width: 'auto' }} />
          </div>
          <div style={{ fontSize: 10, fontFamily: "'Geist Mono', monospace", color: '#ff2a32', background: 'rgba(255,42,50,0.1)', padding: '4px 8px', borderRadius: 999 }}>LIVE</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 28px' }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, fontWeight: 400, margin: '0 0 10px', color: '#f4efe6', lineHeight: 1.1 }}>
              Optimizing <em style={{ color: '#ff2a32', fontStyle: 'italic' }}>{url}</em>
            </h2>
            <p style={{ fontSize: 14, color: '#8a8378', lineHeight: 1.6, margin: 0 }}>
              Live audit environment. All animations and assets active.
            </p>
          </div>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, marginBottom: 28, border: '1px solid rgba(244,239,230,0.06)' }}>
            {[ { id: 'visibility', label: 'Visibility' }, { id: 'schema', label: 'Schema' } ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '8px 0', border: 0, borderRadius: 8, cursor: 'pointer',
                  fontSize: 11, fontWeight: 500, fontFamily: "'Geist Mono', monospace",
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: activeTab === tab.id ? '#f4efe6' : '#544e46',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {changes.filter(c => c.tab === activeTab).map((change, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,42,50,0.15)', borderRadius: 16, padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f4efe6', marginBottom: 6 }}>{change.title}</h3>
                <p style={{ fontSize: 12, lineHeight: 1.4, color: '#8a8378', marginBottom: 10 }}>{change.description}</p>
                <div style={{ padding: '10px', background: 'rgba(255,42,50,0.04)', borderRadius: 8, fontSize: 10, color: '#544e46' }}>
                  <strong style={{ color: '#8a8378' }}>LOGIC:</strong> {change.logic}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px 28px', borderTop: '1px solid rgba(244,239,230,0.08)' }}>
          <button onClick={onBack} style={{ width: '100%', height: 48, borderRadius: 999, background: '#f4efe6', color: '#100e0b', fontSize: 14, fontWeight: 600, border: 0, cursor: 'pointer' }}>
            Run Full Premium Scan
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
    </div>
  );
}
