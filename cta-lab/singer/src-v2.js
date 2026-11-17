/* CPA singer hero v2: real 3D stage in three.js. Editorial footage on a screen plane, a lighting truss with
   moving head lamps, volumetric beams (noise shader), 3D haze, bloom. Cursor aims the rig, tap = beat drop. Silent. */
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';

(function(){
var S=document.currentScript,B=S?S.src.replace(/[^/]*$/,''):'https://cpa-cta-singer.netlify.app/';
var root=document.getElementById('cdk-sng');if(!root)return;
var mount=root.querySelector('[data-cxd3]');
var IT=/^\/it(\/|$)/.test(location.pathname),RM=matchMedia('(prefers-reduced-motion: reduce)').matches,PH=innerWidth<768;
if(RM)return;
var css=document.createElement('style');css.textContent=
'#cdk-sng [data-cxd3] canvas{position:absolute;inset:0;width:100%!important;height:100%!important;opacity:0;transition:opacity .6s}#cdk-sng [data-cxd3] canvas.on{opacity:1}'+
'#cdk-sng .cxd3-hint{position:absolute;z-index:3;pointer-events:none;width:56px;height:56px;margin:-28px 0 0 -28px}'+
'#cdk-sng .cxd3-hint i{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(255,255,255,.75);animation:csHint 1.6s ease-out infinite}'+
'#cdk-sng .cxd3-hint i+i{animation-delay:.5s}#cdk-sng .cxd3-hint b{position:absolute;top:62px;left:50%;transform:translateX(-50%);font:700 9px/1 Inter,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#fff;white-space:nowrap}'+
'@keyframes csHint{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.4);opacity:0}}';
document.head.appendChild(css);

var CFG=IT?{v:'stage-it',fog:.03,cols:[0xffc58a,0xfff0dc,0xff9f5a],xs:[-1.5,3.5,6.5],pxs:[-1.6,1.4],hit:[[.8,.38],[.8,.45],[.55,.7]],pm:[.64,.38],tint:.62}:{v:'stage',fog:.035,cols:[0xffb27a,0x9fb8ff,0xffe2c4,0x9fb8ff],xs:[-6,-2.4,2.4,6],pxs:[-1.5,1.5],hit:[[.3,.6],[.5,.28],[.55,.3],[.75,.6]],pm:[.5,.3],tint:.5};
var go=false,pools=[],dustU,renderer,scene,cam,composer,bloom,video,screen,beams=[],heads=[],haze,taps=0,flash=0,sweep=0,vis=true,W=1,H=1;
var aim=new THREE.Vector2(.3,0),aimT=new THREE.Vector2(.3,0),t0=performance.now();

var beamV='varying vec3 vP;varying vec3 vN;varying vec3 vW;varying float vY;void main(){vY=uv.y;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(normalMatrix*normal);vec4 mv=viewMatrix*w;vP=-mv.xyz;gl_Position=projectionMatrix*mv;}';
var beamF='uniform vec3 col;uniform float t;uniform float k;varying vec3 vP;varying vec3 vN;varying vec3 vW;varying float vY;'+
'float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}'+
'float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}'+
'void main(){float fr=pow(abs(dot(normalize(vN),normalize(vP))),1.3);float along=pow(vY,1.6);'+
'float smoke=.55+.45*n(vW*1.4+vec3(0.,-t*.35,t*.2))*n(vW*3.1+vec3(t*.25,0.,0.));'+
'float a=fr*along*smoke*k;gl_FragColor=vec4(col*a,a);}';

function start(){
 if(go)return;go=true;
 try{renderer=new THREE.WebGLRenderer({antialias:!PH,alpha:true,powerPreference:'high-performance'});}catch(e){return}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,PH?1:1.5));renderer.setClearColor(0x000000,0);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 mount.appendChild(renderer.domElement);
 scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x05070d,CFG.fog);
 cam=new THREE.PerspectiveCamera(38,1,.1,100);cam.position.set(0,0,10);

 // editorial footage on a screen plane, deep in the stage
 video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.setAttribute('playsinline','');video.crossOrigin='anonymous';
 video.src=B+CFG.v+(PH?'-m.mp4':'.mp4');video.play().catch(function(){});
 var vt=new THREE.VideoTexture(video);vt.colorSpace=THREE.SRGBColorSpace;
 screen=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:vt,color:0xc9ccd6,fog:false}));
 screen.position.z=-6;scene.add(screen);

 // truss and moving heads, real lit geometry
 scene.add(new THREE.HemisphereLight(0x8aa0ff,0x100804,.6));
 var key=new THREE.PointLight(0xffd2a8,25,30);key.position.set(0,6,4);scene.add(key);
 var metal=new THREE.MeshStandardMaterial({color:0x2a2c31,metalness:.9,roughness:.35});
 var truss=new THREE.Group();scene.add(truss);
 var bar=new THREE.Mesh(new THREE.BoxGeometry(30,.18,.18),metal);truss.add(bar);
 var bar2=bar.clone();bar2.position.y=.5;truss.add(bar2);
 for(var d=-14;d<=14;d+=.7){var r=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.72,6),metal);r.position.set(d,.25,0);r.rotation.z=(d*10|0)%2?.6:-.6;truss.add(r)}

 var N=PH?2:CFG.xs.length;
 var gc=document.createElement('canvas');gc.width=gc.height=128;var gx=gc.getContext('2d'),gg=gx.createRadialGradient(64,64,0,64,64,64);gg.addColorStop(0,'rgba(255,255,255,1)');gg.addColorStop(.18,'rgba(255,240,220,.55)');gg.addColorStop(1,'rgba(255,220,180,0)');gx.fillStyle=gg;gx.fillRect(0,0,128,128);var glowT=new THREE.CanvasTexture(gc);
 var poolF='uniform vec3 col;uniform float k;varying vec2 vU;void main(){float d=length(vU-.5)*2.;float a=smoothstep(1.,0.,d);a=a*a*k;gl_FragColor=vec4(col*a,a);}';
 for(var i=0;i<N;i++){
  var x=PH?CFG.pxs[i]:CFG.xs[i],c=new THREE.Color(CFG.cols[i%CFG.cols.length]);
  var head=new THREE.Group();head.position.set(x,-.2,0);truss.add(head);
  var clamp=new THREE.Mesh(new THREE.BoxGeometry(.12,.3,.22),metal);clamp.position.y=.12;head.add(clamp);
  var arm=new THREE.Mesh(new THREE.TorusGeometry(.3,.03,8,24,Math.PI),metal);arm.rotation.z=Math.PI;head.add(arm);
  var body=new THREE.Mesh(new THREE.CylinderGeometry(.17,.24,.5,24),metal);body.rotation.x=Math.PI/2;
  var fins=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.08,24),metal);fins.rotation.x=Math.PI/2;fins.position.z=-.12;
  var lens=new THREE.Mesh(new THREE.CircleGeometry(.17,32),new THREE.MeshBasicMaterial({color:c.clone().multiplyScalar(2.2)}));lens.position.z=.26;
  var flare=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,color:c,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false}));flare.scale.set(.8,.8,1);flare.material.depthTest=false;flare.position.z=.3;
  var yoke=new THREE.Group();yoke.add(body);yoke.add(fins);yoke.add(lens);yoke.add(flare);head.add(yoke);
  var mk=function(r1,r2,kk){var len=18,g=new THREE.CylinderGeometry(r1,r2,len,48,1,true);g.translate(0,-len/2,0);g.rotateX(-Math.PI/2);
   var m=new THREE.ShaderMaterial({uniforms:{col:{value:c},t:{value:0},k:{value:kk}},vertexShader:beamV,fragmentShader:beamF,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
   var b=new THREE.Mesh(g,m);b.position.z=.3;yoke.add(b);return m};
  var outer=mk(.2,PH?2.6:3.6,.55),core=mk(.1,PH?1.1:1.5,.9);
  var pool=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.ShaderMaterial({uniforms:{col:{value:c},k:{value:.5}},vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:poolF,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
  pool.position.z=-5.9;scene.add(pool);
  heads.push({yoke:yoke,mat:outer,core:core,flare:flare,pool:pool,x:x,ph:i*1.7,hit:CFG.hit[i%CFG.hit.length]});
 }
 // haze particles in 3D
 var P=PH?1200:3500,pos=new Float32Array(P*3);for(var j=0;j<P;j++){pos[j*3]=(Math.random()-.5)*24;pos[j*3+1]=(Math.random()-.5)*12;pos[j*3+2]=-5+Math.random()*12}
 var hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.BufferAttribute(pos,3));
 dustU={lp:{value:[0,1,2,3].map(function(){return new THREE.Vector3()})},ld:{value:[0,1,2,3].map(function(){return new THREE.Vector3(0,0,-1)})},n:{value:N},sz:{value:(PH?2.2:1.6)*renderer.getPixelRatio()}};
 haze=new THREE.Points(hg,new THREE.ShaderMaterial({uniforms:dustU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:'uniform vec3 lp[4];uniform vec3 ld[4];uniform int n;uniform float sz;varying float vB;void main(){vec4 w=modelMatrix*vec4(position,1.);float b=.06;for(int i=0;i<4;i++){if(i>=n)break;vec3 d=w.xyz-lp[i];float l=length(d);float c=dot(d/l,ld[i]);b+=smoothstep(.94,.99,c)*1.4/(1.+l*.08);}vB=b;vec4 mv=viewMatrix*w;gl_PointSize=sz*(1.+b)*(10./-mv.z);gl_Position=projectionMatrix*mv;}',
 fragmentShader:'varying float vB;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d)*vB;gl_FragColor=vec4(vec3(1.,.93,.85)*a,a);}'}));scene.add(haze);

 composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,cam));
 bloom=new UnrealBloomPass(new THREE.Vector2(256,256),.7,.5,.72);composer.addPass(bloom);composer.addPass(new OutputPass());

 size();addEventListener('resize',size);
 if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting},{rootMargin:'100px'}).observe(root);
 video.addEventListener('playing',function(){renderer.domElement.classList.add('on')},{once:true});
 setTimeout(function(){renderer.domElement.classList.add('on')},1500);
 renderer.setAnimationLoop(loop);hints();
}
function size(){
 var r=root.getBoundingClientRect();W=r.width;H=r.height;renderer.setSize(W,H,false);composer.setSize(W,H);
 bloom.resolution.set(W/(PH?3:2),H/(PH?3:2));cam.aspect=W/H;cam.updateProjectionMatrix();
 // cover-fit the screen plane at its depth
 var dist=cam.position.z-screen.position.z,vh=2*dist*Math.tan(THREE.MathUtils.degToRad(cam.fov/2))*1.12,vw=vh*cam.aspect,va=PH?1:16/9;
 if(vw/vh>va)screen.scale.set(vw,vw/va,1);else screen.scale.set(vh*va,vh,1);if(PH){screen.scale.multiplyScalar(1.5);screen.position.y=-vh*.2;screen.position.x=vh*.08}
 var tr=heads.length&&heads[0].yoke.parent.parent;if(tr){tr.position.z=-2.5;tr.position.y=Math.tan(THREE.MathUtils.degToRad(cam.fov/2))*(cam.position.z+2.5)+.05}
}
var last=0;
function loop(now){
 if(!vis)return;if(PH&&now-last<33)return;last=now;
 var t=(now-t0)/1000,r=root.getBoundingClientRect(),p=Math.min(1,Math.max(0,-r.top/Math.max(1,r.height)));
 if(PH)aimT.set(Math.sin(t*.4)*.6,Math.cos(t*.3)*.2);
 aim.lerp(aimT,.06);
 cam.position.x=aim.x*.6;cam.position.y=-aim.y*.3-p*1.2;cam.position.z=10-p*2;cam.lookAt(0,-p*1.2,-6);

 var tgt=new THREE.Vector3(),wp=new THREE.Vector3(),dir=new THREE.Vector3(),sx=screen.scale.x,sy=screen.scale.y;
 for(var i=0;i<heads.length;i++){var h=heads[i];
  var hu=h.hit[0],hv=h.hit[1];if(PH){hu=CFG.pm[0];hv=CFG.pm[1]+(i?.15:0)}
  var sw=Math.sin(t*.45+h.ph)*.06+sweep*Math.sin(t*8+h.ph)*.25+aim.x*.05;
  tgt.set(screen.position.x+(hu-.5+sw)*sx,screen.position.y+(.5-hv+Math.cos(t*.33+h.ph)*.03-aim.y*.04)*sy,-5.9);
  h.yoke.getWorldPosition(wp);h.yoke.lookAt(tgt);
  dir.copy(tgt).sub(wp).normalize();
  if(i<4){dustU.lp.value[i].copy(wp);dustU.ld.value[i].copy(dir)}
  var dist=wp.distanceTo(tgt),rad=(PH?2.6:3.6)*dist/18;
  h.pool.position.set(tgt.x,tgt.y,-5.9);h.pool.scale.set(rad*2.6,rad*2.6/Math.max(.35,Math.abs(dir.z)),1);
  var pulse=.08*Math.sin(t*2+h.ph);
  h.mat.uniforms.t.value=t;h.core.uniforms.t.value=t;
  h.mat.uniforms.k.value=.5+flash*.8+pulse;h.core.uniforms.k.value=.45+flash*.9+pulse;h.pool.material.uniforms.k.value=.28+flash*.5;
  h.flare.scale.setScalar(.75+flash*1.2+pulse);
 }
 haze.rotation.y=Math.sin(t*.05)*.1;haze.position.x=(t*.15)%2-1;
 bloom.strength=.6+flash*.6;screen.material.color.setScalar(CFG.tint+flash*.25);
 composer.render();flash*=.92;sweep*=.95;
}
function tap(e){
 if(e.target.closest('a,button'))return;start();
 var r=root.getBoundingClientRect();aimT.set(((e.clientX-r.left)/r.width-.5)*2,((e.clientY-r.top)/r.height-.5)*2);flash=1;sweep=1;
 if(navigator.vibrate)try{navigator.vibrate(10)}catch(_){}
 if(++taps>=4)root.querySelectorAll('.cxd3-hint').forEach(function(h){h.remove()});
}
function hints(){
 var lbl=IT?'tocca':'tap';
 (function one(){if(taps>=4||!document.contains(root))return;
  var h=document.createElement('span');h.className='cxd3-hint';h.innerHTML='<i></i><i></i><b>'+lbl+'</b>';
  h.style.left=55+Math.random()*35+'%';h.style.top=25+Math.random()*40+'%';
  root.appendChild(h);setTimeout(function(){h.remove()},1400);setTimeout(one,1400)})();
}
root.addEventListener('pointerdown',tap);
root.addEventListener('pointermove',function(e){var r=root.getBoundingClientRect();aimT.set(((e.clientX-r.left)/r.width-.5)*2,((e.clientY-r.top)/r.height-.5)*2)});
['pointermove','pointerdown','scroll','keydown','touchstart'].forEach(function(t){addEventListener(t,start,{once:true,passive:true})});
addEventListener('load',function(){setTimeout(function(){(window.requestIdleCallback||setTimeout)(start)},1200)});
})();
