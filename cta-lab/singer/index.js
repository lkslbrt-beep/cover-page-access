/* CPA kinetic hero: singer A (live stage). Real footage, volumetric spotlights that follow the cursor,
   stage haze, tap = beat drop: light flash, beam sweep, equalizer rise. Silent by design. */
(function(){
var S=document.currentScript,B=S?S.src.replace(/[^/]*$/,''):'https://cpa-cta-singer.netlify.app/';
var root=document.getElementById('cdk-sng');if(!root)return;
var mount=root.querySelector('[data-cxd3]');
var IT=/^\/it(\/|$)/.test(location.pathname),RM=matchMedia('(prefers-reduced-motion: reduce)').matches,PH=innerWidth<768;
var css=document.createElement('style');css.textContent=
'#cdk-sng .cs-v,#cdk-sng canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}'+
'#cdk-sng .cs-v{opacity:0;transition:opacity .8s;transform-origin:65% 45%}#cdk-sng .cs-v.on{opacity:1}'+
'#cdk-sng .cs-c{mix-blend-mode:screen}'+
'#cdk-sng .cs-f{position:absolute;inset:0;pointer-events:none;background:radial-gradient(60% 80% at var(--mx,70%) 30%,rgba(255,170,120,.55),transparent 70%);mix-blend-mode:screen;opacity:var(--fl,0)}'+
'#cdk-sng .cxd3-tap{position:absolute;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;border:2px solid #f0874e;pointer-events:none;animation:csTap .7s ease-out forwards;z-index:3}'+
'@keyframes csTap{to{transform:scale(8);opacity:0}}'+
'#cdk-sng .cxd3-hint{position:absolute;z-index:3;pointer-events:none;width:56px;height:56px;margin:-28px 0 0 -28px}'+
'#cdk-sng .cxd3-hint i{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(255,255,255,.75);animation:csHint 1.6s ease-out infinite}'+
'#cdk-sng .cxd3-hint i+i{animation-delay:.5s}#cdk-sng .cxd3-hint b{position:absolute;top:62px;left:50%;transform:translateX(-50%);font:700 9px/1 Inter,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#fff;white-space:nowrap}'+
'@keyframes csHint{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.4);opacity:0}}';
document.head.appendChild(css);
var v,c,ctx,go=false,taps=0,flash=0,sweep=0,mx=.7,my=.3,tmx=.7,haze=[],eq=[],W=0,H=0,vis=true;
function el(t,cl){var e=document.createElement(t);e.className=cl;return e}
function start(){
 if(go)return;go=true;
 v=el('video','cs-v');v.muted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='auto';
 v.src=B+(PH?'stage-m.mp4':'stage.mp4');
 c=el('canvas','cs-c');ctx=c.getContext('2d');
 mount.appendChild(v);mount.appendChild(c);mount.appendChild(el('div','cs-f'));
 v.addEventListener('playing',function(){v.classList.add('on')},{once:true});
 v.play().catch(function(){});
 size();addEventListener('resize',size);
 for(var i=0;i<(PH?18:34);i++)haze.push({x:Math.random(),y:Math.random(),r:.15+Math.random()*.3,s:.00006+Math.random()*.00012,a:.04+Math.random()*.06});
 for(var j=0;j<(PH?18:36);j++)eq.push(0);
 if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting},{rootMargin:'100px'}).observe(root);
 if(!RM)requestAnimationFrame(loop);
 hints();
}
function size(){var r=root.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,PH?1:1.25);W=r.width;H=r.height;c.width=W*d;c.height=H*d;ctx.setTransform(d,0,0,d,0,0)}
var last=0;
function loop(t){
 requestAnimationFrame(loop);
 if(!vis)return;
 if(PH&&t-last<33)return;last=t;
 var r=root.getBoundingClientRect(),p=Math.min(1,Math.max(0,-r.top/Math.max(1,r.height)));
 if(PH)tmx=.6+Math.sin(t/3200)*.25;
 mx+=(tmx-mx)*.06;
 v.style.transform='scale('+(1.05+p*.12+flash*.03)+') translateY('+(p*-24)+'px)';
 root.style.setProperty('--mx',(mx*100).toFixed(1)+'%');root.style.setProperty('--fl',(flash*.9).toFixed(3));
 ctx.clearRect(0,0,W,H);
 // spotlight cones from the rig above
 var rig=[.18,.42,.66,.9],k;
 for(k=0;k<rig.length;k++){
  var ox=rig[k]*W,sw=Math.sin(t/(1800+k*400)+k)*.18+(sweep*Math.sin(t/120+k)*.4),
      tx=(k%2?mx:(1-mx*.6))*W+sw*W*.4,ty=H*1.05,a=(.06+flash*.18)*(k===1||k===2?1.2:.8);
  var g=ctx.createLinearGradient(ox,0,tx,ty);g.addColorStop(0,'rgba(255,'+(200-k*25)+','+(160+k*20)+','+(a*2.2)+')');g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g;ctx.beginPath();var wd=W*(.07+flash*.03);ctx.moveTo(ox-6,-4);ctx.lineTo(ox+6,-4);ctx.lineTo(tx+wd,ty);ctx.lineTo(tx-wd,ty);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,240,220,'+(.5+flash*.5)+')';ctx.beginPath();ctx.arc(ox,2,3+flash*3,0,7);ctx.fill();
 }
 // haze
 for(k=0;k<haze.length;k++){var h=haze[k];h.x+=h.s;if(h.x>1.2)h.x=-.2;
  var hg=ctx.createRadialGradient(h.x*W,h.y*H,0,h.x*W,h.y*H,h.r*W);hg.addColorStop(0,'rgba(200,190,255,'+(h.a*(1+flash))+')');hg.addColorStop(1,'rgba(200,190,255,0)');
  ctx.fillStyle=hg;ctx.fillRect(h.x*W-h.r*W,h.y*H-h.r*W,h.r*W*2,h.r*W*2)}
 // equalizer at stage floor
 var n=eq.length,bw=W/n;
 for(k=0;k<n;k++){var target=(.04+.05*Math.abs(Math.sin(t/260+k*.7))+flash*(.18+.2*Math.random()))*H;eq[k]+=(target-eq[k])*.25;
  var eg=ctx.createLinearGradient(0,H,0,H-eq[k]);eg.addColorStop(0,'rgba(226,91,30,.55)');eg.addColorStop(1,'rgba(226,91,30,0)');
  ctx.fillStyle=eg;ctx.fillRect(k*bw+bw*.2,H-eq[k],bw*.6,eq[k])}
 flash*=.93;sweep*=.96;
}
function tap(e){
 if(e.target.closest('a,button'))return;start();
 var r=root.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
 flash=1;sweep=1;tmx=x/r.width;
 var t=el('span','cxd3-tap');t.style.left=x+'px';t.style.top=y+'px';root.appendChild(t);setTimeout(function(){t.remove()},800);
 if(navigator.vibrate)try{navigator.vibrate(10)}catch(_){}
 if(++taps>=4)root.querySelectorAll('.cxd3-hint').forEach(function(h){h.remove()});
}
function hints(){
 if(RM)return;var lbl=IT?'tocca':'tap';
 (function one(){if(taps>=4||!document.contains(root))return;
  var h=el('span','cxd3-hint');h.innerHTML='<i></i><i></i><b>'+lbl+'</b>';
  h.style.left=55+Math.random()*35+'%';h.style.top=25+Math.random()*40+'%';
  root.appendChild(h);setTimeout(function(){h.remove()},1400);setTimeout(one,1400)})();
}
root.addEventListener('pointerdown',tap);
root.addEventListener('pointermove',function(e){var r=root.getBoundingClientRect();tmx=(e.clientX-r.left)/r.width});
['pointermove','pointerdown','scroll','keydown','touchstart'].forEach(function(t){addEventListener(t,start,{once:true,passive:true})});
addEventListener('load',function(){setTimeout(function(){(window.requestIdleCallback||setTimeout)(start)},2500)});
})();
