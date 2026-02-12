/**
 * Guardians of the Realm - Tower Defense Game
 * Complete JavaScript Implementation
 */

// ============================================
// GAME CONSTANTS AND CONFIGURATION
// ============================================
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 480;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 12;
const CELL_SIZE = 40;

// Damage types
const DAMAGE_TYPE = {
    PHYSICAL: 'physical',
    MAGIC: 'magic',
    PURE: 'pure'
};

// Armor types
const ARMOR_TYPE = {
    LIGHT: 'light',
    HEAVY: 'heavy',
    MAGIC_IMMUNE: 'magicImmune',
    ETHEREAL: 'ethereal'
};

// Damage effectiveness matrix
const DAMAGE_MULTIPLIERS = {
    physical: { light: 1.0, heavy: 0.5, magicImmune: 1.0, ethereal: 0.0 },
    magic: { light: 1.0, heavy: 1.5, magicImmune: 0.0, ethereal: 1.25 },
    pure: { light: 1.0, heavy: 1.0, magicImmune: 1.0, ethereal: 1.0 }
};

// Enemy definitions
const ENEMY_TYPES = {
    GRUNT: {
        name: 'Grunt',
        health: 50,
        speed: 1.5,
        armor: 'light',
        reward: 8,
        color: '#e74c3c',
        radius: 12
    },
    RUNNER: {
        name: 'Runner',
        health: 30,
        speed: 2.5,
        armor: 'light',
        reward: 10,
        color: '#e67e22',
        radius: 10,
        ability: 'speedBoost'
    },
    TANK: {
        name: 'Tank',
        health: 150,
        speed: 0.8,
        armor: 'heavy',
        reward: 20,
        color: '#7f8c8d',
        radius: 16
    },
    FLYER: {
        name: 'Flyer',
        health: 40,
        speed: 2.0,
        armor: 'light',
        reward: 12,
        color: '#9b59b6',
        radius: 11,
        flying: true
    },
    WARLORD: {
        name: 'Warlord',
        health: 600,
        speed: 0.6,
        armor: 'heavy',
        reward: 200,
        color: '#2c3e50',
        radius: 20,
        boss: true,
        abilities: ['roar', 'shell', 'summon']
    },
    SWARM: {
        name: 'Swarm',
        health: 15,
        speed: 3.5,
        armor: 'light',
        reward: 3,
        color: '#9b59b6',
        radius: 6,
        swarm: true,
        description: 'Tiny but numerous. Spawns in large groups.'
    },
    NECROMANCER: {
        name: 'Necromancer',
        health: 250,
        speed: 0.5,
        armor: 'ethereal',
        reward: 120,
        color: '#2d3436',
        radius: 14,
        boss: true,
        summonRate: 4,
        maxSummons: 15,
        description: 'Summons skeletons to fight for it. Kill quickly!'
    },
    SKELETON: {
        name: 'Skeleton',
        health: 35,
        speed: 1.8,
        armor: 'light',
        reward: 2,
        color: '#b2bec3',
        radius: 9,
        summoned: true,
        description: 'Summoned by Necromancers. Weak but relentless.'
    },
    BEHEMOTH: {
        name: 'Behemoth',
        health: 3000,
        speed: 0.25,
        armor: 'heavy',
        reward: 800,
        color: '#1a1a2e',
        radius: 26,
        boss: true,
        abilities: ['earthquake', 'armorUp', 'regenerate'],
        description: 'The ultimate boss. Massive health and devastating attacks.'
    }
};

// Tower definitions
const TOWER_TYPES = {
    ARCHER: {
        name: 'Archer Tower',
        cost: 40,
        damage: 18,
        attackSpeed: 1.1,
        range: 120,
        damageType: 'physical',
        color: '#8b4513',
        projectileColor: '#d4a574',
        branches: [
            {
                name: 'Sniper',
                upgrades: [
                    { cost: 75, damage: 10, range: 30, description: '+10 dmg, +3 range' },
                    { cost: 120, damage: 20, flying: true, description: 'Can target flying' },
                    { cost: 200, damage: 40, crit: 0.25, description: '25% crit (2x dmg)' },
                    { cost: 350, damage: 80, armorPen: 0.5, description: '50% armor pen' }
                ]
            },
            {
                name: 'Rapid Fire',
                upgrades: [
                    { cost: 60, speed: 0.3, splash: 30, description: '+30% speed, splash' },
                    { cost: 100, speed: 0.3, range: 30, description: '+30% speed, +3 range' },
                    { cost: 180, multi: 3, description: '3 targets at once' },
                    { cost: 300, speed: 0.4, ricochet: 2, description: 'Ricochet to 2 targets' }
                ]
            },
            {
                name: 'Poisoner',
                upgrades: [
                    { cost: 70, poison: 10, poisonDuration: 3, description: 'Poison: 10 dmg/s' },
                    { cost: 110, slow: 0.2, description: 'Poison slows 20%' },
                    { cost: 190, armorRed: 5, description: 'Reduces armor by 5' },
                    { cost: 320, poisonExplode: true, description: 'Poison explodes on death' }
                ]
            }
        ]
    },
    CRYSTAL: {
        name: 'Crystal Tower',
        cost: 70,
        damage: 12,
        attackSpeed: 0.8,
        range: 100,
        damageType: 'magic',
        color: '#3498db',
        projectileColor: '#85c1e9',
        aoe: true,
        branches: [
            {
                name: 'Frost Nova',
                upgrades: [
                    { cost: 100, damage: 5, slow: 0.3, description: '+5 dmg, 30% slow' },
                    { cost: 160, damage: 8, slow: 0.45, description: '+8 dmg, 45% slow' },
                    { cost: 280, freeze: 0.1, description: '10% freeze chance' },
                    { cost: 450, freeze: 0.25, bonus: 2.0, description: '25% freeze, 2x dmg to frozen' }
                ]
            },
            {
                name: 'Lightning',
                upgrades: [
                    { cost: 90, chain: 3, description: 'Chain to 3 targets' },
                    { cost: 150, chain: 5, stun: 0.5, description: 'Chain to 5, stun 0.5s' },
                    { cost: 260, chain: 7, stun: 0.75, damage: 10, description: 'Chain 7, stun 0.75s' },
                    { cost: 420, chain: 999, stun: 1.0, damage: 15, description: 'All in range, stun 1s' }
                ]
            },
            {
                name: 'Aura',
                upgrades: [
                    { cost: 120, auraSpeed: 0.15, description: '+15% speed to nearby' },
                    { cost: 200, auraDamage: 0.10, description: '+10% dmg to nearby' },
                    { cost: 350, auraRange: 0.20, description: '+20% range to nearby' },
                    { cost: 550, global: true, description: 'Effects entire map' }
                ]
            }
        ]
    },
    VAULT: {
        name: 'Gold Vault',
        cost: 100,
        damage: 0,
        attackSpeed: 0,
        range: 0,
        damageType: 'pure',
        color: '#f1c40f',
        noAttack: true,
        maxCount: 3,
        branches: [
            {
                name: 'Treasury',
                upgrades: [
                    { cost: 150, income: 3, description: '+3 gold/3s' },
                    { cost: 250, income: 6, description: '+6 gold/3s' },
                    { cost: 400, interest: 0.15, description: '15% interest' },
                    { cost: 700, interest: 0.25, bonus: 100, description: '25% interest, +100 wave bonus' }
                ]
            },
            {
                name: 'Trade',
                upgrades: [
                    { cost: 130, killBonus: 2, description: '+2 gold per kill' },
                    { cost: 220, killBonus: 4, description: '+4 gold per kill' },
                    { cost: 380, drops: true, description: 'Enemies drop gold' },
                    { cost: 650, double: 0.2, description: '20% double gold chance' }
                ]
            },
            {
                name: 'Battle Fund',
                upgrades: [
                    { cost: 140, auraDamage: 0.20, description: '+20% dmg to nearby' },
                    { cost: 240, lifesteal: 0.05, description: '5% lifesteal -> gold' },
                    { cost: 420, goldBonus: 0.01, description: '+1 dmg per 100 gold' },
                    { cost: 750, goldArrows: true, description: 'Gold projectiles' }
                ]
            }
        ]
    }
};

// Wave configurations
const WAVES = [
    // Early waves - easier to help player build up
    {
        enemies: [{ type: 'GRUNT', count: 8, interval: 1000 }],
        preparationTime: 20,
        bonus: 100
    },
    {
        enemies: [
            { type: 'GRUNT', count: 6, interval: 900 },
            { type: 'RUNNER', count: 3, interval: 800 }
        ],
        preparationTime: 20,
        bonus: 120
    },
    {
        enemies: [
            { type: 'GRUNT', count: 5, interval: 800 },
            { type: 'RUNNER', count: 3, interval: 700 },
            { type: 'TANK', count: 1, interval: 2000 }
        ],
        preparationTime: 20,
        bonus: 140
    },
    {
        enemies: [
            { type: 'GRUNT', count: 4, interval: 700 },
            { type: 'RUNNER', count: 4, interval: 600 },
            { type: 'TANK', count: 2, interval: 1800 }
        ],
        preparationTime: 20,
        bonus: 160
    },
    {
        enemies: [
            { type: 'GRUNT', count: 6, interval: 600 },
            { type: 'RUNNER', count: 3, interval: 500 },
            { type: 'TANK', count: 2, interval: 1500 },
            { type: 'FLYER', count: 2, interval: 900 }
        ],
        preparationTime: 25,
        bonus: 180
    },
    // Mid game - introduces more challenge
    {
        enemies: [
            { type: 'RUNNER', count: 8, interval: 500 },
            { type: 'TANK', count: 3, interval: 1400 }
        ],
        preparationTime: 25,
        bonus: 200
    },
    {
        enemies: [
            { type: 'GRUNT', count: 10, interval: 500 },
            { type: 'TANK', count: 3, interval: 1300 },
            { type: 'FLYER', count: 4, interval: 700 }
        ],
        preparationTime: 25,
        bonus: 220
    },
    {
        enemies: [
            { type: 'RUNNER', count: 6, interval: 450 },
            { type: 'TANK', count: 4, interval: 1200 },
            { type: 'FLYER', count: 5, interval: 650 }
        ],
        preparationTime: 25,
        bonus: 240
    },
    {
        enemies: [
            { type: 'GRUNT', count: 12, interval: 400 },
            { type: 'TANK', count: 4, interval: 1100 },
            { type: 'FLYER', count: 6, interval: 600 }
        ],
        preparationTime: 25,
        bonus: 260
    },
    // First boss wave
    {
        enemies: [
            { type: 'GRUNT', count: 6, interval: 500 },
            { type: 'TANK', count: 2, interval: 1500 },
            { type: 'WARLORD', count: 1, interval: 3000 }
        ],
        preparationTime: 30,
        bonus: 500
    },
    // Late game - ramp up difficulty
    {
        enemies: [
            { type: 'RUNNER', count: 12, interval: 400 },
            { type: 'TANK', count: 5, interval: 1000 },
            { type: 'FLYER', count: 6, interval: 550 }
        ],
        preparationTime: 30,
        bonus: 300
    },
    {
        enemies: [
            { type: 'TANK', count: 6, interval: 900 },
            { type: 'FLYER', count: 8, interval: 500 }
        ],
        preparationTime: 30,
        bonus: 320
    },
    {
        enemies: [
            { type: 'RUNNER', count: 15, interval: 350 },
            { type: 'TANK', count: 6, interval: 800 },
            { type: 'FLYER', count: 8, interval: 450 }
        ],
        preparationTime: 30,
        bonus: 350
    },
    // Pre-final boss wave
    {
        enemies: [
            { type: 'TANK', count: 8, interval: 700 },
            { type: 'FLYER', count: 10, interval: 400 },
            { type: 'WARLORD', count: 1, interval: 4000 }
        ],
        preparationTime: 35,
        bonus: 600
    },
    // Final boss wave
    {
        enemies: [
            { type: 'GRUNT', count: 10, interval: 400 },
            { type: 'TANK', count: 4, interval: 1000 },
            { type: 'WARLORD', count: 2, interval: 5000 }
        ],
        preparationTime: 40,
        bonus: 1000
    },
    // Nightmare Tier - Waves 16-20
    {
        enemies: [
            { type: 'GRUNT', count: 20, interval: 300 },
            { type: 'RUNNER', count: 10, interval: 250 },
            { type: 'TANK', count: 8, interval: 600 }
        ],
        preparationTime: 35,
        bonus: 400,
        tier: 'nightmare'
    },
    {
        enemies: [
            { type: 'SWARM', count: 50, interval: 100 },
            { type: 'RUNNER', count: 12, interval: 300 },
            { type: 'FLYER', count: 10, interval: 500 }
        ],
        preparationTime: 35,
        bonus: 450,
        tier: 'nightmare'
    },
    {
        enemies: [
            { type: 'TANK', count: 10, interval: 500 },
            { type: 'WARLORD', count: 1, interval: 3000 },
            { type: 'GRUNT', count: 25, interval: 250 }
        ],
        preparationTime: 38,
        bonus: 600,
        tier: 'nightmare'
    },
    {
        enemies: [
            { type: 'FLYER', count: 15, interval: 350 },
            { type: 'SWARM', count: 80, interval: 80 },
            { type: 'TANK', count: 6, interval: 700 }
        ],
        preparationTime: 38,
        bonus: 550,
        tier: 'nightmare'
    },
    {
        enemies: [
            { type: 'SWARM', count: 100, interval: 60 },
            { type: 'TANK', count: 6, interval: 800 },
            { type: 'WARLORD', count: 1, interval: 5000 }
        ],
        preparationTime: 40,
        bonus: 800,
        tier: 'nightmare',
        milestone: true
    },
    // Legendary Tier - Waves 21-25
    {
        enemies: [
            { type: 'NECROMANCER', count: 1, interval: 3000 },
            { type: 'SKELETON', count: 20, interval: 200 },
            { type: 'TANK', count: 5, interval: 600 }
        ],
        preparationTime: 45,
        bonus: 600,
        tier: 'legendary'
    },
    {
        enemies: [
            { type: 'NECROMANCER', count: 2, interval: 4000 },
            { type: 'SKELETON', count: 40, interval: 150 },
            { type: 'RUNNER', count: 15, interval: 300 }
        ],
        preparationTime: 45,
        bonus: 700,
        tier: 'legendary'
    },
    {
        enemies: [
            { type: 'SWARM', count: 150, interval: 50 },
            { type: 'NECROMANCER', count: 1, interval: 5000 },
            { type: 'WARLORD', count: 1, interval: 8000 }
        ],
        preparationTime: 48,
        bonus: 900,
        tier: 'legendary'
    },
    {
        enemies: [
            { type: 'BEHEMOTH', count: 1, interval: 10000 },
            { type: 'TANK', count: 10, interval: 500 },
            { type: 'GRUNT', count: 30, interval: 200 }
        ],
        preparationTime: 50,
        bonus: 1500,
        tier: 'legendary'
    },
    {
        enemies: [
            { type: 'NECROMANCER', count: 3, interval: 5000 },
            { type: 'WARLORD', count: 2, interval: 7000 },
            { type: 'SKELETON', count: 60, interval: 100 }
        ],
        preparationTime: 55,
        bonus: 1800,
        tier: 'legendary',
        milestone: true
    },
    // Apocalypse Tier - Waves 26-30
    {
        enemies: [
            { type: 'SWARM', count: 200, interval: 40 },
            { type: 'TANK', count: 15, interval: 400 },
            { type: 'FLYER', count: 20, interval: 300 }
        ],
        preparationTime: 55,
        bonus: 1000,
        tier: 'apocalypse'
    },
    {
        enemies: [
            { type: 'NECROMANCER', count: 2, interval: 6000 },
            { type: 'SKELETON', count: 100, interval: 80 },
            { type: 'TANK', count: 12, interval: 450 }
        ],
        preparationTime: 55,
        bonus: 1200,
        tier: 'apocalypse'
    },
    {
        enemies: [
            { type: 'BEHEMOTH', count: 1, interval: 12000 },
            { type: 'WARLORD', count: 1, interval: 8000 },
            { type: 'SWARM', count: 150, interval: 50 }
        ],
        preparationTime: 58,
        bonus: 2000,
        tier: 'apocalypse'
    },
    {
        enemies: [
            { type: 'NECROMANCER', count: 4, interval: 5000 },
            { type: 'BEHEMOTH', count: 1, interval: 15000 },
            { type: 'TANK', count: 20, interval: 350 }
        ],
        preparationTime: 60,
        bonus: 2500,
        tier: 'apocalypse'
    },
    {
        enemies: [
            { type: 'BEHEMOTH', count: 2, interval: 15000 },
            { type: 'WARLORD', count: 3, interval: 10000 },
            { type: 'NECROMANCER', count: 5, interval: 6000 },
            { type: 'SWARM', count: 300, interval: 30 }
        ],
        preparationTime: 65,
        bonus: 5000,
        tier: 'apocalypse',
        final: true
    }
];


