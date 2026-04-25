"use client";
import React from 'react';

const css = `
@keyframes il-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes il-draw{from{stroke-dashoffset:400}to{stroke-dashoffset:0}}
@keyframes il-bar{from{transform:scaleY(0)}to{transform:scaleY(1)}}
`;

/*
  Website = we design & build professional company websites
  → Show a polished browser with a clean, well-structured website layout
*/
export function WebsiteIllustration({ accentColor = "var(--color-primary)" }) {
  const c = accentColor;
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <style>{css}</style>
      <svg viewBox="0 0 300 220" className="w-full h-full" preserveAspectRatio="xMidYMid meet"
        style={{animation:'il-float 6s ease-in-out infinite'}}>
        <defs>
          <linearGradient id="wh" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c} stopOpacity=".1"/><stop offset="100%" stopColor={c} stopOpacity=".02"/>
          </linearGradient>
        </defs>

        {/* Browser frame */}
        <rect x="5" y="5" width="290" height="210" rx="12" fill="var(--color-surface)" stroke={c} strokeWidth="1.2" strokeOpacity=".25"/>

        {/* Title bar */}
        <rect x="5" y="5" width="290" height="26" rx="12" fill={`${c}0a`}/>
        <rect x="5" y="19" width="290" height="12" fill={`${c}0a`}/>
        <circle cx="22" cy="18" r="3.5" fill="#ff5f57" opacity=".6"/>
        <circle cx="33" cy="18" r="3.5" fill="#ffbd2e" opacity=".6"/>
        <circle cx="44" cy="18" r="3.5" fill="#28c840" opacity=".6"/>
        <rect x="58" y="12" width="110" height="11" rx="5.5" fill="var(--color-background)" opacity=".25"/>

        {/* ── Website content inside browser ── */}

        {/* Navigation */}
        <rect x="18" y="40" width="24" height="5" rx="2.5" fill={c} opacity=".5"/>
        <rect x="230" y="40" width="46" height="9" rx="4.5" fill={c} opacity=".55"/>
        {[0,1,2].map(i=>(
          <rect key={i} x={54+i*28} y="41" width="18" height="4" rx="2" fill="var(--color-text)" opacity=".1"/>
        ))}

        {/* Hero section */}
        <rect x="18" y="56" width="264" height="58" rx="6" fill="url(#wh)"/>
        {/* Headline */}
        <rect x="30" y="66" width="110" height="7" rx="3" fill={c} opacity=".35"/>
        <rect x="30" y="78" width="80" height="5" rx="2" fill="var(--color-text)" opacity=".08"/>
        <rect x="30" y="86" width="60" height="4" rx="2" fill="var(--color-text)" opacity=".06"/>
        {/* Hero CTA */}
        <rect x="30" y="98" width="44" height="11" rx="5.5" fill={c} opacity=".6"/>
        {/* Hero image placeholder */}
        <rect x="200" y="62" width="74" height="48" rx="6" fill={`${c}08`} stroke={c} strokeWidth=".4" strokeOpacity=".12"/>
        <rect x="210" y="70" width="54" height="5" rx="2" fill={c} opacity=".12"/>
        <rect x="210" y="80" width="38" height="4" rx="2" fill="var(--color-text)" opacity=".05"/>
        <rect x="210" y="88" width="46" height="4" rx="2" fill="var(--color-text)" opacity=".04"/>
        <rect x="210" y="98" width="24" height="7" rx="3.5" fill={c} opacity=".2"/>

        {/* Feature cards row */}
        {[0,1,2].map(i=>(
          <g key={i} transform={`translate(${18+i*90},122)`}>
            <rect width="82" height="86" rx="6" fill={`${c}04`} stroke={c} strokeWidth=".4" strokeOpacity=".1"/>
            {/* Card icon */}
            <circle cx="20" cy="18" r="10" fill={`${c}0a`}/>
            <circle cx="20" cy="18" r="4" fill={c} opacity=".25"/>
            {/* Card title */}
            <rect x="8" y="36" width="48" height="5" rx="2" fill={c} opacity=".25"/>
            {/* Card body text */}
            <rect x="8" y="48" width="66" height="4" rx="2" fill="var(--color-text)" opacity=".07"/>
            <rect x="8" y="56" width="58" height="4" rx="2" fill="var(--color-text)" opacity=".05"/>
            <rect x="8" y="64" width="50" height="4" rx="2" fill="var(--color-text)" opacity=".04"/>
            {/* Card link */}
            <rect x="8" y="76" width="30" height="4" rx="2" fill={c} opacity=".2"/>
          </g>
        ))}
      </svg>
    </div>
  );
}

