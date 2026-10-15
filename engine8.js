(function(){
var para=document.getElementById('para'),R=document.getElementById('mR'),L=R,
 stamp=document.getElementById('stamp'),bP=document.getElementById('bPause'),bR=document.getElementById('bReplay'),cap=document.getElementById('cap');
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,paused=false,run=0,cur='';
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function wait(ms,id){return new Promise(function(res,rej){var el=0,last=performance.now();(function tick(){if(id!==run){rej('x');return}var n=performance.now();if(!paused)el+=n-last;last=n;if(el>=ms)res();else setTimeout(tick,40)})()})}
function card(side,cls,label,when,text,type){var c=document.createElement('div');c.className='card '+cls;
 c.innerHTML='<div class="cl">'+esc(label)+(when?' <span>'+esc(when)+'</span>':'')+'</div><div class="ct"></div>';side.appendChild(c);var ct=c.querySelector('.ct');
 requestAnimationFrame(function(){requestAnimationFrame(function(){c.classList.add('in')})});
 c.set=function(label2,txt){c.querySelector('.cl').innerHTML=esc(label2)+(when?' <span>'+esc(when)+'</span>':'');ct.textContent=txt;c.classList.remove('typing')};
 if(!text)return Promise.resolve(c);if(!type||reduce){ct.textContent=text;return Promise.resolve(c)}
 /* the full text sits invisibly in the card so its height never changes while the typed layer fills in */
 ct.innerHTML='<span class="gh"></span><span class="ty"></span>';ct.firstChild.textContent=text;var ty=ct.lastChild;
 return new Promise(function(res){var id=run,dur=Math.max(700,Math.min(1800,text.length*24)),el=0,last=performance.now();(function k(){if(id!==run){res(c);return}var t=performance.now();if(!paused)el+=t-last;last=t;var n=Math.min(text.length,Math.ceil(text.length*el/dur));ty.textContent=text.slice(0,n);if(n<text.length)requestAnimationFrame(k);else res(c)})()})}
function typeCard(c,text){var ct=c.querySelector('.ct');c.classList.remove('typing');if(reduce){ct.textContent=text;return Promise.resolve()}
 return new Promise(function(res){var id=run,dur=Math.max(700,Math.min(2200,text.length*14)),el=0,last=performance.now();(function k(){if(id!==run){res();return}var t=performance.now();if(!paused)el+=t-last;last=t;var n=Math.min(text.length,Math.ceil(text.length*el/dur));ct.textContent=text.slice(0,n);if(n<text.length)setTimeout(k,30);else res()})()})}
function plural(n,w){return n+' '+w+(n===1?'':'s')}
async function claudeWorking(i,id,first){var who=DRAFTS[i].who==='Claude';
 var cl=await card(R,'claude working',first?'Claude is drafting':(who?'Claude is rewriting':'I edited, Claude is finishing'),'','',false);
 var ct=cl.querySelector('.ct');ct.innerHTML='<div class="steps"><span class="st on">Reading '+(first?'my message':'my note')+'</span><span class="st">'+(first?'Writing the first version':'Rewriting the sentence')+'</span></div><div class="bar"><i></i></div>';
 var sts=ct.querySelectorAll('.st');setTimeout(function(){if(id===run&&sts[0]){sts[0].classList.add('done');sts[1].classList.add('on')}},900);
 return cl}
function finishCard(cl,m,p,first,i){if(!cl||!cl.parentNode)return;var h0=cl.offsetHeight;cl.classList.remove('working');cl.classList.add('done');
 var who=DRAFTS[i].who==='Claude';cl.querySelector('.cl').innerHTML=(first?'Claude drafted it':(who?'Claude rewrote it':'I edited, Claude finished'));
 var chips=first?'<span class="chip p">+ '+plural(p,'word')+' written</span>':(m?'<span class="chip m">− '+plural(m,'word')+' cut</span>':'')+(p?'<span class="chip p">+ '+plural(p,'word')+' added</span>':'');
 cl.querySelector('.ct').innerHTML='<div class="res">'+chips+'</div>';
 /* the card shrinks from its working height to the chip row with a transition, not a jump */
 cl.style.height='auto';var h1=cl.offsetHeight;cl.style.height=h0+'px';void cl.offsetHeight;cl.style.height=h1+'px';setTimeout(function(){if(cl.parentNode&&!cl.classList.contains('take'))cl.style.height=''},800)}
function takeIn(c,dir){if(!c)return;var gap=0;try{gap=parseFloat(getComputedStyle(c.parentNode).rowGap)||0}catch(e){}
 c.style.height=c.offsetHeight+'px';c.style.overflow='hidden';void c.offsetHeight;c.classList.add('take');c.style.setProperty('--dx',(dir*90)+'px');
 setTimeout(function(){c.style.height='0px';c.style.paddingTop='0px';c.style.paddingBottom='0px';c.style.marginTop=(-gap)+'px'},420);
 setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c)},1200)}