// ============================================
// AUDIO MANAGER - ENHANCED
// ============================================
class AudioManager {
    constructor() {
        this.masterVolume = 0.5;
        this.isMuted = false;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.5;
        this.isPlaying = true;
        
        // Background music tracks with display names
        this.musicTracks = [
            { file: 'Assets/Audio/night_bastion.wav', name: 'Night Bastion' }
        ];
        this.currentTrackIndex = 0;
        this.musicAudio = null;
        
        // Sound effects
        this.sounds = {};
        
        // Auto-switch by wave
        this.autoSwitchEnabled = true;
        
        this.init();
    }
    
    init() {
        // Create music audio element
        this.musicAudio = new Audio();
        this.musicAudio.loop = false;
        this.musicAudio.volume = this.isMuted ? 0 : this.masterVolume * this.musicVolume;
        
        // Preload sound effects (we'll use Web Audio API for better control)
        this.audioContext = null;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported, falling back to HTML5 Audio');
        }
        
        // When a track ends, automatically play the next one
        this.musicAudio.addEventListener('ended', () => {
            this.nextTrack();
        });
        
        // Start playing first track
        this.playMusic(0);
    }
    
    playMusic(trackIndex) {
        if (trackIndex !== undefined) {
            this.currentTrackIndex = trackIndex;
        }
        
        const track = this.musicTracks[this.currentTrackIndex];
        if (track && this.musicAudio) {
            this.musicAudio.src = track.file;
            this.updateTrackDisplay();
            if (!this.isMuted && this.isPlaying) {
                this.musicAudio.play().catch(e => console.log('Audio play failed:', e));
            }
        }
    }
    
    nextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.musicTracks.length;
        this.playMusic();
    }
    
    previousTrack() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.musicTracks.length) % this.musicTracks.length;
        this.playMusic();
    }
    
    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            if (!this.isMuted) {
                this.musicAudio.play().catch(e => console.log('Audio play failed:', e));
            }
        } else {
            this.musicAudio.pause();
        }
        this.updatePlayPauseButton();
        return this.isPlaying;
    }
    
    // Set music volume separately
    setMusicVolume(value) {
        this.musicVolume = value / 100;
        this.updateVolume();
        
        // Update UI
        const label = document.getElementById('musicVolLabel');
        if (label) {
            label.textContent = Math.round(value) + '%';
        }
        
        // Save to localStorage
        localStorage.setItem('gameMusicVolume', value);
    }
    
    // Set SFX volume separately
    setSFXVolume(value) {
        this.sfxVolume = value / 100;
        
        // Update UI
        const label = document.getElementById('sfxVolLabel');
        if (label) {
            label.textContent = Math.round(value) + '%';
        }
        
        // Save to localStorage
        localStorage.setItem('gameSFXVolume', value);
    }
    
    updateVolume() {
        if (this.musicAudio) {
            this.musicAudio.volume = this.isMuted ? 0 : this.masterVolume * this.musicVolume;
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateVolume();
        
        if (this.isMuted) {
            if (this.musicAudio) this.musicAudio.pause();
        } else {
            if (this.isPlaying && this.musicAudio) {
                this.musicAudio.play().catch(e => console.log('Audio play failed:', e));
            }
        }
        
        // Update button
        const btn = document.getElementById('muteAllBtn');
        if (btn) {
            btn.textContent = this.isMuted ? '🔇 Unmute' : '🔊 Mute All';
        }
        
        // Save to localStorage
        localStorage.setItem('gameMuted', this.isMuted);
        
        return this.isMuted;
    }
    
    // Update track display in UI
    updateTrackDisplay() {
        const trackNameEl = document.getElementById('currentTrackName');
        if (trackNameEl) {
            const track = this.musicTracks[this.currentTrackIndex];
            trackNameEl.textContent = track ? track.name : 'No Track';
        }
    }
    
    // Update play/pause button
    updatePlayPauseButton() {
        const btn = document.getElementById('playPauseBtn');
        if (btn) {
            btn.textContent = this.isPlaying ? '⏸️' : '▶️';
        }
    }
    
    // Update track based on current wave (auto-switch)
    updateTrackByWave(wave) {
        if (!this.autoSwitchEnabled) return;
        
        let targetTrack;
        if (wave <= 10) targetTrack = 0;
        else if (wave <= 20) targetTrack = 1;
        else targetTrack = 2;
        
        // Only switch if we're not currently playing (avoids interrupting current track)
        if (targetTrack !== this.currentTrackIndex && this.musicAudio.paused) {
            this.playMusic(targetTrack);
        }
    }
    
    // Play sound effect
    playSFX(type) {
        if (this.isMuted || !this.audioContext) return;
        
        // Create oscillator for simple sound effects
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Use separate SFX volume
        const volumeMultiplier = this.masterVolume * this.sfxVolume;
        
        switch (type) {
            case 'shoot':
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.1 * volumeMultiplier, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;
            case 'hit':
                oscillator.frequency.value = 200;
                gainNode.gain.setValueAtTime(0.15 * volumeMultiplier, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.15);
                break;
            case 'explosion':
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 100;
                gainNode.gain.setValueAtTime(0.2 * volumeMultiplier, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;
            case 'gold':
                oscillator.frequency.value = 1200;
                gainNode.gain.setValueAtTime(0.08 * volumeMultiplier, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;
            case 'waveStart':
                oscillator.frequency.value = 600;
                gainNode.gain.setValueAtTime(0.12 * volumeMultiplier, this.audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(900, this.audioContext.currentTime + 0.3);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.5);
                break;
            case 'upgrade':
                oscillator.frequency.value = 1000;
                gainNode.gain.setValueAtTime(0.1 * volumeMultiplier, this.audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(1500, this.audioContext.currentTime + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;
            case 'build':
                oscillator.frequency.value = 400;
                gainNode.gain.setValueAtTime(0.1 * volumeMultiplier, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.15);
                break;
            case 'gameOver':
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 300;
                gainNode.gain.setValueAtTime(0.2 * volumeMultiplier, this.audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.5);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 1.5);
                break;
            case 'victory':
                oscillator.frequency.value = 523.25; // C5
                gainNode.gain.setValueAtTime(0.15 * volumeMultiplier, this.audioContext.currentTime);
                oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime);
                oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
                oscillator.frequency.setValueAtTime(1046.50, this.audioContext.currentTime + 0.3); // C6
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 1);
                break;
            case 'elementUnlock':
                oscillator.frequency.value = 880; // A5
                gainNode.gain.setValueAtTime(0.15 * volumeMultiplier, this.audioContext.currentTime);
                oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1760, this.audioContext.currentTime + 0.3);
                oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.6);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.8);
                break;
        }
    }
    
    // Load saved settings
    loadSettings() {
        // Load separate volumes
        const savedMusicVolume = localStorage.getItem('gameMusicVolume');
        const savedSFXVolume = localStorage.getItem('gameSFXVolume');
        const savedMuted = localStorage.getItem('gameMuted');
        
        if (savedMusicVolume !== null) {
            this.setMusicVolume(parseFloat(savedMusicVolume));
            const slider = document.getElementById('musicVolume');
            if (slider) slider.value = savedMusicVolume;
        }
        
        if (savedSFXVolume !== null) {
            this.setSFXVolume(parseFloat(savedSFXVolume));
            const slider = document.getElementById('sfxVolume');
            if (slider) slider.value = savedSFXVolume;
        }
        
        if (savedMuted === 'true') {
            this.isMuted = false; // Will be toggled to true
            this.toggleMute();
        }
        
        // Initialize display
        this.updateTrackDisplay();
        this.updatePlayPauseButton();
    }
}

// Global audio manager instance
let audioManager;

// Audio control functions
function updateMusicVolume(value) {
    if (audioManager) {
        audioManager.setMusicVolume(value);
    }
}

function updateSFXVolume(value) {
    if (audioManager) {
        audioManager.setSFXVolume(value);
    }
}

function toggleMute() {
    if (audioManager) {
        return audioManager.toggleMute();
    }
}

function nextTrack() {
    if (audioManager) {
        audioManager.nextTrack();
    }
}

function previousTrack() {
    if (audioManager) {
        audioManager.previousTrack();
    }
}

function togglePlayPause() {
    if (audioManager) {
        return audioManager.togglePlayPause();
    }
}

// ============================================
// ELEMENT SYSTEM
// ============================================

const ELEMENTS = {
    FIRE: {
        id: 'fire',
        name: 'Fire',
        icon: '🔥',
        color: '#ff6b35',
        description: 'Harness the power of flames for burning damage',
        theme: 'Offensive - Burn damage over time'
    },
    ICE: {
        id: 'ice',
        name: 'Ice',
        icon: '❄️',
        color: '#74b9ff',
        description: 'Freeze your enemies and control the battlefield',
        theme: 'Control - Slow and freeze effects'
    },
    LIGHTNING: {
        id: 'lightning',
        name: 'Lightning',
        icon: '⚡',
        color: '#ffeaa7',
        description: 'Strike with thunderous speed and chain damage',
        theme: 'Speed - Chain damage and stuns'
    },
    NATURE: {
        id: 'nature',
        name: 'Nature',
        icon: '🌿',
        color: '#55efc4',
        description: 'Use poison and natural forces for sustained damage',
        theme: 'Sustain - Poison and regeneration'
    },
    SHADOW: {
        id: 'shadow',
        name: 'Shadow',
        icon: '🌑',
        color: '#a29bfe',
        description: 'Drain life and curse enemies with dark magic',
        theme: 'Corruption - Life drain and debuffs'
    }
};

// Elemental upgrade branches for each tower
const ELEMENTAL_BRANCHES = {
    ARCHER: {
        fire: {
            name: 'Pyromancer',
            upgrades: [
                { cost: 0, fireDamage: 5, burnDuration: 3, description: '🔥 Level 1: Burning Arrows (+5 fire dmg, 3s burn)' },
                { cost: 100, fireDamage: 10, explosionRadius: 40, description: '🔥 Level 2: Flame Burst (explosive arrows)' },
                { cost: 250, spreadBurn: true, fireDamage: 15, description: '🔥 Level 3: Inferno (burn spreads to nearby)' },
                { cost: 500, trail: true, fireDamage: 25, description: '🔥 Level 4: Phoenix Strike (fire trails, massive burn)' }
            ]
        },
        ice: {
            name: 'Cryomancer',
            upgrades: [
                { cost: 0, slow: 0.25, slowDuration: 2, description: '❄️ Level 1: Frost Arrows (25% slow)' },
                { cost: 100, freezeChance: 0.15, freezeDuration: 1, description: '❄️ Level 2: Freezing Shot (15% freeze chance)' },
                { cost: 250, shatter: true, bonusVsFrozen: 2.0, description: '❄️ Level 3: Shatter (2x dmg vs frozen)' },
                { cost: 500, blizzard: true, description: '❄️ Level 4: Blizzard (area freeze on crit)' }
            ]
        },
        lightning: {
            name: 'Storm Archer',
            upgrades: [
                { cost: 0, chainDamage: 8, chainTargets: 2, description: '⚡ Level 1: Charged Arrows (chain to 2 targets)' },
                { cost: 100, stunChance: 0.2, stunDuration: 1, description: '⚡ Level 2: Thunder Shot (20% stun chance)' },
                { cost: 250, attackSpeed: 0.5, description: '⚡ Level 3: Rapid Thunder (+50% attack speed)' },
                { cost: 500, storm: true, description: '⚡ Level 4: Lightning Storm (arrows call lightning)' }
            ]
        },
        nature: {
            name: 'Ranger',
            upgrades: [
                { cost: 0, poison: 15, poisonDuration: 4, description: '🌿 Level 1: Poison Arrows (15 dmg/s, 4s)' },
                { cost: 100, healOnKill: 5, description: '🌿 Level 2: Life Sap (+5 health on kill)' },
                { cost: 250, thorns: true, thornDamage: 10, description: '🌿 Level 3: Thorns (reflect damage when hit)' },
                { cost: 500, forestBlessing: true, description: '🌿 Level 4: Forest Blessing (all towers regenerate)' }
            ]
        },
        shadow: {
            name: 'Dark Archer',
            upgrades: [
                { cost: 0, lifeSteal: 0.1, description: '🌑 Level 1: Life Drain (10% lifesteal)' },
                { cost: 100, curse: true, curseDamage: 0.2, description: '🌑 Level 2: Cursed Arrows (enemies take 20% more dmg)' },
                { cost: 250, fear: true, fearDuration: 2, description: '🌑 Level 3: Fear Shot (enemies flee briefly)' },
                { cost: 500, shadowForm: true, description: '🌑 Level 4: Shadow Form (invisible, always crits)' }
            ]
        }
    },
    CRYSTAL: {
        fire: {
            name: 'Magma Crystal',
            upgrades: [
                { cost: 0, fireDamage: 12, lavaPool: true, description: '🔥 Level 1: Fire Crystal (lava pools on ground)' },
                { cost: 120, meteor: true, meteorDamage: 100, description: '🔥 Level 2: Meteor Strike (falling meteors)' },
                { cost: 280, infernoZone: true, description: '🔥 Level 3: Inferno Zone (persistent fire area)' },
                { cost: 550, volcano: true, description: '🔥 Level 4: Volcano Eruption (massive AoE damage)' }
            ]
        },
        ice: {
            name: 'Glacier Crystal',
            upgrades: [
                { cost: 0, slow: 0.4, slowDuration: 3, description: '❄️ Level 1: Frozen Aura (40% slow)' },
                { cost: 120, freezeChance: 0.25, freezeDuration: 1, description: '❄️ Level 2: Deep Freeze (25% freeze chance)' },
                { cost: 280, iceArmor: true, description: '❄️ Level 3: Ice Armor (nearby towers take less dmg)' },
                { cost: 550, absoluteZero: true, description: '❄️ Level 4: Absolute Zero (freeze all enemies briefly)' }
            ]
        },
        lightning: {
            name: 'Storm Crystal',
            upgrades: [
                { cost: 0, chain: 4, chainDamage: 15, description: '⚡ Level 1: Arc Crystal (chain to 4 targets)' },
                { cost: 120, stunChance: 0.3, stunDuration: 1.5, description: '⚡ Level 2: Stun Field (30% stun chance)' },
                { cost: 280, overload: true, description: '⚡ Level 3: Overload (crits deal chain lightning)' },
                { cost: 550, tempest: true, description: '⚡ Level 4: Tempest (constant lightning strikes)' }
            ]
        },
        nature: {
            name: 'Nature Crystal',
            upgrades: [
                { cost: 0, poison: 20, poisonDuration: 5, description: '🌿 Level 1: Toxic Crystal (20 dmg/s poison)' },
                { cost: 120, growth: true, healAmount: 2, description: '🌿 Level 2: Growth Aura (towers heal over time)' },
                { cost: 280, entangle: true, description: '🌿 Level 3: Entangle (root enemies in place)' },
                { cost: 550, motherNature: true, description: '🌿 Level 4: Mother Nature (spawn healing vines)' }
            ]
        },
        shadow: {
            name: 'Void Crystal',
            upgrades: [
                { cost: 0, lifeSteal: 0.15, description: '🌑 Level 1: Void Drain (15% lifesteal)' },
                { cost: 120, voidZone: true, description: '🌑 Level 2: Void Zone (enemies are slowed)' },
                { cost: 280, consume: true, description: '🌑 Level 3: Consume (enemies may be instantly killed)' },
                { cost: 550, blackHole: true, description: '🌑 Level 4: Black Hole (suck enemies in and destroy)' }
            ]
        }
    },
    VAULT: {
        fire: {
            name: 'Dragon Hoard',
            upgrades: [
                { cost: 0, fireAura: true, damageBoost: 0.1, description: '🔥 Level 1: Dragon\'s Presence (+10% dmg to nearby)' },
                { cost: 150, goldToFire: true, description: '🔥 Level 2: Burning Gold (spend gold for fire dmg boost)' },
                { cost: 300, phoenixRevive: true, description: '🔥 Level 3: Phoenix Blessing (towers revive once)' },
                { cost: 600, dragonForm: true, description: '🔥 Level 4: Dragon Transformation (vault becomes attack tower)' }
            ]
        },
        ice: {
            name: 'Frozen Treasury',
            upgrades: [
                { cost: 0, interestBoost: 0.05, description: '❄️ Level 1: Frozen Assets (+5% interest)' },
                { cost: 150, freezeEconomy: true, description: '❄️ Level 2: Economic Freeze (pause enemy buffs)' },
                { cost: 300, coldStorage: true, description: '❄️ Level 3: Cold Storage (carry over gold to next wave)' },
                { cost: 600, wealthFreeze: true, description: '❄️ Level 4: Wealth Freeze (all enemies give 2x gold)' }
            ]
        },
        lightning: {
            name: 'Golden Generator',
            upgrades: [
                { cost: 0, incomeBoost: 2, description: '⚡ Level 1: Turbo Charge (+2 gold/3s)' },
                { cost: 150, speedBoost: true, description: '⚡ Level 2: Rapid Production (faster tower attacks)' },
                { cost: 300, surge: true, description: '⚡ Level 3: Power Surge (random tower gets huge boost)' },
                { cost: 600, infiniteEnergy: true, description: '⚡ Level 4: Infinite Energy (all towers attack 50% faster)' }
            ]
        },
        nature: {
            name: 'Verdant Vault',
            upgrades: [
                { cost: 0, growthIncome: 1, description: '🌿 Level 1: Natural Growth (+1 gold per wave)' },
                { cost: 150, harvest: true, description: '🌿 Level 2: Harvest Bonus (enemies drop bonus gold)' },
                { cost: 300, regrowth: true, description: '🌿 Level 3: Regrowth (refund 100% when selling)' },
                { cost: 600, abundance: true, description: '🌿 Level 4: Abundance (all income doubled)' }
            ]
        },
        shadow: {
            name: 'Cursed Coffers',
            upgrades: [
                { cost: 0, steal: 1, description: '🌑 Level 1: Shadow Theft (steal 1 gold per enemy death)' },
                { cost: 150, curseGold: true, description: '🌑 Level 2: Cursed Wealth (enemies have less health)' },
                { cost: 300, sacrifice: true, description: '🌑 Level 3: Sacrifice (destroy tower for massive gold boost)' },
                { cost: 600, darkRitual: true, description: '🌑 Level 4: Dark Ritual (all damage becomes lifesteal for gold)' }
            ]
        }
    }
};

