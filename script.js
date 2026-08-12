const sections=[...document.querySelectorAll('main section[id]')];
const bookmarks=[...document.querySelectorAll('.bookmark')];
const navLinks=[...document.querySelectorAll('.topnav a')];
const progress=document.getElementById('progress');
const backtop=document.getElementById('backtop');
const topbar=document.querySelector('.topbar');

function scrollUI(){
  const max=document.documentElement.scrollHeight-innerHeight;
  if(progress) progress.style.width=(max?scrollY/max*100:0)+'%';
  backtop?.classList.toggle('show',scrollY>520);
  topbar?.classList.toggle('scrolled',scrollY>28);
  let current='top';
  sections.forEach(s=>{if(scrollY+innerHeight*.38>=s.offsetTop) current=s.id});
  bookmarks.forEach(b=>b.classList.toggle('active',b.dataset.target===current));
  navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current));
}
addEventListener('scroll',scrollUI,{passive:true});
scrollUI();
backtop?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
bookmarks.forEach(b=>b.addEventListener('click',()=>{
  const target=b.dataset.target==='top'?document.getElementById('top'):document.getElementById(b.dataset.target);
  target?.scrollIntoView({behavior:'smooth',block:'start'});
}));

const revealItems=[...document.querySelectorAll('.reveal')];
if('IntersectionObserver' in window){
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('in');revealObserver.unobserve(entry.target)}
  }),{threshold:.12,rootMargin:'0px 0px -5%'});
  revealItems.forEach(el=>revealObserver.observe(el));
}else revealItems.forEach(el=>el.classList.add('in'));

const steps=[...document.querySelectorAll('.step')];
if('IntersectionObserver' in window){
  const stepObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('active');stepObserver.unobserve(entry.target)}
  }),{threshold:.45});
  steps.forEach(step=>stepObserver.observe(step));
}else steps.forEach(step=>step.classList.add('active'));

/* Framework: center-to-principle relationship lines */
const frameworkShell=document.querySelector('.framework-shell');
const hdpsSymbol=document.querySelector('.hdps-symbol');
const frameworkHexes=[...document.querySelectorAll('.framework-shell .hex')];
const moduleCards=[...document.querySelectorAll('.module-card')];

if(hdpsSymbol && !hdpsSymbol.querySelector('.con-top')){
  const line=document.createElement('span');
  line.className='framework-connector con-top';
  line.setAttribute('aria-hidden','true');
  hdpsSymbol.prepend(line);
}
const connectorMap={team:'.con-top',q:'.con-top-left',j:'.con-top-right',ci:'.con-mid-left',o:'.con-mid-right',bottom:'.con-bottom'};
const cardMap={team:0,bottom:1,q:2,o:3,ci:4,j:5};
const keyOf=hex=>['team','q','j','ci','o','bottom'].find(k=>hex.classList.contains(k));

if(frameworkShell && 'IntersectionObserver' in window){
  const frameworkObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){frameworkShell.classList.add('framework-active');frameworkObserver.unobserve(entry.target)}
  }),{threshold:.28});
  frameworkObserver.observe(frameworkShell);
}else frameworkShell?.classList.add('framework-active');

function focusFramework(hex,on){
  const key=keyOf(hex); if(!key) return;
  const line=hdpsSymbol?.querySelector(connectorMap[key]);
  const linked=moduleCards[cardMap[key]];
  frameworkHexes.forEach(item=>item.classList.toggle('dimmed',on&&item!==hex));
  hex.classList.toggle('focused',on);
  line?.classList.toggle('line-active',on);
  moduleCards.forEach(card=>{
    card.classList.toggle('linked-active',on&&card===linked);
    card.classList.toggle('linked-dim',on&&card!==linked);
  });
}
frameworkHexes.forEach(hex=>{
  hex.tabIndex=0;
  hex.addEventListener('mouseenter',()=>focusFramework(hex,true));
  hex.addEventListener('mouseleave',()=>focusFramework(hex,false));
  hex.addEventListener('focus',()=>focusFramework(hex,true));
  hex.addEventListener('blur',()=>focusFramework(hex,false));
});