function words(df){return df.map(function(x){return x[0]==='='?esc(x[1])+' ':x[0]==='-'?'<span class="d">'+esc(x[1])+' </span>':'<span class="n pre">'+esc(x[1])+' </span>'}).join('')}
function count(a,b){var df=diff(a,b),p=0,m=0;df.forEach(function(x){if(x[0]==='+')p++;if(x[0]==='-')m++});return[m,p]}
async function applyDraft(i,id,first,cc){var tx=DRAFTS[i].t;
 var df=first?tx.split(' ').map(function(w){return['+',w]}):diff(cur,tx);
 para.innerHTML=words(df);var ns=para.querySelectorAll('.n.pre');
 await wait(60,id);ns.forEach(function(n,q){n.style.transitionDelay=(q*(first?55:70))+'ms';n.classList.remove('pre')});
 var ds=para.querySelectorAll('.d');ds.forEach(function(d,q){d.style.transitionDelay=(q*40)+'ms'});
  await wait(Math.min(1800,500+ns.length*70),id);
 if(cc){var cm=first?[0,tx.split(' ').length]:count(cur,tx);finishCard(cc,cm[0],cm[1],first,i)}
 ds.forEach(function(d){d.classList.add('gone')});await wait(950,id);ds.forEach(function(d){if(d.parentNode)d.parentNode.removeChild(d)});
 cur=tx}
function setCap(t){if(cap)cap.textContent=t}
var pgs=document.querySelectorAll('#pg i'),pgl=document.getElementById('pgl');
function setDraft(n){var nm=document.getElementById('num');if(nm)nm.textContent=(n<10?'0':'')+n;[].forEach.call(pgs,function(p,k){p.className=k+1<n?'d':k+1===n?'on':''});if(pgl)pgl.textContent=n?'Draft '+n+' of 7':'Draft 0 of 7';if(window.onDraft)window.onDraft(n)}
async function play(){var id=++run;
 try{
 window.onBeat&&window.onBeat(0);
 L.innerHTML='';R.innerHTML='';cur='';para.className='para';
 /* page opens blank: no sentence is shown before the first chat message */
 setDraft(0);para.innerHTML='';stamp.textContent='';setCap('One sentence, seven drafts. My note goes in, Claude\u2019s rewrite comes out. A replay.');await wait(350,id);
 window.onBeat&&window.onBeat(1);var c=await card(L,'chat','My chat message',STEPS[0].when,STEPS[0].text.replace('him being','[Eastman] being'),true);stamp.textContent='';
 await wait(450,id);var cl=await claudeWorking(0,id,true);
 stamp.textContent='Draft 1';await wait(1700,id);setDraft(1);
 await applyDraft(0,id,true,cl);await wait(1700,id);takeIn(c,1);takeIn(cl,1);await wait(800,id);
 for(var s=2;s<STEPS.length;s+=2){var note=STEPS[s],d=STEPS[s+1].d;
  window.onBeat&&window.onBeat(DRAFTS[d].n);var n=await card(R,'note','My note',note.when,note.text,true);
  await wait(550,id);var cc=await claudeWorking(d,id,false);
  stamp.textContent='Draft '+DRAFTS[d].n;await wait(1700,id);setDraft(DRAFTS[d].n);
  await applyDraft(d,id,false,cc);
  await wait(1900,id);takeIn(n,-1);takeIn(cc,1);await wait(800,id)}
 stamp.textContent='Draft 7 · the published sentence';setDraft(7);para.classList.add('final');setCap('Seven drafts later, this is the sentence the essay opens with.');await wait(5200,id);para.classList.remove('final');
 if(id===run)play()}catch(e){}}
function still(){L.innerHTML='';R.innerHTML='';para.textContent=DRAFTS[6].t;cur=DRAFTS[6].t;
 card(L,'chat','My chat message',STEPS[0].when,STEPS[0].text.replace('him being','[Eastman] being'),false);card(R,'note','My note',STEPS[2].when,STEPS[2].text,false);card(R,'note','My note',STEPS[8].when,STEPS[8].text,false);
 stamp.textContent='Draft 7 · the published sentence';setDraft(7);setCap('The published first sentence, with the chat message and notes that shaped it.');[].forEach.call(document.querySelectorAll('.card'),function(c){c.classList.add('in')})}