// Elemental synergies (combinations of 2+ elements)
const ELEMENTAL_SYNERGIES = [
    {
        elements: ['fire', 'ice'],
        name: 'Steam',
        icon: '💨',
        description: '🔥+❄️ Burning enemies hit by ice take 2x damage',
        color: '#dfe6e9'
    },
    {
        elements: ['lightning', 'nature'],
        name: 'Storm',
        icon: '🌩️',
        description: '⚡+🌿 Poisoned enemies chain lightning +2 targets',
        color: '#74b9ff'
    },
    {
        elements: ['shadow', 'fire'],
        name: 'Hellfire',
        icon: '🔥',
        description: '🌑+🔥 Life drain also applies burning',
        color: '#ff6b35'
    },
    {
        elements: ['ice', 'lightning'],
        name: 'Thunderfrost',
        icon: '⚡',
        description: '❄️+⚡ Frozen enemies release lightning on thaw',
        color: '#ffeaa7'
    },
    {
        elements: ['nature', 'shadow'],
        name: 'Decay',
        icon: '☠️',
        description: '🌿+🌑 Poison reduces enemy damage by 25%',
        color: '#636e72'
    },
    {
        elements: ['fire', 'lightning'],
        name: 'Plasma',
        icon: '☄️',
        description: '🔥+⚡ Burn damage chains to nearby enemies',
        color: '#fd79a8'
    },
    {
        elements: ['ice', 'nature'],
        name: 'Permafrost',
        icon: '🧊',
        description: '❄️+🌿 Frozen enemies spawn healing plants on death',
        color: '#00b894'
    },
    {
        elements: ['shadow', 'lightning'],
        name: 'Void Storm',
        icon: '🌌',
        description: '🌑+⚡ Stunned enemies take double damage from all sources',
        color: '#6c5ce7'
    },
    {
        elements: ['fire', 'nature'],
        name: 'Wildfire',
        icon: '🔥',
        description: '🔥+🌿 Burn spreads faster and heals you for damage dealt',
        color: '#e17055'
    },
    {
        elements: ['ice', 'shadow'],
        name: 'Soul Freeze',
        icon: '💀',
        description: '❄️+🌑 Killing frozen enemies gives +10 gold',
        color: '#b2bec3'
    }
];

class ElementManager {
    constructor() {
        this.unlockedElements = [];
        this.elementalLevels = {};
        this.milestoneWaves = [5, 10, 15, 20, 25];
        this.nextMilestoneIndex = 0;
        this.isSelecting = false;
        this.selectionTimer = null;
        this.bossRushUnlocked = false;
    }
    
    checkMilestone(wave) {
        if (this.nextMilestoneIndex >= this.milestoneWaves.length) return false;
        
        if (wave === this.milestoneWaves[this.nextMilestoneIndex]) {
            this.showElementSelection(wave);
            this.nextMilestoneIndex++;
            return true;
        }
        return false;
    }
    
    showElementSelection(wave) {
        this.isSelecting = true;
        gameState.isPaused = true;
        
        // Get available elements
        const availableElements = Object.keys(ELEMENTS)
            .filter(key => !this.unlockedElements.includes(ELEMENTS[key].id));
        
        if (availableElements.length === 0) {
            this.isSelecting = false;
            gameState.isPaused = false;
            return;
        }
        
        // Select 3 random elements
        const choices = this.getRandomElements(availableElements, Math.min(3, availableElements.length));
        
        // Update modal
        document.getElementById('elementWaveNumber').textContent = wave;
        
        // Generate cards
        const container = document.getElementById('elementCardsContainer');
        container.innerHTML = '';
        
        choices.forEach(elementKey => {
            const element = ELEMENTS[elementKey];
            const card = document.createElement('div');
            card.className = `element-card ${element.id}`;
            card.innerHTML = `
                <div class="icon">${element.icon}</div>
                <div class="name" style="color: ${element.color}">${element.name}</div>
                <div class="theme">${element.theme}</div>
                <div class="description">${element.description}</div>
                <div class="preview">Preview: ${this.getFirstUpgradePreview(element.id)}</div>
            `;
            card.onclick = () => this.selectElement(element.id);
            container.appendChild(card);
        });
        
        // Show modal
        document.getElementById('elementSelectionModal').classList.add('active');
        
        // Start timer
        let timeLeft = 30;
        const timerEl = document.getElementById('elementTimer');
        timerEl.textContent = timeLeft;
        
        this.selectionTimer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(this.selectionTimer);
                // Auto-select random element
                const randomElement = choices[Math.floor(Math.random() * choices.length)];
                this.selectElement(ELEMENTS[randomElement].id);
            }
        }, 1000);
    }
    
    getRandomElements(available, count) {
        const shuffled = [...available].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    getFirstUpgradePreview(elementId) {
        // Show preview from Archer tower as example
        const branch = ELEMENTAL_BRANCHES.ARCHER[elementId];
        if (branch && branch.upgrades[0]) {
            return branch.upgrades[0].description.split(':')[1] || 'Powerful new abilities';
        }
        return 'Unique elemental powers';
    }
    
    selectElement(elementId) {
        clearInterval(this.selectionTimer);
        
        if (this.unlockedElements.includes(elementId)) return;
        
        this.unlockedElements.push(elementId);
        this.elementalLevels[elementId] = 1;
        
        // Play sound
        if (audioManager) audioManager.playSFX('elementUnlock');
        
        // Update UI
        this.updateElementDisplay();
        this.updateSynergies();
        this.updateNextElementInfo();
        
        // Close modal
        document.getElementById('elementSelectionModal').classList.remove('active');
        gameState.isPaused = false;
        this.isSelecting = false;
        
        // Visual feedback
        createFloatingText(400, 240, `Element Unlocked: ${ELEMENTS[elementId.toUpperCase()].icon} ${ELEMENTS[elementId.toUpperCase()].name}`, ELEMENTS[elementId.toUpperCase()].color);
    }
    
    updateElementDisplay() {
        // Update element icons in sidebar
        this.unlockedElements.forEach(elementId => {
            const wrapperEl = document.getElementById(`wrapper-${elementId}`);
            const iconEl = document.getElementById(`element-${elementId}`);
            if (wrapperEl) {
                wrapperEl.style.display = 'flex';
            }
            if (iconEl) {
                iconEl.classList.add('unlocked');
            }
        });
    }
    
    updateNextElementInfo() {
        const infoEl = document.getElementById('nextElementInfo');
        if (this.nextMilestoneIndex < this.milestoneWaves.length) {
            infoEl.textContent = `Next element at wave ${this.milestoneWaves[this.nextMilestoneIndex]}`;
        } else {
            infoEl.textContent = 'All elements unlocked!';
        }
    }
    
    updateSynergies() {
        const container = document.getElementById('activeSynergies');
        container.innerHTML = '';
        
        const activeSynergies = this.getActiveSynergies();
        activeSynergies.forEach(synergy => {
            const div = document.createElement('div');
            div.className = 'synergy-item';
            div.innerHTML = `<strong>${synergy.icon} ${synergy.name}</strong><br><small>${synergy.description}</small>`;
            container.appendChild(div);
        });
    }
    
    getActiveSynergies() {
        return ELEMENTAL_SYNERGIES.filter(synergy => 
            synergy.elements.every(el => this.unlockedElements.includes(el))
        );
    }
    
    canUpgradeElemental(tower, elementId) {
        const currentLevel = this.elementalLevels[elementId] || 0;
        if (currentLevel >= 4) return false;
        
        const towerType = tower.typeKey;
        const branch = ELEMENTAL_BRANCHES[towerType][elementId];
        return !!branch;
    }
    
    upgradeElemental(tower, elementId) {
        const currentLevel = this.elementalLevels[elementId] || 0;
        if (currentLevel >= 4) return false;
        
        const towerType = tower.typeKey;
        const branch = ELEMENTAL_BRANCHES[towerType][elementId];
        if (!branch) return false;
        
        const upgrade = branch.upgrades[currentLevel];
        
        // Level 1 is free, others cost gold
        if (currentLevel > 0 && gameState.gold < upgrade.cost) return false;
        
        if (currentLevel > 0) {
            gameState.gold -= upgrade.cost;
        }
        
        // Apply upgrade effects
        tower.applyElementalUpgrade(upgrade, elementId);
        this.elementalLevels[elementId] = currentLevel + 1;
        
        // Visual feedback
        const element = ELEMENTS[elementId.toUpperCase()];
        createFloatingText(tower.position.x, tower.position.y - 30, 
            `${element.icon} Elemental Level ${currentLevel + 1}!`, element.color);
        
        return true;
    }
    
    unlockBossRush() {
        this.bossRushUnlocked = true;
        document.getElementById('bossRushUnlock').style.display = 'block';
        document.getElementById('bossRushBtn').style.display = 'inline-block';
    }
}

// Global element manager instance
let elementManager;

// ============================================
// BOSS RUSH MODE
// ============================================

class BossRushMode {
    constructor() {
        this.bossQueue = [
            { type: 'WARLORD', wave: 10 },
            { type: 'WARLORD', wave: 15 },
            { type: 'NECROMANCER', wave: 20 },
            { type: 'BEHEMOTH', wave: 25 },
            { type: 'NECROMANCER', wave: 25 },
            { type: 'WARLORD', wave: 30 },
            { type: 'BEHEMOTH', wave: 30 },
            { type: 'BEHEMOTH', wave: 30 }
        ];
        this.currentBossIndex = 0;
        this.isActive = false;
        this.originalGold = 200;
        this.originalLives = 25;
    }
    
    start() {
        if (!elementManager || !elementManager.bossRushUnlocked) {
            alert('Complete wave 30 to unlock Boss Rush mode!');
            return;
        }
        
        this.isActive = true;
        this.currentBossIndex = 0;
        
        // Save original values
        this.originalGold = gameState.gold;
        this.originalLives = gameState.lives;
        
        // Set boss rush conditions
        gameState.gold = 1500;
        gameState.lives = 1; // One life only!
        gameState.wave = 0;
        gameState.isGameOver = false;
        gameState.isVictory = false;
        
        // Clear existing enemies
        gameState.enemies = [];
        
        // Hide victory screen if visible
        document.getElementById('victoryScreen').classList.remove('active');
        
        // Spawn first boss
        this.spawnNextBoss();
        
        createFloatingText(400, 240, '👹 BOSS RUSH STARTED!', '#e74c3c');
    }
    
    spawnNextBoss() {
        if (this.currentBossIndex >= this.bossQueue.length) {
            this.complete();
            return;
        }
        
        const bossData = this.bossQueue[this.currentBossIndex];
        const boss = new Enemy(bossData.type, bossData.wave);
        gameState.enemies.push(boss);
        
        this.currentBossIndex++;
        
        // Show boss number
        createFloatingText(400, 200, `Boss ${this.currentBossIndex}/${this.bossQueue.length}`, '#e74c3c');
    }
    
    checkBossDeath() {
        if (!this.isActive) return;
        
        // Check if all enemies (bosses) are dead
        const aliveEnemies = gameState.enemies.filter(e => !e.isDead && !e.reachedExit).length;
        
        if (aliveEnemies === 0) {
            // Small delay before next boss
            setTimeout(() => this.spawnNextBoss(), 2000);
        }
    }
    
    complete() {
        this.isActive = false;
        
        // Show special victory
        const victoryScreen = document.getElementById('victoryScreen');
        victoryScreen.innerHTML = `
            <div class="end-screen-content">
                <h2>👹 BOSS RUSH CONQUERED! 👹</h2>
                <p>You defeated all ${this.bossQueue.length} bosses!</p>
                <p class="special-reward">🏆 LEGENDARY DEFENDER</p>
                <p style="color: #ffd700; margin: 15px 0;">You are a true master of tower defense!</p>
                <button class="restart-btn" onclick="restartGame()">🔄 Play Again</button>
            </div>
        `;
        victoryScreen.classList.add('active');
    }
    
    reset() {
        this.isActive = false;
        this.currentBossIndex = 0;
    }
}

// Global boss rush instance
let bossRushMode;

// Boss rush start function
function startBossRush() {
    if (!bossRushMode) {
        bossRushMode = new BossRushMode();
    }
    bossRushMode.start();
}

// ============================================
// GAME STATE
// ============================================
const gameState = {
    gold: 200,
    lives: 25,
    wave: 0,
    maxWaves: 30,
    isPaused: false,
    gameSpeed: 1,
    isGameOver: false,
    isVictory: false,
    selectedTowerType: null,
    selectedTower: null,
    enemies: [],
    towers: [],
    projectiles: [],
    particles: [],
    waveActive: false,
    preparationTime: 0,
    lastFrameTime: 0,
    vaultCount: 0
};

// ============================================
// GRID AND PATHFINDING
// ============================================
class Grid {
    constructor() {
        this.cells = [];
        this.path = [];
        this.spawnPoint = { x: 0, y: 6 };
        this.exitPoint = { x: 19, y: 6 };
        this.decorations = []; // Static decorations that don't flicker
        this.initialize();
    }
    
    initialize() {
        // Initialize grid cells
        for (let x = 0; x < GRID_WIDTH; x++) {
            this.cells[x] = [];
            for (let y = 0; y < GRID_HEIGHT; y++) {
                this.cells[x][y] = {
                    x, y,
                    walkable: true,
                    hasTower: false,
                    isPath: false,
                    g: 0,
                    h: 0,
                    f: 0,
                    parent: null,
                    grassColor: null // Will be set during decoration generation
                };
            }
        }
        
        // Create zigzag path
        this.createZigzagPath();
        
        // Generate static decorations (only once!)
        this.generateDecorations();
        
        this.calculatePath();
    }
    
    generateDecorations() {
        this.decorations = [];
        
        for (let x = 0; x < GRID_WIDTH; x++) {
            for (let y = 0; y < GRID_HEIGHT; y++) {
                const cell = this.cells[x][y];
                
                if (!cell.isPath && !cell.hasTower) {
                    // Generate static grass color
                    const green = 50 + Math.random() * 20;
                    cell.grassColor = `rgb(${20 + Math.random() * 10}, ${green + 30}, ${20 + Math.random() * 10})`;
                    
                    const px = x * CELL_SIZE + CELL_SIZE / 2;
                    const py = y * CELL_SIZE + CELL_SIZE / 2;
                    
                    // Occasionally add grass tuft (15% chance)
                    if (Math.random() < 0.15) {
                        this.decorations.push({
                            type: 'grass',
                            x: px,
                            y: py
                        });
                    }
                    
                    // Occasionally add small rock (3% chance)
                    if (Math.random() < 0.03) {
                        this.decorations.push({
                            type: 'rock',
                            x: px + (Math.random() - 0.5) * 20,
                            y: py + (Math.random() - 0.5) * 20,
                            size: 4 + Math.random() * 3
                        });
                    }
                    
                    // Occasionally add tree (8% chance)
                    if (Math.random() < 0.08) {
                        this.decorations.push({
                            type: 'tree',
                            x: px,
                            y: py,
                            scale: 0.6 + Math.random() * 0.4
                        });
                    }
                }
            }
        }
    }
    
