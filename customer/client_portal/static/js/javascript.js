// Interactive Background Particles (Optional)
class ParticleAnimation {
  constructor() {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      document.querySelector('.code-canvas-bg').appendChild(this.canvas);
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.particles = [];
      this.animate();
  }

  resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
  }

  createParticle() {
      return {
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5
      };
  }

  animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Create new particles
      if(this.particles.length < 100 && Math.random() > 0.9) {
          this.particles.push(this.createParticle());
      }
      
      // Update and draw particles
      this.particles.forEach((p, i) => {
          p.x += p.speedX;
          p.y += p.speedY;
          
          if(p.x < 0 || p.x > this.canvas.width || 
             p.y < 0 || p.y > this.canvas.height) {
              this.particles.splice(i, 1);
          }
          
          this.ctx.beginPath();
          this.ctx.fillStyle = `rgba(255, 215, 0, ${1 - p.size/4})`;
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fill();
      });
      
      requestAnimationFrame(() => this.animate());
  }
}

// Initialize if needed
// new ParticleAnimation();

// tech definition
// Interactive Demo Controller
class JSDemo {
  constructor() {
      this.demoBox = document.querySelector('.demo-box');
      this.controls = {
          rotate: () => this.demoBox.style.transform += 'rotate(45deg)',
          color: () => this.demoBox.style.backgroundColor = 
              `hsl(${Math.random() * 360}, 70%, 60%)`,
          reset: () => {
              this.demoBox.style.transform = '';
              this.demoBox.style.backgroundColor = '#f1c40f';
          }
      };
      
      this.init();
  }

  init() {
      document.querySelectorAll('.control-btn').forEach(btn => {
          btn.addEventListener('click', () => 
              this.controls[btn.dataset.action]()
          );
      });
  }
}

// Initialize interactive demo
new JSDemo();

// Timeline Animation
gsap.from('.timeline-item', {
  scrollTrigger: {
      trigger: '.evolution-timeline',
      start: 'top center'
  },
  x: -100,
  opacity: 0,
  stagger: 0.2,
  duration: 0.8
});

// Concept Card Interactions
document.querySelectorAll('.code-snippet.interactive').forEach(snippet => {
  snippet.addEventListener('click', () => {
      const concept = snippet.dataset.concept;
      gsap.to(`[data-concept="${concept}"]`, {
          y: -10,
          duration: 0.3,
          repeat: 1,
          yoyo: true
      });
  });
});

// where it is most used
// Orbital Animation Controller
class OrbitAnimator {
  constructor() {
      this.orbits = document.querySelectorAll('.tech-orbit');
      this.setupOrbits();
      this.animateOrbits();
  }

  setupOrbits() {
      this.orbits.forEach((orbit, index) => {
          const radius = 150 + (index * 120);
          orbit.style.width = `${radius * 2}px`;
          orbit.style.height = `${radius * 2}px`;
          orbit.style.marginLeft = `-${radius}px`;
          orbit.style.marginTop = `-${radius}px`;
      });
  }

  animateOrbits() {
      gsap.to('.tech-orbit', {
          rotation: 360,
          repeat: -1,
          duration: 40,
          ease: 'none'
      });
  }
}

// Initialize orbital animation
new OrbitAnimator();

// Stack Builder Interaction
document.querySelectorAll('.stack-piece').forEach(piece => {
  piece.addEventListener('mouseenter', () => {
      const layer = piece.dataset.layer;
      gsap.to('.stack-visual', {
          backgroundColor: layerColors[layer],
          duration: 0.3
      });
  });
});

// Industry Card Interactions
document.querySelectorAll('.industry-card').forEach(card => {
  card.addEventListener('click', () => {
      const industry = card.dataset.industry;
      // Show industry-specific case study modal
  });
});

// why us
// Interactive Verification System
class ProofSystem {
  constructor() {
      this.caseStudies = {
          ecommerce: { perf: '+55%', loadTime: '1.2s' },
          fintech: { security: '100%', compliance: 'PCI DSS' }
      };
      
      document.querySelectorAll('.case-pill').forEach(pill => {
          pill.addEventListener('click', () => this.showCaseStudy(pill.textContent));
      });
  }

  showCaseStudy(industry) {
      const data = this.caseStudies[industry.toLowerCase()];
      const modalContent = `
          <h3>${industry} Results</h3>
          <ul>
              ${Object.entries(data).map(([k,v]) => `<li>${k}: ${v}</li>`).join('')}
          </ul>
      `;
      // Show modal with results
  }
}