if(bP)bP.onclick=function(){paused=!paused;bP.textContent=paused?'Play':'Pause'};
if(bR)bR.onclick=function(){if(reduce)return;paused=false;if(bP)bP.textContent='Pause';play()};
/* copy options: ?copy=1..3 swaps the wording, so the options can be compared on the page */
if(window.COPY){var q=/copy=(\d+)/.exec(location.search),k=q?+q[1]:1,C=COPY[k-1]||COPY[0];
 [['sub','sub'],['concept','concept'],['blurb','blurb'],['ctaL','ctaL'],['ctaS','ctaS']].forEach(function(p){var el=document.getElementById(p[0]);if(el&&C[p[1]]!=null)el.innerHTML=C[p[1]]});
 var tag=document.getElementById('copytag');if(tag)tag.textContent='Copy option '+k+': '+C.name}
if(reduce){document.documentElement.classList.add('still');still();if(bP)bP.style.display='none';if(bR)bR.style.display='none'}else{var imgs=[document.querySelector('.can img'),document.getElementById('ph')];/* start the animation once the canister and photo are in (or after 3.5 s) so it never plays against half-loaded pictures */
 Promise.race([Promise.all(imgs.map(function(i){return !i||(i.complete&&i.naturalWidth)?1:new Promise(function(r){i.addEventListener('load',r);i.addEventListener('error',r)})})),new Promise(function(r){setTimeout(r,3500)})]).then(play)}
var ov=document.getElementById('ov'),open=function(){ov.classList.add('show')},close=function(){ov.classList.remove('show');try{localStorage.setItem('lr-seen','1')}catch(e){}};
[].forEach.call(document.querySelectorAll('[data-how]'),function(a){a.onclick=function(e){e.preventDefault();open()}});
[].forEach.call(document.querySelectorAll('[data-close]'),function(a){a.onclick=close});
var seen=false;try{seen=localStorage.getItem('lr-seen')}catch(e){}
if(/overlay=1/.test(location.search)||(!seen&&/first=1/.test(location.search)))open();

/* phone: when a note or Claude card appears or the sentence grows, scroll down just far enough to show the lowest card above the button bar, but never so far that the sentence leaves the top of the screen. Only runs while the animation is on screen, and stops for a few seconds after the visitor scrolls by hand. */
(function(){if(!window.matchMedia||!window.ResizeObserver)return;var mq=matchMedia('(max-width:1100px)'),manual=-1e9,armed=false,pending=0,stage=document.querySelector('.stage'),bar=document.querySelector('.ctarow');
 ['wheel','touchstart','touchmove','keydown','mousedown'].forEach(function(ev){addEventListener(ev,function(){manual=performance.now()},{passive:true})});
 /* auto-scroll stays off until the visitor has scrolled by hand once, so the title is read first and the page never moves on its own at load */
 ['wheel','touchmove','keydown'].forEach(function(ev){addEventListener(ev,function(){armed=true},{passive:true})});
 function check(){pending=0;if(!armed||!mq.matches||reduce||paused)return;if(performance.now()-manual<5000)return;
  var sr=stage.getBoundingClientRect(),vh=innerHeight;if(sr.top>vh-140||sr.bottom<80)return;
  var limit=vh-bar.getBoundingClientRect().height-14,cards=[].filter.call(R.querySelectorAll('.card'),function(c){return !c.classList.contains('take')}),last=cards[cards.length-1],
   lowest=Math.max(last?last.getBoundingClientRect().bottom:0,para.getBoundingClientRect().bottom);
  if(lowest<=limit)return;var d=Math.min(lowest-limit,Math.max(para.getBoundingClientRect().top-70,0));if(d>2)scrollBy({top:d,behavior:'smooth'})}
 var mh=0; /* the stage never gets shorter than its tallest moment, so cards leaving cannot shorten the page and yank the scroll position back up */
 var lastW=innerWidth,rt=0;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if(innerWidth!==lastW){lastW=innerWidth;mh=0;stage.style.minHeight=''}},250)});addEventListener('orientationchange',function(){setTimeout(function(){lastW=innerWidth;mh=0;stage.style.minHeight=''},300)});
 new ResizeObserver(function(){if(mq.matches){var h=stage.getBoundingClientRect().height;if(h>mh+1){mh=h;stage.style.minHeight=h+'px'}}else if(mh){mh=0;stage.style.minHeight=''}
  if(!pending){pending=1;setTimeout(check,160)}}).observe(stage)})();
})();
