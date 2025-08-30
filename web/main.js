import * as THREE from './lib/three.module.js';
import { EffectComposer } from './lib/EffectComposer.js';
import { RenderPass } from './lib/RenderPass.js';
import { ShaderPass } from './lib/postprocessing/ShaderPass.js';
import { CopyShader } from './lib/shaders/CopyShader.js';

// 获取 DOM 元素
const canvas = document.getElementById('canvas');
const countdownEl = document.getElementById('countdown');
const releaseBtn = document.getElementById('release');
const survivalEl = document.getElementById('survival');
const reportBtn = document.getElementById('report');
const reportModal = document.getElementById('reportModal');
const intensityEl = document.getElementById('intensity');
const freqEl = document.getElementById('freq');
const ttlEl = document.getElementById('ttl');
const closeReportBtn = document.getElementById('closeReport');
const energyMeter = document.getElementById('energyMeter');
const chantModal = document.getElementById('chantModal');
const chantProgress = document.getElementById('chantProgress');
const chantCount = document.getElementById('chantCount');
const fortuneText = document.getElementById('fortuneText');

// 全局变量
let id; // 用于存储当前祈福ID
let particleSystem;
let particlesGeometry;
let particlesMaterial;
let heartMesh;
let animationId;
let blessingParticleSystem;
let deviceOrientationData = null;
let chantCountValue = 0;
let energyLevel = 0;
let isGestureActive = false;

// 禅语开示库
const fortuneSayings = [
  "心如明镜台，时时勤拂拭。",
  "菩提本无树，明镜亦非台。",
  "一切有为法，如梦幻泡影。",
  "色即是空，空即是色。",
  "诸行无常，是生灭法。",
  "诸法无我，涅槃寂静。",
  "慈悲为怀，普度众生。",
  "善有善报，恶有恶报。",
  "心诚则灵，愿力无穷。",
  "放下执念，得大自在。"
];

// 初始化 Three.js 渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
canvas.appendChild(renderer.domElement);

// 创建场景和相机
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// 创建背景粒子系统
function createBackgroundParticles() {
  // 创建粒子几何体
  particlesGeometry = new THREE.BufferGeometry();
  const particleCount = 1500;
  const posArray = new Float32Array(particleCount * 3);
  const colorArray = new Float32Array(particleCount * 3);
  
  // 初始化粒子位置和颜色
  for(let i = 0; i < particleCount * 3; i += 3) {
    // 空间分布粒子
    posArray[i] = (Math.random() - 0.5) * 30;
    posArray[i + 1] = (Math.random() - 0.5) * 30;
    posArray[i + 2] = (Math.random() - 0.5) * 30;
    
    // 颜色渐变（从紫色到蓝色到青色到金色）
    const colorType = Math.random();
    if (colorType < 0.25) {
      // 紫色系
      colorArray[i] = Math.random() * 0.5 + 0.5;     // R
      colorArray[i + 1] = Math.random() * 0.3;       // G
      colorArray[i + 2] = Math.random() * 0.5 + 0.5; // B
    } else if (colorType < 0.5) {
      // 蓝色系
      colorArray[i] = Math.random() * 0.3;           // R
      colorArray[i + 1] = Math.random() * 0.3;       // G
      colorArray[i + 2] = Math.random() * 0.7 + 0.3; // B
    } else if (colorType < 0.75) {
      // 青色系
      colorArray[i] = Math.random() * 0.3;           // R
      colorArray[i + 1] = Math.random() * 0.7 + 0.3; // G
      colorArray[i + 2] = Math.random() * 0.7 + 0.3; // B
    } else {
      // 金色系
      colorArray[i] = Math.random() * 0.3 + 0.7;     // R
      colorArray[i + 1] = Math.random() * 0.3 + 0.5; // G
      colorArray[i + 2] = Math.random() * 0.2 + 0.2; // B
    }
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
  
  // 创建粒子材质
  particlesMaterial = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });
  
  // 创建粒子系统
  particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particleSystem);
}

