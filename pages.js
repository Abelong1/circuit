/* Profile sub-pages: Settings, Help Center, Terms of Service, Privacy Policy.
   Terms and Privacy are also opened from the sign-up form (as a sheet), so they work logged out. */
const DOC_UPDATED = 'October 21, 2026';
let pageKind = 'settings';

const DOCS = {
terms: {title: 'Terms of Service', html: `
<p class="dmeta">Last updated ${DOC_UPDATED}</p>
<p>Circuit is a private community app for ACES members at STI College Caloocan. It is run by ACES officers, not by STI College. By creating an account you agree to these terms.</p>
<h4>1. Who can join</h4>
<p>Only students whose email is on the ACES member list can sign up. New accounts need an @caloocan.sti.edu.ph email. One account per person.</p>
<h4>2. Your handle and your real identity</h4>
<p>Everyone on Circuit sees you only by your random handle. Your handle is permanent and cannot be changed. ACES officers can see the real identity behind every handle so they can moderate fairly. Officers must not share your identity with other members.</p>
<h4>3. What you can post</h4>
<ul><li><b>Moments</b> for everyday posts, <b>Help</b> for questions and tutoring, <b>Hiring</b> for commissions, gigs and jobs.</li>
<li>Post in the right feed. Keep it relevant to ACES and school life.</li>
<li>You are responsible for what you post, including photos and files.</li></ul>
<h4>4. Not allowed</h4>
<ul><li>Harassment, bullying, threats, or hate toward anyone.</li>
<li>Trying to find out or reveal who is behind a handle.</li>
<li>Impersonating another member or an officer.</li>
<li>Scams, fake offers, or misleading Hiring posts.</li>
<li>Spam, or posting in the wrong feed on purpose.</li>
<li>Sexual content, or sharing someone's private information or photos without consent.</li>
<li>Cheating services, such as selling finished exams or graded work.</li>
<li>Anything that breaks STI College rules or Philippine law.</li></ul>
<h4>5. Reports and moderation</h4>
<p>Anyone can report a post. Officers review every report. Penalties depend on how serious the violation is: a warning, content removal, a temporary suspension, or a permanent ban. A ban signs you out immediately and blocks your email from signing up again.</p>
<h4>6. Private chats</h4>
<p>Officers cannot read your private chats. An officer may review a chat only if at least one person in it agrees to share it, for example when reporting harassment.</p>
<h4>7. Appeals</h4>
<p>If you think a penalty was a mistake, appeal in person to an ACES officer. You will be shown the evidence behind the decision.</p>
<h4>8. Your content</h4>
<p>You keep ownership of what you post. You give ACES permission to store and show it to other members inside Circuit. You can edit or delete your own posts, and unsend your own messages.</p>
<h4>9. The service</h4>
<p>Circuit is a student project run on free hosting. It may have downtime, bugs, or lose data. Features may change. ACES may suspend or shut down Circuit at any time.</p>
<h4>10. Changes</h4>
<p>We may update these terms. The date at the top will change, and big changes will be announced in the app.</p>
<h4>Contact</h4>
<p>Questions about these terms go to any ACES officer.</p>`},

privacy: {title: 'Privacy Policy', html: `
<p class="dmeta">Last updated ${DOC_UPDATED}</p>
<p>This policy explains what Circuit collects, why, and who can see it. ACES handles your information in line with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173).</p>
<h4>What we collect</h4>
<ul><li><b>Account:</b> your email, a name taken from your email, your random handle, your role, and your account status.</li>
<li><b>What you share:</b> posts, comments, photos, likes, bookmarks, friend requests, chat messages and attached files.</li>
<li><b>Activity:</b> when you sign in, which chats you have read, and your notifications.</li>
<li><b>Safety:</b> reports you send or that are about you, and officer actions in the audit log.</li></ul>
<p>We do not collect your location, contacts, or device ID, and there are no ads or tracking scripts.</p>
<h4>Why we use it</h4>
<ul><li>To run Circuit: show feeds, deliver messages, send in-app alerts.</li>
<li>To keep Circuit members-only, using the ACES member list.</li>
<li>To moderate: review reports, apply penalties, and handle appeals.</li>
<li>To protect accounts, for example by spotting unusual sign-ins.</li></ul>
<h4>Who can see what</h4>
<ul><li><b>Other members</b> see only your handle and what you post publicly in the feeds.</li>
<li><b>People in a chat</b> see the messages in that chat. "Seen" receipts show when they have read it.</li>
<li><b>ACES officers</b> can see your real email and name, sign-in times, reports and the audit log. They cannot read private chats unless someone in the chat agrees to share it.</li>
<li><b>Nobody else.</b> We do not sell or share your information with anyone outside ACES, except where the law requires it.</li></ul>
<h4>Where it is stored</h4>
<p>Data is stored with Supabase (database and file storage) and the app is hosted on Vercel. Their servers may be outside the Philippines. Photos and files in chats are only reachable through short-lived private links.</p>
<h4>How long we keep it</h4>
<p>We keep your information while your account exists. Deleted posts are removed right away. Unsent messages are removed for everyone. "Delete for me" hides a message only for you. Banned emails are kept so the account cannot sign up again.</p>
<h4>Your rights</h4>
<p>Under the Data Privacy Act you can ask to see the data we hold about you, correct it, or have your account and data deleted. To do this, talk to an ACES officer. We may need to keep some records, such as reports and bans, to keep Circuit safe.</p>
<h4>Changes</h4>
<p>If this policy changes, the date at the top will change, and big changes will be announced in the app.</p>
<h4>Contact</h4>
<p>Privacy questions or requests go to any ACES officer.</p>`},

help: {title: 'Help Center', html: `
<details><summary>What is Circuit?</summary><p>A private app for ACES members to share moments, ask for help, and find or offer commissions and jobs. Everyone uses a random handle.</p></details>
<details><summary>Can I change my handle?</summary><p>No. Handles are random and permanent, so nobody can pick a name that gives away who they are.</p></details>
<details><summary>Who can see who I really am?</summary><p>Only ACES officers. Other members only ever see your handle.</p></details>
<details><summary>Can officers read my private chats?</summary><p>No. An officer can only review a chat if someone in it agrees to share it, for example when reporting harassment.</p></details>
<details><summary>How do I report a post?</summary><p>Tap <b>⋯</b> on the post and choose <b>Report</b>. An officer will review it. For a problem in a chat, show an officer directly.</p></details>
<details><summary>How do I add a friend or start a chat?</summary><p>Ask your friend for their handle. Add them in <b>Friends</b>, or type their handle in <b>Messages → Start a chat</b>. Group chats need friends first.</p></details>
<details><summary>How do I tag people or topics?</summary><p>Type <b>@</b> and a handle to mention someone, and they get an alert. Type <b>#</b> and a word to add a topic tag. Tap a tag to see every post with it.</p></details>
<details><summary>I forgot my password.</summary><p>On the log in screen, tap <b>Forgot password?</b> and enter your email. An ACES officer will give you a temporary password in person, then you choose a new one.</p></details>
<details><summary>How do I install Circuit on my phone?</summary><p><b>Android (Chrome):</b> open Profile and tap <b>Install Circuit</b>, or use the browser menu → <b>Add to Home screen</b>.<br><b>iPhone (Safari):</b> tap Share → <b>Add to Home Screen</b>.</p></details>
<details><summary>The app looks outdated or isn't updating.</summary><p>Close Circuit completely and open it again.</p></details>
<details><summary>I was suspended or banned.</summary><p>Talk to an ACES officer in person to appeal. They will show you the evidence behind the decision.</p></details>
<div class="card" style="margin-top:14px"><b>Still need help?</b><p style="margin-top:6px">Message or talk to any ACES officer.</p></div>`}
};

