(function(){
var src=document.querySelector('nav.pages'); if(!src) return;
var bar=document.createElement('div'); bar.className='navpeek'; bar.setAttribute('aria-hidden','true');
var nav=src.cloneNode(true); nav.removeAttribute('class'); nav.setAttribute('aria-label','Pages of this site (quick menu)');
var short={'The essay':'Essay','How it was made':'How it\'s made','The thesis':'Thesis','What was cut':'Cut','The sources':'Sources'}; nav.querySelectorAll('a').forEach(function(a){var t=a.textContent.trim(); if(short[t]) a.textContent=short[t]});
nav.querySelectorAll('a').forEach(function(a){a.tabIndex=-1});
bar.appendChild(nav); document.body.appendChild(bar);
var last=window.pageYOffset||0, up=0, down=0, shown=false, tick=false;
function show(){ if(!shown){shown=true; bar.classList.add('on'); bar.removeAttribute('aria-hidden'); nav.querySelectorAll('a').forEach(function(a){a.tabIndex=0})} }
function hide(){ if(shown){shown=false; bar.classList.remove('on'); bar.setAttribute('aria-hidden','true'); nav.querySelectorAll('a').forEach(function(a){a.tabIndex=-1})} up=0 }
function onScroll(){
  var y=window.pageYOffset||0, max=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
  if(y<0||y>max){ last=Math.min(Math.max(y,0),max); return }          // rubber-band: ignore
  var d=y-last; last=y;
  if(y<140){ hide(); return }                                       // near the top the page's own menu is on screen
  if(d<0){ up+=-d; down=0; if(up>=36) show() }
  else if(d>0){ down+=d; up=0; if(down>=8) hide() }
}
window.addEventListener('scroll',function(){ if(tick) return; tick=true; requestAnimationFrame(function(){tick=false; onScroll()}) },{passive:true});
['pointerdown','keydown'].forEach(function(t){ document.addEventListener(t,function(e){ if(shown && !bar.contains(e.target)) hide() },true) });
})();
