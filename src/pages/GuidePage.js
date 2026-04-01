import React, { useState } from 'react';
import './GuidePage.css';

const SECTIONS = [
  { id:'overview', icon:'📋', title:'Overview of renting in NSW', content:`Renting in New South Wales (NSW) is governed by the Residential Tenancies Act 2010. Both landlords and tenants have rights and responsibilities under this law. As a newcomer or international student, understanding the basics protects you from exploitation and helps you make informed decisions.\n\nThe NSW Civil and Administrative Tribunal (NCAT) resolves disputes between landlords and tenants. If you can't resolve an issue directly, you can apply to NCAT for a hearing.\n\nNSW Fair Trading also provides free advice and information — call 13 32 20 on weekdays.` },
  { id:'applying', icon:'📝', title:'Applying for a rental', content:`When you apply for a property, you'll typically need:\n\n• Photo ID — passport, student card, or driver's licence\n• Proof of income or financial support — bank statements, scholarship letters, employment contracts\n• References — from previous landlords, employers, or university staff\n• Rental history — overseas references are accepted in NSW\n\nAs an international student without Australian rental history, write a cover letter explaining your situation, provide extra financial evidence, and consider offering a larger bond (up to the legal maximum). A well-prepared application stands out.` },
  { id:'bond', icon:'💰', title:'Rental bonds', content:`A rental bond is a security deposit paid at the start of a tenancy. In NSW, the bond is capped at 4 weeks' rent for most properties.\n\nKEY RULES:\n• The landlord MUST lodge your bond with NSW Fair Trading within 10 working days\n• You will receive a Bond Lodgement receipt — keep this safe\n• At the end of your tenancy, your bond must be returned within 14 days if there are no valid claims\n• The landlord can only claim bond for unpaid rent, damage beyond fair wear and tear, or reasonable cleaning costs\n• You can dispute any unfair bond deductions at NCAT — free to apply` },
  { id:'lease', icon:'📄', title:'Lease agreements', content:`A lease (tenancy agreement) is a binding legal contract. Read it carefully before signing. The standard NSW agreement covers:\n\n• Rent amount and payment method\n• Lease duration — fixed term vs periodic (month-to-month)\n• Conditions around pets, modifications, and subletting\n• Notice periods for ending the tenancy\n\nIMPORTANT: Before you sign, ask for a Condition Report. This records the property's state when you move in. Complete it honestly and keep your signed copy — this protects you from being charged for pre-existing damage when you move out.` },
  { id:'rights', icon:'⚖️', title:'Your tenant rights', content:`As a tenant in NSW you have the right to:\n\n• Live in the property peacefully without harassment\n• At least 24 hours' written notice before the landlord enters (except emergencies)\n• A property kept in reasonable repair — the landlord must fix serious maintenance issues\n• Make minor modifications (hang pictures, assemble furniture) without permission, unless the lease states otherwise\n• Not be evicted without proper written notice and a valid legal reason\n• Protection against discrimination under NSW anti-discrimination law\n\nIf your landlord is not meeting obligations, contact NSW Fair Trading on 13 32 20.` },
  { id:'ending', icon:'🏁', title:'Ending a tenancy', content:`To end a fixed-term lease at the end of the agreed period, give at least 14 days' written notice before the end date.\n\nTo break a lease early, you may be required to pay break costs, including:\n• A break fee (typically 4–6 weeks' rent depending on how early you leave)\n• Rent until a new tenant is found and approved\n• Reasonable advertising costs\n\nAlways provide notice in writing and keep a copy. When you vacate, clean the property thoroughly and document its condition with dated photos. This gives you the best chance of getting your bond returned in full within 14 days.` },
  { id:'resources', icon:'🔗', title:'Useful contacts & resources', content:`NSW Fair Trading — tenancy info, bond lodgement, dispute support\nPhone: 13 32 20 | fairtrading.nsw.gov.au\n\nNSW Civil and Administrative Tribunal (NCAT) — dispute resolution\nncat.nsw.gov.au\n\nTenants' Union of NSW — free advice and advocacy\ntenants.org.au | (02) 8117 3700\n\nLegal Aid NSW — free legal assistance\n1300 888 529 | legalaid.nsw.gov.au\n\nDomestic Violence helpline\n1800 RESPECT (1800 737 732) — 24/7 support` },
];

export default function GuidePage() {
  const [active, setActive] = useState('overview');
  const section = SECTIONS.find(s => s.id === active);

  const renderContent = (text) =>
    text.split('\n').map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      if (line.startsWith('•')) return <div key={i} className="guide-bullet">{line}</div>;
      if (/^[A-Z ]+:$/.test(line) || /^(KEY RULES|IMPORTANT):?/.test(line)) return <div key={i} className="guide-label">{line}</div>;
      return <p key={i}>{line}</p>;
    });

  const idx  = SECTIONS.findIndex(s => s.id === active);

  return (
    <div className="guide-page">
      <div className="guide-hero">
        <div className="page-container">
          <div className="guide-eyebrow">📋 NSW Renting Guide</div>
          <h1 className="guide-title">Your guide to renting in NSW</h1>
          <p className="guide-sub">Plain-English explanations of tenant rights, bonds, leases, and the rental process — designed for newcomers to Sydney.</p>
        </div>
      </div>

      <div className="page-container guide-body">
        <aside className="guide-sidebar">
          <div className="guide-nav-label">Contents</div>
          {SECTIONS.map(s => (
            <button key={s.id} className={`guide-nav-btn ${active === s.id ? 'active' : ''}`} onClick={() => setActive(s.id)}>
              <span>{s.icon}</span><span>{s.title}</span>
            </button>
          ))}
        </aside>

        <main className="guide-main">
          <div className="card guide-content animate-fade" key={active}>
            <div className="guide-content-hd">
              <span className="guide-icon">{section.icon}</span>
              <h2>{section.title}</h2>
            </div>
            <div className="guide-text">{renderContent(section.content)}</div>
          </div>

          <div className="guide-nav-btns">
            {idx > 0 && (
              <button className="btn btn-outline" onClick={() => setActive(SECTIONS[idx-1].id)}>← Previous</button>
            )}
            {idx < SECTIONS.length-1 && (
              <button className="btn btn-primary" style={{marginLeft:'auto'}} onClick={() => setActive(SECTIONS[idx+1].id)}>Next →</button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