function docStyles(){
  if(document.getElementById('doc-css'))return;
  const st=document.createElement('style');st.id='doc-css';
  st.textContent=`.doc{line-height:1.6;color:var(--body);font-size:15px}.doc h4{font-family:Fredoka,sans-serif;color:var(--ink);font-size:17px;margin:18px 0 6px}
.doc p{margin:0 0 10px}.doc ul{margin:0 0 10px 20px}.doc li{margin-bottom:4px}.doc .dmeta{color:var(--muted);font-size:13px;font-weight:700}
.doc details{background:var(--card);border-radius:var(--r);padding:14px 16px;margin-bottom:10px}
.doc summary{font-weight:700;color:var(--ink);cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:10px}
.doc summary::-webkit-details-marker{display:none}.doc summary::after{content:'+';color:var(--brand);font-size:20px;line-height:1}
.doc details[open] summary::after{content:'–'}.doc details p{margin:10px 0 0}
.mgroup{background:var(--card);border-radius:var(--r);margin-bottom:12px;overflow:hidden}
.mgroup button,.mgroup a{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:15px 16px;border-top:2px solid var(--line);color:inherit;text-decoration:none}
.mgroup>*:first-child{border-top:0}.mgroup b{flex:1}.mgroup .chev{color:var(--muted)}
#sheet .doc{max-height:60vh;overflow:auto;text-align:left}`;
  document.head.appendChild(st);
}