/* Module showcase: concise promotional cards */
const moduleFeatures=[...document.querySelectorAll('.module-feature')];
function highlightModule(index,{scroll=false}={}){
  moduleFeatures.forEach((feature,i)=>feature.classList.toggle('is-active',i===index));
  const target=moduleFeatures[index];
  if(scroll&&target) target.scrollIntoView({behavior:'smooth',block:'center'});
}
moduleFeatures.forEach((feature,index)=>{
  feature.addEventListener('mouseenter',()=>highlightModule(index));
  feature.addEventListener('mouseleave',()=>feature.classList.remove('is-active'));
});

/* Group card order -> concise module cards */
moduleCards.forEach((card,index)=>{
  card.tabIndex=0; card.setAttribute('role','button');
  const title=card.querySelector('h4')?.textContent?.trim()||'HDPS';
  card.setAttribute('aria-label',title+' 모듈 보기');
  const go=()=>highlightModule(index,{scroll:true});
  card.addEventListener('click',go);
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
});

/* Arrow-key section navigation */
document.addEventListener('keydown',e=>{
  if(!['ArrowDown','ArrowUp'].includes(e.key)||['INPUT','TEXTAREA','BUTTON','A'].includes(document.activeElement?.tagName)) return;
  let current=0;
  sections.forEach((s,i)=>{if(scrollY+innerHeight*.38>=s.offsetTop) current=i});
  const next=e.key==='ArrowDown'?Math.min(current+1,sections.length-1):Math.max(current-1,0);
  if(next!==current){e.preventDefault();sections[next].scrollIntoView({behavior:'smooth',block:'start'})}
});

/* ===== Board-card interaction for HDPS module showcase ===== */
(function(){
  const cards=[...document.querySelectorAll('.module-feature')];
  if(!cards.length) return;
  const fine=matchMedia('(pointer:fine)').matches;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  cards.forEach((card,index)=>{
    card.style.setProperty('--card-delay',`${index*70}ms`);

    if(fine && !reduced){
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const px=(e.clientX-r.left)/r.width-.5;
        const py=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`translateY(-7px) rotateX(${-py*3.2}deg) rotateY(${px*4.5}deg)`;
      });
      card.addEventListener('pointerenter',()=>{
        card.classList.remove('card-glint');
        void card.offsetWidth;
        card.classList.add('card-glint');
      });
      card.addEventListener('pointerleave',()=>{
        card.style.transform='';
        card.classList.remove('card-glint');
      });
    }
  });

  if('IntersectionObserver' in window && !reduced){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const card=entry.target;
        const i=cards.indexOf(card);
        setTimeout(()=>card.classList.add('is-active'),Math.max(0,i)*70);
        setTimeout(()=>card.classList.remove('is-active'),900+Math.max(0,i)*70);
        observer.unobserve(card);
      });
    },{threshold:.28});
    cards.forEach(card=>observer.observe(card));
  }
})();

/* =========================================================
   FINAL BOARD-CARD INTERACTION
   Independent from legacy .module-feature transforms
   ========================================================= */
(function(){
  const cards=[...document.querySelectorAll('.board-card')];
  if(!cards.length) return;
  const fine=matchMedia('(pointer:fine)').matches;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  cards.forEach((card,index)=>{
    card.dataset.boardIndex=String(index+1).padStart(2,'0');
    if(fine && !reduced){
      card.addEventListener('pointerenter',()=>{
        card.classList.remove('is-glint');
        void card.offsetWidth;
        card.classList.add('is-glint','board-focus');
      });
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        card.style.setProperty('transform',`translateY(-9px) rotateX(${-y*2.8}deg) rotateY(${x*3.8}deg) scale(1.012)`,'important');
      });
      card.addEventListener('pointerleave',()=>{
        card.style.removeProperty('transform');
        card.classList.remove('is-glint','board-focus');
      });
    }
  });

  if('IntersectionObserver' in window && !reduced){
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const card=entry.target;
        card.animate([
          {opacity:.25,transform:'translateY(26px) scale(.97)'},
          {opacity:1,transform:'translateY(0) scale(1)'}
        ],{duration:520,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
        io.unobserve(card);
      });
    },{threshold:.18});
    cards.forEach(card=>io.observe(card));
  }
})();