    createZigzagPath() {
        // Define complex zigzag path with more vertical movement
        const pathPoints = [
            {x: 0, y: 10},   // Start (bottom left)
            {x: 2, y: 10},
            {x: 2, y: 2},    // Up to top
            {x: 5, y: 2},    // Right
            {x: 5, y: 9},    // Down
            {x: 8, y: 9},    // Right
            {x: 8, y: 2},    // Up
            {x: 11, y: 2},   // Right
            {x: 11, y: 9},   // Down
            {x: 14, y: 9},   // Right
            {x: 14, y: 2},   // Up
            {x: 17, y: 2},   // Right
            {x: 17, y: 10},  // Down to bottom
            {x: 19, y: 10},  // Exit (bottom right)
        ];
        
        // Mark path cells
        for (let i = 0; i < pathPoints.length - 1; i++) {
            const start = pathPoints[i];
            const end = pathPoints[i + 1];
            
            // Horizontal segment
            if (start.y === end.y) {
                const minX = Math.min(start.x, end.x);
                const maxX = Math.max(start.x, end.x);
                for (let x = minX; x <= maxX; x++) {
                    this.cells[x][start.y].isPath = true;
                }
            }
            // Vertical segment
            else if (start.x === end.x) {
                const minY = Math.min(start.y, end.y);
                const maxY = Math.max(start.y, end.y);
                for (let y = minY; y <= maxY; y++) {
                    this.cells[start.x][y].isPath = true;
                }
            }
        }
        
        // Update spawn and exit points
        this.spawnPoint = pathPoints[0];
        this.exitPoint = pathPoints[pathPoints.length - 1];
    }
    
    isValid(x, y) {
        return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
    }
    
    isWalkable(x, y) {
        return this.isValid(x, y) && this.cells[x][y].walkable && !this.cells[x][y].hasTower;
    }
    
    canBuild(x, y) {
        return this.isValid(x, y) && !this.cells[x][y].hasTower && !this.cells[x][y].isPath;
    }
    
    placeTower(x, y) {
        if (this.canBuild(x, y)) {
            this.cells[x][y].hasTower = true;
            return true;
        }
        return false;
    }
    
    removeTower(x, y) {
        if (this.isValid(x, y)) {
            this.cells[x][y].hasTower = false;
            return true;
        }
        return false;
    }
    
    worldToGrid(worldX, worldY) {
        return {
            x: Math.floor(worldX / CELL_SIZE),
            y: Math.floor(worldY / CELL_SIZE)
        };
    }
    
    gridToWorld(gridX, gridY) {
        return {
            x: gridX * CELL_SIZE + CELL_SIZE / 2,
            y: gridY * CELL_SIZE + CELL_SIZE / 2
        };
    }
    
    calculatePath() {
        // Use predefined zigzag path instead of A*
        this.path = this.getPredefinedPath();
        return this.path.length > 0;
    }
    
    getPredefinedPath() {
        // Define the zigzag path points (same as createZigzagPath)
        const pathPoints = [
            {x: 0, y: 10},   // Start (bottom left)
            {x: 2, y: 10},
            {x: 2, y: 2},    // Up to top
            {x: 5, y: 2},    // Right
            {x: 5, y: 9},    // Down
            {x: 8, y: 9},    // Right
            {x: 8, y: 2},    // Up
            {x: 11, y: 2},   // Right
            {x: 11, y: 9},   // Down
            {x: 14, y: 9},   // Right
            {x: 14, y: 2},   // Up
            {x: 17, y: 2},   // Right
            {x: 17, y: 10},  // Down to bottom
            {x: 19, y: 10},  // Exit (bottom right)
        ];
        
        // Convert grid points to world coordinates with smooth interpolation
        const worldPath = [];
        
        for (let i = 0; i < pathPoints.length - 1; i++) {
            const start = pathPoints[i];
            const end = pathPoints[i + 1];
            
            const startWorld = this.gridToWorld(start.x, start.y);
            const endWorld = this.gridToWorld(end.x, end.y);
            
            // Add start point
            worldPath.push(startWorld);
            
            // Add intermediate points for smoother movement (every 20 pixels)
            const dist = Math.hypot(endWorld.x - startWorld.x, endWorld.y - startWorld.y);
            const steps = Math.floor(dist / 20);
            
            for (let j = 1; j < steps; j++) {
                const t = j / steps;
                worldPath.push({
                    x: startWorld.x + (endWorld.x - startWorld.x) * t,
                    y: startWorld.y + (endWorld.y - startWorld.y) * t
                });
            }
        }
        
        // Add final point
        const lastPoint = pathPoints[pathPoints.length - 1];
        worldPath.push(this.gridToWorld(lastPoint.x, lastPoint.y));
        
        return worldPath;
    }
    
    getNeighbors(cell) {
        const neighbors = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        for (const [dx, dy] of directions) {
            const nx = cell.x + dx;
            const ny = cell.y + dy;
            
            if (this.isWalkable(nx, ny)) {
                neighbors.push(this.cells[nx][ny]);
            }
        }
        
        return neighbors;
    }
    
    reconstructPath(endCell) {
        const path = [];
        let current = endCell;
        
        while (current !== null) {
            path.unshift(this.gridToWorld(current.x, current.y));
            current = current.parent;
        }
        
        return path;
    }
    
    getPathForEnemy(isFlying) {
        if (isFlying) {
            // Flying enemies go straight to exit
            const start = this.gridToWorld(this.spawnPoint.x, this.spawnPoint.y);
            const end = this.gridToWorld(this.exitPoint.x, this.exitPoint.y);
            return [start, end];
        }
        return this.path;
    }
}


// ============================================
// ENEMY CLASS
// ============================================
class Enemy {
    constructor(type, wave) {
        this.type = ENEMY_TYPES[type];
        this.wave = wave;
        
        // Scale stats by wave
        this.maxHealth = this.type.health * Math.pow(1.15, wave);
        this.health = this.maxHealth;
        this.speed = this.type.speed * (1 + wave * 0.02);
        this.baseSpeed = this.speed;
        
        this.position = { x: 0, y: 0 };
        this.pathIndex = 0;
        this.isDead = false;
        this.reachedExit = false;
        
        // Unique id for animations
        this.id = Math.random();
        
        // Status effects
        this.slowMultiplier = 1;
        this.slowDuration = 0;
        this.isStunned = false;
        this.stunDuration = 0;
        this.poisonDamage = 0;
        this.poisonDuration = 0;
        this.armorModifier = 0;
        this.armorRedDuration = 0;
        this.isFrozen = false;
        this.freezeDuration = 0;
        this.burnDuration = 0;
        this.lightningDuration = 0;
        
        // Special abilities
        this.speedBoosted = false;
        this.shellActive = false;
        this.shellDuration = 0;
        this.nextShellThreshold = 0.75;
        
        // Boss abilities
        if (this.type.boss) {
            this.roarCooldown = 0;
            this.summonCooldown = 0;
        }
        
        // Set initial position
        const start = grid.gridToWorld(grid.spawnPoint.x, grid.spawnPoint.y);
        this.position = { ...start };
        
        // Get path
        this.path = grid.getPathForEnemy(this.type.flying);
    }
    
    update(deltaTime) {
        if (this.isDead || this.reachedExit) return;
        
        // Update status effects
        this.updateStatusEffects(deltaTime);
        
        // Boss abilities
        if (this.type.boss) {
            this.updateBossAbilities(deltaTime);
        }
        
        // Movement
        if (!this.isStunned && !this.isFrozen) {
            this.move(deltaTime);
        }
    }
    
    updateStatusEffects(deltaTime) {
        // Slow
        if (this.slowDuration > 0) {
            this.slowDuration -= deltaTime;
            if (this.slowDuration <= 0) {
                this.slowMultiplier = 1;
            }
        }
        
        // Stun
        if (this.stunDuration > 0) {
            this.stunDuration -= deltaTime;
            if (this.stunDuration <= 0) {
                this.isStunned = false;
            }
        }
        
        // Freeze
        if (this.freezeDuration > 0) {
            this.freezeDuration -= deltaTime;
            if (this.freezeDuration <= 0) {
                this.isFrozen = false;
            }
        }
        
        // Poison
        if (this.poisonDuration > 0) {
            this.poisonDuration -= deltaTime;
            // Poison slows enemies by 20%
            this.slowMultiplier = Math.min(this.slowMultiplier, 0.8);
            if (this.poisonDuration <= 0) {
                this.poisonDamage = 0;
            } else {
                // Apply poison damage every second
                if (Math.random() < deltaTime) {
                    this.takeDamage(this.poisonDamage, 'pure');
                }
            }
        }
        
        // Burn (fire damage over time)
        if (this.burnDuration > 0) {
            this.burnDuration -= deltaTime;
            // Apply burn damage every second (you can adjust the damage amount)
            if (Math.random() < deltaTime) {
                this.takeDamage(5, 'pure'); // 5 damage per second from burn
            }
        }
        
        // Lightning (electrocuted effect)
        if (this.lightningDuration > 0) {
            this.lightningDuration -= deltaTime;
        }
        
        // Armor reduction (from poison towers)
        if (this.armorRedDuration > 0) {
            this.armorRedDuration -= deltaTime;
            if (this.armorRedDuration <= 0) {
                this.armorModifier = 0;
            }
        }
        
        // Shell
        if (this.shellDuration > 0) {
            this.shellDuration -= deltaTime;
            if (this.shellDuration <= 0) {
                this.shellActive = false;
            }
        }
    }
    
    updateBossAbilities(deltaTime) {
        // Warlord abilities
        if (this.type.name === 'Warlord') {
            // Roar
            this.roarCooldown -= deltaTime;
            if (this.roarCooldown <= 0) {
                this.roar();
                this.roarCooldown = 30;
            }
            
            // Summon
            this.summonCooldown -= deltaTime;
            if (this.summonCooldown <= 0) {
                this.summon();
                this.summonCooldown = 15;
            }
            
            // Shell at health thresholds
            if (!this.shellActive && this.health / this.maxHealth <= this.nextShellThreshold) {
                this.activateShell();
                this.nextShellThreshold -= 0.25;
            }
        }
        
        // Necromancer abilities
        if (this.type.name === 'Necromancer') {
            this.necroSummonTimer = (this.necroSummonTimer || 0) - deltaTime;
            if (this.necroSummonTimer <= 0) {
                this.necroSummonTimer = this.type.summonRate || 4;
                this.summonSkeletons();
            }
        }
        
        // Behemoth abilities
        if (this.type.name === 'Behemoth') {
            this.earthquakeTimer = (this.earthquakeTimer || 0) - deltaTime;
            if (this.earthquakeTimer <= 0) {
                this.earthquakeTimer = 8;
                this.earthquake();
            }
            
            // Regenerate health
            if (this.health < this.maxHealth) {
                this.health = Math.min(this.maxHealth, this.health + this.maxHealth * 0.005 * deltaTime);
            }
        }
    }
    
    summonSkeletons() {
        const skeletonsToSpawn = Math.min(3, (this.type.maxSummons || 15) - (this.summonedCount || 0));
        for (let i = 0; i < skeletonsToSpawn; i++) {
            const skeleton = new Enemy('SKELETON', waveManager.currentWave);
            skeleton.position = {
                x: this.position.x + (Math.random() - 0.5) * 40,
                y: this.position.y + (Math.random() - 0.5) * 40
            };
            gameState.enemies.push(skeleton);
            this.summonedCount = (this.summonedCount || 0) + 1;
        }
        createFloatingText(this.position.x, this.position.y - 30, "RAISE DEAD!", '#b2bec3');
    }
    
    earthquake() {
        // Damage all towers in range
        for (const tower of gameState.towers) {
            const dist = Math.hypot(tower.position.x - this.position.x, tower.position.y - this.position.y);
            if (dist < 150) {
                createFloatingText(tower.position.x, tower.position.y - 20, "QUAKE!", '#e74c3c');
            }
        }
        createFloatingText(this.position.x, this.position.y - 30, "EARTHQUAKE!", '#8b4513');
    }
    
    move(deltaTime) {
        if (this.pathIndex >= this.path.length - 1) {
            this.reachedExit = true;
            this.onReachExit();
            return;
        }
        
        const target = this.path[this.pathIndex + 1];
        const dx = target.x - this.position.x;
        const dy = target.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            this.pathIndex++;
            return;
        }
        
        // Calculate actual speed with all modifiers
        let actualSpeed = this.speed * this.slowMultiplier;
        
        // Runner speed boost when damaged
        if (this.type.ability === 'speedBoost' && this.health / this.maxHealth <= 0.25 && !this.speedBoosted) {
            actualSpeed *= 1.7;
            this.speedBoosted = true;
        }
        