// Process Step Interactions
gsap.from('.process-step', {
  scrollTrigger: {
      trigger: '.process-wheel',
      start: 'top center'
  },
  opacity: 0,
  y: 50,
  stagger: 0.2,
  duration: 0.8
});

// Trust Animation
gsap.to('.trust-ray', {
  rotate: '+=360',
  repeat: -1,
  duration: 8,
  ease: 'none'
});

// tech advantages
// Interactive Benchmark System
class PerformanceDemo {
  constructor() {
      this.tests = {
          json: () => this.runJSONTest(),
          dom: () => this.runDOMTest()
      };
      
      document.querySelectorAll('.benchmark-btn').forEach(btn => {
          btn.addEventListener('click', () => 
              this.tests[btn.dataset.test]()
          );
      });
  }

  runJSONTest() {
      const start = performance.now();
      JSON.parse(`{"data":${JSON.stringify(new Array(10000).fill({test: "value"}))}}`);
      const duration = performance.now() - start;
      this.showResults('JSON Parse', duration);
  }

  showResults(testName, duration) {
      const results = document.createElement('div');
      results.className = 'benchmark-result';
      results.innerHTML = `
          <h4>${testName}</h4>
          <p>Completed in ${duration.toFixed(2)}ms</p>
      `;
      document.querySelector('.performance-demo').appendChild(results);
  }
}

// Initialize demo
new PerformanceDemo();

// Cluster Animation
gsap.to('.node', {
  x: () => Math.random() * 100 - 50,
  y: () => Math.random() * 100 - 50,
  duration: 2,
  repeat: -1,
  yoyo: true,
  ease: "power1.inOut"
});

// best practices
// Interactive Audit System
class StandardsAudit {
  constructor() {
      this.audits = {
          security: ['OWASP Compliance', 'CVE Monitoring', 'Dependency Checks'],
          architecture: ['SOLID Principles', 'Layered Isolation', 'API Contracts']
      };
      
      document.querySelectorAll('.audit-toggle').forEach(btn => {
          btn.addEventListener('click', () => this.toggleAudit(btn));
      });
  }

  toggleAudit(button) {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', !isExpanded);
      const details = button.previousElementSibling;
      gsap.to(details, {
          height: isExpanded ? 0 : 'auto',
          opacity: isExpanded ? 0 : 1,
          duration: 0.3
      });
  }
}

// Animated ECG Monitor
function createECG() {
  const ecg = document.querySelector('.code-ecg');
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.appendChild(path);
  ecg.appendChild(svg);

  let x = 0;
  function animate() {
      const y = Math.sin(x * 0.1) * 20 + 50;
      path.setAttribute("d", `M ${x},${y} L ${x+2},${y}`);
      x = (x + 2) % 500;
      requestAnimationFrame(animate);
  }
  animate();
}

// Initialize systems
new StandardsAudit();
createECG();

// Compliance Timeline Animation
gsap.from('.milestone', {
  scrollTrigger: {
      trigger: '.compliance-timeline',
      start: 'top center'
  },
  x: -100,
  opacity: 0,
  stagger: 0.3,
  duration: 0.8
});

// pricing
// Interactive Pricing Calculator
class PricingCalculator {
  constructor() {
      this.hoursInput = document.getElementById('hours');
      this.complexitySelect = document.getElementById('complexity');
      this.rateDisplay = document.getElementById('hourlyRate');
      this.hoursValue = document.getElementById('hoursValue');
      
      this.baseRate = 95;
      this.init();
  }

  init() {
      this.hoursInput.addEventListener('input', this.updateEstimate.bind(this));
      this.complexitySelect.addEventListener('change', this.updateEstimate.bind(this));
      this.updateEstimate();
  }

  updateEstimate() {
      const complexity = parseFloat(this.complexitySelect.value);
      const hours = parseInt(this.hoursInput.value);
      const rate = this.baseRate * complexity;
      
      this.hoursValue.textContent = `${hours}h`;
      this.rateDisplay.textContent = rate.toFixed(0);
      
      // Update gauge animation
      gsap.to('.gauge-fill', {
          height: `${Math.min((hours/500)*100, 100)}%`,
          duration: 0.5
      });
  }
}

// Initialize calculator
new PricingCalculator();

// Timeline Animation
gsap.from('.timeline-phase', {
  scrollTrigger: {
      trigger: '.value-timeline',
      start: 'top center'
  },
  y: 50,
  opacity: 0,
  stagger: 0.3,
  duration: 0.8
});

// Savings Meter Animation
gsap.to('.meter-graphic', {
  rotate: 360,
  repeat: -1,
  duration: 8,
  ease: 'none',
  transformOrigin: 'center center'
});

