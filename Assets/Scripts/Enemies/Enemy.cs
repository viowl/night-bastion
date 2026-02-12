using UnityEngine;
using System.Collections.Generic;

namespace TowerDefense.Core
{
    public abstract class Enemy : MonoBehaviour
    {
        [Header("Configuration")]
        public EnemyData enemyData;
        
        [Header("Runtime Stats")]
        [SerializeField] protected float currentHealth;
        [SerializeField] protected float currentSpeed;
        [SerializeField] protected List<Vector3> currentPath;
        [SerializeField] protected int currentPathIndex;
        [SerializeField] protected bool isMoving = false;
        [SerializeField] protected int currentWave;
        
        protected SpriteRenderer spriteRenderer;
        protected Rigidbody2D rb;
        protected bool isDead = false;
        
        // Status effects
        protected float slowMultiplier = 1f;
        protected float slowDuration = 0f;
        protected bool isStunned = false;
        protected float stunDuration = 0f;
        protected float armorModifier = 0f;
        
        public EnemyType EnemyType => enemyData?.enemyType ?? EnemyType.Grunt;
        public ArmorType ArmorType => enemyData?.armorType ?? ArmorType.Light;
        public float CurrentHealth => currentHealth;
        public float MaxHealth => CalculateHealth();
        public bool IsDead => isDead;
        public bool IsMoving => isMoving;
        
        protected virtual void Awake()
        {
            spriteRenderer = GetComponent<SpriteRenderer>();
            rb = GetComponent<Rigidbody2D>();
        }
        
        public virtual void Initialize(List<Vector3> path, int waveNumber)
        {
            currentPath = path;
            currentPathIndex = 0;
            currentWave = waveNumber;
            isDead = false;
            isMoving = true;
            
            // Calculate scaled stats
            currentHealth = CalculateHealth();
            currentSpeed = CalculateSpeed();
            
            // Reset status effects
            slowMultiplier = 1f;
            slowDuration = 0f;
            isStunned = false;
            stunDuration = 0f;
            armorModifier = 0f;
            
            // Set position to start of path
            if (currentPath != null && currentPath.Count > 0)
            {
                transform.position = currentPath[0];
            }
            
            // Apply visual
            if (spriteRenderer != null && enemyData != null)
            {
                spriteRenderer.sprite = enemyData.sprite;
                spriteRenderer.color = enemyData.color;
                transform.localScale = enemyData.scale;
            }
            
            GameEvents.OnEnemySpawned?.Invoke(this);
        }
        
        protected virtual float CalculateHealth()
        {
            if (enemyData == null) return 50f;
            return enemyData.baseHealth * Mathf.Pow(1.15f, currentWave);
        }
        
        protected virtual float CalculateSpeed()
        {
            if (enemyData == null) return 3.5f;
            return enemyData.baseSpeed * (1 + currentWave * 0.02f);
        }
        
        protected virtual void Update()
        {
            if (isDead || !isMoving) return;
            
            HandleStatusEffects();
            
            if (!isStunned)
            {
                MoveAlongPath();
            }
        }
        
        protected virtual void HandleStatusEffects()
        {
            // Handle slow
            if (slowDuration > 0)
            {
                slowDuration -= Time.deltaTime;
                if (slowDuration <= 0)
                {
                    slowMultiplier = 1f;
                }
            }
            
            // Handle stun
            if (stunDuration > 0)
            {
                stunDuration -= Time.deltaTime;
                if (stunDuration <= 0)
                {
                    isStunned = false;
                }
            }
        }
        