        // Move
        const moveDistance = actualSpeed * 60 * deltaTime;
        if (moveDistance >= distance) {
            this.position.x = target.x;
            this.position.y = target.y;
            this.pathIndex++;
        } else {
            this.position.x += (dx / distance) * moveDistance;
            this.position.y += (dy / distance) * moveDistance;
        }
    }
    
    takeDamage(damage, damageType) {
        if (this.isDead) return;
        
        // Shell blocks magic damage
        if (this.shellActive && damageType === 'magic') {
            return;
        }
        
        // Calculate damage with armor type
        const armorType = this.type.armor;
        let multiplier = DAMAGE_MULTIPLIERS[damageType][armorType] || 1.0;
        
        // Apply armor reduction from poison towers
        if (this.armorModifier > 0) {
            // Armor reduction makes enemies take more damage
            // For example, armorRed: 5 means 5% more damage per point
            multiplier *= (1 + this.armorModifier * 0.05);
        }
        
        const finalDamage = damage * multiplier;
        
        this.health -= finalDamage;
        
        // Visual feedback
        createDamageParticle(this.position.x, this.position.y, Math.floor(finalDamage));
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    applyStatusEffect(effect, value, duration) {
        switch (effect) {
            case 'slow':
                // Slow effects now stack from different sources
                // Add the slow value to current slow (1.0 - current multiplier = current slow %)
                const currentSlow = 1.0 - this.slowMultiplier;
                const newSlow = Math.min(currentSlow + value, 0.85); // Cap at 85% slow max
                this.slowMultiplier = 1.0 - newSlow;
                this.slowDuration = Math.max(this.slowDuration, duration);
                break;
            case 'stun':
                this.isStunned = true;
                this.stunDuration = Math.max(this.stunDuration, duration);
                break;
            case 'freeze':
                this.isFrozen = true;
                this.freezeDuration = Math.max(this.freezeDuration, duration);
                break;
            case 'poison':
                this.poisonDamage = value;
                this.poisonDuration = Math.max(this.poisonDuration, duration);
                break;
            case 'armorRed':
                this.armorModifier = value;
                this.armorRedDuration = Math.max(this.armorRedDuration || 0, duration);
                break;
            case 'burn':
                this.burnDuration = Math.max(this.burnDuration, duration);
                break;
            case 'lightning':
                this.lightningDuration = Math.max(this.lightningDuration, duration);
                break;
        }
    }
    
    roar() {
        // Speed up nearby enemies
        for (const enemy of gameState.enemies) {
            if (enemy !== this && !enemy.isDead && !enemy.reachedExit) {
                const dist = Math.hypot(enemy.position.x - this.position.x, enemy.position.y - this.position.y);
                if (dist < 150) {
                    enemy.slowMultiplier = 1.5; // Actually speeds up
                    enemy.slowDuration = 5;
                }
            }
        }
        createFloatingText(this.position.x, this.position.y - 30, "ROAR!", "#e74c3c");
    }
    
    summon() {
        // Summon grunts
        for (let i = 0; i < 2; i++) {
            const grunt = new Enemy('GRUNT', this.wave);
            grunt.position = { ...this.position };
            grunt.position.x += (Math.random() - 0.5) * 40;
            grunt.position.y += (Math.random() - 0.5) * 40;
            gameState.enemies.push(grunt);
        }
        createFloatingText(this.position.x, this.position.y - 30, "SUMMON!", "#9b59b6");
    }
    
    activateShell() {
        this.shellActive = true;
        this.shellDuration = 5;
        createFloatingText(this.position.x, this.position.y - 30, "SHELL!", "#3498db");
    }
    
    die() {
        this.isDead = true;
        
        // Award gold
        let reward = this.type.reward;
        if (Math.random() < 0.2) reward *= 2; // 20% chance for double gold
        gameState.gold += reward;
        
        // Create particles
        createExplosion(this.position.x, this.position.y, this.type.color);
        createFloatingText(this.position.x, this.position.y, `+${reward}g`, "#f1c40f");
        
        // Play sounds
        if (audioManager) {
            audioManager.playSFX('explosion');
            audioManager.playSFX('gold');
        }
        
        // Check wave completion
        checkWaveCompletion();
        
        // Check boss rush completion
        if (bossRushMode && bossRushMode.isActive) {
            bossRushMode.checkBossDeath();
        }
    }
    
    onReachExit() {
        gameState.lives--;
        createFloatingText(this.position.x, this.position.y - 20, "-1 Life", "#e74c3c");
        
        if (gameState.lives <= 0) {
            gameOver();
        }
    }
    
    draw(ctx) {
        if (this.isDead || this.reachedExit) return;
        
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, this.type.radius + 2, this.type.radius * 0.8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw enemy body
        ctx.fillStyle = this.type.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.type.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add texture/details based on enemy type
        if (this.type.name === 'Grunt') {
            // Draw angry eyes
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-4, -2, 3, 0, Math.PI * 2);
            ctx.arc(4, -2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-4, -2, 1.5, 0, Math.PI * 2);
            ctx.arc(4, -2, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type.name === 'Runner') {
            // Draw speedy lines
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-this.type.radius + 2, -5);
            ctx.lineTo(-this.type.radius - 5, -5);
            ctx.moveTo(-this.type.radius + 2, 0);
            ctx.lineTo(-this.type.radius - 5, 0);
            ctx.moveTo(-this.type.radius + 2, 5);
            ctx.lineTo(-this.type.radius - 5, 5);
            ctx.stroke();
        } else if (this.type.name === 'Tank') {
            // Draw armor plates
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.type.radius - 3, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type.name === 'Flyer') {
            // Draw wings
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.ellipse(-8, -5, 6, 3, Math.PI / 4, 0, Math.PI * 2);
            ctx.ellipse(8, -5, 6, 3, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type.name === 'Warlord') {
            // Draw crown/horns
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.moveTo(-8, -this.type.radius + 2);
            ctx.lineTo(-5, -this.type.radius - 8);
            ctx.lineTo(-2, -this.type.radius + 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(2, -this.type.radius + 2);
            ctx.lineTo(5, -this.type.radius - 8);
            ctx.lineTo(8, -this.type.radius + 2);
            ctx.fill();
        }
        
        // Shell effect
        if (this.shellActive) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.type.radius + 2, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Frozen effect
        if (this.isFrozen) {
            ctx.strokeStyle = '#85c1e9';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.type.radius + 1, 0, Math.PI * 2);
            ctx.stroke();
            // Ice crystals
            ctx.fillStyle = '#85c1e9';
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const x = Math.cos(angle) * (this.type.radius + 4);
                const y = Math.sin(angle) * (this.type.radius + 4);
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Fire effect (burning)
        if (this.burnDuration > 0) {
            const time = Date.now() / 100;
            ctx.fillStyle = `rgba(255, ${100 + Math.sin(time) * 50}, 0, 0.7)`;
            // Animated flames
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 + time * 0.5;
                const flameHeight = 4 + Math.sin(time + i) * 2;
                const x = Math.cos(angle) * (this.type.radius + 2);
                const y = Math.sin(angle) * (this.type.radius + 2) - flameHeight;
                ctx.beginPath();
                ctx.ellipse(x, y, 2, flameHeight, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            // Inner fire glow
            ctx.fillStyle = `rgba(255, 200, 0, ${0.3 + Math.sin(time * 2) * 0.2})`;
            ctx.beginPath();
            ctx.arc(0, 0, this.type.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Lightning effect
        if (this.lightningDuration > 0) {
            const time = Date.now() / 50;
            ctx.strokeStyle = '#ffeaa7';
            ctx.lineWidth = 2;
            // Animated lightning bolts
            for (let i = 0; i < 2; i++) {
                ctx.beginPath();
                let startX = (Math.random() - 0.5) * this.type.radius * 2;
                let startY = (Math.random() - 0.5) * this.type.radius * 2;
                ctx.moveTo(startX, startY);
                for (let j = 0; j < 3; j++) {
                    startX += (Math.random() - 0.5) * 8;
                    startY += (Math.random() - 0.5) * 8;
                    ctx.lineTo(startX, startY);
                }
                ctx.stroke();
            }
            // Electric glow
            ctx.fillStyle = `rgba(255, 234, 167, ${0.2 + Math.sin(time) * 0.1})`;
            ctx.beginPath();
            ctx.arc(0, 0, this.type.radius * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Poison effect
        if (this.poisonDuration > 0) {
            const time = Date.now() / 200;
            ctx.fillStyle = 'rgba(85, 239, 196, 0.6)';
            // Bubbling poison bubbles
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 + this.id * 0.5;
                const bubbleSize = 2 + Math.sin(time + i * 2) * 1;
                const distance = this.type.radius + 3 + Math.sin(time * 2 + i) * 2;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                ctx.beginPath();
                ctx.arc(x, y, bubbleSize, 0, Math.PI * 2);
                ctx.fill();
            }
            // Toxic glow
            ctx.fillStyle = `rgba(85, 239, 196, ${0.2 + Math.sin(time) * 0.1})`;
            ctx.beginPath();
            ctx.arc(0, 0, this.type.radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        // Health bar (in world space, not translated)
        const barWidth = 24;
        const barHeight = 4;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#000';
        ctx.fillRect(this.position.x - barWidth/2, this.position.y - this.type.radius - 10, barWidth, barHeight);
        
        ctx.fillStyle = healthPercent > 0.5 ? '#4caf50' : healthPercent > 0.25 ? '#ff9800' : '#f44336';
        ctx.fillRect(this.position.x - barWidth/2, this.position.y - this.type.radius - 10, barWidth * healthPercent, barHeight);
    }
}


// ============================================
// TOWER CLASS
// ============================================
class Tower {
    constructor(type, gridX, gridY) {
        this.type = TOWER_TYPES[type];
        this.typeKey = type;
        this.gridX = gridX;
        this.gridY = gridY;
        this.position = grid.gridToWorld(gridX, gridY);
        
        // Stats
        this.damage = this.type.damage;
        this.attackSpeed = this.type.attackSpeed;
        this.range = this.type.range;
        this.damageType = this.type.damageType;
        
        // Upgrade tracking
        this.level = 1;
        this.branch = null;
        this.upgradeLevel = 0;
        this.totalInvested = this.type.cost;
        
        // Combat
        this.attackCooldown = 0;
        this.target = null;
        this.canTargetFlying = false;
        
        // Special abilities
        this.hasSplash = false;
        this.splashRadius = 0;
        this.hasPoison = false;
        this.poisonDamage = 0;
        this.poisonDuration = 0;
        this.hasCrit = false;
        this.critChance = 0;
        this.hasRicochet = false;
        this.ricochetTargets = 0;
        this.multiTarget = 1;
        
        // Slow effect (Frost Nova)
        this.hasSlow = false;
        this.slowAmount = 0;
        this.slowDuration = 0;
        
        // Chain lightning (Crystal Tower Lightning branch)
        this.chainTargets = 0;
        
        // Aura effects
        this.auraSpeed = 0;
        this.auraDamage = 0;
        this.auraRange = 0;
        this.globalAura = false;
        
        // Aura bonuses (applied from nearby aura towers)
        this.attackSpeedBonus = 0;
        this.damageBonus = 0;
        this.rangeBonus = 0;
        
        // Economy
        this.income = 0;
        this.incomeTimer = 0;
        
        // Vault specific
        if (this.type.noAttack) {
            this.income = 1; // Base income
        }
        
        // Elemental upgrades
        this.elementalUpgrades = {};
        this.hasFire = false;
        this.fireDamage = 0;
        this.burnDuration = 0;
        this.hasIce = false;
        this.freezeChance = 0;
        this.freezeDuration = 0;
        this.hasLightning = false;
        this.chainDamage = 0;
        this.stunChance = 0;
        this.hasNature = false;
        this.lifeSteal = 0;
        this.hasShadow = false;
    }
    
    applyElementalUpgrade(upgrade, elementId) {
        this.elementalUpgrades[elementId] = (this.elementalUpgrades[elementId] || 0) + 1;
        
        switch(elementId) {
            case 'fire':
                this.hasFire = true;
                if (upgrade.fireDamage) this.fireDamage += upgrade.fireDamage;
                if (upgrade.burnDuration) this.burnDuration = upgrade.burnDuration;
                if (upgrade.explosionRadius) {
                    this.hasSplash = true;
                    this.splashRadius = Math.max(this.splashRadius, upgrade.explosionRadius);
                }
                break;
            case 'ice':
                this.hasIce = true;
                if (upgrade.slow) this.slow = upgrade.slow;
                if (upgrade.freezeChance) this.freezeChance = upgrade.freezeChance;
                if (upgrade.freezeDuration) this.freezeDuration = upgrade.freezeDuration;
                break;
            case 'lightning':
                this.hasLightning = true;
                if (upgrade.chainDamage) this.chainDamage += upgrade.chainDamage;
                if (upgrade.chainTargets) this.chainTargets = upgrade.chainTargets;
                if (upgrade.stunChance) this.stunChance = upgrade.stunChance;
                if (upgrade.attackSpeed) this.attackSpeed += upgrade.attackSpeed;
                break;
            case 'nature':
                this.hasNature = true;
                if (upgrade.poison) this.poisonDamage = upgrade.poison;
                if (upgrade.poisonDuration) this.poisonDuration = upgrade.poisonDuration;
                if (upgrade.healOnKill) this.healOnKill = upgrade.healOnKill;
                break;
            case 'shadow':
                this.hasShadow = true;
                if (upgrade.lifeSteal) this.lifeSteal = upgrade.lifeSteal;
                if (upgrade.curse) this.hasCurse = true;
                break;
        }
    }
    
    update(deltaTime) {
        if (this.type.noAttack) {
            // Economy towers generate gold
            this.incomeTimer += deltaTime;
            if (this.incomeTimer >= 3) {
                this.incomeTimer = 0;
                gameState.gold += this.income;
                if (this.income > 0) {
                    createFloatingText(this.position.x, this.position.y - 20, `+${this.income}g`, "#f1c40f");
                }
            }
            return;
        }
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Find target
        this.findTarget();
        
        // Attack
        if (this.attackCooldown <= 0 && this.target) {
            this.attack();
        }
    }
    
    findTarget() {
        const effectiveRange = this.getEffectiveRange();
        
        if (this.target && !this.target.isDead && !this.target.reachedExit) {
            const dist = Math.hypot(this.target.position.x - this.position.x, this.target.position.y - this.position.y);
            if (dist <= effectiveRange && (this.canTargetFlying || !this.target.type.flying)) {
                return; // Keep current target
            }
        }
        
        this.target = null;
        
        // Find closest enemy to exit
        let bestEnemy = null;
        let bestProgress = -1;
        
        for (const enemy of gameState.enemies) {
            if (enemy.isDead || enemy.reachedExit) continue;
            if (enemy.type.flying && !this.canTargetFlying) continue;
            
            const dist = Math.hypot(enemy.position.x - this.position.x, enemy.position.y - this.position.y);
            if (dist <= effectiveRange) {
                // Calculate progress (distance to exit)
                const progress = enemy.pathIndex + (1 - enemy.path.length - enemy.pathIndex) / enemy.path.length;
                if (progress > bestProgress) {
                    bestProgress = progress;
                    bestEnemy = enemy;
                }
            }
        }
        
        this.target = bestEnemy;
    }
    
    attack() {
        this.attackCooldown = 1 / this.getEffectiveAttackSpeed();
        
        // Check if this is a chain lightning tower (Crystal Tower Lightning branch)
        if (this.chainTargets && this.chainTargets > 0) {
            this.performChainLightningAttack();
            return;
        }
        
        // Find targets
        const targets = [];
        const effectiveRange = this.getEffectiveRange();
        if (this.multiTarget > 1) {
            // Multi-target
            for (const enemy of gameState.enemies) {
                if (enemy.isDead || enemy.reachedExit) continue;
                if (enemy.type.flying && !this.canTargetFlying) continue;
                
                const dist = Math.hypot(enemy.position.x - this.position.x, enemy.position.y - this.position.y);
                if (dist <= effectiveRange) {
                    targets.push(enemy);
                    if (targets.length >= this.multiTarget) break;
                }
            }
        } else {
            targets.push(this.target);
        }
        
        // Attack each target
        for (const target of targets) {
            if (!target) continue;
            
            // Create projectile
            const projectile = new Projectile(
                this.position.x,
                this.position.y,
                target,
                this.calculateDamage(),
                this.damageType,
                this.type.projectileColor,
                this
            );
            
            // Play shoot sound
            if (audioManager) audioManager.playSFX('shoot');
            
            projectile.hasSplash = this.hasSplash;
            projectile.splashRadius = this.splashRadius;
            projectile.hasPoison = this.hasPoison;
            projectile.poisonDamage = this.poisonDamage;
            projectile.poisonDuration = this.poisonDuration;
            
            // Pass armor reduction from poison towers
            if (this.hasArmorRed && this.armorReduction) {
                projectile.hasArmorRed = true;
                projectile.armorReduction = this.armorReduction;
            }
            
            projectile.hasRicochet = this.hasRicochet;
            projectile.ricochetTargets = this.ricochetTargets;
            projectile.ricochetDamage = this.getEffectiveDamage() * 0.6;
            
            // Pass slow effect from tower upgrades (e.g., Frost Nova)
            if (this.hasSlow && this.slowAmount) {
                projectile.hasSlow = true;
                projectile.slowAmount = this.slowAmount;
                projectile.slowDuration = this.slowDuration || 3;
            }
            
            // Pass slow effect from ice elemental upgrades
            if (this.hasIce && this.slow) {
                projectile.hasSlow = true;
                projectile.slowAmount = this.slow;
                projectile.slowDuration = 2; // 2 seconds slow duration
            }
            
            // Pass freeze effect from tower upgrades (e.g., Frost Nova)
            if (this.freezeChance && Math.random() < this.freezeChance) {
                projectile.hasFreeze = true;
                projectile.freezeDuration = this.freezeDuration || 1;
            }
            
            // Pass freeze effect from ice elemental upgrades
            if (this.hasIce && this.freezeChance && Math.random() < this.freezeChance) {
                projectile.hasFreeze = true;
                projectile.freezeDuration = this.freezeDuration || 1;
            }
            
            // Pass fire damage and burn effect
            if (this.hasFire && this.fireDamage) {
                projectile.hasFire = true;
                projectile.fireDamage = this.fireDamage;
                projectile.burnDuration = this.burnDuration || 3;
            }
            
            // Pass lightning stun effect
            if (this.stunChance && Math.random() < this.stunChance) {
                projectile.hasLightning = true;
                projectile.stunDuration = this.stunDuration || 0.5;
            }
            
            // Pass lightning elemental chain effect
            if (this.hasLightning && this.stunChance && Math.random() < this.stunChance) {
                projectile.hasLightning = true;
                projectile.lightningDuration = 2; // Visual effect duration
            }
            
            gameState.projectiles.push(projectile);
        }
    }
    
    performChainLightningAttack() {
        // Play shoot sound
        if (audioManager) audioManager.playSFX('shoot');
        
        // Find all enemies in range
        const enemiesInRange = [];
        const effectiveRange = this.getEffectiveRange();
        for (const enemy of gameState.enemies) {
            if (enemy.isDead || enemy.reachedExit) continue;
            if (enemy.type.flying && !this.canTargetFlying) continue;
            
            const dist = Math.hypot(enemy.position.x - this.position.x, enemy.position.y - this.position.y);
            if (dist <= effectiveRange) {
                enemiesInRange.push(enemy);
            }
        }
        
        if (enemiesInRange.length === 0) return;
        
        // Sort by distance to exit (closest first)
        enemiesInRange.sort((a, b) => {
            const progressA = a.pathIndex + (1 - a.path.length - a.pathIndex) / a.path.length;
            const progressB = b.pathIndex + (1 - b.path.length - b.pathIndex) / b.path.length;
            return progressB - progressA;
        });
        
        // Hit primary target
        const primaryTarget = enemiesInRange[0];
        let damage = this.calculateDamage();
        primaryTarget.takeDamage(damage, this.damageType);
        
        // Apply stun if available
        if (this.stunDuration) {
            primaryTarget.applyStatusEffect('stun', 0, this.stunDuration);
            createFloatingText(primaryTarget.position.x, primaryTarget.position.y - 20, "STUNNED!", "#ffeaa7");
        }
        
        // Apply lightning visual effect
        primaryTarget.applyStatusEffect('lightning', 0, 1);
        
        // Chain to additional targets
        const chainedTargets = [primaryTarget];
        const maxChains = Math.min(this.chainTargets - 1, enemiesInRange.length - 1);
        
        for (let i = 0; i < maxChains; i++) {
            // Find closest enemy to the last chained target
            let closestEnemy = null;
            let closestDist = Infinity;
            
            for (const enemy of enemiesInRange) {
                if (chainedTargets.includes(enemy)) continue;
                
                const lastTarget = chainedTargets[chainedTargets.length - 1];
                const dist = Math.hypot(enemy.position.x - lastTarget.position.x, enemy.position.y - lastTarget.position.y);
                
                if (dist < closestDist && dist <= this.range * 0.6) {
                    closestDist = dist;
                    closestEnemy = enemy;
                }
            }
            
            if (closestEnemy) {
                // Deal reduced damage to chained targets
                const chainDamage = damage * (0.7 - i * 0.1); // Each chain does less damage
                closestEnemy.takeDamage(chainDamage, this.damageType);
                
                // Apply stun to chained targets too
                if (this.stunDuration) {
                    closestEnemy.applyStatusEffect('stun', 0, this.stunDuration * 0.5); // Half stun duration for chains
                }
                
                closestEnemy.applyStatusEffect('lightning', 0, 1);
                chainedTargets.push(closestEnemy);
                
                // Visual effect for chain
                createFloatingText(closestEnemy.position.x, closestEnemy.position.y - 15, "CHAIN!", "#ffd700");
            } else {
                break;
            }
        }
    }
    
    calculateDamage() {
        let damage = this.getEffectiveDamage();
        
        // Critical hit
        if (this.hasCrit && Math.random() < this.critChance) {
            damage *= 2;
        }
        
        return damage;
    }
    
    // Get effective attack speed with aura bonuses
    getEffectiveAttackSpeed() {
        return this.attackSpeed * (1 + this.attackSpeedBonus);
    }

    // Get effective damage with aura bonuses
    getEffectiveDamage() {
        return this.damage * (1 + this.damageBonus);
    }
    
    // Get effective range with aura bonuses
    getEffectiveRange() {
        return this.range * (1 + this.rangeBonus);
    }
    
    upgrade(branchIndex) {
        if (this.level >= 4) return false;
        if (this.branch !== null && this.branch !== branchIndex) return false;
        
        const branch = this.type.branches[branchIndex];
        const upgrade = branch.upgrades[this.upgradeLevel];
        
        if (gameState.gold < upgrade.cost) return false;
        
        gameState.gold -= upgrade.cost;
        this.totalInvested += upgrade.cost;
        
        this.branch = branchIndex;
        this.upgradeLevel++;
        this.level++;
        
        // Apply upgrade effects
        this.applyUpgrade(upgrade);
        
        // Visual feedback
        createExplosion(this.position.x, this.position.y, "#f1c40f");
        createFloatingText(this.position.x, this.position.y - 30, "UPGRADED!", "#f1c40f");
        
        return true;
    }
    
    applyUpgrade(upgrade) {
        if (upgrade.damage) this.damage += upgrade.damage;
        if (upgrade.speed) this.attackSpeed += upgrade.speed;
        if (upgrade.range) this.range += upgrade.range;
        if (upgrade.flying) this.canTargetFlying = true;
        if (upgrade.crit) {
            this.hasCrit = true;
            this.critChance = upgrade.crit;
        }
        if (upgrade.splash) {
            this.hasSplash = true;
            this.splashRadius = upgrade.splash;
        }
        if (upgrade.multi) this.multiTarget = upgrade.multi;
        if (upgrade.ricochet) {
            this.hasRicochet = true;
            this.ricochetTargets = upgrade.ricochet;
        }
        if (upgrade.poison) {
            this.hasPoison = true;
            this.poisonDamage = upgrade.poison;
            this.poisonDuration = upgrade.poisonDuration || 3;
        }
        if (upgrade.slow) {
            this.hasSlow = true;
            this.slowAmount = upgrade.slow;
            this.slowDuration = 3; // 3 seconds slow duration
        }
        if (upgrade.armorRed) {
            this.hasArmorRed = true;
            this.armorReduction = upgrade.armorRed;
        }
        if (upgrade.chain) {
            this.chainTargets = upgrade.chain;
        }
        if (upgrade.stun) {
            this.stunDuration = upgrade.stun;
        }
        if (upgrade.freeze) {
            this.freezeChance = upgrade.freeze;
            this.freezeDuration = 1; // Default 1 second freeze duration
        }
        if (upgrade.freezeChance) {
            this.freezeChance = upgrade.freezeChance;
            this.freezeDuration = upgrade.freezeDuration || 1;
        }
        if (upgrade.income) {
            this.income += upgrade.income;
        }
        if (upgrade.interest) {
            this.interestBonus = upgrade.interest;
        }
        if (upgrade.auraSpeed) {
            this.auraSpeed = upgrade.auraSpeed;
        }
        if (upgrade.auraDamage) {
            this.auraDamage = upgrade.auraDamage;
        }
        if (upgrade.auraRange) {
            this.auraRange = upgrade.auraRange;
        }
        if (upgrade.global) {
            this.globalAura = true;
        }
    }
    
    getSellValue() {
        return Math.floor(this.totalInvested * 0.7);
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.typeKey === 'ARCHER') {
            this.drawArcherTower(ctx);
        } else if (this.typeKey === 'CRYSTAL') {
            this.drawCrystalTower(ctx);
        } else if (this.typeKey === 'VAULT') {
            this.drawVaultTower(ctx);
        }
        
        // Level indicator
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(this.level.toString(), 0, 0);
        ctx.fillText(this.level.toString(), 0, 0);
        
        // Range indicator when selected
        if (gameState.selectedTower === this) {
            ctx.save();
            ctx.translate(-this.position.x, -this.position.y);
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.range, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.restore();
        }
        
        ctx.restore();
    }
    
    drawArcherTower(ctx) {
        // Wooden tower base
        ctx.fillStyle = '#6d4c41';
        ctx.fillRect(-10, -5, 20, 15);
        
        // Wood texture lines
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-6, -5);
        ctx.lineTo(-6, 10);
        ctx.moveTo(0, -5);
        ctx.lineTo(0, 10);
        ctx.moveTo(6, -5);
        ctx.lineTo(6, 10);
        ctx.stroke();
        
        // Tower top (platform)
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(-12, -12, 24, 8);
        
        // Archer figure
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.arc(0, -18, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Bow
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -18, 8, -Math.PI/3, Math.PI/3);
        ctx.stroke();
        
        // Branch indicator glow
        if (this.branch !== null) {
            const colors = ['#ef5350', '#42a5f5', '#66bb6a'];
            ctx.strokeStyle = colors[this.branch];
            ctx.lineWidth = 2;
            ctx.strokeRect(-12, -20, 24, 32);
        }
    }
    
    drawCrystalTower(ctx) {
        // Crystal base (stone pedestal)
        ctx.fillStyle = '#78909c';
        ctx.beginPath();
        ctx.moveTo(-10, 10);
        ctx.lineTo(-8, -5);
        ctx.lineTo(8, -5);
        ctx.lineTo(10, 10);
        ctx.closePath();
        ctx.fill();
        
        // Main crystal
        const crystalColor = this.branch === 1 ? '#42a5f5' : this.branch === 0 ? '#29b6f6' : '#66bb6a';
        ctx.fillStyle = crystalColor;
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.lineTo(-8, -5);
        ctx.lineTo(0, 5);
        ctx.lineTo(8, -5);
        ctx.closePath();
        ctx.fill();
        
        // Crystal shine
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.lineTo(-3, -10);
        ctx.lineTo(0, -5);
        ctx.lineTo(3, -10);
        ctx.closePath();
        ctx.fill();
        
        // Glow effect
        if (this.branch !== null) {
            const colors = ['#29b6f6', '#42a5f5', '#66bb6a'];
            ctx.shadowColor = colors[this.branch];
            ctx.shadowBlur = 10;
            ctx.strokeStyle = colors[this.branch];
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
    
    drawVaultTower(ctx) {
        // Treasure chest base
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(-12, -2, 24, 14);
        
        // Chest details
        ctx.strokeStyle = '#f9a825';
        ctx.lineWidth = 2;
        ctx.strokeRect(-12, -2, 24, 14);
        
        // Lid
        ctx.fillStyle = '#ffecb3';
        ctx.beginPath();
        ctx.arc(0, -2, 12, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#f9a825';
        ctx.stroke();
        
        // Lock
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(-3, 2, 6, 5);
        
        // Gold coins/sparkle
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(-6, -8, 2, 0, Math.PI * 2);
        ctx.arc(6, -10, 2, 0, Math.PI * 2);
        ctx.arc(0, -12, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Branch indicator
        if (this.branch !== null) {
            const colors = ['#ffd54f', '#ffb300', '#ff8f00'];
            ctx.strokeStyle = colors[this.branch];
            ctx.lineWidth = 2;
            ctx.strokeRect(-13, -13, 26, 27);
        }
    }
}


// ============================================
// PROJECTILE CLASS
// ============================================
class Projectile {
    constructor(x, y, target, damage, damageType, color, source) {
        this.position = { x, y };
        this.target = target;
        this.damage = damage;
        this.damageType = damageType;
        this.color = color;
        this.source = source;
        this.speed = 400;
        this.isDead = false;
        
        this.hasSplash = false;
        this.splashRadius = 0;
        this.hasPoison = false;
        this.poisonDamage = 0;
        this.poisonDuration = 0;
        this.hasRicochet = false;
        this.ricochetTargets = 0;
        this.ricochetDamage = 0;
        this.ricochetCount = 0;
        this.hitTargets = [];
        
        // Ice elemental effects
        this.hasSlow = false;
        this.slowAmount = 0;
        this.slowDuration = 0;
        this.hasFreeze = false;
        this.freezeDuration = 0;
        
        // Fire elemental effects
        this.hasFire = false;
        this.fireDamage = 0;
        this.burnDuration = 0;
        
        // Lightning elemental effects
        this.hasLightning = false;
        this.lightningDuration = 0;
        
        // Armor reduction from poison towers
        this.hasArmorRed = false;
        this.armorReduction = 0;
    }
    
    update(deltaTime) {
        if (this.isDead) return;
        
        if (!this.target || this.target.isDead || this.target.reachedExit) {
            this.isDead = true;
            return;
        }
        
        // Move towards target
        const dx = this.target.position.x - this.position.x;
        const dy = this.target.position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 10) {
            this.hit(this.target);
            return;
        }
        
        const moveDistance = this.speed * deltaTime;
        this.position.x += (dx / distance) * moveDistance;
        this.position.y += (dy / distance) * moveDistance;
    }
    
    hit(enemy) {
        this.isDead = true;
        
        // Apply damage
        enemy.takeDamage(this.damage, this.damageType);
        
        // Apply effects
        if (this.hasPoison) {
            enemy.applyStatusEffect('poison', this.poisonDamage, this.poisonDuration);
        }
        
        // Apply armor reduction from poison towers
        if (this.hasArmorRed && this.armorReduction) {
            enemy.applyStatusEffect('armorRed', this.armorReduction, this.poisonDuration || 5);
            createFloatingText(enemy.position.x, enemy.position.y - 10, `ARMOR -${this.armorReduction}`, "#9b59b6");
        }
        
        // Apply slow effect from ice elemental upgrades
        if (this.hasSlow) {
            enemy.applyStatusEffect('slow', this.slowAmount, this.slowDuration);
            createFloatingText(enemy.position.x, enemy.position.y - 15, "SLOWED!", "#74b9ff");
        }
        
        // Apply freeze effect from ice elemental upgrades
        if (this.hasFreeze) {
            enemy.applyStatusEffect('freeze', 0, this.freezeDuration);
            createFloatingText(enemy.position.x, enemy.position.y - 25, "FROZEN!", "#3498db");
        }
        
        // Apply fire burn effect
        if (this.hasFire) {
            enemy.applyStatusEffect('burn', this.fireDamage, this.burnDuration);
            createFloatingText(enemy.position.x, enemy.position.y - 20, "BURNING!", "#ff6b35");
        }
        
        // Apply lightning stun effect
        if (this.hasLightning) {
            enemy.applyStatusEffect('stun', 0, this.stunDuration || 0.5);
            enemy.applyStatusEffect('lightning', 0, this.lightningDuration || 2);
            createFloatingText(enemy.position.x, enemy.position.y - 20, "ZAP!", "#ffeaa7");
        }
        
        // Splash damage
        if (this.hasSplash && this.splashRadius > 0) {
            for (const e of gameState.enemies) {
                if (e !== enemy && !e.isDead && !e.reachedExit) {
                    const dist = Math.hypot(e.position.x - enemy.position.x, e.position.y - enemy.position.y);
                    if (dist <= this.splashRadius) {
                        e.takeDamage(this.damage * 0.5, this.damageType);
                    }
                }
            }
        }
        
        // Ricochet
        if (this.hasRicochet && this.ricochetCount < this.ricochetTargets) {
            this.ricochetCount++;
            this.hitTargets.push(enemy);
            
            // Find next target
            let nextTarget = null;
            let closestDist = Infinity;
            
            for (const e of gameState.enemies) {
                if (e.isDead || e.reachedExit || this.hitTargets.includes(e)) continue;
                
                const dist = Math.hypot(e.position.x - enemy.position.x, e.position.y - enemy.position.y);
                if (dist < closestDist && dist <= this.source.range * 0.5) {
                    closestDist = dist;
                    nextTarget = e;
                }
            }
            
            if (nextTarget) {
                this.target = nextTarget;
                this.damage = this.ricochetDamage;
                this.isDead = false;
            }
        }
    }
    
    draw(ctx) {
        if (this.isDead) return;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

// ============================================
// PARTICLE SYSTEM
// ============================================
class Particle {
    constructor(x, y, color, velocity, lifetime) {
        this.position = { x, y };
        this.velocity = velocity;
        this.color = color;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.size = Math.random() * 4 + 2;
    }
    
    update(deltaTime) {
        this.lifetime -= deltaTime;
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.y += 200 * deltaTime; // Gravity
    }
    
    draw(ctx) {
        const alpha = this.lifetime / this.maxLifetime;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x - this.size/2, this.position.y - this.size/2, this.size, this.size);
        ctx.restore();
    }
    
    get isDead() {
        return this.lifetime <= 0;
    }
}

// ============================================
// FLOATING TEXT
// ============================================
class FloatingText {
    constructor(x, y, text, color) {
        this.position = { x, y };
        this.text = text;
        this.color = color;
        this.lifetime = 1.5;
        this.velocity = { x: 0, y: -30 };
    }
    
    update(deltaTime) {
        this.lifetime -= deltaTime;
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
    }
    
    draw(ctx) {
        const alpha = Math.min(1, this.lifetime);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.position.x, this.position.y);
        ctx.restore();
    }
    
    get isDead() {
        return this.lifetime <= 0;
    }
}

// ============================================
// WAVE MANAGER
// ============================================
class WaveManager {
    constructor() {
        this.currentWave = 0;
        this.waveActive = false;
        this.preparationTime = 15;
        this.preparationTimer = 0;
        this.enemyQueue = [];
        this.spawnTimer = 0;
        this.enemiesSpawned = 0;
        this.totalEnemiesInWave = 0;
    }
    
    update(deltaTime) {
        if (gameState.isGameOver || gameState.isVictory) return;
        
        if (this.waveActive) {
            // Spawn enemies
            this.spawnTimer -= deltaTime;
            if (this.spawnTimer <= 0 && this.enemyQueue.length > 0) {
                const next = this.enemyQueue.shift();
                const enemy = new Enemy(next.type, this.currentWave);
                gameState.enemies.push(enemy);
                this.spawnTimer = next.interval / 1000;
                this.enemiesSpawned++;
            }
            
            // Check if wave is complete
            if (this.enemyQueue.length === 0 && this.enemiesSpawned >= this.totalEnemiesInWave) {
                const aliveEnemies = gameState.enemies.filter(e => !e.isDead && !e.reachedExit).length;
                if (aliveEnemies === 0) {
                    this.completeWave();
                }
            }
        } else {
            // Preparation phase
            this.preparationTimer -= deltaTime;
            if (this.preparationTimer <= 0) {
                this.startNextWave();
            }
        }
    }
    
    startNextWave() {
        if (this.currentWave >= WAVES.length) {
            victory();
            return;
        }
        
        // Play wave start sound
        if (audioManager) audioManager.playSFX('waveStart');
        
        this.currentWave++;
        this.waveActive = true;
        this.enemyQueue = [];
        this.enemiesSpawned = 0;
        
        const waveData = WAVES[this.currentWave - 1];
        this.totalEnemiesInWave = 0;
        
        // Build enemy queue
        for (const group of waveData.enemies) {
            for (let i = 0; i < group.count; i++) {
                this.enemyQueue.push({
                    type: group.type,
                    interval: group.interval
                });
                this.totalEnemiesInWave++;
            }
        }
        
        this.spawnTimer = 0;
        
        createFloatingText(400, 240, `WAVE ${this.currentWave}!`, "#e74c3c");
    }
    
    completeWave() {
        this.waveActive = false;
        
        // Wave reward - use custom bonus from wave config
        const waveData = WAVES[this.currentWave - 1];
        const reward = waveData.bonus || (50 + this.currentWave * 10);
        gameState.gold += reward;
        createFloatingText(400, 200, `Wave Complete! +${reward}g`, "#f1c40f");
        
        // Apply interest (increased cap for later waves)
        const interestCap = 50 + Math.floor(this.currentWave / 5) * 25;
        const interest = Math.min(Math.floor(gameState.gold * 0.1), interestCap);
        if (interest > 0) {
            gameState.gold += interest;
            createFloatingText(400, 220, `Interest: +${interest}g`, "#2ecc71");
        }
        
        // Bonus gold for reaching certain milestones
        if (this.currentWave === 5) {
            gameState.gold += 100;
            createFloatingText(400, 240, "Milestone Bonus! +100g", "#f39c12");
        } else if (this.currentWave === 10) {
            gameState.gold += 200;
            createFloatingText(400, 240, "Halfway Bonus! +200g", "#f39c12");
        }
        
        if (this.currentWave >= WAVES.length) {
            victory();
        } else {
            this.preparationTime = WAVES[this.currentWave].preparationTime;
            this.preparationTimer = this.preparationTime;
            
            // Check for element milestone
            if (elementManager) {
                elementManager.checkMilestone(this.currentWave);
            }
            
            // Update music track based on next wave
            if (audioManager) {
                audioManager.updateTrackByWave(this.currentWave + 1);
            }
        }
    }
    
    skipPreparation() {
        if (!this.waveActive) {
            this.preparationTimer = 0;
        }
    }
}


// ============================================
// GLOBAL VARIABLES
// ============================================
let canvas, ctx;
let grid;
let waveManager;
let lastTime = 0;
let mouseX = 0, mouseY = 0;

// ============================================
// INITIALIZATION
// ============================================
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Initialize audio manager
    audioManager = new AudioManager();
    audioManager.loadSettings();
    
    // Initialize element manager
    elementManager = new ElementManager();
    
    // Initialize boss rush mode
    bossRushMode = new BossRushMode();
    
    // Initialize game systems
    grid = new Grid();
    waveManager = new WaveManager();
    
    // Set up event listeners
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onMouseClick);
    canvas.addEventListener('contextmenu', onRightClick);
    document.addEventListener('keydown', onKeyDown);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', onTouchStart, {passive: false});
    canvas.addEventListener('touchmove', onTouchMove, {passive: false});
    canvas.addEventListener('touchend', onTouchEnd, {passive: false});
    
    // Handle window resize
    window.addEventListener('resize', onResize);
    onResize(); // Initial sizing
    
    // Start preparation timer
    waveManager.preparationTimer = waveManager.preparationTime;
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Responsive canvas sizing
function onResize() {
    const gameArea = document.getElementById('gameArea');
    const sidebar = document.getElementById('sidebar');
    const isMobile = window.innerWidth <= 768;
    
    // Calculate available space
    let availableWidth = gameArea.clientWidth - 20;
    let availableHeight = gameArea.clientHeight - 20;
    
    // Account for sidebar on desktop
    if (!isMobile && sidebar && sidebar.offsetParent !== null) {
        availableWidth = (window.innerWidth - sidebar.offsetWidth - 40);
        availableHeight = window.innerHeight - document.getElementById('header').offsetHeight - 40;
    }
    
    // Calculate scale to fit while maintaining aspect ratio
    const gameAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
    const availableAspect = availableWidth / availableHeight;
    
    let scale;
    if (availableAspect > gameAspect) {
        // Height constrained
        scale = availableHeight / CANVAS_HEIGHT;
    } else {
        // Width constrained
        scale = availableWidth / CANVAS_WIDTH;
    }
    
    // Limit max scale for very large screens
    scale = Math.min(scale, 1.5);
    
    // Apply scale via CSS transform for crisp rendering
    canvas.style.width = `${CANVAS_WIDTH * scale}px`;
    canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
}

// Touch handling for mobile
let touchStartX = 0;
let touchStartY = 0;

function onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    mouseX = (touch.clientX - rect.left) * scaleX;
    mouseY = (touch.clientY - rect.top) * scaleY;
    touchStartX = mouseX;
    touchStartY = mouseY;
}

function onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    mouseX = (touch.clientX - rect.left) * scaleX;
    mouseY = (touch.clientY - rect.top) * scaleY;
}

function onTouchEnd(e) {
    e.preventDefault();
    // Treat touch end as a click if not much movement
    const moveDist = Math.hypot(mouseX - touchStartX, mouseY - touchStartY);
    if (moveDist < 10) {
        onMouseClick({clientX: 0, clientY: 0}); // Trigger click handler
    }
}

// ============================================
// GAME LOOP
// ============================================
function gameLoop(timestamp) {
    const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    
    if (!gameState.isPaused && !gameState.isGameOver && !gameState.isVictory) {
        update(deltaTime * gameState.gameSpeed);
    }
    
    render();
    updateUI();
    
    requestAnimationFrame(gameLoop);
}

// Apply aura effects from towers with aura upgrades to nearby towers
function applyAuraEffects() {
    // Reset aura bonuses for all towers first
    for (const tower of gameState.towers) {
        tower.attackSpeedBonus = 0;
        tower.damageBonus = 0;
        tower.rangeBonus = 0;
    }
    
    // Apply aura effects from aura towers
    for (const auraTower of gameState.towers) {
        // Check if this tower has aura effects
        if (auraTower.auraSpeed > 0 || auraTower.auraDamage > 0 || auraTower.auraRange > 0) {
            const auraRange = 150; // Range within which aura affects other towers
            
            // Apply to all nearby towers (including itself)
            for (const targetTower of gameState.towers) {
                const dist = Math.hypot(
                    targetTower.position.x - auraTower.position.x,
                    targetTower.position.y - auraTower.position.y
                );
                
                if (dist <= auraRange) {
                    // Apply speed bonus
                    if (auraTower.auraSpeed > 0) {
                        targetTower.attackSpeedBonus += auraTower.auraSpeed;
                    }
                    // Apply damage bonus
                    if (auraTower.auraDamage > 0) {
                        targetTower.damageBonus += auraTower.auraDamage;
                    }
                    // Apply range bonus
                    if (auraTower.auraRange > 0) {
                        targetTower.rangeBonus += auraTower.auraRange;
                    }
                }
            }
        }
    }
}

function update(deltaTime) {
    // Update wave manager
    waveManager.update(deltaTime);
    
    // Apply aura effects to towers
    applyAuraEffects();
    
    // Update towers
    for (const tower of gameState.towers) {
        tower.update(deltaTime);
    }
    
    // Update enemies
    for (const enemy of gameState.enemies) {
        enemy.update(deltaTime);
    }
    
    // Update projectiles
    for (const projectile of gameState.projectiles) {
        projectile.update(deltaTime);
    }
    
    // Update particles
    for (const particle of gameState.particles) {
        particle.update(deltaTime);
    }
    
    // Update floating texts
    for (const text of gameState.particles) {
        if (text instanceof FloatingText) {
            text.update(deltaTime);
        }
    }
    
    // Clean up dead entities
    gameState.enemies = gameState.enemies.filter(e => !e.isDead && !e.reachedExit);
    gameState.projectiles = gameState.projectiles.filter(p => !p.isDead);
    gameState.particles = gameState.particles.filter(p => !p.isDead);
}

// ============================================
// RENDERING
// ============================================
function render() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw grid
    drawGrid();
    
    // Draw path
    drawPath();
    
    // Draw towers
    for (const tower of gameState.towers) {
        tower.draw(ctx);
    }
    
    // Draw enemies
    for (const enemy of gameState.enemies) {
        enemy.draw(ctx);
    }
    
    // Draw projectiles
    for (const projectile of gameState.projectiles) {
        projectile.draw(ctx);
    }
    
    // Draw particles
    for (const particle of gameState.particles) {
        particle.draw(ctx);
    }
    
    // Draw preview
    drawPreview();
    
    // Draw spawn/exit
    drawSpawnExit();
}

function drawGrid() {
    // Draw grass background with stored static colors
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            const px = x * CELL_SIZE;
            const py = y * CELL_SIZE;
            
            if (!grid.cells[x][y].isPath && !grid.cells[x][y].hasTower) {
                // Use stored grass color (generated once during initialization)
                ctx.fillStyle = grid.cells[x][y].grassColor || 'rgb(30, 80, 30)';
                ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            }
        }
    }
    
    // Draw static decorations (trees, rocks, grass tufts)
    for (const dec of grid.decorations) {
        if (dec.type === 'grass') {
            drawStaticGrassTuft(dec.x, dec.y);
        } else if (dec.type === 'rock') {
            drawStaticRock(dec.x, dec.y, dec.size);
        } else if (dec.type === 'tree') {
            drawTree(dec.x, dec.y, dec.scale);
        }
    }
    
    // Draw subtle grid lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= GRID_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL_SIZE, 0);
        ctx.lineTo(x * CELL_SIZE, CANVAS_HEIGHT);
        ctx.stroke();
    }
    
    for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL_SIZE);
        ctx.lineTo(CANVAS_WIDTH, y * CELL_SIZE);
        ctx.stroke();
    }
}