// 创建心形几何体
function createHeart() {
  const heartShape = new THREE.Shape();
  const x = 0, y = 0;
  
  heartShape.moveTo(x + 0.5, y + 0.5);
  heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.2, y + 0.8, x + 0, y + 0.5);
  heartShape.bezierCurveTo(x - 0.2, y + 0.8, x - 0.5, y + 0.5, x - 0.5, y + 0.2);
  heartShape.bezierCurveTo(x - 0.5, y - 0.1, x - 0.2, y - 0.3, x + 0, y);
  heartShape.bezierCurveTo(x + 0.2, y - 0.3, x + 0.5, y - 0.1, x + 0.5, y + 0.2);
  heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
  
  const extrudeSettings = {
    depth: 0.3,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 3,
    bevelSize: 0.1,
    bevelThickness: 0.1
  };
  
  const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
  const material = new THREE.MeshPhongMaterial({ 
    color: 0xff3366,
    emissive: 0x660033,
    shininess: 100,
    transparent: true,
    opacity: 0.95
  });
  
  heartMesh = new THREE.Mesh(geometry, material);
  heartMesh.scale.set(1.8, 1.8, 1.8);
  heartMesh.position.z = -2;
  scene.add(heartMesh);
  
  // 添加多个点光源营造氛围
  const pointLight1 = new THREE.PointLight(0xff3366, 1.5, 15);
  pointLight1.position.set(2, 2, 2);
  scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0x00ccff, 1.5, 15);
  pointLight2.position.set(-2, -2, 2);
  scene.add(pointLight2);
  
  const pointLight3 = new THREE.PointLight(0xffcc00, 1, 15);
  pointLight3.position.set(0, 0, 3);
  scene.add(pointLight3);
  
  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
}

// 创建祈福粒子效果
function createBlessingParticles() {
  const particleCount = 800;
  const positions = [];
  const colors = [];
  const sizes = [];
  
  for (let i = 0; i < particleCount; i++) {
    positions.push(
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15
    );
    
    // 佛教色彩粒子
    const colorType = Math.random();
    let r, g, b;
    if (colorType < 0.3) {
      // 金色
      r = 1; g = 0.8; b = 0.2;
    } else if (colorType < 0.6) {
      // 红色（代表虔诚）
      r = 1; g = 0.3; b = 0.3;
    } else {
      // 蓝色（代表智慧）
      r = 0.2; g = 0.6; b = 1;
    }
    
    colors.push(r, g, b);
    sizes.push(Math.random() * 0.15 + 0.08);
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
  
  const material = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });
  
  blessingParticleSystem = new THREE.Points(geometry, material);
  blessingParticleSystem.visible = false;
  scene.add(blessingParticleSystem);
}

// 初始化场景
createBackgroundParticles();
createHeart();
createBlessingParticles();

// 创建效果合成器
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new ShaderPass(CopyShader));

// 处理窗口大小变化
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// 动画循环
function animate() {
  animationId = requestAnimationFrame(animate);
  
  // 旋转背景粒子系统
  if (particleSystem) {
    particleSystem.rotation.x += 0.0003;
    particleSystem.rotation.y += 0.0007;
  }
  
  // 旋转心形
  if (heartMesh) {
    heartMesh.rotation.y += 0.008;
    heartMesh.rotation.x = Math.sin(Date.now() * 0.001) * 0.05;
    
    // 脉动效果
    const scale = 1 + Math.sin(Date.now() * 0.003) * 0.03;
    heartMesh.scale.set(scale * 1.8, scale * 1.8, scale * 1.8);
  }
  
  // 更新祈福粒子
  if (blessingParticleSystem && blessingParticleSystem.visible) {
    const positions = blessingParticleSystem.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += (Math.random() - 0.5) * 0.03;
      positions[i + 1] += (Math.random() - 0.5) * 0.03;
      positions[i + 2] += (Math.random() - 0.5) * 0.03 + 0.02;
    }
    blessingParticleSystem.geometry.attributes.position.needsUpdate = true;
  }
  
  composer.render();
}
animate();

// 页面事件绑定
document.getElementById('start').addEventListener('click', () => {
  document.getElementById('welcome').classList.add('hidden');
  document.getElementById('form').classList.remove('hidden');
});

