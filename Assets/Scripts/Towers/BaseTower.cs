using UnityEngine;
using System.Collections.Generic;

namespace TowerDefense.Core
{
    public abstract class BaseTower : MonoBehaviour
    {
        [Header("Configuration")]
        public TowerData towerData;
        
        [Header("Runtime Stats")]
        [SerializeField] protected int currentLevel = 1;
        [SerializeField] protected UpgradePath currentPath = UpgradePath.None;
        [SerializeField] protected float currentDamage;
        [SerializeField] protected float currentAttackSpeed;
        [SerializeField] protected float currentRange;
        [SerializeField] protected float attackCooldown = 0f;
        [SerializeField] protected bool canTargetFlying = false;
        
        protected List<Enemy> enemiesInRange = new List<Enemy>();
        protected SpriteRenderer spriteRenderer;
        protected CircleCollider2D rangeCollider;
        protected Enemy currentTarget;
        protected Vector2Int gridPosition;
        
        public TowerType TowerType => towerData?.towerType ?? TowerType.Archer;
        public DamageType DamageType => towerData?.damageType ?? DamageType.Physical;
        public int CurrentLevel => currentLevel;
        public UpgradePath CurrentPath => currentPath;
        public float CurrentDamage => currentDamage;
        public float CurrentRange => currentRange;
        public float CurrentAttackSpeed => currentAttackSpeed;
        public bool CanTargetFlying => canTargetFlying;
        public Vector2Int GridPosition => gridPosition;
        public int TotalInvestedGold => CalculateTotalInvestment();
        
        public System.Action OnTowerUpgraded;
        public System.Action<Enemy> OnTargetAcquired;
        
        protected virtual void Awake()
        {
            spriteRenderer = GetComponent<SpriteRenderer>();
            rangeCollider = GetComponent<CircleCollider2D>();
            
            if (rangeCollider == null)
            {
                rangeCollider = gameObject.AddComponent<CircleCollider2D>();
                rangeCollider.isTrigger = true;
            }
        }
        
        protected virtual void Start()
        {
            InitializeStats();
            UpdateRangeCollider();
            
            GameEvents.OnEnemySpawned += OnEnemySpawned;
            GameEvents.OnEnemyKilled += OnEnemyDied;
        }
        
        protected virtual void OnDestroy()
        {
            GameEvents.OnEnemySpawned -= OnEnemySpawned;
            GameEvents.OnEnemyKilled -= OnEnemyDied;
        }
        
        public virtual void Initialize(Vector2Int gridPos)
        {
            gridPosition = gridPos;
        }
        
        protected virtual void InitializeStats()
        {
            if (towerData == null) return;
            
            currentDamage = towerData.baseDamage;
            currentAttackSpeed = towerData.baseAttackSpeed;
            currentRange = towerData.baseRange;
            canTargetFlying = towerData.canTargetFlying;
        }
        
        protected virtual void Update()
        {
            if (attackCooldown > 0)
                attackCooldown -= Time.deltaTime;
            
            UpdateTargeting();
            
            if (CanAttack())
                Attack();
        }
        
        protected virtual void UpdateTargeting()
        {
            // Remove dead/null enemies
            enemiesInRange.RemoveAll(e => e == null || e.IsDead);
            
            // Filter flying enemies if can't target them
            if (!canTargetFlying)
            {
                enemiesInRange.RemoveAll(e => e.EnemyType == EnemyType.Flyer);
            }
            
            // Sort by distance to exit (furthest first = closest to exit)
            enemiesInRange.Sort((a, b) => 
                b.GetDistanceToExit().CompareTo(a.GetDistanceToExit()));
            
            // Set current target
            if (enemiesInRange.Count > 0)
            {
                currentTarget = enemiesInRange[0];
            }
            else
            {
                currentTarget = null;
            }
        }
        
        protected virtual bool CanAttack()
        {
            return attackCooldown <= 0 && currentTarget != null;
        }
        
        public abstract void Attack();
        
        public virtual bool Upgrade(UpgradePath path)
        {
            if (currentLevel >= 4) return false;
            
            var branch = GetUpgradeBranch(path);
            if (branch == null || currentLevel - 1 >= branch.levels.Length) return false;
            
            var upgrade = branch.levels[currentLevel - 1];
            
            if (!GameManager.Instance.SpendGold(upgrade.cost))
                return false;
            
            currentPath = path;
            currentLevel++;
            
            ApplyUpgradeEffects(path, currentLevel);
            PlayUpgradeEffect();
            
            OnTowerUpgraded?.Invoke();
            GameEvents.OnTowerUpgraded?.Invoke(this, path, currentLevel);
            
            // Check for synergies
            SynergyManager.Instance?.CheckSynergies(this);
            
            return true;
        }
        
        protected UpgradeBranch GetUpgradeBranch(UpgradePath path)
        {
            if (towerData?.upgradeBranches == null) return null;
            
            foreach (var branch in towerData.upgradeBranches)
            {
                if (branch.path == path)
                    return branch;
            }
            return null;
        }
        
        protected abstract void ApplyUpgradeEffects(UpgradePath path, int level);
        
        protected virtual void PlayUpgradeEffect()
        {
            // Change sprite based on level
            if (towerData?.levelSprites != null && towerData.levelSprites.Length >= currentLevel)
            {
                spriteRenderer.sprite = towerData.levelSprites[currentLevel - 1];
            }
            
            // Spawn effect
            if (towerData?.upgradeEffectPrefab != null)
            {
                Instantiate(towerData.upgradeEffectPrefab, transform.position, Quaternion.identity);
            }
            
            // Play sound
            if (towerData?.upgradeSound != null)
            {
                AudioSource.PlayClipAtPoint(towerData.upgradeSound, transform.position);
            }
        }
        
        protected virtual void UpdateRangeCollider()
        {
            if (rangeCollider != null)
            {
                rangeCollider.radius = currentRange;
            }
        }
        
        private void OnEnemySpawned(Enemy enemy)
        {
            // Check if in range (will be handled by trigger)
        }
        
        private void OnEnemyDied(Enemy enemy)
        {
            enemiesInRange.Remove(enemy);
            if (currentTarget == enemy)
                currentTarget = null;
        }
        
        private void OnTriggerEnter2D(Collider2D other)
        {
            if (other.TryGetComponent<Enemy>(out var enemy))
            {
                if (!enemiesInRange.Contains(enemy))
                    enemiesInRange.Add(enemy);
            }
        }
        
        private void OnTriggerExit2D(Collider2D other)
        {
            if (other.TryGetComponent<Enemy>(out var enemy))
            {
                enemiesInRange.Remove(enemy);
                if (currentTarget == enemy)
                    currentTarget = null;
            }
        }
        
        protected virtual int CalculateTotalInvestment()
        {
            int total = towerData?.baseCost ?? 0;
            
            if (towerData?.upgradeBranches != null)
            {
                foreach (var branch in towerData.upgradeBranches)
                {
                    if (branch.path == currentPath)
                    {
                        for (int i = 0; i < currentLevel - 1 && i < branch.levels.Length; i++)
                        {
                            total += branch.levels[i].cost;
                        }
                        break;
                    }
                }
            }
            
            return total;
        }
        
        protected virtual void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(transform.position, towerData?.baseRange ?? 5f);
            
            if (currentTarget != null)
            {
                Gizmos.color = Color.red;
                Gizmos.DrawLine(transform.position, currentTarget.transform.position);
            }
        }
    }
}