// faq
// Interactive FAQ System
class FAQEngine {
  constructor() {
      this.answered = 0;
      this.totalQuestions = document.querySelectorAll('.faq-card').length;
      this.init();
  }

  init() {
      document.querySelectorAll('.faq-question').forEach(btn => {
          btn.addEventListener('click', () => {
              const wasExpanded = btn.getAttribute('aria-expanded') === 'true';
              if(!wasExpanded) this.handleQuestionOpen(btn);
          });
      });
  }

  handleQuestionOpen(btn) {
      this.answered++;
      document.getElementById('answeredCount').textContent = this.answered;
      
      const issueType = btn.closest('.faq-card').dataset.issue;
      this.highlightCodeIssue(issueType);
  }

  highlightCodeIssue(issueType) {
      gsap.to(`[data-issue="${issueType}"] .code-line::after`, {
          width: '100%',
          duration: 0.5,
          stagger: 0.1
      });
  }
}

// Initialize FAQ interactions
new FAQEngine();

// Diagnostic Animation
gsap.to('.code-line', {
  scrollTrigger: {
      trigger: '.diagnostic-window',
      start: 'top center'
  },
  opacity: 1,
  stagger: 0.1,
  duration: 0.3
});

// our appraoch
// Interactive Console System
class DevConsole {
  constructor() {
      this.tabs = document.querySelectorAll('.tab');
      this.panels = document.querySelectorAll('.panel');
      this.init();
  }

  init() {
      this.tabs.forEach(tab => {
          tab.addEventListener('click', () => this.switchTab(tab));
      });
  }

  switchTab(selectedTab) {
      const tabName = selectedTab.dataset.tab;
      
      // Toggle active classes
      this.tabs.forEach(t => t.classList.remove('active'));
      this.panels.forEach(p => p.classList.remove('active'));
      
      selectedTab.classList.add('active');
      document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  }
}

// Initialize console
new DevConsole();

// Collaborative Cursors Animation
gsap.to('.cursor', {
  x: () => Math.random() * 200 - 100,
  y: () => Math.random() * 40 - 20,
  duration: 3,
  repeat: -1,
  yoyo: true
});

// Bundle Visualization
gsap.from('.file', {
  scaleX: 0,
  duration: 1,
  stagger: 0.2,
  scrollTrigger: {
      trigger: '.bundle-visual',
      start: 'top center'
  }
});

// solution we developer 
// Neural Network Interactions
document.addEventListener('DOMContentLoaded', () => {
    const nodes = document.querySelectorAll('.node');
    
    nodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            const nodeType = node.dataset.node;
            document.querySelectorAll(`[data-from="${nodeType}"]`).forEach(stream => {
                stream.style.animationPlayState = 'paused';
                stream.style.backgroundColor = '#f7df1e';
            });
        });
        
        node.addEventListener('mouseleave', () => {
            document.querySelectorAll('.data-stream').forEach(stream => {
                stream.style.animationPlayState = 'running';
                stream.style.backgroundColor = '';
            });
        });
    });

    // Animate package.json build
    anime({
        targets: '.loading-bar',
        width: ['0%', '100%'],
        duration: 2000,
        loop: true,
        easing: 'linear',
        direction: 'alternate'
    });

    // Dynamic stream creation
    setInterval(() => {
        const streams = document.querySelector('.data-streams');
        const newStream = document.createElement('div');
        newStream.className = 'stream';
        newStream.style.setProperty('--angle', `${Math.random() * 360}deg`);
        streams.appendChild(newStream);
        
        if(streams.children.length > 20) {
            streams.removeChild(streams.firstElementChild);
        }
    }, 500);
});

// more tech
// Quantum Interactions
document.querySelectorAll('.qubit-container a').forEach(qubit => {
    qubit.addEventListener('mouseenter', () => {
        const particles = document.createElement('div');
        particles.className = 'virtual-particle';
        qubit.querySelector('.probability-cloud').appendChild(particles);
        
        anime({
            targets: particles,
            translateY: [-50, 50],
            translateX: [-50, 50],
            opacity: [1, 0],
            duration: 1000,
            easing: 'easeOutExpo'
        });
    });

    qubit.addEventListener('click', (e) => {
        e.preventDefault();
        const tech = qubit.dataset.tech;
        anime({
            targets: qubit,
            scale: [1, 0.8, 1],
            duration: 300,
            easing: 'easeInOutQuad'
        });
        setTimeout(() => window.location = qubit.href, 300);
    });
});