// 唵嘛呢叭咪吽按钮事件
document.getElementById('chantBtn').addEventListener('click', () => {
  chantModal.classList.remove('hidden');
  chantCountValue = 0;
  chantCount.textContent = "0/3";
  chantProgress.style.width = "0%";
});

// 开始唪诵
document.getElementById('startChant').addEventListener('click', () => {
  chantCountValue++;
  chantCount.textContent = `${chantCountValue}/3`;
  chantProgress.style.width = `${(chantCountValue / 3) * 100}%`;
  
  if (chantCountValue >= 3) {
    setTimeout(() => {
      chantModal.classList.add('hidden');
      // 显示唪诵完成提示
      const hint = document.createElement('div');
      hint.textContent = '唪诵完成，功德无量 🙏';
      hint.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: #00ccff;
        padding: 10px 20px;
        border-radius: 20px;
        z-index: 100;
        font-size: 14px;
      `;
      document.body.appendChild(hint);
      setTimeout(() => hint.remove(), 3000);
    }, 1000);
  }
});

// 跳过唪诵
document.getElementById('skipChant').addEventListener('click', () => {
  chantModal.classList.add('hidden');
});

document.getElementById('next').addEventListener('click', () => {
  const name = document.getElementById('name').value.trim();
  const wish = document.getElementById('wish').value.trim();
  if (!name || !wish) return alert('请填写完整信息');
  
  fetch('/api/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, wish })
  })
  .then(res => res.json())
  .then(data => {
    id = data.id; // 保存ID到全局变量
    document.getElementById('form').classList.add('hidden');
    document.getElementById('bless').classList.remove('hidden');
    
    // 初始化能量 meter
    energyLevel = 0;
    energyMeter.style.width = "0%";
    countdownEl.textContent = 10;
    
    // 能量汇聚动画
    const energyInterval = setInterval(() => {
      energyLevel += 2;
      energyMeter.style.width = `${energyLevel}%`;
      if (energyLevel >= 100) {
        clearInterval(energyInterval);
      }
    }, 200);
    
    // 倒计时
    let count = 10;
    const interval = setInterval(() => {
      count--;
      countdownEl.textContent = count;
      if (count <= 0) {
        clearInterval(interval);
        releaseBtn.disabled = false;
      }
    }, 1000);
  })
  .catch(err => {
    console.error('创建祈福失败:', err);
    alert('创建祈福失败，请重试');
  });
});

// 手势感应按钮
document.getElementById('gestureBtn').addEventListener('click', () => {
  if (isGestureActive) return;
  
  isGestureActive = true;
  const btn = document.getElementById('gestureBtn');
  btn.textContent = "感应中...";
  btn.disabled = true;
  
  // 模拟手势感应过程
  setTimeout(() => {
    isGestureActive = false;
    btn.textContent = "手势感应";
    btn.disabled = false;
    
    // 增加能量
    energyLevel = Math.min(100, energyLevel + 20);
    energyMeter.style.width = `${energyLevel}%`;
    
    // 提示
    const hint = document.createElement('div');
    hint.textContent = '手势感应成功，能量+20% ✨';
    hint.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: #00ccff;
      padding: 10px 20px;
      border-radius: 20px;
      z-index: 100;
      font-size: 14px;
    `;
    document.body.appendChild(hint);
    setTimeout(() => hint.remove(), 3000);
  }, 2000);
});

// 释放能量
releaseBtn.addEventListener('click', () => {
  if (!id) return;
  
  fetch('/api/burn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  })
  .then(res => res.json())
  .then(() => {
    document.getElementById('bless').classList.add('hidden');
    document.getElementById('ash').classList.remove('hidden');
    
    // 显示祈福粒子效果
    if (blessingParticleSystem) {
      blessingParticleSystem.visible = true;
    }
    
    // 生成随机生存时长
    survivalEl.querySelector('span').textContent = `${Math.floor(Math.random() * 10 + 1)}小时`;
    
    // 显示随机禅语开示
    const randomSaying = fortuneSayings[Math.floor(Math.random() * fortuneSayings.length)];
    fortuneText.textContent = randomSaying;
  })
  .catch(err => {
    console.error('焚毁失败:', err);
    alert('焚毁失败，请重试');
  });
});

// 查看报告
reportBtn.addEventListener('click', () => {
  if (!id) return;
  
  fetch(`/api/report/${id}`)
    .then(res => res.json())
    .then(data => {
      // 根据设备方向数据计算心念强度和共振频率
      let intensity = data.intensity;
      let freq = data.freq;
      
      // 如果有设备数据，则根据设备数据调整
      if (deviceOrientationData) {
        // 根据设备摇晃程度计算心念强度 (0-100)
        const shakeIntensity = Math.min(100, Math.sqrt(
          deviceOrientationData.alpha * deviceOrientationData.alpha +
          deviceOrientationData.beta * deviceOrientationData.beta +
          deviceOrientationData.gamma * deviceOrientationData.gamma
        ));
        intensity = Math.floor(70 + (shakeIntensity / 10));
        
        // 根据设备方向计算共振频率 (400-500Hz)
        freq = (400 + Math.abs(deviceOrientationData.alpha) % 100).toFixed(2);
      }
      
      intensityEl.textContent = intensity;
      freqEl.textContent = freq;
      ttlEl.textContent = data.ttl;
      document.getElementById('energyLevel').textContent = data.energyLevel + " 级";
      document.getElementById('resonance').textContent = data.resonance;
      document.getElementById('coords').textContent = data.coords;
      
      reportModal.classList.remove('hidden');
      
      // 添加转化倒计时动画（5秒）
      let timeLeft = 5;
      ttlEl.textContent = `${timeLeft}秒`;
      
      const countdownInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          ttlEl.textContent = "已完成";
          
          // 显示祈福完成动画
          showBlessingAnimation();
        } else {
          ttlEl.textContent = `${timeLeft}秒`;
        }
      }, 1000);
    })
    .catch(err => {
      console.error('获取报告失败:', err);
      alert('获取报告失败，请重试');
    });
});

