using UnityEngine;
using System.Collections.Generic;

namespace TowerDefense.Towers
{
    public class ArcherTower : Core.BaseTower
    {
        [Header("Archer Settings")]
        public GameObject arrowPrefab;
        public Transform firePoint;
        
        // Upgrade-specific stats
        private bool hasSplashDamage = false;
        private float splashRadius = 0f;
        private bool canRicochet = false;
        private int ricochetTargets = 0;
        private float ricochetDamagePercent = 0.6f;
        private bool hasPoison = false;
        private float poisonDamage = 0f;
        private float poisonDuration = 0f;
        private int poisonStacks = 1;
        private float poisonSlowPercent = 0f;
        private float armorReduction = 0f;
        private bool poisonExplodes = false;
        private bool hasCrit = false;
        private float critChance = 0f;
        private float critMultiplier = 2f;
        private float armorPenetration = 0f;
        private int multiTargetCount = 1;
        
        protected override void Awake()
        {
            base.Awake();
            if (firePoint == null)
                firePoint = transform;
        }
        
        public override void Attack()
        {
            if (currentTarget == null) return;
            
            attackCooldown = 1f / currentAttackSpeed;
            
            if (multiTargetCount > 1)
            {
                // Attack multiple targets
                int targetsToHit = Mathf.Min(multiTargetCount, enemiesInRange.Count);
                for (int i = 0; i < targetsToHit; i++)
                {
                    if (i < enemiesInRange.Count && enemiesInRange[i] != null)
                    {
                        FireProjectile(enemiesInRange[i]);
                    }
                }
            }
            else
            {
                FireProjectile(currentTarget);
            }
            
            // Play sound
            if (towerData?.attackSound != null)
            {
                AudioSource.PlayClipAtPoint(towerData.attackSound, transform.position, 0.5f);
            }
        }
        
        private void FireProjectile(Core.Enemy target)
        {
            if (arrowPrefab == null)
            {
                // Direct damage (no projectile)
                DealDamage(target);
                return;
            }
            
            // Create projectile
            GameObject projectile = Instantiate(arrowPrefab, firePoint.position, Quaternion.identity);
            var proj = projectile.GetComponent<Combat.Projectile>();
            if (proj != null)
            {
                proj.Initialize(target, this, CalculateDamage());
            }
        }
        
        private void DealDamage(Core.Enemy target)
        {
            float damage = CalculateDamage();
            
            // Apply damage
            target.TakeDamage(damage, DamageType);
            
            // Apply effects
            if (hasPoison)
            {
                target.ApplyPoison(poisonDamage, poisonDuration);
                
                if (poisonSlowPercent > 0)
                {
                    target.ApplyDebuff(Core.DebuffType.Slow, poisonDuration, 1f - poisonSlowPercent);
                }
                
                if (armorReduction > 0)
                {
                    target.ApplyDebuff(Core.DebuffType.ArmorReduction, poisonDuration, armorReduction);
                }
            }
            
            // Splash damage
            if (hasSplashDamage && splashRadius > 0)
            {
                ApplySplashDamage(target.transform.position, damage);
            }
            
            // Ricochet
            if (canRicochet && ricochetTargets > 0)
            {
                ApplyRicochet(target, damage);
            }
        }
        
        private float CalculateDamage()
        {
            float damage = currentDamage;
            
            // Critical hit
            if (hasCrit && Random.value < critChance)
            {
                damage *= critMultiplier;
            }
            
            return damage;
        }
        
        private void ApplySplashDamage(Vector3 center, float baseDamage)
        {
            var nearbyEnemies = Core.EnemyTracker.Instance.GetEnemiesInRange(center, splashRadius);
            foreach (var enemy in nearbyEnemies)
            {
                if (enemy != currentTarget)
                {
                    enemy.TakeDamage(baseDamage * 0.5f, DamageType);
                }
            }
        }
        
        private void ApplyRicochet(Core.Enemy firstTarget, float baseDamage)
        {
            var nearbyEnemies = Core.EnemyTracker.Instance.GetEnemiesInRange(
                firstTarget.transform.position, currentRange * 0.5f);
            
            int ricochets = 0;
            float currentRicochetDamage = baseDamage * ricochetDamagePercent;
            
            foreach (var enemy in nearbyEnemies)
            {
                if (enemy != firstTarget && ricochets < ricochetTargets)
                {
                    enemy.TakeDamage(currentRicochetDamage, DamageType);
                    ricochets++;
                }
            }
        }
        
        protected override void ApplyUpgradeEffects(Core.UpgradePath path, int level)
        {
            var branch = GetUpgradeBranch(path);
            if (branch == null || level - 1 >= branch.levels.Length) return;
            
            var upgrade = branch.levels[level - 1];
            
            // Apply stat bonuses
            currentDamage += upgrade.damageBonus;
            currentAttackSpeed += upgrade.attackSpeedBonus;
            currentRange += upgrade.rangeBonus;
            
            // Update collider
            UpdateRangeCollider();
            
            // Apply special abilities based on path and level
            switch (path)
            {
                case Core.UpgradePath.BranchA: // Sniper
                    ApplySniperUpgrade(level);
                    break;
                    
                case Core.UpgradePath.BranchB: // Rapid Fire
                    ApplyRapidFireUpgrade(level);
                    break;
                    
                case Core.UpgradePath.BranchC: // Poisoner
                    ApplyPoisonerUpgrade(level);
                    break;
            }
        }
        
        private void ApplySniperUpgrade(int level)
        {
            switch (level)
            {
                case 2:
                    canTargetFlying = true;
                    break;
                case 3:
                    hasCrit = true;
                    critChance = 0.25f;
                    break;
                case 4:
                    armorPenetration = 0.5f;
                    break;
            }
        }
        
        private void ApplyRapidFireUpgrade(int level)
        {
            switch (level)
            {
                case 1:
                    hasSplashDamage = true;
                    splashRadius = 2f;
                    break;
                case 3:
                    multiTargetCount = 3;
                    break;
                case 4:
                    canRicochet = true;
                    ricochetTargets = 2;
                    break;
            }
        }
        
        private void ApplyPoisonerUpgrade(int level)
        {
            hasPoison = true;
            
            switch (level)
            {
                case 1:
                    poisonDamage = 10f;
                    poisonDuration = 3f;
                    poisonStacks = 3;
                    break;
                case 2:
                    poisonSlowPercent = 0.2f;
                    break;
                case 3:
                    armorReduction = 5f;
                    break;
                case 4:
                    poisonExplodes = true;
                    break;
            }
        }
    }
}