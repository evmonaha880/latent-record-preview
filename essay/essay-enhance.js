/* Essay page, 10/09 working fork: photos, a guide to the squares, and three phone layouts for reaching the record.
   The mock-up above is untouched; this file only adds to it. Phone layout: ?m=1 whisper line, ?m=2 peek bar, ?m=3 edge ribbon. */
(function(){
var E=window.ESSAY; if(!E) return;
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var isPhone=function(){return matchMedia('(max-width:820px)').matches};

/* ---------- 1. photographs, placed after the paragraph the print has them after ---------- */
fetch('photos.json').then(function(r){return r.json()}).then(function(P){
  var byAfter={}; P.forEach(function(p){(byAfter[p.after]=byAfter[p.after]||[]).push(p)});
  function fig(p){var f=document.createElement('figure');f.className='photo';
    f.innerHTML='<picture>'+(p.phone?'<source media="(max-width:760px)" srcset="'+p.phone+'">':'')+'<img src="'+p.src+'" width="'+p.w+'" height="'+p.h+'" alt="'+esc(p.caption)+'" loading="lazy" decoding="async"></picture><figcaption>'+esc(p.caption)+'<span class="rec"> · the print, not in the record</span></figcaption>';return f}
  Object.keys(byAfter).forEach(function(n){
    var anchor=n==='0'?$('#p1'):$('#p'+n); if(!anchor) return;
    var ref=n==='0'?anchor:anchor.nextSibling;               // after paragraph n (before p1 for 0)
    byAfter[n].forEach(function(p){anchor.parentNode.insertBefore(fig(p),ref)});
  });
});

/* ---------- 2. the guide to the squares: in the page, and as a sheet from a ? button ---------- */
function guideHTML(title){
  function ex(c,txt){return '<div class="gex"><span class="qr"><span class="tile E"></span><span class="tile E"></span><span class="tile '+c+' hit"></span><span class="tile E"></span><span class="tile E"></span></span><p>'+txt+'</p></div>'}
  return (title?'<h2>How to read it</h2>':'')+
    '<p class="gp gl1"><b>It works like Wordle.</b> Every paragraph was rewritten, and each one has a board that shows how it changed.</p>'+
    '<p class="gp">Each <b>row</b> is one draft. Each <b>square</b> is one sentence in that draft. The answer is the published paragraph, and the colours compare every draft to it.</p>'+
    '<h3 class="gx">Examples</h3>'+
    ex('G','<b>Green:</b> this sentence is in the published paragraph, word for word.')+
    ex('Y','<b>Gold:</b> this sentence made it into the published paragraph, but reworded.')+
    ex('X','<b>Dark:</b> this sentence was cut. It is not in the published paragraph.')+
    '<div class="gdemo">'+'<span class="gr"><span class="gl">Draft 1</span><span class="qr"><span class="tile G"></span><span class="tile Y"></span><span class="tile Y"></span><span class="tile X"></span><span class="tile G"></span></span></span>'+'<span class="gr"><span class="gl">Draft 2</span><span class="qr"><span class="tile G"></span><span class="tile G"></span><span class="tile Y"></span><span class="tile X"></span><span class="tile G"></span></span></span>'+'<span class="gr"><span class="gl">Draft 3</span><span class="qr"><span class="tile G"></span><span class="tile G"></span><span class="tile G"></span><span class="tile G"></span><span class="tile G"></span></span></span>'+'<span class="gcap">The paragraph gets closer to the final with every draft. All green means it matches.</span></div>'+
    '<ul class="gk"><li><i class="dot n"></i>a note of his changed the text</li><li><i class="dot ch"></i>a chat message of his changed the text</li></ul>'+
    '<p class="gp">Tap any grid, or <b>Show the record</b> under a paragraph, to open its drafts and the notes that changed them. The grid beside the paragraph you are reading lights up.</p>';
}
$$('.sech').forEach(function(h){ if(h.textContent.trim()==='Opening') h.textContent='The Man Who Manufactured Memory' });   /* display name only: the essay itself has no "Opening" heading */
var how=$('.how'), guide=document.createElement('details'); guide.className='guide'; guide.id='guide';
guide.innerHTML='<summary>How to read it</summary><div class="gbody">'+guideHTML()+'</div>';
var seen=false; try{seen=localStorage.getItem('lr-guide-seen')==='1'}catch(e){}
if(!seen||/guide=1/.test(location.search)) guide.open=true;
guide.addEventListener('toggle',function(){ if(!guide.open){try{localStorage.setItem('lr-guide-seen','1')}catch(e){}} });
if(how) how.parentNode.insertBefore(guide,how.nextSibling); else $('#essay').parentNode.insertBefore(guide,$('#essay'));
var dlg=document.createElement('dialog'); dlg.id='guideSheet'; dlg.innerHTML='<div class="gbody">'+guideHTML(true)+'<button type="button" class="gclose">Got it</button></div>';
document.body.appendChild(dlg);
dlg.addEventListener('click',function(e){ if(e.target===dlg||e.target.closest('.gclose')) dlg.close(); });
function openGuide(){ if(typeof dlg.showModal==='function') dlg.showModal(); else {guide.open=true;guide.scrollIntoView()} }
document.addEventListener('click',function(e){ if(e.target.closest('[data-guide]')){ e.preventDefault(); openGuide(); } });

/* ---------- 3. phone layouts for reaching the record ---------- */
var M=+((/[?&]m=(\d)/.exec(location.search)||[])[1]||2);
document.body.dataset.m=M;
var sw=document.createElement('div'); sw.className='msw';
sw.innerHTML='<span>Phone layout (mock-up only):</span>'+[['1','Whisper line'],['2','Peek bar'],['3','Edge ribbon']].map(function(o){return '<button type="button" data-m="'+o[0]+'" aria-pressed="'+(+o[0]===M)+'">'+o[0]+' '+o[1]+'</button>'}).join('');
/* preview: layout switcher not shown */
sw.addEventListener('click',function(e){var b=e.target.closest('[data-m]'); if(!b) return; M=+b.dataset.m; document.body.dataset.m=M;
  $$('button',sw).forEach(function(x){x.setAttribute('aria-pressed',String(x===b))}); try{history.replaceState(null,'',location.pathname+'?m='+M+location.hash)}catch(_){} refresh()});

/* option 3: a one-column Wordle down the paragraph's right edge; one segment per draft, coloured by what that draft held */
E.paras.forEach(function(p){
  var host=$('#'+p.k+' .pgrid > div:first-child'); if(!host) return;
  var rib=document.createElement('button'); rib.type='button'; rib.className='ribbon'; rib.setAttribute('data-open',p.k); rib.setAttribute('aria-label','Open the record for paragraph '+p.n);
  rib.innerHTML=p.sq.map(function(r){var c=r.indexOf('X')>-1?'X':(r.indexOf('Y')>-1?'Y':'G'); return '<i class="'+c+'"></i>'}).join('');
  host.classList.add('hasrib'); host.appendChild(rib);
});

/* option 2: one bar at the bottom that follows the paragraph being read */
var peek=document.createElement('div'); peek.id='peek'; peek.innerHTML='<button type="button" class="pk-main" data-open=""><span class="pk-grid"></span><span class="pk-t"></span><span class="pk-go" aria-hidden="true">▴</span></button><button type="button" class="pk-q" data-guide aria-label="How to read the squares">?</button>';
document.body.appendChild(peek);

function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function firstNote(k){var P=window.PARAS&&window.PARAS[k]; if(!P) return null; for(var i=0;i<P.rows.length;i++){var cs=P.rows[i].cards||[]; for(var j=0;j<cs.length;j++){ if(cs[j].type==='note'&&cs[j].text) return cs[j] }} return null}
function curBlock(){return $('.pblock.cur')||$('.pblock')}
function refresh(){
  var open=!!$('.pblock.opened'), on=isPhone()&&M===2&&!open;
  peek.classList.toggle('on',on); document.body.classList.toggle('hasPeek',isPhone()&&M===2);
  if(!on) return;
  var b=curBlock(); if(!b) return; var p=E.paras.filter(function(x){return x.k===b.dataset.k})[0]; if(!p) return;
  var R=p.sq.length, C=Math.max.apply(null,p.sq.map(function(r){return r.length})), g=R>6?1:2,
      sz=Math.max(3,Math.min(9,Math.floor((96-(C-1)*g)/C),Math.floor((48-(R-1)*g)/R)));   // the whole grid fits the bar: every draft, every sentence
  $('.pk-grid',peek).style.gap=g+'px';
  $('.pk-grid',peek).innerHTML=p.sq.map(function(r){return '<span class="qr" style="gap:'+g+'px">'+r.split('').map(function(c){return '<span class="tile '+c+'" style="width:'+sz+'px;height:'+sz+'px"></span>'}).join('')+'</span>'}).join('');
  $('.pk-t',peek).innerHTML='<b>How ¶'+p.n+' was made</b><span>'+p.drafts+' drafts'+(p.notes?' · '+p.notes+' notes':'')+'</span>';
  if(new URLSearchParams(location.search).get('s')!=='0'){   /* simplified bar: one real, dated quote from Evan (R-1012-1051a); no mini grid, no "?" */
    var q=firstNote(p.k), qs=q?q.text.replace(/\s+/g,' ').trim():'', cut=false; if(qs.length>70){qs=qs.slice(0,70).replace(/\s+\S*$/,''); cut=true}
    $('.pk-t',peek).innerHTML='<b>How ¶'+p.n+' was made · '+p.drafts+' draft'+(p.drafts>1?'s':'')+'</b><span class="pk-quote">'+(q?'Evan, '+esc(q.at.split(' · ')[0])+': “'+esc(qs)+(cut?'…':'')+'”':'No note from Evan on this paragraph.')+'</span>';
  }
  $('.pk-main',peek).setAttribute('data-open',p.k);
}
new MutationObserver(function(){refresh(); if(window.__qd) window.__qd()}).observe($('#essay'),{subtree:true,attributes:true,attributeFilter:['class']});
addEventListener('resize',refresh); refresh();

/* ---------- 4. record dock (phone): while a record is open, a bar pinned to the bottom steps through the drafts and keeps that draft's notes on screen ---------- */
var dock=document.createElement('div'); dock.id='rdock';
dock.innerHTML='<div class="rd-panel gnote" hidden></div><div class="rd-bar"><button type="button" class="rd-prev" aria-label="Previous draft">\u2039</button><div class="rd-lab"><b></b><span></span></div><button type="button" class="rd-next" aria-label="Next draft">\u203a</button><button type="button" class="rd-notes" aria-expanded="false">Notes <i>0</i> \u25b4</button></div>';
document.body.appendChild(dock);
var rdPanel=$('.rd-panel',dock), rdNotes=$('.rd-notes',dock);
function dRows(){return $$('#pv .row').filter(function(r){return r.hasAttribute('data-i')&&$('.rowbtn',r)})}   // draft rows only: the 'His idea' seed rows are not drafts
function dIdx(){var rs=dRows(), i=-1; rs.forEach(function(r,k){ if(r.classList.contains('open')) i=k }); return i<0?rs.length:i}
function updateDock(){
  var on=isPhone()&&!!$('.pblock.opened'); dock.classList.toggle('on',on); document.body.classList.toggle('inRecord',on); if(!on) return;
  var N=dRows().length, i=dIdx(), pub=i>=N, g=$('#gnote'), cards=$$('.card',g), first=$('.card .t',g)||$('.card',g);
  var rs=dRows(), D=rs.filter(function(r){var d=$('.dn',r);return d&&/^Draft/.test(d.firstChild.textContent.trim())}).length,
      lbl=pub?'As published':(function(){var d=$('.dn',rs[i]);var t=d&&d.firstChild?d.firstChild.textContent.trim():'';return /^Draft/.test(t)?t+' of '+D:t||'Version '+(i+1)})();
  $('.rd-lab b',dock).textContent=lbl;   // named by the row itself, so a "Part of another paragraph" row is not counted as a draft
  var pv=first?String(first.textContent).replace(/\s+/g,' ').replace(/^[\u201c\u201d"'\s]+|[\u201c\u201d"'\s]+$/g,'').trim():'';
  $('.rd-lab span',dock).textContent=pub?'Tap \u203a to see Draft 1':(cards.length?(cards.length+' note'+(cards.length>1?'s':'')+(pv?' \u00b7 \u201c'+pv.slice(0,48)+(pv.length>48?'\u2026':'')+'\u201d':'')):'No note on this draft');
  $('i',rdNotes).textContent=cards.length; rdNotes.hidden=pub||!cards.length;
  rdPanel.innerHTML=g.innerHTML; if(pub||!cards.length){rdPanel.hidden=true; rdNotes.setAttribute('aria-expanded','false')}
}
function stepTo(t){ var N=dRows().length; t=(t+N+1)%(N+1);
  if(t>=N){ var pb=$('#pubbtn'); pb&&pb.click(); } else { var b=$('.rowbtn',dRows()[t]); b&&b.click(); }
  setTimeout(function(){ var tx=$('#text'); if(tx) window.scrollTo({top:tx.getBoundingClientRect().top+scrollY-74,behavior:'smooth'}); updateDock() },80);
}
$('.rd-prev',dock).addEventListener('click',function(){stepTo(dIdx()-1)});
$('.rd-next',dock).addEventListener('click',function(){stepTo(dIdx()+1)});
rdNotes.addEventListener('click',function(){ var open=rdPanel.hidden; rdPanel.hidden=!open; rdNotes.setAttribute('aria-expanded',String(open)); });
var dq=0; function qd(){ if(dq) return; dq=1; requestAnimationFrame(function(){dq=0; updateDock(); refresh(); if(window.__onRec) window.__onRec()}) } window.__qd=qd; window.__rec={dRows:dRows,dIdx:dIdx,stepTo:stepTo,isPhone:isPhone};
new MutationObserver(qd).observe($('#gnote'),{childList:true,subtree:true,characterData:true});
new MutationObserver(qd).observe(document.body,{attributes:true,attributeFilter:['class']});
new MutationObserver(qd).observe($('#rows'),{attributes:true,subtree:true,attributeFilter:['class']});
addEventListener('resize',qd); updateDock();
})();
