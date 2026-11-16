/* Cover Page CTA lab · drummer A · v1 · sunset stage, real video planes, beat synced light */
(function () {
  var mount = document.querySelector('[data-cxd3="drummer-a"]');
  if (!mount || mount.__on) return; mount.__on = 1;
  var st = document.createElement('style');
  st.textContent = 'html,body:has(#cdk-drum){overflow-x:clip}#cdk-drum{cursor:crosshair;touch-action:manipulation}#cdk-drum .cxd3-rip{position:absolute;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;border:2px solid #f0874e;pointer-events:none;animation:cxdRip .7s ease-out forwards;z-index:3}@keyframes cxdRip{to{transform:scale(9);opacity:0}}@media (min-width:768px){#cdk-drum .cpa-cta-ratingwrap{display:flex;justify-content:flex-start;margin-left:0}}#cdk-drum .cxd3-snd[aria-pressed=true]{background:#e25b1e;border-color:#e25b1e}#cdk-drum .cxd3-snd[aria-pressed=true] i{background:#fff}#cdk-drum .cdk-title{will-change:transform}#cdk-drum a.cpa-home-cta_btn{display:inline-flex!important;align-items:center;min-height:48px;line-height:1.2!important;box-sizing:border-box;overflow:visible;height:auto!important;border:1px solid #fff!important;border-bottom:1px solid #fff!important;transform:none!important}#cdk-drum .cxd3-snd{min-height:44px;font-size:11px!important;letter-spacing:2.5px!important;border:1.5px solid #e25b1e!important;gap:10px!important}#cdk-drum .cxd3-snd svg{width:18px;height:18px}#cdk-drum{cursor:pointer}#cdk-drum a,#cdk-drum button{cursor:pointer}#cdk-drum .cxd3-tap{position:absolute;left:0;top:0;width:90px;height:90px;margin:-45px 0 0 -45px;border-radius:50%;border:2px solid #f0874e;pointer-events:none;animation:cxTap .5s ease-out forwards}@keyframes cxTap{from{transform:scale(.3);opacity:1}to{transform:scale(1.6);opacity:0}}';
  document.head.appendChild(st);

  var BASE = new URL('.', (document.currentScript && document.currentScript.src) || 'https://lkslbrt-beep.github.io/cover-page-access/cta-lab/drummer/a/index.js').href;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // poster stays
  var HITS = [0.4,1.001,1.568,1.935,2.202,2.603,2.803,3.303,3.804,4.471,5.005,5.739,6.406,7.04,7.708,8.542,9.376];
  var phone = matchMedia('(max-width: 767px)').matches;

  function vid(name) {
    var v = document.createElement('video');
    v.src = BASE + name; v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', '');
    v.crossOrigin = 'anonymous'; v.preload = 'auto'; return v;
  }
  var start = function () {
    io.disconnect();
    var cv = document.createElement('canvas'); cv.className = 'cxd3-cv'; mount.appendChild(cv);
    var gl = cv.getContext('webgl', { premultipliedAlpha: false, alpha: true });
    if (!gl) return;
    var vs = vid('sunset.mp4'), vd = vid('drummer.mp4'), vc = vid('cymbal.mp4');
    var vids = [vs, vd, vc];
    var VS = 'attribute vec2 p;varying vec2 u;void main(){u=p*.5+.5;u.y=1.-u.y;gl_Position=vec4(p,0,1);}';
    var FS = [
      'precision mediump float;varying vec2 u;',
      'uniform sampler2D ts,td,tc;uniform vec2 m,res;uniform float sc,pl,ph,t,zm,rt,fl,dk;',
      'vec2 cov(vec2 q,float ar){float r=res.x/res.y;vec2 s=r>ar?vec2(1.,ar/r):vec2(r/ar,1.);return (q-.5)*s+.5;}',
      'void main(){',
      ' vec2 q=u-.5;q.x*=res.x/res.y;float cs=cos(rt),sn=sin(rt);q=mat2(cs,-sn,sn,cs)*q/zm;q.x/=res.x/res.y;q+=.5;',
      // far: sunset, slow push, cursor small
      ' vec2 a=(cov(q,16./9.)-.5)/(1.12+sc*.18)+.5+m*.012;',
      ' vec3 col=texture2D(ts,a).rgb*vec3(1.08,.86,.66);',
      ' col=mix(col,vec3(.95,.45,.16),.18+pl*.22);',
      // mid: drummer silhouette, right side on desktop
      ' float r=res.x/res.y;float H=ph>.5?.46:.86;vec2 cen=ph>.5?vec2(.5,.82):vec2(.73,.58);vec2 bx=vec2(H*16./9./r,H)*(1.+sc*.14);',
      ' vec2 b=(q-cen-m*vec2(.025,.015))/bx+.5;',
      ' float inb=smoothstep(.02,.14,b.y)*step(b.y,1.)*smoothstep(0.,.02,b.x)*smoothstep(1.,.98,b.x);',
      ' float al=texture2D(td,vec2(b.x,b.y*.5+.5)).r*inb;',
      ' float sa=0.;for(int i=0;i<12;i++){float an=float(i)*.5236;for(int k=1;k<=2;k++){vec2 o=vec2(cos(an)*.56,sin(an))*float(k)*4./540.;sa+=texture2D(td,vec2(b.x+o.x,(b.y+o.y)*.5+.5)).r;}}sa/=24.;',
      ' float rim=clamp(sa-al*.85,0.,1.)*inb;',
      ' vec3 sil=vec3(.035,.02,.015);',
      ' col=mix(col,sil,al*(ph>.5?.55:.92));',
      ' col+=col*vec3(1.2,.75,.4)*rim*(ph>.5?.5:.9)*(.6+pl*1.4);',
      // near: cymbal plane, screen blend, catches light at cursor
      ' vec2 c=cov(q,16./9.);c=(c-.5)/(1.35+sc*.5)+.5+m*.07;c.y+=.18;',
      ' vec3 cy=texture2D(tc,c).rgb;float lum=dot(cy,vec3(.3,.59,.11));',
      ' float spot=exp(-dot(q-(m*vec2(-1.,1.)+.5),q-(m*vec2(-1.,1.)+.5))*9.);',
      ' float mask=smoothstep(.1,.55,q.y)*smoothstep(1.,.75,q.y)*(1.-smoothstep(.2,.8,abs(q.x-.5)*2.)*.4);',
      ' col=1.-(1.-col)*(1.-cy*vec3(1.,.72,.45)*(.28+spot*.9*lum+pl*.35)*mask*(ph>.5?.5:smoothstep(.3,.75,q.x)));',
      // veil for text contrast + vignette
      ' float v=smoothstep(1.1,.25,length((q-.5)*vec2(1.,1.3)));',
      ' col*=mix(.42,1.,v);col=mix(col,col*.55,smoothstep(.5,0.,abs(q.x-.5))*.55);',
      ' col+=vec3(.9,.4,.12)*pl*.10;',
      ' col+=vec3(1.,.82,.62)*fl*.55;col*=dk;',
      ' gl_FragColor=vec4(col,1.);}'
    ].join('\n');
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    var bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    var lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    var tex = vids.map(function (v, i) {
      var t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,255]));
      return t;
    });
    ['ts','td','tc'].forEach(function (n, i) { gl.uniform1i(gl.getUniformLocation(pr, n), i); });
    var U = {}; ['m','res','sc','pl','ph','t','zm','rt','fl','dk'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    var flash = 0, kick = 0, mx = 0, my = 0, tx = 0, ty = 0, scr = 0, pulse = 0, lastT = 0, hi = 0, vis = true, ready = 0;
    var host = mount.closest('.cdk') || mount; var inn = host.querySelector('.cdk-title');
    host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5; });
    host.addEventListener('pointerleave', function () { tx = ty = 0; });
    var dpr = Math.min(window.devicePixelRatio || 1, phone ? 1 : 1.5);
    function size() { var r = mount.getBoundingClientRect(); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); gl.viewport(0, 0, cv.width, cv.height); }
    size(); addEventListener('resize', size); if (window.ResizeObserver) new ResizeObserver(size).observe(mount);
    new IntersectionObserver(function (e) { vis = e[0].isIntersecting; vids.forEach(function (v) { vis ? v.play().catch(function(){}) : v.pause(); }); }).observe(host);
    vids.forEach(function (v) { v.addEventListener('canplay', function () { if (++ready === 3) cv.classList.add('on'); }, { once: true }); v.play().catch(function () {}); });

    // sound on tap, off by default
    var ac = null, snd = false, btn = host.querySelector('.cxd3-snd'); if (btn) btn.querySelector('b').textContent = 'Sound off';
    var bus = null;
    function noise(t, len, type, freq, gain) {
      var n = ac.createBufferSource(), bb = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate), d = bb.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      var f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; var g = ac.createGain();
      g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.001, t + len);
      n.buffer = bb; n.connect(f).connect(g).connect(bus); n.start(t); n.stop(t + len);
    }
    function tone(t, f0, f1, len, gain, type) {
      var o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'sine';
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + len * .6);
      g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.001, t + len);
      o.connect(g).connect(bus); o.start(t); o.stop(t + len + .02);
    }
    function hit(i) {
      if (!snd || !ac) return; var t = ac.currentTime + .005;
      if (i % 2 === 0) { tone(t, 165, 42, .42, 1.1); noise(t, .02, 'highpass', 3000, .5); }
      else { tone(t, 230, 160, .16, .55, 'triangle'); noise(t, .22, 'bandpass', 2200, .9); }
      noise(t, .05, 'highpass', 7000, .25);
      if (i % 4 === 3) { noise(t, .9, 'highpass', 5500, .35); }
    }
    function hat(){ if (!snd || !ac) return; noise(ac.currentTime, .04, 'highpass', 8000, .18); }
    function initAudio() { if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); var cp = ac.createDynamicsCompressor(); cp.threshold.value = -14; cp.ratio.value = 4; var mg = ac.createGain(); mg.gain.value = .9; bus = ac.createGain(); bus.connect(cp).connect(mg).connect(ac.destination); } if (ac.state === 'suspended') ac.resume(); }
    host.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a,button')) return;
      if (!snd) { snd = true; if (btn) { btn.setAttribute('aria-pressed', true); btn.querySelector('b').textContent = 'Sound on \u00b7 the beat is live'; } }
      initAudio();
      var r = host.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      var t = ac.currentTime + .005;
      if (y > .7) { tone(t, 165, 42, .42, 1.2); noise(t, .02, 'highpass', 3000, .5); }
      else if (x > .78) { noise(t, 1.1, 'highpass', 5000, .5); noise(t, .08, 'bandpass', 3500, .4); }
      else if (x > .55) { tone(t, 140 + y * 80, 90, .35, .8, 'sine'); noise(t, .05, 'bandpass', 1500, .3); }
      else { tone(t, 230, 160, .16, .6, 'triangle'); noise(t, .22, 'bandpass', 2200, 1); }
      pulse = 1; flash = .9; kick = 1;
      var d = document.createElement('span'); d.className = 'cxd3-tap'; d.style.left = (e.clientX - r.left) + 'px'; d.style.top = (e.clientY - r.top) + 'px'; host.appendChild(d); setTimeout(function () { d.remove(); }, 520);
    });
    function setSnd(v) { snd = v; if (btn) { btn.setAttribute('aria-pressed', v); btn.querySelector('b').textContent = v ? 'Sound on \u00b7 the beat is live' : 'Sound off'; } if (v) initAudio(); }
    if (btn) btn.addEventListener('click', function () {
      setSnd(!snd); return; btn.setAttribute('aria-pressed', snd); 
      if (snd) initAudio();
    });

    var last = 0, step = phone ? 1000 / 30 : 0;
    function frame(now) {
      requestAnimationFrame(frame);
      if (!vis || now - last < step) return; last = now;
      mx += (tx - mx) * .06; my += (ty - my) * .06;
      var r = host.getBoundingClientRect(); var target = Math.min(1, Math.max(0, 1 - (r.top + r.height * .5) / innerHeight));
      if (phone) { mx += (Math.sin(now / 2400) * .15 - mx) * .02; }
      scr += (target - scr) * .08;
      var ct = vd.currentTime || 0;
      if (ct < lastT) hi = 0;
      while (hi < HITS.length && HITS[hi] <= ct) { pulse = 1; flash = hi % 2 ? .55 : 1; kick = hi % 2 ? .5 : 1; hit(hi); hi++; }
      if (pulse > .4 && pulse < .5) hat();
      lastT = ct; pulse *= .9; flash *= .78; kick *= .84;
      // scroll progress through the viewport: 0 entering, 1 leaving
      var pr = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
      var intro = Math.max(0, 1 - pr / .3), outro = Math.max(0, (pr - .72) / .28);
      intro = intro * intro * (3 - 2 * intro); outro = outro * outro * (3 - 2 * outro);
      var zoom = 1 + kick * .035 + intro * .28 + outro * .18 + Math.sin(now / 3200) * .012;
      var rot = (intro * -.09 + outro * .07 + Math.sin(now / 4100) * .012 + kick * (hi % 2 ? .008 : -.008));
      var dark = 1 - intro * .55 - outro * .5;
      if (!reduce && kick > .05) { var sx = (Math.random() - .5) * 6 * kick, sy = (Math.random() - .5) * 4 * kick; inn && (inn.style.transform = 'translate(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px)'); } else if (inn) inn.style.transform = '';
      host.style.setProperty('--cxp', pulse.toFixed(3));
      vids.forEach(function (v, i) { if (v.readyState >= 2) { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tex[i]); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, v); } });
      gl.uniform2f(U.m, mx, my); gl.uniform2f(U.res, cv.width, cv.height); gl.uniform1f(U.sc, scr); gl.uniform1f(U.pl, pulse); gl.uniform1f(U.ph, phone ? 1 : 0); gl.uniform1f(U.t, now / 1000); gl.uniform1f(U.zm, zoom); gl.uniform1f(U.rt, rot); gl.uniform1f(U.fl, flash + intro * .0); gl.uniform1f(U.dk, dark);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(frame);
  };
  var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) start(); }, { rootMargin: '200px 0px' });
  io.observe(mount);
})();