/* ===== LEAN MINDSET IMPACT INTERACTION ===== */
(function(){
  const cards=[...document.querySelectorAll('.principle-impact')];
  if(!cards.length) return;
  const fine=matchMedia('(pointer:fine)').matches;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  cards.forEach((card,index)=>{
    card.style.setProperty('--impact-delay',`${index*85}ms`);
    if(fine && !reduced){
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width;
        const y=(e.clientY-r.top)/r.height;
        const rx=(.5-y)*3.6;
        const ry=(x-.5)*4.4;
        card.style.setProperty('--mx',`${x*100}%`);
        card.style.setProperty('--my',`${y*100}%`);
        card.style.transform=`translateY(-9px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('pointerenter',()=>{
        cards.forEach(c=>c.classList.toggle('principle-dim',c!==card));
        card.classList.add('principle-focus');
      });
      card.addEventListener('pointerleave',()=>{
        card.style.transform='';
        card.style.setProperty('--mx','50%');
        card.style.setProperty('--my','50%');
        cards.forEach(c=>c.classList.remove('principle-dim','principle-focus'));
      });
    }
  });

  if('IntersectionObserver' in window && !reduced){
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const card=entry.target;
        const i=cards.indexOf(card);
        setTimeout(()=>{
          card.classList.add('is-impact');
          card.animate([
            {opacity:0,transform:'translateY(34px) scale(.965)'},
            {opacity:1,transform:'translateY(0) scale(1)'}
          ],{duration:620,easing:'cubic-bezier(.18,.75,.2,1)',fill:'both'});
          setTimeout(()=>card.classList.remove('is-impact'),850);
        },Math.max(0,i)*90);
        io.unobserve(card);
      });
    },{threshold:.16});
    cards.forEach(card=>io.observe(card));
  }
})();

/* ===== TARGET VALUE PYRAMID INTERACTION ===== */
(function(){
  const section=document.querySelector('.target-impact');
  const levels=[...document.querySelectorAll('.value-pyramid .pyramid-level')];
  const flow=[...document.querySelectorAll('.target-flow-item')];
  if(!section||!levels.length) return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  const activate=()=>{
    section.classList.add('target-live');
    levels.slice().reverse().forEach((level,i)=>{
      if(reduced){level.classList.add('is-visible');return;}
      setTimeout(()=>{
        level.classList.add('is-visible','is-pulse');
        setTimeout(()=>level.classList.remove('is-pulse'),720);
      },i*180);
    });
    flow.forEach((item,i)=>{
      if(reduced) return;
      item.animate([
        {opacity:.2,transform:'translateX(-18px)'},
        {opacity:1,transform:'translateX(0)'}
      ],{duration:500,delay:200+i*120,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
    });
  };

  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        activate(); io.disconnect();
      });
    },{threshold:.28});
    io.observe(section);
  }else activate();

  if(!reduced && matchMedia('(pointer:fine)').matches){
    const pyramid=document.querySelector('.value-pyramid');
    section.addEventListener('pointermove',e=>{
      const r=section.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      if(pyramid) pyramid.style.transform=`rotateX(${-y*1.8}deg) rotateY(${x*2.2}deg)`;
    });
    section.addEventListener('pointerleave',()=>{if(pyramid)pyramid.style.transform='';});
  }
})();

/* ===== FINAL TARGET: SUPPORT + DAILY EMBEDDING EFFECTS ===== */
(function(){
  const section=document.querySelector('.target-impact');
  if(!section) return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const support=section.querySelector('.support-message');
  const loopSteps=[...section.querySelectorAll('.daily-loop-step')];
  const supportTags=[...section.querySelectorAll('.support-band span')];
  const manifesto=section.querySelector('.pyramid-manifesto');

  const run=()=>{
    if(reduced) return;
    loopSteps.forEach((el,i)=>el.animate([
      {opacity:0,transform:getComputedStyle(el).transform+' scale(.82)'},
      {opacity:1,transform:getComputedStyle(el).transform+' scale(1)'}
    ],{duration:430,delay:500+i*120,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'}));
    supportTags.forEach((el,i)=>el.animate([
      {opacity:0,transform:'translateY(-10px)'},
      {opacity:1,transform:'translateY(0)'}
    ],{duration:360,delay:900+i*70,easing:'ease-out',fill:'both'}));
    support?.animate([
      {opacity:.15,transform:'translateX(-18px)'},
      {opacity:1,transform:'translateX(0)'}
    ],{duration:620,delay:900,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
    manifesto?.animate([
      {opacity:0,transform:'translateY(16px) scale(.96)'},
      {opacity:1,transform:'translateY(0) scale(1)'}
    ],{duration:650,delay:1500,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
  };

  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){run();io.disconnect();}
    }),{threshold:.3});
    io.observe(section);
  }else run();
})();