// 再次祈福
document.getElementById('again').addEventListener('click', () => {
  document.getElementById('ash').classList.add('hidden');
  document.getElementById('welcome').classList.remove('hidden');
  // 重置状态
  if (blessingParticleSystem) {
    blessingParticleSystem.visible = false;
  }
});

// 显示祈福动画
function showBlessingAnimation() {
  // 创建一个全屏的祝福效果
  const blessingEffect = document.createElement('div');
  blessingEffect.id = 'blessingEffect';
  blessingEffect.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,51,102,0.3) 0%, rgba(0,200,255,0.1) 70%, transparent 100%);
    z-index: 100;
    pointer-events: none;
    animation: blessingPulse 2s ease-in-out infinite;
  `;
  
  document.body.appendChild(blessingEffect);
  
  // 添加CSS动画
  const style = document.createElement('style');
  style.textContent = `
    @keyframes blessingPulse {
      0% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
      100% { opacity: 0.3; transform: scale(1); }
    }
    
    .blessing-particle {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: radial-gradient(circle, #ff3366, #00ccff);
      pointer-events: none;
      animation: floatUp 3s linear forwards;
    }
    
    @keyframes floatUp {
      to {
        transform: translateY(-100vh) rotate(360deg);
        opacity: 0;
      }
    }
    
    .lotus-flower {
      position: fixed;
      font-size: 30px;
      pointer-events: none;
      animation: bloom 4s ease-out forwards;
    }
    
    @keyframes bloom {
      0% { 
        transform: translateY(100vh) scale(0.1); 
        opacity: 0;
      }
      50% { 
        transform: translateY(-50vh) scale(1.2); 
        opacity: 1;
      }
      100% { 
        transform: translateY(-100vh) scale(0.8); 
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  // 创建粒子效果
  for (let i = 0; i < 150; i++) {
    setTimeout(() => {
      const particle = document.createElement('div');
      particle.className = 'blessing-particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.bottom = '0';
      particle.style.width = `${Math.random() * 20 + 10}px`;
      particle.style.height = particle.style.width;
      particle.style.animationDuration = `${Math.random() * 4 + 3}s`;
      document.body.appendChild(particle);
      
      // 粒子动画结束后移除
      setTimeout(() => {
        particle.remove();
      }, 7000);
    }, i * 40);
  }
  
  // 创建莲花效果
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const lotus = document.createElement('div');
      lotus.className = 'lotus-flower';
      lotus.textContent = '🌸';
      lotus.style.left = `${Math.random() * 100}%`;
      lotus.style.bottom = '0';
      document.body.appendChild(lotus);
      
      // 莲花动画结束后移除
      setTimeout(() => {
        lotus.remove();
      }, 7000);
    }, i * 200);
  }
  
  // 5秒后移除效果并显示焚毁仪式
  setTimeout(() => {
    blessingEffect.remove();
    showBurnRitual();
  }, 5000);
}

