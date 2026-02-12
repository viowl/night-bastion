# Guardians of the Realm - Setup Guide

## Phase 1 Complete: Core Systems Implemented

### What Has Been Built

#### 1. Core Systems

- **GameManager.cs** - Game state, gold, lives, pause/restart
- **EventBus (GameEvents.cs)** - Decoupled event system
- **GridManager.cs** - 20x12 grid with pathfinding
- **PathfindingManager.cs** - A\* algorithm with caching
- **ObjectPool.cs** - Enemy and projectile pooling

#### 2. Enemy System

- **Enemy.cs** - Base enemy with health, movement, damage
- **EnemyTracker.cs** - Tracks all active enemies
- **Enemy Types**:
  - Grunt (basic)
  - Runner (speed boost when damaged)
  - Tank (heavy, blocks path)
  - Flyer (ignores maze)
  - Boss (abilities: roar, shell, summon)

#### 3. Wave System

- **WaveManager.cs** - Wave sequencing, preparation phase
- **WaveData.cs** - ScriptableObject for wave configuration
- **5 Waves Defined** (see GDD)

#### 4. Combat System

- **DamageCalculator.cs** - Type effectiveness matrix
- **Projectile.cs** - Homing projectiles
- Status effects (slow, stun, poison, armor reduction)

#### 5. Tower System

- **BaseTower.cs** - Abstract base with targeting
- **ArcherTower.cs** - Complete implementation with all 3 branches:
  - Branch A: Sniper (crit, armor pen, flying)
  - Branch B: Rapid Fire (splash, multi-target, ricochet)
  - Branch C: Poisoner (DoT, slow, armor reduction, explosion)
- **SynergyManager.cs** - Combo detection system

#### 6. Input & Building

- **BuildController.cs** - Tower placement, preview, selling
- Grid-based building with snap
- Path validation

#### 7. UI System

- **GameHUD.cs** - Gold, lives, wave, timer, tower buttons
- **UpgradePanel.cs** - Tower selection, upgrades, selling
- **TooltipSystem.cs** - Hover tooltips
- **UIManager.cs** - Central UI coordinator

---

## How to Set Up in Unity

### Step 1: Create the Project

1. Open Unity Hub
2. Create New Project → 2D (URP)
3. Unity Version: 2022.3 LTS
4. Import TextMeshPro when prompted

### Step 2: Create Folder Structure

Create these folders in Assets:

```
Scripts/Core
Scripts/Towers
Scripts/Enemies
Scripts/Combat
Scripts/Economy
Scripts/UI
Scripts/Input
Prefabs/Towers
Prefabs/Enemies
Prefabs/Projectiles
ScriptableObjects/TowerData
ScriptableObjects/EnemyData
ScriptableObjects/WaveData
Scenes
```

### Step 3: Copy Scripts

Copy all .cs files from this project into the appropriate folders.

### Step 4: Create ScriptableObjects

#### Create ArcherTower Data:

1. Right-click → Create → Tower Defense → Tower Data
2. Name: "ArcherTower"
3. Fill in values from GDD section 3

#### Create Enemy Data (5 files):

1. Right-click → Create → Tower Defense → Enemy Data
2. Create for: Grunt, Runner, Tank, Flyer, Boss
3. Fill stats from GDD section 4

#### Create Wave Data (5 files):

1. Right-click → Create → Tower Defense → Wave Data
2. Create: Wave1 through Wave5
3. Fill enemy compositions from GDD

### Step 5: Create Prefabs

#### Archer Tower Prefab:

1. Create Empty GameObject → Name: "ArcherTower"
2. Add Components:
   - ArcherTower script
   - SpriteRenderer
   - CircleCollider2D (isTrigger = true)
3. Save as Prefab in Prefabs/Towers

#### Enemy Prefabs (5):

1. Create Empty GameObject → Name: "Grunt"
2. Add Components:
   - GruntEnemy script
   - SpriteRenderer
   - Rigidbody2D (kinematic)
3. Add CircleCollider2D (for clicking)
4. Save as Prefab in Prefabs/Enemies
5. Repeat for Runner, Tank, Flyer, Boss

#### Projectile Prefab:

1. Create Empty GameObject → Name: "Arrow"
2. Add Components:
   - Projectile script
   - SpriteRenderer
   - CircleCollider2D (isTrigger = true)
3. Save as Prefab in Prefabs/Projectiles

### Step 6: Build the Scene

#### Create Game Scene:

1. Open Scenes/SampleScene (or create Game scene)
2. Create Empty GameObject → Name: "GameManager" → Add GameManager script
3. Create Empty GameObject → Name: "GridManager" → Add GridManager script
4. Create Empty GameObject → Name: "PathfindingManager" → Add PathfindingManager script
5. Create Empty GameObject → Name: "WaveManager" → Add WaveManager script
6. Create Empty GameObject → Name: "EnemyTracker" → Add EnemyTracker script
7. Create Empty GameObject → Name: "ObjectPool" → Add ObjectPool script
8. Create Empty GameObject → Name: "SynergyManager" → Add SynergyManager script
9. Create Empty GameObject → Name: "BuildController" → Add BuildController script
10. Create Empty GameObject → Name: "UIManager" → Add UIManager, GameHUD, UpgradePanel, TooltipSystem scripts

