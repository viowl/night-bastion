using UnityEngine;
using System.Collections;

namespace TowerDefense.Enemies
{
    public class BossEnemy : Core.Enemy
    {
        [Header("Boss Abilities")]
        public float roarCooldown = 30f;
        public float shellDuration = 5f;
        public float summonCooldown = 15f;
        public int minionsPerSummon = 2;
        
        private float roarTimer = 0f;
        private float summonTimer = 0f;
        private float nextShellThreshold = 0.75f;
        private bool isShellActive = false;
        
        protected override void Update()
        {
            base.Update();
            
            if (isDead) return;
            
            // Handle ability cooldowns
            roarTimer -= Time.deltaTime;
            summonTimer -= Time.deltaTime;
            
            // Roar ability
            if (roarTimer <= 0)
            {
                Roar();
                roarTimer = roarCooldown;
            }
            
            // Summon ability
            if (summonTimer <= 0)
            {
                SummonMinions();
                summonTimer = summonCooldown;
            }
            
            // Shell ability at health thresholds
            float healthPercent = CurrentHealth / MaxHealth;
            if (!isShellActive && healthPercent <= nextShellThreshold)
            {
                StartCoroutine(ActivateShell());
                nextShellThreshold -= 0.25f;
            }
        }
        
        private void Roar()
        {
            // Speed up nearby enemies
            var nearbyEnemies = Core.EnemyTracker.Instance.GetEnemiesInRange(transform.position, 10f);
            foreach (var enemy in nearbyEnemies)
            {
                if (enemy != this && !enemy.IsDead)
                {
                    enemy.ApplyDebuff(Core.DebuffType.Slow, 5f, 1.5f); // Actually speeds up
                }
            }
            
            // Visual effect
            Debug.Log($"Boss roared! Speeding up nearby enemies.");
        }
        
        private void SummonMinions()
        {
            // Spawn grunts
            for (int i = 0; i < minionsPerSummon; i++)
            {
                var minion = Core.ObjectPool.Instance.GetEnemy(Core.EnemyType.Grunt);
                if (minion != null)
                {
                    Vector3 offset = Random.insideUnitCircle * 2f;
                    Vector3 spawnPos = transform.position + new Vector3(offset.x, offset.y, 0);
                    minion.transform.position = spawnPos;
                    
                    var path = Core.PathfindingManager.Instance.GetCurrentPath();
                    minion.Initialize(path, Core.WaveManager.Instance.CurrentWave);
                }
            }
            
            Debug.Log($"Boss summoned {minionsPerSummon} minions!");
        }
        
        private IEnumerator ActivateShell()
        {
            isShellActive = true;
            
            // Visual indicator
            if (spriteRenderer != null)
            {
                spriteRenderer.color = Color.blue;
            }
            
            yield return new WaitForSeconds(shellDuration);
            
            isShellActive = false;
            
            // Reset visual
            if (spriteRenderer != null && enemyData != null)
            {
                spriteRenderer.color = enemyData.color;
            }
        }
        
        public override void TakeDamage(float damage, Core.DamageType damageType)
        {
            if (isShellActive && damageType == Core.DamageType.Magic)
            {
                // Magic immune during shell
                return;
            }
            
            base.TakeDamage(damage, damageType);
        }
    }
}