function drawStaticGrassTuft(x, y) {
    ctx.save();
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2;
    // Use fixed angles instead of random
    const angles = [-Math.PI/2 - 0.2, -Math.PI/2, -Math.PI/2 + 0.2];
    for (let i = 0; i < 3; i++) {
        const length = 4 + (i % 2) * 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angles[i]) * length, y + Math.sin(angles[i]) * length);
        ctx.stroke();
    }
    ctx.restore();
}

function drawStaticRock(x, y, size) {
    ctx.save();
    ctx.fillStyle = '#78909c';
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawGrassTuft(x, y) {
    ctx.save();
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        const length = 4 + Math.random() * 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
    }
    ctx.restore();
}

function drawRock(x, y) {
    ctx.save();
    ctx.fillStyle = '#78909c';
    ctx.beginPath();
    ctx.ellipse(x, y, 4 + Math.random() * 3, 3 + Math.random() * 2, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawTree(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Tree trunk
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-4, -5, 8, 15);
    
    // Tree foliage (3 layers)
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.moveTo(-15, -5);
    ctx.lineTo(0, -30);
    ctx.lineTo(15, -5);
    ctx.fill();
    
    ctx.fillStyle = '#388e3c';
    ctx.beginPath();
    ctx.moveTo(-12, -15);
    ctx.lineTo(0, -35);
    ctx.lineTo(12, -15);
    ctx.fill();
    
    ctx.fillStyle = '#43a047';
    ctx.beginPath();
    ctx.moveTo(-8, -25);
    ctx.lineTo(0, -40);
    ctx.lineTo(8, -25);
    ctx.fill();
    
    // Add highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(-5, -30);
    ctx.lineTo(0, -40);
    ctx.lineTo(2, -30);
    ctx.fill();
    
    ctx.restore();
}

function drawPath() {
    if (grid.path.length < 2) return;
    
    // Draw dirt path base (static)
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(grid.path[0].x, grid.path[0].y);
    for (let i = 1; i < grid.path.length; i++) {
        ctx.lineTo(grid.path[i].x, grid.path[i].y);
    }
    ctx.stroke();
    
    // Draw lighter path center (static)
    ctx.strokeStyle = '#a1887f';
    ctx.lineWidth = 20;
    
    ctx.beginPath();
    ctx.moveTo(grid.path[0].x, grid.path[0].y);
    for (let i = 1; i < grid.path.length; i++) {
        ctx.lineTo(grid.path[i].x, grid.path[i].y);
    }
    ctx.stroke();
    
    // Draw static path details (footprints/scuffs) - deterministic positions
    ctx.fillStyle = '#6d4c41';
    for (let i = 0; i < grid.path.length - 1; i++) {
        const p1 = grid.path[i];
        const p2 = grid.path[i + 1];
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const steps = Math.floor(dist / 12); // Fixed spacing
        
        // Use deterministic pattern based on position
        for (let j = 0; j < steps; j++) {
            const t = (j + 0.5) / steps; // Even spacing
            const baseX = p1.x + (p2.x - p1.x) * t;
            const baseY = p1.y + (p2.y - p1.y) * t;
            
            // Deterministic offset based on position (no random)
            const offsetX = ((i * 7 + j * 3) % 10) - 5;
            const offsetY = ((i * 5 + j * 11) % 8) - 4;
            
            // Draw every other detail for cleaner look
            if ((i + j) % 2 === 0) {
                ctx.beginPath();
                ctx.arc(baseX + offsetX, baseY + offsetY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawSpawnExit() {
    // Spawn - Forest Gate (Green)
    const spawn = grid.gridToWorld(grid.spawnPoint.x, grid.spawnPoint.y);
    drawForestGate(spawn.x, spawn.y, '#4caf50', 'START');
    
    // Exit - Forest Gate (Red)
    const exit = grid.gridToWorld(grid.exitPoint.x, grid.exitPoint.y);
    drawForestGate(exit.x, exit.y, '#f44336', 'EXIT');
}

function drawForestGate(x, y, color, label) {
    ctx.save();
    
    // Gate posts
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x - 20, y - 25, 8, 50);
    ctx.fillRect(x + 12, y - 25, 8, 50);
    
    // Post tops (pointed)
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 25);
    ctx.lineTo(x - 16, y - 35);
    ctx.lineTo(x - 12, y - 25);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + 12, y - 25);
    ctx.lineTo(x + 16, y - 35);
    ctx.lineTo(x + 20, y - 25);
    ctx.fill();
    
    // Gate header
    ctx.fillStyle = color;
    ctx.fillRect(x - 22, y - 30, 44, 8);
    
    // Header decoration
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x - 20, y - 28, 40, 4);
    
    // Label background
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x - 25, y + 15, 50, 20);
    
    // Label text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y + 25);
    
    // Add some ivy/leaves on posts
    ctx.fillStyle = '#2e7d32';
    for (let i = 0; i < 5; i++) {
        const lx = x - 22 + Math.random() * 44;
        const ly = y - 20 + Math.random() * 40;
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawPreview() {
    if (!gameState.selectedTowerType) return;
    
    const gridPos = grid.worldToGrid(mouseX, mouseY);
    const worldPos = grid.gridToWorld(gridPos.x, gridPos.y);
    
    // Check if valid placement
    const isValid = grid.canBuild(gridPos.x, gridPos.y);
    
    // Draw range preview
    const towerType = TOWER_TYPES[gameState.selectedTowerType];
    ctx.beginPath();
    ctx.arc(worldPos.x, worldPos.y, towerType.range, 0, Math.PI * 2);
    ctx.fillStyle = isValid ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)';
    ctx.fill();
    ctx.strokeStyle = isValid ? 'rgba(46, 204, 113, 0.5)' : 'rgba(231, 76, 60, 0.5)';
    ctx.stroke();
    
    // Draw tower preview
    const size = 24;
    ctx.fillStyle = isValid ? towerType.color : '#555';
    ctx.fillRect(worldPos.x - size/2, worldPos.y - size/2, size, size);
    ctx.strokeStyle = isValid ? '#fff' : '#e74c3c';
    ctx.lineWidth = 2;
    ctx.strokeRect(worldPos.x - size/2, worldPos.y - size/2, size, size);
}

// ============================================
// INPUT HANDLING
// ============================================
function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    mouseX = (e.clientX - rect.left) * scaleX;
    mouseY = (e.clientY - rect.top) * scaleY;
    
    // Check for tower hover
    checkTowerHover();
}

function onMouseClick(e) {
    if (gameState.isGameOver || gameState.isVictory) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Check if clicking on existing tower
    const gridPos = grid.worldToGrid(x, y);
    const clickedTower = gameState.towers.find(t => t.gridX === gridPos.x && t.gridY === gridPos.y);
    
    if (clickedTower) {
        selectExistingTower(clickedTower);
        return;
    }
    
    // Build new tower
    if (gameState.selectedTowerType) {
        buildTower(gridPos.x, gridPos.y);
    }
}

function onRightClick(e) {
    e.preventDefault();
    cancelBuilding();
}

// Check if mouse is hovering over a tower and show tooltip
function checkTowerHover() {
    const gridPos = grid.worldToGrid(mouseX, mouseY);
    const hoveredTower = gameState.towers.find(t => t.gridX === gridPos.x && t.gridY === gridPos.y);
    
    const tooltip = document.getElementById('towerTooltip');
    
    if (hoveredTower && !gameState.selectedTowerType) {
        // Show tooltip
        tooltip.style.display = 'block';
        
        const effectiveDamage = hoveredTower.damage * (1 + hoveredTower.damageBonus);
        const effectiveSpeed = hoveredTower.attackSpeed * (1 + hoveredTower.attackSpeedBonus);
        const effectiveRange = hoveredTower.range * (1 + hoveredTower.rangeBonus);
        const effectiveReload = effectiveSpeed > 0 ? (1 / effectiveSpeed) : 0;

        // Build tooltip content
        let content = `
            <strong>${hoveredTower.type.name}</strong><br>
            <span style="color: #ffd54f">Level ${hoveredTower.level}</span> 
            ${hoveredTower.branch !== null ? '- ' + hoveredTower.type.branches[hoveredTower.branch].name : ''}<br>
            <hr style="margin: 5px 0; border-color: #5d4037;">
            <span style="color: #e74c3c">❤️ Damage: ${Math.floor(effectiveDamage)}</span><br>
            <span style="color: #3498db">⚡ Reload: ${effectiveSpeed > 0 ? effectiveReload.toFixed(2) + 's' : 'N/A'}</span><br>
            <span style="color: #2ecc71">📏 Range: ${Math.floor(effectiveRange)}</span><br>
        `;
        
        // Add special abilities info
        if (hoveredTower.hasPoison) {
            content += `<span style="color: #55efc4">☠️ Poison: ${hoveredTower.poisonDamage}/s</span><br>`;
        }
        if (hoveredTower.hasSlow) {
            content += `<span style="color: #74b9ff">❄️ Slow: ${Math.round(hoveredTower.slowAmount * 100)}%</span><br>`;
        }
        if (hoveredTower.chainTargets > 0) {
            content += `<span style="color: #ffeaa7">⚡ Chain: ${hoveredTower.chainTargets} targets</span><br>`;
        }
        if (hoveredTower.stunDuration > 0) {
            content += `<span style="color: #f1c40f">💫 Stun: ${hoveredTower.stunDuration}s</span><br>`;
        }
        if (hoveredTower.hasSplash) {
            content += `<span style="color: #e67e22">💥 Splash Damage</span><br>`;
        }
        
        // Add elemental effects
        if (hoveredTower.hasFire) {
            content += `<span style="color: #ff6b35">🔥 Fire Damage</span><br>`;
        }
        if (hoveredTower.hasIce) {
            content += `<span style="color: #74b9ff">❄️ Ice Effects</span><br>`;
        }
        if (hoveredTower.hasLightning) {
            content += `<span style="color: #ffeaa7">⚡ Lightning</span><br>`;
        }
        if (hoveredTower.hasNature) {
            content += `<span style="color: #55efc4">🌿 Nature</span><br>`;
        }
        if (hoveredTower.hasShadow) {
            content += `<span style="color: #a29bfe">🌑 Shadow</span><br>`;
        }
        
        tooltip.innerHTML = content;

        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        const towerScreenX = rect.left + (hoveredTower.position.x / scaleX);
        const towerScreenY = rect.top + (hoveredTower.position.y / scaleY);
        const tooltipRect = tooltip.getBoundingClientRect();
        const offset = 18;
        const margin = 8;

        let left = towerScreenX + offset;
        let top = towerScreenY - (tooltipRect.height / 2);

        if (left + tooltipRect.width > window.innerWidth - margin) {
            left = towerScreenX - tooltipRect.width - offset;
        }

        left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));
        top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    } else {
        // Hide tooltip
        tooltip.style.display = 'none';
    }
}