#### Set Up GridManager:

- Grid Width: 20
- Grid Height: 12
- Cell Size: 2

#### Set Up PathfindingManager:

1. Create Empty GameObject → Name: "SpawnPoint"
2. Position: (-20, 0, 0)
3. Create Empty GameObject → Name: "ExitPoint"
4. Position: (40, 0, 0)
5. Assign to PathfindingManager

#### Set Up ObjectPool:

Configure pools for:

- Grunt (size: 50)
- Runner (size: 30)
- Tank (size: 20)
- Flyer (size: 30)
- Boss (size: 5)
- Arrow (size: 100)

#### Set Up BuildController:

- Assign Tower Prefabs array (size: 1, add ArcherTower prefab)
- Assign Tower Data array (size: 1, add ArcherTower data)
- Create simple sprite for build preview

#### Set Up UI:

1. Create Canvas (Screen Space - Overlay)
2. Create GameHUD panel with:
   - Gold text
   - Lives text
   - Wave text
   - Timer text
   - Tower buttons (3)
   - Speed button
   - Pause button
3. Create UpgradePanel (hidden by default)
4. Create GameOver/Victory panels (hidden)

### Step 7: Configure Camera

1. Main Camera:
   - Position: (20, 11, -10)
   - Size: 15 (orthographic)
2. Background color: Dark blue or gray

### Step 8: Add Sprites (Placeholder)

Create simple colored squares:

- Tower: Brown square
- Enemy Grunt: Red circle
- Enemy Runner: Orange circle
- Enemy Tank: Dark red large circle
- Enemy Flyer: Purple circle
- Enemy Boss: Black large circle
- Path: Gray tiles
- Buildable: Green tint

### Step 9: Test

1. Press Play
2. You should see:
   - Grid (if debug enabled)
   - HUD with gold/lives/wave
   - Countdown to wave 1
3. Click Archer Tower button
4. Click on grid to build
5. Watch enemies spawn and move
6. Towers should attack
7. Gold should increase on kills

---

## Scripts Overview

### Core Scripts (8 files)

- `GameEvents.cs` - Event definitions
- `Enums.cs` - All enums
- `GameManager.cs` - Game state
- `GridManager.cs` - Grid system
- `PathfindingManager.cs` - A\* pathfinding
- `ObjectPool.cs` - Object pooling
- `TowerData.cs` - Tower configuration
- `WaveData.cs` - Wave configuration

### Enemy Scripts (6 files)

- `Enemy.cs` - Base enemy
- `EnemyTracker.cs` - Enemy tracking
- `EnemyData.cs` - Enemy configuration
- `GruntEnemy.cs`, `RunnerEnemy.cs`, `TankEnemy.cs`, `FlyerEnemy.cs`, `BossEnemy.cs`

### Tower Scripts (3 files)

- `BaseTower.cs` - Tower base
- `ArcherTower.cs` - Archer implementation
- `SynergyManager.cs` - Combo system

### Combat Scripts (2 files)

- `DamageCalculator.cs` - Type matrix
- `Projectile.cs` - Projectiles

### Input Scripts (1 file)

- `BuildController.cs` - Building system

### UI Scripts (4 files)

- `UIManager.cs` - UI coordinator
- `GameHUD.cs` - Main HUD
- `UpgradePanel.cs` - Upgrade UI
- `TooltipSystem.cs` - Tooltips

**Total: 24 script files**

---

## Next Steps (Phase 2-4)

### Phase 2: Combat Polish

- [ ] Add visual effects
- [ ] Add sound effects
- [ ] Balance damage/health
- [ ] Test all upgrade branches

### Phase 3: Additional Content

- [ ] Crystal Tower (area damage, slow, aura)
- [ ] Gold Vault (economy)
- [ ] Implement synergies
- [ ] Add more enemy variety

### Phase 4: Polish

- [ ] Particle effects
- [ ] Better sprites
- [ ] Sound effects
- [ ] Balance passes
- [ ] Bug fixes

---

## Debugging Tips

1. **Enable Grid Debug**: Check GridManager.showGrid in inspector
2. **Path Visualization**: Check showPath to see enemy routes
3. **Log Events**: Add Debug.Log statements in GameEvents
4. **Check Colliders**: Ensure triggers are set correctly
5. **Layer Masks**: Set up proper physics layers

## Common Issues

1. **Enemies not moving**: Check pathfinding, ensure path exists
2. **Towers not attacking**: Check collider radius, trigger settings
3. **Can't build**: Check grid validity, path blocking logic
4. **UI not updating**: Ensure event subscriptions are correct
5. **Performance**: Enable object pooling, limit particle effects

---

## Key Features Implemented

✅ A\* Pathfinding with dynamic recalculation
✅ Object pooling for performance
✅ Damage type system (Physical/Magic/Pure)
✅ Armor type system (Light/Heavy/MagicImmune/Ethereal)
✅ Branching upgrade trees (3 paths per tower)
✅ Status effects (poison, slow, stun, armor reduction)
✅ Special abilities (crit, splash, multi-target, ricochet)
✅ Wave system with preparation phase
✅ Economy system with interest
✅ Grid-based building
✅ Maze building (influences path)
✅ UI for building and upgrading
✅ Event-driven architecture

---

Ready to test and expand!