/*
  Management Systems = custom dashboards & admin panels for businesses
  → Show a clean dashboard with sidebar, KPIs, a chart, and a data table
*/
export function SystemIllustration({ accentColor = "var(--color-accent)" }) {
  const c = accentColor;
  const chartLine = "M10,78 C35,70 55,38 80,42 C105,46 125,28 148,22 C168,18 188,32 210,12";

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <style>{css}</style>
      <svg viewBox="0 0 300 220" className="w-full h-full" preserveAspectRatio="xMidYMid meet"
        style={{animation:'il-float 6s ease-in-out infinite'}}>
        <defs>
          <linearGradient id="sa" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c} stopOpacity=".18"/><stop offset="100%" stopColor={c} stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="sb" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={c} stopOpacity=".05"/><stop offset="100%" stopColor={c} stopOpacity=".5"/>
          </linearGradient>
        </defs>

        {/* Panel */}
        <rect x="5" y="5" width="290" height="210" rx="12" fill="var(--color-surface)" stroke={c} strokeWidth="1.2" strokeOpacity=".25"/>

        {/* Sidebar */}
        <rect x="5" y="5" width="50" height="210" rx="12" fill={`${c}06`}/>
        <rect x="47" y="5" width="8" height="210" fill={`${c}06`}/>
        <line x1="55" y1="5" x2="55" y2="215" stroke={c} opacity=".08"/>
        <rect x="14" y="16" width="28" height="7" rx="3.5" fill={c} opacity=".5"/>
        {[0,1,2,3,4].map(i=>(
          <g key={i} transform={`translate(12,${36+i*26})`}>
            <rect width="32" height="16" rx="4" fill={i===0?`${c}14`:'transparent'}/>
            <circle cx="8" cy="8" r="3.5" fill={c} opacity={i===0?'.55':'.15'}/>
            <rect x="15" y="5" width="12" height="3" rx="1.5" fill={c} opacity={i===0?'.35':'.08'}/>
          </g>
        ))}

        {/* KPI row */}
        <g transform="translate(66,12)">
          {[0,1,2].map(i=>(
            <g key={i} transform={`translate(${i*76},0)`}>
              <rect width="68" height="34" rx="6" fill={`${c}06`} stroke={c} strokeWidth=".3" strokeOpacity=".12"/>
              <rect x="8" y="7" width="24" height="4" rx="2" fill="var(--color-text)" opacity=".1"/>
              <rect x="8" y="15" width="34" height="7" rx="3" fill={c} opacity=".45"/>
              <rect x="8" y="26" width="20" height="4" rx="2" fill="#4ade80" opacity=".4"/>
            </g>
          ))}
        </g>

        {/* Chart — the one purposeful animation: line draws in */}
        <g transform="translate(66,54)">
          <rect width="222" height="96" rx="8" fill={`${c}03`} stroke={c} strokeWidth=".3" strokeOpacity=".1"/>
          {[24,48,72].map(y=>(
            <line key={y} x1="10" y1={y} x2="216" y2={y} stroke="var(--color-text)" opacity=".03"/>
          ))}
          <path d={`${chartLine} L210,82 L10,82 Z`} fill="url(#sa)"/>
          <path d={chartLine} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray="400" style={{animation:'il-draw 2.5s ease-out forwards'}}/>
          {[[80,42],[148,22],[210,12]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r="4" fill="var(--color-surface)" stroke={c} strokeWidth="1.8"/>
          ))}
        </g>

        {/* Data table — static, clean */}
        <g transform="translate(66,158)">
          <rect width="222" height="50" rx="6" fill={`${c}03`} stroke={c} strokeWidth=".3" strokeOpacity=".1"/>
          {/* Header row */}
          <rect x="0" y="0" width="222" height="14" rx="6" fill={`${c}06`}/>
          <rect x="0" y="8" width="222" height="6" fill={`${c}06`}/>
          {[0,1,2,3].map(i=>(
            <rect key={i} x={8+i*55} y="4" width="30" height="4" rx="2" fill={c} opacity=".2"/>
          ))}
          {/* Data rows */}
          {[0,1,2].map(row=>(
            <g key={row}>
              {row>0 && <line x1="8" y1={14+row*12} x2="214" y2={14+row*12} stroke="var(--color-text)" opacity=".03"/>}
              {[0,1,2,3].map(col=>(
                <rect key={col} x={8+col*55} y={18+row*12} width={[28,22,32,18][col]} height="3.5" rx="1.5"
                  fill={col===0?c:'var(--color-text)'} opacity={col===0?'.2':'.06'}/>
              ))}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

/*
  Digital Marketing = campaigns, reach, conversions, growth
  → Show a marketing funnel as the centerpiece with supporting metric cards
*/
export function MarketingIllustration({ accentColor = "var(--color-gold)" }) {
  const c = accentColor;
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <style>{css}</style>
      <svg viewBox="0 0 300 220" className="w-full h-full" preserveAspectRatio="xMidYMid meet"
        style={{animation:'il-float 6s ease-in-out infinite'}}>
        <defs>
          <linearGradient id="mf1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c} stopOpacity=".12"/><stop offset="100%" stopColor={c} stopOpacity=".04"/>
          </linearGradient>
          <linearGradient id="mf2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c} stopOpacity=".18"/><stop offset="100%" stopColor={c} stopOpacity=".06"/>
          </linearGradient>
          <linearGradient id="mf3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c} stopOpacity=".3"/><stop offset="100%" stopColor={c} stopOpacity=".1"/>
          </linearGradient>
        </defs>

        {/* ── FUNNEL (center) ── */}
        <g transform="translate(65,8)">
          {/* Stage 1: Awareness — wide */}
          <path d="M0,0 L170,0 L148,50 L22,50 Z" fill="url(#mf1)" stroke={c} strokeWidth=".8" strokeOpacity=".25"/>
          <rect x="48" y="12" width="74" height="6" rx="3" fill={c} opacity=".25"/>
          <rect x="54" y="24" width="62" height="4" rx="2" fill="var(--color-text)" opacity=".06"/>
          <rect x="58" y="32" width="54" height="4" rx="2" fill="var(--color-text)" opacity=".05"/>

          {/* Stage 2: Interest — medium */}
          <path d="M22,54 L148,54 L132,100 L38,100 Z" fill="url(#mf2)" stroke={c} strokeWidth=".8" strokeOpacity=".25"/>
          <rect x="54" y="68" width="62" height="6" rx="3" fill={c} opacity=".35"/>
          <rect x="58" y="80" width="54" height="4" rx="2" fill="var(--color-text)" opacity=".06"/>

          {/* Stage 3: Conversion — narrow */}
          <path d="M38,104 L132,104 L118,145 L52,145 Z" fill="url(#mf3)" stroke={c} strokeWidth=".8" strokeOpacity=".25"/>
          <rect x="62" y="116" width="46" height="6" rx="3" fill={c} opacity=".5"/>
          <rect x="66" y="128" width="38" height="4" rx="2" fill="var(--color-text)" opacity=".06"/>

          {/* Arrow from funnel to result */}
          <line x1="85" y1="148" x2="85" y2="166" stroke={c} strokeWidth="1.2" opacity=".25"/>
          <path d="M81,162 L85,169 L89,162" fill="none" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity=".25"/>

          {/* Conversion result */}
          <rect x="58" y="172" width="54" height="28" rx="8" fill={`${c}0a`} stroke={c} strokeWidth=".8" strokeOpacity=".2"/>
          <circle cx="74" cy="186" r="5" fill={`${c}15`}/>
          <circle cx="74" cy="186" r="2.5" fill={c} opacity=".45"/>
          <rect x="84" y="180" width="22" height="5" rx="2" fill={c} opacity=".3"/>
          <rect x="84" y="189" width="16" height="3.5" rx="1.5" fill="var(--color-text)" opacity=".06"/>
        </g>

        {/* ── LEFT COLUMN (metrics) ── */}

        {/* Growth chart card */}
        <g transform="translate(4,10)">
          <rect width="54" height="64" rx="8" fill="var(--color-surface)" stroke={c} strokeWidth=".7" strokeOpacity=".18"/>
          <rect x="6" y="6" width="22" height="4" rx="2" fill="var(--color-text)" opacity=".08"/>
          <rect x="6" y="14" width="16" height="6" rx="3" fill={c} opacity=".45"/>
          <polyline points="8,52 15,44 22,46 29,38 36,40 43,30 48,24"
            fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="400" style={{animation:'il-draw 2s ease-out forwards'}}/>
          <polygon points="8,52 15,44 22,46 29,38 36,40 43,30 48,24 48,54 8,54" fill={c} opacity=".04"/>
        </g>

        {/* Donut chart card */}
        <g transform="translate(4,84)">
          <rect width="54" height="52" rx="8" fill="var(--color-surface)" stroke={c} strokeWidth=".7" strokeOpacity=".18"/>
          <circle cx="27" cy="26" r="15" fill="none" stroke={`${c}10`} strokeWidth="4.5"/>
          <circle cx="27" cy="26" r="15" fill="none" stroke={c} strokeWidth="4.5"
            strokeDasharray="68 26" strokeDashoffset="-6" strokeLinecap="round" opacity=".6"/>
          <text x="27" y="30" textAnchor="middle" fill={c} fontSize="7" fontWeight="bold" opacity=".5">72%</text>
        </g>

        {/* Impressions card */}
        <g transform="translate(4,146)">
          <rect width="54" height="38" rx="8" fill="var(--color-surface)" stroke={c} strokeWidth=".7" strokeOpacity=".18"/>
          <rect x="6" y="6" width="26" height="4" rx="2" fill="var(--color-text)" opacity=".08"/>
          <rect x="6" y="14" width="20" height="6" rx="3" fill={c} opacity=".4"/>
          <rect x="6" y="26" width="22" height="8" rx="4" fill="#4ade8015"/>
          <text x="17" y="32" textAnchor="middle" fill="#4ade80" fontSize="5" fontWeight="bold" opacity=".7">+34%</text>
        </g>

        {/* ── RIGHT COLUMN (channels) ── */}

        {/* Megaphone / reach card */}
        <g transform="translate(244,10)">
          <rect width="52" height="52" rx="8" fill="var(--color-surface)" stroke={c} strokeWidth=".7" strokeOpacity=".18"/>
          <path d="M12,28 L32,17 L32,41 L12,32 Z" fill={`${c}12`} stroke={c} strokeWidth=".6" strokeOpacity=".2"/>
          <rect x="8" y="27" width="5" height="8" rx="2" fill={`${c}10`}/>
          <path d="M36,22 Q42,30 36,38" fill="none" stroke={c} strokeWidth="1" opacity=".2"/>
          <path d="M39,18 Q48,30 39,42" fill="none" stroke={c} strokeWidth=".8" opacity=".12"/>
        </g>

        {/* Audience card */}
        <g transform="translate(244,72)">
          <rect width="52" height="46" rx="8" fill="var(--color-surface)" stroke={c} strokeWidth=".7" strokeOpacity=".18"/>
          {[0,7,14].map((x,i)=>(
            <circle key={i} cx={14+x} cy="18" r="6.5" fill={`${c}${['18','30','4a'][i]}`}
              stroke="var(--color-surface)" strokeWidth="1.5"/>
          ))}
          <rect x="8" y="32" width="26" height="4" rx="2" fill={c} opacity=".2"/>
          <rect x="8" y="38" width="18" height="3" rx="1.5" fill="var(--color-text)" opacity=".06"/>
        </g>

        {/* Campaign bars card */}
        <g transform="translate(244,128)">
          <rect width="52" height="56" rx="8" fill="var(--color-surface)" stroke={c} strokeWidth=".7" strokeOpacity=".18"/>
          <rect x="6" y="6" width="24" height="4" rx="2" fill="var(--color-text)" opacity=".08"/>
          {[['72',c],['58','#60a5fa'],['84','#a78bfa']].map(([pct,col],i)=>(
            <g key={i} transform={`translate(6,${16+i*13})`}>
              <rect width="40" height="7" rx="3.5" fill={`${col}10`}/>
              <rect width={40*parseInt(pct)/100} height="7" rx="3.5" fill={col} opacity=".4"
                style={{transformOrigin:'0 3.5px', animation:`il-bar .8s ${i*.15}s ease-out both`}}/>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}