        protected virtual void MoveAlongPath()
        {
            if (currentPath == null || currentPathIndex >= currentPath.Count)
            {
                ReachExit();
                return;
            }
            
            Vector3 targetPosition = currentPath[currentPathIndex];
            Vector3 direction = (targetPosition - transform.position).normalized;
            float actualSpeed = currentSpeed * slowMultiplier;
            
            // Move towards target
            transform.position += direction * actualSpeed * Time.deltaTime;
            
            // Check if reached waypoint
            if (Vector3.Distance(transform.position, targetPosition) < 0.1f)
            {
                currentPathIndex++;
            }
            
            // Face movement direction
            if (direction.x != 0)
            {
                spriteRenderer.flipX = direction.x < 0;
            }
        }
        
        public virtual void TakeDamage(float damage, DamageType damageType)
        {
            if (isDead) return;
            
            float finalDamage = CalculateDamage(damage, damageType);
            currentHealth -= finalDamage;
            
            // Visual feedback
            ShowDamageEffect();
            
            if (currentHealth <= 0)
            {
                Die();
            }
        }
        
        protected virtual float CalculateDamage(float baseDamage, DamageType damageType)
        {
            float multiplier = DamageCalculator.GetMultiplier(ArmorType, damageType);
            return baseDamage * multiplier;
        }
        
        protected virtual void ShowDamageEffect()
        {
            // Flash white
            if (spriteRenderer != null)
            {
                StartCoroutine(DamageFlash());
            }
        }
        
        private System.Collections.IEnumerator DamageFlash()
        {
            Color originalColor = spriteRenderer.color;
            spriteRenderer.color = Color.white;
            yield return new WaitForSeconds(0.05f);
            spriteRenderer.color = originalColor;
        }
        
        public virtual void ApplyDebuff(DebuffType type, float duration, float value)
        {
            switch (type)
            {
                case DebuffType.Slow:
                    slowMultiplier = Mathf.Min(slowMultiplier, value);
                    slowDuration = Mathf.Max(slowDuration, duration);
                    break;
                    
                case DebuffType.Stun:
                    isStunned = true;
                    stunDuration = Mathf.Max(stunDuration, duration);
                    break;
                    
                case DebuffType.ArmorReduction:
                    armorModifier = value;
                    break;
            }
        }
        
        public virtual void ApplyPoison(float damagePerSecond, float duration)
        {
            StartCoroutine(PoisonEffect(damagePerSecond, duration));
        }
        
        private System.Collections.IEnumerator PoisonEffect(float damagePerSecond, float duration)
        {
            float elapsed = 0f;
            while (elapsed < duration && !isDead)
            {
                yield return new WaitForSeconds(1f);
                elapsed += 1f;
                TakeDamage(damagePerSecond, DamageType.Pure);
            }
        }
        
        protected virtual void Die()
        {
            if (isDead) return;
            isDead = true;
            isMoving = false;
            
            // Award gold
            int reward = enemyData?.goldReward ?? 8;
            GameManager.Instance.AddGold(reward);
            
            // Spawn effect
            if (enemyData?.deathEffectPrefab != null)
            {
                Instantiate(enemyData.deathEffectPrefab, transform.position, Quaternion.identity);
            }
            
            GameEvents.OnEnemyKilled?.Invoke(this);
            
            // Return to pool
            ObjectPool.Instance?.ReturnEnemy(this);
        }
        
        protected virtual void ReachExit()
        {
            if (isDead) return;
            isDead = true;
            isMoving = false;
            
            // Deduct lives
            int livesCost = enemyData?.livesCost ?? 1;
            GameManager.Instance.LoseLife(livesCost);
            
            GameEvents.OnEnemyReachedExit?.Invoke(this);
            
            // Return to pool
            ObjectPool.Instance?.ReturnEnemy(this);
        }
        
        public virtual float GetDistanceToExit()
        {
            if (currentPath == null || currentPathIndex >= currentPath.Count)
                return 0f;
            
            float distance = Vector3.Distance(transform.position, currentPath[currentPathIndex]);
            
            for (int i = currentPathIndex; i < currentPath.Count - 1; i++)
            {
                distance += Vector3.Distance(currentPath[i], currentPath[i + 1]);
            }
            
            return distance;
        }
    }
}