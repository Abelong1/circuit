/* Circuit mascot — one definition shared by the app and the admin page. */
const BLOBS=['#C84B31','#D95B43','#E07A5F','#EE8F71','#A43820','#B85B28','#3E9B80','#5B9A84','#4E8172',
'#7BB3A0','#2A6B61','#6B8E62','#F8F1E5','#FFFFFF','#EFE6D5','#FAF4EA','#E4D8C5','#D8CBB7','#3B2418',
'#534338','#D2C4B3','#7D7268','#2C1A11','#F4A261','#E9C46A','#8A9A86','#D08C9B'];
const CUSTOM={caffeinatedtransistor22:'#0F52BA'};
function tint(h){if(CUSTOM[h])return CUSTOM[h];let n=2166136261;for(const c of String(h)){n^=c.charCodeAt(0);n=Math.imul(n,16777619)>>>0}return BLOBS[n%BLOBS.length]}
function isLight(hex){const v=parseInt(hex.slice(1),16),r=v>>16,g=(v>>8)&255,b=v&255;return (0.299*r+0.587*g+0.114*b)>200}
function blob(handle,size,color){const f=color||tint(handle),lt=isLight(f);
const eye=lt?' stroke="#3B2418" stroke-width="1.5"':'';
return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="flex:none${lt?';filter:drop-shadow(0 0 1px rgba(59,36,24,.7)) drop-shadow(0 0 .5px rgba(59,36,24,.7))':''}" aria-hidden="true">
<path d="M55 19V6h9" fill="none" stroke="${lt?'#7D7268':f}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="66" cy="6" r="4" fill="${lt?'#7D7268':f}"/>
<circle cx="50" cy="34" r="21" fill="${f}"/><circle cx="28" cy="47" r="19" fill="${f}"/>
<circle cx="72" cy="47" r="19" fill="${f}"/><circle cx="37" cy="67" r="21" fill="${f}"/>
<circle cx="63" cy="67" r="21" fill="${f}"/><circle cx="50" cy="51" r="25" fill="${f}"/>
<circle cx="43" cy="48" r="9" fill="#fff"${eye}/><circle cx="59" cy="48" r="9" fill="#fff"${eye}/>
<circle cx="44" cy="49" r="5" fill="#1E1210"/><circle cx="60" cy="49" r="5" fill="#1E1210"/>
<path d="M37.6 37.8L36.4 34M42.3 36.2L41.8 32.4M46.8 37.2L47.4 33.4M54.2 37.2L53.6 33.4M58.7 36.2L59.2 32.4M63.4 37.8L64.6 34"
 stroke="${lt?'#1E1210':'#1E1210'}" stroke-width="1.7" stroke-linecap="round" fill="none"/></svg>`}

/* Group chat icon: three blobs, colors picked from the group's id. */
function groupIcon(id,size){const s=Math.round(size*.6),pos=[[0,size*.14],[size-s,0],[size*.2,size-s]];
return `<span style="position:relative;display:inline-block;width:${size}px;height:${size}px;flex:none" aria-hidden="true">`+
pos.map((p,k)=>`<span style="position:absolute;left:${p[0]}px;top:${p[1]}px;line-height:0">${blob('g'+id+'-'+k,s)}</span>`).join('')+'</span>'}

/* /join opens straight on the Create-account form. */
document.addEventListener('DOMContentLoaded',function(){
  if(/^\/(join|signup)(\.html)?\/?$/.test(location.pathname)&&typeof swap==='function')swap('signup');
});

/* Faster chat + fewer requests (overrides; same code as index.html source). */
let chatRows=[],chatHidden=new Set(),chatSince=null,chatReads={},marking=0,feedAt={},annAt=0;
(function(){const st=document.createElement('style');st.textContent='.rcpt{text-align:right;font-size:12px;color:var(--muted);margin:-2px 34px 6px 0}';document.head.appendChild(st)})();
document.addEventListener('DOMContentLoaded',function(){
if(typeof paintMsgs!=='function')return;
window.scrHome=function scrHome(){
  hdr(feed==='all'?'Circuit':(FEEDNAME[feed]||'Saved'),{logo:true});
  $('chipbar').className='chips';
  $('chipbar').innerHTML=FEEDS.map(([k,l])=>`<button class="chip ${k===feed?'on':''}" onclick="feed='${k}';scrHome()">${l}</button>`).join('');
  $('view').innerHTML=`<div id="annbox">${annHtml()}</div><button class="prompt" onclick="openCompose()">${blob(me.handle,36)}Share something with the Aces</button><div id="feedlist">${feedCache[feed]||'<div class="empty">Loading…</div>'}</div>`;
  $('feedlist')._h=feedCache[feed];$('annbox')._h=annHtml();
  const t=Date.now();
  if(!feedCache[feed]||!feedAt[feed]||t-feedAt[feed]>30000){feedAt[feed]=t;loadFeed()}
  if(t-annAt>60000){annAt=t;loadAnnouncement()}
};
window.expand=function expand(id){const op=!expanded.has(id);op?expanded.add(id):expanded.delete(id);
  const c=$('post-'+id);if(!c)return;const p=c.querySelector('.ptext'),m=c.querySelector('.more');
  if(p)p.classList.toggle('clamp',!op);if(m)m.textContent=op?'Show less':'Show more'};
window.scrChat=async function scrChat(){
  const m=convMeta[conv]||{title:'Chat',isGroup:false};
  hdr(m.title,{back:'msgs',right:m.isGroup?'<button class="tiny ghost" onclick="groupInfo()">Members</button>':''});
  $('ft').classList.remove('hide');
  $('ft').innerHTML=`<div id="pf" class="pending-file hide"></div>
    <button class="attach" onclick="pickFile()" aria-label="Attach photo or file">${ICON.clip}</button>
    <input id="mg" placeholder="Message…"><button class="tiny" id="sendbtn" onclick="sendMsg()">Send</button>`;
  $('mg').addEventListener('keydown',e=>{if(e.key==='Enter')sendMsg()});
  chatRows=[];chatReads={};
  await paintMsgs('full');
  if(chan)sb.removeChannel(chan);
  const c=conv;
  chan=sb.channel('conv'+c).on('postgres_changes',
    {event:'*',schema:'public',table:'aces_messages',filter:'conversation_id=eq.'+c},p=>{
      if(conv!==c)return;
      if(p.eventType==='DELETE'){chatRows=chatRows.filter(x=>x.id!==(p.old||{}).id)}
      else if(p.new&&p.new.id){const k=chatRows.findIndex(x=>x.id===p.new.id);
        if(k<0)chatRows.push(p.new);else chatRows[k]=p.new}
      paintMsgs()})
    .on('postgres_changes',{event:'*',schema:'public',table:'aces_conversation_reads',filter:'conversation_id=eq.'+c},p=>{
      if(conv!==c||!p.new||!p.new.user_id)return;
      chatReads[p.new.user_id]=p.new.last_read_at;paintMsgs()}).subscribe();
};
window.paintMsgs=async function paintMsgs(mode){
  const my=++painting;
  if(mode==='full'){
    const c=conv,grp=(convMeta[c]||{}).isGroup;
    const [{data},{data:hid},{data:ch},{data:rd},mem]=await Promise.all([
      sb.from('aces_messages').select('*').eq('conversation_id',c).order('created_at'),
      sb.from('aces_message_hidden').select('message_id'),
      sb.from('aces_conversation_hidden').select('hidden_at').eq('conversation_id',c).maybeSingle(),
      sb.from('aces_conversation_reads').select('user_id,last_read_at').eq('conversation_id',c),
      grp?sb.rpc('aces_conv_members',{p_conv:c}):Promise.resolve({data:null})]);
    if(conv!==c)return;
    if(mem.data){convMembers[c]={};mem.data.forEach(u=>convMembers[c][u.user_id]=u.handle)}
    chatRows=data||[];chatHidden=new Set((hid||[]).map(h=>h.message_id));
    chatSince=ch&&ch.hidden_at?new Date(ch.hidden_at):null;
    chatReads={};(rd||[]).forEach(r=>chatReads[r.user_id]=r.last_read_at);
  }
  if(screen!=='chat'||my!==painting)return;
  chatRows.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
  const list=chatRows.filter(x=>!chatHidden.has(x.id)&&(!chatSince||new Date(x.created_at)>chatSince));
  msgCache={};list.forEach(x=>msgCache[x.id]=x);
  const lastIn=[...list].reverse().find(x=>x.sender_id!==me.id);
  if(lastIn&&!marking&&document.visibilityState==='visible'&&(!chatReads[me.id]||new Date(lastIn.created_at)>new Date(chatReads[me.id]))){
    marking=1;chatReads[me.id]=new Date().toISOString();
    sb.rpc('aces_mark_read',{p_conv:conv}).then(()=>{marking=0})}
  const lastMine=[...list].reverse().find(x=>x.sender_id===me.id&&!x.unsent_at);
  const now=Date.now();
  const want=[];
  list.filter(x=>x.attachment_path&&!x.unsent_at).forEach(x=>{
    want.push(x.attachment_path);
    if((x.attachment_type||'').startsWith('image/'))want.push(x.attachment_path+THUMB);
  });
  const need=want.filter(p=>!localPreview[p]&&!urlMiss[p]&&(!urlCache[p]||urlCache[p].exp<now+600000));
  if(need.length){
    const {data:su}=await sb.storage.from('chat').createSignedUrls(need,86400);
    (su||[]).forEach(s=>{if(s.signedUrl)urlCache[s.path]={u:s.signedUrl,exp:now+86400000};
      else if(s.path&&s.path.endsWith(THUMB))urlMiss[s.path]=1});
    saveUrlCache();
    if(screen!=='chat'||my!==painting)return;
  }
  const urls={};for(const p in urlCache)urls[p]=urlCache[p].u;
  for(const p in localPreview)urls[p]=localPreview[p];
  const grp=(convMeta[conv]||{}).isGroup,mem=convMembers[conv]||{};
  let html=list.map(x=>{
    const mine=x.sender_id===me.id;
    if(x.unsent_at)return `<div class="mrow ${mine?'mine':'theirs'}"><div class="bub unsent">${mine?'You unsent a message':'Message unsent'}</div>
      <button class="mmenu" onclick="msgMenu(${x.id})" aria-label="Message options">⋯</button></div>`;
    let att='';const isPhoto=!!x.attachment_path&&(x.attachment_type||'').startsWith('image/');
    if(x.attachment_path){const u=urls[x.attachment_path],th=urls[x.attachment_path+THUMB]||u;
      att=(x.attachment_type||'').startsWith('image/')
        ?(th?`<a href="${esc(u||th)}" target="_blank" rel="noopener"><img src="${esc(th)}" alt="${esc(x.attachment_name||'Photo')}" decoding="async" onload="imgLoaded()"></a>`:'📷 Photo')
        :`<a class="file" href="${esc(u||'#')}" target="_blank" rel="noopener">📎 ${esc(x.attachment_name||'File')}</a>`}
    const from=grp&&!mine?`<span class="from">${esc(mem[x.sender_id]||'member')}</span>`:'';
    let rc='';if(x===lastMine){const t=new Date(x.created_at),n=Object.keys(chatReads).filter(u=>+u!==me.id&&new Date(chatReads[u])>=t).length;
      rc=`<div class="rcpt">${n?(grp?'Seen by '+n:'Seen'):'Sent'}</div>`}
    return `<div class="mrow ${mine?'mine':'theirs'}"><div class="bub${isPhoto&&!x.body?' photo':''}">${from}${att}${x.body?esc(x.body):''}</div>
      <button class="mmenu" onclick="msgMenu(${x.id})" aria-label="Message options">⋯</button></div>${rc}`}).join('')
    ||(sendingHtml?'':'<div class="empty">Say hello.</div>');
  html+=sendingHtml;
  if(html===lastChatHtml)return;
  lastChatHtml=html;
  $('view').innerHTML=html;
  window.scrollTo(0,document.body.scrollHeight);
};
window.sendMsg=async function sendMsg(){
  const i=$('mg'),b=i.value.trim();let f=pendingFile;
  if(!b&&!f)return;
  const btn=$('sendbtn');btn.disabled=true;
  const row={conversation_id:conv,sender_id:me.id,body:b||null};
  if(f){
    const isImg=f.type.startsWith('image/')&&f.type!=='image/gif';
    let thumb=null,preview='';
    if(isImg){
      preview=URL.createObjectURL(f);
      sendingHtml=`<div class="mrow mine"><div class="bub${b?'':' photo'}"><img src="${preview}" alt="" onload="imgLoaded()">${b?esc(b):''}<span style="display:block;font-size:12px;opacity:.8">Sending…</span></div></div>`;
      lastChatHtml='';paintMsgs();i.value='';clearFile();
      [f,thumb]=await Promise.all([shrinkImage(f,1280,0.8),shrinkImage(f,480,0.7,true)]);
    }
    const safe=f.name.replace(/[^\w.\-]+/g,'_').slice(-80)||'file';
    const path=`${conv}/${crypto.randomUUID()}-${safe}`;
    if(!isImg)btn.textContent='Uploading…';
    const opts={contentType:f.type||'application/octet-stream',cacheControl:'31536000'};
    const ups=[sb.storage.from('chat').upload(path,f,opts)];
    if(thumb)ups.push(sb.storage.from('chat').upload(path+THUMB,thumb,{contentType:'image/jpeg',cacheControl:'31536000'}));
    const res=await Promise.all(ups);
    btn.textContent='Send';
    if(res[0].error){btn.disabled=false;sendingHtml='';lastChatHtml='';paintMsgs();return toast(res[0].error.message)}
    if(preview){localPreview[path]=preview;localPreview[path+THUMB]=preview}
    Object.assign(row,{attachment_path:path,attachment_name:f.name.slice(0,120),attachment_type:f.type||'application/octet-stream'});
  }
  const {data:nr,error}=await sb.from('aces_messages').insert(row).select().single();
  btn.disabled=false;sendingHtml='';
  if(error){lastChatHtml='';paintMsgs();return toast(error.message)}
  if(nr&&nr.conversation_id===conv&&!chatRows.some(x=>x.id===nr.id))chatRows.push(nr);
  i.value='';clearFile();paintMsgs();
};
window.unsend=async function unsend(id){
  const x=msgCache[id];
  if(x&&x.attachment_path)await sb.storage.from('chat').remove([x.attachment_path,x.attachment_path+THUMB]);
  const {error}=await sb.rpc('aces_unsend',{p_msg:id});
  closeSheet();if(error)return toast(error.message);
  if(x)x.unsent_at=new Date().toISOString();
  toast('Message unsent');paintMsgs();
};
window.hideMsg=async function hideMsg(id){
  const {error}=await sb.from('aces_message_hidden').insert({user_id:me.id,message_id:id});
  closeSheet();if(error)return toast(error.message);
  chatHidden.add(id);toast('Deleted for you');paintMsgs();
};
window.submitPost=async function submitPost(){
  const b=$('pb').value.trim(),f=draftPhoto;
  if(!b&&!f)return $('perr').textContent='Write something or add a photo.';
  const btn=$('postbtn');btn.disabled=true;
  const row={author_id:me.id,feed:draftFeed,body:b};
  if(f){
    btn.textContent='Uploading…';
    const small=await shrinkImage(f,1600,0.82);
    let w=4,h=3;try{const bm=await createImageBitmap(small);w=bm.width;h=bm.height}catch(e){}
    const path=`${me.id}/${crypto.randomUUID()}.jpg`;
    const {error:ue}=await sb.storage.from('posts').upload(path,small,{contentType:small.type||'image/jpeg',cacheControl:'31536000'});
    if(ue){btn.disabled=false;btn.textContent='Post';return $('perr').textContent=ue.message}
    localPreview[path]=URL.createObjectURL(small);row.image_url=`${path}|${w}|${h}`;
  }
  const {error}=await sb.from('aces_posts').insert(row);
  btn.disabled=false;btn.textContent='Post';
  if(error)return $('perr').textContent=error.message;
  draftPhoto=null;closeSheet();feed=draftFeed;feedCache={};feedAt={};scrHome();toast('Posted');
};
window.delPost=async function delPost(id){
  closeSheet();
  const card=$('post-'+id);if(card)card.style.display='none';
  const pp=parsePhoto(posts.find(x=>x.id===id)||{});
  const {error}=await sb.from('aces_posts').delete().eq('id',id).eq('author_id',me.id);
  if(error){if(card)card.style.display='';return toast(error.message)}
  if(pp)sb.storage.from('posts').remove([pp.path]);
  posts=posts.filter(p=>p.id!==id);feedCache={};bookmarks.delete(id);
  const b=$('feedlist');if(b)b._h=null;
  toast('Post deleted');
  if(screen==='post'){feedCache={};feedAt={};go('home')}else{if(card)card.remove();loadFeed()}
};
window.sendComment=async function sendComment(){
  const i=$('cm'),b=i.value.trim();if(!b)return;i.value='';
  const {error}=await sb.from('aces_comments').insert({post_id:openPost,author_id:me.id,body:b});feedAt={};
  if(error)return toast(error.message);
  scrPost();
};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&screen==='chat')paintMsgs('full')});
});

/* Show/hide eye on every password field (login, sign-up, admin). */
(function(){
  const EYE='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7c1.8 0 3.4-.5 4.8-1.3"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
  function add(){
    if(!document.getElementById('pweye-css')){
      const st=document.createElement('style');st.id='pweye-css';
      st.textContent='.pwwrap{position:relative;width:100%;display:block}.pwwrap>input{width:100%;padding-right:52px!important}'+
        '.pweye{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:44px;height:44px;display:flex;align-items:center;justify-content:center;'+
        'background:none;border:0;border-radius:22px;color:var(--muted,#8a7068);cursor:pointer;padding:0;margin:0}.pweye:active{opacity:.6}';
      document.head.appendChild(st);
    }
    document.querySelectorAll('input[type=password]:not([data-eye])').forEach(inp=>{
      inp.dataset.eye='1';
      const w=document.createElement('span');w.className='pwwrap';
      if(inp.style.marginBottom||getComputedStyle(inp).marginBottom!=='0px'){w.style.marginBottom=getComputedStyle(inp).marginBottom;inp.style.marginBottom='0'}
      inp.parentNode.insertBefore(w,inp);w.appendChild(inp);
      const b=document.createElement('button');b.type='button';b.className='pweye';
      b.setAttribute('aria-label','Show password');b.innerHTML=EYE;
      b.addEventListener('mousedown',e=>e.preventDefault());
      b.addEventListener('click',()=>{const show=inp.type==='password';inp.type=show?'text':'password';
        b.innerHTML=show?EYE_OFF:EYE;b.setAttribute('aria-label',show?'Hide password':'Show password');inp.focus()});
      w.appendChild(b);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();