function onKeyDown(e) {
    switch (e.key) {
        case '1':
            selectTower('archer');
            break;
        case '2':
            selectTower('crystal');
            break;
        case '3':
            selectTower('vault');
            break;
        case ' ':
            togglePause();
            break;
        case 'f':
        case 'F':
            toggleSpeed();
            break;
        case 'Escape':
            cancelBuilding();
            break;
    }
}


// ============================================
// GAME ACTIONS
// ============================================
function selectTower(type) {
    gameState.selectedTowerType = type.toUpperCase();
    gameState.selectedTower = null;
    
    // Update Desktop UI
    document.querySelectorAll('.tower-btn').forEach(btn => btn.classList.remove('selected'));
    const desktopBtn = document.getElementById(`btn${type.charAt(0).toUpperCase() + type.slice(1)}`);
    if (desktopBtn) desktopBtn.classList.add('selected');
    
    // Update Mobile UI
    document.querySelectorAll('.mobile-tower-btn').forEach(btn => btn.classList.remove('selected'));
    const mobileBtn = document.getElementById(`mobileBtn${type.charAt(0).toUpperCase() + type.slice(1)}`);
    if (mobileBtn) mobileBtn.classList.add('selected');
    
    // Hide upgrade panel
    document.getElementById('upgradePanel').classList.remove('active');
}