// 显示焚毁仪式
function showBurnRitual() {
  // 创建焚毁仪式界面
  const burnRitual = document.createElement('div');
  burnRitual.className = 'burn-ritual';
  burnRitual.innerHTML = `
    <div class="burn-stars" id="burnStars"></div>
    <div class="burn-content">
      <div class="burn-symbol">🔥</div>
      <div class="burn-title">心愿升腾</div>
      <div class="burn-message">
        您的心愿正在穿越星际<br>
        向着宇宙深处传递<br>
        愿力将化作星光指引前路
      </div>
      <div class="burn-progress">
        <div class="burn-progress-fill" id="burnProgress"></div>
      </div>
    </div>
  `;
  document.body.appendChild(burnRitual);
  
  // 创建星空效果
  const burnStars = document.getElementById('burnStars');
  for (let i = 0; i < 50; i++) {
    const star = document.createElement('div');
    star.className = 'burn-star';
    star.textContent = '✦';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.fontSize = `${Math.random() * 10 + 10}px`;
    star.style.animationDelay = `${Math.random() * 2}s`;
    burnStars.appendChild(star);
  }
  
  // 进度条动画
  const burnProgress = document.getElementById('burnProgress');
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 2;
    burnProgress.style.width = `${progress}%`;
    
    if (progress >= 100) {
      clearInterval(progressInterval);
      
      // 焚毁完成
      setTimeout(() => {
        burnRitual.remove();
        document.getElementById('ash').classList.add('hidden');
        
        // 显示完成提示
        const completeMsg = document.createElement('div');
        completeMsg.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.8);
          color: #00ccff;
          padding: 20px 40px;
          border-radius: 10px;
          font-size: 24px;
          z-index: 200;
          text-align: center;
          box-shadow: 0 0 20px rgba(0, 200, 255, 0.5);
        `;
        completeMsg.innerHTML = `
          <div>✨ 心愿已送达宇宙 ✨</div>
          <div style="font-size: 16px; margin-top: 10px; color: #aaa;">
            愿您所求皆如愿<br>
            程序将在3秒后安静离去
          </div>
        `;
        document.body.appendChild(completeMsg);
        
        // 3秒后关闭程序
        setTimeout(() => {
          completeMsg.remove();
          // 清理Three.js资源
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
          // 关闭页面
          window.close();
        }, 3000);
      }, 500);
    }
  }, 50);
}

// 关闭报告
closeReportBtn.addEventListener('click', () => {
  reportModal.classList.add('hidden');
});

// 设备方向监听（用于获取心念强度和共振频率数据）
if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
  // iOS 13+ 设备需要用户授权
  window.addEventListener('click', function requestPermission() {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', (event) => {
            deviceOrientationData = {
              alpha: event.alpha,
              beta: event.beta,
              gamma: event.gamma
            };
          });
        }
      })
      .catch(console.error);
    window.removeEventListener('click', requestPermission);
  });
} else if ('ondeviceorientation' in window) {
  // 非iOS设备
  window.addEventListener('deviceorientation', (event) => {
    deviceOrientationData = {
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma
    };
  });
}

// 页面卸载时清理动画
window.addEventListener('beforeunload', () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});