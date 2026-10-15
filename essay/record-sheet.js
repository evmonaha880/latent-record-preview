/* Record sheet (phones): the record opens as a layer over the page. Top: the paragraph or the selected draft with its marks.
   Bottom sheet: one line of squares per draft (all drafts visible), the notes for the selected draft, and the draft stepper.
   ?r=1 sheet (default) | ?r=0 earlier dock | ?h=40|52|55 sheet height in % | ?sq=s|m square size.  Needs essay-enhance.js. */
(function(){
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var P=new URLSearchParams(location.search), S2=P.get('s')!=='0', R=P.get('r')!=='0', H=+P.get('h')||52, SQ=P.get('sq')==='s'?'s':'m';
document.body.classList.toggle('r1',R); document.body.style.setProperty('--sheetH',H+'vh');
var pv=$('#pv'), para=$('#pv .para'), board=$('#pv .board'), ib=$('#pv .ideabox'), foot=$('#pv .pvfoot');
if(!pv||!para||!board) return;
var rec=function(){return window.__rec};
var isPhone=function(){return matchMedia('(max-width:820px)').matches};
/* phones only: on a laptop the page is left exactly as it was. Crossing the 820 px breakpoint reloads so the right layout is built. */
var mq=matchMedia('(max-width:820px)'); if(mq.addEventListener) mq.addEventListener('change',function(){location.reload()});
if(!isPhone()) return;

/* switches (mock-up only), added to the existing phone switcher */
var sw=$('.msw');
if(sw){ var add=function(label,key,opts,cur){ var g=document.createElement('span'); g.className='msw-g'; g.innerHTML='<span>'+label+'</span>'+opts.map(function(o){return '<button type="button" data-k="'+key+'" data-v="'+o[0]+'" aria-pressed="'+(String(o[0])===String(cur))+'">'+o[1]+'</button>'}).join(''); sw.appendChild(g)};
  add('Record:','r',[['1','Sheet'],['0','Earlier']],R?'1':'0'); add('Sheet height:','h',[['40','40%'],['52','52%'],['62','62%']],String(H)); add('Squares:','sq',[['s','Small'],['m','Large']],SQ);
  sw.addEventListener('click',function(e){var b=e.target.closest('[data-k]'); if(!b) return; var q=new URLSearchParams(location.search); q.set(b.dataset.k,b.dataset.v); location.search=q.toString()}) }
if(!R) return;

/* build the sheet header; move the idea box into the text pane and the next-paragraph link into the sheet */
if(ib) para.insertBefore(ib,para.firstChild);
var bar=document.createElement('div'); bar.className='sh-bar';
bar.innerHTML='<div class="sh-handle" aria-hidden="true"></div><div class="sh-row"><button type="button" class="sh-prev" aria-label="Previous draft">‹</button><div class="sh-lab"><b></b><span></span></div><button type="button" class="sh-next" aria-label="Next draft">›</button><button type="button" class="sh-pub">Published</button><button type="button" class="sh-big" aria-label="Show more or less" aria-expanded="false">⌃</button><button type="button" class="sh-x" aria-label="Back to the essay">✕</button></div><p class="sh-cap"></p>';
board.insertBefore(bar,board.firstChild); if(foot) board.appendChild(foot);
$('.sh-prev',bar).addEventListener('click',function(){rec().stepTo(rec().dIdx()-1)});
$('.sh-next',bar).addEventListener('click',function(){rec().stepTo(rec().dIdx()+1)});
$('.sh-pub',bar).addEventListener('click',function(){var b=$('#pubbtn'); b&&b.click(); setTimeout(function(){para.scrollTop=0;update()},60)});
function closeRec(){var c=$('#pvclose'); c&&c.click()}
$('.sh-x',bar).addEventListener('click',closeRec);
/* sheet states: normal, big (swipe up), peek (swipe down: only the stepper stays and the text gets the screen), then closed (swipe down again: back to the essay) */
function setState(s){board.classList.remove('big','peek'); if(s==='big') board.classList.add('big'); if(s==='peek') board.classList.add('peek'); $('.sh-big',bar).setAttribute('aria-expanded',String(s==='big')); board.style.transform=''; board.style.transition=''; fit()}
(function(){var y0=null,dy=0,t0=0,zone=bar;   // the whole header is the drag area
  zone.style.touchAction='none';
  zone.addEventListener('pointerdown',function(e){ if(e.target.closest('button')) return; y0=e.clientY; dy=0; t0=performance.now(); try{zone.setPointerCapture(e.pointerId)}catch(_){} board.style.transition='none' });
  zone.addEventListener('pointermove',function(e){ if(y0===null) return; dy=e.clientY-y0; board.style.transform='translateY('+Math.max(-40,dy)+'px)' });
  function end(){ if(y0===null) return; var v=dy/Math.max(1,performance.now()-t0), s=board.classList.contains('peek')?'peek':board.classList.contains('big')?'big':'normal'; y0=null;
    board.style.transition=''; board.style.transform='';
    if(dy>70||v>.6){ if(S2) closeRec(); else if(s==='big') setState('normal'); else if(s==='normal') setState('peek'); else closeRec() }   /* simplified sheet (?s=2): one height, swipe down closes */
    else if(dy<-50||v<-.6){ if(s==='peek') setState('normal'); else if(s==='normal') setState('big') }
    else if(Math.abs(dy)<6 && s==='peek'){ setState('normal') } }
  zone.addEventListener('pointerup',end); zone.addEventListener('pointercancel',end);
})();
$('.sh-big',bar).addEventListener('click',function(){setState(board.classList.contains('big')?'normal':'big')});

var curPub=true;
function fit(){ /* squares sized so every draft and every sentence fits the sheet width; rows are 24 px apart (30 px when there are six or fewer) so the whole row is an easy tap */
  var rows=$$('#pv .row[data-i]'); if(!rows.length) return;
  var n=rows.length, C=Math.max.apply(null,rows.map(function(r){return $$('.tile',r).length||1})), gap=C>9?2:3, rowH=curPub?(n>6?24:30):18;   /* picking a draft: roomy rows; once one is selected the grid shrinks so the notes get the room (the arrows still step) */
  var avail=board.clientWidth-32-22-8-14, sz=Math.floor((avail-(C-1)*gap)/C), cap=SQ==='s'?14:24;
  sz=Math.max(8,Math.min(cap,sz,rowH-(curPub?6:5)));
  pv.style.setProperty('--sq',sz+'px'); pv.style.setProperty('--gap',gap+'px'); pv.style.setProperty('--rowh',rowH+'px');
}
var wasOn=false;
function update(){
  var opened=!!$('.pblock.opened'), on=opened&&isPhone(); if(on&&!wasOn) setState('normal'); wasOn=on;
  document.body.classList.toggle('recOpen',on);
  var close=$('#pvclose'); if(close) close.textContent=on?'← Back to the essay':'Close the record ×';
  if(!on) return;
  var api=rec(); if(!api) return;
  var rs=api.dRows(), i=api.dIdx(), N=rs.length, pub=i>=N, g=$('#gnote'), cards=$$('.card',g); curPub=pub;
  var D=rs.filter(function(r){var d=$('.dn',r);return d&&/^Draft/.test(d.firstChild.textContent.trim())}).length;
  var t=pub?'':(function(){var d=$('.dn',rs[i]);return d&&d.firstChild?d.firstChild.textContent.trim():''})();
  var lbl=pub?'As published':(/^Draft/.test(t)?t+' of '+D:t);
  if(S2){ var pp=[],DD=0; rs.forEach(function(r){ if(r.classList.contains('merged')) pp.push(0); else {DD++; pp.push(DD)} }); D=DD; if(!pub&&pp[i]) lbl='Draft '+pp[i]+' of '+DD }   /* simplified sheet: number by position, so a split-off first row is Draft 1 */
  $('.sh-lab b',bar).textContent=lbl;
  var nn=pub?0:($$('.gc',rs[i]).length||cards.length);   /* notes on this draft, counted from the row so it stays right when a note is shown under the text */
  $('.sh-lab span',bar).textContent=pub?(S2?'Tap a row, or \u203a for the first draft':'Tap a row, or \u203a for Draft 1'):(nn?nn+' note'+(nn>1?'s':''):'No note on this draft');
  $('.sh-pub',bar).hidden=pub;
  $('.sh-cap',bar).textContent=pub?'Claude and Evan rewrote this paragraph '+D+' times. Tap a row to see that draft.':'';
  rs.forEach(function(r){var b=$('.rowbtn',r); if(!b) return; var d=$('.dn',r), lab=d&&d.firstChild?d.firstChild.textContent.trim():'', m=/^Draft (\d+)/.exec(lab);
    b.setAttribute('data-n',m?m[1]:'↳'); b.setAttribute('data-note',$('.mks',r)&&$('.mks',r).children.length?'1':'0')});
  fit();
}
window.__onRec=update;
new MutationObserver(function(){update()}).observe($('#rows'),{childList:true,subtree:true});
addEventListener('resize',function(){setTimeout(update,80)});

/* text and notes together: the page's own handler puts a tapped circle's note under the text; bring it into view. A note's number finds its place in the text. */
function flash(el){el.classList.add('flash'); setTimeout(function(){el.classList.remove('flash')},1400)}
$('#text').addEventListener('click',function(e){var pin=e.target.closest('.pin'); if(!pin||!document.body.classList.contains('recOpen')) return;
  setTimeout(function(){var m=$('#mnote'); if(m&&m.textContent.trim()) m.scrollIntoView({block:'nearest',behavior:'smooth'})},140) });
$('#gnote').addEventListener('click',function(e){var k=e.target.closest('.gc,.num'); if(!k||!document.body.classList.contains('recOpen')) return; var pin=$('#text .pin[data-n="'+k.textContent.trim()+'"]');
  if(pin){ pin.scrollIntoView({block:'center',behavior:'smooth'}); flash(pin) } });
update();
})();