function selectExistingTower(tower) {
    gameState.selectedTower = tower;
    gameState.selectedTowerType = null;
    
    // Update UI
    document.querySelectorAll('.tower-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.mobile-tower-btn').forEach(btn => btn.classList.remove('selected'));
    
    // Show upgrade panel
    const panel = document.getElementById('upgradePanel');
    panel.classList.add('active');
    
    // Update tower info
    const info = document.getElementById('selectedTowerInfo');
    const effectiveDamage = tower.damage * (1 + tower.damageBonus);
    const effectiveSpeed = tower.attackSpeed * (1 + tower.attackSpeedBonus);
    const effectiveRange = tower.range * (1 + tower.rangeBonus);
    const effectiveReload = effectiveSpeed > 0 ? (1 / effectiveSpeed) : 0;

    info.innerHTML = `
        <strong>${tower.type.name}</strong><br>
        Level ${tower.level} - ${tower.branch !== null ? tower.type.branches[tower.branch].name : 'Base'}<br>
        Damage: ${Math.floor(effectiveDamage)}<br>
        Reload: ${effectiveSpeed > 0 ? effectiveReload.toFixed(2) + 's' : 'N/A'}<br>
        Range: ${Math.floor(effectiveRange)}
    `;
    
    // Update upgrade buttons
    const container = document.getElementById('upgradeButtons');
    container.innerHTML = '';
    
    if (tower.level < 4) {
        for (let i = 0; i < tower.type.branches.length; i++) {
            const branch = tower.type.branches[i];
            const canUpgrade = tower.branch === null || tower.branch === i;
            const upgradeIndex = tower.branch === i ? tower.upgradeLevel : 0;
            
            if (canUpgrade && upgradeIndex < branch.upgrades.length) {
                const upgrade = branch.upgrades[upgradeIndex];
                const btn = document.createElement('button');
                const canAfford = gameState.gold >= upgrade.cost;
                btn.className = 'upgrade-btn' + (canAfford ? ' affordable' : '');
                btn.innerHTML = `
                    <strong>${branch.name} ${upgradeIndex + 1}</strong><br>
                    <small>${upgrade.description}</small><br>
                    <strong>${upgrade.cost}g</strong>
                `;
                btn.onclick = () => upgradeTower(i);
                btn.disabled = !canAfford;
                container.appendChild(btn);
            }
        }
    } else {
        container.innerHTML = '<div style="text-align: center; color: #2ecc71;">Max Level Reached!</div>';
    }
}

function buildTower(x, y) {
    if (!gameState.selectedTowerType) return;
    
    const towerType = TOWER_TYPES[gameState.selectedTowerType];
    
    // Check cost
    if (gameState.gold < towerType.cost) {
        createFloatingText(mouseX, mouseY, "Not enough gold!", "#e74c3c");
        return;
    }
    
    // Check vault limit
    if (gameState.selectedTowerType === 'VAULT' && gameState.vaultCount >= towerType.maxCount) {
        createFloatingText(mouseX, mouseY, "Max vaults built!", "#e74c3c");
        return;
    }
    
    // Check placement
    if (!grid.canBuild(x, y)) {
        createFloatingText(mouseX, mouseY, "Cannot build here!", "#e74c3c");
        return;
    }
    
    // Place tower on grid
    if (!grid.placeTower(x, y)) {
        createFloatingText(mouseX, mouseY, "Invalid placement!", "#e74c3c");
        return;
    }
    
    // Recalculate path
    const pathValid = grid.calculatePath();
    if (!pathValid) {
        grid.removeTower(x, y);
        createFloatingText(mouseX, mouseY, "Blocks path!", "#e74c3c");
        return;
    }
    
    // Build tower
    gameState.gold -= towerType.cost;
    const tower = new Tower(gameState.selectedTowerType, x, y);
    gameState.towers.push(tower);
    
    if (gameState.selectedTowerType === 'VAULT') {
        gameState.vaultCount++;
    }
    
    // Play build sound
    if (audioManager) audioManager.playSFX('build');
    
    createExplosion(tower.position.x, tower.position.y, tower.type.color);
    createFloatingText(tower.position.x, tower.position.y - 20, `-${towerType.cost}g`, "#e74c3c");
}

function upgradeTower(branchIndex) {
    if (!gameState.selectedTower) return;
    
    const success = gameState.selectedTower.upgrade(branchIndex);
    if (success) {
        // Play upgrade sound
        if (audioManager) audioManager.playSFX('upgrade');
        selectExistingTower(gameState.selectedTower);
    }
}

function sellSelectedTower() {
    if (!gameState.selectedTower) return;
    
    const tower = gameState.selectedTower;
    const sellValue = tower.getSellValue();
    
    // Remove from grid
    grid.removeTower(tower.gridX, tower.gridY);
    
    // Remove from game
    gameState.towers = gameState.towers.filter(t => t !== tower);
    
    if (tower.typeKey === 'VAULT') {
        gameState.vaultCount--;
    }
    
    // Recalculate path
    grid.calculatePath();
    
    // Refund gold
    gameState.gold += sellValue;
    createFloatingText(tower.position.x, tower.position.y, `+${sellValue}g`, "#f1c40f");
    
    // Hide panel and reset
    closeUpgradePanel();
}

function cancelBuilding() {
    gameState.selectedTowerType = null;
    gameState.selectedTower = null;
    document.querySelectorAll('.tower-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.mobile-tower-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('upgradePanel').classList.remove('active');
}

function closeUpgradePanel() {
    document.getElementById('upgradePanel').classList.remove('active');
    gameState.selectedTower = null;
}

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
}

function toggleSpeed() {
    gameState.gameSpeed = gameState.gameSpeed === 1 ? 2 : 1;
}

function startNextWave() {
    waveManager.skipPreparation();
}

// ============================================
// UI UPDATES
// ============================================
function updateUI() {
    // Desktop Resources
    const goldDisplay = document.getElementById('goldDisplay');
    const livesDisplay = document.getElementById('livesDisplay');
    const waveDisplay = document.getElementById('waveDisplay');
    const timerDisplay = document.getElementById('timerDisplay');
    const enemiesDisplay = document.getElementById('enemiesDisplay');
    
    if (goldDisplay) goldDisplay.textContent = gameState.gold;
    if (livesDisplay) {
        livesDisplay.textContent = gameState.lives;
        livesDisplay.className = gameState.lives <= 5 ? 'stat-value warning' : 'stat-value';
    }
    if (waveDisplay) waveDisplay.textContent = `${waveManager.currentWave}/${gameState.maxWaves}`;
    
    // Timer
    if (timerDisplay) {
        if (waveManager.waveActive) {
            timerDisplay.textContent = "In Progress";
        } else {
            timerDisplay.textContent = Math.ceil(waveManager.preparationTimer) + "s";
        }
    }
    
    // Enemies
    const aliveEnemies = gameState.enemies.filter(e => !e.isDead && !e.reachedExit).length;
    if (enemiesDisplay) enemiesDisplay.textContent = aliveEnemies;
    
    // Desktop Tower Buttons
    const btnArcher = document.getElementById('btnArcher');
    const btnCrystal = document.getElementById('btnCrystal');
    const btnVault = document.getElementById('btnVault');
    
    if (btnArcher) btnArcher.disabled = gameState.gold < TOWER_TYPES.ARCHER.cost;
    if (btnCrystal) btnCrystal.disabled = gameState.gold < TOWER_TYPES.CRYSTAL.cost;
    if (btnVault) btnVault.disabled = gameState.gold < TOWER_TYPES.VAULT.cost || gameState.vaultCount >= 3;
    
    // Update upgrade button highlights
    updateUpgradeHighlights();
    
    // Mobile UI Updates
    const mobileGold = document.getElementById('mobileGold');
    const mobileLives = document.getElementById('mobileLives');
    const mobileWave = document.getElementById('mobileWave');
    const mobileBtnArcher = document.getElementById('mobileBtnArcher');
    const mobileBtnCrystal = document.getElementById('mobileBtnCrystal');
    const mobileBtnVault = document.getElementById('mobileBtnVault');
    
    if (mobileGold) mobileGold.textContent = gameState.gold;
    if (mobileLives) mobileLives.textContent = gameState.lives;
    if (mobileWave) mobileWave.textContent = `${waveManager.currentWave}/${gameState.maxWaves}`;
    
    // Mobile Tower Buttons
    if (mobileBtnArcher) mobileBtnArcher.disabled = gameState.gold < TOWER_TYPES.ARCHER.cost;
    if (mobileBtnCrystal) mobileBtnCrystal.disabled = gameState.gold < TOWER_TYPES.CRYSTAL.cost;
    if (mobileBtnVault) mobileBtnVault.disabled = gameState.gold < TOWER_TYPES.VAULT.cost || gameState.vaultCount >= 3;
    
    // Update selected state on mobile buttons
    if (mobileBtnArcher) mobileBtnArcher.classList.toggle('selected', gameState.selectedTowerType === 'ARCHER');
    if (mobileBtnCrystal) mobileBtnCrystal.classList.toggle('selected', gameState.selectedTowerType === 'CRYSTAL');
    if (mobileBtnVault) mobileBtnVault.classList.toggle('selected', gameState.selectedTowerType === 'VAULT');
}

// Update upgrade button highlights based on current gold
function updateUpgradeHighlights() {
    const container = document.getElementById('upgradeButtons');
    if (!container) return;
    
    const buttons = container.querySelectorAll('.upgrade-btn');
    buttons.forEach(btn => {
        const costMatch = btn.innerHTML.match(/>(\d+)g</);
        if (costMatch) {
            const cost = parseInt(costMatch[1]);
            const canAfford = gameState.gold >= cost;
            btn.classList.toggle('affordable', canAfford);
            btn.disabled = !canAfford;
        }
    });
}

// ============================================
// GAME STATE FUNCTIONS
// ============================================
function checkWaveCompletion() {
    // This is called when an enemy dies
    // Wave completion is handled in waveManager.update()
}

function gameOver() {
    gameState.isGameOver = true;
    document.getElementById('finalWave').textContent = waveManager.currentWave;
    document.getElementById('gameOverScreen').classList.add('active');
    
    // Play game over sound
    if (audioManager) audioManager.playSFX('gameOver');
}

function victory() {
    gameState.isVictory = true;
    document.getElementById('victoryScreen').classList.add('active');
    
    // Play victory sound
    if (audioManager) audioManager.playSFX('victory');
    
    // Unlock boss rush mode
    if (elementManager && waveManager.currentWave >= 30) {
        elementManager.unlockBossRush();
    }
}

function restartGame() {
    // Reset game state
    gameState.gold = 200;
    gameState.lives = 25;
    gameState.wave = 0;
    gameState.isPaused = false;
    gameState.gameSpeed = 1;
    gameState.isGameOver = false;
    gameState.isVictory = false;
    gameState.selectedTowerType = null;
    gameState.selectedTower = null;
    gameState.enemies = [];
    gameState.towers = [];
    gameState.projectiles = [];
    gameState.particles = [];
    gameState.vaultCount = 0;
    
    // Reset grid
    grid = new Grid();
    
    // Reset wave manager
    waveManager = new WaveManager();
    waveManager.preparationTimer = waveManager.preparationTime;
    
    // Hide end screens
    document.getElementById('gameOverScreen').classList.remove('active');
    document.getElementById('victoryScreen').classList.remove('active');
    document.getElementById('upgradePanel').classList.remove('active');
    
    // Reset boss rush mode
    if (bossRushMode) {
        bossRushMode.reset();
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function createExplosion(x, y, color) {
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const speed = 50 + Math.random() * 50;
        const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        gameState.particles.push(new Particle(x, y, color, velocity, 0.5 + Math.random() * 0.5));
    }
}

function createDamageParticle(x, y, damage) {
    const velocity = {
        x: (Math.random() - 0.5) * 20,
        y: -30 - Math.random() * 20
    };
    gameState.particles.push(new Particle(x, y, '#fff', velocity, 0.5));
}

function createFloatingText(x, y, text, color) {
    gameState.particles.push(new FloatingText(x, y, text, color));
}

// ============================================
// START GAME
// ============================================
window.onload = init;