function openPage(k){pageKind=k;go('page')}
function scrPage(){
  docStyles();
  if(pageKind==='settings')return scrSettings();
  const d=DOCS[pageKind];hdr(d.title,{back:'me'});
  $('view').innerHTML=`<div class="doc">${pageKind==='help'?'':'<div class="card">'}${d.html}${pageKind==='help'?'':'</div>'}</div>`;
}
/* From the sign-up form (logged out). */
function openDocSheet(k){
  docStyles();const d=DOCS[k];
  $('shtitle').textContent=d.title;
  $('shbody').innerHTML=`<div class="doc">${d.html}</div>`;
  $('sheet').classList.add('on');
}

async function scrSettings(){
  hdr('Settings',{back:'me'});
  const {data:{user}}=await sb.auth.getUser();
  if(screen!=='page')return;
  const since=me.created_at?new Date(me.created_at).toLocaleDateString('en-PH',{dateStyle:'medium'}):'';
  $('view').innerHTML=`
    <div class="sec">Account</div>
    <div class="card" style="line-height:1.6">
      <div style="font-size:13px;color:var(--muted);font-weight:700">Email (only you and officers see this)</div>
      <div style="overflow-wrap:anywhere">${esc(user?user.email:me.email||'')}</div>
      <div style="font-size:13px;color:var(--muted);font-weight:700;margin-top:10px">Handle</div><div>${esc(me.handle)}</div>
      ${since?`<div style="font-size:13px;color:var(--muted);font-weight:700;margin-top:10px">Member since</div><div>${since}</div>`:''}
    </div>
    <div class="sec">Change password</div>
    <div class="card">
      <label for="sp1" style="margin-top:0">New password</label>
      <input id="sp1" type="password" autocomplete="new-password" placeholder="At least 8 characters">
      <label for="sp2">Confirm new password</label>
      <input id="sp2" type="password" autocomplete="new-password" placeholder="Type it again">
      <button class="primary" id="spbtn" onclick="changePw()">Save password</button>
      <div class="err" id="sperr"></div>
    </div>
    <div class="sec">Sessions</div>
    <button class="secondary" onclick="logoutAll()">Log out on all devices</button>
    <p style="color:var(--muted);font-size:13px;line-height:1.5;margin:14px 4px 0">To delete your account or download your data, talk to an ACES officer.</p>`;
}
async function changePw(){
  const e=$('sperr'),a=$('sp1').value,b=$('sp2').value;e.textContent='';
  if(a.length<8)return e.textContent='Use at least 8 characters.';
  if(a!==b)return e.textContent="Passwords don't match.";
  if($('spbtn').disabled)return;busy('spbtn',true,'Saving…');
  try{const {error}=await sb.auth.updateUser({password:a});
    if(error)return e.textContent=error.message;
    $('sp1').value=$('sp2').value='';toast('Password changed');
  }finally{busy('spbtn',false)}
}
async function logoutAll(){
  if(!confirm('Log out of Circuit on every device, including this one?'))return;
  if(chan)sb.removeChannel(chan);
  await sb.auth.signOut({scope:'global'});location.reload();
}

/* ACES Tools: apps built for ACES members. Each opens in a new tab. */
const TOOLS = [
  {name:'NaviGate', desc:'Pocket reference for components, logic gates and number conversions.', url:'https://navigate-red.vercel.app', bg:'#7B3FD0', fg:'#fff', mark:'N'},
  {name:'Calculator Alligator', desc:"Resistor color codes, Ohm's law, voltage dividers, Boolean algebra and K-maps.", url:'https://calligator.vercel.app', bg:'#007225', fg:'#fff', mark:'CA'},
  {name:'Orrca', desc:'DSP and signal toolkit for CPE students.', url:'https://orrca.vercel.app', bg:'#8294D6', fg:'#fff', mark:'O'},
  {name:'HIVE', desc:'CPE thesis digital archive.', url:'https://hive-theta-two.vercel.app', bg:'#F2A900', fg:'#1E1210', mark:'H'}
];
function toolsHtml(){
  docStyles();
  return `<div class="sec">ACES Tools</div><div class="mgroup tools">${TOOLS.map(t=>
    `<a href="${t.url}" target="_blank" rel="noopener"><span class="tmark" style="background:${t.bg};color:${t.fg}">${t.mark}</span>
      <span style="flex:1;min-width:0"><b style="display:block">${esc(t.name)}</b><span class="tdesc">${esc(t.desc)}</span></span>
      <span class="chev" aria-hidden="true">↗</span></a>`).join('')}</div>`;
}
(function(){const st=document.createElement('style');
  st.textContent='.tools .tmark{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font:700 15px Fredoka,sans-serif;flex:none}'+
  '.tools .tdesc{display:block;font-size:13px;color:var(--muted);line-height:1.4;margin-top:2px}.tools b{flex:none}';
  document.head.appendChild(st)})();
