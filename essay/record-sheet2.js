/* Simplified phone record (?s=2), built from the round-2 review (vault: Phone Record — Designer Panel, 10/12 responses).
   One fixed sheet height; three rows of the Wordle (previous and next faded, current in full colour); "part of a longer ¶" rows folded into one row (R-1012-1052a, phones only);
   one note card under the grid with "+N more"; legend behind a small tap; no Published chip, expand arrow, ✕ or next-paragraph link. Needs record-sheet.js. */
(function(){
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var P=new URLSearchParams(location.search), S2=P.get('s')!=='0';
var sw=$('.msw');
if(sw){ var bs=document.createElement('span'); bs.className='bld'; bs.style.cssText='display:block;font-size:11px;opacity:.6;margin-top:4px'; bs.textContent='build 10/12 3:10pm (sheet v14)'; sw.appendChild(bs); var g=document.createElement('span'); g.className='msw-g'; g.innerHTML='<span>Sheet:</span>'+[['0','Current'],['2','Simplified']].map(function(o){return '<button type="button" data-k="s" data-v="'+o[0]+'" aria-pressed="'+((S2?'2':'0')===o[0])+'">'+o[1]+'</button>'}).join(''); sw.appendChild(g) }
if(!S2||P.get('r')==='0'||!matchMedia('(max-width:820px)').matches) return;
var pv=$('#pv'), board=$('#pv .board'), bar=$('.sh-bar'), rowsEl=$('#rows'), gnote=$('#gnote'); if(!pv||!board||!bar||!rowsEl||!gnote) return;
document.body.classList.add('s2');
var rec=function(){return window.__rec};

/* legend behind a small tap */
var cap=$('.sh-cap',bar), q=document.createElement('button'); q.type='button'; q.className='s2q'; q.setAttribute('aria-expanded','false'); q.textContent='What do the colours mean?';
bar.appendChild(q);
var leg=document.createElement('div'); leg.className='s2leg'; leg.hidden=true;
leg.innerHTML='<span><i class="sw g"></i>Kept as is</span><span><i class="sw y"></i>Kept, reworded</span><span><i class="sw x"></i>Cut</span><span><i class="rd"></i>Evan left a note</span>';
bar.appendChild(leg);
q.addEventListener('click',function(){leg.hidden=!leg.hidden; q.setAttribute('aria-expanded',String(!leg.hidden))});

/* arrows step over folded rows */
var unfolded=false, lastBlock='';
function allowed(rows){return rows.map(function(r,i){return (!r.classList.contains('merged')||unfolded)?i:-1}).filter(function(i){return i>=0})}
function step(dir){var api=rec(); if(!api) return; var rows=api.dRows(), N=rows.length, i=api.dIdx(), ok=allowed(rows), t;
  if(dir>0){ t=ok.filter(function(k){return k>i})[0]; if(t===undefined) t=(i>=N&&ok.length)?ok[0]:N }   /* from "as published" the arrow goes to the first draft */
  else { t=ok.filter(function(k){return k<i}).pop(); if(t===undefined){ if(i<N) t=N; else return } }   /* ‹ on the first draft goes back to the finished paragraph */
  api.stepTo(t) }
['.sh-prev','.sh-next'].forEach(function(sel,n){ var b=$(sel,bar); b.addEventListener('click',function(e){e.stopImmediatePropagation(); step(n?1:-1)},true) });

/* the first row of a split-off paragraph is not named "Draft 1", so the page counted "Draft 3 of 2": number the rows by position instead */
function relabel(){
  var api=rec(); if(!api||!document.body.classList.contains('recOpen')) return;
  var rs=api.dRows(), i=api.dIdx(), N=rs.length, pub=i>=N, k=0, D=0, pos=[];
  rs.forEach(function(r){ if(r.classList.contains('merged')) pos.push(0); else {D++; pos.push(D)} });
  rs.forEach(function(r,j){ var b=$('.rowbtn',r); if(b&&pos[j]&&b.getAttribute('data-n')!==String(pos[j])) b.setAttribute('data-n',String(pos[j])) });
  var lab=$('.sh-lab b',bar), sub=$('.sh-lab span',bar), cp=$('.sh-cap',bar);
  if(pub){ if(sub&&/Draft 1/.test(sub.textContent)) setTxt(sub,'Tap a row, or \u203a for the first draft'); if(cp) setTxt(cp,'Claude and Evan rewrote this paragraph '+D+' time'+(D>1?'s':'')+'. Tap a row to see that draft.') }
  else if(lab&&pos[i]) setTxt(lab,'Draft '+pos[i]+' of '+D);
}
window.__relabel=relabel; var obs;
/* Every change below goes through these helpers, which touch the page only when something differs. A real finger press lasts 100 ms or more, so any button that is
   rebuilt or re-written while it is held loses the tap; the earlier build rebuilt the folded row and the "+N more" button hundreds of times a second. */
function setCls(el,c,on){ if(el.classList.contains(c)!==!!on) el.classList.toggle(c,!!on) }
function setTxt(el,t){ if(el.textContent!==t) el.textContent=t }
var folds=[], moreBtn=null, busy=false;
function arrange(){
  if(busy||!document.body.classList.contains('recOpen')) return;
  var blk=$('.pblock.opened'); var id=blk?blk.id:''; if(id!==lastBlock){unfolded=false; lastBlock=id}
  var api=rec(); if(!api) return;
  busy=true; obs.disconnect(); obs2.disconnect();
  try{
    relabel();
    var rows=$$('.row',rowsEl).filter(function(r){return !r.classList.contains('seed')&&!r.classList.contains('s2fold')});
    var L=[], runs=[], run=[];
    rows.forEach(function(r){ if(r.classList.contains('merged')) run.push(r); else { if(run.length){runs.push(run); run=[]} } });
    if(run.length) runs.push(run);
    /* one fold row per run of "part of a longer ¶" rows; existing ones are reused, never rebuilt */
    folds=folds.filter(function(f){ if(runs.some(function(m){return m[0]===f._first})) return true; f.remove(); return false });
    var k=0; run=[];
    function place(mine){
      var f=folds.filter(function(x){return x._first===mine[0]})[0];
      if(!f){ f=document.createElement('div'); f.className='row s2fold'; f.setAttribute('role','button'); f.tabIndex=0;
        f.innerHTML='<span class="s2fl"></span>'; f._first=mine[0];
        f.addEventListener('click',function(){ unfolded=!unfolded; if(unfolded){var b=$('.rowbtn',f._mine[0]); b&&b.click()} else {arrange()} });
        folds.push(f) }
      f._mine=mine;
      setTxt($('.s2fl',f),unfolded?'▾ Hide the steps':'↳ '+mine.length+' step'+(mine.length>1?'s':'')+' as part of a longer ¶ ▸');
      if(f.nextSibling!==mine[0]||f.parentNode!==mine[0].parentNode) mine[0].parentNode.insertBefore(f,mine[0]);
      if(unfolded){ L.push(f); mine.forEach(function(r){L.push(r)}) } else { L.push(f) } }
    rows.forEach(function(r){ if(r.classList.contains('merged')) run.push(r); else { if(run.length){place(run); run=[]} L.push(r) } });
    if(run.length) place(run);
    var cur=L.filter(function(r){return r.classList.contains('open')})[0], pub=!cur, c=pub?L.length-1:L.indexOf(cur);
    var a=Math.max(0,Math.min(c-1,L.length-3)), z=Math.min(L.length,a+3);
    rows.forEach(function(r){ var i=L.indexOf(r); setCls(r,'s2hide',i<a||i>=z); setCls(r,'s2dim',!pub&&r!==cur&&i>=a&&i<z) });
    folds.forEach(function(f){ var i=L.indexOf(f); setCls(f,'s2hide',i<a||i>=z); setCls(f,'s2dim',!pub&&i>=a&&i<z) });
    /* one note card under the grid, "+N more" for the rest; clock times and job labels off the phone (dates and Evan's words stay) */
    var cards=$$('.card',gnote);
    cards.forEach(function(cd){
      var at=$('.at',cd); if(at){ if(!at.dataset.o) at.dataset.o=at.textContent; var d=at.dataset.o.split(' · ')[0]; setTxt(at,d) }
      var job=$('.job',cd); if(job&&cd.classList.contains('note')&&$('.num',job)){ var tn=[].slice.call(job.childNodes).filter(function(n){return n.nodeType===3}).pop(); if(tn&&tn.textContent!==' Evan') tn.textContent=' Evan' } });
    var showAll=gnote.classList.contains('s2all')||cards.length<=1;
    var first=cards.filter(function(cd){return cd.classList.contains('note')&&cd.dataset.n})[0]||cards[0];
    cards.forEach(function(cd){ setCls(cd,'s2hide',!showAll&&cd!==first) });
    setCls(gnote,'s2clamp',!showAll);
    if(!showAll){
      if(!moreBtn){ moreBtn=document.createElement('button'); moreBtn.type='button'; moreBtn.className='s2more';
        moreBtn.addEventListener('click',function(){ gnote.classList.add('s2all'); arrange() }) }
      setTxt(moreBtn,'+'+(cards.length-1)+' more');
      if(moreBtn.previousElementSibling!==first) first.after(moreBtn)   /* right under the one visible note, so it is never below the fold */
    } else if(moreBtn&&moreBtn.parentNode){ moreBtn.remove() }
  } finally {
    obs.observe(rowsEl,{childList:true,subtree:true,attributes:true,attributeFilter:['class']}); obs2.observe(gnote,{childList:true});
    setTimeout(function(){busy=false},0)
  }
}
var pend=0; function later(){ if(pend) return; pend=1; setTimeout(function(){pend=0; arrange()},30) }
var obs2=new MutationObserver(later);
obs=new MutationObserver(later);
/* a new draft selected: show one note card again */
/* opening the record means he wants the progression: start on the first draft (unless a numbered circle already picked one); the last arrow ends on "As published" */
var wasOpen=false;
setInterval(function(){ var on=document.body.classList.contains('recOpen'); if(on&&!wasOpen){ wasOpen=true; setTimeout(function(){ var api=rec(); if(api&&api.dIdx()>=api.dRows().length) step(1) },120) } else if(!on) wasOpen=false },100);
var prevIdx=-2; setInterval(relabel,150);
setInterval(function(){ var api=rec(); if(!api||!document.body.classList.contains('recOpen')) return; var i=api.dIdx(); if(i!==prevIdx){prevIdx=i; gnote.classList.remove('s2all'); arrange()} },200);
obs.observe(rowsEl,{childList:true,subtree:true,attributes:true,attributeFilter:['class']}); obs2.observe(gnote,{childList:true});
})();
